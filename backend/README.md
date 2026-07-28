# EnglishPlay — backend (esqueleto)

API de autenticação (registro/login) do EnglishPlay. **Ainda não está deployada e não tem MongoDB conectado neste momento** — este é um esqueleto pronto para quando isso acontecer.

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
- **Sem variável de ambiente nova obrigatória** — reaproveita `FRONTEND_ORIGIN` (CORS do Socket.IO, com `credentials: false`: a identidade do duelo é um apelido descartável, não o cookie de sessão).

## Decisões de segurança (por que estão assim)

- **Sessão via cookie `httpOnly`, nunca no corpo da resposta para o cliente guardar em `localStorage`.** O frontend já trata `localStorage` como entrada não confiável (exposta a XSS) — o cookie httpOnly é a forma de manter esse mesmo princípio no lado da sessão.
- **`SameSite=Lax`, não `None`.** A topologia pretendida é *same-origin*: o frontend chama `/api/*` (caminho relativo) e, em produção, um rewrite do Vercel proxeia isso para cá — o navegador nunca fala diretamente com uma URL do Render. Same-site fica garantido por essa topologia, então `Lax` basta e evita a fragilidade de `None` (exige `Secure`, cai sob restrição crescente de cookies cross-site nos navegadores). De brinde, `Lax` já barra o cookie em POST cross-site — proteção contra CSRF sem precisar de um token separado.
- **`bcryptjs`, não `bcrypt`** — evita depender de um binding nativo compilado (node-gyp) sem toolchain de build garantido no ambiente de desenvolvimento nem binário pré-compilado garantido na imagem de build do Render.
- **Login nunca revela se o e-mail existe** — e-mail inexistente e senha errada dão a mesma resposta `401`. Cadastro, ao contrário, informa e-mail duplicado (`409`) — quem está cadastrando já sabe que está tentando, então o sinal é bem mais fraco que um oráculo de login.
- **Rate limiting por IP** em `/api/auth/register` (5/hora) e `/api/auth/login` (10/15min), mais um limite geral (300/15min) em `/api` inteiro.
- **`MONGODB_URI` ausente não derruba o processo** — `config/db.js` só conecta se a variável existir; sem ela, o servidor sobe normalmente e as rotas que precisam de banco respondem `503` de forma clara.

## O que falta para ir ao ar (fora do escopo deste esqueleto)

1. Provisionar MongoDB Atlas e configurar `MONGODB_URI`.
2. Gerar um `JWT_SECRET` de produção de verdade.
3. Deploy no Render, com `FRONTEND_ORIGIN` apontando para o domínio real do Vercel.
4. Acrescentar ao `vercel.json` do frontend uma entrada em `rewrites` proxeando `/api/(.*)` para a URL do Render — **nenhuma URL foi inventada aqui** porque nada foi deployado ainda.

Nenhum destes 4 passos foi executado nesta sessão — nem deploy, nem `git`, por instrução explícita.

## Testando sem banco

```bash
npm test                                    # validators + smoke test do app, tudo sem Mongo

curl -X POST http://localhost:5000/api/auth/logout            # 200, não precisa de banco
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" -d '{"email":"a@b.com","password":"x"}'  # 503, sem MONGODB_URI
```

Os caminhos felizes de registro/login (`201`/`200`) e o duplicado (`409`) só são verificáveis com `MONGODB_URI` real configurado — isso não foi exercitado nesta sessão, por não haver banco disponível.
