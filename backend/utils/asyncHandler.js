// Express 4 (usado aqui) não encaminha rejeições de handler assíncrono para o
// errorHandler sozinho — sem isto, um erro dentro de register/login viraria
// uma promise rejeitada sem tratamento em vez de cair no middleware de erro.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
