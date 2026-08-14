import 'dotenv/config';
import http from 'http';
import { app } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { attachRealtime } from './realtime/index.js';

// app.js nunca chama .listen() — aqui é montado o http.Server bruto que tanto
// o Express quanto o Socket.IO (para o duelo em tempo real) compartilham.
const httpServer = http.createServer(app);
attachRealtime(httpServer);

// httpServer.listen() acontece independentemente do resultado de connectDb() —
// o processo precisa subir com sucesso mesmo sem MONGODB_URI configurado (ver
// config/db.js), respondendo 503 apenas nas rotas que realmente precisam do
// banco, em vez de travar ou cair de forma opaca. O duelo em tempo real não
// depende de banco nenhum, então funciona mesmo sem Mongo.
await connectDb();

httpServer.listen(env.port, () => {
  console.log(`[server] Wordly API ouvindo na porta ${env.port} (${env.isProduction ? 'production' : 'development'})`);
});
