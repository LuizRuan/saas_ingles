import { describe, it, expect } from 'vitest';
import {
  switchCourse,
  snapshotCourse,
  summarizeCourses,
  emptyCourseSnapshot,
  buildCourseStats,
  withCourseStats,
  COURSE_SCOPED_FIELDS,
} from './courseProgress';
import { recordWordResult } from './reviewSystem';
import { getCurrentLevel } from './levelSystem';
import { sanitizeProgress, saveProgress } from './storage';
import { getWords } from '../data/index';

// Um progresso de alguém adiantado em inglês.
const ingles40 = () => ({
  activeCourse: 'en-pt',
  wordsStudied: 400,
  wordsLearned: 300,
  totalCorrect: 900,
  totalScore: 12000,
  currentStreak: 7,
  wordStats: { Hello: { correct: 5, wrong: 1 } },
  gamesCompleted: { memory: 12 },
  shopItems: ['theme_ocean'],
  achievements: ['first_word'],
  selectedTheme: 'ocean',
});

describe('progresso por curso', () => {
  it('primeira vez no espanhol começa do zero, sem herdar o inglês', () => {
    const depois = switchCourse(ingles40(), 'es-pt');

    expect(depois.activeCourse).toBe('es-pt');
    expect(depois.wordsStudied).toBe(0);
    expect(depois.wordsLearned).toBe(0);
    expect(depois.totalCorrect).toBe(0);
    expect(depois.wordStats).toEqual({});
    expect(depois.gamesCompleted).toEqual({});
  });

  it('a economia e a identidade da conta atravessam a troca', () => {
    const depois = switchCourse(ingles40(), 'es-pt');

    // Estrelas, itens, tema e conquistas são da conta — não do idioma.
    expect(depois.totalScore).toBe(12000);
    expect(depois.shopItems).toEqual(['theme_ocean']);
    expect(depois.achievements).toEqual(['first_word']);
    expect(depois.selectedTheme).toBe('ocean');
  });

  it('voltar pro inglês restaura exatamente onde parou', () => {
    const original = ingles40();
    const noEspanhol = switchCourse(original, 'es-pt');
    const devolta = switchCourse(noEspanhol, 'en-pt');

    expect(devolta.activeCourse).toBe('en-pt');
    expect(devolta.wordsStudied).toBe(400);
    expect(devolta.wordsLearned).toBe(300);
    expect(devolta.totalCorrect).toBe(900);
    expect(devolta.wordStats).toEqual({ Hello: { correct: 5, wrong: 1 } });
    expect(devolta.gamesCompleted).toEqual({ memory: 12 });
  });

  it('o progresso feito em espanhol sobrevive a uma ida e volta ao inglês', () => {
    let p = switchCourse(ingles40(), 'es-pt');
    // Estudou um pouco de espanhol...
    p = { ...p, wordsStudied: 25, wordStats: { Hola: { correct: 3, wrong: 0 } } };
    // ...foi pro inglês e voltou.
    p = switchCourse(p, 'en-pt');
    expect(p.wordsStudied).toBe(400); // inglês intacto
    p = switchCourse(p, 'es-pt');

    expect(p.wordsStudied).toBe(25);
    expect(p.wordStats).toEqual({ Hola: { correct: 3, wrong: 0 } });
  });

  it('invariante: o curso ativo nunca fica guardado em courseProgress', () => {
    // Duas verdades pro mesmo curso divergem em silêncio — este é o bug que
    // a invariante existe pra impedir.
    const p = switchCourse(ingles40(), 'es-pt');
    expect(p.courseProgress['es-pt']).toBeUndefined();
    expect(p.courseProgress['en-pt']).toBeDefined();

    const devolta = switchCourse(p, 'en-pt');
    expect(devolta.courseProgress['en-pt']).toBeUndefined();
    expect(devolta.courseProgress['es-pt']).toBeDefined();
  });

  it('trocar para o curso que já está ativo é no-op', () => {
    const original = ingles40();
    expect(switchCourse(original, 'en-pt')).toBe(original);
  });

  it('é pura: não modifica o progresso recebido', () => {
    const original = ingles40();
    const copia = JSON.parse(JSON.stringify(original));
    switchCourse(original, 'es-pt');
    expect(original).toEqual(copia);
  });

  it('emptyCourseSnapshot cobre exatamente os campos de COURSE_SCOPED_FIELDS', () => {
    // Um campo de aprendizado que entre em COURSE_SCOPED_FIELDS mas fique de
    // fora do snapshot vazio viraria `undefined` no curso novo em vez de zero.
    expect(Object.keys(emptyCourseSnapshot()).sort()).toEqual([...COURSE_SCOPED_FIELDS].sort());
  });

  it('snapshotCourse pega só os campos do curso, nunca os da conta', () => {
    const snap = snapshotCourse(ingles40());
    expect(snap.wordsStudied).toBe(400);
    expect(snap.totalScore).toBeUndefined();
    expect(snap.shopItems).toBeUndefined();
    expect(snap.achievements).toBeUndefined();
  });
});

