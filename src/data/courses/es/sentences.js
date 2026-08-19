// Frases do curso de Espanhol (es-pt).
//
// MESMO CONTRATO do banco de inglês (src/data/sentences.js) — data.test.js
// pina isso nos dois cursos:
//   sentences          { en, pt, words: [{en, pt}], grammar, level }
//   fillBlanks         { sentence, answer, options, fullSentence, translation, explanation, level }
//   trueFalse          { word, translation, isCorrect, correctTranslation, level }
//   translationQuizzes { direction, question, correct, options, level }
//
// `en` guarda o texto no idioma-alvo (espanhol) — ver a nota em words.js.
// A ordem de `words` é a ordem correta da frase: o SentenceBuilder embaralha
// as peças e compara com ela.

export const sentences = [
  // ===== NÍVEL 1 — frases muito curtas =====
  {
    en: "Yo soy feliz.",
    pt: "Eu sou feliz.",
    words: [
      { en: "Yo", pt: "Eu" },
      { en: "soy", pt: "sou" },
      { en: "feliz", pt: "feliz" }
    ],
    grammar: "'Ser' indica algo permanente. Para humor passageiro use 'estoy feliz'.",
    level: 1
  },
  {
    en: "Ella come pan.",
    pt: "Ela come pão.",
    words: [
      { en: "Ella", pt: "Ela" },
      { en: "come", pt: "come" },
      { en: "pan", pt: "pão" }
    ],
    grammar: "Verbos em -er fazem 'come' na 3ª pessoa, igual ao português.",
    level: 1
  },
  {
    en: "El gato duerme.",
    pt: "O gato dorme.",
    words: [
      { en: "El", pt: "O" },
      { en: "gato", pt: "gato" },
      { en: "duerme", pt: "dorme" }
    ],
    grammar: "'Dormir' vira 'duerme' com ditongo — mudança comum em espanhol.",
    level: 1
  },
  {
    en: "Tengo mucha hambre.",
    pt: "Estou com muita fome.",
    words: [
      { en: "Tengo", pt: "Tenho" },
      { en: "mucha", pt: "muita" },
      { en: "hambre", pt: "fome" }
    ],
    grammar: "Fome se diz com 'tener', nunca com 'estar': 'tengo hambre'.",
    level: 1
  },
  {
    en: "Buenos días señora.",
    pt: "Bom dia, senhora.",
    words: [
      { en: "Buenos", pt: "Bons" },
      { en: "días", pt: "dias" },
      { en: "señora", pt: "senhora" }
    ],
    grammar: "'Buenos días' vai sempre no plural em espanhol.",
    level: 1
  },

  // ===== NÍVEL 2 =====
  {
    en: "Mi casa es grande.",
    pt: "Minha casa é grande.",
    words: [
      { en: "Mi", pt: "Minha" },
      { en: "casa", pt: "casa" },
      { en: "es", pt: "é" },
      { en: "grande", pt: "grande" }
    ],
    grammar: "'Mi' não muda com o gênero: 'mi casa', 'mi libro'.",
    level: 2
  },
  {
    en: "El agua está fría.",
    pt: "A água está fria.",
    words: [
      { en: "El", pt: "A" },
      { en: "agua", pt: "água" },
      { en: "está", pt: "está" },
      { en: "fría", pt: "fria" }
    ],
    grammar: "'Agua' é feminina mas leva 'el' por começar com 'a' tônico.",
    level: 2
  },
  {
    en: "Nosotros vamos al parque.",
    pt: "Nós vamos ao parque.",
    words: [
      { en: "Nosotros", pt: "Nós" },
      { en: "vamos", pt: "vamos" },
      { en: "al", pt: "ao" },
      { en: "parque", pt: "parque" }
    ],
    grammar: "'A' + 'el' se juntam em 'al', igual a 'ao' do português.",
    level: 2
  },
  {
    en: "No entiendo la pregunta.",
    pt: "Não entendo a pergunta.",
    words: [
      { en: "No", pt: "Não" },
      { en: "entiendo", pt: "entendo" },
      { en: "la", pt: "a" },
      { en: "pregunta", pt: "pergunta" }
    ],
    grammar: "A negação é só 'no' antes do verbo — não existe 'não... não'.",
    level: 2
  },
  {
    en: "Mi hermano trabaja aquí.",
    pt: "Meu irmão trabalha aqui.",
    words: [
      { en: "Mi", pt: "Meu" },
      { en: "hermano", pt: "irmão" },
      { en: "trabaja", pt: "trabalha" },
      { en: "aquí", pt: "aqui" }
    ],
    grammar: "O 'h' de 'hermano' é mudo: fale 'ermáno'.",
    level: 2
  },

  // ===== NÍVEL 3 =====
  {
    en: "Quiero un café con leche.",
    pt: "Quero um café com leite.",
    words: [
      { en: "Quiero", pt: "Quero" },
      { en: "un", pt: "um" },
      { en: "café", pt: "café" },
      { en: "con", pt: "com" },
      { en: "leche", pt: "leite" }
    ],
    grammar: "'Querer' vira 'quiero' na 1ª pessoa, com ditongo 'ie'.",
    level: 3
  },
  {
    en: "¿Dónde está la estación?",
    pt: "Onde fica a estação?",
    words: [
      { en: "¿Dónde", pt: "Onde" },
      { en: "está", pt: "fica" },
      { en: "la", pt: "a" },
      { en: "estación?", pt: "estação?" }
    ],
    grammar: "Perguntas abrem com '¿' invertido — obrigatório na escrita.",
    level: 3
  },
  {
    en: "Ella tiene veinte años.",
    pt: "Ela tem vinte anos.",
    words: [
      { en: "Ella", pt: "Ela" },
      { en: "tiene", pt: "tem" },
      { en: "veinte", pt: "vinte" },
      { en: "años", pt: "anos" }
    ],
    grammar: "Idade sempre com 'tener'. 'Es veinte años' está errado.",
    level: 3
  },
  {
    en: "Los niños juegan en el jardín.",
    pt: "As crianças brincam no jardim.",
    words: [
      { en: "Los", pt: "As" },
      { en: "niños", pt: "crianças" },
      { en: "juegan", pt: "brincam" },
      { en: "en", pt: "no" },
      { en: "el", pt: "o" },
      { en: "jardín", pt: "jardim" }
    ],
    grammar: "'Jugar' cobre 'jogar' e 'brincar' — o contexto decide.",
    level: 3
  },
  {
    en: "Hoy hace mucho calor.",
    pt: "Hoje está muito calor.",
    words: [
      { en: "Hoy", pt: "Hoje" },
      { en: "hace", pt: "faz" },
      { en: "mucho", pt: "muito" },
      { en: "calor", pt: "calor" }
    ],
    grammar: "Clima usa 'hacer': 'hace calor', 'hace frío'.",
    level: 3
  },

  // ===== NÍVEL 4 =====
  {
    en: "Me gusta mucho la música española.",
    pt: "Gosto muito de música espanhola.",
    words: [
      { en: "Me", pt: "Me" },
      { en: "gusta", pt: "agrada" },
      { en: "mucho", pt: "muito" },
      { en: "la", pt: "a" },
      { en: "música", pt: "música" },
      { en: "española", pt: "espanhola" }
    ],
    grammar: "'Me gusta' é literalmente 'me agrada' — quem gosta é o objeto!",
    level: 4
  },
  {
    en: "Voy a comprar pan mañana.",
    pt: "Vou comprar pão amanhã.",
    words: [
      { en: "Voy", pt: "Vou" },
      { en: "a", pt: "a" },
      { en: "comprar", pt: "comprar" },
      { en: "pan", pt: "pão" },
      { en: "mañana", pt: "amanhã" }
    ],
    grammar: "Futuro próximo: 'ir a' + infinitivo, igual ao português.",
    level: 4
  },
  {
    en: "El trabajo en la oficina es tranquilo.",
    pt: "O trabalho no escritório é tranquilo.",
    words: [
      { en: "El", pt: "O" },
      { en: "trabajo", pt: "trabalho" },
      { en: "en", pt: "no" },
      { en: "la", pt: "o" },
      { en: "oficina", pt: "escritório" },
      { en: "es", pt: "é" },
      { en: "tranquilo", pt: "tranquilo" }
    ],
    grammar: "Atenção: 'oficina' é escritório! Oficina mecânica é 'taller'.",
    level: 4
  },
  {
    en: "Ayer estuve muy cansado.",
    pt: "Ontem eu estava muito cansado.",
    words: [
      { en: "Ayer", pt: "Ontem" },
      { en: "estuve", pt: "estive" },
      { en: "muy", pt: "muito" },
      { en: "cansado", pt: "cansado" }
    ],
    grammar: "'Muy' antes de adjetivo; 'mucho' antes de substantivo.",
    level: 4
  },
  {
    en: "Necesito aprender español rápido.",
    pt: "Preciso aprender espanhol rápido.",
    words: [
      { en: "Necesito", pt: "Preciso" },
      { en: "aprender", pt: "aprender" },
      { en: "español", pt: "espanhol" },
      { en: "rápido", pt: "rápido" }
    ],
    grammar: "'Necesitar' não pede preposição: 'necesito agua', não 'de agua'.",
    level: 4
  },

  // ===== NÍVEL 5 =====
  {
    en: "Si tengo tiempo iré contigo.",
    pt: "Se eu tiver tempo, irei com você.",
    words: [
      { en: "Si", pt: "Se" },
      { en: "tengo", pt: "tenho" },
      { en: "tiempo", pt: "tempo" },
      { en: "iré", pt: "irei" },
      { en: "contigo", pt: "com você" }
    ],
    grammar: "'Si' sem acento é 'se'; 'sí' com acento é 'sim'.",
    level: 5
  },
  {
    en: "La película fue un gran éxito.",
    pt: "O filme foi um grande sucesso.",
    words: [
      { en: "La", pt: "O" },
      { en: "película", pt: "filme" },
      { en: "fue", pt: "foi" },
      { en: "un", pt: "um" },
      { en: "gran", pt: "grande" },
      { en: "éxito", pt: "sucesso" }
    ],
    grammar: "'Éxito' é sucesso, não saída. Saída é 'salida'.",
    level: 5
  },
  {
    en: "Ojalá que llueva esta noche.",
    pt: "Tomara que chova esta noite.",
    words: [
      { en: "Ojalá", pt: "Tomara" },
      { en: "que", pt: "que" },
      { en: "llueva", pt: "chova" },
      { en: "esta", pt: "esta" },
      { en: "noche", pt: "noite" }
    ],
    grammar: "'Ojalá' sempre pede subjuntivo depois: 'llueva', não 'llueve'.",
    level: 5
  },
];

