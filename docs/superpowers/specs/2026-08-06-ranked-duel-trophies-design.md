# Ranking real do duelo online (troféus) — design

Data: 2026-08-06

## Contexto

A seção "Ranked / Top 5 do Mês" em [WhoKnowsMore.jsx](../../../src/games/WhoKnowsMore/WhoKnowsMore.jsx)
mostra hoje `MOCK_RANKED_LEADERBOARD` — cinco jogadores fictícios com uma
pontuação inventada ("2.450 pontos"). O botão "Ver Ranking Completo" não
tem `onClick`. Nada disso reflete partidas reais.

Este documento cobre transformar essa seção num ranking real, alimentado
só por vitórias genuínas do modo `human` (nunca do modo `bot`, nunca por
WO/abandono), substituindo "pontos" por **troféus** (1 por vitória limpa).

## Decisões já fechadas com o usuário

- **Quem pode jogar a fila:** continua aberto a convidados (sem conta),
  exatamente como hoje — o duelo não vira uma feature exclusiva de conta.
  Só quem está **logado E com apelido escolhido** acumula troféu ao
  vencer. (Apelido é obrigatório assim que loga — ver `NicknamePrompt`,
  então "logado" já implica "com apelido" na prática.)
- **Janela do ranking:** mensal, zera todo mês.
- **"Ver Ranking Completo":** abre um modal (não uma rota nova).
- **Regra do troféu:** vitória numa partida que chegou ao fim natural
  (`reason: 'completed'`, nunca `opponent_left`) = **+1 troféu** pro
  vencedor. Empate = 0 para os dois. Perda = 0.
- **Anti-abuso mínimo:** só conta se **os dois jogadores** estavam
  logados, **em contas diferentes**. Duas abas da mesma conta jogando
  entre si não gera troféu pra ninguém.

## Fora de escopo (simplificações propostas e já aprovadas)

- **Badge de nível** ("Nível 28") sai da linha do ranking — exigiria
  duplicar o cálculo de nível no backend só por estética; sem isso o
  ranking já fica correto e legível.
- **Contador de "vitórias"** separado sai da linha — nesse desenho,
  troféus **são** vitórias reais, então seria o mesmo número duas vezes.
- **Gap aceito, não resolvido aqui:** alguém logado em duas contas de
  verdade, em duas abas, ainda pode farmar troféu contra a própria conta
  alternativa. Mesma categoria dos gaps já documentados no projeto
  (ex. rate limit por IP forjável) — não bloqueado por não travar duas
  abas do mesmo navegador, que também serve pra testar o duelo sozinho.

## Arquitetura

### 1. Identidade: ticket de duelo assinado

O socket do duelo conecta direto no Render, sem cookie
(`credentials: false` — ver CLAUDE.md). Para provar quem é o jogador sem
mudar essa topologia, o cliente troca a sessão (cookie, same-origin via
`/api/*`) por um **ticket de curta duração** só na hora de entrar na fila.

**Novo endpoint** `POST /api/auth/duel-ticket` (`requireAuth` +
`requireDb`, mesmo padrão de `/api/auth/profile`):

```js
// backend/controllers/auth.controller.js
export const issueDuelTicket = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Conta não encontrada.' });

  const ticket = jwt.sign(
    { sub: user._id.toString(), nickname: user.nickname, avatar: user.progress?.selectedAvatar || 'U', typ: 'duel' },
    env.jwtSecret,
    { expiresIn: '2m' },
  );
  res.status(200).json({ ticket });
};
```

- Reaproveita `env.jwtSecret` — mesmo processo Node que roda o Socket.IO
  (`backend/server.js` já anexa os dois ao mesmo `http.Server`), então não
  há segredo novo pra gerenciar.
- 2 minutos é folga confortável (fila tem timeout de 45s no cliente) sem
  deixar um ticket "reutilizável" por muito tempo.
- `avatar` vem de `user.progress?.selectedAvatar` — o progresso já é
  espelhado no Mongo por conta logada (`PATCH /api/auth/progress`, já
  existente e em uso via `updateProgressRequest` em `useProgress.jsx`).
  Evita uma segunda leitura no banco na hora de premiar o troféu.

**Cliente** ([WhoKnowsMore.jsx](../../../src/games/WhoKnowsMore/WhoKnowsMore.jsx)):
`handleStartSearch` busca um ticket nome se `estaLogado` for verdadeiro
(novo `useAuthProfile()` já usado em `Layout.jsx`, mesmo padrão) antes de
chamar `duel.joinQueue(name, pref, ticket)`. Convidado não busca ticket
nenhum — `joinQueue` sem o 3º argumento funciona exatamente como hoje.

**Socket** ([backend/realtime/index.js](../../../backend/realtime/index.js)):
`queue:join` passa a aceitar `payload.authTicket` opcional. Verifica com
`jwt.verify` num `try/catch` (ticket ausente, expirado ou inválido =
degrada pra convidado, nunca derruba a conexão). Se válido, o
`nickname`/`avatar` do ticket **substituem** os do payload (nunca confiar
no nickname solto pra decidir identidade) e `{ userId, nickname, avatar }`
fica gravado na entrada da fila e depois em `match.playerData` de cada
jogador.

