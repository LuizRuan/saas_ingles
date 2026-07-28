import mongoose from 'mongoose';

const { Schema } = mongoose;

// Só o necessário para autenticação — sem campo de nome/perfil, que o fluxo de
// login/cadastro não usa. Fácil de acrescentar quando houver uma tela que
// precise disso.
const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