export const fillBlanks = [
  {
    sentence: "Yo _____ agua todos los días.",
    answer: "bebo",
    options: ["bebo", "casa", "verde", "libro"],
    fullSentence: "Yo bebo agua todos los días.",
    translation: "Eu bebo água todos os dias.",
    explanation: "'Beber' na 1ª pessoa é 'bebo', igual ao português.",
    level: 1
  },
  {
    sentence: "El _____ corre en el parque.",
    answer: "perro",
    options: ["perro", "pan", "leche", "azul"],
    fullSentence: "El perro corre en el parque.",
    translation: "O cachorro corre no parque.",
    explanation: "'Perro' é cachorro. Cuidado: 'pero' com um 'r' só significa 'mas'.",
    level: 1
  },
  {
    sentence: "¡Hola! Mi _____ es María.",
    answer: "nombre",
    options: ["nombre", "gato", "agua", "rojo"],
    fullSentence: "¡Hola! Mi nombre es María.",
    translation: "Olá! Meu nome é María.",
    explanation: "'Nombre' é nome. Repare no 'b' onde o português tem 'm'.",
    level: 1
  },
  {
    sentence: "Tengo _____, quiero comer algo.",
    answer: "hambre",
    options: ["hambre", "libro", "silla", "verde"],
    fullSentence: "Tengo hambre, quiero comer algo.",
    translation: "Estou com fome, quero comer algo.",
    explanation: "Fome se expressa com 'tener hambre', nunca com 'estar'.",
    level: 2
  },
  {
    sentence: "Trabajo en una _____ del centro.",
    answer: "oficina",
    options: ["oficina", "manzana", "camisa", "pierna"],
    fullSentence: "Trabajo en una oficina del centro.",
    translation: "Trabalho num escritório do centro.",
    explanation: "Falso amigo clássico: 'oficina' é escritório, não oficina mecânica.",
    level: 3
  },
  {
    sentence: "Ella _____ veinte años.",
    answer: "tiene",
    options: ["tiene", "es", "está", "hace"],
    fullSentence: "Ella tiene veinte años.",
    translation: "Ela tem vinte anos.",
    explanation: "Idade sempre com 'tener'. 'Ella es veinte años' está errado.",
    level: 3
  },
  {
    sentence: "Hoy _____ mucho frío en la calle.",
    answer: "hace",
    options: ["hace", "tiene", "es", "va"],
    fullSentence: "Hoy hace mucho frío en la calle.",
    translation: "Hoje está muito frio na rua.",
    explanation: "Clima se descreve com 'hacer': 'hace frío', 'hace calor'.",
    level: 4
  },
  {
    sentence: "El proyecto fue un gran _____.",
    answer: "éxito",
    options: ["éxito", "salida", "trabajo", "pueblo"],
    fullSentence: "El proyecto fue un gran éxito.",
    translation: "O projeto foi um grande sucesso.",
    explanation: "'Éxito' significa sucesso. A saída de um lugar é 'salida'.",
    level: 5
  },
];

