/**
 * Utilitário de Comparação e Avaliação de Pronúncia Palavra por Palavra
 */

// Normaliza texto removendo pontuações e convertendo para minúsculas
export const normalizeText = (text = '') => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"¡!¿]/g, '') // remove pontuação
    .trim();
};

// Calcula a similaridade entre duas palavras simples
const isWordMatch = (wordA, wordB) => {
  const normA = normalizeText(wordA);
  const normB = normalizeText(wordB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  // Tolerância para pequena variação fonética / erro de digitação (Levenshtein simples)
  if (Math.abs(normA.length - normB.length) <= 1) {
    let diff = 0;
    const len = Math.min(normA.length, normB.length);
    for (let i = 0; i < len; i++) {
      if (normA[i] !== normB[i]) diff++;
    }
    return diff <= 1;
  }
  return false;
};

export const evaluatePronunciation = (transcript = '', targetText = '') => {
  const targetWords = targetText.split(/\s+/).filter(Boolean);
  const spokenWords = normalizeText(transcript).split(/\s+/).filter(Boolean);

  if (!targetWords.length) {
    return { score: 0, feedback: 'Tente falar novamente 🎙️', wordResults: [] };
  }

  let matchedCount = 0;
  const wordResults = targetWords.map((word) => {
    const isMatched = spokenWords.some((spoken) => isWordMatch(word, spoken));
    if (isMatched) {
      matchedCount++;
      return { word, status: 'correct' }; // verde
    }
    return { word, status: 'missing' }; // vermelho
  });

  const score = Math.round((matchedCount / targetWords.length) * 100);

  let feedback = 'Tente falar novamente 🎙️';
  let badge = 'need_practice';

  if (score >= 90) {
    feedback = 'Excelente pronúncia! 🌟';
    badge = 'excellent';
  } else if (score >= 70) {
    feedback = 'Boa pronúncia! 👏';
    badge = 'good';
  }

  return {
    score,
    feedback,
    badge,
    wordResults,
    transcript
  };
};
