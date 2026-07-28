// Chave canônica do progresso.
//
// Os jogos gravavam o que tinham em mãos: MemoryGame passava "Good morning",
// TranslationQuiz passava "Good morning!" e FillBlanks passava "blue" — três
// grafias do mesmo item, contadas como itens diferentes. Pior: frases inteiras
// ("I am happy.") entravam no mesmo balde do vocabulário, inflando
// "palavras estudadas" e sumindo da Revisão.
//
// Aqui resolvemos qualquer texto para a entrada canônica de data/words.js.
// O que não for vocabulário devolve null e vai para `phraseStats`.

import { words } from '../data/words';

export const normalizeKey = (raw) =>
  String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[.!?,;:]+$/, '')  // pontuação de borda: "Good morning!" -> "good morning"
    .replace(/\s+/g, ' ');

// normalizada -> grafia canônica (a de data/words.js)
const canonicalByNormalized = new Map(words.map(w => [normalizeKey(w.en), w.en]));

/** Devolve a grafia canônica da palavra, ou null se não for vocabulário. */
export const resolveWordKey = (raw) =>
  canonicalByNormalized.get(normalizeKey(raw)) ?? null;

export const isVocabulary = (raw) => resolveWordKey(raw) !== null;

/** Junta dois registros de estatística da mesma palavra (usado na migração). */
export const mergeStats = (a, b) => {
  if (!a) return { ...b };
  if (!b) return { ...a };
  return {
    correct: (a.correct || 0) + (b.correct || 0),
    wrong: (a.wrong || 0) + (b.wrong || 0),
    timestamps: [...(a.timestamps || []), ...(b.timestamps || [])].sort((x, y) => x - y),
    lastSeen: Math.max(a.lastSeen || 0, b.lastSeen || 0) || null,
    learned: Boolean(a.learned || b.learned),
  };
};
