// Validação pura das telas de Login/Cadastro — sem DOM, testável como os demais
// utilitários. O backend (backend/utils/validators.js) tem sua própria versão
// destas mesmas 2-3 regras: duplicação deliberada, não descuido — backend é um
// pacote independente e compartilhar 2 regexes via workspace seria desproporcional.

// Regex pragmática, não um parser RFC 5322 completo — mesmo estilo de
// "normalizar e comparar" usado em answerCheck.js em vez de tentar cobrir every
// edge case do padrão.
export const isValidEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').trim());

// Mínimo de 8 caracteres, sem exigir maiúscula/número/símbolo — segue a diretriz
// atual do NIST 800-63B: regras de composição empurram para substituições
// previsíveis ("Senha1!"); o que protege de verdade é o custo do bcrypt no
// servidor, não teatro de regras no cliente.
export const MIN_PASSWORD_LENGTH = 8;
export const isValidPassword = (password) => String(password ?? '').length >= MIN_PASSWORD_LENGTH;

export const passwordsMatch = (password, confirmation) => password === confirmation && password !== '';

// Domínios sugeridos ao digitar o e-mail, em ordem aproximada de frequência
// para um público pt-BR (internacionais mais comuns + dois grandes provedores
// brasileiros).
export const EMAIL_DOMAIN_SUGGESTIONS = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com.br',
  'icloud.com',
  'live.com',
  'uol.com.br',
  'bol.com.br',
];

// Sugestões de domínio conforme o usuário digita depois do "@".
//
// Só sugere depois de EXATAMENTE um "@": antes disso a lista atrapalharia quem
// ainda está digitando a parte local do e-mail, e um segundo "@" já é inválido
// e não deve sugerir nada. Fragmento vazio (usuário acabou de digitar "@") casa
// com startsWith em qualquer domínio, então devolve a lista inteira até `max`.
export const getDomainSuggestions = (value, domains = EMAIL_DOMAIN_SUGGESTIONS, max = 5) => {
  const texto = String(value ?? '');
  const arrobas = texto.split('@').length - 1;
  if (arrobas !== 1) return [];

  const fragmento = texto.slice(texto.indexOf('@') + 1).toLowerCase();
  return domains.filter(d => d.startsWith(fragmento)).slice(0, max);
};

// Substitui tudo depois do "@" pelo domínio escolhido, mantendo a parte local
// que o usuário já tinha digitado.
export const applyEmailDomain = (email, domain) => email.slice(0, email.indexOf('@') + 1) + domain;
