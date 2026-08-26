import { describe, expect, it } from 'vitest';
import { createHangmanGameResult, getHangmanMedal } from './hangmanScoring';

describe('pontuação da Forca', () => {
  it('premia dificuldade e modo sem dar pontos por derrota', () => {
    const easy = createHangmanGameResult({ mode: 'easy', won: true, difficulty: 30, letterCount: 6 });
    const hard = createHangmanGameResult({ mode: 'hard', won: true, difficulty: 80, letterCount: 6 });
    const loss = createHangmanGameResult({ mode: 'hard', won: false, difficulty: 100, letterCount: 12 });
    expect(hard.points).toBeGreaterThan(easy.points);
    expect(loss.points).toBe(0);
  });

  it('reduz desempenho e pontos quando há erros ou assistência', () => {
    const perfect = createHangmanGameResult({ mode: 'medium', won: true, difficulty: 50, wrongCount: 0, hintsUsed: 0 });
    const assisted = createHangmanGameResult({ mode: 'medium', won: true, difficulty: 50, wrongCount: 3, hintsUsed: 1, translationUsed: true });
    expect(assisted.performance).toBeLessThan(perfect.performance);
    expect(assisted.points).toBeLessThan(perfect.points);
  });

  it('atribui as quatro classificações de resultado', () => {
    expect(getHangmanMedal({ won: true, performance: 95 }).id).toBe('gold');
    expect(getHangmanMedal({ won: true, performance: 80 }).id).toBe('silver');
    expect(getHangmanMedal({ won: true, performance: 60 }).id).toBe('bronze');
    expect(getHangmanMedal({ won: false, performance: 0 }).id).toBe('effort');
  });
});
