// Chave canônica do progresso.
//
// Os jogos gravavam o que tinham em mãos: MemoryGame passava "Good morning",
// TranslationQuiz passava "Good morning!" e FillBlanks passava "blue" — três
// grafias do mesmo item, contadas como itens diferentes. Pior: frases inteiras
// ("I am happy.") entravam no mesmo balde do vocabulário, inflando
// "palavras estudadas" e sumindo da Revisão.
//
// Aqui resolvemos qualquer texto para a entrada canônica do banco de palavras
// DO CURSO ATIVO. O que não for vocabulário devolve null e vai para
// `phraseStats`.
//
// Por que o curso importa: antes este módulo importava só o banco de inglês.
// Quem estudasse espanhol respondia "Hola", resolveWordKey não achava no banco
// inglês, devolvia null, e a resposta caía em phraseStats — ou seja,
// `wordsStudied` nunca subia, o nível nunca subia e nenhuma conquista disparava.
// O curso inteiro parecia funcionar e não registrava nada.
//
// Nota de nomenclatura: `word.en` guarda o texto no IDIOMA-ALVO em todos os
// cursos (em es-pt, `en: "Hola"`). O nome do campo ficou de quando só existia
// inglês; trocá-lo exigiria reescrever os 1000 registros e todos os jogos.

import { getWords } from '../data/index';

export const DEFAULT_COURSE = 'en-pt';

export const normalizeKey = (raw) =>
  String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[.!?,;:¡¿]+$/, '')  // pontuação de borda: "Good morning!" -> "good morning"
    .replace(/^[¡¿]+/, '')        // espanhol abre com ¡/¿: "¿Cómo estás?" -> "cómo estás"
    .replace(/\s+/g, ' ');

// Um mapa (normalizada -> grafia canônica) por curso, construído sob demanda e
// memoizado. Os bancos são constantes de módulo, então o mapa nunca invalida.
const mapsByCourse = new Map();

const getCanonicalMap = (courseId) => {
  const id = courseId || DEFAULT_COURSE;
  let map = mapsByCourse.get(id);
  if (!map) {
    map = new Map(getWords(id).map(w => [normalizeKey(w.en), w.en]));
    mapsByCourse.set(id, map);
  }
  return map;
};

/** Devolve a grafia canônica da palavra no curso dado, ou null se não for vocabulário. */
export const resolveWordKey = (raw, courseId = DEFAULT_COURSE) =>
  getCanonicalMap(courseId).get(normalizeKey(raw)) ?? null;

export const isVocabulary = (raw, courseId = DEFAULT_COURSE) =>
  resolveWordKey(raw, courseId) !== null;

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
    // lastResult vem de quem tem o lastSeen mais recente — é o que
    // getWordsToReview usa pra saber se a resposta mais recente foi um acerto.
    lastResult: (a.lastSeen || 0) >= (b.lastSeen || 0) ? a.lastResult : b.lastResult,
  };
};
