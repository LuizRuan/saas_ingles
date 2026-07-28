// Leitor central de variáveis de ambiente. Nada mais no backend deve ler
// `process.env` diretamente — assim há um único lugar para saber o que existe
// e quais faltas são toleradas.

const DEV_JWT_SECRET_FALLBACK = 'dev-only-insecure-secret-nao-use-em-producao';

const isProduction = process.env.NODE_ENV === 'production';

// Falha alto SÓ em produção sem segredo — em dev, cai num valor claramente
// marcado como inseguro para o `npm run dev` subir limpo antes de existir
// segredo real configurado.
const jwtSecret = process.env.JWT_SECRET || (isProduction ? null : DEV_JWT_SECRET_FALLBACK);
if (!jwtSecret) {
  throw new Error('JWT_SECRET é obrigatório em produção (NODE_ENV=production) e não foi definido.');
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || null,
  jwtSecret,
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  isProduction,
};
