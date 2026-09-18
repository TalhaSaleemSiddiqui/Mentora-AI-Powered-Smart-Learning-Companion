import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import MentoraMascot from '../components/MentoraMascot';
import MathVisual1 from '../MathVisual1';
import { useApp } from '../context/AppContext';
import {
  LEVEL_PLAN,
  getLevelConfig,
  welcomeMessage,
  completionMessage,
} from '../data/levelPlanContent';
import { isQuizAnswerCorrect } from '../utils/quizAnswerParse';
import { playWhoosh } from '../utils/sounds';

// ── constants ─────────────────────────────────────────────────────────────────
const VALID_SLUGS = ['addition', 'subtraction', 'multiplication', 'division'];
const SUBTRACTION_POINTS_KEY = 'mentora_subtraction_module_points';

const readSubtractionModulePoints = () => {
  try {
    const n = parseInt(sessionStorage.getItem(SUBTRACTION_POINTS_KEY) || '0', 10);
    return Number.isNaN(n) ? 0 : Math.max(0, n);
  } catch {
    return 0;
  }
};

const writeSubtractionModulePoints = (value) => {
  try {
    sessionStorage.setItem(SUBTRACTION_POINTS_KEY, String(Math.max(0, value)));
  } catch { /* ignore */ }
};

const clearSubtractionModulePoints = () => {
  try {
    sessionStorage.removeItem(SUBTRACTION_POINTS_KEY);
  } catch { /* ignore */ }
};

// Extra example prompts – one per topic/level, distinct from the teaching examples
const EXTRA_EXAMPLE_PROMPTS = {
  addition:       { 1: 'What is 4 + 3?',       2: 'What is 17 + 8?',      3: 'What is 46 + 27?' },
  subtraction:    { 1: 'What is 9 minus 4?',   2: 'What is 32 minus 14?', 3: 'What is 78 minus 39?' },
  multiplication: { 1: 'What is 5 times 3?',   2: 'What is 7 times 4?',   3: 'What is 9 times 8?' },
  division:       { 1: 'Divide 12 by 3',        2: 'Divide 45 by 5',       3: 'Explain fraction 1/4 using a pizza story',        4: 'Simplify fraction 2/4' },
};

// ── audio helpers (module-level, no state dependency) ────────────────────────
const globalAudio = new Audio();
const silentAudioBase64 =
  'data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzb21tcDQyAFRTU0UAAAAPAAADTGF2ZjU3LjU2LjEwMAAAAAAAAAAAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWgAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

const unlockAudioContext = () => {
  if (globalAudio.src !== silentAudioBase64) globalAudio.src = silentAudioBase64;
  globalAudio.play().catch(() => {});
};

const speak = (audioBase64) =>
  new Promise((resolve) => {
    if (!audioBase64) { resolve(); return; }
    globalAudio.pause();
    globalAudio.currentTime = 0;
    globalAudio.src = audioBase64;
    globalAudio.onended = () => resolve();
    globalAudio.onerror = () => resolve();
    globalAudio.play().catch(() => resolve());
  });

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Rotating praise lines — a different one each correct answer (avoids immediate repeat)
const CORRECT_APPRECIATIONS = [
  "Amazing! That's correct!",
  "You got that right!",
  "Wow, you got it!",
  "Brilliant work!",
  "Fantastic! That's the one!",
];
let lastAppreciationIdx = -1;
const pickAppreciation = () => {
  let idx;
  do {
    idx = Math.floor(Math.random() * CORRECT_APPRECIATIONS.length);
  } while (idx === lastAppreciationIdx && CORRECT_APPRECIATIONS.length > 1);
  lastAppreciationIdx = idx;
  return CORRECT_APPRECIATIONS[idx];
};

const fetchTtsAudio = async (text) => {
  try {
    const ttsRes = await fetch('http://localhost:8000/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (ttsRes.ok) {
      const j = await ttsRes.json();
      return j?.audio ?? null;
    }
  } catch { /* silent text fallback */ }
  return null;
};


const CONFETTI_COLORS = [
  '#f3fb00ff', 
  '#ff20d2ff', 
  '#51ff41ff', 
  'rgba(255, 44, 44, 1)', 
  '#30ffeaff', 
  '#ff7d32ff'  
];

const buildCelebrationPieces = (count = 150) =>
  Array.from({ length: count }, (_, i) => {
    const burst = i < count * 0.65;
    const angle = (Math.PI * 2 * i) / (count * 0.65);
    
    
    const dist = 200 + Math.random() * 800; 

    return {
      id: `${Date.now()}-${i}`,
      left: burst ? '50%' : `${Math.random() * 100}%`,
      top: burst ? '50%' : `${-10 + Math.random() * 10}%`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      w: 6 + Math.random() * 10,
      h: 4 + Math.random() * 8,
      delay: Math.random() * 0.4,
      burst,
      tx: burst ? `${Math.cos(angle) * dist}px` : `${(Math.random() - 0.5) * 100}px`,
      ty: burst ? `${Math.sin(angle) * dist}px` : `${400 + Math.random() * 600}px`,
    };
  });

// Fetch from /tutor and return the steps array, or throw on failure
const callTutorAPI = async (message, topic, userId) => {
  const res = await fetch('http://localhost:8000/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, topic, user_id: userId }),
  });
  if (!res.ok) throw new Error('tutor fail');
  const data = await res.json();
  console.log('tutor raw response:', data);
  if (Array.isArray(data)) {
    if (data.length === 0) throw new Error('empty array');
    return data;
  }
  if (data && Array.isArray(data.content)) return data.content;
  if (data != null) return [data];
  throw new Error('null response');
};


const enforceTextRender = (visualString) => {
  if (!visualString || typeof visualString !== 'string') return visualString;
  const parts = visualString.split(' ');
  if (parts.length < 4) return visualString;
  const countA = parseInt(parts[1], 10) || 0;
  const countB = parseInt(parts[2], 10) || 0;
  if (countA >= 31 || countB >= 31) {
    parts[3] = 'number';
    return parts.join(' ');
  }
  return visualString;
};

const QUIZ_ASK_LINE = 'What is the answer?';
const QUIZ_MODE_SUFFIX = '. QUIZ MODE: Use at least 3 step-by-step JSON steps (setup, action, build the scene). Do NOT say the final numeric answer. The LAST step speech MUST be a natural, child-friendly question tied to this specific word problem — vary the wording (e.g. "so what do you think the answer will be?" or "how many will be the total?").';

// Uniform lesson flow: teaching example (full answer) → quiz (setup visuals + ask line only).
const runSlideshow = async (steps, {
  mountedRef,
  setCurrentSlide,
  setEmotion,
  lastStepPauseMs = 0,
  stepDelayMs = 800,
}) => {
  if (!Array.isArray(steps) || steps.length === 0) return false;
  for (let s = 0; s < steps.length; s++) {
    if (!mountedRef?.current) return false;
    const step = steps[s];
    const isLast = s === steps.length - 1;
    setCurrentSlide({ text: step.speech, visual: enforceTextRender(step.visual) });
    setEmotion('excited');
    await speak(step.audio);
    if (isLast && lastStepPauseMs > 0) await delay(lastStepPauseMs);
    else await delay(stepDelayMs);
  }
  if (mountedRef?.current) setCurrentSlide(null);
  return true;
};

const parseFractionAnswer = (answer) => {
  if (typeof answer !== 'string' || !answer.includes('/')) return null;
  const [rawN, rawD] = answer.split('/');
  const n = parseInt(rawN?.trim(), 10);
  const d = parseInt(rawD?.trim(), 10);
  if (Number.isNaN(n) || Number.isNaN(d) || d <= 0 || n < 0) return null;
  return { n, d, text: `${n}/${d}` };
};

const isFractionDivisionLevel = (topicSlug, levelNum) =>
  topicSlug === 'division' && (levelNum === 3 || levelNum === 4);

const isDivisionFractionDynamic = (topicSlug, levelNum, config) => !!config?.dynamicQuizzes;

const fractionVisual = (numerator, denominator) =>
  `fraction ${numerator} ${denominator} fraction_circle`;

const enrichStepsWithTts = async (steps) => {
  if (!Array.isArray(steps) || steps.length === 0) return [];
  return Promise.all(steps.map(async (step) => {
    try {
      const ttsRes = await fetch('http://localhost:8000/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: step.speech }),
      });
      if (ttsRes.ok) {
        const j = await ttsRes.json();
        return { ...step, audio: j?.audio ?? null };
      }
    } catch { /* silent fallback */ }
    return { ...step, audio: null };
  }));
};

const fractionGcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) { [x, y] = [y, x % y]; }
  return x || 1;
};

const simplifyFractionParts = (num, denom) => {
  const g = fractionGcd(num, denom);
  return [num / g, denom / g];
};

const FRACTION_TEACHING_POOLS = {
  3: [
    [1, 4], [1, 5], [1, 3], [2, 3], [2, 5], [1, 8], [2, 8], [3, 8], [4, 8], [6, 8], [3, 5],
  ],
  4: [
    [4, 8], [2, 4], [2, 8], [3, 6], [6, 8], [4, 6], [2, 6], [3, 9],
    [4, 10], [6, 9], [5, 10], [6, 10], [4, 12], [9, 12],
  ],
};

const FRACTION_FOOD_THEMES = ['pizza', 'birthday cake'];

const pickRandomFractionTeachingPrompt = (levelNum, excludePrompt = null) => {
  const pool = FRACTION_TEACHING_POOLS[levelNum] || FRACTION_TEACHING_POOLS[3];
  const verb = levelNum === 4 ? 'Simplify' : 'Explain';

  for (let attempt = 0; attempt < 24; attempt++) {
    const pair = pool[Math.floor(Math.random() * pool.length)];
    const food = FRACTION_FOOD_THEMES[Math.floor(Math.random() * FRACTION_FOOD_THEMES.length)];
    const prompt = `${verb} fraction ${pair[0]}/${pair[1]} using a ${food} story`;
    if (prompt !== excludePrompt) return prompt;
  }

  const [num, denom] = pool[0];
  return `${verb} fraction ${num}/${denom} using a pizza story`;
};

