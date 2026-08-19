import { DuelTrophy } from '../models/DuelTrophy.js';
import { User } from '../models/User.js';
import { currentMonthKey } from '../utils/duelMonth.js';
import { resolveCourseId, DEFAULT_COURSE } from '../utils/courses.js';

const clampLimit = (raw) => {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 5;
  return Math.min(n, 50);
};

// Filtro de curso para os troféus. Documentos criados antes do campo existir
// não têm `courseId`; como o duelo humano sempre foi inglês, "ausente" conta
// como en-pt. Isso evita uma migração no Atlas só para preencher um valor que
// já é implícito.
const filtroDeCurso = (courseId) =>
  courseId === DEFAULT_COURSE
    ? { courseId: { $in: [DEFAULT_COURSE, null] } }
    : { courseId };

export const getLeaderboard = async (req, res) => {
  const month = currentMonthKey();
  const limit = clampLimit(req.query.limit);
  const courseId = resolveCourseId(req.query.course);
  // .lean(): endpoint público e só-leitura — devolve objeto JS puro, sem
  // instanciar um documento Mongoose completo pra cada linha do ranking.
  const trophies = await DuelTrophy.find({ month, ...filtroDeCurso(courseId) })
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

  res.status(200).json({ month, course: courseId, entries });
};

export const getMyRank = async (req, res) => {
  const month = currentMonthKey();
  const courseId = resolveCourseId(req.query.course);
  const curso = filtroDeCurso(courseId);

  const mine = await DuelTrophy.findOne({ userId: req.user.id, month, ...curso })
    .select('trophies').lean();
  if (!mine) return res.status(200).json({ month, course: courseId, trophies: 0, rank: null });

  // A posição também é dentro do idioma: contar quem está à frente sem filtrar
  // por curso daria uma colocação medida contra outra tabela.
  const ahead = await DuelTrophy.countDocuments({ month, ...curso, trophies: { $gt: mine.trophies } });
  res.status(200).json({ month, course: courseId, trophies: mine.trophies, rank: ahead + 1 });
};

// Ranking por nível — não tem mês/reset como o de troféus (nível só cresce).
// O nível em si (a tabela de thresholds) é assunto do frontend; aqui só
// ordenamos pelo número bruto de palavras e devolvemos, sem duplicar a tabela.
// Exige nickname (mesma regra do ranking de troféus, mostrada no tooltip):
// sem isso, apelidos genéricos de convidado inundariam o ranking.
//
// É POR IDIOMA. Ordenar por `progress.wordsStudied` (o campo plano) comparava
// pessoas em cursos diferentes na mesma tabela: como esse campo passou a ser a
// contagem do curso ATIVO, quem estivesse estudando espanhol aparecia com o
// nível de espanhol no ranking de inglês — ou sumia dele. Agora lemos
// `progress.courseStats.<curso>.wordsStudied`, que cobre todos os cursos da
// pessoa independentemente de qual ela deixou aberto (ver courseProgress.js).
export const getLevelLeaderboard = async (req, res) => {
  const limit = clampLimit(req.query.limit);
  const courseId = resolveCourseId(req.query.course);
  // Só aqui, DEPOIS da whitelist, o id vira caminho de campo.
  const campo = `progress.courseStats.${courseId}.wordsStudied`;

  // $or com fallback: contas antigas não têm `courseStats` no banco (o campo
  // foi introduzido depois). Sem o fallback, só a conta que sincronizou após
  // a feature aparecer no ranking — o filtro `[campo]: { $gt: 0 }` exclui
  // quem ainda tem os dados só em `progress.wordsStudied` (campo plano).
  const users = await User.find({
    nickname: { $ne: null },
    $or: [
      { [campo]: { $gt: 0 } },
      // Fallback: campo courseStats ausente → usa o wordsStudied plano.
      // Para contas antigas que só estudaram inglês isso é preciso; quem já
      // trocou de curso pode mostrar o score do curso ativo (comportamento de
      // transição aceitável — some quando o cliente sincronizar courseStats).
      { [campo]: { $exists: false }, 'progress.wordsStudied': { $gt: 0 } },
    ],
  })
    .sort({ [campo]: -1 })
    .limit(limit)
    // wordsStudied plano incluído para o fallback funcionar nas entries.
    .select(`nickname progress.selectedAvatar progress.selectedTitle progress.wordsStudied ${campo} -_id`)
    .lean();

  const entries = users.map(u => ({
    nickname: u.nickname,
    avatar: u.progress?.selectedAvatar || 'U',
    // Prefere o índice por curso; recai no campo plano para contas antigas.
    wordsStudied: u.progress?.courseStats?.[courseId]?.wordsStudied
                  ?? u.progress?.wordsStudied
                  ?? 0,
    selectedTitle: u.progress?.selectedTitle || null,
  }));

  res.status(200).json({ course: courseId, entries });
};
