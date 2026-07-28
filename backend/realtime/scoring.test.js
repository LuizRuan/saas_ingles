import { describe, it, expect } from 'vitest';
import { scoreFor } from './scoring.js';

describe('scoreFor', () => {
  it('resposta errada nunca pontua, não importa o tempo', () => {
    expect(scoreFor(false, Date.now() + 9000, Date.now())).toBe(0);
  });

  it('resposta certa rende 100 + bônus de velocidade calculado pelo servidor', () => {
    const deadline = 10_000;
    expect(scoreFor(true, deadline, 1_000)).toBe(100 + 9 * 10); // 9s restantes
    expect(scoreFor(true, deadline, 9_500)).toBe(100 + 1 * 10); // <1s restante, arredonda pra cima
  });

  it('nunca pontua negativo mesmo se a resposta chegar depois do prazo', () => {
    const deadline = 10_000;
    expect(scoreFor(true, deadline, 15_000)).toBe(100 + 0 * 10);
  });

  it('não tem NENHUM parâmetro de tempo vindo do cliente — só deadline (do servidor) e arrivedAt (medido no servidor)', () => {
    // Prova estrutural: a assinatura da função só aceita 3 argumentos, e os
    // dois de tempo (deadline/arrivedAt) são valores que só o servidor produz
    // (Date.now() no momento em que o servidor cria a rodada / recebe o pacote).
    // Não existe um 4º parâmetro "clientReportedTime" para um cliente malicioso
    // forjar.
    expect(scoreFor.length).toBe(3);
  });
});
