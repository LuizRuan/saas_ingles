import { env } from '../config/env.js';

/**
 * A permissao administrativa vive somente no servidor. O frontend recebe
 * apenas o resultado booleano e nunca decide sozinho quem e administrador.
 */
export const isAdminEmail = (email) => {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  return Boolean(normalizedEmail && env.adminEmails.includes(normalizedEmail));
};

