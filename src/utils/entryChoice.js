/**
 * Lembra como a pessoa entrou no EnglishPlay, para a tela de boas-vindas
 * aparecer só na primeira visita.
 *
 * Isto NÃO é autenticação e não deve ser confundido com ela. É só a memória de
 * uma escolha de navegação, guardada no mesmo `localStorage` que o resto e,
 * como todo o resto, tratada como entrada não confiável: qualquer pessoa pode
 * abrir o console e escrever `'account'` aqui. Quem manda em sessão de verdade é
 * o cookie httpOnly assinado pelo backend (ver backend/README.md) — quando o
 * progresso migrar para o servidor, é ele que precisa autorizar cada leitura,
 * nunca esta chave.
 *
 * Motivo de existir: com o portão de entrada, `/` passa a levar para a tela de
 * boas-vindas. Sem esta memória, quem já escolheu "jogar sem conta" bateria na
 * mesma parede toda vez que voltasse ao site.
 */

const CHAVE = 'englishplay_entry';

/** Valores aceitos. Qualquer outra coisa é tratada como "ainda não escolheu". */
const VALIDOS = new Set(['guest', 'account']);

export const getEntryChoice = () => {
  try {
    const valor = localStorage.getItem(CHAVE);
    return VALIDOS.has(valor) ? valor : null;
  } catch {
    // localStorage bloqueado (modo privado, cookies desligados). Devolver null
    // faz a tela de boas-vindas aparecer sempre — chato, mas navegável. O
    // contrário (assumir que entrou) esconderia a tela para sempre.
    return null;
  }
};

export const hasEntered = () => getEntryChoice() !== null;

export const setEntryChoice = (escolha) => {
  if (!VALIDOS.has(escolha)) return;
  try {
    localStorage.setItem(CHAVE, escolha);
  } catch { /* sem persistência: a pessoa reescolhe na próxima visita */ }
};

/** Usado pelo "Sair" das Configurações, para voltar à tela de boas-vindas. */
export const clearEntryChoice = () => {
  try {
    localStorage.removeItem(CHAVE);
  } catch { /* nada a fazer */ }
};

/**
 * As telas de entrada. Uma lista só, usada por dois lugares que precisam
 * concordar — se divergirem, o site quebra de um jeito ou de outro:
 *
 * - EntryGate não as intercepta. `/welcome` precisa estar aqui ou redirecionaria
 *   para si mesma num laço infinito; `/login` e `/register` precisam ou
 *   ficariam inalcançáveis justamente para quem ainda não entrou.
 * - Layout não desenha navbar nenhuma nelas. Mostrar "583 ⭐", a loja e o avatar
 *   para quem ainda não entrou é o que fazia a tela de login parecer um pedaço
 *   do app em vez de uma tela própria.
 */
export const ROTAS_LIVRES = new Set(['/welcome', '/login', '/register']);

/**
 * A decisão do EntryGate, isolada da árvore do React para poder ser testada.
 * O modo de falha que isto existe para prender é o laço de redirecionamento:
 * uma rota livre esquecida trava o site num ciclo em vez de dar erro.
 */
export const deveMandarParaWelcome = (pathname, entrou) =>
  !entrou && !ROTAS_LIVRES.has(pathname);
