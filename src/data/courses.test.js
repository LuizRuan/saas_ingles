// Contrato de dados COMPARTILHADO entre todos os cursos.
//
// Por que este arquivo existe: os dados de espanhol foram criados com formatos
// próprios e divergentes do inglês — `sentences` usava { text, translation } em
// vez de { en, pt }, `imageWords` não tinha `category` nem `level` (justamente
// os campos que o Jogo da Imagem usa para montar as rodadas) e as conversas
// usavam `title` onde a tela lê `topic`. Nada disso quebra o build: os jogos
// simplesmente vinham vazios ou sem nome em espanhol.
//
// As asserções abaixo rodam sobre TODO curso registrado em AVAILABLE_COURSES,
// então um curso novo (italiano, francês…) já nasce coberto.

import { describe, it, expect } from 'vitest';
import { AVAILABLE_COURSES, getCourseData } from './index.js';

const cursos = AVAILABLE_COURSES.map(c => c.id);

describe.each(cursos)('contrato de dados — curso %s', (courseId) => {
  const dados = getCourseData(courseId);

  describe('banco de palavras', () => {
    it('tem palavras e todas com os campos obrigatórios', () => {
      expect(dados.words.length).toBeGreaterThan(0);
      for (const w of dados.words) {
        expect(typeof w.en).toBe('string');
        expect(w.en.length).toBeGreaterThan(0);
        expect(typeof w.pt).toBe('string');
        expect(typeof w.category).toBe('string');
        expect(typeof w.pronunciation).toBe('string');
        expect(typeof w.example).toBe('string');
        expect(typeof w.examplePt).toBe('string');
        expect(typeof w.level).toBe('number');
        expect(typeof w.tip).toBe('string');
      }
    });

    it('não repete a mesma grafia — o mapa canônico do progresso é 1:1', () => {
      // resolveWordKey monta um Map por `en` normalizado. Duas entradas com a
      // mesma grafia colapsam numa só e uma delas nunca pontuaria.
      const vistos = dados.words.map(w => w.en);
      const duplicadas = vistos.filter((v, i) => vistos.indexOf(v) !== i);
      expect(duplicadas).toEqual([]);
    });
  });

  describe('escada de níveis', () => {
    it('começa em zero e é estritamente crescente', () => {
      expect(dados.levels[0].wordsNeeded).toBe(0);
      for (let i = 1; i < dados.levels.length; i++) {
        expect(dados.levels[i].wordsNeeded).toBeGreaterThan(dados.levels[i - 1].wordsNeeded);
      }
    });

    it('o topo cabe no banco deste curso', () => {
      // A regra que torna a escada por curso obrigatória: a do inglês pede 990
      // palavras, e aplicá-la ao espanhol (346) travaria o jogador no nível 3.
      const topo = dados.levels[dados.levels.length - 1].wordsNeeded;
      expect(topo).toBeLessThanOrEqual(dados.words.length);
    });
  });

  describe('frases', () => {
    it('sentences usa { en, pt, words[] } e a ordem das peças forma a frase', () => {
      expect(dados.sentences.length).toBeGreaterThan(0);
      for (const s of dados.sentences) {
        expect(typeof s.en).toBe('string');
        expect(typeof s.pt).toBe('string');
        expect(Array.isArray(s.words)).toBe(true);
        expect(s.words.length).toBeGreaterThan(0);
        for (const w of s.words) {
          expect(typeof w.en).toBe('string');
          expect(typeof w.pt).toBe('string');
        }
        // O SentenceBuilder embaralha `words` e compara a montagem com `en`.
        // Se a junção não bater, a frase fica impossível de acertar.
        //
        // A pontuação é ignorada na comparação porque o banco de inglês — a
        // implementação de referência, que funciona — não repete o ponto final
        // nas peças ("I am happy." tem peças I / am / happy). O que precisa
        // bater é a SEQUÊNCIA das palavras.
        const semPontuacao = (t) => t.replace(/[.!?¡¿,;:]/g, '').replace(/\s+/g, ' ').trim();
        expect(semPontuacao(s.words.map(w => w.en).join(' '))).toBe(semPontuacao(s.en));
      }
    });

    it('fillBlanks tem resposta dentro das opções', () => {
      for (const f of dados.fillBlanks) {
        expect(typeof f.sentence).toBe('string');
        expect(f.sentence).toContain('_____');
        expect(Array.isArray(f.options)).toBe(true);
        expect(f.options).toContain(f.answer);
      }
    });

    it('trueFalse é coerente: isCorrect bate com a tradução mostrada', () => {
      for (const t of dados.trueFalse) {
        expect(typeof t.word).toBe('string');
        expect(typeof t.correctTranslation).toBe('string');
        // Se marca `true`, a tradução exibida PRECISA ser a correta — senão o
        // jogo ensina o erro como se fosse acerto.
        expect(t.isCorrect).toBe(t.translation === t.correctTranslation);
      }
    });

    it('translationQuizzes tem a resposta certa entre as opções', () => {
      for (const q of dados.translationQuizzes) {
        expect(Array.isArray(q.options)).toBe(true);
        expect(q.options).toContain(q.correct);
        expect(new Set(q.options).size).toBe(q.options.length);
      }
    });
  });

  describe('jogo da imagem', () => {
    it('toda imagem aponta para uma palavra real do banco deste curso', () => {
      const banco = new Set(dados.words.map(w => w.en));
      for (const iw of dados.imageWords) {
        expect(banco.has(iw.en)).toBe(true);
      }
    });

    it('toda imagem tem categoria — é o que monta os distratores', () => {
      // buildRounds escolhe os 3 distratores dentro da MESMA categoria visual.
      // Sem `category` o jogo cai no fallback e perde a graça (ou vem vazio).
      for (const iw of dados.imageWords) {
        expect(typeof iw.category).toBe('string');
        expect(iw.category.length).toBeGreaterThan(0);
        expect(typeof iw.icon).toBe('string');
      }
    });

    it('cada categoria tem 4+ itens, o mínimo para uma rodada completa', () => {
      const porCategoria = {};
      for (const iw of dados.imageWords) {
        porCategoria[iw.category] = (porCategoria[iw.category] || 0) + 1;
      }
      for (const [categoria, total] of Object.entries(porCategoria)) {
        expect(total, `categoria "${categoria}"`).toBeGreaterThanOrEqual(4);
      }
    });
  });

  describe('conversas (grafos)', () => {
    it('usa topic/topicPt — os campos que a tela realmente lê', () => {
      expect(dados.conversations.length).toBeGreaterThan(0);
      for (const c of dados.conversations) {
        expect(typeof c.topic).toBe('string');
        expect(typeof c.topicPt).toBe('string');
        expect(typeof c.start).toBe('string');
        expect(c.nodes[c.start]).toBeDefined();
      }
    });

    it('todo `next` resolve para um nó existente', () => {
      for (const c of dados.conversations) {
        for (const [nodeId, node] of Object.entries(c.nodes)) {
          for (const reply of node.replies || []) {
            expect(c.nodes[reply.next], `${c.id}.${nodeId} -> ${reply.next}`).toBeDefined();
          }
        }
      }
    });

    it('todo nó é alcançável a partir de start', () => {
      for (const c of dados.conversations) {
        const vistos = new Set([c.start]);
        const fila = [c.start];
        while (fila.length) {
          const atual = c.nodes[fila.shift()];
          for (const reply of atual.replies || []) {
            if (!vistos.has(reply.next)) {
              vistos.add(reply.next);
              fila.push(reply.next);
            }
          }
        }
        expect(vistos.size, `${c.id}: nós órfãos`).toBe(Object.keys(c.nodes).length);
      }
    });

    it('todo diálogo chega a um fim', () => {
      for (const c of dados.conversations) {
        const terminais = Object.values(c.nodes).filter(n => (n.replies || []).length === 0);
        expect(terminais.length, `${c.id}`).toBeGreaterThan(0);
      }
    });
  });

  describe('histórias', () => {
    it('usa summaryPt/paragraphs e declara um nível conhecido', () => {
      expect(dados.stories.length).toBeGreaterThan(0);
      for (const s of dados.stories) {
        expect(typeof s.title).toBe('string');
        expect(typeof s.titlePt).toBe('string');
        expect(typeof s.summaryPt).toBe('string');
        expect(Array.isArray(s.paragraphs)).toBe(true);
        expect(s.paragraphs.length).toBeGreaterThan(0);
        expect(dados.storyLevels[s.level], `nível "${s.level}"`).toBeDefined();
      }
    });
  });
});
