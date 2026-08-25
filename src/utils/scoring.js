// Sistema de pontuação — nunca subtrai pontos

export const POINTS = {
  FIRST_TRY: 10,
  SECOND_TRY: 5,
  WITH_HINT: 3,
  STREAK_BONUS: 20,       // 5 acertos seguidos
  PHASE_COMPLETION: 50,   // Conclusão de uma fase/rodada padrão
  DAILY_CHALLENGE: 200,   // Completar desafio diário (5 etapas de 20 pts + 200 bônus = 300 total)
};

// Recompensas específicas por jogo / atividade
export const GAME_REWARDS = {
  // Forca: 100 pts da palavra (50 se com erros) + 500 bônus de conclusão = 600 total
  hangman: {
    perfect: 100,
    imperfect: 50,
    completion: 500,
  },
  // Completar Frases: 10 rodadas x 20 pts + 100 bônus de conclusão = 300 total
  fillBlanks: {
    perQuestion: 20,
    completion: 100,
  },
  // Montar Frases: 5 frases x 20 pts + 100 bônus de conclusão = 200 total
  sentenceBuilder: {
    perSentence: 20,
    completion: 100,
  },
  // Montar Palavras: 8 rodadas x 50 pts (15 c/ dica) + 100 bônus de conclusão = 500 total
  wordBuilder: {
    perWord: 50,
    withHint: 15,
    completion: 100,
  },
  // Desafio Diário: 5 etapas x 20 pts + 200 bônus diário = 300 total
  dailyChallenge: {
    perStep: 20,
    completion: 200,
  },
  // Revisão de Erros: 50 pts por palavra ou frase corrigida
  review: {
    perItem: 50,
  },
};

export const calculatePoints = (attempt, usedHint = false, pointsOverride = null) => {
  if (pointsOverride !== null && typeof pointsOverride === 'number') {
    return pointsOverride;
  }
  if (usedHint) return POINTS.WITH_HINT;
  if (attempt === 1) return POINTS.FIRST_TRY;
  if (attempt === 2) return POINTS.SECOND_TRY;
  return POINTS.WITH_HINT;
};

export const checkStreakBonus = (currentStreak) => {
  if (currentStreak > 0 && currentStreak % 5 === 0) {
    return POINTS.STREAK_BONUS;
  }
  return 0;
};

// Format score with + sign for display
export const formatScore = (points) => {
  return `+${points}`;
};

