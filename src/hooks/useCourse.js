/**
 * useCourse — encapsula o par de idiomas ativo do usuário.
 *
 * HOJE (inglês para brasileiros):
 *   target = a língua que se aprende → 'en'  (English)
 *   source = a língua que se já sabe → 'pt'  (Português do Brasil)
 *
 * AMANHÃ (ex: italiano para brasileiros):
 *   target = 'it'
 *   source = 'pt'
 *
 * Os componentes e jogos usam este hook em vez de ler `word.en` / `word.pt`
 * diretamente, tornando a troca de idioma uma mudança de uma linha aqui,
 * sem precisar editar nenhum jogo.
 *
 * Forma de uso nos jogos:
 *   const { targetText, sourceText, targetLabel, sourceLabel } = useCourse(word);
 *
 * Forma de uso para obter os rótulos sem uma palavra:
 *   const { targetLabel, sourceLabel, coursePair } = useCourse();
 */

// O par de curso ativo. Alterar aqui é o único passo necessário para trocar
// o idioma ensinado quando dados de um novo idioma estiverem disponíveis.
export const ACTIVE_COURSE = {
  id: 'en-pt',          // identificador do curso (usado como chave no storage)
  targetLang: 'en',     // idioma a aprender (chave em word.*)
  sourceLang: 'pt',     // idioma nativo do aluno (chave em word.*)
  targetLabel: 'Inglês',
  sourceLabel: 'Português',
  targetFlag: '🇺🇸',
  sourceFlag: '🇧🇷',
  // Chaves extras do objeto de palavra para este par
  tipKey: 'tip',        // dica no idioma alvo
  exampleTargetKey: 'example',   // exemplo no idioma alvo
  exampleSourceKey: 'examplePt', // exemplo no idioma fonte
};

/**
 * Dado um objeto `word` (com campos como `en`, `pt`, `tip`, `example`, etc.),
 * retorna os valores normalizados para o curso ativo.
 *
 * @param {object} [word]  Objeto de palavra (opcional — quando omitido,
 *                         retorna apenas os metadados do curso).
 * @returns {{
 *   targetText: string,      // palavra no idioma a aprender
 *   sourceText: string,      // palavra no idioma do aluno
 *   tip: string,             // dica no idioma alvo
 *   exampleTarget: string,   // exemplo no idioma alvo
 *   exampleSource: string,   // exemplo no idioma fonte
 *   targetLabel: string,
 *   sourceLabel: string,
 *   targetFlag: string,
 *   sourceFlag: string,
 *   coursePair: string,      // ex: 'en-pt'
 * }}
 */
const useCourse = (word) => {
  const c = ACTIVE_COURSE;

  if (!word) {
    return {
      targetText: '',
      sourceText: '',
      tip: '',
      exampleTarget: '',
      exampleSource: '',
      targetLabel: c.targetLabel,
      sourceLabel: c.sourceLabel,
      targetFlag: c.targetFlag,
      sourceFlag: c.sourceFlag,
      coursePair: c.id,
    };
  }

  return {
    targetText:    word[c.targetLang]        ?? '',
    sourceText:    word[c.sourceLang]        ?? '',
    tip:           word[c.tipKey]            ?? '',
    exampleTarget: word[c.exampleTargetKey]  ?? '',
    exampleSource: word[c.exampleSourceKey]  ?? '',
    targetLabel:   c.targetLabel,
    sourceLabel:   c.sourceLabel,
    targetFlag:    c.targetFlag,
    sourceFlag:    c.sourceFlag,
    coursePair:    c.id,
  };
};

export default useCourse;
