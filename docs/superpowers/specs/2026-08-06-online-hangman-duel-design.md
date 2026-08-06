# Forca (Hangman) real no duelo online — design

Data: 2026-08-06

## Contexto

O duelo humano ("Quem Sabe Mais?", modo `human`) resolve corretamente o
tipo de jogo no matchmaking (ver `backend/realtime/state.js`), mas a
experiência de Forca online (`OnlineHangman`, hoje embutido em
`src/games/WhoKnowsMore/games/DuelOnlineGame.jsx`) é uma caixa de texto
livre — "digite a palavra inteira e envie" — bem diferente da Forca do
modo Bot (`DuelHangman.jsx`), que desenha a forca progressivamente e tem
um teclado A–Z revelando letra por letra. Um usuário testando os dois
lados de um duelo (dois PCs, mesmo jogador) reportou isso como "entrou
outro jogo", porque a tela não lembra o Forca que ele conhece.

Este documento cobre **só** o redesenho do Forca online para ficar
visualmente e mecanicamente equivalente ao modo Bot. Não muda
matchmaking, não muda os outros 7 tipos de jogo.

## Achado de segurança (corrigido por este redesenho)

`buildQuestion('hangman', ...)` em `backend/realtime/questionGenerator.js`
hoje devolve `options: fourOptions(word.en, otherWords, w => w.en)` — um
array com a palavra certa embaralhada entre 3 erradas. Esse array vai
inteiro no payload de `round:start` (via `serializeQuestionForClient`),
mesmo a UI atual não usando essa lista para nada. Qualquer jogador com o
DevTools aberto vê a resposta certa antes de digitar, quebrando a
invariante já documentada no projeto ("o servidor nunca revela
`correctAnswer` antes da rodada fechar"). O novo formato de pergunta do
Forca (`prompt.wordTemplate`, ver abaixo) não inclui mais `options` nem
qualquer forma da palavra completa.

## Decisões já fechadas com o usuário

- **Timer:** mantém os 20s compartilhados por todos os tipos de duelo
  online (`DEFAULT_TIMING.roundMs`). Sem tratamento especial para Forca.
- **Pontuação:** por velocidade, reaproveitando `scoreFor` /
  `closeRound` — o mesmo cálculo já usado pelos outros 7 tipos. Sem
  fórmula nova baseada em "poucos erros" (essa é só do Bot).
- **Erros máximos:** sem limite de erros que encerre a rodada mais cedo.
  O jogador pode tentar letras livremente até acertar a palavra toda ou
  o tempo (20s) acabar. O desenho da forca ainda evolui visualmente a
  cada erro (efeito puramente cosmético, replicando o SVG do Bot), mas
  não força perda antecipada.

## Arquitetura

### Protocolo (servidor autoritativo)

**`round:start` — novo formato da pergunta para `type: 'hangman'`:**

```js
{
  type: 'hangman',
  prompt: {
    tip: string,            // igual a hoje
    wordTemplate: string,   // NOVO — substitui `options`
  },
}
```

`wordTemplate` é gerado por uma função pura nova em `questionGenerator.js`
(`maskWord(word.en)`): cada caractere `A-Za-z` vira `'#'`; qualquer outro
caractere (espaço, `'`, `?`) é preservado literalmente. Exemplos:
- `"Hello"` → `"#####"`
- `"Good morning"` → `"#### #######"`
- `"I'm fine"` → `"#'# ####"`

Isso revela só a *forma* da palavra (comprimento e pontuação estrutural),
nunca uma letra. É o mesmo tipo de informação que o Forca clássico do
Bot já expõe de graça (lá o cliente tem a palavra inteira e mostra
`_ _ _ _ _` desde o início).

**Novo evento `hangman:guess`** (cliente → servidor):

```js
// emit
{ matchId: string, roundIndex: number, letter: string }  // letter: 1 char, A-Z

// ack sucesso
{ ok: true, inWord: boolean, positions: number[] }  // positions: índices 0-based onde a letra aparece (vazio se inWord=false)

// ack erro
{ ok: false, error: string }
```

Validação (`validateLetterGuess`, função pura nova em `round.js`, mesmo
padrão de `validateAnswer`):
1. `match` existe
2. `match.roundClosed` é `false`
3. `payload.roundIndex === match.roundIndex`
4. `!match.answers.has(socketId)` — jogador ainda não enviou a palavra final desta rodada
5. `letter` é string de 1 caractere, `A-Z` (maiúscula; cliente normaliza antes de emitir)
6. `letter` ainda não está em `playerData.get(socketId).guessedLetters`

A resolução (mutação de estado + cálculo de `positions`) roda no handler
do socket em `index.js`, no mesmo estilo do handler de `round:answer`:
lê `pd.currentQuestion.correctAnswer` (nunca sai daqui), calcula posições
com `[...correctAnswer.toUpperCase()].reduce(...)`, adiciona a letra a
`pd.guessedLetters` (um `Set`, criado em `startRound` junto com
`pd.currentQuestion`, do mesmo jeito que `usedIndices`).

Limitador de taxa dedicado: `isRateLimited(`hangman:${socket.id}`,
{ windowMs: 1_000, max: 15 })` — mais folgado que o de `round:answer`
(5/seg) porque digitar letras é uma ação bem mais leve, mas ainda cobre
contra spam de tecla.

**Fechar a rodada:** quando o cliente detecta que todas as posições
não-espaço de `wordTemplate` foram reveladas, ele monta a palavra
completa localmente e chama o `submitAnswer` que já existe (evento
`round:answer`), reaproveitando 100% de `closeRound`/`scoreFor` — já
corrigidos para comparação case-insensitive na sessão anterior. Se o
tempo acabar antes de revelar tudo, o timeout genérico que já existe em
`DuelOnlineGame.jsx` (`submitAnswer('')` quando `remaining <= 0`) fecha a
rodada como errada, sem mudança nenhuma aí.

### Estado por partida (`backend/realtime/state.js`)

`createMatch` já cria `playerData` por jogador com `currentQuestion:
null` como placeholder, sobrescrito a cada rodada por `startRound`.
`guessedLetters` segue o mesmo padrão: declarado como `null` no shape
inicial de `playerData` em `state.js` (documentando o campo), e
`startRound` (em `index.js`) o sobrescreve com um `new Set()` por
jogador a cada rodada nova — só é relevante quando `match.gameType ===
'hangman'`, mas não custa nada inicializar sempre.

### Cliente

- **Novo arquivo** `src/games/WhoKnowsMore/games/OnlineHangman.jsx`,
  extraído do componente `OnlineHangman` hoje embutido em
  `DuelOnlineGame.jsx`. Mesmo padrão de arquivo que `DuelHangman.jsx`
  (Bot) e `DuelMemory.jsx` já seguem — um arquivo por implementação de
  jogo.
  - Reaproveita o SVG da forca e a estrutura de teclado de
    `DuelHangman.jsx`, e o CSS de `HangmanGame.css` (mesmo import), para
    ficar visualmente idêntico ao modo Bot.
  - Estado local: `guessedLetters` (letras tentadas), `revealed` (mapa
    posição → letra, populado pelos acks com `inWord: true`),
    `wrongCount` (deriva de `guessedLetters` menos `revealed`).
  - Nunca guarda a palavra inteira — só o que os acks já revelaram.
  - Ao clicar uma letra: chama `duel.guessLetter(letter, ack => ...)`;
    atualiza estado local a partir do ack.
  - Quando todas as posições não-espaço estão em `revealed`: monta a
    palavra e chama `duel.submitAnswer(palavra)`.
- **`useDuelSocket.js`**: nova função `guessLetter(letter, callback)`,
  no mesmo estilo de `submitAnswer` — emite `hangman:guess` com
  `matchId`/`roundIndex` atuais e repassa o ack pro callback do
  componente (o componente decide o que fazer com `inWord`/`positions`;
  o hook não guarda esse estado, que é efêmero por rodada).
- **`DuelOnlineGame.jsx`**: o bloco `question.type === 'hangman'` passa
  a renderizar `<OnlineHangman question={question} duel={duel}
  onAnswer={handleAnswer} />` em vez do formulário de texto livre atual.
  O timer, placar, barra de resultado etc. continuam exatamente como
  estão hoje (são compartilhados por todos os tipos).

## Erros e bordas

- Letra repetida, rodada fechada/errada, ou jogador que já enviou a
  palavra final → ack `{ ok: false, error }`, mesma família de mensagens
  de `validateAnswer`.
- Letra que não é uma única `A-Z` → rejeitada antes de tocar em qualquer
  estado (mesma validação defensiva que `validateAnswer` já faz para
  `choice`).
- Desconexão a meio da rodada: já tratado pelo fluxo existente
  (`endByLeave`) — não muda com este redesenho.

## Testes

- **`questionGenerator.test.js`** (novo): `maskWord` mascara `A-Za-z`
  preservando espaço/pontuação; `buildQuestion('hangman', ...)` não
  inclui mais `options`; `serializeQuestionForClient` não vaza
  `correctAnswer` nem qualquer forma da palavra completa.
- **`round.test.js`** (novo): `validateLetterGuess` — letra válida,
  letra repetida, rodada fechada, `roundIndex` errado, jogador que já
  respondeu a palavra final, formato de letra inválido (mais de 1
  caractere, minúscula não normalizada, não-letra).
- **`duel.integration.test.js`** (novo teste, mesmo arquivo): partida
  de Forca ponta a ponta com sockets reais — dois clientes entram na
  fila com `gameTypePreference: 'hangman'`, casam, um chuta letras
  (confere `positions` corretas incluindo letra repetida no meio da
  palavra), monta a palavra e envia via `round:answer`, confere
  `round:result` e pontuação.
- **Cliente:** sem teste automatizado — o projeto não tem jsdom nem
  testes de componente (convenção já estabelecida, ver `CLAUDE.md`).
  Validação por teste manual: `npm run dev` + backend local, dois
  navegadores, testando Forca (revelar letra a letra, palavra com
  espaço/apóstrofo, timeout, vitória e derrota).

## Fora de escopo

- Qualquer mudança nos outros 7 tipos de jogo do duelo online.
- Qualquer mudança no matchmaking (`tryMatch`), já corrigido em sessão
  anterior.
- Limite de erros / perda antecipada (decisão explícita: não incluir).
- Persistir o resultado do Forca em qualquer lugar além do fluxo de
  pontuação já existente (`match.scores`).
