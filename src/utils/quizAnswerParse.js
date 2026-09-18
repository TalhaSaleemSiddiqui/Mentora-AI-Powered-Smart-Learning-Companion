/**
 * Parse a child's free-text or spoken answer into a single integer for quiz checking.
 * Prefers digits; falls back to common English number words.
 */

const UNITS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];

const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

const WORD_TO_VALUE = (() => {
  const m = new Map();
  UNITS.forEach((w, i) => m.set(w, i));
  TENS.forEach((w, i) => {
    if (w) m.set(w, i * 10);
  });
  m.set('hundred', 100);
  return m;
})();

function tokenizeWords(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** English number word sequence → integer (works for quiz answers 0–999+). */
function parseEnglishInt(s) {
  const words = tokenizeWords(s);
  let g = 0;
  for (const w of words) {
    const x = WORD_TO_VALUE.get(w);
    if (x === undefined) continue;
    if (x < 100) {
      g += x;
    } else if (x === 100) {
      g *= 100;
    }
  }
  return g;
}

export function parseQuizAnswer(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  const numMatches = trimmed.match(/-?\d+/g);
  if (numMatches && numMatches.length) {
    const ints = numMatches.map((x) => parseInt(x, 10)).filter((n) => !Number.isNaN(n));
    if (ints.length) return Math.abs(ints[ints.length - 1]);
  }

  const lower = trimmed.toLowerCase();
  if (tokenizeWords(lower).some((t) => WORD_TO_VALUE.has(t.replace(/^-+|-+$/g, '')))) {
    const n = parseEnglishInt(lower);
    if (n >= 0 && trimmed.replace(/\s/g, '').length > 0) return n;
  }

  return null;
}

// ── Fraction support (Division L3 & L4) ────────────────────────────────────
// Maps spoken ordinal-style denominators to their numeric form.
const FRAC_WORDS = {
  half: 2, halves: 2,
  third: 3, thirds: 3,
  quarter: 4, quarters: 4, fourth: 4, fourths: 4,
  fifth: 5, fifths: 5,
  sixth: 6, sixths: 6,
  seventh: 7, sevenths: 7,
  eighth: 8, eighths: 8,
  ninth: 9, ninths: 9,
  tenth: 10, tenths: 10,
};

const tokenForNum = (w) => {
  if (w == null) return null;
  if (/^\d+$/.test(w)) return parseInt(w, 10);
  const v = WORD_TO_VALUE.get(w);
  return v === undefined ? null : v;
};

/** Parse free-text/spoken fraction into [num, den], or null. */
export function parseFractionAnswer(text) {
  if (!text || typeof text !== 'string') return null;
  const lower = text.toLowerCase().trim();
  if (!lower) return null;

  let m = lower.match(/(\d+)\s*\/\s*(\d+)/);
  if (m) return [parseInt(m[1], 10), parseInt(m[2], 10)];

  m = lower.match(/(\d+)\s*(?:over|out\s+of)\s*(\d+)/);
  if (m) return [parseInt(m[1], 10), parseInt(m[2], 10)];

  const words = lower.split(/[\s-]+/).filter(Boolean);

  if (words.length >= 2) {
    const numVal = tokenForNum(words[0]);
    const denVal = FRAC_WORDS[words[1]];
    if (numVal !== null && denVal) return [numVal, denVal];
  }

  for (let i = 0; i < words.length - 2; i++) {
    if (!/^(over|of)$/.test(words[i + 1])) continue;
    const a = tokenForNum(words[i]);
    const b = tokenForNum(words[i + 2]);
    if (a !== null && b !== null) return [a, b];
  }

  for (let i = 0; i < words.length - 3; i++) {
    if (words[i + 1] === 'out' && words[i + 2] === 'of') {
      const a = tokenForNum(words[i]);
      const b = tokenForNum(words[i + 3]);
      if (a !== null && b !== null) return [a, b];
    }
  }

  return null;
}

/** Two fractions are equal iff a*d === b*c (handles 1/4 === 2/8). */
export function fractionsEqual(a, b) {
  if (!a || !b) return false;
  if (a[1] === 0 || b[1] === 0) return false;
  return a[0] * b[1] === b[0] * a[1];
}

export function isQuizAnswerCorrect(userText, expected, options = {}) {
  if (typeof expected === 'string' && /^\d+\s*\/\s*\d+$/.test(expected)) {
    const [eN, eD] = expected.split('/').map((x) => parseInt(x.trim(), 10));
    const got = parseFractionAnswer(userText);
    if (!got) return false;
    if (options.exactFraction) {
      return got[0] === eN && got[1] === eD;
    }
    return fractionsEqual(got, [eN, eD]);
  }
  const parsed = parseQuizAnswer(userText);
  if (parsed === null) return false;
  return Number(parsed) === Number(expected);
}
