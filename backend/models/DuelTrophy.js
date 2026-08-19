import mongoose from 'mongoose';

const { Schema } = mongoose;

// Um documento por (usuário, mês) — o ranking zera todo mês por desenho (ver
// docs/superpowers/specs/2026-08-06-ranked-duel-trophies-design.md).
// nickname/avatar são denormalizados do ticket de duelo no momento da
// vitória: a leitura pública do ranking nunca faz join com User.
const duelTrophySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true }, // 'YYYY-MM', calendário UTC
  // Idioma em que o troféu foi ganho. O ranking é por curso, então um duelo de
  // espanhol não pode somar na tabela de inglês.
  //
  // Os documentos antigos, criados antes deste campo existir, não têm `courseId`
  // — e `default` do Mongoose só vale na escrita, não retroage. Isso é seguro
  // porque o duelo humano sempre foi inglês: a leitura trata "ausente" como
  // 'en-pt' (ver o filtro em duel.controller.js), sem precisar de migração.
  courseId: { type: String, default: 'en-pt' },
  nickname: { type: String, required: true },
  avatar: { type: String, default: 'U' },
  trophies: { type: Number, default: 0 },
}, { timestamps: true });

// A chave passou a incluir o curso: uma pessoa pode ter troféus de inglês E de
// espanhol no mesmo mês, em linhas separadas.
//
// ATENÇÃO AO DEPLOY: o índice único ANTIGO `{ userId: 1, month: 1 }` continua
// existindo no Atlas — o Mongoose cria índices novos mas nunca remove os que
// saíram do schema. Enquanto ele estiver lá, a segunda linha (o outro idioma)
// do mesmo mês é rejeitada por chave duplicada. Isso não afeta nada hoje,
// porque o duelo humano ainda é só inglês; mas o índice velho PRECISA ser
// removido antes de o duelo em espanhol entrar no ar:
//   db.dueltrophies.dropIndex('userId_1_month_1')
duelTrophySchema.index({ userId: 1, month: 1, courseId: 1 }, { unique: true });
// Cobre o sort do ranking por completo — trophies E o desempate por
// updatedAt (quem bateu aquele total primeiro) — pra find().sort() nunca
// precisar de um sort em memória depois de ler do índice. `courseId` entra
// logo depois de `month` porque as duas são igualdades no filtro.
duelTrophySchema.index({ month: 1, courseId: 1, trophies: -1, updatedAt: 1 });

export const DuelTrophy = mongoose.model('DuelTrophy', duelTrophySchema);
