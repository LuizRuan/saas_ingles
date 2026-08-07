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
// Palavras-chave com múltiplos significados nos exemplos do vocabulário:
//   call   → call, call back, call off, call for, call out
//   get    → get up, get ready, get out, get along, get back
//   look   → look for, look after, look out, look up, look around
//   pick   → pick up, pick out, pick on, pick a side, pick up (again)
//   put    → put on, put away, put off, put down, put together
//   turn   → turn off, turn on, turn around, turn into, turn up
//   give   → give up, give back, give in, give out, give it a shot
//   run    → run away, run out, run into, run back, run over
//   break  → break down, break out, break off, break a record, break time
//   come   → come back, come over, come down, come across, come out
//   set    → set up, set out, set the table, set a goal, set aside
//   bring  → bring up, bring back, bring over, bring down, bring along
//   make   → make a plan, make sense, make it, make up, make friends
//   hold   → hold on, hold back, hold up, hold out, hold together
//   carry  → carry on, carry out, carry over, carry away, carry weight
//   drop   → drop by, drop off, drop out, drop a hint, drop everything
//
// stories.test.js valida que todo token de palavra usado aqui resolve em
// storyVocabulary — o mesmo tipo de teste de integridade que data.test.js já
// faz para o grafo de conversations.js.

export const STORY_LEVELS = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
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
      'One day, Max is not in the house. Ana looks for him, but she does not see him.',
      "Ana calls his name out loud. Suddenly, Max runs back to her. He is happy to see Ana!",
    ],
  },
  {
    id: 'the-phone-call',
    level: 'iniciante',
    icon: '📱',
    title: 'The Phone Call',
    titlePt: 'A Ligação',
    summaryPt: 'Tom faz uma ligação para Leo e os dois combinam de se encontrar.',
    paragraphs: [
      'Tom picks up his phone to call Leo. Leo does not pick up.',
      'Tom leaves a short message and waits.',
      'Leo calls back and says he was in class. They make a plan to meet at the park.',
      'Tom hangs up and gets ready to go out. He is happy to have a good friend.',
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
      'After school, Lucy does her homework. She sets her books on the table and gets to work.',
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
      'They pick up red apples, green apples, and fresh bread.',
      "Sofia looks for a small blue toy. She picks it out and asks her mother, 'Can I have it?'",
      'Her mother says yes. They pay and go home. Sofia puts her new toy away carefully.',
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
      'On the weekend, Leo and I meet up at the park. We like to run and talk.',
      'Leo helps me with my homework. I help him too. Good friends always look out for each other.',
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
      'After breakfast, Sofia goes to school. She feels good and is ready to learn.',
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
    id: 'the-birthday-party',
    level: 'intermediario',
    icon: '🎂',
    title: 'The Birthday Party',
    titlePt: 'A Festa de Aniversário',
    summaryPt: 'Os amigos de Sofia preparam uma festa surpresa de aniversário.',
    paragraphs: [
      "It was Sofia's birthday, and her parents planned a surprise party.",
      'Her friends showed up with colorful presents and big smiles on their faces.',
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
      "A few minutes later, his father found him. Tom was so relieved, and he never let go of his mother's hand again.",
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
      'The game was tight, and both teams played well. In the last minute, Leo broke away and scored the winning goal.',
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
      "Ana's father brought up an old story about his childhood, and everyone listened carefully.",
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
      'On the day of the play, she felt very nervous standing behind the curtain.',
      'When the lights came on, Lucy took a deep breath and walked onto the stage.',
      'She spoke clearly and confidently. At the end, everyone clapped, and Lucy felt proud of herself.',
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
      "Leo remembered his first day at school, so he decided to reach out to her.",
      'He asked her simple questions about her old school and her favorite games.',
      'By lunchtime, Sofia was smiling and laughing with Leo and his friends. She finally felt welcome.',
    ],
  },
  {
    id: 'the-camping-trip',
    level: 'intermediario',
    icon: '🏕️',
    title: 'The Camping Trip',
    titlePt: 'A Viagem de Acampamento',
    summaryPt: 'Tom e sua família vão acampar e vivem uma aventura inesquecível.',
    paragraphs: [
      "Tom's family set out on a camping trip in the mountains. They set up their tent near a river.",
      'In the morning, Tom woke up early to explore. He came across a deer by the water.',
      "That night, they made a fire and his father brought along some old stories to tell.",
      "On the way back home, Tom said it was the best trip ever. He could not wait to come back.",
    ],
  },

  // ─── Avançado ─────────────────────────────────────────────────────────
  {
    id: 'the-job-interview',
    level: 'avancado',
    icon: '💼',
    title: 'The Job Interview',
    titlePt: 'A Entrevista de Emprego',
    summaryPt: 'Ana se prepara para uma entrevista de emprego difícil e precisa impressionar o entrevistador.',
    paragraphs: [
      'Ana had been preparing for this job interview for weeks. She had researched the company thoroughly and rehearsed her answers in front of the mirror.',
      'When she arrived, the interviewer asked her a challenging question about a time she had failed. Ana hesitated for a moment, but then she explained the situation honestly and described what she had learned from it.',
      "The interviewer seemed impressed by her confidence. He mentioned that most candidates avoid admitting their mistakes, but Ana's honesty stood out.",
      'By the end of the interview, Ana felt relieved. A week later, she received an offer. Her hard work had finally paid off.',
    ],
  },
  {
    id: 'moving-abroad',
    level: 'avancado',
    icon: '✈️',
    title: 'Moving Abroad',
    titlePt: 'Mudando para o Exterior',
    summaryPt: 'Tom recebe uma proposta de trabalho no exterior e precisa decidir se vale a pena deixar tudo para trás.',
    paragraphs: [
      'Tom received a job offer in another country. It was an incredible opportunity, but it meant leaving his family and friends behind.',
      "He spent several nights weighing the pros and cons. On one hand, the salary was much higher and the company was well respected. On the other hand, he would miss his parents deeply.",
      "Eventually, Tom decided to take the risk. He figured that he could always come back if things didn't work out, but he would never know unless he tried.",
      "Six months later, Tom had adapted to his new life. He missed home, but he didn't regret his decision. Sometimes growth requires stepping outside your comfort zone.",
    ],
  },
  {
    id: 'the-difficult-decision',
    level: 'avancado',
    icon: '🤔',
    title: 'The Difficult Decision',
    titlePt: 'A Decisão Difícil',
    summaryPt: 'Sofia precisa escolher entre duas oportunidades incríveis e pede conselho aos amigos.',
    paragraphs: [
      "Sofia had two job offers, and both seemed perfect. She couldn't decide which one to choose, so she asked her closest friends for advice.",
      'Lucy suggested that Sofia should follow her passion, regardless of the salary. Leo, however, argued that financial stability mattered more at this stage of her career.',
      'Sofia listened carefully to both opinions, but in the end, she realized that only she could make this decision. She had to trust her own judgment.',
      "After much thought, Sofia chose the position that aligned with her long-term goals. It wasn't the easiest choice, but it felt like the right one.",
    ],
  },
  {
    id: 'the-negotiation',
    level: 'avancado',
    icon: '🤝',
    title: 'The Negotiation',
    titlePt: 'A Negociação',
    summaryPt: 'Leo precisa negociar um contrato importante e aprende que compromisso é essencial.',
    paragraphs: [
      'Leo was responsible for negotiating an important contract with a new client. He knew that this deal could change the future of his company.',
      'During the meeting, the client demanded a lower price. Leo remained calm and explained why the quality of their product justified the cost.',
      'After a long discussion, both sides reached a compromise. Leo agreed to a small discount, while the client agreed to a longer contract.',
      "Leo left the meeting satisfied. He had learned that successful negotiation isn't about winning everything — it's about finding a solution that benefits everyone involved.",
    ],
  },
  {
    id: 'the-documentary',
    level: 'avancado',
    icon: '🎥',
    title: 'The Documentary',
    titlePt: 'O Documentário',
    summaryPt: 'Lucy produz um documentário sobre mudança climática e descobre o poder de contar histórias reais.',
    paragraphs: [
      'Lucy had always wanted to raise awareness about climate change. When she got the chance to produce a documentary, she knew this was her opportunity.',
      'She traveled to remote villages and interviewed people whose lives had been affected by rising temperatures. Their stories were more powerful than any statistic.',
      'Editing the footage took months. Lucy wanted every scene to reflect the truth without exaggerating the facts.',
      'When the documentary was finally released, it received widespread attention. Lucy realized that storytelling could inspire change in ways that data alone could not.',
    ],
  },
  {
    id: 'the-reunion',
    level: 'avancado',
    icon: '🎊',
    title: 'The Reunion',
    titlePt: 'O Reencontro',
    summaryPt: 'Depois de anos separados, Ana, Tom, Lucy, Sofia e Leo se reencontram e relembram o passado.',
    paragraphs: [
      'It had been ten years since Ana, Tom, Lucy, Sofia, and Leo had last seen each other. They finally organized a reunion in their hometown.',
      'At first, the conversation felt slightly awkward, as if they were strangers catching up. However, as soon as they started sharing old memories, the years seemed to disappear.',
      'They laughed about mistakes they had made in the past and admitted how much they had each changed. Yet, despite everything, their friendship remained as strong as ever.',
      'By the end of the night, they promised not to wait another ten years. Some friendships, they realized, never truly fade away.',
    ],
  },
  {
    id: 'the-investigation',
    level: 'avancado',
    icon: '🔍',
    title: 'The Investigation',
    titlePt: 'A Investigação',
    summaryPt: 'Quando Max desaparece novamente, Ana decide investigar como uma detetive para descobrir a verdade.',
    paragraphs: [
      'Max had disappeared again, but this time Ana was determined to solve the mystery once and for all. She decided to investigate like a real detective.',
      'She questioned every neighbor and examined the area carefully for clues. Eventually, she noticed strange footprints leading toward an abandoned garden.',
      "Following the trail, Ana discovered that Max had been sneaking into the neighbor's yard to visit another cat. The mystery, it turned out, was simply a secret friendship.",
      'Ana could not help but laugh at how such a small investigation had taught her so much about patience and observation.',
    ],
  },
  {
    id: 'the-conference',
    level: 'avancado',
    icon: '🎤',
    title: 'The Conference',
    titlePt: 'A Conferência',
    summaryPt: 'Ana é convidada para apresentar em uma conferência internacional e enfrenta o medo de falar em público.',
    paragraphs: [
      'Ana was invited to speak at an international conference. Although she was excited, the thought of speaking in front of hundreds of people terrified her.',
      'She practiced her presentation every single day, anticipating every possible question the audience might ask.',
      "When the moment finally arrived, Ana's hands were shaking. Nevertheless, she took a deep breath and began speaking with surprising confidence.",
      'The audience applauded enthusiastically at the end. Ana realized that facing her fear had been the most rewarding part of the entire experience.',
    ],
  },
];