export const trueFalse = [
  { word: "Hola", translation: "Olá", isCorrect: true, correctTranslation: "Olá", level: 1 },
  { word: "Perro", translation: "Gato", isCorrect: false, correctTranslation: "Cachorro", level: 1 },
  { word: "Agua", translation: "Água", isCorrect: true, correctTranslation: "Água", level: 1 },
  { word: "Rojo", translation: "Azul", isCorrect: false, correctTranslation: "Vermelho", level: 1 },
  { word: "Gato", translation: "Gato", isCorrect: true, correctTranslation: "Gato", level: 1 },
  { word: "Pan", translation: "Pão", isCorrect: true, correctTranslation: "Pão", level: 1 },
  { word: "Casa", translation: "Casa", isCorrect: true, correctTranslation: "Casa", level: 1 },
  { word: "Leche", translation: "Suco", isCorrect: false, correctTranslation: "Leite", level: 2 },
  { word: "Verde", translation: "Verde", isCorrect: true, correctTranslation: "Verde", level: 2 },
  { word: "Hermano", translation: "Primo", isCorrect: false, correctTranslation: "Irmão", level: 2 },
  { word: "Ventana", translation: "Janela", isCorrect: true, correctTranslation: "Janela", level: 2 },
  { word: "Calle", translation: "Calo", isCorrect: false, correctTranslation: "Rua", level: 3 },
  { word: "Oficina", translation: "Oficina mecânica", isCorrect: false, correctTranslation: "Escritório", level: 3 },
  { word: "Vaso", translation: "Copo", isCorrect: true, correctTranslation: "Copo", level: 3 },
  { word: "Ratón", translation: "Rato", isCorrect: true, correctTranslation: "Rato", level: 3 },
  { word: "Éxito", translation: "Saída", isCorrect: false, correctTranslation: "Sucesso", level: 4 },
  { word: "Postre", translation: "Sobremesa", isCorrect: true, correctTranslation: "Sobremesa", level: 4 },
  { word: "Cena", translation: "Cena de teatro", isCorrect: false, correctTranslation: "Jantar", level: 4 },
  { word: "Embarazada", translation: "Envergonhada", isCorrect: false, correctTranslation: "Grávida", level: 5 },
  { word: "Exquisito", translation: "Esquisito", isCorrect: false, correctTranslation: "Delicioso", level: 5 },
  { word: "Trabajo", translation: "Trabalho", isCorrect: true, correctTranslation: "Trabalho", level: 3 },
  { word: "Salsa", translation: "Salsinha", isCorrect: false, correctTranslation: "Molho", level: 5 },
];

