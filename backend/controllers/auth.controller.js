import { User } from '../models/User.js';
import { isValidEmailFormat, isValidPassword, isValidNickname, MIN_PASSWORD_LENGTH, MAX_NICKNAME_LENGTH } from '../utils/validators.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signSessionToken, sessionCookieOptions, clearSessionCookieOptions, SESSION_COOKIE_NAME, signDuelTicket } from '../utils/token.js';

const NICKNAME_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias em ms

const toPublicUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  nickname: user.nickname ?? null,
  nicknameUpdatedAt: user.nicknameUpdatedAt ?? null,
  progress: user.progress ?? null,
});

export const register = async (req, res) => {
  const { email, password } = req.body || {};

  if (!isValidEmailFormat(email)) {
    return res.status(400).json({ error: 'Digite um e-mail válido.' });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: `A senha precisa de pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` });
  }

  try {
    const passwordHash = await hashPassword(password);
    // Novas contas começam com progresso zerado (0) e sem trava prévia de apelido
    const user = await User.create({
      email,
      passwordHash,
      nickname: null,
      nicknameUpdatedAt: null,
      progress: null,
    });

    const token = signSessionToken(user);
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }
    throw err;
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body || {};

  const invalidCredentials = () => res.status(401).json({ error: 'E-mail ou senha inválidos.' });

  if (!isValidEmailFormat(email) || !password) return invalidCredentials();

  // .lean(): só lemos os campos, nunca chamamos .save() neste caminho —
  // devolve objeto JS puro em vez de um documento Mongoose completo.
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).lean();
  if (!user) return invalidCredentials();

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return invalidCredentials();

  const token = signSessionToken(user);
  res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());
  res.status(200).json({ user: toPublicUser(user) });
};

export const logout = (req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions());
  res.status(200).json({ ok: true });
};

export const me = (req, res) => {
  res.status(200).json({ user: req.user });
};

export const getProfile = async (req, res) => {
  // Só leitura: nunca precisa de passwordHash nem dos métodos de documento
  // do Mongoose — .select() evita trazer o hash à toa, .lean() evita
  // instanciar um documento completo só pra ler 4 campos.
  const user = await User.findById(req.user.id).select('-passwordHash').lean();
  if (!user) return res.status(404).json({ error: 'Conta não encontrada.' });
  res.status(200).json({ user: toPublicUser(user) });
};

export const updateProfile = async (req, res) => {
  const { nickname } = req.body || {};

  if (!isValidNickname(nickname)) {
    return res.status(400).json({ error: `O apelido pode ter no máximo ${MAX_NICKNAME_LENGTH} caracteres.` });
  }

  // Sem .lean() aqui: este caminho chama user.save() logo abaixo, precisa do
  // documento Mongoose de verdade. .select() ainda vale — passwordHash não é
  // lido nem alterado, e um campo excluído (não selecionado) e não
  // modificado não entra na validação do save().
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'Conta não encontrada.' });

  const trimmed = nickname == null || nickname === '' ? null : String(nickname).trim();

  // Validação da regra dos 30 dias se o apelido estiver mudando
  if (trimmed !== user.nickname) {
    if (user.nicknameUpdatedAt) {
      const elapsed = Date.now() - new Date(user.nicknameUpdatedAt).getTime();
      if (elapsed < NICKNAME_COOLDOWN_MS) {
        const daysLeft = Math.ceil((NICKNAME_COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000));
        return res.status(400).json({
          error: `Você só poderá alterar seu apelido novamente em ${daysLeft} dia(s).`,
        });
      }
    }
    // A escolha inicial (de null pra um apelido) não inicia o cooldown — só
    // TROCAR um apelido já existente conta como a "alteração" que trava por
    // 30 dias. Sem isso, quem digitasse errado no primeiro apelido (logo
    // depois do cadastro) ficava preso ao erro por um mês inteiro.
    const isFirstChoice = user.nickname === null;
    user.nickname = trimmed;
    if (!isFirstChoice) user.nicknameUpdatedAt = new Date();
  }

  await user.save();
  res.status(200).json({ user: toPublicUser(user) });
};

export const issueDuelTicket = async (req, res) => {
  const user = await User.findById(req.user.id).select('nickname progress').lean();
  if (!user) return res.status(404).json({ error: 'Conta não encontrada.' });
  if (!user.nickname) {
    return res.status(400).json({ error: 'Escolha um apelido antes de jogar ranked.' });
  }

  const ticket = signDuelTicket({
    id: user._id.toString(),
    nickname: user.nickname,
    avatar: user.progress?.selectedAvatar || 'U',
  });
  res.status(200).json({ ticket });
};

export const updateProgress = async (req, res) => {
  const { progress } = req.body || {};
  if (!progress || typeof progress !== 'object') {
    return res.status(400).json({ error: 'Objeto de progresso inválido.' });
  }

  // Campos que NUNCA podem ser apagados por um payload que simplesmente não
  // os conhece. `progress` é substituído por inteiro (é o desenho: o cliente é
  // dono do próprio progresso), e isso é seguro enquanto todo cliente manda o
  // objeto completo — mas deixa de ser na janela de um deploy, quando uma aba
  // com o bundle antigo ainda aberta sincroniza um progresso SEM
  // `courseProgress` e apaga da nuvem o idioma que a pessoa estacionou.
  //
  // Aqui a regra é só: ausente não é o mesmo que vazio. Se o campo não veio,
  // preserva o que já estava salvo; se veio (inclusive vazio), o cliente manda.
  const PRESERVAR_SE_AUSENTE = ['courseProgress', 'courseStats'];
  const faltando = PRESERVAR_SE_AUSENTE.filter(campo => progress[campo] === undefined);

  let progressoFinal = progress;
  if (faltando.length > 0) {
    const atual = await User.findById(req.user.id).select('progress').lean();
    progressoFinal = { ...progress };
    for (const campo of faltando) {
      if (atual?.progress?.[campo] !== undefined) progressoFinal[campo] = atual.progress[campo];
    }
  }

  // findByIdAndUpdate já é atômico (não passa por save()), então .lean()
  // aqui só evita instanciar um documento Mongoose que ninguém vai usar.
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { progress: progressoFinal },
    { new: true, select: '-passwordHash' }
  ).lean();

  if (!user) return res.status(404).json({ error: 'Conta não encontrada.' });
  res.status(200).json({ user: toPublicUser(user) });
};
