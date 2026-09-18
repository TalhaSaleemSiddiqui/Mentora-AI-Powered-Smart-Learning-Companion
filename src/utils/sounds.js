/**
 * Mentora Sound System
 * All sounds are synthesized via the Web Audio API — no files needed.
 * Tuned to be bright, cheerful, and child-friendly.
 */

let _ctx = null;

/** Get or create the shared AudioContext, resuming if suspended. */
function getCtx() {
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

/**
 * Play a single synthesized tone.
 * @param {AudioContext} c
 * @param {object} opts
 */
function tone(c, { freq, startAt = 0, dur = 0.25, type = 'sine', vol = 0.22, freqEnd = null }) {
  try {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);

    o.type = type;
    const start = c.currentTime + startAt;
    o.frequency.setValueAtTime(freq, start);
    if (freqEnd) {
      o.frequency.exponentialRampToValueAtTime(freqEnd, start + dur * 0.9);
    }
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);

    o.start(start);
    o.stop(start + dur + 0.05);
  } catch (e) { /* silently ignore audio errors */ }
}

// ─── SOUND LIBRARY ───────────────────────────────────────────────────────────

/**
 * Cheerful bubble pop — for button clicks and tile taps.
 */
export function playPop() {
  const c = getCtx(); if (!c) return;
  tone(c, { freq: 800, dur: 0.07, type: 'sine', vol: 0.2 });
  tone(c, { freq: 1300, startAt: 0.04, dur: 0.09, type: 'sine', vol: 0.13 });
}

/**
 * Happy ascending fanfare — for correct answers and achievements.
 */
export function playSuccess() {
  const c = getCtx(); if (!c) return;
  // C5 → E5 → G5 → C6 arpeggio
  [
    { freq: 523.25, startAt: 0.00, dur: 0.50, vol: 0.20 },
    { freq: 659.25, startAt: 0.10, dur: 0.45, vol: 0.20 },
    { freq: 783.99, startAt: 0.20, dur: 0.40, vol: 0.20 },
    { freq: 1046.5, startAt: 0.30, dur: 0.55, vol: 0.22 },
  ].forEach(opts => tone(c, opts));
}

/**
 * Magical sparkle twinkle — for level ups and star moments.
 */
export function playSparkle() {
  const c = getCtx(); if (!c) return;
  [1600, 2000, 2400, 2000, 2400, 2800].forEach((freq, i) => {
    tone(c, { freq, startAt: i * 0.055, dur: 0.13, type: 'triangle', vol: 0.10 });
  });
}

/**
 * Gentle "oops" sound — for wrong answers. Soft and encouraging, not harsh.
 */
export function playError() {
  const c = getCtx(); if (!c) return;
  tone(c, { freq: 350, dur: 0.18, vol: 0.18 });
  tone(c, { freq: 280, startAt: 0.14, dur: 0.22, vol: 0.15 });
}

/**
 * Airy upward whoosh — for page navigation and transitions.
 */
export function playWhoosh() {
  const c = getCtx(); if (!c) return;
  tone(c, { freq: 250, freqEnd: 700, dur: 0.22, vol: 0.13, type: 'sine' });
}

/**
 * Triumphant welcome jingle — played on successful login.
 */
export function playWelcome() {
  const c = getCtx(); if (!c) return;
  // G4 → A4 → B4 → D5 → G5 — happy ascending scale
  [
    { freq: 392.0, startAt: 0.00, dur: 0.22, vol: 0.18 },
    { freq: 440.0, startAt: 0.14, dur: 0.22, vol: 0.18 },
    { freq: 493.9, startAt: 0.28, dur: 0.22, vol: 0.18 },
    { freq: 587.3, startAt: 0.42, dur: 0.28, vol: 0.20 },
    { freq: 784.0, startAt: 0.58, dur: 0.55, vol: 0.22 },
  ].forEach(opts => tone(c, opts));
}

/**
 * Soft bubble pop — for sending a chat message.
 */
export function playBubble() {
  const c = getCtx(); if (!c) return;
  tone(c, { freq: 650, freqEnd: 950, dur: 0.12, vol: 0.15, type: 'sine' });
}

/**
 * Gentle bell chime — for receiving a chat response.
 */
export function playChime() {
  const c = getCtx(); if (!c) return;
  tone(c, { freq: 880,  dur: 0.45, vol: 0.15, type: 'sine' });
  tone(c, { freq: 1108, startAt: 0.07, dur: 0.38, vol: 0.10, type: 'sine' });
}

/**
 * Tiny soft tick — for very subtle hover feedback.
 */
