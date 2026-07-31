// Espelha o switch(selectedGameType) de src/games/WhoKnowsMore/WhoKnowsMore.jsx
// (linhas ~84-186 na versão atual) — duplicação DELIBERADA, do mesmo jeito que
// backend/utils/validators.js já duplica regras do frontend. Se um mudar
// (tipo de jogo novo, campo de palavra novo), o outro precisa mudar junto —
// não é descuido, está documentado aqui e lá.
//
// A diferença importante para o duelo humano: aqui quem embaralha e decide a
// pergunta é o SERVIDOR, e correctAnswer nunca sai daqui até a rodada fechar
// (serializeQuestionForClient remove esse campo antes de mandar pro cliente).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const words = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'words.json'), 'utf-8'));

export const GAME_TYPE_IDS = [
  'translation', 'trueFalse', 'listening', 'wordBuilder',
  'sentenceBuilder', 'fillBlanks', 'hangman', 'memory',
];

// Fisher-Yates — mesmo algoritmo de src/data/words.js's shuffleArray, mas
// escrito aqui: backend não importa código do frontend em runtime (ver
// scripts/sync-words.mjs para o porquê).
const shuffle = (arr) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const randomInt = (max) => Math.floor(Math.random() * max);

export const pickRandomGameType = () => GAME_TYPE_IDS[randomInt(GAME_TYPE_IDS.length)];

const fourOptions = (correct, wrongPool, pickField) => {
  const wrongs = shuffle(wrongPool).slice(0, 3).map(pickField);
  return shuffle([correct, ...wrongs]);
};

/**
 * Monta uma pergunta completa (com correctAnswer) para um tipo de jogo.
 * `usedIndices` evita repetir a mesma palavra dentro da mesma partida.
 */
export const buildQuestion = (gameType, usedIndices = new Set()) => {
  const available = words
    .map((w, i) => ({ w, i }))
    .filter(({ i }) => !usedIndices.has(i));
  const pool = available.length ? available : words.map((w, i) => ({ w, i }));
  const { w: word, i: index } = pool[randomInt(pool.length)];
  const otherWords = words.filter((_, i) => i !== index);

  switch (gameType) {
    case 'trueFalse': {
      const isTrue = Math.random() < 0.5;
      const displayedPt = isTrue ? word.pt : otherWords[randomInt(otherWords.length)].pt;
      return {
        type: 'trueFalse', wordIndex: index,
        prompt: { en: word.en, pronunciation: word.pronunciation, displayedPt },
        options: ['Verdadeiro', 'Falso'],
        correctAnswer: isTrue ? 'Verdadeiro' : 'Falso',
      };
    }

    case 'wordBuilder': {
      const letters = word.en.toUpperCase().split('');
      let scrambled = shuffle(letters).join(' ');
      if (scrambled === letters.join(' ') && letters.length > 1) {
        scrambled = [...letters].reverse().join(' ');
      }
      return {
        type: 'wordBuilder', wordIndex: index,
        prompt: { scrambledText: scrambled, ptHint: word.pt },
        options: fourOptions(word.en, otherWords, w => w.en),
        correctAnswer: word.en,
      };
    }

    case 'sentenceBuilder': {
      const withSentence = otherWords.filter(w => w.examplePt);
      return {
        type: 'sentenceBuilder', wordIndex: index,
        prompt: { exampleEn: word.example },
        options: fourOptions(word.examplePt, withSentence, w => w.examplePt),
        correctAnswer: word.examplePt,
      };
    }

    case 'fillBlanks': {
      const regex = new RegExp(`\\b${word.en}\\b`, 'gi');
      let blanked = word.example.replace(regex, '_______');
      if (blanked === word.example) {
        const firstWord = word.en.split(' ')[0];
        blanked = word.example.replace(new RegExp(firstWord, 'gi'), '_______');
      }
      return {
        type: 'fillBlanks', wordIndex: index,
        prompt: { blankedSentence: blanked, examplePt: word.examplePt },
        options: fourOptions(word.en, otherWords, w => w.en),
        correctAnswer: word.en,
      };
    }

    case 'hangman': {
      return {
        type: 'hangman', wordIndex: index,
        prompt: { tip: word.tip },
        options: fourOptions(word.en, otherWords, w => w.en),
        correctAnswer: word.en,
      };
    }

    case 'memory': {
      return {
        type: 'memory', wordIndex: index,
        prompt: { en: word.en, pronunciation: word.pronunciation },
        options: fourOptions(word.pt, otherWords, w => w.pt),
        correctAnswer: word.pt,
      };
    }

    case 'listening':
    case 'translation':
    default: {
      return {
        type: gameType, wordIndex: index,
        prompt: { en: word.en, pronunciation: word.pronunciation },
        options: fourOptions(word.pt, otherWords, w => w.pt),
        correctAnswer: word.pt,
      };
    }
  }
};

// O que o cliente recebe: nunca correctAnswer, nem wordIndex (interno).
// Para memory online, inclui wordGroup (array de { en, pt, pronunciation }).
export const serializeQuestionForClient = (question) => {
  const base = {
    type: question.type,
    prompt: question.prompt,
    options: question.options,
  };
  // Memory online usa wordGroup em vez de options
  if (question.wordGroup) base.wordGroup = question.wordGroup;
  return base;
};

/**
 * Gera uma questão diferente para cada jogador, do mesmo tipo.
 * Garante que jogador B não receba a mesma palavra que A.
 */
export const buildQuestionPerPlayer = (gameType, usedA, usedB) => {
  const questionA = buildQuestion(gameType, usedA);
  // Exclui a palavra sorteada para A do pool de B
  const usedBExtended = new Set([...usedB, questionA.wordIndex]);
  const questionB = buildQuestion(gameType, usedBExtended);
  return { questionA, questionB };
};

/**
 * Memory online: sorteia 4 palavras distintas para cada jogador.
 * As palavras de A e B não se repetem entre si.
 */
export const buildMemoryGroupPerPlayer = (usedA, usedB) => {
  const available = words.map((w, i) => ({ w, i }));

  const poolA = shuffle(available.filter(({ i }) => !usedA.has(i)));
  const groupA = poolA.slice(0, 4);
  const indicesA = new Set(groupA.map(g => g.i));

  // B não usa as palavras de A nem as já usadas por B
  const poolB = shuffle(available.filter(({ i }) => !usedB.has(i) && !indicesA.has(i)));
  const groupB = poolB.slice(0, 4);

  const toWordGroup = (group) => group.map(g => ({
    en: g.w.en, pt: g.w.pt, pronunciation: g.w.pronunciation,
  }));

  return {
    questionA: {
      type: 'memory',
      wordGroup: toWordGroup(groupA),
      wordIndices: groupA.map(g => g.i),
      correctAnswer: 'completed', // quem submeter 'completed' primeiro ganha
    },
    questionB: {
      type: 'memory',
      wordGroup: toWordGroup(groupB),
      wordIndices: groupB.map(g => g.i),
      correctAnswer: 'completed',
    },
  };
};

