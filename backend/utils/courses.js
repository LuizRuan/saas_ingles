// Cursos que o servidor reconhece.
//
// Duplicado de propósito do frontend (src/data/index.js), no mesmo espírito de
// backend/utils/validators.js: o backend é um pacote independente e não importa
// nada de src/. A lista é curta e muda raramente; o custo de duplicar é menor
// que o de acoplar os dois pacotes.
//
// O USO CRÍTICO é de segurança: o id do curso chega por query string e vira
// parte de um CAMINHO DE CAMPO do Mongo ('progress.courseStats.<id>...').
// Interpolar entrada do usuário direto num caminho de campo permite que ela
// aponte a consulta para qualquer lugar do documento. Passar por esta lista
// primeiro é o que impede isso — nunca construa o caminho sem `resolveCourseId`.
export const COURSE_IDS = ['en-pt', 'es-pt'];

export const DEFAULT_COURSE = 'en-pt';

/** Devolve um id de curso seguro para usar em caminho de campo, ou o padrão. */
export const resolveCourseId = (raw) =>
  COURSE_IDS.includes(raw) ? raw : DEFAULT_COURSE;
