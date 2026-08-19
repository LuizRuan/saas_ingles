// Diálogos do curso de Espanhol, como GRAFOS DE NÓS (não roteiros lineares).
//
// MESMO CONTRATO do inglês (src/data/conversations.js) — data.test.js pina a
// integridade nos dois cursos: todo `next` resolve, todo nó é alcançável a
// partir de `start`, todo diálogo chega a um nó terminal (`replies: []`) e
// todo tópico ramifica em algum ponto.
//
//   { id, topic, topicPt, icon, level, start, nodes }
//   node  = { text, translation, replies: [] }
//   reply = { text, translation, next, accepts?: [] }
//
// A versão anterior usava `title/titlePt` em vez de `topic/topicPt` — os
// campos que a tela de Conversa realmente lê — então os diálogos apareceriam
// sem nome.
//
// `accepts` pertence à RESPOSTA, não ao nó: é o que permite a pessoa digitar
// uma paráfrase e seguir o mesmo ramo da opção equivalente.

export const conversations = [
  {
    id: 'es_saludos',
    topic: 'Greetings',
    topicPt: 'Cumprimentos',
    icon: '👋',
    level: 1,
    start: 'inicio',
    nodes: {
      inicio: {
        text: '¡Hola! ¿Cómo estás hoy?',
        translation: 'Olá! Como você está hoje?',
        replies: [
          { text: 'Muy bien, gracias.', translation: 'Muito bem, obrigado.', next: 'bien', accepts: ['Bien, gracias', 'Estoy bien', 'Todo bien'] },
          { text: 'Un poco cansado.', translation: 'Um pouco cansado.', next: 'cansado', accepts: ['Estoy cansado', 'Cansado'] },
        ],
      },
      bien: {
        text: '¡Me alegro! ¿Cómo te llamas?',
        translation: 'Que bom! Como você se chama?',
        replies: [
          { text: 'Me llamo Ana.', translation: 'Meu nome é Ana.', next: 'despedida', accepts: ['Soy Ana', 'Mi nombre es Ana'] },
        ],
      },
      cansado: {
        text: 'Lo siento. ¿Dormiste poco anoche?',
        translation: 'Sinto muito. Você dormiu pouco ontem à noite?',
        replies: [
          { text: 'Sí, trabajé mucho.', translation: 'Sim, trabalhei muito.', next: 'despedida', accepts: ['Sí, mucho trabajo'] },
          { text: 'No, estoy bien.', translation: 'Não, estou bem.', next: 'despedida', accepts: ['No, todo bien'] },
        ],
      },
      despedida: {
        text: 'Encantado de conocerte. ¡Hasta luego!',
        translation: 'Prazer em te conhecer. Até logo!',
        replies: [],
      },
    },
  },

  {
    id: 'es_restaurante',
    topic: 'At the restaurant',
    topicPt: 'No restaurante',
    icon: '🍽️',
    level: 2,
    start: 'mesa',
    nodes: {
      mesa: {
        text: 'Buenas tardes. ¿Qué desea tomar?',
        translation: 'Boa tarde. O que deseja beber?',
        replies: [
          { text: 'Un café, por favor.', translation: 'Um café, por favor.', next: 'comida', accepts: ['Quiero un café', 'Café por favor'] },
          { text: 'Agua, por favor.', translation: 'Água, por favor.', next: 'comida', accepts: ['Quiero agua', 'Un vaso de agua'] },
        ],
      },
      comida: {
        text: 'Muy bien. ¿Y para comer?',
        translation: 'Muito bem. E para comer?',
        replies: [
          { text: 'Quiero pollo con arroz.', translation: 'Quero frango com arroz.', next: 'cuenta', accepts: ['Pollo con arroz'] },
          { text: 'Solo una ensalada.', translation: 'Só uma salada.', next: 'cuenta', accepts: ['Una ensalada'] },
        ],
      },
      cuenta: {
        text: 'Perfecto. ¿Algo más?',
        translation: 'Perfeito. Mais alguma coisa?',
        replies: [
          { text: 'La cuenta, por favor.', translation: 'A conta, por favor.', next: 'fin', accepts: ['Nada más, gracias', 'La cuenta'] },
        ],
      },
      fin: {
        text: 'Aquí tiene. ¡Buen provecho!',
        translation: 'Aqui está. Bom apetite!',
        replies: [],
      },
    },
  },

  {
    id: 'es_direcciones',
    topic: 'Asking for directions',
    topicPt: 'Pedindo informação',
    icon: '🗺️',
    level: 2,
    start: 'perdido',
    nodes: {
      perdido: {
        text: 'Perdón, ¿me puede ayudar? Estoy perdido.',
        translation: 'Desculpe, pode me ajudar? Estou perdido.',
        replies: [
          { text: 'Claro, ¿qué busca?', translation: 'Claro, o que procura?', next: 'busca', accepts: ['Sí, claro', 'Por supuesto'] },
        ],
      },
      busca: {
        text: '¿Dónde está la estación de tren?',
        translation: 'Onde fica a estação de trem?',
        replies: [
          { text: 'Está muy cerca de aquí.', translation: 'Fica bem perto daqui.', next: 'cerca', accepts: ['Cerca', 'Está cerca'] },
          { text: 'Está bastante lejos.', translation: 'Fica bem longe.', next: 'lejos', accepts: ['Lejos', 'Está lejos'] },
        ],
      },
      cerca: {
        text: 'Siga recto y gire a la derecha.',
        translation: 'Siga reto e vire à direita.',
        replies: [
          { text: 'Muchas gracias.', translation: 'Muito obrigado.', next: 'fin', accepts: ['Gracias'] },
        ],
      },
      lejos: {
        text: 'Mejor tome el autobús número diez.',
        translation: 'É melhor pegar o ônibus número dez.',
        replies: [
          { text: 'De acuerdo, gracias.', translation: 'Certo, obrigado.', next: 'fin', accepts: ['Vale, gracias'] },
        ],
      },
      fin: {
        text: 'De nada. ¡Buen viaje!',
        translation: 'De nada. Boa viagem!',
        replies: [],
      },
    },
  },

  {
    id: 'es_compras',
    topic: 'Shopping',
    topicPt: 'Fazendo compras',
    icon: '🛍️',
    level: 3,
    start: 'tienda',
    nodes: {
      tienda: {
        text: 'Buenos días. ¿Busca algo en particular?',
        translation: 'Bom dia. Procura algo em particular?',
        replies: [
          { text: 'Busco una camisa azul.', translation: 'Procuro uma camisa azul.', next: 'talla', accepts: ['Una camisa', 'Quiero una camisa'] },
          { text: 'Solo estoy mirando.', translation: 'Estou só olhando.', next: 'mirando', accepts: ['Solo miro'] },
        ],
      },
      talla: {
        text: '¿Qué talla necesita?',
        translation: 'Qual tamanho você precisa?',
        replies: [
          { text: 'Talla mediana, por favor.', translation: 'Tamanho médio, por favor.', next: 'precio', accepts: ['Mediana'] },
        ],
      },
      mirando: {
        text: 'Sin problema. Avíseme si necesita algo.',
        translation: 'Sem problema. Me avise se precisar de algo.',
        replies: [
          { text: '¿Cuánto cuesta esta camisa?', translation: 'Quanto custa esta camisa?', next: 'precio', accepts: ['Cuánto cuesta'] },
        ],
      },
      precio: {
        text: 'Cuesta veinte euros.',
        translation: 'Custa vinte euros.',
        replies: [
          { text: 'Me la llevo, gracias.', translation: 'Vou levar, obrigado.', next: 'fin', accepts: ['La compro', 'Me la llevo'] },
          { text: 'Es un poco cara.', translation: 'É um pouco cara.', next: 'fin', accepts: ['Muy cara', 'Es cara'] },
        ],
      },
      fin: {
        text: 'Gracias por su visita. ¡Hasta pronto!',
        translation: 'Obrigado pela visita. Até breve!',
        replies: [],
      },
    },
  },

  {
    id: 'es_trabajo',
    topic: 'Talking about work',
    topicPt: 'Falando do trabalho',
    icon: '💼',
    level: 3,
    start: 'pregunta',
    nodes: {
      pregunta: {
        text: '¿En qué trabajas?',
        translation: 'Em que você trabalha?',
        replies: [
          { text: 'Trabajo en una oficina.', translation: 'Trabalho num escritório.', next: 'oficina', accepts: ['En una oficina'] },
          { text: 'Soy estudiante todavía.', translation: 'Ainda sou estudante.', next: 'estudiante', accepts: ['Soy estudiante'] },
        ],
      },
      oficina: {
        text: '¿Y te gusta tu trabajo?',
        translation: 'E você gosta do seu trabalho?',
        replies: [
          { text: 'Sí, me gusta mucho.', translation: 'Sim, gosto muito.', next: 'fin', accepts: ['Me gusta'] },
          { text: 'Es un poco aburrido.', translation: 'É um pouco chato.', next: 'fin', accepts: ['Aburrido'] },
        ],
      },
      estudiante: {
        text: '¡Qué bien! ¿Qué estudias?',
        translation: 'Que bom! O que você estuda?',
        replies: [
          { text: 'Estudio español.', translation: 'Estudo espanhol.', next: 'fin', accepts: ['Español'] },
        ],
      },
      fin: {
        text: 'Te deseo mucho éxito. ¡Hasta luego!',
        translation: 'Desejo muito sucesso. Até logo!',
        replies: [],
      },
    },
  },
];

export default conversations;
