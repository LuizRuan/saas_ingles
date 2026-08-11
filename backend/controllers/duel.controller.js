import { DuelTrophy } from '../models/DuelTrophy.js';
import { User } from '../models/User.js';
import { currentMonthKey } from '../utils/duelMonth.js';

const clampLimit = (raw) => {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 5;
  return Math.min(n, 50);
};

export const getLeaderboard = async (req, res) => {
  const month = currentMonthKey();
  const limit = clampLimit(req.query.limit);
  // .lean(): endpoint público e só-leitura — devolve objeto JS puro, sem
  // instanciar um documento Mongoose completo pra cada linha do ranking.
  const trophies = await DuelTrophy.find({ month })
    .sort({ trophies: -1, updatedAt: 1 })
    .limit(limit)
    .select('userId nickname trophies -_id')
    .lean();

  // Busca wordsStudied E selectedAvatar atualizados do User para que o avatar
  // reflita sempre o último item comprado na loja (o avatar denormalizado no
  // DuelTrophy fica desatualizado quando o jogador troca de avatar depois).
  const userIds = trophies.map(t => t.userId).filter(Boolean);
  const users = await User.find({ _id: { $in: userIds } })
    .select('progress.wordsStudied progress.selectedAvatar progress.selectedTitle')
    .lean();
  const userDataById = new Map(users.map(u => [
    u._id.toString(),
    {
      wordsStudied: u.progress?.wordsStudied || 0,
      avatar: u.progress?.selectedAvatar || 'U',
      selectedTitle: u.progress?.selectedTitle || null,
    },
  ]));

  const entries = trophies.map(({ userId, ...entry }) => {
    const userData = userDataById.get(userId?.toString()) || {};
    return {
      ...entry,
      avatar: userData.avatar || 'U',
      wordsStudied: userData.wordsStudied || 0,
      selectedTitle: userData.selectedTitle || null,
    };
  });

  res.status(200).json({ month, entries });
};

export const getMyRank = async (req, res) => {
  const month = currentMonthKey();
  const mine = await DuelTrophy.findOne({ userId: req.user.id, month }).select('trophies').lean();
  if (!mine) return res.status(200).json({ month, trophies: 0, rank: null });

  const ahead = await DuelTrophy.countDocuments({ month, trophies: { $gt: mine.trophies } });
  res.status(200).json({ month, trophies: mine.trophies, rank: ahead + 1 });
};

// Ranking por nível — não tem mês/reset como o de troféus (nível só cresce).
// wordsStudied vem do progress.js sincronizado em useProgress.jsx; o nível em
// si (a tabela de thresholds em categories.js) é assunto do frontend, então
// aqui só ordenamos pelo número bruto e devolvemos, sem duplicar a tabela.
// Exige nickname (mesma regra do ranking de troféus, mostrada no tooltip):
// sem isso, apelidos genéricos de convidado inundariam o ranking.
export const getLevelLeaderboard = async (req, res) => {
  const limit = clampLimit(req.query.limit);
  const users = await User.find({
    nickname: { $ne: null },
    'progress.wordsStudied': { $gt: 0 },
  })
    .sort({ 'progress.wordsStudied': -1 })
    .limit(limit)
    .select('nickname progress.selectedAvatar progress.selectedTitle progress.wordsStudied -_id')
    .lean();

  const entries = users.map(u => ({
    nickname: u.nickname,
    avatar: u.progress?.selectedAvatar || 'U',
    wordsStudied: u.progress?.wordsStudied || 0,
    selectedTitle: u.progress?.selectedTitle || null,
  }));

  res.status(200).json({ entries });
};
