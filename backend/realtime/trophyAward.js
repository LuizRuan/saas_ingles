import { DuelTrophy } from '../models/DuelTrophy.js';
import { currentMonthKey } from '../utils/duelMonth.js';

// Upsert mensal — chamado fire-and-forget por index.js, DEPOIS do match:end
// já ter sido emitido. Se o Mongo estiver fora do ar, a promise nunca
// resolve nem rejeita de forma útil a tempo; quem chama sempre encadeia
// .catch(() => {}) e nunca faz `await` nisto no caminho principal.
export const awardTrophy = async ({ userId, nickname, avatar, courseId = 'en-pt' }) => {
  // O curso entra na CHAVE, não só nos campos: o ranking é por idioma, então
  // troféus de inglês e de espanhol são contadores separados no mesmo mês.
  await DuelTrophy.findOneAndUpdate(
    { userId, month: currentMonthKey(), courseId },
    { $inc: { trophies: 1 }, $set: { nickname, avatar } },
    { upsert: true },
  );
};
