// Tokeniza texto em inglês das Histórias para renderizar cada palavra como um
// botão clicável, e normaliza cada palavra para a chave usada em
// storyVocabulary.js.

// Contrações a MANTER inteiras: mudam o sentido, não são um possessivo.
// Nomes próprios/substantivos com 's ("Ana's", "dog's") NÃO entram aqui de
// propósito — caem no ramo "possessivo" de normalizeWord e resolvem para a
// palavra base, reaproveitando a entrada que já existe em storyVocabulary.
export const CONTRACTION_KEEP = new Set([
  "i'm", "it's", "that's", "what's", "he's", "she's", "here's", "there's",
  "let's", "who's", "don't", "doesn't", "didn't", "isn't", "aren't",
  "wasn't", "weren't", "can't", "won't", "wouldn't", "couldn't", "shouldn't",
  "i've", "you've", "we've", "they've", "i'll", "you'll", "we'll", "they'll",
  "i'd", "you'd", "we'd", "they'd",
]);

const WORD_RE = /[A-Za-z]+(?:['’-][A-Za-z]+)*/g;

/**
 * Quebra um texto em tokens alternados { type: 'word' | 'gap', text }.
 * Concatenar todos os `text` na ordem reproduz o texto original byte a byte
 * — é o que garante que pontuação e espaços nunca somem na renderização.
 */
export const tokenizeText = (text) => {
  const raw = String(text ?? '');
  if (!raw) return [];

  const words = raw.match(WORD_RE) || [];
  const gaps = raw.split(WORD_RE);

  const tokens = [];
  gaps.forEach((gap, i) => {
    if (gap) tokens.push({ type: 'gap', text: gap });
    if (words[i]) tokens.push({ type: 'word', text: words[i] });
  });
  return tokens;
};

/**
 * Minúscula, apóstrofo tipográfico normalizado para o reto, pontuação de
 * borda removida, possessivo 's/s' retirado — exceto para as contrações da
 * lista acima, que mudariam de sentido se perdessem o 's.
 */
export const normalizeWord = (raw) => {
  let w = String(raw ?? '').trim().toLowerCase().replace(/['']/g, "'");
  w = w.replace(/^[^a-z']+|[^a-z']+$/g, '');
  if (!w) return '';
  if (CONTRACTION_KEEP.has(w)) return w;
  w = w.replace(/'s$/, '').replace(/s'$/, 's');
  return w;
};