describe('resumo dos cursos (para o seletor)', () => {
  it('mostra o ativo e o guardado sem precisar trocar', () => {
    let p = switchCourse(ingles40(), 'es-pt');
    p = { ...p, wordsStudied: 25 };

    const resumo = summarizeCourses(p, ['en-pt', 'es-pt']);

    expect(resumo['es-pt'].isActive).toBe(true);
    expect(resumo['es-pt'].wordsStudied).toBe(25);
    expect(resumo['en-pt'].isActive).toBe(false);
    expect(resumo['en-pt'].wordsStudied).toBe(400);
    expect(resumo['en-pt'].started).toBe(true);
  });

  it('curso nunca aberto aparece como não iniciado', () => {
    const resumo = summarizeCourses(ingles40(), ['en-pt', 'es-pt']);
    expect(resumo['es-pt'].started).toBe(false);
    expect(resumo['es-pt'].wordsStudied).toBe(0);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Jornada completa, ponta a ponta — é o requisito de produto literal:
// "em inglês nível 40, a primeira vez do espanhol vai pro nível 1, e sempre
// que mudar deve aparecer no nível que ele tinha parado".
//
// Usa as funções REAIS de gravação, saneamento e nível, não objetos de
// mentira: é o único jeito de pegar uma quebra na costura entre elas
// (ex.: o saneamento descartando courseProgress, ou a migração de stats
// resolvendo o vocabulário contra o banco do curso errado).
// ───────────────────────────────────────────────────────────────────────────
const nivelDe = (p) => getCurrentLevel(p.wordsStudied, p.activeCourse).level;
const estudar = (p, courseId, quantas) =>
  getWords(courseId).slice(0, quantas).reduce((acc, w) => recordWordResult(acc, w.en, true), p);

describe('jornada real de troca de idioma', () => {
  it('inglês avançado → espanhol do zero → volta com o inglês intacto', () => {
    // 1. Alguém que estudou muito inglês.
    let p = sanitizeProgress({ activeCourse: 'en-pt' });
    p = estudar(p, 'en-pt', 330);
    p = { ...p, totalScore: 12000, shopItems: ['theme_ocean'] };

    const nivelIngles = nivelDe(p);
    expect(nivelIngles).toBeGreaterThanOrEqual(30);
    expect(p.wordsStudied).toBe(330);

    // 2. Primeira vez no espanhol: começa do zero, como pedido.
    p = sanitizeProgress(switchCourse(p, 'es-pt'));
    expect(p.activeCourse).toBe('es-pt');
    expect(nivelDe(p)).toBe(1);
    expect(p.wordsStudied).toBe(0);
    // ...mas a carteira e os itens são da conta, não do idioma.
    expect(p.totalScore).toBe(12000);
    expect(p.shopItems).toEqual(['theme_ocean']);

    // 3. Estuda espanhol de verdade — e o nível sobe (o bug do wordKey faria
    //    isso ficar travado em 0 palavras / nível 1 para sempre).
    p = estudar(p, 'es-pt', 40);
    expect(p.wordsStudied).toBe(40);
    const nivelEspanhol = nivelDe(p);
    expect(nivelEspanhol).toBeGreaterThan(1);

    // 4. Volta pro inglês: exatamente onde parou.
    p = sanitizeProgress(switchCourse(p, 'en-pt'));
    expect(p.wordsStudied).toBe(330);
    expect(nivelDe(p)).toBe(nivelIngles);

    // 5. Volta pro espanhol: também exatamente onde parou.
    p = sanitizeProgress(switchCourse(p, 'es-pt'));
    expect(p.wordsStudied).toBe(40);
    expect(nivelDe(p)).toBe(nivelEspanhol);

    // 6. Sobrevive a um ciclo de serialização (localStorage e Mongo guardam
    //    o progresso como JSON — se o saneamento descartasse courseProgress,
    //    o inglês sumiria silenciosamente no primeiro reload).
    p = sanitizeProgress(JSON.parse(JSON.stringify(p)));
    expect(p.wordsStudied).toBe(40);
    expect(p.courseProgress['en-pt'].wordsStudied).toBe(330);
    expect(p.courseProgress['es-pt']).toBeUndefined();
  });
});

// ───────────────────────────────────────────────────────────────────────────
// courseStats é o índice que o ranking POR IDIOMA usa no servidor. O Mongo
// ordena por `progress.courseStats.<curso>.wordsStudied`, então este mapa
// precisa cobrir todos os cursos sempre — inclusive o ativo, cuja contagem
// mora nos campos planos.
// ───────────────────────────────────────────────────────────────────────────
describe('índice por curso para o ranking', () => {
  it('cobre o curso ativo e os guardados na mesma estrutura', () => {
    let p = switchCourse(ingles40(), 'es-pt');
    p = { ...p, wordsStudied: 25 };

    expect(buildCourseStats(p)).toEqual({
      'en-pt': { wordsStudied: 400 },
      'es-pt': { wordsStudied: 25 },
    });
  });

  it('sobrevive ao saneamento e continua batendo com os campos planos', () => {
    // O risco real é o índice ficar velho: migrateStats reconta wordsStudied
    // dentro do saneamento, então se courseStats fosse derivado antes disso
    // ele guardaria o número anterior e o ranking mostraria um valor defasado.
    let p = sanitizeProgress({ activeCourse: 'en-pt' });
    p = estudar(p, 'en-pt', 20);
    p = sanitizeProgress(switchCourse(p, 'es-pt'));
    p = estudar(p, 'es-pt', 7);
    p = sanitizeProgress(p);

    expect(p.courseStats['es-pt'].wordsStudied).toBe(p.wordsStudied);
    expect(p.courseStats['es-pt'].wordsStudied).toBe(7);
    expect(p.courseStats['en-pt'].wordsStudied).toBe(20);
  });

  it('o ranking de um idioma não enxerga a contagem do outro', () => {
    // A regressão que isto prende: com o campo plano, quem estava estudando
    // espanhol aparecia no ranking de inglês com o número do espanhol.
    let p = sanitizeProgress({ activeCourse: 'en-pt' });
    p = estudar(p, 'en-pt', 30);
    p = sanitizeProgress(switchCourse(p, 'es-pt'));

    expect(p.wordsStudied).toBe(0);               // campo plano: espanhol, zerado
    expect(p.courseStats['en-pt'].wordsStudied).toBe(30);  // inglês preservado
    expect(p.courseStats['es-pt'].wordsStudied).toBe(0);
  });
});

describe('índice fresco a cada gravação', () => {
  it('regressão: jogar sem recarregar a página mantém o índice em dia', () => {
    // O furo: courseStats era derivado só no saneamento, mas o app grava e
    // sincroniza a cada resposta certa — sem passar por lá. O servidor
    // receberia a contagem congelada no último load, e o ranking mostraria
    // um número de horas atrás parecendo estar funcionando.
    let p = sanitizeProgress({ activeCourse: 'en-pt' });
    p = estudar(p, 'en-pt', 40);          // 40 respostas sem recarregar

    // Sem normalizar, o índice está velho — é este o estado que ia pro servidor.
    expect(p.courseStats['en-pt'].wordsStudied).toBe(0);

    // saveProgress (o ponto único de escrita) devolve o objeto já em dia.
    expect(withCourseStats(p).courseStats['en-pt'].wordsStudied).toBe(40);
    expect(saveProgress(p).courseStats['en-pt'].wordsStudied).toBe(40);
  });
});
