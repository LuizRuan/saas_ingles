// Barreira contra o defeito mais recorrente do multi-idioma: uma tela lendo
// conteúdo do banco de INGLÊS onde deveria ler o do curso ativo.
//
// Ele já apareceu quatro vezes, sempre igual e sempre em silêncio — nada falha
// no build, o dado existe, e a tela só vem vazia (ou com o idioma errado) para
// quem não está em inglês:
//   · Histórias importava STORY_LEVELS de data/stories.js
//   · MyWords listava as 42 categorias do inglês num curso que cobre 18
//   · ImageQuiz importava useCourseData e nunca o chamava
//   · WordBuilder usava um ACTIVE_COURSE fixo em 'en-pt'
//
// Este teste lê o CÓDIGO-FONTE, não o comportamento, porque não há jsdom no
// projeto (ver CLAUDE.md) e o defeito é justamente um import — visível no
// texto do arquivo bem antes de virar um bug observável na tela.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

// Módulos de CONTEÚDO: cada curso tem o seu, então importá-los direto de
// src/data/ fixa o idioma. `words.js` está aqui mesmo exportando `shuffleArray`
// — a exceção é tratada abaixo.
const MODULOS_DE_CONTEUDO = [
  'words', 'sentences', 'stories', 'conversations', 'imageWords', 'errorPatterns',
];

// `shuffleArray` é um helper genérico sem conteúdo nenhum dentro; importá-lo de
// data/words.js é legítimo e está documentado no CLAUDE.md.
const IMPORT_PERMITIDO = /import\s*\{\s*shuffleArray\s*\}\s*from\s*['"][^'"]*data\/words['"]/;

// `levels` tem versão por curso (getLevels) porque os bancos têm tamanhos
// muito diferentes — importá-lo direto fixa a escada do inglês.
//
// `categories` NÃO entra nesta regra: a lista é só metadado neutro de idioma
// (nome, ícone, cor) e as telas a FILTRAM pelo que o curso cobre. Isso não dá
// pra distinguir lendo o texto do arquivo, então a garantia correspondente é
// comportamental — ver "cobertura de categorias" no fim deste arquivo.
const IMPORT_PROIBIDO_LEVELS = /import\s*\{[^}]*\blevels\b[^}]*\}\s*from\s*['"][^'"]*data\/categories['"]/;

const listarArquivos = (dir) => {
  const saida = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      if (nome === 'data' || nome === 'node_modules') continue;
      saida.push(...listarArquivos(caminho));
    } else if (/\.jsx?$/.test(nome) && !/\.test\.jsx?$/.test(nome)) {
      saida.push(caminho);
    }
  }
  return saida;
};

// `utils` e `hooks` entram na varredura desde que dailyChallenge.js (em
// utils/) escapou: importava sentences/fillBlanks direto de data/sentences.js
// mesmo recebendo `words` já resolvido pelo curso certo via parâmetro — o
// vazamento não estava numa TELA, estava numa função pura por trás dela.
const arquivosDeTela = listarArquivos(join(RAIZ, 'pages'))
  .concat(listarArquivos(join(RAIZ, 'games')))
  .concat(listarArquivos(join(RAIZ, 'components')))
  .concat(listarArquivos(join(RAIZ, 'utils')))
  .concat(listarArquivos(join(RAIZ, 'hooks')));

describe('isolamento de curso nas telas', () => {
  it('nenhuma tela importa conteúdo do banco de inglês direto', () => {
    const infratores = [];

    for (const caminho of arquivosDeTela) {
      const fonte = readFileSync(caminho, 'utf8');
      for (const modulo of MODULOS_DE_CONTEUDO) {
        // Só data/<modulo>, nunca data/courses/<curso>/<modulo>.
        const padrao = new RegExp(`import\\s*\\{[^}]*\\}\\s*from\\s*['"][^'"]*\\/data\\/${modulo}['"]`, 'g');
        for (const achado of fonte.match(padrao) || []) {
          if (IMPORT_PERMITIDO.test(achado)) continue;
          infratores.push(`${relative(RAIZ, caminho)} → ${achado.replace(/\s+/g, ' ')}`);
        }
      }
    }

    expect(infratores, `\nUse useCourseData() em vez de importar o banco de inglês:\n  ${infratores.join('\n  ')}\n`)
      .toEqual([]);
  });

  it('nenhuma tela importa a escada de níveis global', () => {
    const infratores = arquivosDeTela
      .filter(caminho => IMPORT_PROIBIDO_LEVELS.test(readFileSync(caminho, 'utf8')))
      .map(caminho => relative(RAIZ, caminho));

    expect(infratores, `\nUse getLevels(courseId):\n  ${infratores.join('\n  ')}\n`).toEqual([]);
  });

  it('varre uma quantidade plausível de arquivos (a varredura não pode ficar vazia)', () => {
    // Sem isto, um erro de caminho faria os dois testes acima passarem sempre
    // sem olhar nada — o pior tipo de teste verde.
    expect(arquivosDeTela.length).toBeGreaterThan(30);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Cobertura de categorias — a contrapartida comportamental da regra acima.
// O Forca monta os botões a partir de uma lista fixa de categorias; se alguma
// delas não tiver palavra jogável no curso ativo, o botão leva a
// `shuffleArray([])[0]` — palavra `undefined` e tela quebrada.
// ───────────────────────────────────────────────────────────────────────────
import { AVAILABLE_COURSES, getWords } from './index.js';

const CATEGORIAS_DO_FORCA = [
  'animais', 'comidas', 'cores', 'familia', 'casa',
  'escola', 'corpo', 'roupas', 'bebidas', 'cumprimentos', 'numeros',
];

describe.each(AVAILABLE_COURSES.map(c => c.id))('cobertura de categorias — %s', (courseId) => {
  const words = getWords(courseId);

  it('toda categoria do Forca tem ao menos uma palavra jogável', () => {
    const vazias = CATEGORIAS_DO_FORCA.filter(
      cat => words.filter(w => w.category === cat && w.en.length >= 3 && !w.en.includes(' ')).length === 0
    );
    // O componente já filtra as vazias antes de renderizar o botão, então isto
    // não é um crash à espera — é o aviso de que o curso ficou com menos
    // categorias jogáveis do que o jogo foi desenhado para oferecer.
    expect(vazias, `categorias sem palavra jogável em ${courseId}`).toEqual([]);
  });
});