const GENERATE_L3_QUIZZES_MSG = 'GENERATE DIVISION LEVEL 3 FRACTION QUIZZES';
const GENERATE_L4_QUIZZES_MSG = 'GENERATE DIVISION LEVEL 4 FRACTION QUIZZES';
const ADDITION_GENERATE_MSG = {
  1: 'GENERATE ADDITION LEVEL 1 QUIZZES',
  2: 'GENERATE ADDITION LEVEL 2 QUIZZES',
  3: 'GENERATE ADDITION LEVEL 3 QUIZZES',
};
const ADDITION_FALLBACK_QUIZZES = {
  1: [
    { text: 'We have 2 apples and we get 1 more apple. How many apples do we have?', answer: 3 },
    { text: 'There are 3 cats sitting. 2 more cats come. How many cats are there now?', answer: 5 },
    { text: 'You have 4 candies and your friend gives you 2 more. How many do you have?', answer: 6 },
    { text: 'There are 1 ball and 6 more balls roll in. How many balls are there?', answer: 7 },
    { text: 'You see 3 birds and then 4 more fly in. How many birds are there?', answer: 7 },
  ],
  2: [
    { text: 'There are 10 oranges in a basket and 5 more are added. How many are there?', answer: 15 },
    { text: 'A shop has 14 apples and gets 6 more. How many apples now?', answer: 20 },
    { text: 'You walk 11 steps then 9 more. How many steps did you walk?', answer: 20 },
    { text: 'There are 18 fish in a pond and 12 more jump in. How many fish?', answer: 30 },
    { text: 'A jar has 25 candies and 15 more are added. How many candies?', answer: 40 },
  ],
  3: [
    { text: 'A school has 45 boys and 38 girls. How many children total?', answer: 83 },
    { text: 'You read 52 pages then 29 more. How many pages did you read?', answer: 81 },
    { text: 'A farm has 56 chickens and 38 more arrive. How many chickens?', answer: 94 },
    { text: 'A store sold 47 toys and then 39 more. How many toys sold?', answer: 86 },
    { text: 'There are 64 stars and 28 more appear. How many stars?', answer: 92 },
  ],
};
const fetchAdditionQuizzesFromAPI = async (levelNum, userId) => {
  const message = ADDITION_GENERATE_MSG[levelNum];
  if (!message) throw new Error('no marker');
  const res = await fetch('http://localhost:8000/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, topic: 'addition', user_id: userId }),
  });
  if (!res.ok) throw new Error('quiz generate fail');
  const data = await res.json();
  if (Array.isArray(data?.quizzes) && data.quizzes.length >= 5) {
    return data.quizzes.slice(0, 5).map((q) => ({
      text: q.text,
      answer: typeof q.answer === 'number' ? q.answer : parseInt(q.answer, 10),
    }));
  }
  throw new Error('insufficient quizzes');
};
const ensureAdditionQuizzes = async (levelNum, userId, quizCount = 5) => {
  try {
    return await fetchAdditionQuizzesFromAPI(levelNum, userId);
  } catch {
    return (ADDITION_FALLBACK_QUIZZES[levelNum] || []).slice(0, quizCount);
  }
};
const SUBTRACTION_GENERATE_MSG = {
  1: 'GENERATE SUBTRACTION LEVEL 1 QUIZZES',
  2: 'GENERATE SUBTRACTION LEVEL 2 QUIZZES',
  3: 'GENERATE SUBTRACTION LEVEL 3 QUIZZES',
};
const SUBTRACTION_FALLBACK_QUIZZES = {
  1: [
    { text: 'You have 5 apples and eat 2. How many are left?', answer: 3 },
    { text: 'There are 6 cats and 3 walk away. How many cats remain?', answer: 3 },
    { text: 'You have 8 candies and give away 5. How many do you have?', answer: 3 },
    { text: 'There are 9 birds and 4 fly away. How many birds are left?', answer: 5 },
    { text: 'You have 7 balls and lose 3. How many balls remain?', answer: 4 },
  ],
  2: [
    { text: 'A basket had 18 oranges and 6 were eaten. How many are left?', answer: 12 },
    { text: 'There were 25 fish and 10 swam away. How many remain?', answer: 15 },
    { text: 'A shop had 30 toys and sold 12. How many are left?', answer: 18 },
    { text: 'You had 36 stickers and gave away 16. How many do you have?', answer: 20 },
    { text: 'There were 40 birds and 25 flew away. How many birds are left?', answer: 15 },
  ],
  3: [
    { text: 'A library had 95 books and 42 were borrowed. How many remain?', answer: 53 },
    { text: 'There were 84 apples and 21 were sold. How many are left?', answer: 63 },
    { text: 'A school had 92 chairs and 38 were moved. How many remain?', answer: 54 },
    { text: 'You had 75 coins and spent 24. How many do you have left?', answer: 51 },
    { text: 'A farm had 88 chickens and 19 were sold. How many remain?', answer: 69 },
  ],
};
const fetchSubtractionQuizzesFromAPI = async (levelNum, userId) => {
  const message = SUBTRACTION_GENERATE_MSG[levelNum];
  if (!message) throw new Error('no marker');
  const res = await fetch('http://localhost:8000/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, topic: 'subtraction', user_id: userId }),
  });
  if (!res.ok) throw new Error('quiz generate fail');
  const data = await res.json();
  if (Array.isArray(data?.quizzes) && data.quizzes.length >= 5) {
    return data.quizzes.slice(0, 5).map((q) => ({
      text: q.text,
      answer: typeof q.answer === 'number' ? q.answer : parseInt(q.answer, 10),
    }));
  }
  throw new Error('insufficient quizzes');
};
const ensureSubtractionQuizzes = async (levelNum, userId, quizCount = 5) => {
  try {
    return await fetchSubtractionQuizzesFromAPI(levelNum, userId);
  } catch {
    return (SUBTRACTION_FALLBACK_QUIZZES[levelNum] || []).slice(0, quizCount);
  }
};
const usesDynamicTeaching = (topicSlug, config) =>
  !!config?.dynamicQuizzes && (topicSlug === 'addition' || topicSlug === 'subtraction');
const fetchDynamicTeachingPromptFromAPI = async (topicSlug, levelNum, userId, excludePrompt = null) => {
  const op = topicSlug === 'addition' ? 'ADDITION' : 'SUBTRACTION';
  let message = `GENERATE ${op} LEVEL ${levelNum} TEACHING EXAMPLE`;
  if (excludePrompt) message += ` EXCLUDE: ${excludePrompt}`;
  const res = await fetch('http://localhost:8000/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, topic: topicSlug, user_id: userId }),
  });
  if (!res.ok) throw new Error('teaching example fail');
  const data = await res.json();
  if (typeof data?.prompt === 'string' && data.prompt.trim()) return data.prompt.trim();
  throw new Error('no prompt');
};
const ensureDynamicTeachingPrompt = async (topicSlug, levelNum, userId, fallbackExamples, excludePrompt = null) => {
  try {
    return await fetchDynamicTeachingPromptFromAPI(topicSlug, levelNum, userId, excludePrompt);
  } catch {
    const pool = Array.isArray(fallbackExamples) ? fallbackExamples : [];
    const filtered = excludePrompt ? pool.filter((p) => p !== excludePrompt) : pool;
    const pickFrom = filtered.length ? filtered : pool;
    return pickFrom[Math.floor(Math.random() * pickFrom.length)] || pickFrom[0] || '';
  }
};
const FRACTION_QUIZ_THEMES = ['pizza', 'cake', 'circle'];
const FRACTION_THEME_EMOJI = { pizza: '🍕', cake: '🎂', circle: '🔵' };

const buildProceduralL3QuizText = (theme, num, denom) => {
  const emoji = FRACTION_THEME_EMOJI[theme];
  if (theme === 'pizza') {
    return `Here is a pizza cut into ${denom} equal slices ${emoji}. ${num} ${num === 1 ? 'slice is' : 'slices are'} colored. What fraction is colored?`;
  }
  if (theme === 'cake') {
    return `Here is a cake cut into ${denom} equal slices ${emoji}. ${num} ${num === 1 ? 'slice is' : 'slices are'} colored. What fraction is colored?`;
  }
  return `Look at this circle cut into ${denom} equal slices ${emoji}. ${num} ${num === 1 ? 'slice is' : 'slices are'} colored. What fraction is colored?`;
};

const buildProceduralL3Quizzes = (count = 5) => {
  const pool = [...(FRACTION_TEACHING_POOLS[3] || [])];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const quizzes = [];
  const used = new Set();
  let poolIdx = 0;
  while (quizzes.length < count && poolIdx < pool.length) {
    const [num, denom] = pool[poolIdx++];
    const key = `${num}/${denom}`;
    if (used.has(key)) continue;
    used.add(key);
    const theme = FRACTION_QUIZ_THEMES[quizzes.length % FRACTION_QUIZ_THEMES.length];
    quizzes.push({
      text: buildProceduralL3QuizText(theme, num, denom),
      answer: `${num}/${denom}`,
      answerType: 'fraction',
      exactFraction: true,
      fractionSpec: { type: 'identify', num, denom },
    });
  }
  return quizzes;
};

const fetchDivisionL3QuizzesFromAPI = async (userId) => {
  const res = await fetch('http://localhost:8000/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: GENERATE_L3_QUIZZES_MSG, topic: 'division', user_id: userId }),
  });
  if (!res.ok) throw new Error('quiz generate fail');
  const data = await res.json();
  if (Array.isArray(data?.quizzes) && data.quizzes.length >= 5) {
    return data.quizzes.slice(0, 5).map((q) => ({
      text: q.text,
      answer: q.answer,
      answerType: 'fraction',
      exactFraction: true,
      fractionSpec: q.fractionSpec || {
        type: 'identify',
        num: q.numerator ?? parseFractionAnswer(q.answer)?.n,
        denom: q.denominator ?? parseFractionAnswer(q.answer)?.d,
      },
    }));
  }
  throw new Error('insufficient quizzes');
};

const ensureDivisionL3Quizzes = async (userId, quizCount = 5) => {
  try {
    return await fetchDivisionL3QuizzesFromAPI(userId);
  } catch {
    return buildProceduralL3Quizzes(quizCount);
  }
};

const buildProceduralL4QuizText = (theme, num, denom) => {
  const emoji = FRACTION_THEME_EMOJI[theme];
  if (theme === 'pizza') {
    return `This pizza is cut into ${denom} equal slices ${emoji} and ${num} are colored. Can you write the same amount as a simpler fraction?`;
  }
  if (theme === 'cake') {
    return `This cake is cut into ${denom} equal slices ${emoji} and ${num} are colored. Can you write the same amount as a simpler fraction?`;
  }
  return `Look at this circle cut into ${denom} equal slices ${emoji} — ${num} are colored. Can you write the same amount as a simpler fraction?`;
};

const buildProceduralL4Quizzes = (count = 5) => {
  const pool = [...(FRACTION_TEACHING_POOLS[4] || [])];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const quizzes = [];
  const used = new Set();
  let poolIdx = 0;
  while (quizzes.length < count && poolIdx < pool.length) {
    const [num, denom] = pool[poolIdx++];
    const [sn, sd] = simplifyFractionParts(num, denom);
    if (sn === num && sd === denom) continue;
    const key = `${num}/${denom}`;
    if (used.has(key)) continue;
    used.add(key);
    const theme = FRACTION_QUIZ_THEMES[quizzes.length % FRACTION_QUIZ_THEMES.length];
    quizzes.push({
      text: buildProceduralL4QuizText(theme, num, denom),
      answer: `${sn}/${sd}`,
      answerType: 'fraction',
      fractionSpec: { type: 'simplify', num, denom },
    });
  }
  return quizzes;
};

const fetchDivisionL4QuizzesFromAPI = async (userId) => {
  const res = await fetch('http://localhost:8000/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: GENERATE_L4_QUIZZES_MSG, topic: 'division', user_id: userId }),
  });
  if (!res.ok) throw new Error('quiz generate fail');
  const data = await res.json();
  if (Array.isArray(data?.quizzes) && data.quizzes.length >= 5) {
    return data.quizzes.slice(0, 5).map((q) => ({
      text: q.text,
      answer: q.answer,
      answerType: 'fraction',
      fractionSpec: q.fractionSpec || {
        type: 'simplify',
        num: q.original_numerator ?? q.numerator ?? parseFractionAnswer(q.answer)?.n,
        denom: q.original_denominator ?? q.denominator ?? parseFractionAnswer(q.answer)?.d,
      },
    }));
  }
  throw new Error('insufficient quizzes');
};

const ensureDivisionL4Quizzes = async (userId, quizCount = 5) => {
  try {
    return await fetchDivisionL4QuizzesFromAPI(userId);
  } catch {
    return buildProceduralL4Quizzes(quizCount);
  }
};

