// Frases organizadas para jogos de montar frases e completar
// Cada frase: { en, pt, words (com explicação), level, category, blank (para completar) }

export const sentences = [
  // ===== NÍVEL 1 - Frases muito curtas =====
  {
    en: "I am happy.",
    pt: "Eu estou feliz.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "am", pt: "estou/sou" },
      { en: "happy", pt: "feliz" }
    ],
    grammar: "Em inglês, usamos 'I am' para dizer 'eu sou' ou 'eu estou'.",
    level: 1,
    category: "sentimentos"
  },
  {
    en: "I like pizza.",
    pt: "Eu gosto de pizza.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "like", pt: "gosto de" },
      { en: "pizza", pt: "pizza" }
    ],
    grammar: "Em inglês, dizemos 'I like' + algo. Não usamos 'de' como em português.",
    level: 1,
    category: "comidas"
  },
  {
    en: "I have a dog.",
    pt: "Eu tenho um cachorro.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "have", pt: "tenho" },
      { en: "a", pt: "um/uma" },
      { en: "dog", pt: "cachorro" }
    ],
    grammar: "'A' significa 'um' ou 'uma'. Usamos antes de substantivos no singular.",
    level: 1,
    category: "animais"
  },
  {
    en: "I need water.",
    pt: "Eu preciso de água.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "need", pt: "preciso de" },
      { en: "water", pt: "água" }
    ],
    grammar: "'Need' já inclui o significado de 'precisar de'. Não precisa de outra preposição.",
    level: 1,
    category: "bebidas"
  },
  {
    en: "I am hungry.",
    pt: "Eu estou com fome.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "am", pt: "estou" },
      { en: "hungry", pt: "com fome" }
    ],
    grammar: "Em inglês dizemos 'I am hungry' (eu estou faminto), não 'I have hungry'.",
    level: 1,
    category: "sentimentos"
  },
  {
    en: "I love my family.",
    pt: "Eu amo minha família.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "love", pt: "amo" },
      { en: "my", pt: "minha/meu" },
      { en: "family", pt: "família" }
    ],
    grammar: "'My' significa 'meu' ou 'minha'. Em inglês não muda com o gênero.",
    level: 1,
    category: "familia"
  },
  {
    en: "She is beautiful.",
    pt: "Ela é bonita.",
    words: [
      { en: "She", pt: "Ela" },
      { en: "is", pt: "é/está" },
      { en: "beautiful", pt: "bonita/bonito" }
    ],
    grammar: "'She is' para 'ela é/está'. 'He is' para 'ele é/está'.",
    level: 1,
    category: "frases"
  },
  {
    en: "He is tall.",
    pt: "Ele é alto.",
    words: [
      { en: "He", pt: "Ele" },
      { en: "is", pt: "é" },
      { en: "tall", pt: "alto" }
    ],
    grammar: "Adjetivos em inglês não mudam para masculino ou feminino.",
    level: 1,
    category: "frases"
  },
  {
    en: "The cat is black.",
    pt: "O gato é preto.",
    words: [
      { en: "The", pt: "O/A" },
      { en: "cat", pt: "gato" },
      { en: "is", pt: "é" },
      { en: "black", pt: "preto" }
    ],
    grammar: "'The' significa 'o', 'a', 'os' ou 'as'. Serve para todos!",
    level: 1,
    category: "animais"
  },
  {
    en: "It is cold.",
    pt: "Está frio.",
    words: [
      { en: "It", pt: "(ele/ela - para coisas)" },
      { en: "is", pt: "está" },
      { en: "cold", pt: "frio" }
    ],
    grammar: "Usamos 'It is' para falar do clima ou de coisas em geral.",
    level: 1,
    category: "frases"
  },

  // ===== NÍVEL 2 - Frases curtas =====
  {
    en: "I want coffee.",
    pt: "Eu quero café.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "want", pt: "quero" },
      { en: "coffee", pt: "café" }
    ],
    grammar: "A estrutura básica é: Sujeito + Verbo + Objeto.",
    level: 2,
    category: "bebidas"
  },
  {
    en: "I go to school.",
    pt: "Eu vou à escola.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "go", pt: "vou" },
      { en: "to", pt: "para/à" },
      { en: "school", pt: "escola" }
    ],
    grammar: "'Go to' significa 'ir para'. Sempre usamos 'to' com 'go'.",
    level: 2,
    category: "escola"
  },
  {
    en: "I eat rice every day.",
    pt: "Eu como arroz todo dia.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "eat", pt: "como" },
      { en: "rice", pt: "arroz" },
      { en: "every", pt: "todo/cada" },
      { en: "day", pt: "dia" }
    ],
    grammar: "'Every day' (duas palavras) significa 'todo dia'. É uma expressão de frequência.",
    level: 2,
    category: "comidas"
  },
  {
    en: "She likes animals.",
    pt: "Ela gosta de animais.",
    words: [
      { en: "She", pt: "Ela" },
      { en: "likes", pt: "gosta de" },
      { en: "animals", pt: "animais" }
    ],
    grammar: "Com 'he', 'she' e 'it', adicionamos 's' ao verbo: like → likes.",
    level: 2,
    category: "animais"
  },
  {
    en: "My mother is nice.",
    pt: "Minha mãe é legal.",
    words: [
      { en: "My", pt: "Minha/Meu" },
      { en: "mother", pt: "mãe" },
      { en: "is", pt: "é" },
      { en: "nice", pt: "legal/gentil" }
    ],
    grammar: "'Nice' pode significar 'legal', 'gentil' ou 'agradável'.",
    level: 2,
    category: "familia"
  },
  {
    en: "The dog is big.",
    pt: "O cachorro é grande.",
    words: [
      { en: "The", pt: "O" },
      { en: "dog", pt: "cachorro" },
      { en: "is", pt: "é" },
      { en: "big", pt: "grande" }
    ],
    grammar: "Adjetivos vêm ANTES do substantivo ou depois de 'is'.",
    level: 2,
    category: "animais"
  },
  {
    en: "I drink milk every morning.",
    pt: "Eu bebo leite toda manhã.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "drink", pt: "bebo" },
      { en: "milk", pt: "leite" },
      { en: "every", pt: "toda" },
      { en: "morning", pt: "manhã" }
    ],
    grammar: "'Every morning' = toda manhã. Expressões de tempo geralmente vão no final.",
    level: 2,
    category: "bebidas"
  },
  {
    en: "I have two brothers.",
    pt: "Eu tenho dois irmãos.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "have", pt: "tenho" },
      { en: "two", pt: "dois" },
      { en: "brothers", pt: "irmãos" }
    ],
    grammar: "Para fazer o plural em inglês, geralmente adicionamos 's': brother → brothers.",
    level: 2,
    category: "familia"
  },

  // ===== NÍVEL 3 - Frases médias =====
  {
    en: "I am going home.",
    pt: "Eu estou indo para casa.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "am", pt: "estou" },
      { en: "going", pt: "indo" },
      { en: "home", pt: "para casa" }
    ],
    grammar: "'I am going' = estou indo. 'Home' já inclui o significado de 'para casa'.",
    level: 3,
    category: "frases"
  },
  {
    en: "Can you help me?",
    pt: "Você pode me ajudar?",
    words: [
      { en: "Can", pt: "Pode" },
      { en: "you", pt: "você" },
      { en: "help", pt: "ajudar" },
      { en: "me", pt: "me" }
    ],
    grammar: "'Can' é usado para pedir algo ou falar de habilidade. A pergunta inverte: 'Can you...?'",
    level: 3,
    category: "frases"
  },
  {
    en: "What time is it?",
    pt: "Que horas são?",
    words: [
      { en: "What", pt: "Que/Qual" },
      { en: "time", pt: "horas/tempo" },
      { en: "is", pt: "são" },
      { en: "it", pt: "(pronome)" }
    ],
    grammar: "Pergunta muito útil no dia a dia. 'What time' = que horas.",
    level: 3,
    category: "perguntas"
  },
  {
    en: "Where do you live?",
    pt: "Onde você mora?",
    words: [
      { en: "Where", pt: "Onde" },
      { en: "do", pt: "(auxiliar)" },
      { en: "you", pt: "você" },
      { en: "live", pt: "mora" }
    ],
    grammar: "Em perguntas, usamos 'do' antes de 'you': 'Where do you...?'",
    level: 3,
    category: "perguntas"
  },
  {
    en: "I live in a big city.",
    pt: "Eu moro em uma cidade grande.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "live", pt: "moro" },
      { en: "in", pt: "em" },
      { en: "a", pt: "uma" },
      { en: "big", pt: "grande" },
      { en: "city", pt: "cidade" }
    ],
    grammar: "Em inglês, o adjetivo vem ANTES do substantivo: 'big city' (não 'city big').",
    level: 3,
    category: "lugares"
  },
  {
    en: "I wake up at seven.",
    pt: "Eu acordo às sete.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "wake", pt: "acordo" },
      { en: "up", pt: "(partícula)" },
      { en: "at", pt: "às" },
      { en: "seven", pt: "sete" }
    ],
    grammar: "'Wake up' é um phrasal verb que significa 'acordar'. 'At' é usado com horários.",
    level: 3,
    category: "frases"
  },
  {
    en: "Do you like chocolate?",
    pt: "Você gosta de chocolate?",
    words: [
      { en: "Do", pt: "(auxiliar)" },
      { en: "you", pt: "você" },
      { en: "like", pt: "gosta de" },
      { en: "chocolate", pt: "chocolate" }
    ],
    grammar: "Para fazer perguntas com 'you', começamos com 'Do': 'Do you like...?'",
    level: 3,
    category: "comidas"
  },
  {
    en: "I don't like snakes.",
    pt: "Eu não gosto de cobras.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "don't", pt: "não" },
      { en: "like", pt: "gosto de" },
      { en: "snakes", pt: "cobras" }
    ],
    grammar: "'Don't' é a forma curta de 'do not'. Usamos para negar: 'I don't like...'",
    level: 3,
    category: "animais"
  },

  // ===== NÍVEL 4 - Frases mais longas =====
  {
    en: "I am learning English at home.",
    pt: "Eu estou aprendendo inglês em casa.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "am", pt: "estou" },
      { en: "learning", pt: "aprendendo" },
      { en: "English", pt: "inglês" },
      { en: "at", pt: "em" },
      { en: "home", pt: "casa" }
    ],
    grammar: "'I am + verbo com -ing' = eu estou fazendo algo agora (presente contínuo).",
    level: 4,
    category: "escola"
  },
  {
    en: "She is reading a book.",
    pt: "Ela está lendo um livro.",
    words: [
      { en: "She", pt: "Ela" },
      { en: "is", pt: "está" },
      { en: "reading", pt: "lendo" },
      { en: "a", pt: "um" },
      { en: "book", pt: "livro" }
    ],
    grammar: "'She is + verbo com -ing' = ela está fazendo algo (presente contínuo).",
    level: 4,
    category: "escola"
  },
  {
    en: "We go to the park on Sunday.",
    pt: "Nós vamos ao parque no domingo.",
    words: [
      { en: "We", pt: "Nós" },
      { en: "go", pt: "vamos" },
      { en: "to", pt: "ao" },
      { en: "the", pt: "o" },
      { en: "park", pt: "parque" },
      { en: "on", pt: "no" },
      { en: "Sunday", pt: "domingo" }
    ],
    grammar: "Usamos 'on' com dias da semana: on Monday, on Tuesday, on Sunday.",
    level: 4,
    category: "lugares"
  },
  {
    en: "My father works in an office.",
    pt: "Meu pai trabalha em um escritório.",
    words: [
      { en: "My", pt: "Meu" },
      { en: "father", pt: "pai" },
      { en: "works", pt: "trabalha" },
      { en: "in", pt: "em" },
      { en: "an", pt: "um" },
      { en: "office", pt: "escritório" }
    ],
    grammar: "'An' é usado antes de palavras que começam com som de vogal: an office, an apple.",
    level: 4,
    category: "trabalho"
  },
  {
    en: "I want to buy a new shirt.",
    pt: "Eu quero comprar uma camisa nova.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "want", pt: "quero" },
      { en: "to", pt: "(para)" },
      { en: "buy", pt: "comprar" },
      { en: "a", pt: "uma" },
      { en: "new", pt: "nova" },
      { en: "shirt", pt: "camisa" }
    ],
    grammar: "'Want to + verbo' = querer fazer algo. Ex: want to buy, want to eat.",
    level: 4,
    category: "roupas"
  },
  {
    en: "There are three cats in the garden.",
    pt: "Há três gatos no jardim.",
    words: [
      { en: "There", pt: "Há/Existem" },
      { en: "are", pt: "(verbo ser - plural)" },
      { en: "three", pt: "três" },
      { en: "cats", pt: "gatos" },
      { en: "in", pt: "no" },
      { en: "the", pt: "o" },
      { en: "garden", pt: "jardim" }
    ],
    grammar: "'There are' = há/existem (plural). 'There is' = há/existe (singular).",
    level: 4,
    category: "animais"
  },
  {
    en: "I usually eat breakfast at eight.",
    pt: "Eu geralmente como café da manhã às oito.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "usually", pt: "geralmente" },
      { en: "eat", pt: "como" },
      { en: "breakfast", pt: "café da manhã" },
      { en: "at", pt: "às" },
      { en: "eight", pt: "oito" }
    ],
    grammar: "'Usually' (geralmente) é um advérbio de frequência. Fica entre o sujeito e o verbo.",
    level: 4,
    category: "comidas"
  },

  // ===== NÍVEL 5 - Frases complexas =====
  {
    en: "I would like a glass of water, please.",
    pt: "Eu gostaria de um copo de água, por favor.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "would", pt: "gostaria" },
      { en: "like", pt: "de" },
      { en: "a", pt: "um" },
      { en: "glass", pt: "copo" },
      { en: "of", pt: "de" },
      { en: "water", pt: "água" },
      { en: "please", pt: "por favor" }
    ],
    grammar: "'I would like' é mais educado que 'I want'. Use em restaurantes e lojas.",
    level: 5,
    category: "bebidas"
  },
  {
    en: "How much does this cost?",
    pt: "Quanto isso custa?",
    words: [
      { en: "How", pt: "Quanto" },
      { en: "much", pt: "(quantidade)" },
      { en: "does", pt: "(auxiliar)" },
      { en: "this", pt: "isso" },
      { en: "cost", pt: "custa" }
    ],
    grammar: "'How much' para perguntar preço. 'Does' é o auxiliar para 'this/he/she/it'.",
    level: 5,
    category: "perguntas"
  },
  {
    en: "I am going to the store to buy milk.",
    pt: "Eu estou indo à loja comprar leite.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "am", pt: "estou" },
      { en: "going", pt: "indo" },
      { en: "to", pt: "à" },
      { en: "the", pt: "a" },
      { en: "store", pt: "loja" },
      { en: "to", pt: "para" },
      { en: "buy", pt: "comprar" },
      { en: "milk", pt: "leite" }
    ],
    grammar: "'I am going to' pode indicar futuro ('eu vou fazer') ou movimento ('estou indo para').",
    level: 5,
    category: "frases"
  },
  {
    en: "Can I have the menu, please?",
    pt: "Posso ver o cardápio, por favor?",
    words: [
      { en: "Can", pt: "Posso" },
      { en: "I", pt: "eu" },
      { en: "have", pt: "ter/ver" },
      { en: "the", pt: "o" },
      { en: "menu", pt: "cardápio" },
      { en: "please", pt: "por favor" }
    ],
    grammar: "'Can I have...?' é uma forma educada de pedir algo. Muito usado em restaurantes.",
    level: 5,
    category: "frases"
  },
  {
    en: "I have been studying English for two months.",
    pt: "Eu tenho estudado inglês por dois meses.",
    words: [
      { en: "I", pt: "Eu" },
      { en: "have", pt: "tenho" },
      { en: "been", pt: "(auxiliar)" },
      { en: "studying", pt: "estudado" },
      { en: "English", pt: "inglês" },
      { en: "for", pt: "por/há" },
      { en: "two", pt: "dois" },
      { en: "months", pt: "meses" }
    ],
    grammar: "'Have been + -ing' indica algo que começou no passado e continua até agora.",
    level: 5,
    category: "escola"
  },
];

