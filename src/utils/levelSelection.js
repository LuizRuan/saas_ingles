// Seleção de vocabulário enviesada pelo nível do jogador.
//
// POR QUE ISTO EXISTE: antes, quase todo jogo sorteava uniformemente de todo
// o banco (1000 palavras em inglês, 346 em espanhol) — só o Desafio Diário
// filtrava por nível, e mesmo esse filtro era um corte RÍGIDO
// (`word.level <= userLevel`), que só por coincidência funcionava bem no
// inglês (o campo `level` do banco de palavras foi calibrado manualmente
// para acompanhar a mesma escada 1-100 do nível do jogador) e falhava mal no
// espanhol, onde `word.level` vai só de 1 a 8 — um jogador de nível 8 (que
// precisa de meia dúzia de palavras estudadas pra chegar lá) já desbloqueava
// as 346 palavras inteiras, incluindo os falsos cognatos mais traiçoeiros.
//
// A solução aqui não depende da ESCALA NUMÉRICA do campo `level` bater com a
// escala do nível do jogador — ela funciona por POSIÇÃO RELATIVA: ordena o
// pool pela própria dificuldade declarada e mapeia a posição do jogador na
// escada de 100 níveis (0=iniciante, 1=nível máximo) nesse MESMO intervalo de
// posições. Um jogador de espanhol no nível 50 de 100 cai no meio do banco de
// 346 palavras ORDENADO, não perto do valor bruto "50" (que nem existe nessa
// escala). Isso deixa a mesma função servir qualquer par curso/dataset sem
// recalibrar nenhum número — só a ORDEM de dificuldade dentro do array conta.
//
// Também não é um corte rígido: cortar sempre em 1000% no nível do jogador
// deixaria o pool minúsculo logo no início (poucas dezenas de palavras) e
// repetitivo. Em vez disso, a maioria das rodadas vem de PERTO da posição do
// jogador, uma fatia menor vem de MAIS FÁCIL (reforça o que já foi visto,
// dá vitórias de confiança) e uma fatia ainda menor vem de MAIS DIFÍCIL
// (puxa o jogador pra frente, evita estagnar). Nada é excluído por completo.

const ordenarPorNivel = (pool) => [...pool].sort((a, b) => (a.level || 1) - (b.level || 1));

const embaralhar = (arr, rng) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// Proporções-alvo das três faixas. Núcleo domina de propósito — é o que faz
// o jogo parecer "no nível certo" em vez de aleatório com um verniz de bias.
const PESO_NUCLEO = 0.65;
const PESO_REVISAO = 0.20;
const PESO_DESAFIO = 0.15;

/**
 * Escolhe `count` itens de `pool`, enviesado para a posição do jogador na
 * curva de dificuldade (`userLevel` de 1 a `maxLevel`).
 *
 * Pura e determinística dado o mesmo `rng` — aceita um gerador seedado (ver
 * dailyChallenge.js) para poder ser usada em contextos que exigem o mesmo
 * resultado pra todo mundo no mesmo dia, e usa `Math.random` por padrão nos
 * jogos normais.
 *
 * @param {Array<{level?: number}>} pool  Itens candidatos (palavras, frases,
 *   lacunas, etc. — qualquer coisa com um campo `.level` opcional).
 * @param {number} userLevel  Nível atual do jogador (1..maxLevel).
 * @param {number} maxLevel   Maior nível possível (100 nos dois cursos hoje,
 *   mas nunca hardcoded pelos chamadores — vem de getLevels(courseId).length).
 * @param {number} count      Quantos itens devolver.
 * @param {() => number} [rng] Gerador de aleatoriedade em [0,1). Padrão: Math.random.
 * @returns {Array} Itens escolhidos, já embaralhados (ordem de apresentação).
 */
export const pickByLevel = (pool, userLevel, maxLevel, count, rng = Math.random) => {
  if (!pool || pool.length === 0) return [];
  if (pool.length <= count) return embaralhar(pool, rng);

  const ordenado = ordenarPorNivel(pool);
  const n = ordenado.length;
  const t = Math.max(0, Math.min(1, (userLevel - 1) / Math.max(1, maxLevel - 1)));
  const centro = Math.round(t * (n - 1));

  // Raio do núcleo cresce com o tamanho do pool, com piso de 8 — em bancos
  // pequenos (a versão em espanhol, ou um dataset de frases com só 20-30
  // itens) uma fração fixa deixaria o núcleo minúsculo demais pra escolher
  // `count` itens distintos sem cair direto no fallback.
  const raioNucleo = Math.max(8, Math.round(n * 0.12));
  const inicioNucleo = Math.max(0, centro - raioNucleo);
  const fimNucleo = Math.min(n, centro + raioNucleo + 1);

  const faixaRevisao = ordenado.slice(0, inicioNucleo);
  const faixaNucleo = ordenado.slice(inicioNucleo, fimNucleo);
  const faixaDesafio = ordenado.slice(fimNucleo);

  const alvoNucleo = Math.round(count * PESO_NUCLEO);
  const alvoRevisao = Math.round(count * PESO_REVISAO);
  const alvoDesafio = count - alvoNucleo - alvoRevisao;

  const pegar = (faixa, qtd) => embaralhar(faixa, rng).slice(0, qtd);

  const escolhidos = [
    ...pegar(faixaNucleo, alvoNucleo),
    ...pegar(faixaRevisao, alvoRevisao),
    ...pegar(faixaDesafio, alvoDesafio),
  ];

  // Sobra quando uma faixa não tinha itens suficientes (comum perto das
  // pontas: um iniciante quase não tem "revisão" mais fácil, alguém no nível
  // máximo quase não tem "desafio" mais difícil). Completa com o que sobrar
  // do pool inteiro, priorizando o que está mais PERTO do centro — mantém o
  // viés mesmo no caminho de fallback, em vez de virar aleatório puro.
  if (escolhidos.length < count) {
    const usados = new Set(escolhidos);
    const resto = ordenado
      .map((item, i) => ({ item, dist: Math.abs(i - centro) }))
      .filter(({ item }) => !usados.has(item))
      .sort((a, b) => a.dist - b.dist)
      .map(({ item }) => item);
    escolhidos.push(...resto.slice(0, count - escolhidos.length));
  }

  return embaralhar(escolhidos.slice(0, count), rng);
};

/**
 * Mesma lógica de `pickByLevel`, mas devolve só 1 item — para os pontos que
 * sorteiam uma palavra de cada vez (Forca, WordBuilder de rodada única).
 */
export const pickOneByLevel = (pool, userLevel, maxLevel, rng = Math.random) =>
  pickByLevel(pool, userLevel, maxLevel, 1, rng)[0];
