import { User } from '../models/User.js';
import { isValidEmailFormat, isValidPassword, isValidNickname, MIN_PASSWORD_LENGTH, MAX_NICKNAME_LENGTH } from '../utils/validators.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signSessionToken, sessionCookieOptions, clearSessionCookieOptions, SESSION_COOKIE_NAME } from '../utils/token.js';

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

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
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
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Conta não encontrada.' });
  res.status(200).json({ user: toPublicUser(user) });
};

export const updateProfile = async (req, res) => {
  const { nickname } = req.body || {};

  if (!isValidNickname(nickname)) {
    return res.status(400).json({ error: `O apelido pode ter no máximo ${MAX_NICKNAME_LENGTH} caracteres.` });
  }

  const user = await User.findById(req.user.id);
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
    user.nickname = trimmed;
    user.nicknameUpdatedAt = new Date();
  }

  await user.save();
  res.status(200).json({ user: toPublicUser(user) });
};

export const updateProgress = async (req, res) => {
  const { progress } = req.body || {};
  if (!progress || typeof progress !== 'object') {
    return res.status(400).json({ error: 'Objeto de progresso inválido.' });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { progress },
    { new: true }
  );

  if (!user) return res.status(404).json({ error: 'Conta não encontrada.' });
  res.status(200).json({ user: toPublicUser(user) });
};
