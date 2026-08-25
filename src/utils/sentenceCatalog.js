import { pickByLevel } from './levelSelection';

export const RECENT_SENTENCE_LIMIT = 60;

export const normalizeSentenceText = (value) => String(value || '')
  .normalize('NFKD')
  .replace(/\p{M}/gu, '')
  .toLocaleLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

const stableHash = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

const LEVEL_DIFFICULTY_BASE = { 1: 5, 2: 17, 3: 31, 4: 45, 5: 60, 6: 76, 7: 90 };

/** Converte o nível editorial legado e a complexidade estrutural em 1–100. */
export const calibrateSentenceDifficulty = (sentence) => {
  if (Number.isFinite(sentence?.difficulty)) {
    return Math.max(1, Math.min(100, Math.round(sentence.difficulty)));
  }

  const text = normalizeSentenceText(sentence?.en);
  const words = text ? text.split(' ') : [];
  const declaredLevel = Math.max(1, Math.min(7, Number(sentence?.level) || 1));
  let score = LEVEL_DIFFICULTY_BASE[declaredLevel];
  score += Math.max(0, words.length - 3) * 0.9;
  if (/[?]/.test(sentence?.en || '')) score += 2;
  if (/\b(not|never|don t|doesn t|didn t|isn t|aren t)\b/.test(text)) score += 2;
  if (/\b(have|has|had)\s+(already\s+|never\s+)?\w+(ed|en)\b/.test(text)) score += 4;
  if (/\b(if|although|unless|whereas|despite)\b/.test(text)) score += 6;
  if (/\b(before|after|while|when)\b/.test(text)) score += 3;
  return Math.max(1, Math.min(100, Math.round(score)));
};

/** Remove duplicatas textuais e acrescenta IDs que não mudam entre sessões. */
export const buildSentenceCatalog = (sentences, courseId) => {
  const normalizedSeen = new Set();
  const result = [];

  for (const sentence of sentences || []) {
    const normalized = normalizeSentenceText(sentence.en);
    if (!normalized || normalizedSeen.has(normalized)) continue;
    normalizedSeen.add(normalized);
    result.push({
      ...sentence,
      id: sentence.id || `${courseId}-sentence-${stableHash(normalized)}`,
      difficulty: calibrateSentenceDifficulty(sentence),
    });
  }

  return result;
};

/** Seleção compatível com o nível atual, excluindo o histórico recente. */
export const pickFreshSentences = (
  sentences,
  userLevel,
  maxLevel,
  count,
  recentSentenceIds = [],
  rng = Math.random,
) => {
  const recent = new Set(recentSentenceIds);
  const fresh = (sentences || []).filter(sentence => !recent.has(sentence.id));
  const pool = fresh.length >= count ? fresh : sentences;
  return pickByLevel(pool, userLevel, maxLevel, count, rng);
};

export const appendRecentSentenceIds = (currentIds = [], newIds = []) => {
  const next = currentIds.filter(id => !newIds.includes(id));
  next.push(...newIds);
  return next.slice(-RECENT_SENTENCE_LIMIT);
};
