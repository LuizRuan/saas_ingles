import mongoose from 'mongoose';

const { Schema } = mongoose;

// nickname é opcional e null até a pessoa escolher um na tela de Perfil
// (dentro de Configurações) — não faz parte do formulário de cadastro.
// Sem índice único: apelido duplicado é permitido, só o e-mail precisa ser
// único para autenticação.
const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  nickname: { type: String, trim: true, default: null },
  nicknameUpdatedAt: { type: Date, default: null },
  progress: { type: Schema.Types.Mixed, default: null },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
