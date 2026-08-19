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

// Mascara letras A-Z como '#', preservando espaço e pontuação (a FORMA da
// palavra, nunca o conteúdo) — usado pelo Forca online pra desenhar os
// espaços em branco sem revelar nenhuma letra.
export const maskWord = (word) => word.replace(/[A-Za-z]/g, '#');

// Nem toda entrada do banco serve para todo tipo de jogo.
const ELEGIVEL_POR_TIPO = {
  // Embaralhar letras só faz sentido numa palavra ÚNICA. Com "Good morning" o
  // split('') incluía o ESPAÇO como se fosse mais uma letra, e o embaralhado
  // saía "G o o d   m o r n i n g" — um bloco em branco no meio das peças,
  // que ainda por cima entrega onde termina a primeira palavra. 63 das 400
  // entradas do banco do duelo (15,8%) têm espaço, então isso caía em cerca de
  // uma a cada seis rodadas de wordBuilder. O jogo equivalente no cliente
  // (src/games/WordBuilder) sempre filtrou assim.
  wordBuilder: (w) => !w.en.includes(' ') && w.en.length >= 3,
};

/**
 * Monta uma pergunta completa (com correctAnswer) para um tipo de jogo.
 * `usedIndices` evita repetir a mesma palavra dentro da mesma partida.
 */
export const buildQuestion = (gameType, usedIndices = new Set()) => {
  const elegivel = ELEGIVEL_POR_TIPO[gameType] || (() => true);
  const todasElegiveis = words
    .map((w, i) => ({ w, i }))
    .filter(({ w }) => elegivel(w));
  const available = todasElegiveis.filter(({ i }) => !usedIndices.has(i));
  // O fallback repete uma palavra já usada, mas NUNCA quebra a elegibilidade:
  // voltar pro banco inteiro aqui traria de volta as palavras com espaço.
  const pool = available.length ? available : todasElegiveis;
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
      // Garante que a palavra tem examplePt — sem isso correctAnswer seria undefined
      const withSentence = words
        .map((w, i) => ({ w, i }))
        .filter(({ w, i }) => !usedIndices.has(i) && w.examplePt && w.example);
      const sentPool = withSentence.length ? withSentence : words
        .map((w, i) => ({ w, i }))
        .filter(({ w }) => w.examplePt && w.example);
      if (!sentPool.length) break; // fallback never reached with current data
      const { w: sentWord, i: sentIdx } = sentPool[randomInt(sentPool.length)];
      const sentOthers = words.filter((_, i) => i !== sentIdx && words[i]?.examplePt);
      return {
        type: 'sentenceBuilder', wordIndex: sentIdx,
        prompt: { exampleEn: sentWord.example },
        options: fourOptions(sentWord.examplePt, sentOthers, w => w.examplePt),
        correctAnswer: sentWord.examplePt,
      };
    }

    case 'fillBlanks': {
      // Garante que a palavra tem example — sem isso .replace() em undefined crasharia
      const withExample = words
        .map((w, i) => ({ w, i }))
        .filter(({ w, i }) => !usedIndices.has(i) && w.example && !w.en.includes(' '));
      const fbPool = withExample.length ? withExample : words
        .map((w, i) => ({ w, i }))
        .filter(({ w }) => w.example && !w.en.includes(' '));
      if (!fbPool.length) break;
      const { w: fbWord, i: fbIdx } = fbPool[randomInt(fbPool.length)];
      const fbOthers = words.filter((_, i) => i !== fbIdx);
      const fbRegex = new RegExp(`\\b${fbWord.en}\\b`, 'gi');
      let fbBlanked = fbWord.example.replace(fbRegex, '_______');
      if (fbBlanked === fbWord.example) {
        const firstWord = fbWord.en.split(' ')[0];
        fbBlanked = fbWord.example.replace(new RegExp(firstWord, 'gi'), '_______');
      }
      return {
        type: 'fillBlanks', wordIndex: fbIdx,
        prompt: { blankedSentence: fbBlanked, examplePt: fbWord.examplePt },
        options: fourOptions(fbWord.en, fbOthers, w => w.en),
        correctAnswer: fbWord.en,
      };
    }

    case 'hangman': {
      return {
        type: 'hangman', wordIndex: index,
        prompt: { tip: word.tip, wordTemplate: maskWord(word.en) },
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
  };
  // Hangman não tem options (ver maskWord) — só inclui a chave quando existe,
  // pra não deixar `options: undefined` pendurado no objeto.
  if (question.options) base.options = question.options;
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

