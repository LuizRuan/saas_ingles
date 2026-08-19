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

/**
 * Palavras estudadas somando TODOS os cursos, não só o ativo.
 *
 * Regressão (multi-idioma): `wordsStudied` passou a ser por curso. Comparar só
 * o campo plano compara idiomas diferentes quando os dois lados estão em
 * cursos distintos — alguém com inglês nível 40 na nuvem que trocasse pro
 * espanhol no celular (nível 1) apareceria como "mais atrasado" e teria o
 * inglês inteiro sobrescrito por um progresso vazio.
 */
export const totalWordsStudied = (p) => {
  if (!p) return 0;
  const ativo = p.wordsStudied || 0;
  const guardados = Object.values(p.courseProgress || {})
    .reduce((soma, curso) => soma + (curso?.wordsStudied || 0), 0);
  return ativo + guardados;
};

export const isLocalMoreAdvanced = (local, cloud) => {
  if (!cloud) return true;

  const localWords = totalWordsStudied(local);
  const cloudWords = totalWordsStudied(cloud);
  if (localWords !== cloudWords) return localWords > cloudWords;

  return (local?.totalScore || 0) > (cloud.totalScore || 0);
};
