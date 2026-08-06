import { sentences as sentencesData, fillBlanks as fillBlanksData } from '../data/sentences';

/**
 * Retorna a data no fuso horário de Brasília (America/Sao_Paulo / UTC-3).
 * Garante renovação estrita às 00:00 BRT para todos os usuários.
 */
export const getTodayDateString = () => {
  try {
    const options = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(new Date());
    const y = parts.find(p => p.type === 'year').value;
    const m = parts.find(p => p.type === 'month').value;
    const d = parts.find(p => p.type === 'day').value;
    return `${y}-${m}-${d}`;
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

const getDaySeed = () => {
  try {
    const options = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(new Date());
    const y = parseInt(parts.find(p => p.type === 'year').value, 10);
    const m = parseInt(parts.find(p => p.type === 'month').value, 10);
    const d = parseInt(parts.find(p => p.type === 'day').value, 10);
    return y * 10000 + m * 100 + d;
  } catch (e) {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }
};

// Gerador pseudo-aleatório semeado (Linear Congruential Generator)
const seededRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

// Embaralhamento Fisher-Yates determinístico
const seededShuffle = (rng, arr) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// Auxiliar para montar 4 opções (1 certa + 3 erradas)
const buildOptions = (rng, answer, pool) => {
  if (!answer) return [];
  const distractors = [];
  const seen = new Set([answer.en]);

  for (let guard = 0; distractors.length < 3 && guard < pool.length * 4; guard++) {
    const candidate = pool[Math.floor(rng() * pool.length)];
    if (candidate && !seen.has(candidate.en)) {
      seen.add(candidate.en);
      distractors.push(candidate);
    }
  }

  return seededShuffle(rng, [answer, ...distractors]);
};

// Modalidades de jogos disponíveis para o Desafio Diário
const ALL_GAME_MODES = [
  {
    type: 'listening',
    title: 'Escuta',
    description: 'Escute com atenção e descubra a palavra falada',
    icon: '🎧',
  },
  {
    type: 'memory',
    title: 'Jogo da Memória',
    description: 'Encontre os 3 pares correspondentes virando as cartas',
    icon: '🃏',
  },
  {
    type: 'hangman',
    title: 'Jogo da Forca',
    description: 'Descubra a palavra com o teclado antes do boneco ser enforcado',
    icon: '🎯',
  },
  {
    type: 'wordBuilder',
    title: 'Montar Palavra',
    description: 'Ordene as peças de letras para formar a palavra correta',
    icon: '🔤',
  },
  {
    type: 'sentenceBuilder',
    title: 'Montar Frase',
    description: 'Ordene os blocos de palavras para formar a frase em inglês',
    icon: '🧩',
  },
  {
    type: 'trueFalse',
    title: 'Verdadeiro ou Falso',
    description: 'Responda rápido se a tradução proposta está certa ou errada',
    icon: '⚡',
  },
  {
    type: 'fillBlanks',
    title: 'Completar Lacunas',
    description: 'Escolha a palavra certa para completar a frase',
    icon: '✏️',
  },
  {
    type: 'translation',
    title: 'Quiz de Tradução',
    description: 'Escolha a tradução correta para a palavra exibida',
    icon: '🔄',
  },
];

/**
 * Gera as 5 etapas do Desafio Diário com modos aleatórios semeados pela data.
 * Regra: gameTypes[i] !== gameTypes[i-1] (sem jogos repetidos em etapas seguidas).
 */
export const generateDailyChallenge = (words) => {
  const seed = getDaySeed();
  const rng = seededRandom(seed);

  const shuffledWords = seededShuffle(rng, words.filter(w => w.en && w.pt && !w.en.includes(' ') && w.en.length >= 3));
  const shuffledSentences = seededShuffle(rng, sentencesData || []);
  const shuffledFillBlanks = seededShuffle(rng, fillBlanksData || []);

  // Seleciona 5 modos de jogo sem repetição consecutiva
  const selectedModes = [];
  for (let i = 0; i < 5; i++) {
    const previousType = selectedModes[i - 1]?.type;
    const candidates = ALL_GAME_MODES.filter(m => m.type !== previousType);
    const chosenMode = candidates[Math.floor(rng() * candidates.length)];
    selectedModes.push(chosenMode);
  }

  let wordIndex = 0;
  let sentenceIndex = 0;
  let fillBlankIndex = 0;

  const challenges = selectedModes.map((mode, stepIdx) => {
    let payload = {};

    switch (mode.type) {
      case 'memory': {
        // Pega 3 palavras para formar 6 cartas (3 pares)
        const pairWords = [
          shuffledWords[wordIndex % shuffledWords.length],
          shuffledWords[(wordIndex + 1) % shuffledWords.length],
          shuffledWords[(wordIndex + 2) % shuffledWords.length],
        ];
        wordIndex += 3;
        payload = {
          words: pairWords,
          answer: pairWords[0], // Usada para a explicação pedagógica ao final
        };
        break;
      }
      case 'hangman': {
        const targetWord = shuffledWords[wordIndex % shuffledWords.length];
        wordIndex += 1;
        payload = {
          answer: targetWord,
          word: targetWord,
        };
        break;
      }
      case 'wordBuilder': {
        const targetWord = shuffledWords[wordIndex % shuffledWords.length];
        wordIndex += 1;
        payload = {
          answer: targetWord,
          word: targetWord,
        };
        break;
      }
      case 'sentenceBuilder': {
        const sentenceObj = shuffledSentences[sentenceIndex % shuffledSentences.length] || {
          en: 'I love English.', pt: 'Eu amo inglês.', words: [{ en: 'I', pt: 'Eu' }, { en: 'love', pt: 'amo' }, { en: 'English', pt: 'inglês' }]
        };
        sentenceIndex += 1;
        payload = {
          sentence: sentenceObj,
          answer: { en: sentenceObj.en, pt: sentenceObj.pt, tip: sentenceObj.grammar || 'Ordene as palavras em inglês.' },
        };
        break;
      }
      case 'trueFalse': {
        const targetWord = shuffledWords[wordIndex % shuffledWords.length];
        wordIndex += 1;
        const isTrue = rng() > 0.5;
        let displayPt = targetWord.pt;
        if (!isTrue) {
          const wrongCandidate = shuffledWords.find(w => w.en !== targetWord.en);
          if (wrongCandidate) displayPt = wrongCandidate.pt;
        }
        payload = {
          answer: targetWord,
          displayPt,
          isTrue,
        };
        break;
      }
      case 'fillBlanks': {
        const fillObj = shuffledFillBlanks[fillBlankIndex % shuffledFillBlanks.length] || {
          sentence: 'I ___ water.', answer: 'need', options: ['need', 'run', 'blue', 'cat']
        };
        fillBlankIndex += 1;
        payload = {
          fillObj,
          answer: { en: fillObj.answer, pt: `Resposta da lacuna: ${fillObj.answer}` },
          options: seededShuffle(rng, [...fillObj.options]),
        };
        break;
      }
      case 'listening': {
        const targetWord = shuffledWords[wordIndex % shuffledWords.length];
        wordIndex += 1;
        const options = buildOptions(rng, targetWord, shuffledWords);
        payload = {
          answer: targetWord,
          options,
        };
        break;
      }
      case 'translation':
      default: {
        const targetWord = shuffledWords[wordIndex % shuffledWords.length];
        wordIndex += 1;
        const options = buildOptions(rng, targetWord, shuffledWords);
        payload = {
          answer: targetWord,
          options,
        };
        break;
      }
    }

    return {
      stepIndex: stepIdx + 1,
      ...mode,
      ...payload,
    };
  });

  return {
    date: getTodayDateString(),
    seed,
    challenges,
    completed: false,
  };
};

export const isDailyChallengeCompleted = (progress) => {
  const today = getTodayDateString();
  return progress.lastDailyChallengeDate === today;
};