const ensureDynamicDivisionQuizzes = async (topicSlug, levelNum, userId, quizCount = 5) => {
  if (topicSlug === 'addition' && levelNum >= 1 && levelNum <= 3) {
    return ensureAdditionQuizzes(levelNum, userId, quizCount);
  }
  if (topicSlug === 'subtraction' && levelNum >= 1 && levelNum <= 3) {
    return ensureSubtractionQuizzes(levelNum, userId, quizCount);
  }
  if (levelNum === 3) return ensureDivisionL3Quizzes(userId, quizCount);
  if (levelNum === 4) return ensureDivisionL4Quizzes(userId, quizCount);
  return [];
};

const parseTeachingFractionPrompt = (prompt) => {
  const text = String(prompt || '');
  const simplifyMatch = text.match(/simplif[\s\S]*?(\d+)\s*\/\s*(\d+)/i);
  if (simplifyMatch) {
    return {
      mode: 'simplify',
      num: parseInt(simplifyMatch[1], 10),
      denom: parseInt(simplifyMatch[2], 10),
    };
  }
  const explainMatch = text.match(/(?:explain|what is)[\s\S]*?(\d+)\s*\/\s*(\d+)/i);
  if (explainMatch) {
    return {
      mode: 'identify',
      num: parseInt(explainMatch[1], 10),
      denom: parseInt(explainMatch[2], 10),
    };
  }
  return null;
};

const detectFractionFoodTheme = (...sources) => {
  for (const source of sources) {
    const text = String(source || '').toLowerCase();
    if (/cake|birthday|🎂/.test(text)) return 'cake';
    if (/pizza|🍕/.test(text)) return 'pizza';
  }
  return 'pizza';
};

const detectFractionQuizTheme = (text) => {
  const t = String(text || '').toLowerCase();
  if (/circle|🔵/.test(t)) return 'circle';
  return detectFractionFoodTheme(text);
};

const foodFractionVisual = (theme, num, denom) => `${theme} ${num} ${denom} fraction_circle`;

const parseVisualFractionParts = (visual) => {
  if (!visual || typeof visual !== 'string') return null;
  const parts = visual.trim().split(/\s+/);
  if (parts.length < 3) return null;
  const denom = parseInt(parts[2], 10);
  if (Number.isNaN(denom) || denom <= 0) return null;
  const num = parseInt(parts[1], 10);
  return { num: Number.isNaN(num) ? 0 : num, denom };
};

const inferFractionVisualFromSpeech = (speech, spec) => {
  if (!speech) return null;
  const s = String(speech).toLowerCase();

  const coloredOutOf = s.match(/(\d+)\s+colored\s+out\s+of\s+(\d+)/);
  if (coloredOutOf) {
    return { num: parseInt(coloredOutOf[1], 10), denom: parseInt(coloredOutOf[2], 10) };
  }

  const fracMatch = s.match(/(\d+)\s*\/\s*(\d+)/);
  if (fracMatch && /same as|simpler|simplified|fraction is|we say|write|equals|equal to/.test(s)) {
    return { num: parseInt(fracMatch[1], 10), denom: parseInt(fracMatch[2], 10) };
  }

  const cutMatch = s.match(/(?:cut|split)(?:\s+it)?\s+into\s+(\d+)\s+equal/);
  if (cutMatch && !/colored|coloring|shade|shaded|count.*colored|are colored|we colored/.test(s)) {
    return { num: 0, denom: parseInt(cutMatch[1], 10) };
  }

  if (/colored|coloring|shade|shaded|pepperoni|topping|sprinkle|we colored|are colored/.test(s) && spec) {
    const coloredCount = s.match(/colored\s+(\d+)/)
      || s.match(/we colored\s+(\d+)/)
      || s.match(/(\d+)\s+(?:slice|slices|piece|pieces)\s+(?:is|are)\s+colored/)
      || s.match(/(\d+)\s+(?:slice|slices|piece|pieces)/)
      || s.match(/(\d+)\s+of them/);
    return {
      num: coloredCount ? parseInt(coloredCount[1], 10) : spec.num,
      denom: cutMatch ? parseInt(cutMatch[1], 10) : spec.denom,
    };
  }

  if (/oooh|look|here is|here's|we have|imagine|delicious|yummy|birthday/.test(s) && spec) {
    return { num: 0, denom: spec.denom };
  }

  return null;
};

const syncFractionTeachingVisuals = (steps, teachingPrompt) => {
  if (!Array.isArray(steps) || steps.length === 0) return steps;
  const spec = parseTeachingFractionPrompt(teachingPrompt);

  let carried = spec ? { num: 0, denom: spec.denom } : { num: 0, denom: 1 };

  return steps.map((step, index) => {
    const fromSpeech = inferFractionVisualFromSpeech(step.speech, spec);
    const fromVisual = parseVisualFractionParts(step.visual);
    const s = String(step.speech || '').toLowerCase();
    const theme = detectFractionFoodTheme(step.speech, teachingPrompt);

    let num = fromSpeech?.num ?? fromVisual?.num ?? carried.num;
    let denom = fromSpeech?.denom ?? fromVisual?.denom ?? carried.denom;

    const preColor = /(?:cut|split)(?:\s+it)?\s+into|watch carefully|ready\?|going to cut/.test(s)
      && !/colored|coloring|shade|shaded|we colored|are colored|\d+\s*\/\s*\d+|write|fraction is|same as|simpler/.test(s);
    if (preColor && spec) {
      num = 0;
      denom = spec.denom;
    }

    if (/colored|we colored|are colored|shade|shaded|pepperoni|topping|sprinkle/.test(s)) {
      if (fromSpeech?.num != null) {
        num = fromSpeech.num;
        denom = fromSpeech.denom ?? denom;
      } else if (fromVisual?.num > 0) {
        num = fromVisual.num;
        denom = fromVisual.denom ?? denom;
      } else if (spec) {
        num = spec.num;
        denom = spec.denom;
      }
    }

    if (spec?.mode === 'simplify' && index === steps.length - 1) {
      const [sn, sd] = simplifyFractionParts(spec.num, spec.denom);
      if (/same as|simpler|smaller|exactly/.test(s)) {
        num = sn;
        denom = sd;
      }
    }

    if (spec?.mode === 'identify' && /write|fraction is|on top|bottom|numerator|denominator/.test(s)) {
      num = spec.num;
      denom = spec.denom;
    }

    if (denom > 0) carried = { num, denom };

    return {
      ...step,
      visual: foodFractionVisual(theme, num, denom),
    };
  });
};

const buildLocalFractionTeachingSteps = (prompt, levelNum = 3) => {
  const spec = parseTeachingFractionPrompt(prompt);
  if (!spec) return null;
  const theme = detectFractionFoodTheme(prompt);
  const foodVisual = (num, denom) => foodFractionVisual(theme, num, denom);
  const foodEmoji = theme === 'cake' ? '🎂' : '🍕';
  const foodLabel = theme === 'cake' ? 'birthday cake' : 'delicious pizza';
  const foodShort = theme === 'cake' ? 'cake' : 'pizza';

  if (spec.mode === 'identify') {
    const { num, denom } = spec;
    return [
      { speech: `Ooooh look! ${foodEmoji} We have a ${foodLabel}!`, visual: foodVisual(0, denom) },
      { speech: `We are going to cut it into ${denom} equal slices. Watch carefully! ✂️`, visual: foodVisual(0, denom) },
      { speech: `Now let's color some slices to show our fraction! Ready? Count with me! 🎨`, visual: foodVisual(0, denom) },
      { speech: `${Array.from({ length: num }, (_, i) => i + 1).join('... ')}! We colored ${num} ${num === 1 ? 'slice' : 'slices'}! 🌟`, visual: foodVisual(num, denom) },
      { speech: `Now let's count ALL the slices! ${Array.from({ length: denom }, (_, i) => i + 1).join('... ')}! There are ${denom} total slices!`, visual: foodVisual(num, denom) },
      { speech: `So we write ${num} on top and ${denom} on the bottom — the fraction is ${num}/${denom}! You are amazing! ⭐`, visual: foodVisual(num, denom) },
    ];
  }

  if (spec.mode === 'simplify') {
    const { num, denom } = spec;
    const [sn, sd] = simplifyFractionParts(num, denom);
    return [
      { speech: `Ooooh look! ${foodEmoji} Here is our ${foodLabel}!`, visual: foodVisual(0, denom) },
      { speech: `We cut it into ${denom} slices and colored ${num} of them! Count with me — ${Array.from({ length: num }, (_, i) => i + 1).join('... ')}! 🌟`, visual: foodVisual(num, denom) },
      { speech: `So right now we say ${num}/${denom}. But wait — can we say the SAME thing with smaller numbers? 🤔`, visual: foodVisual(num, denom) },
      { speech: `Yes! ${num}/${denom} is exactly the same as ${sn}/${sd}! Same ${foodShort}, simpler fraction! 🎉`, visual: foodVisual(sn, sd) },
    ];
  }

  return null;
};

const prepareFractionTeachingExample = async (teachingPrompt, topicApi, userId) => {
  let steps = null;
  try {
    steps = await callTutorAPI(teachingPrompt, topicApi, userId);
  } catch {
    steps = null;
  }
  if (!Array.isArray(steps) || steps.length === 0) {
    steps = buildLocalFractionTeachingSteps(teachingPrompt);
  }
  if (!steps) return null;
  steps = syncFractionTeachingVisuals(steps, teachingPrompt);
  if (steps.some((st) => !st.audio)) {
    steps = await enrichStepsWithTts(steps);
  }
  return steps;
};

const parseFractionPiecesFromText = (text) => {
  const t = String(text || '').toLowerCase();
  const intoMatch = t.match(/into (\d+) equal/);
  const coloredMatch = t.match(/(\d+)\s*(?:piece|pieces)\s*(?:is|are)\s*colored/);
  if (intoMatch && coloredMatch) {
    return { denom: parseInt(intoMatch[1], 10), num: parseInt(coloredMatch[1], 10) };
  }
  const nums = (text.match(/\d+/g) || []).map(Number);
  if (nums.length >= 2) return { denom: nums[0], num: nums[1] };
  return null;
};

const getFractionSpec = (q) => {
  if (q.fractionSpec) return q.fractionSpec;
  const t = (q.text || '').toLowerCase();
  const pieces = parseFractionPiecesFromText(q.text);
  if (/simplest|simplif|smaller number|smaller numbers|smaller fraction/.test(t) && pieces) {
    return { type: 'simplify', num: pieces.num, denom: pieces.denom };
  }
  if (pieces) {
    return { type: 'identify', num: pieces.num, denom: pieces.denom };
  }
  const ans = parseFractionAnswer(q.answer);
  if (ans) {
    return { type: 'identify', num: ans.n, denom: ans.d };
  }
  return null;
};

const filterFractionQuizSteps = (steps, expectedAnswer) => {
  if (!Array.isArray(steps) || steps.length === 0) return [];
  const filtered = steps.filter((step) => !speechRevealsAnswer(step?.speech, expectedAnswer));
  return filtered.length > 0 ? filtered : steps.slice(0, 1);
};

