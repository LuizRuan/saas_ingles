// Palavras com boa representação visual, usadas pelo Jogo da Imagem
// (src/games/ImageQuiz) no curso de Espanhol.
//
// MESMO CONTRATO do banco de inglês (src/data/imageWords.js): cada entrada
// aponta para uma palavra REAL de courses/es/words.js pelo `en` exato — nunca
// duplicamos pt/pronunciation/example/tip aqui. O jogo cruza os dois.
//
// A versão anterior deste arquivo usava um formato próprio
// ({ id, word, translation, image }) que NÃO tinha `category` nem `level` —
// exatamente os dois campos que ImageQuiz.buildRounds() usa para escolher os
// distratores e escalar a dificuldade. O jogo teria vindo vazio em espanhol.
//
// As fotos são as MESMAS do curso de inglês (public/photos, self-hospedadas):
// a foto de um gato serve para "Cat" e para "Gato" igualmente, então não há
// download novo nem exceção de CSP envolvida aqui.

import { words } from './words.js';

const RAW_IMAGE_WORDS = [
  // ===== ANIMAIS =====
  { en: 'Gato', emoji: '🐱', icon: '/photos/cat.jpg', iconAlt: 'Close de um gatinho preto e branco, curioso e brincalhão.', category: 'animais' },
  { en: 'Perro', emoji: '🐶', icon: '/photos/dog.jpg', iconAlt: 'Retrato de um cachorro de pelo avermelhado com coleira preta, ao ar livre.', category: 'animais' },
  { en: 'Pájaro', emoji: '🐦', icon: '/photos/bird.jpg', iconAlt: 'Pássaro pousado em um galho.', category: 'animais' },
  { en: 'Caballo', emoji: '🐴', icon: '/photos/horse.jpg', iconAlt: 'Cavalo em um campo aberto.', category: 'animais' },
  { en: 'Vaca', emoji: '🐮', icon: '/photos/cow.jpg', iconAlt: 'Vaca pastando em um campo verde.', category: 'animais' },
  { en: 'Cerdo', emoji: '🐷', icon: '/photos/pig.jpg', iconAlt: 'Porco rosado em uma fazenda.', category: 'animais' },
  { en: 'Pollo', emoji: '🐔', icon: '/photos/chicken.jpg', iconAlt: 'Galinha ao ar livre.', category: 'animais' },
  { en: 'Pez', emoji: '🐟', icon: '/photos/fish.jpg', iconAlt: 'Peixe colorido nadando na água.', category: 'animais' },
  { en: 'Ratón', emoji: '🐭', icon: '/photos/mouse.jpg', iconAlt: 'Camundongo pequeno de pelo cinza.', category: 'animais' },
  { en: 'Oso', emoji: '🐻', icon: '/photos/bear.jpg', iconAlt: 'Urso marrom na natureza.', category: 'animais' },
  { en: 'León', emoji: '🦁', icon: '/photos/lion.jpg', iconAlt: 'Leão com juba densa olhando para a câmera.', category: 'animais' },
  { en: 'Mono', emoji: '🐵', icon: '/photos/monkey.jpg', iconAlt: 'Macaco sentado em um galho.', category: 'animais' },
  { en: 'Conejo', emoji: '🐰', icon: '/photos/rabbit.jpg', iconAlt: 'Coelho branco na grama.', category: 'animais' },
  { en: 'Pato', emoji: '🦆', icon: '/photos/duck.jpg', iconAlt: 'Pato nadando em um lago.', category: 'animais' },
  { en: 'Abeja', emoji: '🐝', icon: '/photos/bee.jpg', iconAlt: 'Abelha pousada em uma flor amarela.', category: 'animais' },
  { en: 'Araña', emoji: '🕷️', icon: '/photos/spider.jpg', iconAlt: 'Aranha em sua teia.', category: 'animais' },
  { en: 'Mariposa', emoji: '🦋', icon: '/photos/butterfly.jpg', iconAlt: 'Borboleta de asas coloridas sobre uma flor.', category: 'animais' },
  { en: 'Tortuga', emoji: '🐢', icon: '/photos/turtle.jpg', iconAlt: 'Tartaruga caminhando lentamente.', category: 'animais' },
  { en: 'Serpiente', emoji: '🐍', icon: '/photos/snake.jpg', iconAlt: 'Cobra enrolada sobre uma pedra.', category: 'animais' },
  { en: 'Elefante', emoji: '🐘', icon: '/photos/elephant.jpg', iconAlt: 'Elefante adulto com presas, em um campo.', category: 'animais' },
  { en: 'Oveja', emoji: '🐑', icon: '/photos/sheep.jpg', iconAlt: 'Ovelha de lã branca em um pasto.', category: 'animais' },

  // ===== COMIDAS =====
  { en: 'Pan', emoji: '🍞', icon: '/photos/bread.jpg', iconAlt: 'Pão artesanal fatiado sobre uma tábua.', category: 'comidas' },
  { en: 'Queso', emoji: '🧀', icon: '/photos/cheese.jpg', iconAlt: 'Fatias de queijo amarelo.', category: 'comidas' },
  { en: 'Manzana', emoji: '🍎', icon: '/photos/apple.jpg', iconAlt: 'Maçã vermelha brilhante.', category: 'comidas' },
  { en: 'Plátano', emoji: '🍌', icon: '/photos/banana.jpg', iconAlt: 'Cacho de bananas maduras.', category: 'comidas' },
  { en: 'Carne', emoji: '🥩', icon: '/photos/meat.jpg', iconAlt: 'Corte de carne vermelha crua.', category: 'comidas' },
  { en: 'Arroz', emoji: '🍚', icon: '/photos/rice.jpg', iconAlt: 'Tigela de arroz branco cozido.', category: 'comidas' },
  { en: 'Huevo', emoji: '🥚', icon: '/photos/egg.jpg', iconAlt: 'Ovos brancos em uma cesta.', category: 'comidas' },
  { en: 'Sopa', emoji: '🍲', icon: '/photos/soup.jpg', iconAlt: 'Tigela de sopa quente fumegante.', category: 'comidas' },
  { en: 'Pastel', emoji: '🍰', icon: '/photos/cake.jpg', iconAlt: 'Fatia de bolo decorado.', category: 'comidas' },
  { en: 'Chocolate', emoji: '🍫', icon: '/photos/chocolate.jpg', iconAlt: 'Barras de chocolate escuro.', category: 'comidas' },
  { en: 'Helado', emoji: '🍦', icon: '/photos/ice-cream.jpg', iconAlt: 'Casquinha de sorvete.', category: 'comidas' },
  { en: 'Galleta', emoji: '🍪', icon: '/photos/cookie.jpg', iconAlt: 'Biscoitos com gotas de chocolate.', category: 'comidas' },
  { en: 'Tomate', emoji: '🍅', icon: '/photos/tomato.jpg', iconAlt: 'Tomates vermelhos maduros.', category: 'comidas' },
  { en: 'Papa', emoji: '🥔', icon: '/photos/potato.jpg', iconAlt: 'Batatas cruas sobre uma superfície de madeira.', category: 'comidas' },

  // ===== BEBIDAS =====
  { en: 'Agua', emoji: '💧', icon: '/photos/water.jpg', iconAlt: 'Copo de água cristalina.', category: 'bebidas' },
  { en: 'Leche', emoji: '🥛', icon: '/photos/milk.jpg', iconAlt: 'Copo de leite branco.', category: 'bebidas' },
  { en: 'Café', emoji: '☕', icon: '/photos/coffee.jpg', iconAlt: 'Xícara de café preto sobre um pires.', category: 'bebidas' },
  { en: 'Jugo', emoji: '🧃', icon: '/photos/juice.jpg', iconAlt: 'Copo de suco de laranja natural.', category: 'bebidas' },
  { en: 'Vino', emoji: '🍷', icon: '/photos/wine.jpg', iconAlt: 'Taça de vinho tinto.', category: 'bebidas' },
  { en: 'Cerveza', emoji: '🍺', icon: '/photos/beer.jpg', iconAlt: 'Caneca de cerveja com espuma.', category: 'bebidas' },
  { en: 'Té', emoji: '🍵', icon: '/photos/tea.jpg', iconAlt: 'Xícara de chá quente.', category: 'bebidas' },

  // ===== TRANSPORTES =====
  { en: 'Coche', emoji: '🚗', icon: '/photos/car.jpg', iconAlt: 'Carro estacionado em uma rua.', category: 'transportes' },
  { en: 'Autobús', emoji: '🚌', icon: '/photos/bus.jpg', iconAlt: 'Ônibus urbano em movimento.', category: 'transportes' },
  { en: 'Tren', emoji: '🚆', icon: '/photos/train.jpg', iconAlt: 'Trem em uma estação ferroviária.', category: 'transportes' },
  { en: 'Avión', emoji: '✈️', icon: '/photos/airplane.jpg', iconAlt: 'Avião comercial voando no céu azul.', category: 'transportes' },
  { en: 'Bicicleta', emoji: '🚲', icon: '/photos/bicycle.jpg', iconAlt: 'Bicicleta encostada em uma parede.', category: 'transportes' },
  { en: 'Barco', emoji: '⛵', icon: '/photos/boat.jpg', iconAlt: 'Barco a vela no mar.', category: 'transportes' },
  { en: 'Taxi', emoji: '🚕', icon: '/photos/taxi.jpg', iconAlt: 'Táxi amarelo em uma rua movimentada.', category: 'transportes' },

  // ===== CASA =====
  { en: 'Casa', emoji: '🏠', icon: '/photos/house.jpg', iconAlt: 'Casa residencial vista de fora.', category: 'casa' },
  { en: 'Puerta', emoji: '🚪', icon: '/photos/door.jpg', iconAlt: 'Porta de madeira fechada.', category: 'casa' },
  { en: 'Ventana', emoji: '🪟', icon: '/photos/window.jpg', iconAlt: 'Janela com vista para fora.', category: 'casa' },
  { en: 'Cama', emoji: '🛏️', icon: '/photos/bed.jpg', iconAlt: 'Cama arrumada em um quarto.', category: 'casa' },
  { en: 'Silla', emoji: '🪑', icon: '/photos/chair.jpg', iconAlt: 'Cadeira de madeira vazia.', category: 'casa' },
  { en: 'Llave', emoji: '🔑', icon: '/photos/key.jpg', iconAlt: 'Chave metálica sobre uma superfície.', category: 'casa' },

  // ===== CORPO =====
  { en: 'Mano', emoji: '✋', icon: '/photos/hand.jpg', iconAlt: 'Mão humana aberta.', category: 'corpo' },
  { en: 'Ojo', emoji: '👁️', icon: '/photos/eye.jpg', iconAlt: 'Close de um olho humano.', category: 'corpo' },
  { en: 'Boca', emoji: '👄', icon: '/photos/mouth.jpg', iconAlt: 'Close de uma boca sorrindo.', category: 'corpo' },
  { en: 'Nariz', emoji: '👃', icon: '/photos/nose.jpg', iconAlt: 'Close de um nariz humano.', category: 'corpo' },
  { en: 'Oreja', emoji: '👂', icon: '/photos/ear.jpg', iconAlt: 'Close de uma orelha.', category: 'corpo' },
  { en: 'Pie', emoji: '🦶', icon: '/photos/foot.jpg', iconAlt: 'Pé humano descalço.', category: 'corpo' },
  { en: 'Pierna', emoji: '🦵', icon: '/photos/leg.jpg', iconAlt: 'Perna humana.', category: 'corpo' },
  { en: 'Brazo', emoji: '💪', icon: '/photos/arm.jpg', iconAlt: 'Braço humano flexionado.', category: 'corpo' },
  { en: 'Corazón', emoji: '❤️', icon: '/photos/heart.jpg', iconAlt: 'Coração vermelho.', category: 'corpo' },
  { en: 'Diente', emoji: '🦷', icon: '/photos/tooth.jpg', iconAlt: 'Dente branco.', category: 'corpo' },
  { en: 'Dedo', emoji: '👆', icon: '/photos/finger.jpg', iconAlt: 'Dedo indicador apontando.', category: 'corpo' },
  { en: 'Hueso', emoji: '🦴', icon: '/photos/bone.jpg', iconAlt: 'Osso branco.', category: 'corpo' },

  // ===== FAMÍLIA =====
  { en: 'Madre', emoji: '👩', icon: '/photos/mother.jpg', iconAlt: 'Mãe segurando seu bebê.', category: 'familia' },
  { en: 'Padre', emoji: '👨', icon: '/photos/father.jpg', iconAlt: 'Pai com seu filho.', category: 'familia' },
  { en: 'Hermano', emoji: '👦', icon: '/photos/brother.jpg', iconAlt: 'Menino jovem sorrindo.', category: 'familia' },
  { en: 'Hermana', emoji: '👧', icon: '/photos/sister.jpg', iconAlt: 'Menina jovem sorrindo.', category: 'familia' },
  { en: 'Abuelo', emoji: '👴', icon: '/photos/grandfather.jpg', iconAlt: 'Homem idoso sorrindo.', category: 'familia' },
  { en: 'Abuela', emoji: '👵', icon: '/photos/grandmother.jpg', iconAlt: 'Mulher idosa sorrindo.', category: 'familia' },
  { en: 'Bebé', emoji: '👶', icon: '/photos/baby.jpg', iconAlt: 'Bebê recém-nascido.', category: 'familia' },

  // ===== ROUPAS =====
  { en: 'Camisa', emoji: '👕', icon: '/photos/shirt.jpg', iconAlt: 'Camisa pendurada em um cabide.', category: 'roupas' },
  { en: 'Pantalón', emoji: '👖', icon: '/photos/pants.jpg', iconAlt: 'Calça jeans dobrada.', category: 'roupas' },
  { en: 'Zapato', emoji: '👞', icon: '/photos/shoes.jpg', iconAlt: 'Par de sapatos de couro.', category: 'roupas' },
  { en: 'Vestido', emoji: '👗', icon: '/photos/dress.jpg', iconAlt: 'Vestido pendurado.', category: 'roupas' },
  { en: 'Chaqueta', emoji: '🧥', icon: '/photos/jacket.jpg', iconAlt: 'Jaqueta pendurada.', category: 'roupas' },
  { en: 'Sombrero', emoji: '🎩', icon: '/photos/hat.jpg', iconAlt: 'Chapéu sobre uma superfície.', category: 'roupas' },
  { en: 'Guante', emoji: '🧤', icon: '/photos/glove.jpg', iconAlt: 'Par de luvas.', category: 'roupas' },
  { en: 'Corbata', emoji: '👔', icon: '/photos/tie.jpg', iconAlt: 'Gravata listrada.', category: 'roupas' },
  { en: 'Gafas', emoji: '🕶️', icon: '/photos/sunglasses.jpg', iconAlt: 'Óculos escuros.', category: 'roupas' },
  { en: 'Botas', emoji: '🥾', icon: '/photos/boots.png', iconAlt: 'Par de botas de couro.', category: 'roupas' },

  // ===== CORES =====
  { en: 'Rojo', emoji: '🔴', icon: '/photos/red.jpg', iconAlt: 'Superfície vermelha vibrante.', category: 'cores' },
  { en: 'Azul', emoji: '🔵', icon: '/photos/blue.jpg', iconAlt: 'Superfície azul vibrante.', category: 'cores' },
  { en: 'Verde', emoji: '🟢', icon: '/photos/green.jpg', iconAlt: 'Superfície verde vibrante.', category: 'cores' },
  { en: 'Amarillo', emoji: '🟡', icon: '/photos/yellow.jpg', iconAlt: 'Superfície amarela vibrante.', category: 'cores' },
  { en: 'Negro', emoji: '⚫', icon: '/photos/black.jpg', iconAlt: 'Superfície preta.', category: 'cores' },
  { en: 'Blanco', emoji: '⚪', icon: '/photos/white.jpg', iconAlt: 'Superfície branca.', category: 'cores' },
  { en: 'Rosa', emoji: '🩷', icon: '/photos/pink.jpg', iconAlt: 'Superfície rosa vibrante.', category: 'cores' },
  { en: 'Morado', emoji: '🟣', icon: '/photos/purple.jpg', iconAlt: 'Superfície roxa vibrante.', category: 'cores' },
];

const wordsByEn = new Map(words.map((w) => [w.en, w]));

// Mesma resolução do banco de inglês: `word` é o objeto completo de words.js
// (pt, pronunciation, example, examplePt, level, tip). O ImageQuiz usa isso
// tanto para escalar a dificuldade por nível quanto para alimentar o
// WordExplanation — sem o join, o momento de ensino vinha em branco.
export const imageWords = RAW_IMAGE_WORDS
  .map((iw) => ({ ...iw, word: wordsByEn.get(iw.en) }))
  .filter((iw) => iw.word);

// Exportado só para o teste conferir que nenhuma entrada foi digitada errado
// e silenciosamente descartada pelo filter() acima.
export const RAW_IMAGE_WORDS_COUNT = RAW_IMAGE_WORDS.length;

export default imageWords;
