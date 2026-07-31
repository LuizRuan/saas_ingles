// Sistema de conquistas
export const achievementsList = [
  { id: "first_word", title: "Primeira Palavra", description: "Estudou sua primeira palavra", icon: "🌟", condition: (p) => p.wordsStudied >= 1 },
  { id: "ten_correct", title: "Dez Acertos!", description: "Acertou 10 respostas", icon: "🎯", condition: (p) => p.totalCorrect >= 10 },
  { id: "five_streak", title: "Sequência de 5", description: "5 acertos seguidos", icon: "🔥", condition: (p) => p.bestStreak >= 5 },
  { id: "first_sentence", title: "Primeira Frase", description: "Completou sua primeira frase", icon: "📝", condition: (p) => p.sentencesCompleted >= 1 },
  { id: "first_conversation", title: "Primeira Conversa", description: "Completou uma conversa", icon: "💬", condition: (p) => p.conversationsCompleted >= 1 },
  { id: "ten_words", title: "10 Palavras!", description: "Estudou 10 palavras diferentes", icon: "📗", condition: (p) => p.wordsStudied >= 10 },
  { id: "fifty_words", title: "Explorador de Palavras", description: "Estudou 50 palavras", icon: "📖", condition: (p) => p.wordsStudied >= 50 },
  { id: "hundred_words", title: "Colecionador", description: "Estudou 100 palavras", icon: "📚", condition: (p) => p.wordsStudied >= 100 },
  { id: "three_days", title: "3 Dias Seguidos!", description: "Estudou 3 dias consecutivos", icon: "📅", condition: (p) => p.dayStreak >= 3 },
  { id: "seven_days", title: "Uma Semana!", description: "Estudou 7 dias consecutivos", icon: "🗓️", condition: (p) => p.dayStreak >= 7 },
  { id: "memory_master", title: "Mestre da Memória", description: "Completou 5 jogos da memória", icon: "🧠", condition: (p) => (p.gamesCompleted?.memory || 0) >= 5 },
  { id: "hangman_master", title: "Mestre da Forca", description: "Completou 5 jogos da forca", icon: "🎪", condition: (p) => (p.gamesCompleted?.hangman || 0) >= 5 },
  { id: "daily_first", title: "Desafio Aceito", description: "Completou seu primeiro desafio diário", icon: "⚡", condition: (p) => p.dailyChallengesCompleted >= 1 },
  { id: "hundred_correct", title: "Centenário", description: "Acertou 100 respostas", icon: "💯", condition: (p) => p.totalCorrect >= 100 },
  { id: "ten_streak", title: "Imparável!", description: "10 acertos seguidos", icon: "⚡", condition: (p) => p.bestStreak >= 10 },
  { id: "level_5", title: "Nível 5!", description: "Alcançou o nível 5", icon: "🏅", condition: (p) => p.currentLevel >= 5 },
  { id: "all_categories", title: "Explorador Total", description: "Estudou palavras de todas as categorias", icon: "🌈", condition: (p) => (p.categoriesExplored || 0) >= 10 },
  { id: "review_hero", title: "Herói da Revisão", description: "Revisou 20 palavras", icon: "🔄", condition: (p) => p.wordsReviewed >= 20 },
  { id: "five_hundred_points", title: "500 Pontos!", description: "Alcançou 500 pontos", icon: "🏆", condition: (p) => p.totalScore >= 500 },
  { id: "first_game", title: "Primeiro Jogo!", description: "Completou seu primeiro jogo", icon: "🎮", condition: (p) => Object.values(p.gamesCompleted || {}).some(v => v >= 1) },
  { id: "shopaholic", title: "Comprador!", description: "Fez sua primeira compra na loja", icon: "🛒", condition: (p) => (p.shopPurchases || 0) >= 1 },

  // Vocabulário
  { id: "words_150", title: "Vocabulário Rico", description: "Estudou 150 palavras", icon: "📘", condition: (p) => p.wordsStudied >= 150 },
  { id: "words_200", title: "Quase Poliglota", description: "Estudou 200 palavras", icon: "🪐", condition: (p) => p.wordsStudied >= 200 },
  { id: "learned_10", title: "Primeiras Conquistas", description: "Dominou 10 palavras (3 acertos em dias diferentes)", icon: "🎓", condition: (p) => (p.wordsLearned || 0) >= 10 },
  { id: "learned_50", title: "Vocabulário Sólido", description: "Dominou 50 palavras", icon: "🏗️", condition: (p) => (p.wordsLearned || 0) >= 50 },
  { id: "learned_100", title: "Mestre do Vocabulário", description: "Dominou 100 palavras", icon: "🏛️", condition: (p) => (p.wordsLearned || 0) >= 100 },

  // Acertos
  { id: "correct_250", title: "Máquina de Acertos", description: "Acertou 250 respostas", icon: "💥", condition: (p) => p.totalCorrect >= 250 },
  { id: "correct_500", title: "Meio Milhar", description: "Acertou 500 respostas", icon: "💫", condition: (p) => p.totalCorrect >= 500 },

  // Sequências
  { id: "streak_15", title: "Em Chamas", description: "15 acertos seguidos", icon: "🌪️", condition: (p) => p.bestStreak >= 15 },
  { id: "streak_25", title: "Lendário", description: "25 acertos seguidos", icon: "🌠", condition: (p) => p.bestStreak >= 25 },
  { id: "days_14", title: "Duas Semanas!", description: "Estudou 14 dias consecutivos", icon: "📆", condition: (p) => p.dayStreak >= 14 },
  { id: "days_30", title: "Um Mês Inteiro!", description: "Estudou 30 dias consecutivos", icon: "🌕", condition: (p) => p.dayStreak >= 30 },

  // Pontuação
  { id: "points_2500", title: "Rico em Estrelas", description: "Alcançou 2.500 pontos", icon: "💎", condition: (p) => p.totalScore >= 2500 },
  { id: "points_10000", title: "Fortuna Estelar", description: "Alcançou 10.000 pontos", icon: "👑", condition: (p) => p.totalScore >= 10000 },

  // Frases e conversas
  { id: "sentences_10", title: "Construtor de Frases", description: "Completou 10 frases", icon: "🧱", condition: (p) => p.sentencesCompleted >= 10 },
  { id: "sentences_50", title: "Mestre das Frases", description: "Completou 50 frases", icon: "📜", condition: (p) => p.sentencesCompleted >= 50 },
  { id: "conversations_5", title: "Bom de Papo", description: "Completou 5 conversas", icon: "🗨️", condition: (p) => p.conversationsCompleted >= 5 },
  { id: "conversations_18", title: "Todas as Conversas", description: "Completou todos os diálogos disponíveis", icon: "🎭", condition: (p) => p.conversationsCompleted >= 18 },

  // Desafio diário e revisão
  { id: "daily_7", title: "Semana de Desafios", description: "Completou 7 desafios diários", icon: "🗝️", condition: (p) => p.dailyChallengesCompleted >= 7 },
  { id: "daily_30", title: "Um Mês de Desafios", description: "Completou 30 desafios diários", icon: "🏵️", condition: (p) => p.dailyChallengesCompleted >= 30 },
  { id: "review_50", title: "Revisor Dedicado", description: "Revisou 50 palavras", icon: "🧭", condition: (p) => p.wordsReviewed >= 50 },
  { id: "review_100", title: "Mestre da Revisão", description: "Revisou 100 palavras", icon: "🔍", condition: (p) => p.wordsReviewed >= 100 },

  // Nível
  { id: "level_max", title: "Mestre Iniciante", description: "Alcançou o nível máximo", icon: "🥇", condition: (p) => p.currentLevel >= 10 },

  // Um "mestre" para cada jogo restante do catálogo
  { id: "wordbuilder_master", title: "Mestre das Palavras", description: "Completou 5 jogos de Montar Palavras", icon: "🔤", condition: (p) => (p.gamesCompleted?.wordBuilder || 0) >= 5 },
  { id: "sentencebuilder_master", title: "Mestre da Construção", description: "Completou 5 jogos de Montar Frases", icon: "🧵", condition: (p) => (p.gamesCompleted?.sentenceBuilder || 0) >= 5 },
  { id: "translation_master", title: "Mestre da Tradução", description: "Completou 5 jogos de Tradução", icon: "🌐", condition: (p) => (p.gamesCompleted?.translation || 0) >= 5 },
  { id: "fillblanks_master", title: "Mestre das Lacunas", description: "Completou 5 jogos de Completar Frases", icon: "✍️", condition: (p) => (p.gamesCompleted?.fillBlanks || 0) >= 5 },
  { id: "truefalse_master", title: "Mestre do V ou F", description: "Completou 5 jogos de Verdadeiro ou Falso", icon: "✅", condition: (p) => (p.gamesCompleted?.trueFalse || 0) >= 5 },
  { id: "listening_master", title: "Mestre da Escuta", description: "Completou 5 jogos de Escuta", icon: "🎧", condition: (p) => (p.gamesCompleted?.listening || 0) >= 5 },
  { id: "duel_master", title: "Mestre dos Duelos", description: "Completou 5 partidas de Quem Sabe Mais?", icon: "⚔️", condition: (p) => (p.gamesCompleted?.whoKnowsMore || 0) >= 5 },
];
