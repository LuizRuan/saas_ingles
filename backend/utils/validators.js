// Validação manual, não express-validator: são só 2 regras (formato de e-mail,
// tamanho mínimo de senha), e puxar uma dependência inteira para isso seria
// desproporcional.
//
// Estas regras DUPLICAM propositalmente as de src/utils/authValidation.js no
// frontend — o backend é um pacote independente (ver README.md), e
// compartilhar 2 regexes via workspace custaria mais complexidade do que
// economiza. Se uma mudar, a outra precisa mudar também; não é descuido, está
// documentado aqui e lá.

export const isValidEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').trim());

export const MIN_PASSWORD_LENGTH = 8;
export const isValidPassword = (password) => String(password ?? '').length >= MIN_PASSWORD_LENGTH;
