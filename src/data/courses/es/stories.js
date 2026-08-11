export const STORY_LEVELS = {
  1: { label: 'Iniciante (A1)', icon: '🌱' },
  2: { label: 'Intermediário (A2)', icon: '🌿' },
  3: { label: 'Avançado (B1)', icon: '🌳' },
};

export const stories = [
  {
    id: 'es_story_1',
    title: 'Un Día en Madrid',
    titlePt: 'Um Dia em Madri',
    level: 1,
    icon: '🇪🇸',
    summary: 'Juan camina por el centro de Madrid y compra un café delicioso.',
    summaryPt: 'Juan caminha pelo centro de Madri e compra um café delicioso.',
    content: [
      { text: 'Juan camina por la ciudad.', translation: 'Juan caminha pela cidade.' },
      { text: 'El día es sol soleado y hermoso.', translation: 'O dia está ensolarado e lindo.' },
      { text: 'Él entra en una cafetería tradicional.', translation: 'Ele entra em uma cafeteria tradicional.' },
      { text: '¡Buenos días! Un café con leche, por favor.', translation: 'Bom dia! Um café com leite, por favor.' },
      { text: '¡Muchas gracias y buen día!', translation: 'Muito obrigado e bom dia!' }
    ]
  }
];

export default stories;
