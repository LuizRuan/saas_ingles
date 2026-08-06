// Definição de categorias com ícone, cor e descrição

export const categories = [
  { id: "cumprimentos", name: "Cumprimentos", icon: "👋", color: "#8b5cf6", description: "Olá, tchau e expressões básicas" },
  { id: "numeros", name: "Números", icon: "🔢", color: "#3b82f6", description: "Conte de 1 a 10 e além" },
  { id: "cores", name: "Cores", icon: "🎨", color: "#ec4899", description: "Aprenda todas as cores" },
  { id: "animais", name: "Animais", icon: "🐾", color: "#f59e0b", description: "Cães, gatos e muito mais" },
  { id: "comidas", name: "Comidas", icon: "🍕", color: "#ef4444", description: "Pizza, arroz, frutas..." },
  { id: "bebidas", name: "Bebidas", icon: "🥤", color: "#06b6d4", description: "Água, café, suco..." },
  { id: "familia", name: "Família", icon: "👨‍👩‍👧‍👦", color: "#10b981", description: "Mãe, pai, irmãos..." },
  { id: "casa", name: "Casa", icon: "🏠", color: "#f97316", description: "Porta, janela, cozinha..." },
  { id: "escola", name: "Escola", icon: "🏫", color: "#6366f1", description: "Professor, livro, aula..." },
  { id: "trabalho", name: "Trabalho", icon: "💼", color: "#64748b", description: "Escritório, chefe, reunião..." },
  { id: "roupas", name: "Roupas", icon: "👕", color: "#d946ef", description: "Camisa, sapato, vestido..." },
  { id: "corpo", name: "Corpo Humano", icon: "🧍", color: "#14b8a6", description: "Cabeça, mão, coração..." },
  { id: "lugares", name: "Lugares", icon: "📍", color: "#e11d48", description: "Hospital, loja, parque..." },
  { id: "transportes", name: "Transportes", icon: "🚗", color: "#0ea5e9", description: "Carro, ônibus, avião..." },
  { id: "verbos", name: "Verbos Básicos", icon: "⚡", color: "#eab308", description: "Comer, dormir, falar..." },
  { id: "sentimentos", name: "Sentimentos", icon: "😊", color: "#a855f7", description: "Feliz, triste, cansado..." },
  { id: "perguntas", name: "Perguntas Comuns", icon: "❓", color: "#22c55e", description: "O quê, onde, quando..." },
  { id: "frases", name: "Frases do Cotidiano", icon: "💬", color: "#8b5cf6", description: "Frases úteis do dia a dia" },
  { id: "tecnologia", name: "Tecnologia & Ciência", icon: "🛰️", color: "#06b6d4", description: "Internet, gravidade, código..." },
  { id: "charadas", name: "Charadas & Enigmas", icon: "🧩", color: "#a855f7", description: "Segredo, tempo, fogo..." },
  { id: "geografia", name: "Clima & Geografia", icon: "🌋", color: "#3b82f6", description: "Vulcão, oceano, estrelas..." },
  { id: "sociedade", name: "Sociedade & Cultura", icon: "⚖️", color: "#64748b", description: "Governo, lei, música..." },
  { id: "fisica", name: "Química & Materiais", icon: "🧪", color: "#10b981", description: "Ouro, vidro, plástico..." },
  { id: "ferramentas", name: "Ferramentas & Utensílios", icon: "🛠️", color: "#f59e0b", description: "Martelo, faca, tesoura..." },
  { id: "esportes", name: "Esportes & Jogos", icon: "⚽", color: "#ef4444", description: "Bola, xadrez, corrida..." },
  { id: "crimes", name: "Crimes & Investigação", icon: "🕵️", color: "#64748b", description: "Ladrão, veneno, pista..." },
  { id: "artes", name: "Artes & Mídia", icon: "🎨", color: "#ec4899", description: "Pintura, teatro, poema..." },
];

// Níveis de progressão (1 a 50)
// wordsNeeded conta PALAVRAS DISTINTAS do vocabulário (words.js)
export const stages = [
  { stage: 1, name: "Fundamentos (1-10)", icon: "🌱", color: "#10b981" },
  { stage: 2, name: "Elementar (11-20)", icon: "🚗", color: "#3b82f6" },
  { stage: 3, name: "Intermediário (21-30)", icon: "💻", color: "#f59e0b" },
  { stage: 4, name: "Avançado (31-40)", icon: "🎭", color: "#ec4899" },
  { stage: 5, name: "Mestre (41-50)", icon: "👑", color: "#8b5cf6" },
];

