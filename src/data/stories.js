// Histórias curtas para leitura com apoio de vocabulário. Cada palavra do
// texto vira um botão clicável (ver src/utils/storyTokenizer.js) que abre um
// popup com 5 frases de exemplo, buscadas em storyVocabulary.js pela forma
// normalizada da palavra.
//
// `level` é só 'iniciante' | 'intermediario' (sem acento, mesmo padrão de id
// ASCII usado em categories.js: "familia", "numeros"...). O rótulo acentuado
// pra UI vive em STORY_LEVELS, não no dado.
//
// Elenco fixo (Ana, Tom, Lucy, Sofia, Leo, o gato Max) e temas recorrentes
// (escola, família, parque, praia) de propósito: é o que mantém o vocabulário
// novo por história pequeno, já que toda palavra usada aqui precisa de uma
// entrada com 5 exemplos em storyVocabulary.js.
//
// stories.test.js valida que todo token de palavra usado aqui resolve em
// storyVocabulary — o mesmo tipo de teste de integridade que data.test.js já
// faz para o grafo de conversations.js.

export const STORY_LEVELS = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
};

export const stories = [
  // ─── Iniciante ────────────────────────────────────────────────────────
  {
    id: 'the-lost-cat',
    level: 'iniciante',
    icon: '🐱',
    title: 'The Lost Cat',
    titlePt: 'O Gato Perdido',
    summaryPt: 'Ana perde seu gato Max e o procura pela casa e pelo jardim.',
    paragraphs: [
      "Ana has a small black cat. The cat's name is Max.",
      'Every morning, Max plays in the garden. He likes to run and jump.',
      'One day, Max is not in the house. Ana looks in the garden, but she does not see him.',
      'Ana calls his name. Suddenly, Max runs to her. He is happy to see Ana!',
    ],
  },
  {
    id: 'my-family',
    level: 'iniciante',
    icon: '👨‍👩‍👧‍👦',
    title: 'My Family',
    titlePt: 'Minha Família',
    summaryPt: 'Tom apresenta sua família: pai, mãe, irmã e irmão.',
    paragraphs: [
      'Hi! My name is Tom. I have a big family.',
      'My father is tall. My mother is kind. I have one sister and one brother.',
      'My sister Lucy likes to read books. My brother Leo likes to play games.',
      'We eat dinner together every night. I love my family very much.',
    ],
  },
  {
    id: 'a-day-at-school',
    level: 'iniciante',
    icon: '🏫',
    title: 'A Day at School',
    titlePt: 'Um Dia na Escola',
    summaryPt: 'Lucy conta como é sua rotina em um dia comum de escola.',
    paragraphs: [
      'Lucy goes to school every morning. She walks with her friend Sofia.',
      'In class, the teacher asks a question. Lucy knows the answer and smiles.',
      'At school, Lucy learns to read and write. She likes her English class.',
      'After school, Lucy does her homework at home.',
    ],
  },
  {
    id: 'breakfast-time',
    level: 'iniciante',
    icon: '🍳',
    title: 'Breakfast Time',
    titlePt: 'Hora do Café da Manhã',
    summaryPt: 'Sofia acorda cedo e toma café da manhã com a família.',
    paragraphs: [
      'Sofia wakes up early every morning. She is hungry.',
      'She eats bread and drinks milk. Her mother makes coffee.',
      "Sofia's father eats an apple. He drinks water too.",
      'After breakfast, Sofia goes to school with a big smile.',
    ],
  },
  {
    id: 'the-red-ball',
    level: 'iniciante',
    icon: '⚽',
    title: 'The Red Ball',
    titlePt: 'A Bola Vermelha',
    summaryPt: 'Tom, Leo e Ana brincam com uma bola vermelha no parque.',
    paragraphs: [
      'Tom has a red ball. He plays with it in the park.',
      'Leo and Ana want to play too. Tom gives them the ball.',
      'Tom, Leo, and Ana run and play with the red ball. They are happy.',
      'The ball falls into the water! Tom is sad, but Leo finds it.',
      'They play again. It is a fun day in the park.',
    ],
  },
  {
    id: 'my-best-friend',
    level: 'iniciante',
    icon: '🤝',
    title: 'My Best Friend',
    titlePt: 'Meu Melhor Amigo',
    summaryPt: 'Leo é o melhor amigo de Tom, e eles se ajudam sempre.',
    paragraphs: [
      'My best friend is Leo. He is funny and kind.',
      'We go to the same school. We sit together in class.',
      'On the weekend, Leo and I play in the park. We like to run and talk.',
      'Leo helps me with my homework. I help him too. Good friends help each other.',
    ],
  },
  {
    id: 'a-rainy-day',
    level: 'iniciante',
    icon: '🌧️',
    title: 'A Rainy Day',
    titlePt: 'Um Dia de Chuva',
    summaryPt: 'Ana não pode brincar no jardim, então lê um livro com a mãe.',
    paragraphs: [
      'Today it is cold, and the rain falls all day.',
      'Ana cannot play in the garden. She is a little sad.',
      "Her mother says, 'Let's read a book together.' Ana smiles.",
      'They sit and read. The rain is loud, but Ana feels warm and happy.',
    ],
  },
  {
    id: 'shopping-at-the-market',
    level: 'iniciante',
    icon: '🛒',
    title: 'Shopping at the Market',
    titlePt: 'Compras no Mercado',
    summaryPt: 'Sofia vai ao mercado com a mãe comprar comida.',
    paragraphs: [
      'Sofia and her mother go to the market. They want to buy food.',
      'They buy red apples, green apples, and fresh bread.',
      "Sofia sees a small blue toy. She asks her mother, 'Can I have it, please?'",
      'Her mother says yes. Sofia is very happy. They pay and go home.',
    ],
  },

  // ─── Intermediário ────────────────────────────────────────────────────
  {
    id: 'the-trip-to-the-beach',
    level: 'intermediario',
    icon: '🏖️',
    title: 'The Trip to the Beach',
    titlePt: 'A Viagem à Praia',
    summaryPt: 'A família de Ana passa um dia perfeito na praia.',
    paragraphs: [
      "Last weekend, Ana's family decided to visit the beach. They woke up early and packed their bags.",
      'When they arrived, the sun was shining and the sea looked beautiful. Ana ran straight into the water.',
      'Her brother Leo built a big sandcastle, while their parents relaxed under an umbrella.',
      'In the afternoon, they ate sandwiches and drank cold juice. Everyone agreed it was a perfect day.',
    ],
  },
  {
    id: 'a-new-friend-at-school',
    level: 'intermediario',
    icon: '🧑‍🤝‍🧑',
    title: 'A New Friend at School',
    titlePt: 'Um Novo Amigo na Escola',
    summaryPt: 'Leo ajuda Sofia, a nova aluna, a se sentir bem-vinda.',
    paragraphs: [
      "On Monday, a new student joined Leo's class. Her name was Sofia, and she looked a little nervous.",
      "Leo remembered his first day at school, so he decided to talk to her.",
      'He asked her simple questions about her old school and her favorite games.',
      'By lunchtime, Sofia was smiling and laughing with Leo and his friends. She finally felt welcome.',
    ],
  },
  {
    id: 'the-birthday-party',
    level: 'intermediario',
    icon: '🎂',
    title: 'The Birthday Party',
    titlePt: 'A Festa de Aniversário',
    summaryPt: 'Os amigos de Sofia preparam uma festa surpresa de aniversário.',
    paragraphs: [
      "It was Sofia's birthday, and her parents planned a surprise party.",
      'Her friends arrived with colorful presents and a big smile on their faces.',
      "When Sofia opened the door, everyone shouted, 'Happy birthday!' She was so surprised that she almost cried.",
      'They ate cake, played games, and danced until it was time to go home.',
    ],
  },
  {
    id: 'lost-in-the-city',
    level: 'intermediario',
    icon: '🏙️',
    title: 'Lost in the City',
    titlePt: 'Perdido na Cidade',
    summaryPt: 'Tom se perde da família em uma cidade nova, mas mantém a calma.',
    paragraphs: [
      'Tom was visiting a new city with his family. The streets were busy, and there were people everywhere.',
      'While his parents looked at a map, Tom stopped to watch a street musician. When he turned around, his family was gone.',
      "At first, Tom felt scared. Then he remembered his mother's advice: 'If you get lost, stay where you are.'",
      "A few minutes later, his father found him. Tom was relieved, and he never let go of his mother's hand again.",
    ],
  },
  {
    id: 'the-big-game',
    level: 'intermediario',
    icon: '🏆',
    title: 'The Big Game',
    titlePt: 'O Grande Jogo',
    summaryPt: "O time de Leo disputa o campeonato da escola e ele marca o gol da vitória.",
    paragraphs: [
      "Leo's team practiced hard every week for the school championship.",
      'On the day of the game, Leo felt nervous, but his teammates gave him confidence.',
      'The game was close, and both teams played well. In the last minute, Leo scored the winning goal.',
      'His team celebrated together, and Leo felt proud of all their hard work.',
    ],
  },
  {
    id: 'a-rainy-weekend',
    level: 'intermediario',
    icon: '🌦️',
    title: 'A Rainy Weekend',
    titlePt: 'Um Fim de Semana Chuvoso',
    summaryPt: 'A família de Ana fica em casa e ainda assim tem um fim de semana feliz.',
    paragraphs: [
      "It rained all weekend, so Ana's family decided to stay inside.",
      'They played board games in the morning and baked cookies in the afternoon.',
      "Ana's father told an old story about his childhood, and everyone listened carefully.",
      'Even without the sun, the family had a warm and happy weekend together.',
    ],
  },
  {
    id: 'the-school-play',
    level: 'intermediario',
    icon: '🎭',
    title: 'The School Play',
    titlePt: 'A Peça da Escola',
    summaryPt: 'Lucy supera o nervosismo e brilha no papel principal da peça.',
    paragraphs: [
      'Lucy had the main role in the school play, and she practiced her lines every night.',
      'On the day of the play, she felt very nervous behind the curtain.',
      'When the lights turned on, Lucy took a deep breath and walked onto the stage.',
      'She spoke clearly and confidently. At the end, everyone clapped, and Lucy felt proud of herself.',
    ],
  },
  {
    id: 'helping-at-home',
    level: 'intermediario',
    icon: '🧹',
    title: 'Helping at Home',
    titlePt: 'Ajudando em Casa',
    summaryPt: 'Ana passa a gostar de ajudar nas tarefas de casa aos sábados.',
    paragraphs: [
      'Every Saturday, Ana helps her parents clean the house.',
      'She washes the dishes while her brother sweeps the floor.',
      'At first, Ana thought it was boring, but now she likes spending that time with her family.',
      'Her mother always thanks her, and Ana feels proud to help.',
    ],
  },
];
