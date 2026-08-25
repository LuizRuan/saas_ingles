// Variações curriculares determinísticas do Montar Frases. Não há geração por
// IA em runtime: os modelos e todos os encaixes abaixo são fechados e revisáveis.

const piece = (en, pt) => ({ en, pt });

const makeSentence = ({ parts, pt, grammar, level, category, punctuation = '.' }) => ({
  en: `${parts.map(part => part.en).join(' ')}${punctuation}`,
  pt,
  words: parts,
  grammar,
  level,
  category,
  generated: true,
});

const inThirdPerson = (phrase) => phrase.replace(/^([^ ]+)/, (verb) => {
  if (verb === 'have') return 'has';
  if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ies`;
  if (/(s|sh|ch|x|o)$/.test(verb)) return `${verb}es`;
  return `${verb}s`;
});

const inGerund = (phrase) => phrase.replace(/^([^ ]+)/, (verb) => {
  if (verb === 'swim') return 'swimming';
  if (/ie$/.test(verb)) return `${verb.slice(0, -2)}ying`;
  if (/[^e]e$/.test(verb)) return `${verb.slice(0, -1)}ing`;
  return `${verb}ing`;
});

const subjects = [
  { en: 'I', pt: 'Eu', be: 'am', bePt: 'estou', have: 'have', havePt: 'tenho', like: 'like', likePt: 'gosto de', canPt: 'posso' },
  { en: 'You', pt: 'Você', be: 'are', bePt: 'está', have: 'have', havePt: 'tem', like: 'like', likePt: 'gosta de', canPt: 'pode' },
  { en: 'He', pt: 'Ele', be: 'is', bePt: 'está', have: 'has', havePt: 'tem', like: 'likes', likePt: 'gosta de', canPt: 'pode' },
  { en: 'She', pt: 'Ela', be: 'is', bePt: 'está', have: 'has', havePt: 'tem', like: 'likes', likePt: 'gosta de', canPt: 'pode' },
  { en: 'We', pt: 'Nós', be: 'are', bePt: 'estamos', have: 'have', havePt: 'temos', like: 'like', likePt: 'gostamos de', canPt: 'podemos' },
  { en: 'They', pt: 'Eles', be: 'are', bePt: 'estão', have: 'have', havePt: 'têm', like: 'like', likePt: 'gostam de', canPt: 'podem' },
];

const qualities = [
  ['happy', 'feliz'], ['sad', 'triste'], ['strong', 'forte'], ['kind', 'gentil'],
  ['patient', 'paciente'], ['intelligent', 'inteligente'], ['responsible', 'responsável'],
  ['confident', 'confiante'], ['independent', 'independente'], ['afraid', 'com medo'],
  ['sick', 'doente'], ['thirsty', 'com sede'], ['hungry', 'com fome'],
];

const foods = [
  ['bread', 'pão'], ['rice', 'arroz'], ['beans', 'feijão'], ['cheese', 'queijo'], ['fruit', 'frutas'],
  ['salad', 'salada'], ['soup', 'sopa'], ['pasta', 'macarrão'], ['pizza', 'pizza'], ['chocolate', 'chocolate'],
  ['coffee', 'café'], ['tea', 'chá'], ['milk', 'leite'], ['orange juice', 'suco de laranja'],
  ['vegetables', 'legumes'], ['fish', 'peixe'], ['chicken', 'frango'], ['eggs', 'ovos'],
  ['ice cream', 'sorvete'], ['sandwiches', 'sanduíches'], ['bananas', 'bananas'],
  ['apples', 'maçãs'], ['strawberries', 'morangos'], ['cake', 'bolo'], ['yogurt', 'iogurte'],
];

const possessions = [
  ['a backpack', 'uma mochila'], ['a bicycle', 'uma bicicleta'], ['a blue notebook', 'um caderno azul'],
  ['a new phone', 'um celular novo'], ['a small dog', 'um cachorro pequeno'], ['a black cat', 'um gato preto'],
  ['a red jacket', 'uma jaqueta vermelha'], ['a good idea', 'uma boa ideia'], ['a large family', 'uma família grande'],
  ['an English book', 'um livro de inglês'], ['a bus ticket', 'uma passagem de ônibus'],
  ['a glass of water', 'um copo de água'], ['a meeting today', 'uma reunião hoje'],
  ['a question', 'uma pergunta'], ['a problem', 'um problema'], ['a clean room', 'um quarto limpo'],
  ['a brown wallet', 'uma carteira marrom'], ['a younger brother', 'um irmão mais novo'],
  ['an older sister', 'uma irmã mais velha'], ['a math test', 'uma prova de matemática'],
  ['a green umbrella', 'um guarda-chuva verde'], ['a wooden table', 'uma mesa de madeira'],
  ['a favorite song', 'uma música favorita'], ['a busy day', 'um dia ocupado'], ['a simple plan', 'um plano simples'],
];

const places = [
  ['at home', 'em casa'], ['at school', 'na escola'], ['at work', 'no trabalho'], ['at the park', 'no parque'],
  ['at the library', 'na biblioteca'], ['at the supermarket', 'no supermercado'], ['at the airport', 'no aeroporto'],
  ['at the hospital', 'no hospital'], ['at the bus stop', 'no ponto de ônibus'], ['at the restaurant', 'no restaurante'],
  ['in the kitchen', 'na cozinha'], ['in the garden', 'no jardim'], ['in the classroom', 'na sala de aula'],
  ['in the city center', 'no centro da cidade'], ['in my bedroom', 'no meu quarto'], ['near the beach', 'perto da praia'],
  ['near the station', 'perto da estação'], ['inside the car', 'dentro do carro'], ['outside the building', 'fora do prédio'],
  ['on the second floor', 'no segundo andar'], ['behind the door', 'atrás da porta'], ['beside the window', 'ao lado da janela'],
  ['under the table', 'embaixo da mesa'], ['across the street', 'do outro lado da rua'], ['in front of the bank', 'em frente ao banco'],
];

const actions = [
  ['read this book', 'ler este livro'], ['write an email', 'escrever um e-mail'], ['speak English', 'falar inglês'],
  ['help my friend', 'ajudar meu amigo'], ['open the window', 'abrir a janela'], ['close the door', 'fechar a porta'],
  ['make breakfast', 'preparar o café da manhã'], ['cook dinner', 'preparar o jantar'], ['clean the kitchen', 'limpar a cozinha'],
  ['use the computer', 'usar o computador'], ['answer the question', 'responder à pergunta'], ['carry this bag', 'carregar esta bolsa'],
  ['wait for the bus', 'esperar o ônibus'], ['play the guitar', 'tocar violão'], ['ride a bicycle', 'andar de bicicleta'],
  ['swim very well', 'nadar muito bem'], ['learn new words', 'aprender palavras novas'], ['call the doctor', 'ligar para o médico'],
  ['find the station', 'encontrar a estação'], ['buy the tickets', 'comprar as passagens'], ['wash the dishes', 'lavar a louça'],
  ['fix the chair', 'consertar a cadeira'], ['draw a picture', 'desenhar uma imagem'], ['explain the problem', 'explicar o problema'],
  ['remember your name', 'lembrar seu nome'],
];

const routines = [
  ['wake up early', 'acordo cedo', 'acorda cedo', 'acordamos cedo', 'acordam cedo'],
  ['drink water', 'bebo água', 'bebe água', 'bebemos água', 'bebem água'],
  ['eat breakfast', 'tomo café da manhã', 'toma café da manhã', 'tomamos café da manhã', 'tomam café da manhã'],
  ['walk to school', 'vou a pé para a escola', 'vai a pé para a escola', 'vamos a pé para a escola', 'vão a pé para a escola'],
  ['take the bus', 'pego o ônibus', 'pega o ônibus', 'pegamos o ônibus', 'pegam o ônibus'],
  ['study English', 'estudo inglês', 'estuda inglês', 'estudamos inglês', 'estudam inglês'],
  ['read the news', 'leio as notícias', 'lê as notícias', 'lemos as notícias', 'leem as notícias'],
  ['check my email', 'confiro meu e-mail', 'confere o e-mail', 'conferimos nossos e-mails', 'conferem os e-mails'],
  ['start work at eight', 'começo a trabalhar às oito', 'começa a trabalhar às oito', 'começamos a trabalhar às oito', 'começam a trabalhar às oito'],
  ['have lunch at noon', 'almoço ao meio-dia', 'almoça ao meio-dia', 'almoçamos ao meio-dia', 'almoçam ao meio-dia'],
  ['cook at home', 'cozinho em casa', 'cozinha em casa', 'cozinhamos em casa', 'cozinham em casa'],
  ['exercise in the morning', 'faço exercícios de manhã', 'faz exercícios de manhã', 'fazemos exercícios de manhã', 'fazem exercícios de manhã'],
  ['call my family', 'ligo para minha família', 'liga para a família', 'ligamos para nossa família', 'ligam para a família'],
  ['listen to music', 'escuto música', 'escuta música', 'escutamos música', 'escutam música'],
  ['watch television', 'assisto televisão', 'assiste televisão', 'assistimos televisão', 'assistem televisão'],
  ['take a shower', 'tomo banho', 'toma banho', 'tomamos banho', 'tomam banho'],
  ['prepare my clothes', 'preparo minhas roupas', 'prepara as roupas', 'preparamos nossas roupas', 'preparam as roupas'],
  ['write in a journal', 'escrevo em um diário', 'escreve em um diário', 'escrevemos em um diário', 'escrevem em um diário'],
  ['go to bed early', 'vou dormir cedo', 'vai dormir cedo', 'vamos dormir cedo', 'vão dormir cedo'],
  ['practice pronunciation', 'pratico pronúncia', 'pratica pronúncia', 'praticamos pronúncia', 'praticam pronúncia'],
  ['organize the room', 'organizo o quarto', 'organiza o quarto', 'organizamos o quarto', 'organizam o quarto'],
  ['feed the dog', 'alimento o cachorro', 'alimenta o cachorro', 'alimentamos o cachorro', 'alimentam o cachorro'],
  ['water the plants', 'rego as plantas', 'rega as plantas', 'regamos as plantas', 'regam as plantas'],
  ['brush my teeth', 'escovo os dentes', 'escova os dentes', 'escovamos os dentes', 'escovam os dentes'],
  ['plan the next day', 'planejo o dia seguinte', 'planeja o dia seguinte', 'planejamos o dia seguinte', 'planejam o dia seguinte'],
];

const pastEvents = [
  ['visited my grandmother', 'visitei minha avó'], ['finished the project', 'terminei o projeto'],
  ['bought a new book', 'comprei um livro novo'], ['found my keys', 'encontrei minhas chaves'],
  ['made dinner', 'preparei o jantar'], ['called my friend', 'liguei para meu amigo'],
  ['watched a documentary', 'assisti a um documentário'], ['studied for the test', 'estudei para a prova'],
  ['cleaned the house', 'limpei a casa'], ['walked in the park', 'caminhei no parque'],
  ['answered every question', 'respondi a todas as perguntas'], ['learned a new expression', 'aprendi uma expressão nova'],
  ['sent the message', 'enviei a mensagem'], ['lost my bus ticket', 'perdi minha passagem de ônibus'],
  ['met my new teacher', 'conheci meu novo professor'], ['forgot the appointment', 'esqueci o compromisso'],
  ['arrived before noon', 'cheguei antes do meio-dia'], ['prepared breakfast', 'preparei o café da manhã'],
  ['changed my password', 'mudei minha senha'], ['helped my neighbor', 'ajudei meu vizinho'],
];

const perfectEvents = [
  ['visited another country', 'visitei outro país'], ['finished an important project', 'terminei um projeto importante'],
  ['learned many new words', 'aprendi muitas palavras novas'], ['read that book', 'li aquele livro'],
  ['seen this movie', 'vi este filme'], ['tried Japanese food', 'experimentei comida japonesa'],
  ['spoken to the manager', 'falei com o gerente'], ['forgotten an important date', 'esqueci uma data importante'],
  ['lost my phone', 'perdi meu celular'], ['found a better solution', 'encontrei uma solução melhor'],
  ['written three emails', 'escrevi três e-mails'], ['made this mistake before', 'cometi esse erro antes'],
  ['taken this train before', 'peguei este trem antes'], ['worked from home', 'trabalhei de casa'],
  ['lived in a large city', 'morei em uma cidade grande'], ['studied English for a year', 'estudei inglês por um ano'],
  ['changed my daily routine', 'mudei minha rotina diária'], ['helped many people', 'ajudei muitas pessoas'],
  ['heard that story', 'ouvi essa história'], ['chosen a different route', 'escolhi uma rota diferente'],
];

const advancedOutcomes = [
  ['complete the task', 'completed the task', 'concluir a tarefa', 'concluído a tarefa'],
  ['solve the problem', 'solved the problem', 'resolver o problema', 'resolvido o problema'],
  ['prepare the documents', 'prepared the documents', 'preparar os documentos', 'preparado os documentos'],
  ['review the proposal', 'reviewed the proposal', 'revisar a proposta', 'revisado a proposta'],
  ['find a practical solution', 'found a practical solution', 'encontrar uma solução prática', 'encontrado uma solução prática'],
  ['identify the main mistake', 'identified the main mistake', 'identificar o principal erro', 'identificado o principal erro'],
  ['change the schedule', 'changed the schedule', 'mudar o cronograma', 'mudado o cronograma'],
  ['contact the client', 'contacted the client', 'entrar em contato com o cliente', 'entrado em contato com o cliente'],
  ['organize the files', 'organized the files', 'organizar os arquivos', 'organizado os arquivos'],
  ['test the new system', 'tested the new system', 'testar o novo sistema', 'testado o novo sistema'],
  ['improve the process', 'improved the process', 'melhorar o processo', 'melhorado o processo'],
  ['reduce unnecessary costs', 'reduced unnecessary costs', 'reduzir custos desnecessários', 'reduzido custos desnecessários'],
  ['explain the situation', 'explained the situation', 'explicar a situação', 'explicado a situação'],
  ['discuss the alternatives', 'discussed the alternatives', 'discutir as alternativas', 'discutido as alternativas'],
  ['confirm every detail', 'confirmed every detail', 'confirmar todos os detalhes', 'confirmado todos os detalhes'],
  ['update the final report', 'updated the final report', 'atualizar o relatório final', 'atualizado o relatório final'],
  ['check the results', 'checked the results', 'verificar os resultados', 'verificado os resultados'],
  ['compare the available options', 'compared the available options', 'comparar as opções disponíveis', 'comparado as opções disponíveis'],
  ['plan the next stage', 'planned the next stage', 'planejar a próxima etapa', 'planejado a próxima etapa'],
  ['reach an agreement', 'reached an agreement', 'chegar a um acordo', 'chegado a um acordo'],
];

export const generateEnglishSentenceVariants = () => {
  const output = [];
  const add = config => output.push(makeSentence(config));

  for (const subject of subjects) {
    for (const [en, pt] of qualities) {
      add({
        parts: [piece(subject.en, subject.pt), piece(subject.be, subject.bePt), piece(en, pt), piece('today', 'hoje')],
        pt: `${subject.pt} ${subject.bePt} ${pt} hoje.`, grammar: 'Presente do verbo to be.', level: 1, category: 'sentimentos',
      });
    }
  }

  for (const subject of subjects) {
    for (const [en, pt] of foods) {
      add({
        parts: [piece(subject.en, subject.pt), piece(subject.like, subject.likePt), piece(en, pt)],
        pt: `${subject.pt} ${subject.likePt} ${pt}.`, grammar: 'Preferências com like ou likes.', level: 1, category: 'comidas',
      });
    }
  }

  for (const subject of subjects) {
    for (const [en, pt] of possessions) {
      add({
        parts: [piece(subject.en, subject.pt), piece(subject.have, subject.havePt), piece(en, pt)],
        pt: `${subject.pt} ${subject.havePt} ${pt}.`, grammar: 'Posse com have ou has.', level: 1, category: 'cotidiano',
      });
    }
  }

  for (const subject of subjects) {
    for (const [en, pt] of places) {
      add({
        parts: [piece(subject.en, subject.pt), piece(subject.be, subject.bePt), piece(en, pt)],
        pt: `${subject.pt} ${subject.bePt} ${pt}.`, grammar: 'Localização com o verbo to be.', level: 2, category: 'lugares',
      });
    }
  }

  for (const subject of subjects) {
    for (const [en, pt] of actions) {
      add({
        parts: [piece(subject.en, subject.pt), piece('can', subject.canPt), piece(en, pt)],
        pt: `${subject.pt} ${subject.canPt} ${pt}.`, grammar: 'Can é seguido pelo verbo na forma base.', level: 2, category: 'habilidades',
      });
    }
  }

  const routineSubjects = [
    { en: 'I', pt: 'Eu', verbIndex: 0 }, { en: 'She', pt: 'Ela', verbIndex: 1 },
    { en: 'We', pt: 'Nós', verbIndex: 2 }, { en: 'They', pt: 'Eles', verbIndex: 3 },
  ];
  for (const subject of routineSubjects) {
    for (const [base, ptI, ptShe, ptWe, ptThey] of routines) {
      const english = subject.en === 'She' ? inThirdPerson(base) : base;
      const translated = [ptI, ptShe, ptWe, ptThey][subject.verbIndex];
      add({
        parts: [piece(subject.en, subject.pt), piece(english, translated), piece('every day', 'todos os dias')],
        pt: `${subject.pt} ${translated} todos os dias.`, grammar: 'Rotinas no presente simples.', level: 2, category: 'rotina',
      });
    }
  }

  for (const [en, pt] of pastEvents) {
    add({ parts: [piece('I', 'Eu'), piece(en, pt), piece('yesterday', 'ontem')], pt: `Eu ${pt} ontem.`, grammar: 'Passado simples para ações concluídas.', level: 3, category: 'passado' });
    add({ parts: [piece('Last week', 'Na semana passada'), piece('I', 'eu'), piece(en, pt)], pt: `Na semana passada, eu ${pt}.`, grammar: 'Expressão de tempo com passado simples.', level: 3, category: 'passado' });
  }

  for (const [en, pt] of actions) {
    add({ parts: [piece('I am', 'Eu estou'), piece(inGerund(en), pt), piece('right now', 'agora')], pt: `Eu estou ${pt} agora.`, grammar: 'Ação em andamento com present continuous.', level: 3, category: 'presente-continuo' });
    add({ parts: [piece('Tomorrow', 'Amanhã'), piece('we will', 'nós vamos'), piece(en, pt)], pt: `Amanhã, nós vamos ${pt}.`, grammar: 'Will expressa decisões e previsões futuras.', level: 4, category: 'futuro' });
    add({ parts: [piece('If I have time', 'Se eu tiver tempo'), piece('I will', 'eu vou'), piece(en, pt)], pt: `Se eu tiver tempo, eu vou ${pt}.`, grammar: 'Primeira condicional: if + presente, will + verbo.', level: 6, category: 'condicionais' });
    add({ parts: [piece('Before I leave home', 'Antes de sair de casa'), piece('I need to', 'eu preciso'), piece(en, pt)], pt: `Antes de sair de casa, eu preciso ${pt}.`, grammar: 'Orações de tempo com before.', level: 6, category: 'conectores' });
  }

  for (const [en, pt] of perfectEvents) {
    add({ parts: [piece('I have', 'Eu já'), piece(en, pt)], pt: `Eu já ${pt}.`, grammar: 'Present perfect para experiências.', level: 5, category: 'experiencias' });
  }

  const advancedCategories = ['trabalho', 'planejamento', 'comunicacao', 'analise', 'decisoes'];
  for (const [index, [base, participle, ptInfinitive, ptParticiple]] of advancedOutcomes.entries()) {
    const category = advancedCategories[index % advancedCategories.length];
    add({ parts: [piece('Although we had little time', 'Embora tivéssemos pouco tempo'), piece('we managed to', 'nós conseguimos'), piece(base, ptInfinitive)], pt: `Embora tivéssemos pouco tempo, conseguimos ${ptInfinitive}.`, grammar: 'Although introduz contraste entre duas orações.', level: 7, category });
    add({ parts: [piece('If I had known earlier', 'Se eu soubesse antes'), piece('I would have', 'eu teria'), piece(participle, ptParticiple)], pt: `Se eu soubesse antes, eu teria ${ptParticiple}.`, grammar: 'Terceira condicional para situações passadas hipotéticas.', level: 7, category });
    add({ parts: [piece('By the time the meeting started', 'Quando a reunião começou'), piece('we had already', 'nós já tínhamos'), piece(participle, ptParticiple)], pt: `Quando a reunião começou, nós já tínhamos ${ptParticiple}.`, grammar: 'Past perfect mostra uma ação anterior a outra no passado.', level: 7, category });
    add({ parts: [piece('The team could have', 'A equipe poderia ter'), piece(participle, ptParticiple), piece('if it had received more support', 'se tivesse recebido mais apoio')], pt: `A equipe poderia ter ${ptParticiple} se tivesse recebido mais apoio.`, grammar: 'Modal perfeito combinado com condição passada.', level: 7, category });
    add({ parts: [piece('It was essential to', 'Foi essencial'), piece(base, ptInfinitive), piece('before making the final decision', 'antes de tomar a decisão final')], pt: `Foi essencial ${ptInfinitive} antes de tomar a decisão final.`, grammar: 'Infinitivo após adjetivo e oração temporal com before.', level: 7, category });
  }

  return output;
};

export default generateEnglishSentenceVariants;
