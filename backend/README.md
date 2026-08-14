# Wordly — backend (esqueleto)

API de autenticação (registro/login) do Wordly. **Ainda não está deployada e não tem MongoDB conectado neste momento** — este é um esqueleto pronto para quando isso acontecer.

Pacote **independente** do frontend: `node_modules` e `package.json` próprios, sem workspace na raiz. É um esqueleto sem código compartilhado e sem deploy conjunto; `workspaces` adicionaria complexidade sem benefício agora.

## Rodando localmente

```bash
npm install
npm run dev          # node --watch server.js, porta 5000
```

Sobe **mesmo sem um arquivo `.env`**: sem `MONGODB_URI`, o servidor loga um aviso e segue no ar — toda rota que depende de conta responde `503` em vez de travar ou cair. Sem `JWT_SECRET`, cai num valor de desenvolvimento claramente marcado como inseguro (nunca use isso em produção).

Copie `.env.example` para `.env` para configurar de verdade:

| Variável | Para quê | Obrigatória? |
|---|---|---|
| `PORT` | Porta do servidor | Não (padrão 5000) |
| `MONGODB_URI` | Connection string do MongoDB Atlas (ou `mongod` local) | Só para register/login funcionarem |
| `JWT_SECRET` | Assinatura do cookie de sessão | Sim em produção |
| `FRONTEND_ORIGIN` | Única origem aceita pelo CORS | Não (padrão `http://localhost:5173`) |
| `NODE_ENV` | `development` ou `production` | — |

## Rotas

| Rota | Precisa de banco? | O quê |
|---|---|---|
| `POST /api/auth/register` | Sim | Cria a conta, já loga (seta o cookie de sessão) |
| `POST /api/auth/login` | Sim | Autentica, seta o cookie de sessão |
| `POST /api/auth/logout` | Não | Limpa o cookie |
| `GET /api/auth/me` | Não | Responde a partir do próprio JWT do cookie |
| `GET /api/auth/profile` | Sim | `{ email, nickname }` — diferente de `/me`, precisa do banco porque o apelido não vai no JWT |
| `PATCH /api/auth/profile` | Sim | Troca o apelido (`{ nickname }`, `null`/`''` apaga) |
| `GET /api/health` | Não | Smoke check |

## Realtime (duelo humano de "Quem Sabe Mais?")

`backend/realtime/` é um servidor Socket.IO anexado ao mesmo `http.Server` do Express (ver `server.js`). **Não precisa de MongoDB** — partidas duram ~2 minutos e o estado (fila, partidas ativas) vive em memória no processo Node.

- **`backend/data/words.json`** é uma cópia gerada de `src/data/words.js` (só os campos que o gerador de perguntas usa: `en/pt/pronunciation/example/examplePt/tip`). É duplicação **deliberada**, do mesmo jeito que `backend/utils/validators.js` já duplica ~2 regras do frontend: `backend/` é pacote independente e não importa código do frontend em runtime (isso quebraria silenciosamente no dia em que só `backend/` for deployado no Render, sem o `src/` do frontend por perto).
- **Rodar sempre que `src/data/words.js` mudar:**
  ```bash
  node backend/scripts/sync-words.mjs
  ```
  Script manual, nunca executado pelo servidor.
- **O cliente nunca recebe `words.json`** — o servidor monta a pergunta inteira (texto do prompt, opções já embaralhadas) e manda pronta; o navegador só renderiza. Isso também significa que o cliente nunca recebe `correctAnswer` antes de responder.
- **Autoridade do servidor** (a parte de segurança que importa aqui): quem escolhe a palavra/tipo de jogo, quem cronometra (por instante de chegada da resposta, nunca por um tempo que o cliente relate) e quem sabe a resposta certa é sempre o servidor — nunca o cliente. Ver `backend/realtime/scoring.js` e seu teste para a prova disso.
- **Sem variável de ambiente nova obrigatória** — reaproveita `FRONTEND_ORIGIN` (CORS do Socket.IO, com `credentials: false`: a identidade do duelo é um apelido descartável, não o cookie de sessão). `FRONTEND_ORIGIN` aceita **lista separada por vírgula**, para os previews da Vercel não quebrarem no CORS.
- **`realtime/round.js` é puro de propósito.** O ciclo da rodada (fechar, pontuar, decidir vencedor, validar resposta) foi extraído para fora do closure do handler de socket justamente para ser testável — foi a falta disso que deixou passar o bug de pontuação dupla. `closeRound` é **idempotente**: sem isso, uma resposta chegando durante a pausa entre rodadas fazia o fechamento rodar duas vezes, somando pontos em dobro e pulando uma rodada.
- **O `round:start` manda `serverNow`.** O cliente mede a defasagem do próprio relógio com isso (`src/utils/duelClock.js`). Sem essa correção, relógio do aparelho adiantado em 10s zerava o cronômetro na primeira renderização e travava todas as respostas, em silêncio.
- **Limitador do socket é por `socket.id`, não por IP** — no Render o TLS termina no balanceador, então `handshake.address` é o mesmo para todos os visitantes e a plataforma inteira dividiria uma cota de 5 entradas na fila por 10 segundos. Limite por IP continua onde funciona: no Express, e agora com `app.set('trust proxy', 1)`.

