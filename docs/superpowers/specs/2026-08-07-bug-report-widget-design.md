# Botão de reportar bug + tela de admin — design

Data: 2026-08-07

## Contexto

Hoje não existe nenhum canal para um usuário avisar sobre um bug — nem
formulário, nem e-mail, nada. Também não existe conceito de "admin" em
lugar nenhum do sistema: o modelo `User` só tem `email`, `passwordHash`,
`nickname`, `nicknameUpdatedAt` e `progress`.

Este documento cobre um botão flutuante global de reportar bug, visível em
qualquer tela do app, e uma tela de admin simples (listar + apagar) para o
desenvolvedor ver o que chegou.

## Decisões já fechadas com o usuário

- **Onde o botão aparece:** em toda página do app (vive no `Layout.jsx`,
  não só na Home), porque um bug pode acontecer em qualquer jogo.
- **O que vai no relatório, além do texto:** só a rota atual
  (`window.location.pathname`). Nada de user-agent, resolução de tela ou
  apelido/e-mail automático — mantém o formulário mínimo.
- **Quem pode reportar:** qualquer pessoa, logada ou convidada — o app
  inteiro funciona sem conta, e travar isso atrás de login perderia a
  maioria dos avisos.
- **Como o admin é identificado:** variável de ambiente `ADMIN_EMAILS`
  (string separada por vírgula, mesmo padrão de `FRONTEND_ORIGIN` em
  `env.js`), checada contra `req.user.email` depois de um login normal.
  Sem campo `role` no banco, sem tela de gerenciar permissões — hoje só
  existe um admin (o próprio desenvolvedor).
- **Notificação:** nenhuma. O desenvolvedor confere a tela `/admin/feedback`
  quando quiser; sem e-mail, sem push, sem infraestrutura nova de
  mensageria.
- **Ações na tela de admin:** listar (mais recente primeiro) e apagar.
  Sem "marcar como resolvido" — apagar É o jeito de tirar da lista.

## Fora de escopo (deliberado)

- Anexar screenshot ao relatório.
- Responder ao usuário que reportou (não há e-mail nem conta obrigatória
  pra isso fazer sentido na maioria dos casos).
- Qualquer sistema de papéis/permissões além de "é ou não é o e-mail da
  variável de ambiente".
- Filtro por página/rota na tela de admin — se o volume crescer a ponto de
  precisar, é um adicional pequeno e isolado, não bloqueia este MVP.

## Arquitetura

### 1. Modelo de dados

```js
// backend/models/BugReport.js
{
  message: { type: String, required: true, maxlength: 1000 },
  page: { type: String, required: true },       // rota onde o botão foi clicado, ex: "/games/memory"
  nickname: { type: String, default: null },     // apelido de quem reportou, se estava logado
  createdAt: (automático via timestamps: true),
}
```

`nickname` é preenchido no backend a partir do cookie de sessão quando
existe um — nunca confiado do corpo da requisição (mesmo princípio já
documentado no projeto: nada vindo do cliente é fonte de verdade sobre
identidade). Um convidado manda o relatório sem cookie, e `nickname` fica
`null`.

### 2. Middleware `requireAdmin`

```js
// backend/middleware/requireAdmin.js
// Depois de requireAuth (que já populou req.user.email a partir do JWT).
export const requireAdmin = (req, res, next) =>
  env.adminEmails.includes(req.user.email)
    ? next()
    : res.status(403).json({ error: 'Acesso restrito.' });
```

`env.adminEmails` segue o mesmo padrão de `frontendOrigins` em
`backend/config/env.js`: lê `ADMIN_EMAILS`, faz `split(',')` e `trim()`,
vira um array (vazio se a variável não existir — nesse caso `/admin/feedback`
fica inacessível para todo mundo até a variável ser configurada no Render,
em vez de quebrar o processo).

### 3. Rotas

Novo `backend/routes/feedback.routes.js`, montado em `/api/feedback`:

```js
feedbackRouter.post('/', feedbackLimiter, asyncHandler(createFeedback));
feedbackRouter.get('/', requireAuth, requireAdmin, asyncHandler(listFeedback));
feedbackRouter.delete('/:id', requireAuth, requireAdmin, asyncHandler(deleteFeedback));
```

- `feedbackLimiter`: novo limiter em `rateLimiters.js`, mesmo padrão dos
  existentes — 5 relatórios por hora por IP (via `resolveClientIp`, não
  `req.ip` — mesmo motivo já documentado pros outros limiters: a topologia
  Vercel→Render tem hops diferentes).
- `createFeedback`: valida `message` (não vazio, ≤1000 chars) e `page`
  (string não vazia); lê `req.cookies` pra tentar identificar um usuário
  logado (sem exigir — `verifySessionToken` dentro de um try/catch, igual
  ao padrão já usado pra tickets de duelo: sessão ausente ou inválida só
  significa "convidado", nunca erro).
- `listFeedback` / `deleteFeedback`: só acessíveis a admin, comportamento
  direto (find ordenado por `createdAt` desc / findByIdAndDelete).

### 4. Frontend — botão flutuante

Em `Layout.jsx`, ao lado dos outros elementos globais (toast de conquista,
`Celebration`): um botão `position: fixed`, canto inferior direito, ícone
🐛, classe nova `.bug-report-fab` (pill redondo, mesmo espírito visual dos
botões já existentes). Ao clicar, abre um modal reaproveitando o padrão já
estabelecido no app (`.modal-overlay` + `.modal-content` + `.modal-close-btn`,
a mesma classe adicionada nesta sessão para os modais do duelo) com uma
`<textarea>` e botão "Enviar". Envia `{ message, page: pathname }` para
`POST /api/feedback` via `fetch` relativo (mesmo padrão de `authClient.js`).
Mostra uma confirmação simples ("Obrigado! Recebemos seu relatório.") e
fecha o modal sozinho depois de alguns segundos.

### 5. Frontend — tela de admin

Nova página `src/pages/Feedback.jsx`, rota `/admin/feedback` adicionada em
`App.jsx` (lazy, como as demais rotas exceto Home). A página chama
`GET /api/feedback` ao montar; se a resposta for 401/403, mostra uma
mensagem de acesso negado em vez do formulário — a autorização real mora
inteiramente no backend, a tela só reflete a resposta. Lista cada relatório
com mensagem, página, apelido (ou "Convidado"), data, e um botão "Apagar"
que chama `DELETE /api/feedback/:id` e remove o item da lista local.
**Sem link nenhum na navbar** — rota alcançada só digitando a URL.

## Testes

- `requireAdmin`: rejeita e-mail fora de `ADMIN_EMAILS`, aceita e-mail
  dentro dela, e-mail vazio/ausente sempre rejeitado.
- `POST /api/feedback`: funciona sem cookie de sessão (convidado);
  preenche `nickname` quando há um cookie válido; rejeita mensagem vazia
  ou maior que 1000 caracteres; `feedbackLimiter` bloqueia depois do
  limite.
- `GET /api/feedback` e `DELETE /api/feedback/:id`: 401 sem cookie, 403
  com cookie válido mas e-mail fora da lista de admin.
