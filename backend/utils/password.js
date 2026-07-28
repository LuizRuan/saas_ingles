import bcrypt from 'bcryptjs';

// bcryptjs (JS puro), não `bcrypt`: o pacote nativo exige binding compilado
// via node-gyp, sem garantia de toolchain de build em toda máquina de
// desenvolvimento nem de binário pré-compilado batendo com a imagem de build
// do Render. Custo hoje irrelevante (sem tráfego real ainda).
//
// 12 rounds — piso atual recomendado pela OWASP (acima do default histórico
// de 10).
const SALT_ROUNDS = 12;

export const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);
export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);
