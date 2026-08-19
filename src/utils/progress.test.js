// Lógica de progresso: pontuação, níveis, revisão, chave canônica e desafio
// diário. Cada bloco marcado "regressão" corresponde a um bug real já corrigido.
import { describe, it, expect } from 'vitest';
import { calculatePoints, checkStreakBonus, POINTS } from './scoring';
import { getCurrentLevel, getNextLevel, getLevelProgress, getUserTitle } from './levelSystem';
import { recordWordResult, getWordsToReview, getPhrasesToReview, getReviewUrgency, mixReviewWords, LEARNED_THRESHOLD } from './reviewSystem';
import { normalizeKey, resolveWordKey, mergeStats } from './wordKey';
import { generateDailyChallenge, isDailyChallengeCompleted } from './dailyChallenge';
import { levels } from '../data/categories';
import { words } from '../data/words';
import { getWords } from '../data/index';

const progressoVazio = () => ({
  wordStats: {}, phraseStats: {}, errorHistory: [],
  totalCorrect: 0, totalWrong: 0, currentStreak: 0, bestStreak: 0,
});

describe('pontuação', () => {
  it('premia por tentativa e nunca subtrai', () => {
    expect(calculatePoints(1)).toBe(POINTS.FIRST_TRY);
    expect(calculatePoints(2)).toBe(POINTS.SECOND_TRY);
    expect(calculatePoints(1, true)).toBe(POINTS.WITH_HINT);
    expect(calculatePoints(9)).toBeGreaterThan(0);
  });

  it('dá bônus a cada 5 acertos seguidos', () => {
    expect(checkStreakBonus(5)).toBe(POINTS.STREAK_BONUS);
    expect(checkStreakBonus(10)).toBe(POINTS.STREAK_BONUS);
    expect(checkStreakBonus(4)).toBe(0);
    expect(checkStreakBonus(0)).toBe(0);
  });
});