const buildLocalFractionQuizSteps = (q, levelNum = 4) => {
  const circleVisual = (num, denom) => `fraction ${num} ${denom} fraction_circle`;
  const spec = getFractionSpec(q);
  if (!spec) return { steps: [], setupVisual: null };

  if (spec.type === 'identify') {
    const quizTheme = levelNum === 3 ? detectFractionQuizTheme(q.text) : 'circle';
    const visual = quizTheme === 'circle'
      ? circleVisual
      : (num, denom) => foodFractionVisual(quizTheme, num, denom);
    const introSpeech = quizTheme === 'circle'
      ? `Look at this! 🔵 Here is a circle cut into ${spec.denom} equal slices!`
      : quizTheme === 'cake'
        ? `Look! 🎂 Here is a cake cut into ${spec.denom} equal slices!`
        : `Look! 🍕 Here is a pizza cut into ${spec.denom} equal slices!`;
    const steps = levelNum === 3
      ? [
          { speech: introSpeech, visual: visual(0, spec.denom) },
          { speech: `${spec.num} ${spec.num === 1 ? 'slice is' : 'slices are'} colored. Count with me — ${Array.from({ length: spec.num }, (_, i) => i + 1).join('... ')}!`, visual: visual(spec.num, spec.denom) },
          { speech: `There are ${spec.denom} slices total and ${spec.num} ${spec.num === 1 ? 'is' : 'are'} colored. What fraction is colored?`, visual: visual(spec.num, spec.denom) },
        ]
      : [
          { speech: `Look at this! 🔵 Here is a circle!`, visual: visual(0, spec.denom) },
          { speech: `We cut it into ${spec.denom} equal slices. Count with me — ${Array.from({ length: spec.denom }, (_, i) => i + 1).join('... ')}!`, visual: visual(0, spec.denom) },
          { speech: `Now some slices are colored! Count the colored ones — ${Array.from({ length: spec.num }, (_, i) => i + 1).join('... ')}!`, visual: visual(spec.num, spec.denom) },
          { speech: QUIZ_ASK_LINE, visual: visual(spec.num, spec.denom) },
        ];
    return {
      steps: filterFractionQuizSteps(steps, q.answer),
      setupVisual: visual(spec.num, spec.denom),
    };
  }

  if (spec.type === 'simplify') {
    const quizTheme = detectFractionQuizTheme(q.text);
    const visual = quizTheme === 'circle'
      ? circleVisual
      : (num, denom) => foodFractionVisual(quizTheme, num, denom);
    const introSpeech = quizTheme === 'circle'
      ? `Look at this! 🔵 Here is a circle cut into ${spec.denom} equal slices!`
      : quizTheme === 'cake'
        ? `Look! 🎂 Here is a cake cut into ${spec.denom} equal slices!`
        : `Look! 🍕 Here is a pizza cut into ${spec.denom} equal slices!`;
    const steps = [
      { speech: introSpeech, visual: visual(0, spec.denom) },
      { speech: `${spec.num} ${spec.num === 1 ? 'slice is' : 'slices are'} colored. Count with me — ${Array.from({ length: spec.num }, (_, i) => i + 1).join('... ')}!`, visual: visual(spec.num, spec.denom) },
      { speech: `That is ${spec.num}/${spec.denom}. Can you write the same amount as a simpler fraction?`, visual: visual(spec.num, spec.denom) },
    ];
    return {
      steps: filterFractionQuizSteps(steps, q.answer),
      setupVisual: visual(spec.num, spec.denom),
    };
  }

  return { steps: [], setupVisual: null };
};

const findPairWithSum = (nums, target) => {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [nums[i], nums[j]];
    }
  }
  if (nums.length >= 2 && nums[0] + nums[1] === target) return [nums[0], nums[1]];
  const half = Math.floor(target / 2);
  return [half, target - half];
};

const findSubtractionOperands = (nums, target) => {
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i !== j && nums[i] - nums[j] === target) return [nums[i], nums[j]];
    }
  }
  const subtrahend = nums[1] ?? 2;
  return [target + subtrahend, subtrahend];
};

const findMultiplicationOperands = (text, nums, target) => {
  const eachMatch = text.match(/each .+? (\d+)/i);
  if (eachMatch) {
    const perGroup = parseInt(eachMatch[1], 10);
    const groups = nums.find((n) => n !== perGroup && n * perGroup === target);
    if (groups) return [groups, perGroup];
  }
  const carsMatch = text.match(/(\d+) .+?\bdo (\d+)/i);
  if (carsMatch) {
    const perGroup = parseInt(carsMatch[1], 10);
    const groups = parseInt(carsMatch[2], 10);
    if (groups * perGroup === target) return [groups, perGroup];
  }
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i !== j && nums[i] * nums[j] === target) return [nums[i], nums[j]];
    }
  }
  if (nums.length >= 2) {
    if (nums[0] * nums[1] === target) return [nums[0], nums[1]];
    if (nums[1] * nums[0] === target) return [nums[1], nums[0]];
  }
  const root = Math.max(2, Math.round(Math.sqrt(target)));
  return [root, Math.max(1, Math.round(target / root))];
};

const findDivisionOperands = (nums, target) => {
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i !== j && nums[j] !== 0 && nums[i] / nums[j] === target) return [nums[i], nums[j]];
    }
  }
  if (typeof target === 'number' && target > 0) {
    const divisor = nums[1] ?? 2;
    return [target * divisor, divisor];
  }
  return [nums[0] ?? 6, nums[1] ?? 2];
};

const stripQuizQuestion = (text) =>
  String(text || '')
    .replace(/\?\s*$/, '')
    .replace(/\s*how many[^?.!]*[?.!]?\s*$/i, '')
    .replace(/\s*what fraction[^?.!]*[?.!]?\s*$/i, '')
    .replace(/\s*which fraction[^?.!]*[?.!]?\s*$/i, '')
    .trim();

// Map story nouns from the quiz text to a valid MathVisual shape (never random dragons).
const inferVisualShapeFromText = (text) => {
  const t = (text || '').toLowerCase();
  const rules = [
    ['apple', 'apple'],
    ['orange', 'orange'],
    ['strawberr', 'strawberry'],
    ['cand', 'candy'],
    ['wheel', 'car'],
    ['car', 'car'],
    ['fish', 'fish'],
    ['cat', 'cat'],
    ['bat', 'bat'],
    ['book', 'square'],
    ['shelf', 'square'],
    ['block', 'square'],
    ['chair', 'square'],
    ['page', 'square'],
    ['sticker', 'square'],
    ['toy', 'square'],
    ['ball', 'circle'],
    ['bird', 'circle'],
    ['flower', 'circle'],
    ['star', 'circle'],
    ['chicken', 'circle'],
    ['step', 'circle'],
    ['student', 'circle'],
    ['friend', 'circle'],
    ['child', 'circle'],
  ];
  for (const [word, shape] of rules) {
    if (t.includes(word)) return shape;
  }
  return 'circle';
};

const buildLocalQuizVisuals = (q, topicApi) => {
  const allNums = (q.text.match(/\d+/g) || []).map(Number);
  const shape = inferVisualShapeFromText(q.text);

  if (topicApi === 'division' && q.answerType === 'fraction') {
    const spec = getFractionSpec(q);
    if (spec?.type === 'simplify' || spec?.type === 'identify') {
      const v = fractionVisual(spec.num, spec.denom);
      return { setupVisual: v, stepVisuals: [v] };
    }
    const frac = parseFractionAnswer(q.answer);
    if (!frac) return { setupVisual: null, stepVisuals: [] };
    const v = fractionVisual(frac.n, frac.d);
    return { setupVisual: v, stepVisuals: [v] };
  }

  if (topicApi === 'multiplication') {
    const [groups, perGroup] = findMultiplicationOperands(q.text, allNums, q.answer);
    return {
      setupVisual: `multiplication ${groups} ${perGroup} ${shape}`,
      stepVisuals: [
        `multiplication ${groups} 0 ${shape}`,
        `multiplication ${groups} ${perGroup} ${shape}`,
      ],
    };
  }

  if (topicApi === 'subtraction') {
    const [bigger, smaller] = findSubtractionOperands(allNums, q.answer);
    return {
      setupVisual: `subtraction ${bigger} ${smaller} ${shape}`,
      stepVisuals: [
        `subtraction ${bigger} 0 ${shape}`,
        `subtraction ${bigger} ${smaller} ${shape}`,
      ],
    };
  }

  if (topicApi === 'division') {
    const [dividend, divisor] = findDivisionOperands(allNums, q.answer);
    return {
      setupVisual: `division ${dividend} ${divisor} ${shape}`,
      stepVisuals: [
        `division ${dividend} 0 ${shape}`,
        `division ${dividend} ${divisor} ${shape}`,
      ],
    };
  }

  const [first, second] = findPairWithSum(allNums, q.answer);
  return {
    setupVisual: `addition ${first} ${second} ${shape}`,
    stepVisuals: [
      `addition ${first} 0 ${shape}`,
      `addition ${first} ${second} ${shape}`,
    ],
  };
};

const applyLocalQuizVisuals = (steps, localVisuals) => {
  if (!Array.isArray(steps) || steps.length === 0 || !localVisuals?.stepVisuals?.length) return steps;
  const { stepVisuals } = localVisuals;
  return steps.map((step, i) => {
    const localVis = stepVisuals[Math.min(i, stepVisuals.length - 1)];
    return localVis ? { ...step, visual: localVis } : step;
  });
};

const isTutorFallbackResponse = (steps) =>
  Array.isArray(steps)
  && steps.length === 1
  && /oops|something went wrong/i.test(String(steps[0]?.speech || ''));

const buildLocalIntegerQuizSteps = (q, topicApi) => {
  const localVisuals = buildLocalQuizVisuals(q, topicApi);
  const { stepVisuals, setupVisual } = localVisuals;
  const scenario = stripQuizQuestion(q.text);
  const intro = scenario || 'Look at this story problem!';
  const midVisual = stepVisuals[1] ?? setupVisual;
  const finalVisual = setupVisual ?? stepVisuals[stepVisuals.length - 1];

  return [
    { speech: intro, visual: stepVisuals[0] ?? finalVisual },
    { speech: 'Watch carefully as the scene builds step by step!', visual: midVisual },
    { speech: QUIZ_ASK_LINE, visual: finalVisual },
  ];
};

const ensureQuizAskStep = (steps, setupVisual) => {
  const result = [...(steps || [])];
  const last = result[result.length - 1];
  if (!last || !/what is the answer/i.test(String(last.speech || ''))) {
    result.push({ speech: QUIZ_ASK_LINE, visual: setupVisual, audio: null });
  } else {
    result[result.length - 1] = {
      ...last,
      speech: QUIZ_ASK_LINE,
      visual: setupVisual ?? last.visual,
    };
  }
  return result;
};

