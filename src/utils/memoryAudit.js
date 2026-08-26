export const normalizeMemoryText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

export const getMemoryWordKey = (word) => normalizeMemoryText(word?.en);

export const auditMemoryCatalog = (words = []) => {
  const invalid = [];
  const seenKeys = new Set();
  const duplicateKeys = [];

  words.forEach((word, index) => {
    const key = getMemoryWordKey(word);
    const level = Number(word?.level);
    if (!key || !normalizeMemoryText(word?.pt) || !Number.isFinite(level) || level < 1) {
      invalid.push(index);
    }
    if (seenKeys.has(key)) duplicateKeys.push(key);
    seenKeys.add(key);
  });

  return { total: words.length, invalid, duplicateKeys };
};

export const auditMemoryBoard = (words = [], expectedPairs = words.length) => {
  const keys = words.map(getMemoryWordKey);
  const targetTexts = words.map(word => normalizeMemoryText(word?.en));
  const sourceTexts = words.map(word => normalizeMemoryText(word?.pt));
  const duplicatesOf = values => [...new Set(values.filter((value, index) =>
    value && values.indexOf(value) !== index))];

  return {
    complete: words.length === expectedPairs,
    duplicateWords: duplicatesOf(keys),
    ambiguousTargetTexts: duplicatesOf(targetTexts),
    ambiguousSourceTexts: duplicatesOf(sourceTexts),
  };
};

export const isValidMemoryBoard = (words, expectedPairs = words.length) => {
  const report = auditMemoryBoard(words, expectedPairs);
  return report.complete
    && report.duplicateWords.length === 0
    && report.ambiguousTargetTexts.length === 0
    && report.ambiguousSourceTexts.length === 0;
};

