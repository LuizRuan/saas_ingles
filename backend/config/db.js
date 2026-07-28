import mongoose from 'mongoose';
import { env } from './env.js';

// Conecta SÓ se MONGODB_URI existir. Sem isso, loga um aviso claro e retorna
// — server.js chama app.listen() de qualquer forma, então o processo sobe com
// sucesso nos dois casos, em vez de travar tentando conectar ou cair sem
// explicação. MongoDB é um passo futuro deste projeto (ver README.md).
export const connectDb = async () => {
  if (!env.mongoUri) {
    console.warn('[db] MONGODB_URI não definido — subindo sem banco de dados. ' +
      'Rotas que dependem de conta (register/login) responderão 503.');
    return;
  }

  try {
    await mongoose.connect(env.mongoUri);
    console.log('[db] Conectado ao MongoDB.');
  } catch (err) {
    console.error('[db] Falha ao conectar ao MongoDB:', err.message);
  }
};
