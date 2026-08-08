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
//
// `icon` é um SVG do conjunto OpenMoji (CC BY-SA 4.0), copiado em build-time
// para public/emoji-icons/ — auto-hospedado, sem CDN externo (a CSP em
// vercel.json é `default-src 'self'`, então uma <img> apontando pra fora
// seria bloqueada de qualquer forma). `emoji` continua guardado como
// fallback/alt-text e para o caso de precisar dele fora do jogo.
import { words } from './words';

const RAW_IMAGE_WORDS = [
  // Animais — a categoria mais rica, cobre do nível 4 ao 43
  { en: 'Dog', emoji: '🐶', icon: '/emoji-icons/dog.svg', category: 'animais' },
  { en: 'Cat', emoji: '🐱', icon: '/emoji-icons/cat.svg', category: 'animais' },
  { en: 'Bird', emoji: '🐦', icon: '/emoji-icons/bird.svg', category: 'animais' },
  { en: 'Fish', emoji: '🐟', icon: '/emoji-icons/fish.svg', category: 'animais' },
  { en: 'Horse', emoji: '🐴', icon: '/emoji-icons/horse.svg', category: 'animais' },
  { en: 'Cow', emoji: '🐮', icon: '/emoji-icons/cow.svg', category: 'animais' },
  { en: 'Pig', emoji: '🐷', icon: '/emoji-icons/pig.svg', category: 'animais' },
  { en: 'Chicken', emoji: '🐔', icon: '/emoji-icons/chicken.svg', category: 'animais' },
  { en: 'Duck', emoji: '🦆', icon: '/emoji-icons/duck.svg', category: 'animais' },
  { en: 'Rabbit', emoji: '🐰', icon: '/emoji-icons/rabbit.svg', category: 'animais' },
  { en: 'Lion', emoji: '🦁', icon: '/emoji-icons/lion.svg', category: 'animais' },
  { en: 'Elephant', emoji: '🐘', icon: '/emoji-icons/elephant.svg', category: 'animais' },
  { en: 'Monkey', emoji: '🐵', icon: '/emoji-icons/monkey.svg', category: 'animais' },
  { en: 'Bear', emoji: '🐻', icon: '/emoji-icons/bear.svg', category: 'animais' },
  { en: 'Snake', emoji: '🐍', icon: '/emoji-icons/snake.svg', category: 'animais' },
  { en: 'Frog', emoji: '🐸', icon: '/emoji-icons/frog.svg', category: 'animais' },
  { en: 'Butterfly', emoji: '🦋', icon: '/emoji-icons/butterfly.svg', category: 'animais' },
  { en: 'Turtle', emoji: '🐢', icon: '/emoji-icons/turtle.svg', category: 'animais' },
  { en: 'Spider', emoji: '🕷️', icon: '/emoji-icons/spider.svg', category: 'animais' },
  { en: 'Bat', emoji: '🦇', icon: '/emoji-icons/bat.svg', category: 'animais' },
  { en: 'Owl', emoji: '🦉', icon: '/emoji-icons/owl.svg', category: 'animais' },
  { en: 'Bee', emoji: '🐝', icon: '/emoji-icons/bee.svg', category: 'animais' },
  { en: 'Ant', emoji: '🐜', icon: '/emoji-icons/ant.svg', category: 'animais' },
  { en: 'Chameleon', emoji: '🦎', icon: '/emoji-icons/chameleon.svg', category: 'animais' },
  { en: 'Tiger', emoji: '🐯', icon: '/emoji-icons/tiger.svg', category: 'animais' },
  { en: 'Wolf', emoji: '🐺', icon: '/emoji-icons/wolf.svg', category: 'animais' },
  { en: 'Fox', emoji: '🦊', icon: '/emoji-icons/fox.svg', category: 'animais' },
  { en: 'Deer', emoji: '🦌', icon: '/emoji-icons/deer.svg', category: 'animais' },
  { en: 'Sheep', emoji: '🐑', icon: '/emoji-icons/sheep.svg', category: 'animais' },
  { en: 'Goat', emoji: '🐐', icon: '/emoji-icons/goat.svg', category: 'animais' },
  { en: 'Mouse', emoji: '🐭', icon: '/emoji-icons/mouse.svg', category: 'animais' },
  { en: 'Shark', emoji: '🦈', icon: '/emoji-icons/shark.svg', category: 'animais' },

  // Comidas
  { en: 'Rice', emoji: '🍚', icon: '/emoji-icons/rice.svg', category: 'comidas' },
  { en: 'Bread', emoji: '🍞', icon: '/emoji-icons/bread.svg', category: 'comidas' },
  { en: 'Egg', emoji: '🥚', icon: '/emoji-icons/egg.svg', category: 'comidas' },
  { en: 'Meat', emoji: '🍖', icon: '/emoji-icons/meat.svg', category: 'comidas' },
  { en: 'Pizza', emoji: '🍕', icon: '/emoji-icons/pizza.svg', category: 'comidas' },
  { en: 'Apple', emoji: '🍎', icon: '/emoji-icons/apple.svg', category: 'comidas' },
  { en: 'Banana', emoji: '🍌', icon: '/emoji-icons/banana.svg', category: 'comidas' },
  { en: 'Cheese', emoji: '🧀', icon: '/emoji-icons/cheese.svg', category: 'comidas' },
  { en: 'Cake', emoji: '🎂', icon: '/emoji-icons/cake.svg', category: 'comidas' },
  { en: 'Candy', emoji: '🍬', icon: '/emoji-icons/candy.svg', category: 'comidas' },
  { en: 'Sandwich', emoji: '🥪', icon: '/emoji-icons/sandwich.svg', category: 'comidas' },
  { en: 'Soup', emoji: '🍲', icon: '/emoji-icons/soup.svg', category: 'comidas' },
  { en: 'Ice cream', emoji: '🍦', icon: '/emoji-icons/ice-cream.svg', category: 'comidas' },
  { en: 'Cookie', emoji: '🍪', icon: '/emoji-icons/cookie.svg', category: 'comidas' },
  { en: 'Chocolate', emoji: '🍫', icon: '/emoji-icons/chocolate.svg', category: 'comidas' },
  { en: 'Potato', emoji: '🥔', icon: '/emoji-icons/potato.svg', category: 'comidas' },
  { en: 'Tomato', emoji: '🍅', icon: '/emoji-icons/tomato.svg', category: 'comidas' },
  { en: 'Onion', emoji: '🧅', icon: '/emoji-icons/onion.svg', category: 'comidas' },
  { en: 'Garlic', emoji: '🧄', icon: '/emoji-icons/garlic.svg', category: 'comidas' },

  // Bebidas
  { en: 'Water', emoji: '💧', icon: '/emoji-icons/water.svg', category: 'bebidas' },
  { en: 'Milk', emoji: '🥛', icon: '/emoji-icons/milk.svg', category: 'bebidas' },
  { en: 'Coffee', emoji: '☕', icon: '/emoji-icons/coffee.svg', category: 'bebidas' },
  { en: 'Tea', emoji: '🍵', icon: '/emoji-icons/tea.svg', category: 'bebidas' },
  { en: 'Juice', emoji: '🧃', icon: '/emoji-icons/juice.svg', category: 'bebidas' },
  { en: 'Soda', emoji: '🥤', icon: '/emoji-icons/soda.svg', category: 'bebidas' },
  { en: 'Wine', emoji: '🍷', icon: '/emoji-icons/wine.svg', category: 'bebidas' },
  { en: 'Beer', emoji: '🍺', icon: '/emoji-icons/beer.svg', category: 'bebidas' },
  { en: 'Lemonade', emoji: '🍋', icon: '/emoji-icons/lemonade.svg', category: 'bebidas' },
  { en: 'Smoothie', emoji: '🥤', icon: '/emoji-icons/smoothie.svg', category: 'bebidas' },

  // Roupas
  { en: 'Shirt', emoji: '👕', icon: '/emoji-icons/shirt.svg', category: 'roupas' },
  { en: 'Pants', emoji: '👖', icon: '/emoji-icons/pants.svg', category: 'roupas' },
  { en: 'Shoes', emoji: '👟', icon: '/emoji-icons/shoes.svg', category: 'roupas' },
  { en: 'Hat', emoji: '🎩', icon: '/emoji-icons/hat.svg', category: 'roupas' },
  { en: 'Dress', emoji: '👗', icon: '/emoji-icons/dress.svg', category: 'roupas' },
  { en: 'Jacket', emoji: '🧥', icon: '/emoji-icons/jacket.svg', category: 'roupas' },
  { en: 'Socks', emoji: '🧦', icon: '/emoji-icons/socks.svg', category: 'roupas' },
  { en: 'Ring', emoji: '💍', icon: '/emoji-icons/ring.svg', category: 'roupas' },
  { en: 'Glove', emoji: '🧤', icon: '/emoji-icons/glove.svg', category: 'roupas' },
  { en: 'Scarf', emoji: '🧣', icon: '/emoji-icons/scarf.svg', category: 'roupas' },
  { en: 'Tie', emoji: '👔', icon: '/emoji-icons/tie.svg', category: 'roupas' },
  { en: 'Sunglasses', emoji: '🕶️', icon: '/emoji-icons/sunglasses.svg', category: 'roupas' },
  { en: 'Coat', emoji: '🧥', icon: '/emoji-icons/coat.svg', category: 'roupas' },
  { en: 'Boots', emoji: '🥾', icon: '/emoji-icons/boots.svg', category: 'roupas' },

  // Corpo humano
  { en: 'Eye', emoji: '👁️', icon: '/emoji-icons/eye.svg', category: 'corpo' },
  { en: 'Ear', emoji: '👂', icon: '/emoji-icons/ear.svg', category: 'corpo' },
  { en: 'Nose', emoji: '👃', icon: '/emoji-icons/nose.svg', category: 'corpo' },
  { en: 'Mouth', emoji: '👄', icon: '/emoji-icons/mouth.svg', category: 'corpo' },
  { en: 'Hand', emoji: '✋', icon: '/emoji-icons/hand.svg', category: 'corpo' },
  { en: 'Foot', emoji: '🦶', icon: '/emoji-icons/foot.svg', category: 'corpo' },
  { en: 'Arm', emoji: '💪', icon: '/emoji-icons/arm.svg', category: 'corpo' },
  { en: 'Leg', emoji: '🦵', icon: '/emoji-icons/leg.svg', category: 'corpo' },
  { en: 'Heart', emoji: '❤️', icon: '/emoji-icons/heart.svg', category: 'corpo' },
  { en: 'Tooth', emoji: '🦷', icon: '/emoji-icons/tooth.svg', category: 'corpo' },
  { en: 'Tongue', emoji: '👅', icon: '/emoji-icons/tongue.svg', category: 'corpo' },
  { en: 'Brain', emoji: '🧠', icon: '/emoji-icons/brain.svg', category: 'corpo' },
  { en: 'Bone', emoji: '🦴', icon: '/emoji-icons/bone.svg', category: 'corpo' },
  { en: 'Finger', emoji: '👆', icon: '/emoji-icons/finger.svg', category: 'corpo' },

  // Transportes
  { en: 'Car', emoji: '🚗', icon: '/emoji-icons/car.svg', category: 'transportes' },
  { en: 'Bus', emoji: '🚌', icon: '/emoji-icons/bus.svg', category: 'transportes' },
  { en: 'Bicycle', emoji: '🚲', icon: '/emoji-icons/bicycle.svg', category: 'transportes' },
  { en: 'Train', emoji: '🚂', icon: '/emoji-icons/train.svg', category: 'transportes' },
  { en: 'Airplane', emoji: '✈️', icon: '/emoji-icons/airplane.svg', category: 'transportes' },
  { en: 'Boat', emoji: '⛵', icon: '/emoji-icons/boat.svg', category: 'transportes' },
  { en: 'Taxi', emoji: '🚕', icon: '/emoji-icons/taxi.svg', category: 'transportes' },

  // Cores — cada uma já É a própria imagem, sem ambiguidade possível
  { en: 'Red', emoji: '🔴', icon: '/emoji-icons/red.svg', category: 'cores' },
  { en: 'Blue', emoji: '🔵', icon: '/emoji-icons/blue.svg', category: 'cores' },
  { en: 'Green', emoji: '🟢', icon: '/emoji-icons/green.svg', category: 'cores' },
  { en: 'Yellow', emoji: '🟡', icon: '/emoji-icons/yellow.svg', category: 'cores' },
  { en: 'Black', emoji: '⚫', icon: '/emoji-icons/black.svg', category: 'cores' },
  { en: 'White', emoji: '⚪', icon: '/emoji-icons/white.svg', category: 'cores' },
  { en: 'Orange', emoji: '🟠', icon: '/emoji-icons/orange.svg', category: 'cores' },
  { en: 'Pink', emoji: '🩷', icon: '/emoji-icons/pink.svg', category: 'cores' },
  { en: 'Purple', emoji: '🟣', icon: '/emoji-icons/purple.svg', category: 'cores' },
  { en: 'Brown', emoji: '🟤', icon: '/emoji-icons/brown.svg', category: 'cores' },

  // Esportes
  { en: 'Ball', emoji: '⚽', icon: '/emoji-icons/ball.svg', category: 'esportes' },
  { en: 'Chess', emoji: '♟️', icon: '/emoji-icons/chess.svg', category: 'esportes' },
  { en: 'Goal', emoji: '🥅', icon: '/emoji-icons/goal.svg', category: 'esportes' },
  { en: 'Dice', emoji: '🎲', icon: '/emoji-icons/dice.svg', category: 'esportes' },
  { en: 'Running', emoji: '🏃', icon: '/emoji-icons/running.svg', category: 'esportes' },
  { en: 'Swimming', emoji: '🏊', icon: '/emoji-icons/swimming.svg', category: 'esportes' },

  // Casa
  { en: 'House', emoji: '🏠', icon: '/emoji-icons/house.svg', category: 'casa' },
  { en: 'Door', emoji: '🚪', icon: '/emoji-icons/door.svg', category: 'casa' },
  { en: 'Window', emoji: '🪟', icon: '/emoji-icons/window.svg', category: 'casa' },
  { en: 'Bed', emoji: '🛏️', icon: '/emoji-icons/bed.svg', category: 'casa' },
  { en: 'Chair', emoji: '🪑', icon: '/emoji-icons/chair.svg', category: 'casa' },
  { en: 'Sofa', emoji: '🛋️', icon: '/emoji-icons/sofa.svg', category: 'casa' },
  { en: 'TV', emoji: '📺', icon: '/emoji-icons/tv.svg', category: 'casa' },
  { en: 'Clock', emoji: '🕐', icon: '/emoji-icons/clock.svg', category: 'casa' },
  { en: 'Key', emoji: '🔑', icon: '/emoji-icons/key.svg', category: 'casa' },
  { en: 'Shower', emoji: '🚿', icon: '/emoji-icons/shower.svg', category: 'casa' },

  // Família
  { en: 'Mother', emoji: '👩', icon: '/emoji-icons/mother.svg', category: 'familia' },
  { en: 'Father', emoji: '👨', icon: '/emoji-icons/father.svg', category: 'familia' },
  { en: 'Brother', emoji: '👦', icon: '/emoji-icons/brother.svg', category: 'familia' },
  { en: 'Sister', emoji: '👧', icon: '/emoji-icons/sister.svg', category: 'familia' },
  { en: 'Baby', emoji: '👶', icon: '/emoji-icons/baby.svg', category: 'familia' },
  { en: 'Grandmother', emoji: '👵', icon: '/emoji-icons/grandmother.svg', category: 'familia' },
  { en: 'Grandfather', emoji: '👴', icon: '/emoji-icons/grandfather.svg', category: 'familia' },
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
