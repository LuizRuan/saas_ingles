import { normalizeSentenceText } from './sentenceCatalog';

export const auditSentenceCatalog = (sentences = []) => {
  const normalized = sentences.map(item => normalizeSentenceText(item.en));
  const duplicateTexts = normalized.filter((text, index) => normalized.indexOf(text) !== index);
  const duplicateIds = sentences.map(item => item.id).filter((id, index, ids) => ids.indexOf(id) !== index);
  const invalid = sentences.filter(item =>
    !item.id
    || !item.en?.trim()
    || !item.pt?.trim()
    || !Array.isArray(item.words)
    || item.words.length < 2
    || !Number.isInteger(item.difficulty)
    || item.difficulty < 1
    || item.difficulty > 100);
  const beginner = sentences.filter(item => item.difficulty <= 20);
  const advanced = sentences.filter(item => item.difficulty >= 85);
  const categories = new Set(sentences.map(item => item.category).filter(Boolean));
  const bands = [
    sentences.filter(item => item.difficulty <= 20).length,
    sentences.filter(item => item.difficulty >= 21 && item.difficulty <= 40).length,
    sentences.filter(item => item.difficulty >= 41 && item.difficulty <= 60).length,
    sentences.filter(item => item.difficulty >= 61 && item.difficulty <= 80).length,
    sentences.filter(item => item.difficulty >= 81).length,
  ];
  const issues = [];
  if (sentences.length < 1000) issues.push('Catálogo abaixo de 1.000 frases.');
  if (beginner.length < 300) issues.push('Menos de 300 frases iniciais.');
  if (advanced.length < 80) issues.push('Menos de 80 frases avançadas.');
  if (duplicateTexts.length) issues.push(`${duplicateTexts.length} textos duplicados.`);
  if (duplicateIds.length) issues.push(`${duplicateIds.length} IDs duplicados.`);
  if (invalid.length) issues.push(`${invalid.length} registros inválidos.`);
  if (categories.size < 10) issues.push('Diversidade temática insuficiente.');
  if (bands.some(total => total === 0)) issues.push('Uma ou mais faixas de dificuldade estão vazias.');

  return {
    ok: issues.length === 0,
    issues,
    metrics: {
      total: sentences.length,
      beginner: beginner.length,
      advanced: advanced.length,
      generated: sentences.filter(item => item.generated).length,
      categories: categories.size,
      bands,
      duplicateTexts: duplicateTexts.length,
      duplicateIds: duplicateIds.length,
      invalid: invalid.length,
    },
  };
};
