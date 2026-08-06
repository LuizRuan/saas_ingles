import { DuelTrophy } from '../models/DuelTrophy.js';
import { currentMonthKey } from '../utils/duelMonth.js';

// Upsert mensal — chamado fire-and-forget por index.js, DEPOIS do match:end
// já ter sido emitido. Se o Mongo estiver fora do ar, a promise nunca
// resolve nem rejeita de forma útil a tempo; quem chama sempre encadeia
// .catch(() => {}) e nunca faz `await` nisto no caminho principal.
export const awardTrophy = async ({ userId, nickname, avatar }) => {
  await DuelTrophy.findOneAndUpdate(
    { userId, month: currentMonthKey() },
    { $inc: { trophies: 1 }, $set: { nickname, avatar } },
    { upsert: true },
  );
};
