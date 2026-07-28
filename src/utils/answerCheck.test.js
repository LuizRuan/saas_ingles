import { describe, it, expect } from 'vitest';
import { verificarResposta, normalizar, distancia } from './answerCheck';
import { errorPatterns } from '../data/errorPatterns';

// Nó de exemplo no formato de src/data/conversations.js
const no = {
  text: 'Hello! How are you?',
  translation: 'Olá! Como você está?',
  replies: [
    {
      text: "I'm fine, thank you!",
      translation: 'Estou bem, obrigado(a)!',
      next: 'nome',
      accepts: ["I'm good", 'Very well, thanks'],
    },
    {
      text: "I'm tired today.",
      translation: 'Estou cansado(a) hoje.',
      next: 'cansado',
      accepts: ['I am so tired'],
    },
  ],
};

describe('normalizar', () => {
  it('expande contrações para "I\'m" e "I am" serem a mesma resposta', () => {
    expect(normalizar("I'm fine")).toBe('i am fine');
    expect(normalizar('I am fine')).toBe('i am fine');
    expect(normalizar("don't")).toBe('do not');
    expect(normalizar("She's here")).toBe('she is here');
  });

  it('aceita o apóstrofo curvo do teclado de celular', () => {
    expect(normalizar('I’m fine')).toBe('i am fine');
  });

  it('não estraga possessivo', () => {
    // Uma regra genérica de apóstrofo viraria "my pet is name"
    expect(normalizar("my pet's name")).toBe("my pet's name");
  });

  it('ignora pontuação, caixa e espaços repetidos', () => {
    expect(normalizar('  HELLO,   world!  ')).toBe('hello world');
  });
});

describe('distancia', () => {
  it('mede a diferença entre duas strings', () => {
    expect(distancia('hello', 'hello')).toBe(0);
    expect(distancia('helo', 'hello')).toBe(1);
    expect(distancia('', 'abc')).toBe(3);
  });
});

describe('verificarResposta — acertos', () => {
  it('aceita a alternativa exata e devolve a resposta que carrega o next', () => {
    const r = verificarResposta("I'm fine, thank you!", no);
    expect(r.status).toBe('certo');
    expect(r.reply.next).toBe('nome');
  });

  it('aceita variações de pontuação e caixa', () => {
    expect(verificarResposta('i am fine thank you', no).status).toBe('certo');
  });

  it('aceita as variantes listadas em accepts, seguindo o mesmo caminho', () => {
    const r = verificarResposta('Very well, thanks', no);
    expect(r.status).toBe('certo');
    expect(r.reply.next).toBe('nome');
  });

  it('a variante de accepts leva ao ramo da SUA alternativa, não à primeira', () => {
    const r = verificarResposta('I am so tired', no);
    expect(r.status).toBe('certo');
    expect(r.reply.next).toBe('cansado');
  });
});

describe('verificarResposta — quase certo', () => {
  it('trata erro de digitação como "quase" e mostra a forma certa', () => {
    const r = verificarResposta("I'm fine, thnak you!", no);
    expect(r.status).toBe('quase');
    expect(r.correcao).toBe("I'm fine, thank you!");
    expect(r.reply.next).toBe('nome');
  });

  it('não deixa uma palavra inteira trocada passar como erro de digitação', () => {
    expect(verificarResposta("I'm fine, thank god!", no).status).not.toBe('quase');
  });
});

describe('verificarResposta — erros explicados em português', () => {
  it('explica idade com "have"', () => {
    const r = verificarResposta('I have 20 years', no);
    expect(r.status).toBe('errado');
    expect(r.correcao).toBe("I'm 20 years old.");
    expect(r.explicacaoPt).toMatch(/to be/);
  });

  it('explica estado com "have"', () => {
    expect(verificarResposta('I have hungry', no).explicacaoPt).toMatch(/to be/);
  });

  it('explica profissão sem artigo', () => {
    expect(verificarResposta('I am student', no).correcao).toBe("I'm a student.");
  });

  it('explica negação sem auxiliar', () => {
    expect(verificarResposta('I no like coffee', no).explicacaoPt).toMatch(/do not/);
  });

  it('explica terceira pessoa sem -s', () => {
    expect(verificarResposta('He go to school', no).explicacaoPt).toMatch(/-s/);
  });

  it('só corrige pergunta sem auxiliar quando há mesmo um "?"', () => {
    // Sem interrogação é afirmação legítima e não pode virar correção de pergunta
    const afirmacao = verificarResposta('You have a nice dog', no);
    expect(afirmacao.explicacaoPt).not.toMatch(/Do you like/);

    const pergunta = verificarResposta('You like coffee?', no);
    expect(pergunta.correcao).toBe('Do you like it?');
  });

  it('aponta a palavra que falta quando não há padrão conhecido', () => {
    const r = verificarResposta('I am fine thank', no);
    expect(r.status).toBe('errado');
    expect(r.explicacaoPt).toMatch(/you/);
  });

  it('toda explicação vem em português com a forma certa em inglês', () => {
    for (const padrao of errorPatterns) {
      expect(padrao.explicacaoPt.length).toBeGreaterThan(20);
      expect(padrao.correcao).toBeTruthy();
    }
  });
});

describe('verificarResposta — nunca aceita o que não entendeu', () => {
  // regressão: a versão antiga fazia `handleResponse(match || currentOptions[0])`,
  // então qualquer texto irreconhecível era pontuado como a primeira alternativa.
  it('lixo digitado não vira acerto nem herda o next da primeira opção', () => {
    const r = verificarResposta('asdf qwerty zxcv', no);
    expect(r.status).toBe('errado');
    expect(r.reply).toBeNull();
    expect(r.sugestoes).toContain("I'm fine, thank you!");
  });

  it('uma letra solta não casa por substring', () => {
    // O bug antigo usava includes(): "i" casava com "I'm fine, thank you!"
    const r = verificarResposta('i', no);
    expect(r.status).toBe('errado');
    expect(r.reply).toBeNull();
  });

  it('entrada vazia pede que se escreva algo', () => {
    const r = verificarResposta('   ', no);
    expect(r.status).toBe('errado');
    expect(r.reply).toBeNull();
    expect(r.explicacaoPt).toMatch(/Escreva/);
  });

  it('nó terminal (sem replies) não quebra', () => {
    const r = verificarResposta('anything', { text: 'Bye!', replies: [] });
    expect(r.status).toBe('errado');
    expect(r.reply).toBeNull();
  });
});