export function playTick() {
  const c = getCtx(); if (!c) return;
  tone(c, { freq: 1400, dur: 0.035, vol: 0.055, type: 'sine' });
}

// ─── TEXT-TO-SPEECH (TTS) ────────────────────────────────────────────────────

let _voicesLoaded = false;
let _preferredVoice = null;

/**
 * Rank voices by quality and pick the best warm female English voice.
 * Preferred order (high → low):
 *   1. Google UK English Female
 *   2. Microsoft Zira / Aria / Jenny
 *   3. Samantha (macOS)
 *   4. Any female English voice
 *   5. Any English voice
 */
function pickVoice() {
  const voices = window.speechSynthesis?.getVoices() || [];
  if (voices.length === 0) return null;

  // Score each voice — higher is better
  const scored = voices
    .filter(v => /en[-_]/i.test(v.lang) || v.lang.startsWith('en'))
    .map(v => {
      let score = 0;
      const name = v.name.toLowerCase();

      // Prefer female-sounding names
      if (/female|zira|aria|jenny|samantha|hazel|fiona|karen|moira|tessa|susan|linda|kate/i.test(name)) score += 50;

      // Prefer Google & Microsoft high-quality voices
      if (/google.*female/i.test(name)) score += 30;
      if (/google uk english female/i.test(name)) score += 20;
      if (/microsoft.*(zira|aria|jenny)/i.test(name)) score += 25;
      if (/samantha/i.test(name)) score += 20;

      // Prefer non-compact, non-online voices
      if (v.localService) score += 5;

      // Slight preference for UK English (warm-sounding)
      if (/en[-_]gb/i.test(v.lang)) score += 8;

      return { voice: v, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.length > 0 ? scored[0].voice : voices.find(v => v.lang.startsWith('en')) || voices[0];
}

/** Preload voices — browser loads them async. */
function loadVoices() {
  if (_voicesLoaded) return;
  _voicesLoaded = true;
  _preferredVoice = pickVoice();

  // Chrome loads voices async, so listen for the event
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      _preferredVoice = pickVoice();
    };
  }
}

// Kick off voice loading immediately
if (typeof window !== 'undefined') {
  loadVoices();
}

/**
 * Strip emoji and special characters so the voice doesn't say "star emoji".
 */
function cleanTextForSpeech(text) {
  return text
    // Remove emojis (broad range)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{231A}-\u{23F3}✨⭐🌟✦★⚡💖📚🧠🚀📖🎉🤔✅❌➕➖✖️➗🍰]/gu, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Speak the given text aloud using a warm female voice.
 * Returns a Promise that resolves when speaking finishes.
 * @param {string} text - The text to speak
 * @param {object} [opts] - Optional overrides { pitch, rate, volume }
 */
export function speakText(text, opts = {}) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }

    // Stop any current speech first
    window.speechSynthesis.cancel();

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) { resolve(); return; }

    // Ensure voices are loaded
    if (!_preferredVoice) {
      _preferredVoice = pickVoice();
    }

    const utterance = new SpeechSynthesisUtterance(cleaned);

    // Set voice — warm, female
    if (_preferredVoice) {
      utterance.voice = _preferredVoice;
    }

    // Warm, fun, excited tone for children
    utterance.pitch  = opts.pitch  ?? 1.15;   // Slightly higher = warmer, friendlier
    utterance.rate   = opts.rate   ?? 1.05;   // Slightly upbeat = energetic
    utterance.volume = opts.volume ?? 0.95;   // Loud and clear

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    // Chrome has a bug where long utterances get cut off — workaround
    // by keeping the synth alive with a periodic resume
    let keepAlive = null;
    if (cleaned.length > 100) {
      keepAlive = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearInterval(keepAlive);
        }
      }, 10000);
    }

    utterance.onend = () => {
      if (keepAlive) clearInterval(keepAlive);
      resolve();
    };
    utterance.onerror = () => {
      if (keepAlive) clearInterval(keepAlive);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Immediately stop any ongoing speech.
 */
export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Call this on the first user interaction to unlock the AudioContext.
 * Browsers require a gesture before audio can play.
 */
export function unlock() {
  getCtx();
}

// Auto-unlock on any user interaction (once)
let unlocked = false;
function autoUnlock() {
  if (unlocked) return;
  unlocked = true;
  getCtx();
  loadVoices(); // Also preload TTS voices on first interaction
  document.removeEventListener('click', autoUnlock);
  document.removeEventListener('keydown', autoUnlock);
  document.removeEventListener('touchstart', autoUnlock);
}
document.addEventListener('click', autoUnlock, { passive: true });
document.addEventListener('keydown', autoUnlock, { passive: true });
document.addEventListener('touchstart', autoUnlock, { passive: true });

