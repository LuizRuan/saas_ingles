import { describe, it, expect } from 'vitest';
import { stories, STORY_LEVELS } from './stories';
import { storyVocabulary } from './storyVocabulary';
import { tokenizeText, normalizeWord } from '../utils/storyTokenizer';

describe('histórias', () => {
  it('tem ids únicos', () => {
    const dupes = stories.map(s => s.id).filter((v, i, a) => a.indexOf(v) !== i);
    expect(dupes).toEqual([]);
  });

  it('tem 8 histórias iniciante e 8 intermediário', () => {
    expect(stories.filter(s => s.level === 'iniciante').length).toBe(8);
    expect(stories.filter(s => s.level === 'intermediario').length).toBe(8);
  });

  it('só usa níveis declarados em STORY_LEVELS', () => {
    const niveisValidos = Object.keys(STORY_LEVELS);
    const invalidas = stories.filter(s => !niveisValidos.includes(s.level)).map(s => s.id);
    expect(invalidas).toEqual([]);
  });

  it('tem todos os campos que a UI mostra', () => {
    const semCampo = stories.filter(s =>
      !s.id || !s.level || !s.icon || !s.title || !s.titlePt || !s.summaryPt ||
      !Array.isArray(s.paragraphs) || s.paragraphs.length === 0
    ).map(s => s.id || '(sem id)');
    expect(semCampo).toEqual([]);
  });

  it('nenhum parágrafo é vazio', () => {
    const vazios = [];
    for (const s of stories) {
      s.paragraphs.forEach((p, i) => {
        if (typeof p !== 'string' || !p.trim()) vazios.push(`${s.id}[${i}]`);
      });
    }
    expect(vazios).toEqual([]);
  });

  it('toda palavra de toda história resolve em storyVocabulary (nenhum clique cai no vazio)', () => {
    const faltando = new Set();
    for (const s of stories) {
      for (const p of s.paragraphs) {
        for (const tok of tokenizeText(p)) {
          if (tok.type !== 'word') continue;
          const key = normalizeWord(tok.text);
          if (key && !storyVocabulary[key]) faltando.add(`${s.id}: ${key}`);
        }
      }
    }
    expect([...faltando]).toEqual([]);
  });
});

describe('vocabulário de histórias', () => {
  it('toda entrada tem pt e exatamente 5 exemplos completos', () => {
    const ruins = Object.entries(storyVocabulary)
      .filter(([, v]) => !v.pt || !Array.isArray(v.examples) || v.examples.length !== 5
        || v.examples.some(e => !e.en || !e.pt))
      .map(([k]) => k);
    expect(ruins).toEqual([]);
  });

  it('não sobra entrada não usada em nenhuma história', () => {
    const usadas = new Set();
    for (const s of stories) {
      for (const p of s.paragraphs) {
        for (const tok of tokenizeText(p)) {
          if (tok.type !== 'word') continue;
          const key = normalizeWord(tok.text);
          if (key) usadas.add(key);
        }
      }
    }
    const sobrando = Object.keys(storyVocabulary).filter(k => !usadas.has(k));
    expect(sobrando).toEqual([]);
  });
});