// Build the /tutor scene prompt for any quiz across all modules and levels.
const buildQuizScenePrompt = (q, topicApi) => {
  const scenario = stripQuizQuestion(q.text);
  const shape = inferVisualShapeFromText(q.text);
  const allNums = (q.text.match(/\d+/g) || []).map(Number);
  let scenePrompt = '';

  if (topicApi === 'division' && q.answerType === 'fraction') {
    const t = q.text.toLowerCase();
    if (q.fractionSpec?.type === 'identify') {
      const { num, denom } = q.fractionSpec;
      const theme = detectFractionQuizTheme(q.text);
      const visualRule = theme === 'circle'
        ? 'Use visual "fraction NUM DENOM fraction_circle" on every step'
        : theme === 'cake'
          ? 'Use visual "cake NUM DENOM fraction_circle" on every step'
          : 'Use visual "pizza NUM DENOM fraction_circle" on every step';
      scenePrompt =
        `${q.text} Show exactly ${num} colored slices out of ${denom} equal slices. ${visualRule}. ` +
        'Level 3 fraction identify — do NOT simplify the fraction.';
    } else if (q.fractionSpec?.type === 'simplify') {
      const { num, denom } = q.fractionSpec;
      const theme = detectFractionQuizTheme(q.text);
      const visualRule = theme === 'circle'
        ? 'Use visual "fraction NUM DENOM fraction_circle" on every step'
        : theme === 'cake'
          ? 'Use visual "cake NUM DENOM fraction_circle" on every step'
          : 'Use visual "pizza NUM DENOM fraction_circle" on every step';
      scenePrompt =
        `${q.text} Show exactly ${num} colored slices out of ${denom} equal slices (${num}/${denom}). ${visualRule}. ` +
        'Level 4 fraction simplify — ask the child to write the same amount with smaller numbers. Do NOT reveal the simplified answer.';
    } else if (/which.*bigger/.test(t) && allNums.length >= 4) {
      scenePrompt = `Compare fractions ${allNums[0]}/${allNums[1]} and ${allNums[2]}/${allNums[3]}`;
    } else if (/left|remaining|uncolored|unshaded/.test(t) && allNums.length >= 2) {
      const denom = allNums[0];
      const shaded = allNums[1];
      scenePrompt = `What is fraction ${denom}/${denom} minus fraction ${shaded}/${denom}?`;
    } else if ((/then.*more|and then/.test(t) || (/shaded.*then/.test(t) && allNums.length >= 3)) && allNums.length >= 3) {
      const denom = allNums[0];
      const a = allNums[1];
      const b = allNums[2];
      scenePrompt = `What is fraction ${a}/${denom} plus fraction ${b}/${denom}?`;
    } else if (allNums.length >= 2) {
      const denom = allNums[0];
      const num = allNums[1];
      scenePrompt = `Explain fraction ${num}/${denom}`;
    } else {
      scenePrompt = `Explain fraction ${q.answer}`;
    }
  } else if (topicApi === 'division') {
    const [dividend, divisor] = findDivisionOperands(allNums, q.answer);
    scenePrompt =
      `${scenario}. Show ${dividend} ${shape} objects shared equally into ${divisor} groups. ` +
      `Use the "${shape}" shape in every visual tag.`;
  } else if (topicApi === 'multiplication') {
    const [groups, perGroup] = findMultiplicationOperands(q.text, allNums, q.answer);
    scenePrompt =
      `${scenario}. Show ${groups} groups with ${perGroup} ${shape} objects in each group. ` +
      `Use the "${shape}" shape in every visual tag.`;
  } else if (topicApi === 'subtraction') {
    const [bigger, smaller] = findSubtractionOperands(allNums, q.answer);
    scenePrompt =
      `${scenario}. Show ${bigger} ${shape} objects, then take away ${smaller}. ` +
      `Use the "${shape}" shape in every visual tag.`;
  } else {
    const [first, second] = findPairWithSum(allNums, q.answer);
    scenePrompt =
      `${scenario}. Show ${first} ${shape} objects, then ${second} more join them. ` +
      `Use the "${shape}" shape in every visual tag.`;
  }

  return `${scenePrompt}${QUIZ_MODE_SUFFIX}`;
};

const getQuizAskLine = () => QUIZ_ASK_LINE;

// Quiz scene helpers — never show or speak the answer before the child responds.
const parseVisualOperands = (visualString) => {
  if (!visualString || typeof visualString !== 'string') return null;
  const parts = visualString.split(' ');
  if (parts.length < 4) return null;
  return { a: parseInt(parts[1], 10) || 0, b: parseInt(parts[2], 10) || 0 };
};

const visualShowsAnswer = (visualString, expectedAnswer) => {
  if (expectedAnswer == null || visualString == null) return false;
  if (typeof expectedAnswer === 'string') return false;
  const ops = parseVisualOperands(visualString);
  if (!ops) return false;
  return ops.b === 0 && ops.a === expectedAnswer;
};

const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const speechRevealsAnswer = (speech, expectedAnswer) => {
  if (!speech || expectedAnswer == null) return false;
  const frac = parseFractionAnswer(expectedAnswer);
  if (frac) {
    const text = String(speech).toLowerCase();
    if (new RegExp(`(?:answer|the answer|fraction is|equals|makes)\\s*(?:is|:)?\\s*${frac.n}\\s*/\\s*${frac.d}\\b`, 'i').test(text)) return true;
    return false;
  }
  const ans = String(expectedAnswer).trim();
  if (!ans) return false;
  const text = String(speech).toLowerCase();
  const a = escapeRegExp(ans.toLowerCase());
  return (
    new RegExp(`(?:answer|total|altogether|left|get|got|makes|equals|is)\\s*(?:is|:)?\\s*${a}\\b`, 'i').test(text) ||
    new RegExp(`\\b${a}\\s*!`, 'i').test(text)
  );
};

const filterQuizSceneSteps = (allSteps, expectedAnswer) => {
  if (!Array.isArray(allSteps) || allSteps.length === 0) return [];
  const filtered = allSteps.filter(
    (step) => !speechRevealsAnswer(step?.speech, expectedAnswer) && !visualShowsAnswer(step?.visual, expectedAnswer)
  );
  if (filtered.length > 0) return filtered;
  if (allSteps.length > 1 && speechRevealsAnswer(allSteps[allSteps.length - 1]?.speech, expectedAnswer)) {
    return allSteps.slice(0, -1);
  }
  return allSteps.slice(0, 1);
};

const pickQuizSetupVisual = (allSteps, expectedAnswer) => {
  if (!Array.isArray(allSteps) || allSteps.length === 0) return null;
  const candidates = allSteps.slice(0, -1).filter(
    (step) => !visualShowsAnswer(step?.visual, expectedAnswer)
  );
  if (candidates.length > 0) return candidates[candidates.length - 1]?.visual ?? null;
  return allSteps[0]?.visual ?? null;
};

// Adaptive Tutor — response-time pathways (per question, on correct answer)
const ADAPTIVE_CONFIG = {
  MASTERING_MS: 3000,              // under 3 seconds → mastering
  ON_TRACK_MS: 6000,               // under 6 seconds → on-track
  STRUGGLING_MS: 10000,            // over 10 seconds → struggling
  STRUGGLE_WRONG_THRESHOLD: 2,       // 2+ wrong attempts on one question → struggling
};

// Classify the child's adaptive pathway from how long this question took.
const classifyPerformance = ({ currentWrongAttempts, currentResponseMs }) => {
  if (currentWrongAttempts >= ADAPTIVE_CONFIG.STRUGGLE_WRONG_THRESHOLD) return 'struggling';
  if (currentResponseMs > ADAPTIVE_CONFIG.STRUGGLING_MS) return 'struggling';
  if (currentResponseMs < ADAPTIVE_CONFIG.MASTERING_MS) return 'mastering';
  return 'on-track';
};

// Synthetic "easier practice" question injected when a child struggles.
// Integer topics use tier-1 (0-10); Division L3/L4 use simpler fraction circle items.
const buildBonusQuiz = (topicApi, levelNum) => {
  if (topicApi === 'addition')       return { text: "Let's try an easier one: what is 3 + 2?",     answer: 5, isBonus: true };
  if (topicApi === 'subtraction')    return { text: "Let's try an easier one: what is 6 minus 2?", answer: 4, isBonus: true };
  if (topicApi === 'multiplication') return { text: "Let's try an easier one: what is 2 times 3?", answer: 6, isBonus: true };
  if (topicApi === 'division') {
    if (levelNum === 3) {
      const [bonusQuiz] = buildProceduralL3Quizzes(1);
      return { ...bonusQuiz, isBonus: true };
    }
    if (levelNum === 4) {
      const [bonusQuiz] = buildProceduralL4Quizzes(1);
      return { ...bonusQuiz, isBonus: true };
    }
    // L1 & L2 — simpler integer sharing (0-10 range)
    return {
      text: "Let's try an easier one: you have 6 apples shared equally between 2 friends. How many does each get?",
      answer: 3, isBonus: true,
    };
  }
  return null;
};

// Build a chat message object from a tutor response array
const makeTutorMsg = (data, idPrefix) => ({
  id: `${idPrefix}-${Date.now()}`,
  role: 'mentora',
  text: data.map((s) => s.speech).join(' '),
  visual: enforceTextRender(data[data.length - 1]?.visual ?? null),
});

