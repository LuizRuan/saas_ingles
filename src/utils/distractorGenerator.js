/**
 * Gera distratores ortográfica e foneticamente parecidos para o Jogo da Escuta.
 * Exemplo: para "Noise", gera variações como ["Noises", "Nosis", "Noiz"].
 */
export const generateSimilarDistractors = (targetWordEn, allWords = []) => {
  if (!targetWordEn || typeof targetWordEn !== 'string') return [];

  const target = targetWordEn.trim();
  const lower = target.toLowerCase();
  const candidates = new Set();

  const add = (candidate) => {
    if (!candidate || typeof candidate !== 'string') return;
    const cClean = candidate.trim();
    if (cClean.toLowerCase() !== lower && cClean.length >= 2) {
      // Mantém a primeira letra maiúscula se a palavra original for maiúscula
      const formatted = target[0] === target[0].toUpperCase()
        ? cClean.charAt(0).toUpperCase() + cClean.slice(1)
        : cClean.charAt(0).toLowerCase() + cClean.slice(1);
      candidates.add(formatted);
    }
  };

  // 1. Regras estruturais de sufixo e plural
  if (lower.endsWith('e')) {
    add(target + 's');                            // Noise -> Noises
    add(target.slice(0, -1));                     // Noise -> Nois
    add(target.slice(0, -1) + 'y');               // Noise -> Noisy
    add(target.slice(0, -1) + 'ed');              // Noise -> Noised
    add(target.slice(0, -1) + 'ing');            // Noise -> Noising
    add(target + 'd');                            // Noise -> Noised
  } else if (lower.endsWith('y')) {
    add(target.slice(0, -1) + 'ies');             // Embassy -> Embassies
    add(target.slice(0, -1) + 'ie');              // Embassy -> Embassie
    add(target.slice(0, -1) + 'ey');              // Embassy -> Embasey
    add(target + 's');                            // Embassy -> Embassys
  } else {
    add(target + 's');                            // Planet -> Planets
    add(target + 'e');                            // Planet -> Planete
    add(target + 'ing');                          // Planet -> Planeting
    add(target + 'ed');                           // Planet -> Planeted
  }

  // 2. Substituições fonéticas e ortográficas comuns
  if (lower.includes('s')) add(target.replace(/s/gi, 'z'));        // Noise -> Noize
  if (lower.includes('z')) add(target.replace(/z/gi, 's'));

  if (lower.includes('ss')) add(target.replace(/ss/gi, 's'));      // Embassy -> Embasy
  else if (lower.includes('s')) add(target.replace(/s/gi, 'ss'));  // Noise -> Noisse

  if (lower.includes('ll')) add(target.replace(/ll/gi, 'l'));
  if (lower.includes('pp')) add(target.replace(/pp/gi, 'p'));
  if (lower.includes('tt')) add(target.replace(/tt/gi, 't'));

  // Variações de vogais
  if (lower.includes('oi')) {
    add(target.replace(/oi/gi, 'oy'));                           // Noise -> Noys
    add(target.replace(/oi/gi, 'os'));                           // Noise -> Nosis
    add(target.replace(/oi/gi, 'oiz'));                          // Noise -> Noiz
  }
  if (lower.includes('ea')) {
    add(target.replace(/ea/gi, 'ee'));                           // Beach -> Beech
    add(target.replace(/ea/gi, 'e'));                            // Bread -> Bred
  }
  if (lower.includes('ee')) add(target.replace(/ee/gi, 'ea'));
  if (lower.includes('oo')) add(target.replace(/oo/gi, 'ou'));
  if (lower.includes('c')) add(target.replace(/c/gi, 'k'));
  if (lower.includes('k')) add(target.replace(/k/gi, 'c'));
  if (lower.includes('ph')) add(target.replace(/ph/gi, 'f'));

  // Troca de vogais (e <-> i, a <-> e, y <-> i)
  if (lower.includes('e') && !lower.includes('i')) add(target.replace(/e/gi, 'i')); // Planet -> Planit
  if (lower.includes('i') && !lower.includes('e')) add(target.replace(/i/gi, 'e'));
  if (lower.includes('a')) add(target.replace(/a/gi, 'e'));                          // Planet -> Plenet
  if (lower.includes('y')) add(target.replace(/y/gi, 'i'));                          // Recycling -> Recicling

  // 3. Busca no vocabulário existente por palavras parecidas (mesmo prefixo e tamanho próximo)
  if (Array.isArray(allWords) && allWords.length > 0) {
    const prefix = lower.slice(0, Math.min(2, lower.length));
    const dictMatches = allWords.filter(w => {
      if (!w || !w.en) return false;
      const wEn = w.en.trim().toLowerCase();
      if (wEn === lower) return false;
      return wEn.startsWith(prefix) && Math.abs(wEn.length - lower.length) <= 2;
    });

    for (const match of dictMatches) {
      add(match.en);
    }
  }

  const candidateList = Array.from(candidates);

  // Se mesmo assim tiver menos de 3, gera variações numéricas ou trocas simples
  let fallbackIndex = 1;
  while (candidateList.length < 3) {
    const extra = target + (fallbackIndex === 1 ? 's' : fallbackIndex === 2 ? 'e' : 'ly');
    if (!candidateList.includes(extra) && extra.toLowerCase() !== lower) {
      candidateList.push(extra);
    }
    fallbackIndex++;
  }

  // Embaralha e seleciona 3 distratores
  const shuffled = candidateList.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

/**
 * Gera 4 opções para o Quiz de Tradução, garantindo que os 3 distratores
 * sejam frases estruturalmente ou ortograficamente parecidas com a resposta certa.
 */
export const generateTranslationDistractors = (quiz, allQuizzes = []) => {
  if (!quiz || !quiz.correct) return quiz?.options || [];

  const correct = quiz.correct.trim();
  const direction = quiz.direction || 'pt-en';

  // Se o quiz já possui 4 opções pré-curadas que compartilham palavras (ex: "Good morning/afternoon/night"),
  // mantemos as opções existentes.
  if (Array.isArray(quiz.options) && quiz.options.length === 4) {
    const wordCounts = quiz.options.map(opt => opt.split(' ').length);
    const hasSimilarLength = Math.max(...wordCounts) - Math.min(...wordCounts) <= 3;
    const shareWords = quiz.options.filter(opt => {
      if (opt === correct) return true;
      const optWords = opt.toLowerCase().split(/\s+/);
      const correctWords = correct.toLowerCase().split(/\s+/);
      return optWords.some(w => w.length > 3 && correctWords.includes(w));
    }).length >= 2;

    if (hasSimilarLength && shareWords) {
      return [...quiz.options].sort(() => 0.5 - Math.random());
    }
  }

  const distractors = new Set();
  const wordsInCorrect = correct.split(/\s+/);

  // 1. Procurar no banco por frases com palavras em comum ou da mesma direção
  if (Array.isArray(allQuizzes) && allQuizzes.length > 0) {
    const firstWord = wordsInCorrect[0]?.toLowerCase();
    const matches = allQuizzes.filter(q => {
      if (!q || !q.correct || q.correct === correct) return false;
      if (q.direction !== direction) return false;
      const qWords = q.correct.split(/\s+/);
      const sameStart = qWords[0]?.toLowerCase() === firstWord;
      const commonWords = qWords.filter(w => w.length > 3 && wordsInCorrect.map(x => x.toLowerCase()).includes(w.toLowerCase())).length;
      return sameStart || commonWords >= 1;
    });

    const shuffledMatches = matches.sort(() => 0.5 - Math.random());
    for (const m of shuffledMatches) {
      distractors.add(m.correct);
      if (distractors.size >= 3) break;
    }
  }

  // 2. Substituições sintéticas plausíveis na própria frase
  const substitutionRules = [
    { from: /\bcasts\b/gi, to: 'catches' },
    { from: /\bcasts\b/gi, to: 'cast' },
    { from: /\bshadow\b/gi, to: 'shade' },
    { from: /\bshadow\b/gi, to: 'shadows' },
    { from: /\btree\b/gi, to: 'trees' },
    { from: /\btree\b/gi, to: 'three' },
    { from: /\bunderstand\b/gi, to: 'underline' },
    { from: /\bthis\b/gi, to: 'these' },
    { from: /\bthis\b/gi, to: 'that' },
    { from: /\bword\b/gi, to: 'words' },
    { from: /\bword\b/gi, to: 'world' },
    { from: /\block\b/gi, to: 'look' },
    { from: /\block\b/gi, to: 'block' },
    { from: /\bbalcony\b/gi, to: 'balance' },
    { from: /\bsit\b/gi, to: 'seat' },
    { from: /\bon\b/gi, to: 'in' },
    { from: /\bin\b/gi, to: 'on' },
    { from: /\bdon't\b/gi, to: "can't" },
    { from: /\bhave\b/gi, to: 'had' },
    { from: /\bhas\b/gi, to: 'had' },
    { from: /\btwo\b/gi, to: 'three' },
    { from: /\bbrothers\b/gi, to: 'sisters' },
    { from: /\bbrother\b/gi, to: 'sister' },
    { from: /\bclose\b/gi, to: 'closed' },
    { from: /\bdoor\b/gi, to: 'doors' },
  ];

  for (const rule of substitutionRules) {
    if (distractors.size >= 3) break;
    if (rule.from.test(correct)) {
      const alt = correct.replace(rule.from, rule.to);
      if (alt !== correct) distractors.add(alt);
    }
  }

  // 3. Substituições genéricas se ainda faltarem distratores (trocar artigos ou pluralizar última palavra)
  if (distractors.size < 3) {
    if (/\ba\b/i.test(correct)) distractors.add(correct.replace(/\ba\b/gi, 'the'));
    else if (/\bthe\b/i.test(correct)) distractors.add(correct.replace(/\bthe\b/gi, 'a'));

    const wordsArr = correct.split(' ');
    if (wordsArr.length > 0) {
      const lastWord = wordsArr[wordsArr.length - 1];
      if (!lastWord.endsWith('s') && !lastWord.endsWith('.')) {
        const altLast = wordsArr.slice(0, -1).join(' ') + ' ' + lastWord + 's';
        distractors.add(altLast);
      }
    }
  }

  const list = Array.from(distractors).filter(d => d !== correct);
  const selectedDistractors = list.sort(() => 0.5 - Math.random()).slice(0, 3);

  // Se ainda faltar, busca do banco geral de quizzes da mesma direção
  if (selectedDistractors.length < 3 && Array.isArray(allQuizzes)) {
    const fallback = allQuizzes
      .filter(q => q && q.correct && q.correct !== correct && q.direction === direction && !selectedDistractors.includes(q.correct))
      .map(q => q.correct);
    const shuffledFallback = fallback.sort(() => 0.5 - Math.random());
    selectedDistractors.push(...shuffledFallback.slice(0, 3 - selectedDistractors.length));
  }

  return [correct, ...selectedDistractors].sort(() => 0.5 - Math.random());
};
