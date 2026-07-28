// Script MANUAL, só para desenvolvimento — nunca roda no servidor de verdade.
//
// backend/ é um pacote independente do frontend (ver README.md): não importa
// src/data/words.js em runtime, porque isso quebraria silenciosamente no dia
// em que só backend/ for deployado no Render (o src/ do frontend não existe
// lá). Em vez disso, este script gera uma CÓPIA estática (backend/data/words.json)
// que o gerador de perguntas do duelo humano lê.
//
// Rodar sempre que src/data/words.js mudar:
//   node backend/scripts/sync-words.mjs
//
// Campos copiados: apenas os que backend/realtime/questionGenerator.js precisa
// para montar qualquer um dos 8 tipos de pergunta (en/pt/pronunciation/example/
// examplePt/tip) — category e level ficam de fora, não são usados aqui.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendWordsPath = join(__dirname, '..', '..', 'src', 'data', 'words.js');
const outPath = join(__dirname, '..', 'data', 'words.json');

const { words } = await import(`file://${frontendWordsPath}`);

const trimmed = words.map(({ en, pt, pronunciation, example, examplePt, tip }) => ({
  en, pt, pronunciation, example, examplePt, tip,
}));

writeFileSync(outPath, JSON.stringify(trimmed, null, 2) + '\n');
console.log(`[sync-words] ${trimmed.length} palavras escritas em ${outPath}`);
