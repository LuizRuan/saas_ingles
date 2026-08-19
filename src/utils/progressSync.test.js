import { describe, it, expect } from 'vitest';
import { isLocalMoreAdvanced, totalWordsStudied } from './progressSync';

describe('isLocalMoreAdvanced', () => {
  it('local vence quando a nuvem não tem nada salvo (null)', () => {
    expect(isLocalMoreAdvanced({ wordsStudied: 34, totalScore: 100 }, null)).toBe(true);
  });

  it('local vence quando tem mais palavras estudadas', () => {
    const local = { wordsStudied: 200, totalScore: 500 };
    const cloud = { wordsStudied: 52, totalScore: 9999 };
    expect(isLocalMoreAdvanced(local, cloud)).toBe(true);
  });

  it('regressão: nuvem NÃO apaga progresso local mais avançado só por existir', () => {
    // Este é o bug real: um usuário com 34 níveis (muitas palavras) no
    // celular logando numa conta cuja última sincronização salva era de
    // quando ele tinha só 5 palavras. Antes, a nuvem sempre vencia.
    const localAvancado = { wordsStudied: 300, totalScore: 5000 };
    const nuvemDesatualizada = { wordsStudied: 5, totalScore: 50 };
    expect(isLocalMoreAdvanced(localAvancado, nuvemDesatualizada)).toBe(true);
  });

  it('nuvem vence quando tem mais palavras estudadas que o local', () => {
    const local = { wordsStudied: 10, totalScore: 9999 };
    const cloud = { wordsStudied: 100, totalScore: 10 };
    expect(isLocalMoreAdvanced(local, cloud)).toBe(false);
  });

  it('empate em palavras: desempata por pontuação total', () => {
    const localComMaisPontos = { wordsStudied: 50, totalScore: 800 };
    const nuvemComMenosPontos = { wordsStudied: 50, totalScore: 300 };
    expect(isLocalMoreAdvanced(localComMaisPontos, nuvemComMenosPontos)).toBe(true);

    const localComMenosPontos = { wordsStudied: 50, totalScore: 100 };
    const nuvemComMaisPontos = { wordsStudied: 50, totalScore: 900 };
    expect(isLocalMoreAdvanced(localComMenosPontos, nuvemComMaisPontos)).toBe(false);
  });

  it('empate total: nuvem vence (não troca nada à toa)', () => {
    const progresso = { wordsStudied: 50, totalScore: 500 };
    expect(isLocalMoreAdvanced({ ...progresso }, { ...progresso })).toBe(false);
  });

  it('lida com campos ausentes como zero, sem quebrar', () => {
    expect(isLocalMoreAdvanced({}, {})).toBe(false);
    expect(isLocalMoreAdvanced({ wordsStudied: 1 }, {})).toBe(true);
  });
});

describe('comparação entre idiomas', () => {
  it('soma as palavras de todos os cursos, não só o ativo', () => {
    const p = {
      activeCourse: 'es-pt',
      wordsStudied: 20,
      courseProgress: { 'en-pt': { wordsStudied: 400 } },
    };
    expect(totalWordsStudied(p)).toBe(420);
  });

  it('regressão: trocar pro espanhol não faz a nuvem apagar o inglês', () => {
    // O celular está no espanhol (nível 1) mas carrega o inglês inteiro
    // guardado. Comparar só o campo plano (20) contra a nuvem (400) daria
    // "local está atrás" e sobrescreveria 400 palavras de inglês com nada.
    const localNoEspanhol = {
      activeCourse: 'es-pt',
      wordsStudied: 20,
      totalScore: 5000,
      courseProgress: { 'en-pt': { wordsStudied: 400 } },
    };
    const nuvemSoIngles = { activeCourse: 'en-pt', wordsStudied: 400, totalScore: 5000 };

    expect(totalWordsStudied(localNoEspanhol)).toBe(420);
    expect(isLocalMoreAdvanced(localNoEspanhol, nuvemSoIngles)).toBe(true);
  });
});