// Frases para o jogo de completar (fill in the blanks)
export const fillBlanks = [
  {
    sentence: "I _____ water.",
    answer: "need",
    options: ["need", "dog", "house", "morning"],
    fullSentence: "I need water.",
    translation: "Eu preciso de água.",
    explanation: "'Need' significa 'precisar'. A frase fala sobre necessidade de água.",
    level: 1
  },
  {
    sentence: "She _____ a cat.",
    answer: "has",
    options: ["has", "go", "red", "big"],
    fullSentence: "She has a cat.",
    translation: "Ela tem um gato.",
    explanation: "'Has' é a forma de 'have' para he/she/it. Indica posse.",
    level: 1
  },
  {
    sentence: "I _____ to school.",
    answer: "go",
    options: ["go", "eat", "sleep", "have"],
    fullSentence: "I go to school.",
    translation: "Eu vou à escola.",
    explanation: "'Go to' significa 'ir para'. 'Go' indica movimento.",
    level: 1
  },
  {
    sentence: "The sky is _____.",
    answer: "blue",
    options: ["blue", "eat", "dog", "happy"],
    fullSentence: "The sky is blue.",
    translation: "O céu é azul.",
    explanation: "'Blue' é uma cor. 'Sky' significa 'céu'.",
    level: 1
  },
  {
    sentence: "I _____ pizza.",
    answer: "like",
    options: ["like", "run", "big", "cold"],
    fullSentence: "I like pizza.",
    translation: "Eu gosto de pizza.",
    explanation: "'Like' significa 'gostar de'. Não precisa de preposição em inglês.",
    level: 1
  },
  {
    sentence: "He is very _____.",
    answer: "tired",
    options: ["tired", "water", "book", "door"],
    fullSentence: "He is very tired.",
    translation: "Ele está muito cansado.",
    explanation: "'Tired' é um adjetivo que significa 'cansado'. 'Very' intensifica.",
    level: 2
  },
  {
    sentence: "I _____ breakfast at seven.",
    answer: "eat",
    options: ["eat", "sleep", "run", "close"],
    fullSentence: "I eat breakfast at seven.",
    translation: "Eu como café da manhã às sete.",
    explanation: "'Eat' significa 'comer'. 'Breakfast' é a primeira refeição do dia.",
    level: 2
  },
  {
    sentence: "She _____ English very well.",
    answer: "speaks",
    options: ["speaks", "eats", "runs", "sleeps"],
    fullSentence: "She speaks English very well.",
    translation: "Ela fala inglês muito bem.",
    explanation: "'Speaks' é 'speak' com 's' porque o sujeito é 'she'. 'Very well' = muito bem.",
    level: 2
  },
  {
    sentence: "We _____ in a big house.",
    answer: "live",
    options: ["live", "eat", "run", "play"],
    fullSentence: "We live in a big house.",
    translation: "Nós moramos em uma casa grande.",
    explanation: "'Live' significa 'morar' ou 'viver'. 'In' indica localização.",
    level: 2
  },
  {
    sentence: "The children are _____ in the park.",
    answer: "playing",
    options: ["playing", "sleeping", "eating", "reading"],
    fullSentence: "The children are playing in the park.",
    translation: "As crianças estão brincando no parque.",
    explanation: "'Are playing' = estão brincando (presente contínuo). 'Children' é o plural de 'child'.",
    level: 3
  },
  {
    sentence: "I _____ to buy a new phone.",
    answer: "want",
    options: ["want", "have", "make", "give"],
    fullSentence: "I want to buy a new phone.",
    translation: "Eu quero comprar um celular novo.",
    explanation: "'Want to + verbo' = querer fazer algo.",
    level: 3
  },
  {
    sentence: "Can you _____ the door, please?",
    answer: "open",
    options: ["open", "eat", "drink", "sleep"],
    fullSentence: "Can you open the door, please?",
    translation: "Você pode abrir a porta, por favor?",
    explanation: "'Open' significa 'abrir'. 'Can you...?' é um pedido educado.",
    level: 3
  },
  {
    sentence: "My grandmother _____ delicious cake.",
    answer: "makes",
    options: ["makes", "runs", "reads", "swims"],
    fullSentence: "My grandmother makes delicious cake.",
    translation: "Minha avó faz bolo delicioso.",
    explanation: "'Makes' = faz/prepara. Com she/he, o verbo ganha 's'.",
    level: 3
  },
  {
    sentence: "I have _____ studying English for two months.",
    answer: "been",
    options: ["been", "was", "is", "are"],
    fullSentence: "I have been studying English for two months.",
    translation: "Eu tenho estudado inglês por dois meses.",
    explanation: "'Have been + -ing' indica uma ação que começou no passado e continua.",
    level: 5
  },
  {
    sentence: "_____ you like some coffee?",
    answer: "Would",
    options: ["Would", "Is", "Are", "Do"],
    fullSentence: "Would you like some coffee?",
    translation: "Você gostaria de um café?",
    explanation: "'Would you like...?' é uma forma educada de oferecer algo.",
    level: 5
  },
];

