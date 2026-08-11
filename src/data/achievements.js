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
  { id: "wordbuilder_master", title: "Mestre das Palavras", description: "Completou 5 jogos de Montar Palavras", icon: "🔤", condition: (p) => (p.gamesCompleted?.wordBuilder || 0) >= 5 },
  { id: "sentencebuilder_master", title: "Mestre da Construção", description: "Completou 5 jogos de Montar Frases", icon: "🧵", condition: (p) => (p.gamesCompleted?.sentenceBuilder || 0) >= 5 },
  { id: "translation_master", title: "Mestre da Tradução", description: "Completou 5 jogos de Tradução", icon: "🌐", condition: (p) => (p.gamesCompleted?.translation || 0) >= 5 },
  { id: "fillblanks_master", title: "Mestre das Lacunas", description: "Completou 5 jogos de Completar Frases", icon: "✍️", condition: (p) => (p.gamesCompleted?.fillBlanks || 0) >= 5 },
  { id: "truefalse_master", title: "Mestre do V ou F", description: "Completou 5 jogos de Verdadeiro ou Falso", icon: "✅", condition: (p) => (p.gamesCompleted?.trueFalse || 0) >= 5 },
  { id: "listening_master", title: "Mestre da Escuta", description: "Completou 5 jogos de Escuta", icon: "🎧", condition: (p) => (p.gamesCompleted?.listening || 0) >= 5 },
  { id: "duel_master", title: "Mestre dos Duelos", description: "Completou 5 partidas de Quem Sabe Mais?", icon: "⚔️", condition: (p) => (p.gamesCompleted?.whoKnowsMore || 0) >= 5 },
  { id: "imagequiz_master", title: "Olho Clínico", description: "Completou 5 jogos do Jogo da Imagem", icon: "🖼️", condition: (p) => (p.gamesCompleted?.imageQuiz || 0) >= 5 },

  // ===== Vocabulário — novos marcos com 1000 palavras =====
  { id: "words_300", title: "Vocabulário em Expansão", description: "Estudou 300 palavras", icon: "📙", condition: (p) => p.wordsStudied >= 300 },
  { id: "words_500", title: "Meio Milhar de Palavras", description: "Estudou 500 palavras", icon: "📦", condition: (p) => p.wordsStudied >= 500 },
  { id: "words_600", title: "Enciclopédia Viva", description: "Estudou 600 palavras", icon: "📔", condition: (p) => p.wordsStudied >= 600 },
  { id: "words_750", title: "Vocabulário Vastíssimo", description: "Estudou 750 palavras", icon: "🗃️", condition: (p) => p.wordsStudied >= 750 },
  { id: "words_850", title: "Quase Onisciente", description: "Estudou 850 palavras", icon: "🧿", condition: (p) => p.wordsStudied >= 850 },
  { id: "words_950", title: "Última Fronteira do Vocabulário", description: "Estudou 950 palavras", icon: "🚩", condition: (p) => p.wordsStudied >= 950 },
  { id: "words_1000", title: "Dicionário Ambulante", description: "Estudou todas as 1000 palavras do banco!", icon: "📕", condition: (p) => p.wordsStudied >= 1000 },
  { id: "learned_200", title: "Vocabulário Dominado", description: "Dominou 200 palavras", icon: "🏗️", condition: (p) => (p.wordsLearned || 0) >= 200 },
  { id: "learned_500", title: "Meio Milhar Dominado", description: "Dominou 500 palavras", icon: "🏰", condition: (p) => (p.wordsLearned || 0) >= 500 },
  { id: "learned_700", title: "Arsenal de Palavras", description: "Dominou 700 palavras", icon: "🛡️", condition: (p) => (p.wordsLearned || 0) >= 700 },
  { id: "learned_1000", title: "Mestre de Mil Palavras", description: "Dominou as 1000 palavras do banco!", icon: "👑", condition: (p) => (p.wordsLearned || 0) >= 1000 },

  // ===== Níveis — novos marcos com 100 níveis =====
  { id: "level_25", title: "Um Quarto do Caminho", description: "Alcançou o nível 25", icon: "🎯", condition: (p) => p.currentLevel >= 25 },
  { id: "level_30", title: "Especialista Confirmado", description: "Alcançou o nível 30", icon: "🎖️", condition: (p) => p.currentLevel >= 30 },
  { id: "level_40", title: "Comunicador Avançado", description: "Alcançou o nível 40", icon: "🌟", condition: (p) => p.currentLevel >= 40 },
  { id: "level_50", title: "Meio Caminho Andado", description: "Alcançou o nível 50", icon: "🌌", condition: (p) => p.currentLevel >= 50 },
  { id: "stage_profissional", title: "Fluência Profissional", description: "Alcançou o nível 60", icon: "🏢", condition: (p) => p.currentLevel >= 60 },
  { id: "stage_cultural", title: "Curador Cultural", description: "Alcançou o nível 70", icon: "🖼️", condition: (p) => p.currentLevel >= 70 },
  { id: "stage_cientifico", title: "Cientista Fluente", description: "Alcançou o nível 80", icon: "🥼", condition: (p) => p.currentLevel >= 80 },
  { id: "level_75", title: "Quase Lá", description: "Alcançou o nível 75", icon: "🧗", condition: (p) => p.currentLevel >= 75 },
  { id: "level_85", title: "Erudito em Ascensão", description: "Alcançou o nível 85", icon: "🏺", condition: (p) => p.currentLevel >= 85 },
  { id: "stage_academico", title: "Acadêmico Fluente", description: "Alcançou o nível 90", icon: "🎓", condition: (p) => p.currentLevel >= 90 },
  { id: "level_95", title: "Lenda Quase Completa", description: "Alcançou o nível 95", icon: "⚜️", condition: (p) => p.currentLevel >= 95 },
  { id: "level_100", title: "Fluência Absoluta", description: "Alcançou o nível máximo — 100!", icon: "🏆", condition: (p) => p.currentLevel >= 100 },

  // ===== Acertos =====
  { id: "correct_300", title: "Trezentos Acertos", description: "Acertou 300 respostas", icon: "🎯", condition: (p) => p.totalCorrect >= 300 },
  { id: "correct_750", title: "Três Quartos de Milhar", description: "Acertou 750 respostas", icon: "💠", condition: (p) => p.totalCorrect >= 750 },
  { id: "correct_1000", title: "Milhar de Acertos", description: "Acertou 1000 respostas", icon: "💯", condition: (p) => p.totalCorrect >= 1000 },
  { id: "correct_1500", title: "Precisão Cirúrgica", description: "Acertou 1500 respostas", icon: "🔬", condition: (p) => p.totalCorrect >= 1500 },
  { id: "correct_2000", title: "Máquina Imparável", description: "Acertou 2000 respostas", icon: "🤖", condition: (p) => p.totalCorrect >= 2000 },

  // ===== Sequências =====
  { id: "streak_35", title: "Chama Eterna", description: "35 acertos seguidos", icon: "🔥", condition: (p) => p.bestStreak >= 35 },
  { id: "streak_50", title: "Sequência Lendária", description: "50 acertos seguidos", icon: "🌠", condition: (p) => p.bestStreak >= 50 },
  { id: "streak_60", title: "Onda Imparável", description: "60 acertos seguidos", icon: "🌊", condition: (p) => p.bestStreak >= 60 },
  { id: "streak_75", title: "Recorde Absoluto", description: "75 acertos seguidos", icon: "🏅", condition: (p) => p.bestStreak >= 75 },

  // ===== Dias consecutivos =====
  { id: "days_60", title: "Dois Meses Seguidos", description: "Estudou 60 dias consecutivos", icon: "📅", condition: (p) => p.dayStreak >= 60 },
  { id: "days_100", title: "Cem Dias de Dedicação", description: "Estudou 100 dias consecutivos", icon: "💯", condition: (p) => p.dayStreak >= 100 },
  { id: "days_200", title: "Persistência Lendária", description: "Estudou 200 dias consecutivos", icon: "🌕", condition: (p) => p.dayStreak >= 200 },
  { id: "days_365", title: "Um Ano Inteiro!", description: "Estudou 365 dias consecutivos", icon: "🎇", condition: (p) => p.dayStreak >= 365 },

  // ===== Pontuação =====
  { id: "points_5000", title: "Cofre Cheio", description: "Alcançou 5.000 pontos", icon: "💰", condition: (p) => p.totalScore >= 5000 },
  { id: "points_25000", title: "Tesouro Estelar", description: "Alcançou 25.000 pontos", icon: "💎", condition: (p) => p.totalScore >= 25000 },
  { id: "points_50000", title: "Império de Estrelas", description: "Alcançou 50.000 pontos", icon: "👑", condition: (p) => p.totalScore >= 50000 },
  { id: "points_75000", title: "Fortuna Cósmica", description: "Alcançou 75.000 pontos", icon: "🌌", condition: (p) => p.totalScore >= 75000 },
  { id: "points_100000", title: "Constelação Pessoal", description: "Alcançou 100.000 pontos", icon: "🌟", condition: (p) => p.totalScore >= 100000 },
  { id: "points_150000", title: "Riqueza Sem Limites", description: "Alcançou 150.000 pontos", icon: "🪙", condition: (p) => p.totalScore >= 150000 },

  // ===== Frases e desafios =====
  { id: "sentences_100", title: "Construtor Experiente", description: "Completou 100 frases", icon: "🧱", condition: (p) => p.sentencesCompleted >= 100 },
  { id: "sentences_200", title: "Duzentas Frases", description: "Completou 200 frases", icon: "📜", condition: (p) => p.sentencesCompleted >= 200 },
  { id: "daily_45", title: "Hábito Consolidado", description: "Completou 45 desafios diários", icon: "🔑", condition: (p) => p.dailyChallengesCompleted >= 45 },
  { id: "daily_60", title: "Dois Meses de Desafios", description: "Completou 60 desafios diários", icon: "🗝️", condition: (p) => p.dailyChallengesCompleted >= 60 },
  { id: "daily_100", title: "Cem Desafios", description: "Completou 100 desafios diários", icon: "🏵️", condition: (p) => p.dailyChallengesCompleted >= 100 },
  { id: "review_200", title: "Revisor Incansável", description: "Revisou 200 palavras", icon: "🧭", condition: (p) => p.wordsReviewed >= 200 },
  { id: "review_300", title: "Memória de Elefante", description: "Revisou 300 palavras", icon: "🐘", condition: (p) => p.wordsReviewed >= 300 },
  { id: "review_500", title: "Guardião da Revisão", description: "Revisou 500 palavras", icon: "🛡️", condition: (p) => p.wordsReviewed >= 500 },
];
