import { DuelTrophy } from '../models/DuelTrophy.js';
import { currentMonthKey } from '../utils/duelMonth.js';

const clampLimit = (raw) => {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 5;
  return Math.min(n, 50);
};

export const getLeaderboard = async (req, res) => {
  const month = currentMonthKey();
  const limit = clampLimit(req.query.limit);
  const entries = await DuelTrophy.find({ month })
    .sort({ trophies: -1, updatedAt: 1 })
    .limit(limit)
    .select('nickname avatar trophies -_id');
  res.status(200).json({ month, entries });
};

export const getMyRank = async (req, res) => {
  const month = currentMonthKey();
  const mine = await DuelTrophy.findOne({ userId: req.user.id, month });
  if (!mine) return res.status(200).json({ month, trophies: 0, rank: null });

  const ahead = await DuelTrophy.countDocuments({ month, trophies: { $gt: mine.trophies } });
  res.status(200).json({ month, trophies: mine.trophies, rank: ahead + 1 });
};
