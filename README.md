# EnglishPlay

Plataforma gratuita para brasileiros aprenderem inglês jogando. O progresso do
jogo continua 100% no navegador, guardado no `localStorage` — isso não mudou.

Cadastro e Login são um sistema real, separado do progresso: backend em
[`backend/`](backend/) (Express + Mongoose), **implantado no Render** e
conectado ao MongoDB Atlas. `/` leva um visitante novo para `/welcome`, que
oferece Entrar, Criar conta ou Jogar sem conta — a conta não guarda pontuação
nenhuma, isso continua só no navegador. Detalhes completos em
[backend/README.md](backend/README.md).

## Rodando

```bash
npm install
npm run dev        # servidor de desenvolvimento (Vite, com HMR)
```

`npm run dev` faz proxy de `/api` para `http://localhost:5000`, então para
testar Cadastro/Login localmente é preciso rodar o backend também — veja
[backend/README.md](backend/README.md).

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o `dist/` já construído |
| `npm test` | Testes (Vitest) |
| `npm run test:watch` | Testes em watch mode |
| `npm run lint` | Oxlint |

Para rodar um teste só: `npm test -- storage` (casa pelo nome do arquivo) ou
`npm test -- -t "migração"` (casa pelo nome do teste).

## O que tem dentro

Nove jogos (memória, forca, montar palavra, montar frase, tradução, completar
frases, verdadeiro ou falso, escuta e o duelo "Quem Sabe Mais?"), além de
desafio diário, treino de conversação, revisão dos erros, conquistas e uma
loja de temas e dicas.

"Quem Sabe Mais?" tem dois modos: contra um bot (100% no navegador, como todo
o resto) ou duelo online contra outro jogador em tempo real via Socket.IO, sem
precisar de conta — o servidor é a autoridade sobre pergunta, tempo e
resposta certa.

O conteúdo fica todo em [`src/data/`](src/data/) — mais de 500 palavras com
pronúncia, exemplo e dica, mais frases, diálogos ramificados e exercícios.
Adicionar vocabulário não exige mexer em componente nenhum.

## Stack

React 19 + Vite 8 + React Router 7, JavaScript puro (sem TypeScript) e CSS puro
(sem framework de UI). Oxlint no lugar do ESLint, Vitest para testes.

Backend: Express + Mongoose (auth) e Socket.IO (duelo online e presença),
implantados no Render — veja [backend/README.md](backend/README.md).

## Arquitetura

Há um documento de orientação para agentes de IA em
[CLAUDE.md](CLAUDE.md) que descreve a arquitetura em detalhe — vale a leitura
antes de mexer no progresso, no sistema de revisão, no desafio diário ou no
duelo online, que são as partes com invariantes não óbvias.
