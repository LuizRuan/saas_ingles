// Decide qual dos dois progressos (local ou nuvem) é mais avançado, no
// momento em que a pessoa loga numa conta. Extraído do useProgress.jsx pra
// ser testável sem precisar montar o hook inteiro.
//
// Critério: número de palavras estudadas (o mesmo valor que já decide o
// nível em toda a parte do app — ver levelSystem.js), com pontuação total
// como desempate. Local vence por padrão quando a nuvem ainda não tem nada.
//
// Regressão: antes, "a nuvem tem algo salvo" sempre vencia o local sem
// comparar nada — isso apagava progresso de verdade sempre que a pessoa
// logava num aparelho com uma sincronização mais antiga/menor já salva.
export const isLocalMoreAdvanced = (local, cloud) => {
  if (!cloud) return true;

  const localWords = local?.wordsStudied || 0;
  const cloudWords = cloud.wordsStudied || 0;
  if (localWords !== cloudWords) return localWords > cloudWords;

  return (local?.totalScore || 0) > (cloud.totalScore || 0);
};
