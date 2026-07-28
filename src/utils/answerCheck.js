// Verificação das respostas digitadas no treino de conversação.
//
// Não há servidor e a CSP é `default-src 'self'`, então chamar uma API de
// gramática está fora de questão. A saída é não tentar analisar inglês
// arbitrário: em cada turno as respostas aceitáveis são CONHECIDAS, então tudo
// aqui é comparação contra elas. Isso acerta muito mais do que um corretor
// genérico caseiro acertaria, e falha de um jeito previsível.
//
// O módulo é PURO: sem DOM, sem estado, sem localStorage. Roda no ambiente node
// do Vitest como os outros utilitários.
import { errorPatterns } from '../data/errorPatterns';

// Contrações expandidas para "I'm" e "I am" contarem como a mesma resposta.
// A lista é fechada de propósito: uma regra genérica de apóstrofo transformaria
// o possessivo ("my pet's name") em "my pet is name".
const CONTRACOES = [
  [/\bi'm\b/g, 'i am'],
  [/\b(he|she|it|that|what|who|there|here)'s\b/g, '$1 is'],
  [/\b(you|we|they)'re\b/g, '$1 are'],
  [/\b(i|you|he|she|it|we|they)'ll\b/g, '$1 will'],
  [/\b(i|you|he|she|it|we|they)'ve\b/g, '$1 have'],
  [/\b(i|you|he|she|it|we|they)'d\b/g, '$1 would'],
  [/\bdon't\b/g, 'do not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bdidn't\b/g, 'did not'],
  [/\bcan't\b/g, 'can not'],
  [/\bwon't\b/g, 'will not'],
  [/\bisn't\b/g, 'is not'],
  [/\baren't\b/g, 'are not'],
  [/\bwasn't\b/g, 'was not'],
  [/\bweren't\b/g, 'were not'],
  [/\bhaven't\b/g, 'have not'],
  [/\bhasn't\b/g, 'has not'],
  [/\blet's\b/g, 'let us'],
];

export const normalizar = (bruto) => {
  let texto = String(bruto ?? '')
    .toLowerCase()
    // Apóstrofo tipográfico (’) vira o reto antes de expandir as contrações:
    // teclado de celular usa o curvo e sem isso nenhuma regra acima casaria.
    .replace(/[‘’]/g, "'")
    .trim();

  for (const [de, para] of CONTRACOES) texto = texto.replace(de, para);

  return texto
    .replace(/[.,!?;:"“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const palavras = (texto) => (texto ? texto.split(' ') : []);

// Levenshtein por duas linhas: só precisamos da distância, não do caminho.
export const distancia = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let anterior = Array.from({ length: b.length + 1 }, (_, i) => i);
  let atual = new Array(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    atual[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      atual[j] = Math.min(atual[j - 1] + 1, anterior[j] + 1, anterior[j - 1] + custo);
    }
    [anterior, atual] = [atual, anterior];
  }
  return anterior[b.length];
};

// Todas as formas aceitas de um nó, com a resposta que cada uma representa —
// é a resposta que carrega o `next`, então o casamento precisa devolvê-la.
const candidatosDe = (no) => {
  const lista = [];
  for (const reply of no?.replies || []) {
    lista.push({ reply, texto: reply.text, normalizado: normalizar(reply.text) });
    for (const variante of reply.accepts || []) {
      lista.push({ reply, texto: reply.text, normalizado: normalizar(variante) });
    }
  }
  return lista;
};

const maisProximo = (entrada, candidatos) => {
  let melhor = null;
  for (const c of candidatos) {
    const d = distancia(entrada, c.normalizado);
    if (!melhor || d < melhor.d) melhor = { ...c, d };
  }
  return melhor;
};

// Diferença palavra a palavra, usada só quando nenhum padrão pedagógico casou.
// Devolve a primeira divergência relevante — apontar um erro por vez ensina
// mais do que despejar a lista inteira.
const diferencaDePalavras = (entrada, esperado) => {
  const a = palavras(entrada);
  const b = palavras(esperado);

  const faltando = b.filter(p => !a.includes(p));
  const sobrando = a.filter(p => !b.includes(p));

  if (faltando.length === 1 && sobrando.length === 1) {
    return `Você escreveu "${sobrando[0]}" onde o certo é "${faltando[0]}".`;
  }
  if (faltando.length === 1 && !sobrando.length) {
    return `Faltou a palavra "${faltando[0]}".`;
  }
  if (sobrando.length === 1 && !faltando.length) {
    return `A palavra "${sobrando[0]}" está sobrando.`;
  }
  if (a.length && b.length && a.length !== b.length) {
    return a.length < b.length
      ? 'Sua frase ficou mais curta do que a esperada — falta alguma parte.'
      : 'Sua frase ficou mais longa do que a esperada — tem palavra sobrando.';
  }
  return null;
};

// Erro de digitação x palavra trocada.
//
// Distância de caracteres sobre a frase inteira não separa os dois casos:
// "thank you" → "thank god" custa o mesmo que "thank you" → "thnak you", mas o
// primeiro é outra frase e o segundo é só o dedo escorregando. A comparação
// precisa ser por palavra.
const ehErroDeDigitacao = (entrada, esperado) => {
  const a = palavras(entrada);
  const b = palavras(esperado);

  // Contagem diferente: só passa se for espaço a mais/menos ("thankyou")
  if (a.length !== b.length) {
    return entrada.replace(/ /g, '') === esperado.replace(/ /g, '');
  }

  const diferentes = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diferentes.push([a[i], b[i]]);
  }
  if (diferentes.length !== 1) return false;

  const [escrita, correta] = diferentes[0];
  // Palavras curtas ficam de fora: "you" e "god" distam 2 e não são o mesmo
  // erro; deixar passar transformaria troca de vocabulário em "quase".
  if (correta.length < 4) return false;
  return distancia(escrita, correta) <= 2;
};

/**
 * Verifica a frase digitada contra as respostas possíveis do nó.
 *
 * @returns {{
 *   status: 'certo' | 'quase' | 'errado',
 *   reply: object | null,   // a alternativa casada — é ela que tem o `next`
 *   correcao: string | null,
 *   explicacaoPt: string | null,
 *   sugestoes: string[],
 * }}
 */
export const verificarResposta = (entradaBruta, no) => {
  const entrada = normalizar(entradaBruta);
  const candidatos = candidatosDe(no);
  const sugestoes = (no?.replies || []).map(r => r.text);

  const vazio = {
    status: 'errado',
    reply: null,
    correcao: null,
    explicacaoPt: null,
    sugestoes,
  };

  if (!entrada) {
    return { ...vazio, explicacaoPt: 'Escreva alguma coisa antes de enviar.' };
  }
  if (!candidatos.length) return vazio;

  // 1. Casamento exato (já normalizado, então "I'm fine" == "I am fine.")
  const exato = candidatos.find(c => c.normalizado === entrada);
  if (exato) {
    return { status: 'certo', reply: exato.reply, correcao: null, explicacaoPt: null, sugestoes };
  }

  const perto = maisProximo(entrada, candidatos);

  // 2. Erro de digitação: é a mesma frase, com o dedo escorregando
  if (perto && ehErroDeDigitacao(entrada, perto.normalizado)) {
    return {
      status: 'quase',
      reply: perto.reply,
      correcao: perto.texto,
      explicacaoPt: `Quase! Parece só um erro de digitação — o certo é "${perto.texto}".`,
      sugestoes,
    };
  }

  // 3. Padrões de erro típicos de brasileiro. Vêm ANTES da diferença mecânica
  //    porque explicam a causa, e não só o sintoma.
  //    A normalização remove o "?", então a marca de pergunta é lida do bruto.
  const interrogativa = String(entradaBruta ?? '').includes('?');
  for (const padrao of errorPatterns) {
    if (padrao.exigeInterrogacao && !interrogativa) continue;
    if (padrao.teste.test(entrada)) {
      return {
        status: 'errado',
        reply: null,
        correcao: padrao.correcao,
        explicacaoPt: padrao.explicacaoPt,
        sugestoes,
      };
    }
  }

  // 4. Diferença palavra a palavra contra a alternativa mais próxima
  const diff = perto && diferencaDePalavras(entrada, perto.normalizado);
  if (diff) {
    return {
      status: 'errado',
      reply: null,
      correcao: perto.texto,
      explicacaoPt: `${diff} A resposta esperada era "${perto.texto}".`,
      sugestoes,
    };
  }

  // 5. Nada reconhecido. Não afirmar que está errado — pode ser inglês válido
  //    que simplesmente não cabe neste turno. Mostrar o que caberia.
  return {
    ...vazio,
    explicacaoPt: 'Não reconheci essa resposta para esta pergunta. Dê uma olhada nas sugestões e tente de novo.',
  };
};

export default verificarResposta;
