const stripEdgePunctuation = (value) => String(value || '')
  .replace(/^[.,?!:;'"“”¡¿]+|[.,?!:;'"“”]+$/g, '')
  .trim();

/**
 * Converte qualquer bloco editorial em peças de exatamente uma palavra.
 * O catálogo pode agrupar traduções como "a black cat", mas o jogo nunca
 * deve transformar esse grupo em um único botão.
 */
export const splitSentenceIntoWords = (sentence) => {
  let index = 0;
  return (sentence?.words || []).flatMap((part) =>
    String(part.en || '')
      .trim()
      .split(/\s+/)
      .map(stripEdgePunctuation)
      .filter(Boolean)
      .map((word) => ({
        ...part,
        en: word,
        id: `${sentence.id || 'sentence'}-word-${index++}`,
      }))
  );
};

export { stripEdgePunctuation };
