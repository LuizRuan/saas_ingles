// Pina a integridade do banco curado do Jogo da Imagem: cada entrada precisa
// resolver contra uma palavra REAL de words.js (mesma grafia exata), e cada
// categoria precisa ter palavras suficientes para montar 4 opções por rodada
// sem repetir. Um erro de digitação aqui não quebra o build — só faz a
// palavra sumir em silêncio (ver o filter() em imageWords.js) ou uma
// categoria pequena demais fazer o jogo cair pro fallback fora de categoria
// com mais frequência do que deveria.
import { existsSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { imageWords, RAW_IMAGE_WORDS_COUNT } from './imageWords';

describe('imageWords', () => {
  it('toda entrada declarada resolve contra words.js — nenhuma foi descartada', () => {
    expect(imageWords).toHaveLength(RAW_IMAGE_WORDS_COUNT);
  });

  it('não repete a mesma palavra (en) duas vezes', () => {
    const vistos = imageWords.map((w) => w.en);
    expect(new Set(vistos).size).toBe(vistos.length);
  });

  it('toda entrada tem emoji e categoria', () => {
    for (const w of imageWords) {
      expect(typeof w.emoji, w.en).toBe('string');
      expect(w.emoji.length, w.en).toBeGreaterThan(0);
      expect(typeof w.category, w.en).toBe('string');
    }
  });

  it('cada categoria tem pelo menos 4 palavras — mínimo pra montar 1 rodada só com distratores do mesmo grupo', () => {
    const porCategoria = {};
    for (const w of imageWords) {
      porCategoria[w.category] = (porCategoria[w.category] || 0) + 1;
    }
    for (const [categoria, total] of Object.entries(porCategoria)) {
      expect(total, categoria).toBeGreaterThanOrEqual(4);
    }
  });

  it('todo `icon` aponta pra um SVG que existe de verdade em public/emoji-icons/', () => {
    // Auto-hospedado (OpenMoji, CC BY-SA 4.0) — sem isto, uma entrada com
    // `icon` apontando pra um arquivo inexistente só quebra em silêncio: o
    // <img> renderiza vazio, sem erro nenhum no console.
    for (const w of imageWords) {
      expect(w.icon, w.en).toMatch(/^\/emoji-icons\/[a-z0-9-]+\.svg$/);
      expect(existsSync(`public${w.icon}`), `${w.en} -> ${w.icon}`).toBe(true);
    }
  });

  it('o `word` resolvido carrega os campos que o WordExplanation precisa', () => {
    for (const w of imageWords) {
      expect(w.word.en, w.en).toBe(w.en);
      expect(typeof w.word.pt, w.en).toBe('string');
      expect(typeof w.word.level, w.en).toBe('number');
    }
  });
});
