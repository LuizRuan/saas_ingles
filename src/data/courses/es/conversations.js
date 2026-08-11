export const conversations = [
  {
    id: 'es_convo_1',
    title: 'Presentación',
    titlePt: 'Apresentação Pessoal',
    level: 1,
    icon: '👋',
    start: 'n1',
    nodes: {
      n1: {
        text: "¡Hola! ¿Cómo te llamas?",
        translation: "Olá! Como você se chama?",
        replies: [
          { text: "Me llamo Mateo.", translation: "Meu nome é Mateo.", next: 'n2' },
          { text: "Hola, soy Ana.", translation: "Olá, sou Ana.", next: 'n2' }
        ]
      },
      n2: {
        text: "¡Mucho gusto! ¿De dónde eres?",
        translation: "Muito prazer! De onde você é?",
        replies: [
          { text: "Soy de Brasil.", translation: "Sou do Brasil.", next: 'n3' }
        ]
      },
      n3: {
        text: "¡Qué bien! Bienvenido.",
        translation: "Que bom! Seja bem-vindo.",
        replies: []
      }
    }
  }
];

export default conversations;