export const levels = [
  // Estágio 1: Iniciante / Fundamentos (Níveis 1 ao 10)
  { level: 1, stage: 1, name: "Primeiras Palavras", description: "Cumprimentos e primeiros passos", wordsNeeded: 0, icon: "🌱" },
  { level: 2, stage: 1, name: "Contando e Colorindo", description: "Números de 1 a 10 e cores primárias", wordsNeeded: 10, icon: "🎨" },
  { level: 3, stage: 1, name: "Mundo dos Animais", description: "Cães, gatos e bichinhos comuns", wordsNeeded: 20, icon: "🐾" },
  { level: 4, stage: 1, name: "Hora de Comer", description: "Frutas, comidas e lanches", wordsNeeded: 30, icon: "🍕" },
  { level: 5, stage: 1, name: "Hora de Beber", description: "Água, sucos e bebidas", wordsNeeded: 40, icon: "🥤" },
  { level: 6, stage: 1, name: "Minha Família", description: "Mãe, pai, irmãos e parentes", wordsNeeded: 50, icon: "👨‍👩‍👧‍👦" },
  { level: 7, stage: 1, name: "Minha Casa", description: "Cômodos, portas e janelas", wordsNeeded: 60, icon: "🏠" },
  { level: 8, stage: 1, name: "Na Escola", description: "Livros, canetas e sala de aula", wordsNeeded: 70, icon: "🏫" },
  { level: 9, stage: 1, name: "Meu Guarda-Roupa", description: "Roupas e calçados", wordsNeeded: 80, icon: "👕" },
  { level: 10, stage: 1, name: "Primeira Conquista", description: "Parabéns por dominar os fundamentos!", wordsNeeded: 90, icon: "🏆" },

  // Estágio 2: Elementar / Cotidiano (Níveis 11 ao 20)
  { level: 11, stage: 2, name: "Corpo Humano", description: "Partes do corpo e saúde", wordsNeeded: 100, icon: "🧍" },
  { level: 12, stage: 2, name: "Pela Cidade", description: "Lojas, hospitais e parques", wordsNeeded: 110, icon: "📍" },
  { level: 13, stage: 2, name: "Meios de Transporte", description: "Carros, ônibus e aviões", wordsNeeded: 120, icon: "🚗" },
  { level: 14, stage: 2, name: "Verbos em Ação", description: "Comer, correr, falar e dormir", wordsNeeded: 130, icon: "⚡" },
  { level: 15, stage: 2, name: "Sentimentos & Emoções", description: "Feliz, triste, forte e alegre", wordsNeeded: 140, icon: "😊" },
  { level: 16, stage: 2, name: "Perguntando Tudo", description: "O quê, quem, onde e por quê", wordsNeeded: 150, icon: "❓" },
  { level: 17, stage: 2, name: "No Trabalho", description: "Escritório, chefes e reuniões", wordsNeeded: 160, icon: "💼" },
  { level: 18, stage: 2, name: "Frases Úteis", description: "Diálogos simples do cotidiano", wordsNeeded: 170, icon: "💬" },
  { level: 19, stage: 2, name: "Tempo e Horas", description: "Dias da semana e horários", wordsNeeded: 180, icon: "⏰" },
  { level: 20, stage: 2, name: "Explorador Elementar", description: "Dominou a comunicação do dia a dia!", wordsNeeded: 190, icon: "🥇" },

  // Estágio 3: Intermediário / Prático (Níveis 21 ao 30)
  { level: 21, stage: 3, name: "Mundo Digital", description: "Computadores, internet e aplicativos", wordsNeeded: 200, icon: "💻" },
  { level: 22, stage: 3, name: "Ciência & Natureza", description: "Estrelas, espaço e física básica", wordsNeeded: 210, icon: "🛰️" },
  { level: 23, stage: 3, name: "Clima & Tempo", description: "Chuva, sol, neve e tempestade", wordsNeeded: 220, icon: "🌤️" },
  { level: 24, stage: 3, name: "Geografia Mundial", description: "Oceanos, montanhas e vulcões", wordsNeeded: 230, icon: "🌋" },
  { level: 25, stage: 3, name: "Ferramentas & Utensílios", description: "Chaves, martelos e ferramentas", wordsNeeded: 240, icon: "🛠️" },
  { level: 26, stage: 3, name: "Materiais & Elementos", description: "Ouro, vidro, madeira e plástico", wordsNeeded: 250, icon: "🧪" },
  { level: 27, stage: 3, name: "Esportes & Jogos", description: "Futebol, basquete e xadrez", wordsNeeded: 260, icon: "⚽" },
  { level: 28, stage: 3, name: "Charadas & Enigmas", description: "Segredos, mistérios e imaginação", wordsNeeded: 270, icon: "🧩" },
  { level: 29, stage: 3, name: "Comunicação Eficiente", description: "Expressões mais precisas", wordsNeeded: 280, icon: "📢" },
  { level: 30, stage: 3, name: "Especialista Intermediário", description: "Vocabulário prático e diversificado!", wordsNeeded: 290, icon: "🎖️" },

  // Estágio 4: Avançado / Expressão Fluida (Níveis 31 ao 40)
  { level: 31, stage: 4, name: "Sociedade & Leis", description: "Governo, justiça e cidadania", wordsNeeded: 300, icon: "⚖️" },
  { level: 32, stage: 4, name: "Artes & Cultura", description: "Teatro, música, pintura e cinema", wordsNeeded: 310, icon: "🎭" },
  { level: 33, stage: 4, name: "Mistério & Investigação", description: "Detetives, pistas e mistérios", wordsNeeded: 320, icon: "🕵️" },
  { level: 34, stage: 4, name: "Economia & Negócios", description: "Mercado, investimentos e finanças", wordsNeeded: 330, icon: "📈" },
  { level: 35, stage: 4, name: "Expressões Idiomáticas", description: "Gírias e frases populares em inglês", wordsNeeded: 340, icon: "🗣️" },
  { level: 36, stage: 4, name: "Literatura & Escrita", description: "Romances, poesias e redação", wordsNeeded: 350, icon: "📜" },
  { level: 37, stage: 4, name: "Saúde & Biologia", description: "Medicina, células e ecologia", wordsNeeded: 360, icon: "🧬" },
  { level: 38, stage: 4, name: "Arquitetura & Inovação", description: "Pontes, prédios e projetos", wordsNeeded: 370, icon: "🏗️" },
  { level: 39, stage: 4, name: "Debate & Argumentação", description: "Opiniões e pensamento crítico", wordsNeeded: 380, icon: "🧠" },
  { level: 40, stage: 4, name: "Comunicador Avançado", description: "Compreensão fluida de conversas complexas!", wordsNeeded: 390, icon: "🌟" },

  // Estágio 5: Mestre & Fluência Total (Níveis 41 ao 50)
  { level: 41, stage: 5, name: "Vocabulário Acadêmico", description: "Termos formais e universitários", wordsNeeded: 400, icon: "🎓" },
  { level: 42, stage: 5, name: "Filosofia & Ética", description: "Conceitos abstratos e ideias elevadas", wordsNeeded: 410, icon: "🏛️" },
  { level: 43, stage: 5, name: "Astronomia & Universo", description: "Galáxias, buracos negros e cosmos", wordsNeeded: 420, icon: "🌌" },
  { level: 44, stage: 5, name: "Morfologia Específica", description: "Terminologias de precisão", wordsNeeded: 430, icon: "🔍" },
  { level: 45, stage: 5, name: "Diplomacia & Política", description: "Relações internacionais e acordos", wordsNeeded: 440, icon: "🌐" },
  { level: 46, stage: 5, name: "Alta Sintaxe", description: "Estruturas gramaticais sofisticadas", wordsNeeded: 450, icon: "⚡" },
  { level: 47, stage: 5, name: "Nuances da Língua", description: "Sinônimos refinados e sutilezas", wordsNeeded: 460, icon: "💎" },
  { level: 48, stage: 5, name: "Erudição Linguística", description: "Domínio de textos eruditos e literários", wordsNeeded: 470, icon: "📖" },
  { level: 49, stage: 5, name: "Gran Mestre", description: "A um passo da maestria suprema!", wordsNeeded: 480, icon: "👑" },
  { level: 50, stage: 5, name: "Mestre Supremo", description: "Maestria e fluência total no idioma!", wordsNeeded: 490, icon: "🌌" },
];