// Frases para verdadeiro ou falso
export const trueFalse = [
  { word: "Apple", translation: "Maçã", isCorrect: true, correctTranslation: "Maçã", level: 1 },
  { word: "Dog", translation: "Gato", isCorrect: false, correctTranslation: "Cachorro", level: 1 },
  { word: "Blue", translation: "Azul", isCorrect: true, correctTranslation: "Azul", level: 1 },
  { word: "House", translation: "Cachorro", isCorrect: false, correctTranslation: "Casa", level: 1 },
  { word: "Cat", translation: "Gato", isCorrect: true, correctTranslation: "Gato", level: 1 },
  { word: "Water", translation: "Água", isCorrect: true, correctTranslation: "Água", level: 1 },
  { word: "Mother", translation: "Pai", isCorrect: false, correctTranslation: "Mãe", level: 1 },
  { word: "Red", translation: "Vermelho", isCorrect: true, correctTranslation: "Vermelho", level: 1 },
  { word: "Book", translation: "Caderno", isCorrect: false, correctTranslation: "Livro", level: 2 },
  { word: "Happy", translation: "Feliz", isCorrect: true, correctTranslation: "Feliz", level: 2 },
  { word: "Car", translation: "Carro", isCorrect: true, correctTranslation: "Carro", level: 2 },
  { word: "Bread", translation: "Arroz", isCorrect: false, correctTranslation: "Pão", level: 2 },
  { word: "Sister", translation: "Irmã", isCorrect: true, correctTranslation: "Irmã", level: 2 },
  { word: "School", translation: "Hospital", isCorrect: false, correctTranslation: "Escola", level: 2 },
  { word: "Fish", translation: "Peixe", isCorrect: true, correctTranslation: "Peixe", level: 2 },
  { word: "Milk", translation: "Suco", isCorrect: false, correctTranslation: "Leite", level: 2 },
  { word: "Head", translation: "Cabeça", isCorrect: true, correctTranslation: "Cabeça", level: 3 },
  { word: "Shirt", translation: "Sapato", isCorrect: false, correctTranslation: "Camisa", level: 3 },
  { word: "Kitchen", translation: "Cozinha", isCorrect: true, correctTranslation: "Cozinha", level: 3 },
  { word: "Airplane", translation: "Barco", isCorrect: false, correctTranslation: "Avião", level: 3 },
  { word: "Hungry", translation: "Com fome", isCorrect: true, correctTranslation: "Com fome", level: 3 },
  { word: "Library", translation: "Livraria", isCorrect: false, correctTranslation: "Biblioteca", level: 3 },
  { word: "Tired", translation: "Cansado", isCorrect: true, correctTranslation: "Cansado", level: 4 },
  { word: "Money", translation: "Comida", isCorrect: false, correctTranslation: "Dinheiro", level: 4 },
];