describe('níveis', () => {
  it('mapeia palavras estudadas para o nível certo', () => {
    expect(getCurrentLevel(0).level).toBe(1);
    expect(getCurrentLevel(levels[1].wordsNeeded).level).toBe(2);
    expect(getCurrentLevel(999999).level).toBe(levels.length);
    expect(getNextLevel(999999)).toBeNull();
  });

  it('o percentual fica sempre entre 0 e 100', () => {
    [0, 5, 20, 100, 999999].forEach(n => {
      const v = getLevelProgress(n);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
  });

  it('retorna os títulos certos a cada 10 níveis até o 100', () => {
    expect(getUserTitle(1).title).toBe('Iniciante');
    expect(getUserTitle(10).title).toBe('Estudante');
    expect(getUserTitle(20).title).toBe('Conversador');
    expect(getUserTitle(30).title).toBe('Poliglota');
    expect(getUserTitle(40).title).toBe('Especialista');
    expect(getUserTitle(50).title).toBe('Sábio');
    expect(getUserTitle(60).title).toBe('Mestre das Frases');
    expect(getUserTitle(70).title).toBe('Fluente Épico');
    // Neutro de idioma de propósito: o mesmo título serve para quem estuda
    // inglês e para quem estuda espanhol (ver levelSystem.js).
    expect(getUserTitle(80).title).toBe('Lenda do Idioma');
    expect(getUserTitle(90).title).toBe('Imortal do Idioma');
    expect(getUserTitle(100).title).toBe('Supremo Mestre');
  });
});

describe('chave canônica', () => {
  it('ignora caixa e pontuação de borda', () => {
    expect(normalizeKey('Good morning!')).toBe(normalizeKey('good morning'));
    expect(resolveWordKey('Good morning!')).toBe('Good morning');
    expect(resolveWordKey('blue')).toBe('Blue');
  });

  it('devolve null para o que não é vocabulário', () => {
    expect(resolveWordKey('I am happy.')).toBeNull();
    expect(resolveWordKey('')).toBeNull();
  });

  it('mergeStats soma sem perder histórico', () => {
    const a = { correct: 1, wrong: 2, timestamps: [1], lastSeen: 1 };
    const b = { correct: 3, wrong: 0, timestamps: [5], lastSeen: 5 };
    expect(mergeStats(a, b)).toMatchObject({ correct: 4, wrong: 2, timestamps: [1, 5], lastSeen: 5 });
  });
});

describe('registro de resultado', () => {
  it('contabiliza acerto, sequência e recorde', () => {
    let p = recordWordResult(progressoVazio(), 'Hello', true);
    expect(p.wordStats.Hello.correct).toBe(1);
    expect(p.currentStreak).toBe(1);
    expect(p.bestStreak).toBe(1);
    p = recordWordResult(p, 'Hello', false);
    expect(p.currentStreak).toBe(0);
    expect(p.bestStreak).toBe(1);
    expect(p.errorHistory).toHaveLength(1);
  });

  it('regressão: é PURA — não altera o progresso recebido', () => {
    // O bug: push direto em errorHistory/wordStats fazia o StrictMode
    // duplicar cada erro (um clique registrava 2).
    const antes = recordWordResult(progressoVazio(), 'Hello', false);
    const copia = structuredClone(antes);
    const depois = recordWordResult(antes, 'Hello', false);
    expect(antes).toEqual(copia);            // entrada intacta
    expect(depois.errorHistory).toHaveLength(2);
    expect(antes.errorHistory).toHaveLength(1);
  });

  it('regressão: chamar duas vezes com o mesmo estado dá o mesmo resultado', () => {
    const base = progressoVazio();
    const a = recordWordResult(base, 'Hello', false);
    const b = recordWordResult(base, 'Hello', false);
    expect(a.errorHistory).toHaveLength(1);
    expect(b.errorHistory).toHaveLength(1);
  });

  it('regressão: frases vão para phraseStats, não inflam palavras estudadas', () => {
    let p = recordWordResult(progressoVazio(), 'I am happy.', true);
    expect(p.wordsStudied).toBe(0);
    expect(Object.keys(p.phraseStats)).toEqual(['I am happy.']);
    p = recordWordResult(p, 'Hello', true);
    expect(p.wordsStudied).toBe(1);
  });

  it('regressão: grafias diferentes da mesma palavra somam na mesma chave', () => {
    let p = recordWordResult(progressoVazio(), 'Good morning', true);
    p = recordWordResult(p, 'Good morning!', true);
    expect(Object.keys(p.wordStats)).toEqual(['Good morning']);
    expect(p.wordStats['Good morning'].correct).toBe(2);
    expect(p.wordsStudied).toBe(1);
  });

  it('limita o histórico de erros a 100', () => {
    let p = progressoVazio();
    for (let i = 0; i < 150; i++) p = recordWordResult(p, `Palavra ${i}`, false);
    expect(p.errorHistory).toHaveLength(100);
  });

  it('só marca "aprendida" com acertos em dias distintos', () => {
    let p = progressoVazio();
    for (let i = 0; i < LEARNED_THRESHOLD; i++) p = recordWordResult(p, 'Dog', true);
    expect(p.wordStats.Dog.learned).toBeUndefined(); // tudo no mesmo dia
    expect(p.wordsLearned).toBe(1);                  // mas já conta pelo limiar
  });
});

describe('revisão', () => {
  it('lista palavras erradas e ignora as já dominadas', () => {
    let p = progressoVazio();
    p = recordWordResult(p, 'Hello', false);
    const revisar = getWordsToReview(p, words).map(w => w.en);
    expect(revisar).toContain('Hello');
  });

  it('regressão: erro gravado com outra grafia aparece na revisão', () => {
    // Antes, TranslationQuiz gravava "Good morning!" e a revisão — que casa
    // contra words.js — nunca encontrava a palavra.
    let p = recordWordResult(progressoVazio(), 'Good morning!', false);
    expect(getWordsToReview(p, words).map(w => w.en)).toContain('Good morning');
  });

  it('mixReviewWords preserva o tamanho do lote', () => {
    expect(mixReviewWords(words.slice(0, 10), words.slice(20, 25), 0.3)).toHaveLength(10);
  });

  it('palavra dominada sai da revisão ao atingir o limiar', () => {
    let p = recordWordResult(progressoVazio(), 'Hello', false);
    expect(getWordsToReview(p, words)).toHaveLength(1);
    for (let i = 0; i < LEARNED_THRESHOLD; i++) p = recordWordResult(p, 'Hello', true);
    expect(getWordsToReview(p, words)).toHaveLength(0);
  });

  it('regressão: 1 acerto na revisão já remove a palavra, sem esperar o limiar', () => {
    // Antes, a lista só considerava "revisada" ao atingir LEARNED_THRESHOLD
    // acertos totais — quem terminava a tela "Revisão Concluída!" via a
    // mesma palavra continuar aparecendo, porque 1 acerto raramente chega
    // ao limiar sozinho.
    let p = recordWordResult(progressoVazio(), 'Hello', false);
    expect(getWordsToReview(p, words)).toHaveLength(1);
    p = recordWordResult(p, 'Hello', true);
    expect(getWordsToReview(p, words)).toHaveLength(0);
  });

  it('regressão: um erro novo depois de acertar volta a marcar a palavra pra revisão', () => {
    let p = recordWordResult(progressoVazio(), 'Hello', false);
    p = recordWordResult(p, 'Hello', true);
    expect(getWordsToReview(p, words)).toHaveLength(0);
    p = recordWordResult(p, 'Hello', false);
    expect(getWordsToReview(p, words)).toHaveLength(1);
  });

  it('regressão: filtro da Home oculta revisão quando lastResult é correct', () => {
    let p = recordWordResult(progressoVazio(), 'Hello', false);
    const withErrorsBefore = Object.values(p.wordStats).filter(s => s.wrong > 0 && s.lastResult !== 'correct');
    expect(withErrorsBefore).toHaveLength(1);

    p = recordWordResult(p, 'Hello', true);
    const withErrorsAfter = Object.values(p.wordStats).filter(s => s.wrong > 0 && s.lastResult !== 'correct');
    expect(withErrorsAfter).toHaveLength(0);
  });

  it('regressão: erro em jogo de frase (Montar Frases/Tradução/Conversa) aparece na revisão', () => {
    // Antes, getWordsToReview só olhava wordStats — quem errava só em frases
    // inteiras (que caem em phraseStats, não em wordStats) nunca via nada
    // pra revisar, mesmo errando bastante.
    let p = recordWordResult(progressoVazio(), 'I am happy.', false);
    expect(getWordsToReview(p, words)).toHaveLength(0); // não é vocabulário
    const frases = getPhrasesToReview(p);
    expect(frases).toHaveLength(1);
    expect(frases[0].text).toBe('I am happy.');
    expect(frases[0].wrong).toBe(1);
  });

  it('frase some da revisão ao ser marcada como revisada (mesma regra das palavras)', () => {
    let p = recordWordResult(progressoVazio(), 'I am happy.', false);
    expect(getPhrasesToReview(p)).toHaveLength(1);
    p = recordWordResult(p, 'I am happy.', true);
    expect(getPhrasesToReview(p)).toHaveLength(0);
  });

  it('getReviewUrgency soma palavras e frases na contagem total', () => {
    let p = recordWordResult(progressoVazio(), 'Hello', false);
    p = recordWordResult(p, 'I am happy.', false);
    const urgencia = getReviewUrgency(p, words);
    expect(urgencia.level).not.toBe('none');
    expect(urgencia.count).toBe(2); // 1 palavra + 1 frase
  });
});

// Texto exibido de uma alternativa, seja ela objeto de palavra ou string.
const rotuloDaOpcao = (o) => (typeof o === 'string' ? o : o.en);

describe('desafio diário', () => {
  it('é determinístico no mesmo dia, inclusive nas alternativas', () => {
    const sig = (r) => r.challenges.map(c => `${c.type}:${c.answer.en}[${c.options.map(rotuloDaOpcao)}]`).join('|');
    expect(sig(generateDailyChallenge(words))).toBe(sig(generateDailyChallenge(words)));
  });

  // As opções vêm em DUAS formas conforme o passo, e isso é de propósito:
  // os passos de vocabulário carregam objetos de palavra (o componente mostra
  // a tradução e o WordExplanation), enquanto `fillBlanks` carrega as strings
  // da lacuna — não existe objeto de palavra para "nombre".
  //
  // Regressão do TESTE, não do produto: a asserção antiga exigia `.en` de todo
  // passo. Nos ~12% dos dias em que o sorteio traz um fillBlanks, ela lia
  // quatro `undefined`, reportava "1 opção distinta" e falhava — sem nada
  // quebrado na tela. Um teste que falha em dias aleatórios treina a gente a
  // ignorar a suíte inteira.
  it('regressão: todo passo tem 4 alternativas distintas com 1 correta', () => {
    generateDailyChallenge(words).challenges.forEach(c => {
      expect(c.options).toHaveLength(4);

      const rotulos = c.options.map(rotuloDaOpcao);
      expect(new Set(rotulos).size, `passo ${c.type}`).toBe(4);
      expect(rotulos.filter(r => r === c.answer.en), `passo ${c.type}`).toHaveLength(1);
    });
  });

  it('regressão: não quebra com acervo pequeno', () => {
    [1, 2, 5, 8].forEach(n => {
      const c = generateDailyChallenge(words.slice(0, n));
      c.challenges.forEach(ch => expect(ch.answer).toBeTruthy());
    });
    expect(generateDailyChallenge([]).challenges).toEqual([]);
  });

  it('reconhece o desafio já concluído hoje', () => {
    expect(isDailyChallengeCompleted({ lastDailyChallengeDate: new Date().toDateString() })).toBe(true);
    expect(isDailyChallengeCompleted({ lastDailyChallengeDate: 'Mon Jan 01 2024' })).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Multi-idioma. Este bloco existe por causa de um bug que teria feito o curso
// de espanhol PARECER funcionar sem registrar nada: resolveWordKey resolvia
// sempre contra o banco de inglês, então "Hola" não era reconhecida como
// vocabulário, caía em phraseStats, e wordsStudied nunca subia — nível travado
// no 1 para sempre, sem nenhum erro visível na tela.
// ───────────────────────────────────────────────────────────────────────────
describe('progresso multi-idioma', () => {
  const espanhol = () => ({ ...progressoVazio(), activeCourse: 'es-pt' });

  it('regressão: palavra em espanhol conta como vocabulário, não como frase', () => {
    const p = recordWordResult(espanhol(), 'Hola', true);

    expect(p.wordStats['Hola']).toBeDefined();
    expect(p.phraseStats['Hola']).toBeUndefined();
    expect(p.wordsStudied).toBe(1);
  });

  it('regressão: acertar em espanhol faz o nível subir de verdade', () => {
    let p = espanhol();
    for (const palavra of ['Hola', 'Gracias', 'Perro', 'Gato', 'Casa', 'Agua']) {
      p = recordWordResult(p, palavra, true);
    }

    expect(p.wordsStudied).toBe(6);
    // A escada do espanhol é calibrada para o próprio banco (346 palavras):
    // 6 palavras já saem do nível 1. Na escada do inglês, 6 seriam nível 1
    // ainda — é por isso que a escada é por curso.
    expect(getCurrentLevel(p.wordsStudied, 'es-pt').level).toBeGreaterThan(1);
  });

  it('cada banco só reconhece o próprio vocabulário', () => {
    expect(resolveWordKey('Hola', 'es-pt')).toBe('Hola');
    expect(resolveWordKey('Hola', 'en-pt')).toBeNull();
    expect(resolveWordKey('Hello', 'en-pt')).toBe('Hello');
    expect(resolveWordKey('Hello', 'es-pt')).toBeNull();
  });

  it('a mesma contagem significa níveis diferentes em cada curso', () => {
    // 200 palavras é meio caminho no espanhol e ainda começo no inglês.
    const nivelEs = getCurrentLevel(200, 'es-pt').level;
    const nivelEn = getCurrentLevel(200, 'en-pt').level;
    expect(nivelEs).toBeGreaterThan(nivelEn);
  });

  it('a revisão em espanhol enxerga os erros em espanhol', () => {
    const p = recordWordResult(espanhol(), 'Perro', false);
    const paraRevisar = getWordsToReview(p, getWords('es-pt'));
    expect(paraRevisar.map(w => w.en)).toContain('Perro');
  });

  it('normalização lida com a pontuação invertida do espanhol', () => {
    // "¿Cómo estás?" precisa resolver igual a "cómo estás" — sem isso, toda
    // resposta digitada com ¿ ¡ viraria uma entrada nova em phraseStats.
    expect(normalizeKey('¿Dónde?')).toBe('dónde');
    expect(normalizeKey('¡Hola!')).toBe('hola');
  });
});
