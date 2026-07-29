// Texto da pílula de presença. Função pura, para o plural e — principalmente —
// a regra de honestidade ficarem testáveis.
//
// REGRA DURA: "0 online" só pode aparecer quando a conexão está de fato OK.
// Antes, com o servidor fora do ar, a tela mostrava "0 online agora" com uma
// bolinha verde pulsando, indistinguível de "servidor no ar, ninguém aqui" —
// foi exatamente o que confundiu na primeira vez que isso foi testado.

const plural = (n, singular, pluralWord) => `${n} ${n === 1 ? singular : pluralWord}`;

/**
 * @param {object} p
 * @param {'connecting'|'ok'|'offline'} p.status
 * @param {number|null} p.online  pessoas no site
 * @param {number|null} p.queue   pessoas procurando duelo
 */
export const presenceLabel = ({ status, online, queue } = {}) => {
  if (status === 'offline') return 'Servidor indisponível';
  if (status !== 'ok' || online == null) return 'Conectando…';

  const base = plural(online, 'pessoa no site', 'pessoas no site');
  if (!queue) return base;
  return `${base} · ${queue} procurando duelo`;
};

/** Mostra número, ou está num estado em que número seria mentira? */
export const canShowCount = (status) => status === 'ok';