// Frases para tradução (quiz de múltipla escolha)
export const translationQuizzes = [
  // Inglês → Português
  {
    direction: "en-pt",
    question: "Good morning!",
    correct: "Bom dia!",
    options: ["Bom dia!", "Boa noite!", "Boa tarde!", "Olá!"],
    level: 1
  },
  {
    direction: "en-pt",
    question: "I am hungry.",
    correct: "Eu estou com fome.",
    options: ["Eu estou com fome.", "Eu estou com sede.", "Eu estou cansado.", "Eu estou feliz."],
    level: 1
  },
  {
    direction: "en-pt",
    question: "What are you doing?",
    correct: "O que você está fazendo?",
    options: ["Onde você mora?", "O que você está fazendo?", "Que horas são?", "Você está bem?"],
    level: 2
  },
  {
    direction: "en-pt",
    question: "I have two brothers.",
    correct: "Eu tenho dois irmãos.",
    options: ["Eu tenho dois irmãos.", "Eu tenho duas irmãs.", "Eu tenho dois gatos.", "Eu tenho dois amigos."],
    level: 2
  },
  {
    direction: "en-pt",
    question: "Where is the bathroom?",
    correct: "Onde fica o banheiro?",
    options: ["Onde fica o banheiro?", "Onde fica a escola?", "Onde fica o hospital?", "Onde fica a loja?"],
    level: 3
  },
  {
    direction: "en-pt",
    question: "I would like a glass of water.",
    correct: "Eu gostaria de um copo de água.",
    options: ["Eu gostaria de um copo de água.", "Eu gosto de beber água.", "Eu preciso de água.", "Eu quero comprar água."],
    level: 4
  },

  // Português → Inglês
  {
    direction: "pt-en",
    question: "Eu preciso de ajuda.",
    correct: "I need help.",
    options: ["I need help.", "I like help.", "I make help.", "I am help."],
    wrongExplanations: {
      "I like help.": "'Like' significa 'gostar'. Para dizer 'precisar', usamos 'need'.",
      "I make help.": "'Make' significa 'fazer/criar'. Para 'precisar', usamos 'need'.",
      "I am help.": "'Am' é uma forma de 'ser/estar'. Para 'precisar', usamos 'need'."
    },
    level: 1
  },
  {
    direction: "pt-en",
    question: "Eu gosto de pizza.",
    correct: "I like pizza.",
    options: ["I like pizza.", "I want pizza.", "I need pizza.", "I eat pizza."],
    wrongExplanations: {
      "I want pizza.": "'Want' significa 'querer', não 'gostar'. 'Gostar' é 'like'.",
      "I need pizza.": "'Need' significa 'precisar', não 'gostar'. 'Gostar' é 'like'.",
      "I eat pizza.": "'Eat' significa 'comer', não 'gostar'. 'Gostar' é 'like'."
    },
    level: 1
  },
  {
    direction: "pt-en",
    question: "Onde você mora?",
    correct: "Where do you live?",
    options: ["Where do you live?", "What do you like?", "How are you?", "Where is you?"],
    wrongExplanations: {
      "What do you like?": "'What do you like?' significa 'Do que você gosta?'. 'Onde' é 'where'.",
      "How are you?": "'How are you?' significa 'Como você está?'. 'Onde' é 'where'.",
      "Where is you?": "Com 'you', usamos 'do': 'Where do you live?'. 'Is' é para he/she/it."
    },
    level: 2
  },
  {
    direction: "pt-en",
    question: "Que horas são?",
    correct: "What time is it?",
    options: ["What time is it?", "How time is it?", "Where time is it?", "When time is it?"],
    wrongExplanations: {
      "How time is it?": "'How' significa 'como'. Para 'que horas', usamos 'What time'.",
      "Where time is it?": "'Where' significa 'onde'. Para 'que horas', usamos 'What time'.",
      "When time is it?": "'When' significa 'quando'. A forma correta é 'What time is it?'."
    },
    level: 2
  },
  {
    direction: "pt-en",
    question: "Eu estou aprendendo inglês.",
    correct: "I am learning English.",
    options: ["I am learning English.", "I learn English.", "I is learning English.", "I learning English."],
    wrongExplanations: {
      "I learn English.": "Essa frase está gramaticamente correta, mas para 'estou aprendendo' (ação no momento), usamos 'I am learning'.",
      "I is learning English.": "Com 'I', usamos 'am', não 'is'. 'Is' é para he/she/it.",
      "I learning English.": "Falta o verbo 'am'. O correto é 'I am learning English'."
    },
    level: 3
  },
  {
    direction: "pt-en",
    question: "Minha mãe cozinha muito bem.",
    correct: "My mother cooks very well.",
    options: ["My mother cooks very well.", "My mother cook very well.", "My mother is cook very well.", "My mother cooking very well."],
    wrongExplanations: {
      "My mother cook very well.": "Com 'she/he/it' (e nomes), o verbo ganha 's': cooks, not cook.",
      "My mother is cook very well.": "Não usamos 'is' + verbo base. O correto é 'My mother cooks...'",
      "My mother cooking very well.": "Falta o verbo auxiliar. Seria 'My mother is cooking...' ou 'My mother cooks...'"
    },
    level: 4
  },
];