## Presença ("quantas pessoas no site")

`GET /api/presence` e `POST /api/presence/ping` (`realtime/presence.js` + `routes/presence.routes.js`). Em memória, com TTL de 75s e ping do cliente a cada 30s.

**Por que heartbeat HTTP e não socket em toda página:** um socket por visitante faria cada carregamento da Home pagar a partida a frio do Render (~50s) e manteria a instância acordada 24/7, que é exatamente o teto de 750 h/mês do plano gratuito. E, decisivo: o heartbeat é indexado por um id que **nós** escolhemos (um UUID em `localStorage`), então **duas abas do mesmo navegador contam como uma pessoa** — impossível de fazer com `socket.id`, em que cada aba é uma conexão distinta.

O socket continua existindo, mas só na tela do duelo, e é ele que informa quantas pessoas estão na fila.

## Decisões de segurança (por que estão assim)

- **Sessão via cookie `httpOnly`, nunca no corpo da resposta para o cliente guardar em `localStorage`.** O frontend já trata `localStorage` como entrada não confiável (exposta a XSS) — o cookie httpOnly é a forma de manter esse mesmo princípio no lado da sessão.
- **`SameSite=Lax`, não `None`.** A topologia pretendida é *same-origin*: o frontend chama `/api/*` (caminho relativo) e, em produção, um rewrite do Vercel proxeia isso para cá — o navegador nunca fala diretamente com uma URL do Render. Same-site fica garantido por essa topologia, então `Lax` basta e evita a fragilidade de `None` (exige `Secure`, cai sob restrição crescente de cookies cross-site nos navegadores). De brinde, `Lax` já barra o cookie em POST cross-site — proteção contra CSRF sem precisar de um token separado.
- **`bcryptjs`, não `bcrypt`** — evita depender de um binding nativo compilado (node-gyp) sem toolchain de build garantido no ambiente de desenvolvimento nem binário pré-compilado garantido na imagem de build do Render.
- **Login nunca revela se o e-mail existe** — e-mail inexistente e senha errada dão a mesma resposta `401`. Cadastro, ao contrário, informa e-mail duplicado (`409`) — quem está cadastrando já sabe que está tentando, então o sinal é bem mais fraco que um oráculo de login.
- **Rate limiting por IP** em `/api/auth/register` (5/hora) e `/api/auth/login` (10/15min), mais um limite geral (300/15min) em `/api` inteiro.
- **`MONGODB_URI` ausente não derruba o processo** — `config/db.js` só conecta se a variável existir; sem ela, o servidor sobe normalmente e as rotas que precisam de banco respondem `503` de forma clara.

## O que falta para ir ao ar

MongoDB Atlas já está provisionado e conectando (verificado: registro→login→sessão→duplicado funcionando com banco real). O que resta depende da URL do Render existir:

1. **Deploy no Render** — `rootDir: backend`, build `npm install`, start `npm start`, health check `/api/health`, plano Free. O `render.yaml` na raiz já descreve isso.
2. **No painel do Render:** `MONGODB_URI` (a connection string do Atlas), `JWT_SECRET` (gerar, não reaproveitar o de dev), `FRONTEND_ORIGIN` (domínio da Vercel — aceita lista).
3. **`vercel.json`: acrescentar um rewrite de `/api/(.*)` para o host do Render, ACIMA do catch-all de SPA.** Isto é o que faz Login/Cadastro e a presença funcionarem em produção. Hoje o catch-all engole `/api/*` e devolve `index.html` — verificado: `GET /api/health` em produção responde HTML com status 200.
4. **CSP em `vercel.json`:** `connect-src 'self' https://<host>.onrender.com wss://<host>.onrender.com`. Hosts nomeados, nada de curinga.
5. **Env da Vercel:** `VITE_REALTIME_URL=https://<host>.onrender.com`, em Production **e** Preview (ver `.env.example` na raiz).

Nenhum destes passos foi executado ainda — todos dependem da URL real do Render.

## Testando sem banco

```bash
npm test                                    # validators + smoke test do app, tudo sem Mongo

curl -X POST http://localhost:5000/api/auth/logout            # 200, não precisa de banco
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" -d '{"email":"a@b.com","password":"x"}'  # 503, sem MONGODB_URI
```

Os caminhos felizes de registro/login (`201`/`200`) e o duplicado (`409`) só são verificáveis com `MONGODB_URI` real configurado — isso não foi exercitado nesta sessão, por não haver banco disponível.
