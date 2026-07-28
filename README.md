# EnglishPlay

Plataforma gratuita para brasileiros aprenderem inglês jogando. O progresso do
jogo continua 100% no navegador, guardado no `localStorage` — isso não mudou.

Agora existem telas de Cadastro e Login, com um esqueleto de backend em
[`backend/`](backend/) (Express + Mongoose) pensado para ser implantado no
Render mais adiante. Ainda não está no ar nem conectado a um banco — os
detalhes estão em [backend/README.md](backend/README.md).

## Rodando

```bash
npm install
npm run dev        # servidor de desenvolvimento (Vite, com HMR)
```

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

Oito jogos (memória, forca, montar palavra, montar frase, tradução, completar
frases, verdadeiro ou falso e escuta), além de desafio diário, treino de
conversação, revisão dos erros, conquistas e uma loja de temas e dicas.

O conteúdo fica todo em [`src/data/`](src/data/) — 239 palavras com pronúncia,
exemplo e dica, mais frases, diálogos e exercícios. Adicionar vocabulário não
exige mexer em componente nenhum.

## Stack

React 19 + Vite 8 + React Router 7, JavaScript puro (sem TypeScript) e CSS puro
(sem framework de UI). Oxlint no lugar do ESLint, Vitest para testes.

## Arquitetura

Há um documento de orientação para agentes de IA em
[CLAUDE.md](CLAUDE.md) que descreve a arquitetura em detalhe — vale a leitura
antes de mexer no progresso, no sistema de revisão ou no desafio diário, que
são as partes com invariantes não óbvias.
