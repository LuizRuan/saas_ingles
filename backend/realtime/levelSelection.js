// Porto do src/utils/levelSelection.js do frontend — duplicação DELIBERADA,
// mesmo espírito de backend/utils/validators.js e de questionGenerator.js
// (ver o comentário no topo daquele arquivo). O algoritmo é o MESMO: sortear
// enviesado pra posição do jogador na curva de dificuldade em vez de
// uniformemente do banco inteiro inteiro, funcionando por POSIÇÃO RELATIVA
// (ordena por `level`, mapeia o nível do jogador nessa ordem) em vez do valor
// bruto do campo — ver o arquivo do frontend pro raciocínio completo.
//
// A diferença de forma: aqui o pool é sempre um array de pares `{ w, i }`
// (palavra + índice original no banco), porque é assim que
// questionGenerator.js já filtra elegibilidade e usedIndices — então ordena
// e filtra por `.w.level`, não por `.level` direto.

const ordenarPorNivel = (pool) => [...pool].sort((a, b) => (a.w.level || 1) - (b.w.level || 1));

const embaralhar = (arr) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const PESO_NUCLEO = 0.65;
const PESO_REVISAO = 0.20;
const PESO_DESAFIO = 0.15;

/**
 * Escolhe `count` pares `{w,i}` de `pool`, enviesado pra posição de
 * `userLevel` (1..maxLevel) na curva de dificuldade.
 */
export const pickByLevel = (pool, userLevel, maxLevel, count) => {
  if (!pool || pool.length === 0) return [];
  if (pool.length <= count) return embaralhar(pool);

  const ordenado = ordenarPorNivel(pool);
  const n = ordenado.length;
  const t = Math.max(0, Math.min(1, (userLevel - 1) / Math.max(1, maxLevel - 1)));
  const centro = Math.round(t * (n - 1));

  const raioNucleo = Math.max(8, Math.round(n * 0.12));
  const inicioNucleo = Math.max(0, centro - raioNucleo);
  const fimNucleo = Math.min(n, centro + raioNucleo + 1);

  const faixaRevisao = ordenado.slice(0, inicioNucleo);
  const faixaNucleo = ordenado.slice(inicioNucleo, fimNucleo);
  const faixaDesafio = ordenado.slice(fimNucleo);

  const alvoNucleo = Math.round(count * PESO_NUCLEO);
  const alvoRevisao = Math.round(count * PESO_REVISAO);
  const alvoDesafio = count - alvoNucleo - alvoRevisao;

  const pegar = (faixa, qtd) => embaralhar(faixa).slice(0, qtd);

  const escolhidos = [
    ...pegar(faixaNucleo, alvoNucleo),
    ...pegar(faixaRevisao, alvoRevisao),
    ...pegar(faixaDesafio, alvoDesafio),
  ];

  if (escolhidos.length < count) {
    const usados = new Set(escolhidos);
    const resto = ordenado
      .map((item, i) => ({ item, dist: Math.abs(i - centro) }))
      .filter(({ item }) => !usados.has(item))
      .sort((a, b) => a.dist - b.dist)
      .map(({ item }) => item);
    escolhidos.push(...resto.slice(0, count - escolhidos.length));
  }

  return embaralhar(escolhidos.slice(0, count));
};

/** Mesma lógica, mas devolve só 1 par — o caso comum de buildQuestion. */
export const pickOneByLevel = (pool, userLevel, maxLevel) =>
  pickByLevel(pool, userLevel, maxLevel, 1)[0];

// Nível padrão pra quem não manda um válido — meio da escada (nem fácil
// demais nem difícil demais), o mesmo espírito de "convidado degrada sem
// derrubar a conexão" usado pro resto da autenticação do duelo.
export const DEFAULT_LEVEL = 50;
export const MAX_LEVEL = 100;

/** Sanitiza um `level` vindo do cliente: nunca confiável, só um hint de UX. */
export const resolveLevel = (raw) => {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1 || n > MAX_LEVEL) return DEFAULT_LEVEL;
  return Math.round(n);
};
