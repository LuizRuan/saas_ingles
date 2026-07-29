import { describe, it, expect } from 'vitest';
import { rewardFor, isRewarded, DUEL_BONUS } from './duelReward';

describe('rewardFor', () => {
  it('paga o bônus de vitória', () => {
    expect(rewardFor({ iWon: true, reason: 'completed' })).toBe(DUEL_BONUS.win);
  });

  it('paga o bônus de empate', () => {
    expect(rewardFor({ tie: true, reason: 'completed' })).toBe(DUEL_BONUS.tie);
  });

  it('paga o bônus de derrota (nunca subtrai — regra de scoring.js)', () => {
    expect(rewardFor({ iWon: false, reason: 'completed' })).toBe(DUEL_BONUS.loss);
    expect(rewardFor({ iWon: false, reason: 'completed' })).toBeGreaterThan(0);
  });

  // regressão do farm: duas abas, entra na fila, fecha uma → 30 estrelas a cada
  // ~5s sem responder nada. Com itens da Loja a 200-750, isso gerava ~1000
  // estrelas/minuto.
  it('NÃO paga nada em vitória por desistência do oponente', () => {
    expect(rewardFor({ iWon: true, reason: 'opponent_left' })).toBe(0);
  });

  it('não paga nem se vier marcado como empate junto da desistência', () => {
    expect(rewardFor({ tie: true, reason: 'opponent_left' })).toBe(0);
  });

  it('trata entrada vazia sem quebrar (cai em derrota)', () => {
    expect(rewardFor()).toBe(DUEL_BONUS.loss);
    expect(rewardFor({})).toBe(DUEL_BONUS.loss);
  });
});

describe('isRewarded', () => {
  it('partida concluída rende estrelas', () => {
    expect(isRewarded({ reason: 'completed' })).toBe(true);
  });

  it('desistência não rende — usado para esconder o bloco de recompensa', () => {
    expect(isRewarded({ reason: 'opponent_left' })).toBe(false);
  });

  it('sem partida, não rende', () => {
    expect(isRewarded(null)).toBe(false);
    expect(isRewarded(undefined)).toBe(false);
  });
});
