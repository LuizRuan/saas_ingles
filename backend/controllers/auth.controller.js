import { User } from '../models/User.js';
import { isValidEmailFormat, isValidPassword, isValidNickname, MIN_PASSWORD_LENGTH, MAX_NICKNAME_LENGTH } from '../utils/validators.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signSessionToken, sessionCookieOptions, clearSessionCookieOptions, SESSION_COOKIE_NAME } from '../utils/token.js';

const toPublicUser = (user) => ({ id: user._id.toString(), email: user.email, nickname: user.nickname ?? null });

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
    const user = await User.create({ email, passwordHash });

    const token = signSessionToken(user);
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    // E11000 = índice único violado (e-mail já cadastrado). Também fecha a
    // corrida que uma checagem prévia (find antes de create) sozinha não fecha.
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }
    throw err;
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body || {};

  // Mesma resposta genérica em qualquer descompasso — e-mail não existe ou
  // senha errada dão o MESMO 401, para não virar um oráculo de "esse e-mail
  // existe ou não".
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

// Não precisa de requireDb — só limpa um cookie, não toca o Mongo. Funciona
// hoje, sem MONGODB_URI nenhum.
export const logout = (req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions());
  res.status(200).json({ ok: true });
};

// requireAuth já populou req.user a partir do próprio JWT — sem round-trip
// nem dependência de banco.
export const me = (req, res) => {
  res.status(200).json({ user: req.user });
};

// Diferente de `me`, PRECISA do banco: o apelido não vai no JWT (senão trocar
// o apelido não refletiria em lugar nenhum até a pessoa logar de novo em 7
// dias). requireAuth já garantiu req.user.id a partir do cookie.
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

  // '' e null viram null (apagar o apelido), o resto é aparado.
  const trimmed = nickname == null || nickname === '' ? null : String(nickname).trim();

  const user = await User.findByIdAndUpdate(req.user.id, { nickname: trimmed }, { new: true });
  if (!user) return res.status(404).json({ error: 'Conta não encontrada.' });
  res.status(200).json({ user: toPublicUser(user) });
};