export const translationQuizzes = [
  // Espanhol → Português
  {
    direction: "en-pt",
    question: "¡Buenos días!",
    correct: "Bom dia!",
    options: ["Bom dia!", "Boa noite!", "Boa tarde!", "Até logo!"],
    level: 1
  },
  {
    direction: "en-pt",
    question: "Gracias",
    correct: "Obrigado",
    options: ["Obrigado", "Por favor", "Desculpe", "De nada"],
    level: 1
  },
  {
    direction: "en-pt",
    question: "¿Cuánto cuesta?",
    correct: "Quanto custa?",
    options: ["Quanto custa?", "Onde fica?", "Como vai?", "Que horas são?"],
    level: 2
  },
  {
    direction: "en-pt",
    question: "Tengo hambre",
    correct: "Estou com fome",
    options: ["Estou com fome", "Estou com sede", "Estou cansado", "Estou feliz"],
    level: 2
  },
  {
    direction: "en-pt",
    question: "La oficina",
    correct: "O escritório",
    options: ["O escritório", "A oficina mecânica", "A fábrica", "A loja"],
    level: 3
  },
  {
    direction: "en-pt",
    question: "Un gran éxito",
    correct: "Um grande sucesso",
    options: ["Um grande sucesso", "Uma grande saída", "Um grande esforço", "Um grande evento"],
    level: 4
  },
  // Português → Espanhol
  {
    direction: "pt-en",
    question: "Obrigado",
    correct: "Gracias",
    options: ["Gracias", "Por favor", "Perdón", "Hola"],
    level: 1
  },
  {
    direction: "pt-en",
    question: "Onde fica o banheiro?",
    correct: "¿Dónde está el baño?",
    options: ["¿Dónde está el baño?", "¿Cuánto cuesta?", "¿Cómo te llamas?", "¿Qué hora es?"],
    level: 2
  },
  {
    direction: "pt-en",
    question: "Eu tenho vinte anos",
    correct: "Tengo veinte años",
    options: ["Tengo veinte años", "Soy veinte años", "Estoy veinte años", "Hago veinte años"],
    level: 3
  },
  {
    direction: "pt-en",
    question: "Está muito frio hoje",
    correct: "Hace mucho frío hoy",
    options: ["Hace mucho frío hoy", "Es mucho frío hoy", "Está mucho frío hoy", "Tiene mucho frío hoy"],
    level: 4
  },
  {
    direction: "pt-en",
    question: "Gosto de música",
    correct: "Me gusta la música",
    options: ["Me gusta la música", "Yo gusto la música", "Me gusto música", "Gusto de música"],
    level: 4
  },
  {
    direction: "pt-en",
    question: "Grávida",
    correct: "Embarazada",
    options: ["Embarazada", "Avergonzada", "Enojada", "Cansada"],
    level: 5
  },
];

export default sentences;
