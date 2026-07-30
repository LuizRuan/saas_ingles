/**
 * Distingue "o JS desta tela não chegou" de "o código tem um bug".
 *
 * As rotas são carregadas sob demanda (`lazy` em App.jsx), o que cria um modo de
 * falha que não existia antes: a pessoa deixa a aba aberta, sai um deploy novo, e
 * o arquivo de JS que a aba dela conhece some do servidor. O `import()` rejeita e
 * o erro sobe até o ErrorBoundary. Nesse caso — e só nele — recarregar resolve.
 *
 * Errar a classificação custa dos dois lados: um falso negativo deixa a pessoa
 * numa tela de erro que um recarregamento consertaria; um falso positivo
 * recarrega a página em cima de um bug de código, escondendo-o do console e
 * arriscando um laço. Por isso mora aqui, puro e testável, e não dentro do
 * componente — mesma razão de `duelClock.js` e `presenceLabel.js` existirem.
 *
 * A mensagem muda conforme o navegador; as variações reais estão em
 * chunkError.test.js.
 */
export const ehFalhaDeCarregamento = (erro) => {
  const texto = `${erro?.name || ''} ${erro?.message || ''}`;
  return /ChunkLoadError|Loading chunk|dynamically imported module|Importing a module script failed/i.test(texto);
};
