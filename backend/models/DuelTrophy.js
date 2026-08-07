import mongoose from 'mongoose';

const { Schema } = mongoose;

// Um documento por (usuário, mês) — o ranking zera todo mês por desenho (ver
// docs/superpowers/specs/2026-08-06-ranked-duel-trophies-design.md).
// nickname/avatar são denormalizados do ticket de duelo no momento da
// vitória: a leitura pública do ranking nunca faz join com User.
const duelTrophySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true }, // 'YYYY-MM', calendário UTC
  nickname: { type: String, required: true },
  avatar: { type: String, default: 'U' },
  trophies: { type: Number, default: 0 },
}, { timestamps: true });

duelTrophySchema.index({ userId: 1, month: 1 }, { unique: true });
// Cobre o sort do ranking por completo — trophies E o desempate por
// updatedAt (quem bateu aquele total primeiro) — pra find().sort() nunca
// precisar de um sort em memória depois de ler do índice.
duelTrophySchema.index({ month: 1, trophies: -1, updatedAt: 1 });

export const DuelTrophy = mongoose.model('DuelTrophy', duelTrophySchema);