### 2. Concessão do troféu

Função pura nova, mesmo espírito de `round.js` (extraída pra ser
testável sem socket nem Mongo):

```js
// backend/realtime/trophy.js
export const decideTrophyAward = (match, winnerSocketId) => {
  if (!winnerSocketId) return null; // empate: decideWinner já devolve null
  const winner = match.players.find(p => p.socketId === winnerSocketId);
  const loser = match.players.find(p => p.socketId !== winnerSocketId);
  const wd = match.playerData.get(winner.socketId);
  const ld = match.playerData.get(loser.socketId);
  if (!wd?.userId || !ld?.userId) return null;      // um dos dois é convidado
  if (wd.userId === ld.userId) return null;          // mesma conta nas duas pontas
  return { userId: wd.userId, nickname: wd.nickname, avatar: wd.avatar };
};
```

Em `endRound`, só no ramo em que `nextPhase(...) === 'end'` (partida
chegou ao fim natural — nunca em `endByLeave`, que trata abandono):

```js
const award = decideTrophyAward(match, decideWinner(match));
if (award) awardTrophy(award).catch(() => {}); // fire-and-forget, depois do match:end já emitido
```

`awardTrophy` faz o upsert mensal (ver modelo abaixo) e nunca lança — se
o Mongo estiver fora do ar, a partida e o `match:end` já foram entregues
antes; o troféu simplesmente não é gravado, igual ao resto do módulo
`realtime/` (que já roda sem MongoDB por design).

### 3. Modelo de dados

```js
// backend/models/DuelTrophy.js
const duelTrophySchema = new Schema({
  userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month:    { type: String, required: true }, // 'YYYY-MM', calendário UTC
  nickname: { type: String, required: true },
  avatar:   { type: String, default: 'U' },
  trophies: { type: Number, default: 0 },
}, { timestamps: true });

duelTrophySchema.index({ userId: 1, month: 1 }, { unique: true });
duelTrophySchema.index({ month: 1, trophies: -1 });
```

Nickname/avatar são **denormalizados** no upsert (sempre atualizados pro
valor mais recente do ticket) — a leitura pública do ranking não faz
`populate`/join com `User`, só `find({ month }).sort({ trophies: -1,
updatedAt: 1 }).limit(n)`. Desempate: quem bateu aquele total primeiro
fica na frente.

### 4. Leitura do ranking

Novo `backend/routes/duel.routes.js`, montado em `/api/duel`:

- `GET /api/duel/leaderboard?limit=5` — público (sem `requireAuth`),
  `limit` clampado entre 1 e 50. Resposta: `{ month, entries: [{ nickname, avatar, trophies }] }`.
- `GET /api/duel/leaderboard/me` — `requireAuth` + `requireDb` (like
  `/api/auth/profile`, since it has to query `DuelTrophy`). Resposta:
  `{ month, trophies, rank }` do usuário logado no mês corrente;
  `rank: null` se ainda não tem troféu nenhum.

### 5. Frontend

`src/utils/authClient.js` ganha três funções: `getDuelTicketRequest()`,
`getDuelLeaderboardRequest(limit)`, `getMyDuelRankRequest()` — mesmo
padrão de `callAuth` já usado pelas outras.

`WhoKnowsMore.jsx`:
- Remove `MOCK_RANKED_LEADERBOARD`.
- `useEffect` no mount busca `getDuelLeaderboardRequest(5)`; estado de
  loading (skeleton simples, reaproveitando `.spinner`) e estado vazio
  ("Ninguém no ranking ainda este mês — vença um duelo pra ser o
  primeiro!").
- Cada linha perde o badge de nível e a contagem de "vitórias" (ver
  seção "Fora de escopo"); mostra posição, avatar, apelido e `🏆 N`.
- "Ver Ranking Completo" ganha `onClick` que abre um modal
  (`.modal-overlay` + `.glass-card`, mesmo padrão visual já usado em
  outros modais do app) buscando `getDuelLeaderboardRequest(50)`; se
  `estaLogado`, busca também `getMyDuelRankRequest()` e mostra "Sua
  posição: #N • 🏆 X" no rodapé do modal quando `rank` não é `null`.

## Testes

- `backend/realtime/trophy.test.js` — `decideTrophyAward` puro: vitória
  com dois `userId` distintos premia; empate (`winnerSocketId` null) não
  premia; convidado de um dos lados não premia; mesma conta nos dois
  lados não premia.
- `backend/routes` ou `app.test.js` — `POST /api/auth/duel-ticket` exige
  sessão; `GET /api/duel/leaderboard` funciona sem sessão e respeita o
  clamp de `limit`; `GET /api/duel/leaderboard/me` exige sessão.
- Manual: uma partida completa entre duas contas reais distintas
  incrementa o troféu do vencedor e aparece no card/modal; abandono no
  meio não gera troféu; duas abas da mesma conta não geram troféu.
