// Histórias curtas do curso de Espanhol.
//
// MESMO CONTRATO do inglês (src/data/stories.js):
//   { id, level, icon, title, titlePt, summaryPt, paragraphs: [string] }
// e `STORY_LEVELS` mapeando o id do nível para o rótulo exibido.
//
// A versão anterior usava `summary` + `content` e níveis numéricos (1/2/3),
// enquanto a tela de Histórias espera `summaryPt` + `paragraphs` e níveis
// nomeados — a lista teria vindo em branco.
//
// Os parágrafos são frases curtas de propósito: a tela deixa clicar em
// qualquer palavra para ver tradução e exemplo, e frases longas fazem quem
// está começando desistir antes do fim.

export const STORY_LEVELS = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

export const stories = [
  {
    id: 'es-el-gato-perdido',
    level: 'iniciante',
    icon: '🐱',
    title: 'El Gato Perdido',
    titlePt: 'O Gato Perdido',
    summaryPt: 'Ana procura seu gato Max pela casa e pelo jardim.',
    paragraphs: [
      'Ana tiene un gato pequeño y negro. El gato se llama Max.',
      'Un día, Max no está en la casa. Ana busca en la cocina y en el jardín.',
      'Ana está muy triste. Ella llama: "¡Max! ¡Max!"',
      'Entonces Max sale de debajo de la cama. Ana está muy feliz.',
    ],
  },
  {
    id: 'es-el-desayuno',
    level: 'iniciante',
    icon: '🍞',
    title: 'El Desayuno',
    titlePt: 'O Café da Manhã',
    summaryPt: 'Pedro prepara o café da manhã para a família toda.',
    paragraphs: [
      'Pedro se levanta temprano. Hoy quiere preparar el desayuno.',
      'Él pone pan, queso y fruta en la mesa. También hace café con leche.',
      'Su hermana llega a la cocina. "¡Qué rico!", dice ella.',
      'La familia come junta. Es una mañana muy tranquila.',
    ],
  },
  {
    id: 'es-el-autobus',
    level: 'iniciante',
    icon: '🚌',
    title: 'El Autobús',
    titlePt: 'O Ônibus',
    summaryPt: 'Lucía perde o ônibus e descobre um caminho novo.',
    paragraphs: [
      'Lucía va al trabajo cada día en autobús. Hoy llega tarde a la parada.',
      'El autobús ya no está. Lucía tiene que caminar.',
      'En el camino ella ve un parque bonito con muchas flores.',
      'Ahora Lucía camina siempre. Le gusta más que el autobús.',
    ],
  },
  {
    id: 'es-la-tienda',
    level: 'intermediario',
    icon: '🛍️',
    title: 'La Tienda de la Esquina',
    titlePt: 'A Loja da Esquina',
    summaryPt: 'Um cliente descobre que a loja do bairro vai fechar.',
    paragraphs: [
      'Don Carlos tiene una tienda pequeña en la esquina desde hace treinta años.',
      'Todos los vecinos lo conocen. Él sabe el nombre de cada cliente.',
      'Un día, Don Carlos pone un cartel en la ventana: "Cerramos el viernes".',
      'Los vecinos se organizan y compran todo lo que queda en la tienda.',
      'El viernes, Don Carlos cierra la puerta con una sonrisa. No está solo.',
    ],
  },
  {
    id: 'es-el-examen',
    level: 'intermediario',
    icon: '📚',
    title: 'El Examen',
    titlePt: 'A Prova',
    summaryPt: 'Marta estuda a noite toda e aprende algo inesperado.',
    paragraphs: [
      'Marta tiene un examen importante mañana por la mañana.',
      'Ella estudia toda la noche y bebe mucho café para no dormir.',
      'Cuando llega a la escuela, está muy cansada y nerviosa.',
      'El profesor dice: "El examen es la próxima semana. Hoy solo repasamos".',
      'Marta se ríe. Al menos ahora sabe toda la materia muy bien.',
    ],
  },
  {
    id: 'es-el-viaje',
    level: 'avancado',
    icon: '✈️',
    title: 'El Viaje Inesperado',
    titlePt: 'A Viagem Inesperada',
    summaryPt: 'Um atraso de voo transforma uma viagem de trabalho em algo melhor.',
    paragraphs: [
      'Javier viaja por trabajo con frecuencia, pero nunca conoce las ciudades donde aterriza.',
      'Esta vez, una tormenta cancela su vuelo de regreso y tiene que quedarse dos días más.',
      'Al principio se enoja: tiene reuniones importantes y ahora todo se retrasa.',
      'Sin nada que hacer, decide caminar por el centro histórico de la ciudad.',
      'Descubre una librería antigua, un café con música en vivo y una plaza tranquila.',
      'Cuando por fin vuelve a casa, entiende que el viaje no fue una pérdida de tiempo.',
    ],
  },
];

export default stories;
