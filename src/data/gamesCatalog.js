/**
 * Catálogo dos jogos — fonte única de identidade visual e de rota.
 *
 * Antes existiam DUAS listas, uma dentro de Home.jsx e outra dentro de Games.jsx,
 * e elas já tinham divergido: o Jogo da Memória era índigo na Home e roxo em
 * "Todos os Jogos"; a Forca, vermelha na Home e azul na outra; Montar Palavras,
 * azul na Home e verde na outra. O mesmo jogo mudava de cor conforme a tela de
 * onde a pessoa vinha, o que destrói a única pista visual que ela tem para
 * reconhecer o jogo. As cores mantidas aqui são as da Home, que é a tela mais
 * vista e a que também usa a cor para o halo do ícone.
 *
 * `color` é a identidade do jogo e por isso NÃO é um token de tema: a Forca é
 * vermelha nos 5 temas. O fundo do ícone é derivado dela com transparência
 * (ver `halo` em Home.jsx e Games.jsx), justamente para não precisar de um
 * pastel sólido, que aparecia como um quadrado claro dentro do card escuro.
 *
 * `id` tem de casar com uma chave de `defaultProgress.gamesCompleted`
 * (src/utils/storage.js): as duas telas leem `progress.gamesCompleted[id]` para
 * mostrar o selo de "já jogado".
 *
 * `desc` é a linha curta da grade da Home; `descLong` é o parágrafo da lista de
 * "Todos os Jogos". São textos diferentes de propósito — muda o espaço
 * disponível, não o jogo.
 */
export const gamesCatalog = [
  {
    id: 'whoKnowsMore',
    name: 'Quem Sabe Mais?',
    icon: '⚔️',
    color: '#ec4899',
    path: '/games/who-knows-more',
    desc: 'Duelo de Vocabulário',
    descLong: 'Duelo online! Teste quem responde mais rápido contra o Bot Inteligente em partidas ao vivo.',
  },
  {
    id: 'memory',
    name: 'Jogo da Memória',
    icon: '🃏',
    iconImage: '/memory-icon.webp',
    color: '#6366f1',
    path: '/games/memory',
    desc: 'Encontre os pares',
    descLong: 'Encontre os pares de palavras em inglês e português. Treine seu vocabulário de forma divertida!',
  },
  {
    id: 'hangman',
    name: 'Jogo da Forca',
    icon: '🎯',
    // Ícone customizado (desenho de forca em giz), só pra este jogo — `icon`
    // continua valendo como alt/fallback. Ver Home.jsx e Games.jsx: quando
    // `iconImage` existe, ele é usado no lugar do emoji.
    iconImage: '/hangman-icon.webp',
    color: '#ef4444',
    path: '/games/hangman',
    desc: 'Adivinhe a palavra',
    descLong: 'Adivinhe a palavra em inglês letra por letra. Você tem 6 tentativas!',
  },
  {
    id: 'wordBuilder',
    name: 'Montar Palavras',
    icon: '🔤',
    iconImage: '/wordbuilder-icon.webp',
    color: '#3b82f6',
    path: '/games/word-builder',
    desc: 'Organize as letras',
    descLong: 'Organize as letras embaralhadas para formar a palavra correta em inglês.',
  },
  {
    id: 'sentenceBuilder',
    name: 'Montar Frases',
    icon: '📝',
    iconImage: '/sentencebuilder-icon.webp',
    color: '#f59e0b',
    path: '/games/sentence-builder',
    desc: 'Monte a frase correta',
    descLong: 'Coloque as palavras na ordem correta para formar frases em inglês.',
  },
  {
    id: 'translation',
    name: 'Tradução',
    icon: '🔄',
    iconImage: '/translation-icon.webp',
    color: '#ec4899',
    path: '/games/translation',
    desc: 'Traduza corretamente',
    descLong: 'Escolha a tradução correta entre 4 opções. Inglês ↔ Português.',
  },
  {
    id: 'fillBlanks',
    name: 'Completar Frases',
    icon: '✏️',
    iconImage: '/fillblanks-icon.webp',
    color: '#10b981',
    path: '/games/fill-blanks',
    desc: 'Complete a frase',
    descLong: 'Complete a frase escolhendo a palavra que falta.',
  },
  {
    id: 'trueFalse',
    name: 'Verdadeiro ou Falso',
    icon: '✅',
    iconImage: '/truefalse-icon.webp',
    color: '#06b6d4',
    path: '/games/true-false',
    desc: 'Julgue a tradução',
    descLong: 'A tradução está correta? Julgue rápido!',
  },
  {
    id: 'listening',
    name: 'Jogo de Escuta',
    icon: '🎧',
    iconImage: '/listening-icon.webp',
    color: '#8b5cf6',
    path: '/games/listening',
    desc: 'Ouça e identifique',
    descLong: 'Ouça a palavra em inglês e identifique o que foi falado.',
  },
];

/**
 * Fundo do ícone: a própria cor de identidade com ~13% de opacidade. Funciona
 * sobre card claro e escuro, ao contrário de um pastel sólido.
 */
export const halo = (cor) => `${cor}22`;
