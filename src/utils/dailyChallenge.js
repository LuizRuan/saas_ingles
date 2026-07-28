// Geração determinística do desafio diário
// Mesma seed por dia = mesmas atividades, na mesma ordem, com as mesmas
// alternativas. Tudo que o usuário vê é decidido aqui, nunca no render —
// caso contrário as alternativas se reembaralham a cada re-render.

const getDaySeed = () => {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
};

// Simple seeded random
const seededRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

// Fisher-Yates com RNG semeado. Não use `sort(() => rng() - 0.5)`: um
// comparador inconsistente não embaralha de forma uniforme.
const seededShuffle = (rng, arr) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// 1 resposta certa + 3 distratores, em ordem determinística
const buildOptions = (rng, answer, pool) => {
  if (!answer) return [];

  const distractors = [];
  const seen = new Set([answer.en]);

  // O guard evita laço infinito se o acervo for menor que 4 palavras
  for (let guard = 0; distractors.length < 3 && guard < pool.length * 4; guard++) {
    const candidate = pool[Math.floor(rng() * pool.length)];
    if (candidate && !seen.has(candidate.en)) {
      seen.add(candidate.en);
      distractors.push(candidate);
    }
  }

  return seededShuffle(rng, [answer, ...distractors]);
};

export const generateDailyChallenge = (words) => {
  const seed = getDaySeed();
  const rng = seededRandom(seed);
  const shuffled = seededShuffle(rng, words);

  if (shuffled.length === 0) {
    return { date: new Date().toDateString(), seed, challenges: [], completed: false };
  }

  // Dá a volta no acervo: garante palavra definida mesmo com banco pequeno.
  const at = (i) => shuffled[i % shuffled.length];

  const specs = [
    {
      type: 'memory',
      title: 'Jogo da Memória',
      description: 'Encontre a palavra em inglês',
      icon: '🃏',
      words: [at(0), at(1), at(2)],
      goal: 3,
    },
    {
      type: 'hangman',
      title: 'Jogo da Forca',
      description: 'Descubra a palavra secreta',
      icon: '🎯',
      words: [at(3)],
      goal: 1,
    },
    {
      type: 'sentenceBuilder',
      title: 'Montar Frase',
      description: 'Escolha a palavra correta',
      icon: '📝',
      words: [at(8)],
      goal: 1,
    },
    {
      type: 'translation',
      title: 'Tradução',
      description: 'Traduza a palavra',
      icon: '🔄',
      words: [at(4), at(5)],
      goal: 2,
    },
    {
      type: 'trueFalse',
      title: 'Verdadeiro ou Falso',
      description: 'Escolha a tradução certa',
      icon: '✅',
      words: [at(6), at(7)],
      goal: 2,
    },
  ];

  // `answer` é a palavra cobrada no passo; `options` já vem embaralhado.
  const challenges = specs.map(spec => {
    const answer = spec.words[0];
    return { ...spec, answer, options: buildOptions(rng, answer, shuffled) };
  });

  return {
    date: new Date().toDateString(),
    seed,
    challenges,
    completed: false,
  };
};

export const isDailyChallengeCompleted = (progress) => {
  const today = new Date().toDateString();
  return progress.lastDailyChallengeDate === today;
};

export const getTodayDateString = () => {
  return new Date().toDateString();
};
