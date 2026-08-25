import { User } from '../models/User.js';
import { toAdminUserSummary } from '../utils/adminDashboard.js';
import { COURSE_IDS } from '../utils/courses.js';

const parseBoundedInteger = (value, fallback, min, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getAdminDashboard = async (req, res) => {
  const page = parseBoundedInteger(req.query.page, 1, 1, 1000000);
  const limit = parseBoundedInteger(req.query.limit, 25, 1, 100);
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
  const filter = search
    ? {
      $or: [
        { email: { $regex: escapeRegex(search), $options: 'i' } },
        { nickname: { $regex: escapeRegex(search), $options: 'i' } },
      ],
    }
    : {};

  // `.exec()` e importante aqui: uma Query do Mongoose nao pode ser executada
  // duas vezes. Sem busca, totalFiltered reaproveita a MESMA Promise do total;
  // antes reaproveitava o objeto Query e o Mongoose lancava "Query was already
  // executed", transformando toda abertura do Dashboard em erro 500.
  const totalUsersPromise = User.countDocuments({}).exec();
  const usersWithProgressPromise = User.countDocuments({ progress: { $ne: null } }).exec();
  const totalFilteredPromise = search ? User.countDocuments(filter).exec() : totalUsersPromise;
  const usersPromise = User.find(filter)
    .select([
      'email',
      'nickname',
      'createdAt',
      'progress.totalScore',
      'progress.currentLevel',
      'progress.wordsStudied',
      'progress.activeCourse',
      'progress.gamesCompleted',
      ...COURSE_IDS.map(courseId => `progress.courseProgress.${courseId}.gamesCompleted`),
    ].join(' '))
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .exec();

  const [totalUsers, usersWithProgress, totalFiltered, users] = await Promise.all([
    totalUsersPromise,
    usersWithProgressPromise,
    totalFilteredPromise,
    usersPromise,
  ]);

  const totalPages = Math.max(1, Math.ceil(totalFiltered / limit));

  return res.status(200).json({
    summary: { totalUsers, usersWithProgress },
    users: users.map(toAdminUserSummary),
    pagination: {
      page,
      limit,
      totalItems: totalFiltered,
      totalPages,
    },
  });
};
