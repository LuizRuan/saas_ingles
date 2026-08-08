// Palavras com boa representação visual (emoji), usadas pelo Jogo da Imagem
// (src/games/ImageQuiz). Cada entrada aponta para uma palavra REAL de
// words.js pelo `en` exato — nunca duplicamos pt/pronunciation/example/tip
// aqui. O jogo busca o objeto completo em words.js na hora de montar a
// pergunta e de mostrar o WordExplanation, exatamente como todo outro jogo.
// Isso é o que mantém o progresso de uma palavra unificado em vez de
// fragmentado entre este arquivo e o banco principal (ver src/utils/wordKey.js).
//
// A maioria do vocabulário de words.js é abstrata demais para virar uma
// imagem única e inequívoca (verbos, sentimentos, perguntas...) — por isso
// este é um SUBCONJUNTO curado, não o banco inteiro.
//
// `category` aqui é só o agrupamento visual usado para sortear as 3 opções
// erradas "parecidas" com a certa (ver buildQuestion em ImageQuiz.jsx) — não
// precisa ser igual à `category` de words.js, embora normalmente coincida.
// Cada categoria tem pelo menos 6 palavras de propósito: com menos que isso
// não dá pra montar 4 opções sem repetir ou cair para fora do grupo.
import { words } from './words';

