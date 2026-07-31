/**
 * Descobre o IP real de quem fez o pedido, atravessando a cadeia de proxies.
 *
 * Por que não basta `req.ip` com `trust proxy`: existem DUAS topologias, com
 * número de saltos diferente, e um único número em `trust proxy` não serve para
 * as duas. Medido em produção (não deduzido):
 *
 *   Direto no Render:  [cliente, Cloudflare, proxy interno]        -> 3 saltos
 *   Passando pela Vercel: [cliente, Vercel, Cloudflare, interno]   -> 4 saltos
 *
 * (O Render põe Cloudflare na frente; a Vercel acrescenta o próprio salto de
 * saída ao proxear /api/* pelo rewrite do vercel.json.)
 *
 * REGRA CENTRAL — contar da DIREITA para a esquerda. O que um cliente injeta em
 * X-Forwarded-For é acrescentado à ESQUERDA da cadeia; cada proxie confiável
 * escreve à direita. Então a posição do cliente contada a partir da direita é
 * estável mesmo quando alguém forja o cabeçalho. Verificado: batendo direto no
 * Render com `X-Forwarded-For: 1.2.3.4`, a cadeia virou
 * `1.2.3.4, <meu IP real>, <CF>, <interno>` — o forjado entrou à esquerda e o
 * 3º da direita continuou sendo o IP verdadeiro.
 *
 * O oposto — contar da esquerda, ou confiar em `trust proxy: true` — deixaria
 * qualquer pessoa escolher a própria chave de limite e furar o limitador à
 * vontade.
 *
 * LIMITE CONHECIDO E ACEITO: quem bater DIRETO no Render (fora da Vercel) pode
 * forjar `x-vercel-forwarded-for` e uma cadeia de 4 saltos, e assim escolher a
 * própria chave. Não há como distinguir isso sem um segredo compartilhado, e
 * vercel.json é público (está no repositório), então não existe segredo a usar.
 * A troca é deliberada: o estado anterior era pior nos dois lados — todo mundo
 * dividia UM balde só, e 10 tentativas de login trancavam o site inteiro por 15
 * minutos, o que é um ataque de negação de serviço mais fácil do que este.
 */

const cadeiaDe = (req) =>
  String(req?.headers?.['x-forwarded-for'] || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/** Posição do cliente, contada da direita, em cada topologia. */
export const SALTOS_VIA_VERCEL = 4;
export const SALTOS_DIRETO_RENDER = 3;

export const resolveClientIp = (req) => {
  const cadeia = cadeiaDe(req);

  // A Vercel SUBSTITUI o X-Forwarded-For do cliente pelo IP verdadeiro
  // (verificado em produção: um `X-Forwarded-For: 1.2.3.4` enviado pelo cliente
  // simplesmente não aparece do outro lado). Por isso, neste caminho a cadeia
  // tem sempre os mesmos 4 saltos.
  if (req?.headers?.['x-vercel-forwarded-for'] && cadeia.length >= SALTOS_VIA_VERCEL) {
    return cadeia[cadeia.length - SALTOS_VIA_VERCEL];
  }

  if (cadeia.length >= SALTOS_DIRETO_RENDER) {
    return cadeia[cadeia.length - SALTOS_DIRETO_RENDER];
  }

  // Desenvolvimento local, teste com supertest, ou cadeia mais curta que o
  // esperado: cai no que o Express resolveu.
  return req?.ip || 'desconhecido';
};
