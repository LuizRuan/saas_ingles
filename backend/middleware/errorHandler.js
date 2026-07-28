// Último middleware montado (4 argumentos = Express reconhece como handler de
// erro). Loga o detalhe no servidor, responde só com o status que o
// controller anexou (Object.assign(new Error(...), { status })) e uma
// mensagem genérica — nunca vaza stack trace para o cliente.
export const errorHandler = (err, req, res, _next) => {
  console.error(`[error] ${req.method} ${req.path}:`, err);
  const status = err.status || 500;
  const message = status === 500 ? 'Erro interno do servidor.' : err.message;
  res.status(status).json({ error: message });
};
