export const sentences = [
  { id: 'es_1', text: "Hola, mi nombre es Juan.", translation: "Olá, meu nome é Juan.", level: 1 },
  { id: 'es_2', text: "Buenos días a todos.", translation: "Bom dia a todos.", level: 1 },
  { id: 'es_3', text: "¿Cómo estás hoy?", translation: "Como você está hoje?", level: 1 },
  { id: 'es_4', text: "El gato duerme en la silla.", translation: "O gato dorme na cadeira.", level: 2 },
  { id: 'es_5', text: "Quiero un vaso de agua fresca.", translation: "Quero um copo de água fresca.", level: 2 },
];

export const fillBlanks = [
  { id: 'es_fb_1', sentence: "¡Hola! Mi _____ es María.", answer: "nombre", options: ["nombre", "gato", "agua", "rojo"], translation: "Olá! Meu nome é María.", level: 1 },
  { id: 'es_fb_2', sentence: "El _____ corre en el jardín.", answer: "perro", options: ["perro", "pan", "leche", "hola"], translation: "O cachorro corre no jardim.", level: 1 },
];

export const trueFalse = [
  { id: 'es_tf_1', statement: "'Gracias' significa 'Obrigado' em português.", isCorrect: true, explanation: "Exato! 'Gracias' é a forma padrão de agradecer em espanhol.", level: 1 },
  { id: 'es_tf_2', statement: "'Perro' significa 'Gato' em português.", isCorrect: false, explanation: "Incorreto! 'Perro' significa 'Cachorro'. Gato em espanhol é 'Gato'.", level: 1 },
];

export const translationQuizzes = [
  { id: 'es_tq_1', prompt: "Como se diz 'Bom dia' em espanhol?", answer: "Buenos días", options: ["Buenos días", "Buenas noches", "Hasta luego", "De nada"], level: 1 },
  { id: 'es_tq_2', prompt: "Qual é a tradução de 'El perro es amigo'?", answer: "O cachorro é amigo", options: ["O cachorro é amigo", "O gato é grande", "A água está fria", "Bom dia amigo"], level: 1 },
];

export default sentences;
