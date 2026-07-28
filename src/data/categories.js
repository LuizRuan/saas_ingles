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

// Níveis de progressão
//
// wordsNeeded conta PALAVRAS DISTINTAS do vocabulário (words.js), não frases.
// Os limiares precisam caber no acervo: com 239 palavras, os antigos 260 e 300
// dos níveis 9 e 10 eram inalcançáveis — só pareciam atingíveis porque frases
// entravam na mesma contagem. Ao acrescentar vocabulário, dá para esticar de novo.
export const levels = [
  { level: 1, name: "Primeiras Palavras", description: "Cumprimentos, números e cores", wordsNeeded: 0, icon: "🌱" },
  { level: 2, name: "Objetos do Dia a Dia", description: "Animais, comidas e bebidas", wordsNeeded: 15, icon: "📦" },
  { level: 3, name: "Casa e Família", description: "Família, casa e móveis", wordsNeeded: 40, icon: "🏠" },
  { level: 4, name: "Escola e Trabalho", description: "Escola, trabalho e roupas", wordsNeeded: 70, icon: "📚" },
  { level: 5, name: "Mundo ao Redor", description: "Lugares, transportes e verbos", wordsNeeded: 100, icon: "🌍" },
  { level: 6, name: "Sentimentos e Perguntas", description: "Sentimentos e perguntas comuns", wordsNeeded: 130, icon: "💭" },
  { level: 7, name: "Frases Completas", description: "Frases do cotidiano", wordsNeeded: 160, icon: "💬" },
  { level: 8, name: "Conversação Básica", description: "Conversas simples", wordsNeeded: 185, icon: "🗣️" },
  { level: 9, name: "Praticante", description: "Revisão e prática avançada", wordsNeeded: 210, icon: "⭐" },
  { level: 10, name: "Mestre Iniciante", description: "Dominou o básico do inglês!", wordsNeeded: 230, icon: "🏆" },
];