const RAW_IMAGE_WORDS = [
  // Animais — a categoria mais rica, cobre do nível 4 ao 43
  { en: 'Dog', emoji: '🐶', category: 'animais' },
  { en: 'Cat', emoji: '🐱', category: 'animais' },
  { en: 'Bird', emoji: '🐦', category: 'animais' },
  { en: 'Fish', emoji: '🐟', category: 'animais' },
  { en: 'Horse', emoji: '🐴', category: 'animais' },
  { en: 'Cow', emoji: '🐮', category: 'animais' },
  { en: 'Pig', emoji: '🐷', category: 'animais' },
  { en: 'Chicken', emoji: '🐔', category: 'animais' },
  { en: 'Duck', emoji: '🦆', category: 'animais' },
  { en: 'Rabbit', emoji: '🐰', category: 'animais' },
  { en: 'Lion', emoji: '🦁', category: 'animais' },
  { en: 'Elephant', emoji: '🐘', category: 'animais' },
  { en: 'Monkey', emoji: '🐵', category: 'animais' },
  { en: 'Bear', emoji: '🐻', category: 'animais' },
  { en: 'Snake', emoji: '🐍', category: 'animais' },
  { en: 'Frog', emoji: '🐸', category: 'animais' },
  { en: 'Butterfly', emoji: '🦋', category: 'animais' },
  { en: 'Turtle', emoji: '🐢', category: 'animais' },
  { en: 'Spider', emoji: '🕷️', category: 'animais' },
  { en: 'Bat', emoji: '🦇', category: 'animais' },
  { en: 'Owl', emoji: '🦉', category: 'animais' },
  { en: 'Bee', emoji: '🐝', category: 'animais' },
  { en: 'Ant', emoji: '🐜', category: 'animais' },
  { en: 'Chameleon', emoji: '🦎', category: 'animais' },
  { en: 'Tiger', emoji: '🐯', category: 'animais' },
  { en: 'Wolf', emoji: '🐺', category: 'animais' },
  { en: 'Fox', emoji: '🦊', category: 'animais' },
  { en: 'Deer', emoji: '🦌', category: 'animais' },
  { en: 'Sheep', emoji: '🐑', category: 'animais' },
  { en: 'Goat', emoji: '🐐', category: 'animais' },
  { en: 'Mouse', emoji: '🐭', category: 'animais' },
  { en: 'Shark', emoji: '🦈', category: 'animais' },

  // Comidas
  { en: 'Rice', emoji: '🍚', category: 'comidas' },
  { en: 'Bread', emoji: '🍞', category: 'comidas' },
  { en: 'Egg', emoji: '🥚', category: 'comidas' },
  { en: 'Meat', emoji: '🍖', category: 'comidas' },
  { en: 'Pizza', emoji: '🍕', category: 'comidas' },
  { en: 'Apple', emoji: '🍎', category: 'comidas' },
  { en: 'Banana', emoji: '🍌', category: 'comidas' },
  { en: 'Cheese', emoji: '🧀', category: 'comidas' },
  { en: 'Cake', emoji: '🎂', category: 'comidas' },
  { en: 'Candy', emoji: '🍬', category: 'comidas' },
  { en: 'Sandwich', emoji: '🥪', category: 'comidas' },
  { en: 'Soup', emoji: '🍲', category: 'comidas' },
  { en: 'Ice cream', emoji: '🍦', category: 'comidas' },
  { en: 'Cookie', emoji: '🍪', category: 'comidas' },
  { en: 'Chocolate', emoji: '🍫', category: 'comidas' },
  { en: 'Potato', emoji: '🥔', category: 'comidas' },
  { en: 'Tomato', emoji: '🍅', category: 'comidas' },
  { en: 'Onion', emoji: '🧅', category: 'comidas' },
  { en: 'Garlic', emoji: '🧄', category: 'comidas' },

  // Bebidas
  { en: 'Water', emoji: '💧', category: 'bebidas' },
  { en: 'Milk', emoji: '🥛', category: 'bebidas' },
  { en: 'Coffee', emoji: '☕', category: 'bebidas' },
  { en: 'Tea', emoji: '🍵', category: 'bebidas' },
  { en: 'Juice', emoji: '🧃', category: 'bebidas' },
  { en: 'Soda', emoji: '🥤', category: 'bebidas' },
  { en: 'Wine', emoji: '🍷', category: 'bebidas' },
  { en: 'Beer', emoji: '🍺', category: 'bebidas' },
  { en: 'Lemonade', emoji: '🍋', category: 'bebidas' },
  { en: 'Smoothie', emoji: '🥤', category: 'bebidas' },

  // Roupas
  { en: 'Shirt', emoji: '👕', category: 'roupas' },
  { en: 'Pants', emoji: '👖', category: 'roupas' },
  { en: 'Shoes', emoji: '👟', category: 'roupas' },
  { en: 'Hat', emoji: '🎩', category: 'roupas' },
  { en: 'Dress', emoji: '👗', category: 'roupas' },
  { en: 'Jacket', emoji: '🧥', category: 'roupas' },
  { en: 'Socks', emoji: '🧦', category: 'roupas' },
  { en: 'Ring', emoji: '💍', category: 'roupas' },
  { en: 'Glove', emoji: '🧤', category: 'roupas' },
  { en: 'Scarf', emoji: '🧣', category: 'roupas' },
  { en: 'Tie', emoji: '👔', category: 'roupas' },
  { en: 'Sunglasses', emoji: '🕶️', category: 'roupas' },
  { en: 'Coat', emoji: '🧥', category: 'roupas' },
  { en: 'Boots', emoji: '🥾', category: 'roupas' },

  // Corpo humano
  { en: 'Eye', emoji: '👁️', category: 'corpo' },
  { en: 'Ear', emoji: '👂', category: 'corpo' },
  { en: 'Nose', emoji: '👃', category: 'corpo' },
  { en: 'Mouth', emoji: '👄', category: 'corpo' },
  { en: 'Hand', emoji: '✋', category: 'corpo' },
  { en: 'Foot', emoji: '🦶', category: 'corpo' },
  { en: 'Arm', emoji: '💪', category: 'corpo' },
  { en: 'Leg', emoji: '🦵', category: 'corpo' },
  { en: 'Heart', emoji: '❤️', category: 'corpo' },
  { en: 'Tooth', emoji: '🦷', category: 'corpo' },
  { en: 'Tongue', emoji: '👅', category: 'corpo' },
  { en: 'Brain', emoji: '🧠', category: 'corpo' },
  { en: 'Bone', emoji: '🦴', category: 'corpo' },
  { en: 'Finger', emoji: '👆', category: 'corpo' },

  // Transportes
  { en: 'Car', emoji: '🚗', category: 'transportes' },
  { en: 'Bus', emoji: '🚌', category: 'transportes' },
  { en: 'Bicycle', emoji: '🚲', category: 'transportes' },
  { en: 'Train', emoji: '🚂', category: 'transportes' },
  { en: 'Airplane', emoji: '✈️', category: 'transportes' },
  { en: 'Boat', emoji: '⛵', category: 'transportes' },
  { en: 'Taxi', emoji: '🚕', category: 'transportes' },

  // Cores — cada uma já É a própria imagem, sem ambiguidade possível
  { en: 'Red', emoji: '🔴', category: 'cores' },
  { en: 'Blue', emoji: '🔵', category: 'cores' },
  { en: 'Green', emoji: '🟢', category: 'cores' },
  { en: 'Yellow', emoji: '🟡', category: 'cores' },
  { en: 'Black', emoji: '⚫', category: 'cores' },
  { en: 'White', emoji: '⚪', category: 'cores' },
  { en: 'Orange', emoji: '🟠', category: 'cores' },
  { en: 'Pink', emoji: '🩷', category: 'cores' },
  { en: 'Purple', emoji: '🟣', category: 'cores' },
  { en: 'Brown', emoji: '🟤', category: 'cores' },

  // Esportes
  { en: 'Ball', emoji: '⚽', category: 'esportes' },
  { en: 'Chess', emoji: '♟️', category: 'esportes' },
  { en: 'Goal', emoji: '🥅', category: 'esportes' },
  { en: 'Dice', emoji: '🎲', category: 'esportes' },
  { en: 'Running', emoji: '🏃', category: 'esportes' },
  { en: 'Swimming', emoji: '🏊', category: 'esportes' },

  // Casa
  { en: 'House', emoji: '🏠', category: 'casa' },
  { en: 'Door', emoji: '🚪', category: 'casa' },
  { en: 'Window', emoji: '🪟', category: 'casa' },
  { en: 'Bed', emoji: '🛏️', category: 'casa' },
  { en: 'Chair', emoji: '🪑', category: 'casa' },
  { en: 'Sofa', emoji: '🛋️', category: 'casa' },
  { en: 'TV', emoji: '📺', category: 'casa' },
  { en: 'Clock', emoji: '🕐', category: 'casa' },
  { en: 'Key', emoji: '🔑', category: 'casa' },
  { en: 'Shower', emoji: '🚿', category: 'casa' },

  // Família
  { en: 'Mother', emoji: '👩', category: 'familia' },
  { en: 'Father', emoji: '👨', category: 'familia' },
  { en: 'Brother', emoji: '👦', category: 'familia' },
  { en: 'Sister', emoji: '👧', category: 'familia' },
  { en: 'Baby', emoji: '👶', category: 'familia' },
  { en: 'Grandmother', emoji: '👵', category: 'familia' },
  { en: 'Grandfather', emoji: '👴', category: 'familia' },
];

const wordsByEn = new Map(words.map((w) => [w.en, w]));

// Resolvido contra o banco real — `word` é o objeto completo de words.js
// (pt, pronunciation, example, examplePt, level, tip), usado tanto para
// filtrar por dificuldade quanto para alimentar o WordExplanation.
export const imageWords = RAW_IMAGE_WORDS
  .map((iw) => ({ ...iw, word: wordsByEn.get(iw.en) }))
  .filter((iw) => iw.word);

// Exportado só para o teste de integridade conferir que nenhuma entrada foi
// digitada errado e silenciosamente descartada pelo filter() acima.
export const RAW_IMAGE_WORDS_COUNT = RAW_IMAGE_WORDS.length;
