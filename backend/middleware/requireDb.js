import mongoose from 'mongoose';

// Curto-circuito para rotas que precisam do Mongo (register/login). MongoDB
// ainda não está conectado neste ambiente — sem este middleware, tentar usar
// um model do Mongoose sem conexão gera um erro confuso lá na frente em vez
// de uma resposta clara aqui.
export const requireDb = (req, res, next) =>
  mongoose.connection.readyState === 1
    ? next()
    : res.status(503).json({ error: 'Serviço de contas indisponível: banco de dados não configurado.' });