// ── component ─────────────────────────────────────────────────────────────────
export default function LessonChatPage({
  subtractionModulePoints = 0,
  onSubtractionCorrect = undefined,
}) {
  const { topicSlug, levelId } = useParams();
  const navigate = useNavigate();
  const { user, recordQuizResult, saveLessonSession } = useApp();

  const levelNum = parseInt(levelId, 10);
  const plan    = LEVEL_PLAN[topicSlug] ?? null;
  const config  = plan ? getLevelConfig(topicSlug, levelNum) : null;
  const topicApi     = plan?.apiTopic   ?? '';
  const displayName  = plan?.displayName ?? '';
  const isSubtractionModule = topicSlug === 'subtraction';
  const isSubtractionScoring = isSubtractionModule && typeof onSubtractionCorrect === 'function';

  const getLessonQuizzes = () => {
    if (isDivisionFractionDynamic(topicSlug, levelNum, config) && sessionQuizzesRef.current?.length) {
      return sessionQuizzesRef.current;
    }
    return config?.quizzes ?? [];
  };

  // ── ALL hooks unconditionally before any early-return ────────────────────
  const [messages,     setMessages]     = useState([]);
  const [inputText,    setInputText]    = useState('');
  const [emotion,      setEmotion]      = useState('waving');
  const [lessonBusy,   setLessonBusy]   = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [lessonPhase,  setLessonPhase]  = useState('loading');
  const [quizIndex,    setQuizIndex]    = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [score,        setScore]        = useState(0);        
  const [showExtraBtn, setShowExtraBtn] = useState(false);    
  const [showNextBtn,   setShowNextBtn]   = useState(false);
  const [nextQuizIndex, setNextQuizIndex] = useState(null);
  // Points / streak / hint tracking
  const [points,          setPoints]          = useState(0);
  const [subtractionLivePoints, setSubtractionLivePoints] = useState(() =>
    isSubtractionModule ? readSubtractionModulePoints() : 0,
  );
  const [streak,          setStreak]          = useState(0);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [wrongAttempts,   setWrongAttempts]   = useState(0);
  // Adaptive Tutor — per-lesson performance log + pending bonus injection
  // perfLog entries: { qIdx, isCorrect, responseMs, attempts, wrongAttempts }
  const [perfLog,      setPerfLog]      = useState([]);
  const [pendingBonus, setPendingBonus] = useState(null); // synthetic quiz object or null
  const sessionQuizzesRef = useRef(null);
  const [celebrationPieces, setCelebrationPieces] = useState([]);

  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;
  const speechSupported = !!SpeechRecognitionAPI;
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const chatEndRef     = useRef(null);
  const mountedRef     = useRef(true);
  // Adaptive Tutor — stopwatches (refs so reads don't trigger re-renders)
  const lessonStartMsRef   = useRef(0);
  const questionStartMsRef = useRef(0);
  const celebrationTimerRef = useRef(null);
  const perfLogRef = useRef([]);
  const scoreRef = useRef(0);
  const pointsRef = useRef(0);
  const pendingBonusRef = useRef(null);
  const quizSubmittingRef = useRef(false);
  const lastFractionTeachingPromptRef = useRef(null);
  const lastIntegerTeachingPromptRef = useRef(null);

  useEffect(() => {
    if (!isSubtractionModule) return;
    const stored = readSubtractionModulePoints();
    setSubtractionLivePoints((prev) => Math.max(prev, stored, subtractionModulePoints));
  }, [isSubtractionModule, subtractionModulePoints]);

  useEffect(() => {
    if (isSubtractionModule) return;
    clearSubtractionModulePoints();
  }, [isSubtractionModule]);

  useEffect(() => { pendingBonusRef.current = pendingBonus; }, [pendingBonus]);

  useEffect(() => { perfLogRef.current = perfLog; }, [perfLog]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { pointsRef.current = points; }, [points]);

  const persistLevelCompletion = async () => {
    if (!plan || !config || !user?.user_id) return;
    const log = perfLogRef.current;
    const pathwayCounts = { mastering: 0, 'on-track': 0, struggling: 0 };
    log.forEach((p) => {
      const key = p.pathway || 'on-track';
      if (pathwayCounts[key] != null) pathwayCounts[key] += 1;
    });
    const dominantPathway = Object.entries(pathwayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'on-track';

    recordQuizResult(
      plan.displayName,
      levelNum,
      scoreRef.current,
      getLessonQuizzes().length,
      pointsRef.current,
      { pathway: dominantPathway, questions: log },
    );
    await saveLessonSession({
      user_id: user.user_id,
      topic: plan.displayName,
      level: levelNum,
      score: scoreRef.current,
      total_questions: getLessonQuizzes().length,
      points: pointsRef.current,
      questions: perfLogRef.current.map((p) => ({
        q_idx: p.qIdx,
        is_correct: p.isCorrect !== false,
        response_ms: p.responseMs || 0,
        attempts: p.attempts || 1,
        wrong_attempts: p.wrongAttempts || 0,
        pathway: p.pathway || 'on-track',
        is_bonus: !!p.isBonus,
      })),
    });
  };

  const triggerCelebration = () => {
    if (celebrationTimerRef.current) window.clearTimeout(celebrationTimerRef.current);
    setCelebrationPieces(buildCelebrationPieces());
    celebrationTimerRef.current = window.setTimeout(() => {
      setCelebrationPieces([]);
      celebrationTimerRef.current = null;
    }, 3200);
  };

  const celebrateCorrectAnswer = async (speechText) => {
    triggerCelebration();
    const audio = await fetchTtsAudio(speechText);
    if (mountedRef.current) await speak(audio);
  };

  // Track whether the component is mounted so async ops don't set state after unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      recognitionRef.current?.abort();
      if (celebrationTimerRef.current) window.clearTimeout(celebrationTimerRef.current);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, lessonBusy, currentSlide]);

  // ── CHANGE 1: lesson bootstrap with Promise.allSettled ───────────────────
  useEffect(() => {
    if (!config || !plan) return;

    let cancelled = false;
    const cancelledRef = { current: false };

    // Reset all lesson state for the new level
    setMessages([{ id: 'welcome', role: 'mentora', text: welcomeMessage(displayName, levelNum), visual: null }]);
    setLessonPhase('examples');
    setLessonBusy(false);
    setQuizIndex(0);
    setScore(0);
    setShowComplete(false);
    setCurrentSlide(null);
    setEmotion('waving');
    setShowExtraBtn(false);
    setShowNextBtn(false);
    setNextQuizIndex(null);
    setPoints(0);
    setStreak(0);
    setCurrentAttempts(0);
    setWrongAttempts(0);
    setPerfLog([]);
    setPendingBonus(null);
    setCelebrationPieces([]);
    sessionQuizzesRef.current = null;
    lessonStartMsRef.current = Date.now();

    const timer = window.setTimeout(() => {
      unlockAudioContext();
      (async () => {
        setLessonBusy(true);
        setEmotion('thinking');

        try {
          // Step 1 — one full teaching example (step-by-step, answer included on last step)
          let teachingPrompt;
          if (isFractionDivisionLevel(topicSlug, levelNum)) {
            teachingPrompt = pickRandomFractionTeachingPrompt(levelNum);
            lastFractionTeachingPromptRef.current = teachingPrompt;
          } else if (usesDynamicTeaching(topicSlug, config)) {
            teachingPrompt = await ensureDynamicTeachingPrompt(
              topicSlug, levelNum, user?.user_id, config.teachingExamples,
            );
            lastIntegerTeachingPromptRef.current = teachingPrompt;
          } else {
            teachingPrompt = config.teachingExamples?.[0];
          }
          if (!teachingPrompt) {
            setLessonPhase('quiz');
            await presentQuizQuestion(0);
            if (!cancelled && mountedRef.current) setShowExtraBtn(true);
            return;
          }

          let exampleData = null;
          if (isFractionDivisionLevel(topicSlug, levelNum)) {
            exampleData = await prepareFractionTeachingExample(
              teachingPrompt,
              topicApi,
              user?.user_id,
            );
          } else {
            const settled = await Promise.allSettled([
              callTutorAPI(teachingPrompt, topicApi, user?.user_id),
            ]);
            exampleData = settled[0]?.status === 'fulfilled' ? settled[0].value : null;
          }

          if (cancelled || !mountedRef.current) return;

          if (exampleData) {
            cancelledRef.current = cancelled;
            await runSlideshow(exampleData, {
              mountedRef,
              setCurrentSlide,
              setEmotion,
              lastStepPauseMs: 2500,
              stepDelayMs: isFractionDivisionLevel(topicSlug, levelNum) ? 0 : 800,
            });
            if (!cancelled && mountedRef.current) {
              setMessages((prev) => [...prev, makeTutorMsg(exampleData, 'ex-0')]);
              setEmotion('happy');
              await delay(400);
            }
          }

          if (cancelled || !mountedRef.current) return;

          if (isDivisionFractionDynamic(topicSlug, levelNum, config)) {
            const generated = await ensureDynamicDivisionQuizzes(topicSlug, levelNum, user?.user_id, config.quizCount || 5);
            if (cancelled || !mountedRef.current) return;
            sessionQuizzesRef.current = generated;
          }

          // Step 2 — quiz: dynamic setup visuals + ask line (no answer reveal)
          setLessonPhase('quiz');
          setScore(0);
          await presentQuizQuestion(0);
          if (!cancelled && mountedRef.current) setShowExtraBtn(true);
        } catch (err) {
          console.error('Lesson bootstrap failed:', err);
          if (mountedRef.current) {
            setLessonPhase('quiz');
            await presentQuizQuestion(0);
            setShowExtraBtn(true);
          }
        }
      })();
    }, 400);

    return () => {
      cancelled = true;
      cancelledRef.current = true;
      window.clearTimeout(timer);
    };
  }, [topicSlug, levelId]);

  // Play every quiz step in order (setup → action → "What is the answer?"), then show q.text in chat.
  const presentQuizQuestion = async (qIdx, overrideQuiz = null) => {
    if (!config || !mountedRef.current) return false;

    if (isDivisionFractionDynamic(topicSlug, levelNum, config) && !sessionQuizzesRef.current?.length) {
      const generated = await ensureDynamicDivisionQuizzes(topicSlug, levelNum, user?.user_id, config.quizCount || 5);
      if (!mountedRef.current) return false;
      sessionQuizzesRef.current = generated;
    }

    const lessonQuizzes = getLessonQuizzes();
    const q = overrideQuiz ?? lessonQuizzes[qIdx];
    if (!q) return false;

    const scenePrompt = buildQuizScenePrompt(q, topicApi);

    setShowNextBtn(false);
    setCurrentAttempts(0);
    setWrongAttempts(0);
    setLessonBusy(true);
    setEmotion('thinking');

    let presented = false;

    const finishQuizChatBubble = () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${q.isBonus ? 'bonus-q' : 'q'}-${qIdx}-${Date.now()}`,
          role: 'mentora',
          text: q.text,
          visual: setupVisual,
          isQuiz: true,
        },
      ]);
      setEmotion('happy');
      presented = true;
    };

    let setupVisual = null;

    try {
      let stepsToPlay = [];
      let usedLocalFallback = false;

      if (isFractionDivisionLevel(topicSlug, levelNum) && q.answerType === 'fraction') {
        let allSteps = null;
        try {
          allSteps = await callTutorAPI(scenePrompt, topicApi, user?.user_id);
        } catch {
          allSteps = null;
        }
        if (!mountedRef.current) return false;

        if (!Array.isArray(allSteps) || allSteps.length === 0 || isTutorFallbackResponse(allSteps)) {
          usedLocalFallback = true;
          const localQuiz = buildLocalFractionQuizSteps(q, levelNum);
          stepsToPlay = localQuiz.steps;
          setupVisual = enforceTextRender(localQuiz.setupVisual);
        } else {
          stepsToPlay = filterQuizSceneSteps(allSteps, q.answer);
          const localQuiz = buildLocalFractionQuizSteps(q, levelNum);
          setupVisual = enforceTextRender(
            pickQuizSetupVisual(allSteps, q.answer) ?? localQuiz.setupVisual,
          );
        }
      } else {
        const localVisuals = buildLocalQuizVisuals(q, topicApi);
        let allSteps = null;
        try {
          allSteps = await callTutorAPI(scenePrompt, topicApi, user?.user_id);
        } catch {
          allSteps = null;
        }
        if (!mountedRef.current) return false;

        if (!Array.isArray(allSteps) || allSteps.length === 0 || isTutorFallbackResponse(allSteps)) {
          usedLocalFallback = true;
          stepsToPlay = buildLocalIntegerQuizSteps(q, topicApi);
          setupVisual = enforceTextRender(localVisuals.setupVisual);
        } else {
          stepsToPlay = applyLocalQuizVisuals(filterQuizSceneSteps(allSteps, q.answer), localVisuals);
          setupVisual = enforceTextRender(
            localVisuals.setupVisual ?? pickQuizSetupVisual(allSteps, q.answer),
          );
        }
      }

      if (usedLocalFallback) {
        stepsToPlay = ensureQuizAskStep(stepsToPlay, setupVisual);
      }

      if (stepsToPlay.some((st) => !st.audio)) {
        stepsToPlay = await enrichStepsWithTts(stepsToPlay);
      }

      if (stepsToPlay.length > 0) {
        await runSlideshow(stepsToPlay, {
          mountedRef,
          setCurrentSlide,
          setEmotion,
          lastStepPauseMs: 1200,
          stepDelayMs: 800,
        });
      }

      if (!mountedRef.current) return false;
      finishQuizChatBubble();
    } catch {
      if (!mountedRef.current) return false;
      try {
        let stepsToPlay = [];
        if (isFractionDivisionLevel(topicSlug, levelNum) && q.answerType === 'fraction') {
          const localQuiz = buildLocalFractionQuizSteps(q, levelNum);
          stepsToPlay = localQuiz.steps;
          setupVisual = enforceTextRender(localQuiz.setupVisual);
        } else {
          stepsToPlay = buildLocalIntegerQuizSteps(q, topicApi);
          setupVisual = enforceTextRender(buildLocalQuizVisuals(q, topicApi).setupVisual);
        }
        stepsToPlay = ensureQuizAskStep(stepsToPlay, setupVisual);
        stepsToPlay = await enrichStepsWithTts(stepsToPlay);
        if (stepsToPlay.length > 0) {
          await runSlideshow(stepsToPlay, {
            mountedRef,
            setCurrentSlide,
            setEmotion,
            lastStepPauseMs: 1200,
            stepDelayMs: 800,
          });
        }
        if (!mountedRef.current) return false;
        finishQuizChatBubble();
      } catch {
        setupVisual = null;
        setMessages((prev) => [
          ...prev,
          { id: `${q.isBonus ? 'bonus-q' : 'q'}-${qIdx}-${Date.now()}`, role: 'mentora', text: q.text, visual: null, isQuiz: true },
        ]);
        presented = true;
      }
    } finally {
      if (mountedRef.current) {
        setCurrentSlide(null);
        setLessonBusy(false);
        if (presented) {
          if (!overrideQuiz) setQuizIndex(qIdx);
          questionStartMsRef.current = Date.now();
        }
      }
    }

    return presented;
  };

  // ── CHANGE 2: "Show me another example" ──────────────────────────────────
  const handleExtraExample = async () => {
    if (lessonBusy || !mountedRef.current) return;
    let prompt;
    if (isFractionDivisionLevel(topicSlug, levelNum)) {
      prompt = pickRandomFractionTeachingPrompt(levelNum, lastFractionTeachingPromptRef.current);
      lastFractionTeachingPromptRef.current = prompt;
    } else if (usesDynamicTeaching(topicSlug, config)) {
      prompt = await ensureDynamicTeachingPrompt(
        topicSlug, levelNum, user?.user_id, config.teachingExamples,
        lastIntegerTeachingPromptRef.current,
      );
      lastIntegerTeachingPromptRef.current = prompt;
    } else {
      prompt = EXTRA_EXAMPLE_PROMPTS[topicSlug]?.[levelNum] ?? config?.teachingExamples?.[0] ?? '';
    }
    if (!prompt) return;

    setLessonBusy(true);
    setEmotion('thinking');

    try {
      let data = null;
      if (isFractionDivisionLevel(topicSlug, levelNum)) {
        data = await prepareFractionTeachingExample(prompt, topicApi, user?.user_id);
      } else {
        data = await callTutorAPI(prompt, topicApi, user?.user_id);
      }
      if (!mountedRef.current || !data) return;

      await runSlideshow(data, {
        mountedRef,
        setCurrentSlide,
        setEmotion,
        lastStepPauseMs: 2500,
        stepDelayMs: isFractionDivisionLevel(topicSlug, levelNum) ? 0 : 800,
      });
      if (!mountedRef.current) return;
      setMessages((prev) => [...prev, makeTutorMsg(data, 'extra')]);
      setEmotion('happy');
    } catch {
      if (!mountedRef.current) return;
      setCurrentSlide(null);
      setMessages((prev) => [
        ...prev,
        { id: `err-extra-${Date.now()}`, role: 'mentora', text: "Oops! Mentora had trouble with that. Try again!", visual: null },
      ]);
    }

    if (!mountedRef.current) return;
    setLessonBusy(false);
  };

  // ── CHANGE 3: "I'm Ready!" starts quiz phase ─────────────────────────────
  const handleReady = async () => {
    if (lessonBusy) return;
    setShowExtraBtn(false);
    setLessonPhase('quiz');
    setScore(0);
    await presentQuizQuestion(0);
  };

  // ── "Next Question / See my results" button handler ─────────────────────
  const handleNext = async () => {
    if (lessonBusy || !mountedRef.current) return;

    const bonus = pendingBonusRef.current;
    if (bonus) {
      const ok = await presentQuizQuestion(quizIndex, bonus);
      if (!ok && mountedRef.current) setShowNextBtn(true);
      return;
    }

    setShowNextBtn(false);
    if (nextQuizIndex === null) {
      try {
        await persistLevelCompletion();
      } catch (e) {
        console.error('persistLevelCompletion failed:', e);
      }
      setLessonPhase('done');
      setEmotion('happy');
      playWhoosh();
      navigate('/stats');
      return;
    } else {
      await presentQuizQuestion(nextQuizIndex);
    }
  };

  // Lets the child skip ahead to the next question (or finish the level if
  // they're already on the last one) without having to answer it first.
  const handleSkipQuestion = async () => {
    if (lessonBusy || !mountedRef.current || !config) return;
    setShowNextBtn(false);
    // Skipping always exits any in-progress bonus and resumes the normal sequence.
    if (pendingBonus) setPendingBonus(null);
    const nextIx = quizIndex + 1;
    if (nextIx >= getLessonQuizzes().length) {
      try {
        await persistLevelCompletion();
      } catch (e) {
        console.error('persistLevelCompletion failed:', e);
      }
      setLessonPhase('done');
      setEmotion('happy');
      playWhoosh();
      navigate('/stats');
    } else {
      await presentQuizQuestion(nextIx);
    }
  };

  // ── quiz submission (answer checking stays on the frontend) ──────────────
  const submitQuiz = async (rawText) => {
    const text = (rawText || '').trim();
    if (!text || lessonPhase !== 'quiz' || lessonBusy || showComplete || !config) return;
    if (quizSubmittingRef.current) return;

    quizSubmittingRef.current = true;

    try {
      await submitQuizInner(text);
    } finally {
      quizSubmittingRef.current = false;
      if (mountedRef.current) setLessonBusy(false);
    }
  };

  const submitQuizInner = async (text) => {
    // Adaptive Tutor — is the child currently on a bonus (Struggling Adaptive Pathway)?
    const isBonus    = pendingBonus != null;
    const q          = isBonus ? pendingBonus : getLessonQuizzes()[quizIndex];
    const responseMs = Math.max(0, Date.now() - (questionStartMsRef.current || Date.now()));
    const userBubble = { id: `u-${Date.now()}`, role: 'user', text, visual: null };

    if (isQuizAnswerCorrect(text, q.answer, { exactFraction: q.exactFraction })) {
      // ── BONUS CORRECT — Struggling Adaptive Pathway completes ────────────
      if (isBonus) {
        const appreciation = pickAppreciation();
        const bonusSpeech = `${appreciation} Let's get back to the next question.`;
        const earned = 3;
        setPoints((prev) => prev + earned);
        setScore((prev) => prev + 1);
        setPendingBonus(null);
        setCurrentAttempts(0);
        setWrongAttempts(0);
        setPerfLog((prev) => [
          ...prev,
          {
            qIdx: quizIndex,
            isCorrect: true,
            responseMs,
            attempts: currentAttempts + 1,
            wrongAttempts: 0,
            pathway: 'struggling',
            isBonus: true,
          },
        ]);
        setMessages((prev) => [
          ...prev,
          userBubble,
          { id: `bonus-ok-${Date.now()}`, role: 'mentora', text: `${appreciation} Let's get back to the next question. 🎉 (+${earned} pts)`, visual: null },
        ]);
        setEmotion('happy');
        setCurrentSlide(null);
        setLessonBusy(false);
        setShowNextBtn(true); // nextQuizIndex was set when struggle was detected
        celebrateCorrectAnswer(bonusSpeech);
        return;
      }

      // ── NORMAL CORRECT ─────────────────────────────────────────────────
      const earned = 3;
      const newPoints = points + earned;
      const newStreak = streak + 1;
      const newScore  = score + 1;
      setPoints(newPoints);
      setStreak(newStreak);
      setScore(newScore);

      // Adaptive Tutor — append this question's outcome to the perf log
      const wrongAttemptsSnapshot = wrongAttempts; // capture before reset
      const verdict = classifyPerformance({
        currentWrongAttempts: wrongAttemptsSnapshot,
        currentResponseMs:    responseMs,
      });
      const newLog = [
        ...perfLog,
        {
          qIdx: quizIndex,
          isCorrect: true,
          responseMs,
          attempts: currentAttempts + 1,
          wrongAttempts: wrongAttemptsSnapshot,
          pathway: verdict,
        },
      ];
      setPerfLog(newLog);
      setCurrentAttempts(0);
      setWrongAttempts(0);

      const appreciation = pickAppreciation();
      const correctLine = { id: `ok-${Date.now()}`, role: 'mentora', text: `${appreciation} 🎉 (+${earned} pts)`, visual: null };

      // Optional streak celebration bubble at 3 / 5 / 10 (Mastering acknowledgement)
      const streakMsg =
        newStreak === 3  ? "🔥 3 in a row! You're on fire!" :
        newStreak === 5  ? "⚡ 5 correct in a row! Incredible!" :
        newStreak === 10 ? "🌟 10 in a row! You are a LEGEND!" : null;
      const streakBubble = streakMsg
        ? { id: `streak-${Date.now()}`, role: 'mentora', text: streakMsg, visual: null }
        : null;

      const nextIx     = quizIndex + 1;
      const isLastQuiz = nextIx >= getLessonQuizzes().length;

      // Adaptive Tutor — Struggling Adaptive Pathway: inject an easier bonus
      // practice question before the next normal quiz. Skips if this was the
      // last quiz of the level (don't extend the lesson past completion).
      const shouldInjectBonus = verdict === 'struggling' && !isLastQuiz;
      let bonusBubble = null;
      if (shouldInjectBonus) {
        const bonusQ = buildBonusQuiz(topicApi, levelNum);
        if (bonusQ) {
          setPendingBonus(bonusQ);
          bonusBubble = {
            id: `bonus-intro-${Date.now()}`,
            role: 'mentora',
            text: "That was tricky — let's slow down with an easier one to build confidence! 💪",
            visual: null,
          };
        }
      }

      if (isLastQuiz) {
        setMessages((prev) => [
          ...prev,
          userBubble,
          correctLine,
          ...(streakBubble ? [streakBubble] : []),
          { id: `done-msg-${Date.now()}`, role: 'mentora', text: completionMessage(levelNum), visual: null },
        ]);
        setEmotion('happy');
        setNextQuizIndex(null);
        setCurrentSlide(null);
        setLessonBusy(false);
        setShowNextBtn(true);
        setShowExtraBtn(true);
        celebrateCorrectAnswer(appreciation);
     } else if (isSubtractionModule && !shouldInjectBonus) {
        setMessages((prev) => [
          ...prev,
          userBubble,
          correctLine,
          ...(streakBubble ? [streakBubble] : []),
        ]);
        setNextQuizIndex(nextIx);
        setCurrentSlide(null);
        
        
        setLessonBusy(false);     
        setShowNextBtn(true);     
        setShowExtraBtn(false);   
        
        celebrateCorrectAnswer(appreciation);
        
        
      } else {
        setMessages((prev) => [
          ...prev,
          userBubble,
          correctLine,
          ...(streakBubble ? [streakBubble] : []),
          ...(bonusBubble ? [bonusBubble] : []),
        ]);
        setNextQuizIndex(nextIx);
        setCurrentSlide(null);
        setLessonBusy(false);
        setShowNextBtn(true);
        setShowExtraBtn(true);
        celebrateCorrectAnswer(appreciation);
      }
    } else {
      // Wrong answer — increment attempt counters, reset streak
      const newAttempts = currentAttempts + 1;
      const newWrong    = wrongAttempts + 1;
      setCurrentAttempts(newAttempts);
      setWrongAttempts(newWrong);
      setStreak(0);
      setEmotion('sad');

      // ── BONUS WRONG — simpler retry, give up after 2 attempts ───────────
      if (isBonus) {
        if (newAttempts >= 2) {
          setPendingBonus(null);
          setCurrentAttempts(0);
          setWrongAttempts(0);
          setMessages((prev) => [
            ...prev,
            userBubble,
            { id: `bonus-skip-${Date.now()}`, role: 'mentora', text: `No worries! The answer was ${q.answer}. Let's keep going! 🎯`, visual: null },
          ]);
          setShowNextBtn(true);
          setLessonBusy(false);
          return;
        }
        setMessages((prev) => [
          ...prev,
          userBubble,
          { id: `bonus-retry-${Date.now()}`, role: 'mentora', text: "Not quite! Take another look and try again. 💪", visual: null },
        ]);
        questionStartMsRef.current = Date.now();
        setLessonBusy(false);
        return;
      }

      // ── NORMAL WRONG (unchanged hint ladder) ───────────────────────────
      if (newWrong === 1) {
        setMessages((prev) => [
          ...prev,
          userBubble,
          { id: `retry-${Date.now()}`, role: 'mentora', text: "Oops! That's not quite right. Try again! 💪", visual: null },
        ]);
        questionStartMsRef.current = Date.now();
      } else if (newWrong === 2) {
        // Show user's bubble immediately, fetch a dynamic AI hint, then show it
        setMessages((prev) => [...prev, userBubble]);
        let hintText = "💡 Hint: Try counting the objects one by one!";
        if (isFractionDivisionLevel(topicSlug, levelNum) && q.answerType === 'fraction') {
          const spec = getFractionSpec(q);
          if (spec?.type === 'simplify') {
            hintText = '💡 Hint: Try smaller numbers — like 4/8 can become 1/2.';
          } else {
            hintText = '💡 Hint: Count the colored pieces. Put that on top, total pieces on bottom.';
          }
        } else {
          try {
            const hintPrompt =
              `Give a short helpful hint for this question without revealing the answer. ` +
              `Keep it to 1 sentence.\nQuestion: ${q.text}`;
            const hintData = await callTutorAPI(hintPrompt, topicApi, user?.user_id);
            if (mountedRef.current) {
              const first = Array.isArray(hintData) ? hintData[0] : hintData;
              const speech = first && typeof first === 'object' ? first.speech : null;
              if (speech) hintText = `💡 Hint: ${speech}`;
            }
          } catch {
            // keep fallback hintText
          }
        }
        if (!mountedRef.current) return;
        setMessages((prev) => [
          ...prev,
          { id: `hint-${Date.now()}`, role: 'mentora', text: hintText, visual: null },
        ]);
        questionStartMsRef.current = Date.now();
      } else {
        // 3rd+ wrong attempt — show a simple narrowing hint (no exact answer)
        let hint2Text = `💡 Think carefully! The answer is a number between ${q.answer - 3} and ${q.answer + 3}.`;
        if (q.answerType === 'fraction') {
          hint2Text = '💡 Try like this: colored pieces on top, total pieces on bottom.';
        }
        setMessages((prev) => [
          ...prev,
          userBubble,
          {
            id: `hint2-${Date.now()}`,
            role: 'mentora',
            text: hint2Text,
            visual: null,
          },
        ]);
        questionStartMsRef.current = Date.now();
      }
    }
  };

  // ── mic (unchanged logic) ─────────────────────────────────────────────────
  const handleMicClick = () => {
    if (!speechSupported || lessonPhase !== 'quiz' || lessonBusy || showComplete) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    unlockAudioContext();
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.results.length - 1; i >= 0; i--) {
        if (event.results[i].isFinal) {
          transcript = event.results[i][0].transcript.trim();
          break;
        }
      }
      if (transcript) submitQuiz(transcript);
    };
    recognition.onend  = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  // ── early-returns AFTER all hooks ─────────────────────────────────────────
  const maxLevel = topicSlug === 'division' ? 4 : 3;
  if (!VALID_SLUGS.includes(topicSlug) || !plan || Number.isNaN(levelNum) || levelNum < 1 || levelNum > maxLevel) {
    return <Navigate to="/" replace />;
  }
  if (!config) return <Navigate to="/" replace />;

  // ── derived ───────────────────────────────────────────────────────────────
  const inputActive = lessonPhase === 'quiz' && !lessonBusy && !showComplete && !showNextBtn;

  // ── input bar (unchanged rendering) ──────────────────────────────────────
  const renderInputBar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '1000px' }}>
      {speechSupported && (
        <style>{`
          @keyframes chatMicPulse {
            0%,100% { box-shadow: 0 0 0 0 rgba(61,217,197,0.5); }
            50% { box-shadow: 0 0 0 10px rgba(61,217,197,0); }
          }
        `}</style>
      )}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(22,35,72,0.55)', backdropFilter: 'blur(28px)',
          border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: '24px',
          padding: '10px 10px 10px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <input
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontFamily: '"Nunito", sans-serif', fontSize: '15px' }}
          type="text"
          placeholder={inputActive ? 'Type your answer or use the mic…' : '…'}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={!inputActive}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { unlockAudioContext(); submitQuiz(inputText); setInputText(''); }
          }}
        />
        {speechSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            disabled={!inputActive}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            style={{
              width: '46px', height: '46px', borderRadius: '15px', flexShrink: 0,
              border: isListening ? '2px solid #3DD9C5' : 'none',
              background: isListening ? 'rgba(61,217,197,0.25)' : 'rgba(255,255,255,0.08)',
              cursor: inputActive ? 'pointer' : 'default',
              opacity: inputActive ? 1 : 0.4,
              color: isListening ? '#3DD9C5' : 'white',
              fontSize: '20px', lineHeight: 1,
              animation: isListening ? 'chatMicPulse 1.2s ease-in-out infinite' : 'none',
            }}
          >🎤︎</button>
        )}
        <button
          type="button"
          onClick={() => { unlockAudioContext(); submitQuiz(inputText); setInputText(''); }}
          disabled={!inputActive}
          style={{
            width: '46px', height: '46px', borderRadius: '15px',
            background: 'linear-gradient(135deg, #FF6B4A, #e85530)', border: 'none',
            cursor: inputActive ? 'pointer' : 'default',
            opacity: inputActive ? 1 : 0.5, color: 'white',
          }}
        >➤</button>
      </div>
    </div>
  );

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left panel — unchanged */}
        <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: 'rgba(13,27,62,0.5)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            type="button"
            onClick={() => { playWhoosh(); navigate(`/topics/${topicSlug}/levels`); }}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: '13px', marginBottom: '30px' }}
          >
            ← Back to Levels
          </button>

          <div style={{ marginTop: '-80px' }}>
            <MentoraMascot emotion={emotion} size={180} />
          </div>

          <div style={{ background: 'rgba(28,45,86,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px 16px', width: '100%', marginTop: '-80px' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#3DD9C5', textTransform: 'uppercase', marginBottom: '4px' }}>✦ Level lesson</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>
              {displayName.toUpperCase()} · LEVEL {levelNum}
            </div>
          </div>
        </div>

        {/* Chat panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* CHANGE 4: live score bar — only visible during quiz phase */}
          {lessonPhase === 'quiz' && (
            <div style={{
              padding: '8px 32px',
              background: 'rgba(28,45,86,0.85)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', gap: '10px',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#3DD9C5' }}>✅</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>
                Score: {score}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#F5C842', marginLeft: '14px' }}>⭐</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>
                Points: {points}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#FF6B4A', marginLeft: '14px' }}>🔥</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>
                Streak: {streak}
              </span>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '14px 18px',
                  borderRadius: '20px',
                  background: msg.role === 'user' ? '#FF6B4A' : 'rgba(28,45,86,0.85)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  boxSizing: 'border-box',
                }}>
                  {msg.text}
                  {msg.visual && msg.role === 'mentora' && (
                    <div style={{
                      marginTop: '12px',
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                    }}>
                      <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
                        <MathVisual1 visual={msg.visual} isActive={true} compact={!!msg.isQuiz} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* "Show me another example!" + "Next Question →" — visible alongside the quiz questions */}
            {showExtraBtn && !showNextBtn && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={handleExtraExample}
                  disabled={lessonBusy}
                  style={{
                    width: '280px',
                    padding: '12px 20px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', cursor: lessonBusy ? 'default' : 'pointer',
                    fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: '14px',
                    opacity: lessonBusy ? 0.5 : 1, transition: 'opacity .2s',
                  }}
                >
                  🤚 Show me another example!
                </button>
                <button
                  type="button"
                  onClick={handleSkipQuestion}
                  disabled={lessonBusy}
                  style={{
                    width: '280px',
                    padding: '12px 20px', borderRadius: '12px',
                    background: lessonBusy
                      ? 'rgba(61,217,197,0.3)'
                      : 'linear-gradient(135deg, #3DD9C5, #2bbcaa)',
                    border: 'none',
                    color: '#0D1B3E', cursor: lessonBusy ? 'default' : 'pointer',
                    fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: '14px',
                    opacity: lessonBusy ? 0.6 : 1, transition: 'opacity .2s',
                  }}
                >
                  {quizIndex + 1 >= getLessonQuizzes().length ? 'See my results! 🌟' : 'Next Question →'}
                </button>
              </div>
            )}

          {/* Next Question / See my results button */}
          {showNextBtn && (
            <div style={{ display: 'flex', marginTop: '8px', position: 'relative', zIndex: 20 }}>
              <button
                type="button"
                onClick={handleNext}
                disabled={lessonBusy}
                style={{
                  padding: '12px 24px', borderRadius: '12px',
                  background: lessonBusy
                    ? 'rgba(61,217,197,0.3)'
                    : 'linear-gradient(135deg, #3DD9C5, #2bbcaa)',
                  border: 'none',
                  color: '#0D1B3E',
                  cursor: lessonBusy ? 'default' : 'pointer',
                  fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: '14px',
                  opacity: lessonBusy ? 0.6 : 1,
                }}
              >
                {pendingBonus
                  ? 'Easier Practice →'
                  : nextQuizIndex === null
                    ? 'See my results! 🌟'
                    : 'Next Question →'}
              </button>
            </div>
          )}

            {lessonBusy && (
              <div style={{ color: '#3DD9C5', fontSize: '13px', fontWeight: 700 }}>Mentora is thinking...</div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: '16px 32px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,27,62,0.4)' }}>
            {renderInputBar()}
          </div>
        </div>
      </div>

      {celebrationPieces.length > 0 && (
        <div id="confetti" aria-hidden="true">
          <div className="party-popper">🎉</div>
          {celebrationPieces.map((p) => (
            <span
              key={p.id}
              className={`confetti-piece${p.burst ? ' confetti-burst' : ''}`}
              style={{
                left: p.left,
                top: p.top,
                width: `${p.w}px`,
                height: `${p.h}px`,
                background: p.color,
                animationDelay: `${p.delay}s`,
                '--tx': p.tx,
                '--ty': p.ty,
              }}
            />
          ))}
        </div>
      )}

     {/* Slideshow overlay — UPDATED FOR FULL SCREEN */}
      {currentSlide && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000, padding: '40px 20px' }}>
          
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '1400px' }}>
            <MathVisual1 visual={currentSlide.visual} compact={false} />
          </div>

        
          <div style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '1000px', paddingBottom: '20px' }}>
            <p style={{ color: 'white', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, textAlign: 'center', margin: 0, lineHeight: 1.4 }}>
              {currentSlide.text}
            </p>
          </div>
          
        </div>
      )}

      {/* Completion overlay — unchanged */}
      {showComplete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '24px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(28,45,86,0.98) 0%, rgba(22,35,72,0.98) 100%)', border: '1px solid rgba(61,217,197,0.35)', borderRadius: '28px', padding: '40px 36px', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎉</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'white', marginBottom: '10px' }}>
              Level {levelNum} Complete! 🎉
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.75)', marginBottom: '8px' }}>
              {score} questions correct!
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '28px' }}>
              You are a math superstar! 🌟
            </div>
            <button
              type="button"
              onClick={() => navigate(`/topics/${topicSlug}/levels`)}
              style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', background: 'linear-gradient(135deg, #3DD9C5, #2bbcaa)', border: 'none', fontFamily: '"Nunito", sans-serif', fontSize: '16px', fontWeight: 800, color: '#0D1B3E', cursor: 'pointer' }}
            >
              Back to Levels
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
