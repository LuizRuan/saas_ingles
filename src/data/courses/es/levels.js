// Escada de níveis do curso de Espanhol.
//
// POR QUE UMA ESCADA PRÓPRIA: a do inglês (src/data/categories.js) vai até
// `wordsNeeded: 990`, calibrada para um banco de 1000 palavras. Aplicada ao
// espanhol (346 palavras) o teto real seria o nível ~3 — a pessoa estudaria o
// curso inteiro e a barra de progresso mal sairia do lugar. Pior: data.test.js
// pina que o maior threshold precisa caber no banco, então reusar a escada do
// inglês quebraria o teste.
//
// Os 100 níveis são mantidos de propósito: os títulos (getUserTitle), as
// conquistas e o ranking todos raciocinam em cima de "nível 1 a 100". Só os
// thresholds mudam, distribuídos sobre o tamanho real deste banco.

import { words } from './words.js';

// Deixa uma folga no topo: exigir exatamente todas as palavras faria o nível
// 100 depender de acertar TODAS, inclusive as que a pessoa nunca sorteou.
const TETO = Math.floor(words.length * 0.97);

// 10 estágios de 10 níveis, como no inglês.
const ESTAGIOS = [
  { stage: 1,  name: 'Primeiros Passos',   description: 'Cumprimentos, números e cores',        icon: '🌱' },
  { stage: 2,  name: 'Mundo ao Redor',     description: 'Animais, comidas e bebidas',           icon: '🐾' },
  { stage: 3,  name: 'Gente e Casa',       description: 'Família, casa e objetos do dia a dia', icon: '🏠' },
  { stage: 4,  name: 'Rotina',             description: 'Escola, trabalho e roupas',            icon: '🎒' },
  { stage: 5,  name: 'Corpo e Cidade',     description: 'Corpo humano, lugares e transportes',  icon: '🏙️' },
  { stage: 6,  name: 'Ação',               description: 'Verbos essenciais do cotidiano',       icon: '⚡' },
  { stage: 7,  name: 'Sentimentos',        description: 'Emoções e como expressá-las',          icon: '💛' },
  { stage: 8,  name: 'Conversa',           description: 'Perguntas e frases do cotidiano',      icon: '💬' },
  { stage: 9,  name: 'Fluidez',            description: 'Falsos cognatos e nuances',            icon: '🎯' },
  { stage: 10, name: 'Domínio',            description: 'Espanhol com naturalidade',            icon: '👑' },
];

// Nomes próprios dos marcos de cada dezena — o resto herda o nome do estágio
// com o número, o que evita 100 nomes inventados sem personalidade.
const MARCOS = {
  1:   'Primeras Palabras',
  10:  'Hola, Mundo',
  20:  'Conversador Iniciante',
  30:  'Amigo dos Verbos',
  40:  'Viajante Confiante',
  50:  'Meio Caminho',
  60:  'Contador de Histórias',
  70:  'Quase Fluente',
  80:  'Lenda do Espanhol',
  90:  'Imortal do Idioma',
  100: 'Mestre Absoluto do Espanhol',
};

export const levels = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  const estagio = ESTAGIOS[Math.floor(i / 10)];

  // Curva levemente acelerada: os primeiros níveis chegam rápido (a pessoa
  // precisa sentir progresso na primeira sessão) e os últimos custam mais.
  const t = i / 99;
  const wordsNeeded = level === 1 ? 0 : Math.round(TETO * Math.pow(t, 1.35));

  return {
    level,
    stage: estagio.stage,
    name: MARCOS[level] || `${estagio.name} ${level}`,
    description: estagio.description,
    wordsNeeded,
    icon: estagio.icon,
  };
});

// Garante escada estritamente crescente mesmo se o arredondamento repetir um
// valor (acontece nos primeiros níveis, onde a curva é quase plana). Sem isto,
// dois níveis com o mesmo threshold fariam getCurrentLevel pular um deles.
for (let i = 1; i < levels.length; i++) {
  if (levels[i].wordsNeeded <= levels[i - 1].wordsNeeded) {
    levels[i].wordsNeeded = levels[i - 1].wordsNeeded + 1;
  }
}

export default levels;
