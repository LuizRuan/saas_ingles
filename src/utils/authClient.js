// Cliente fino para as rotas de autenticação do backend.
//
// Caminhos RELATIVOS de propósito ("/api/auth/..."), nunca uma URL absoluta do
// Render: a CSP em vercel.json é `connect-src 'self'` e bloquearia um fetch
// cross-origin antes mesmo do CORS entrar em cena. Em dev, vite.config.js faz
// proxy de /api para o backend local; em produção, um rewrite do Vercel fará
// o mesmo (server-to-server, invisível para o navegador) — nenhum dos dois
// lados precisa mudar quando isso for ligado.
//
// Sem backend rodando, toda chamada aqui rejeita com TypeError de rede — as
// páginas tratam isso com uma mensagem genérica em vez de deixar a tela quebrar.

async function postAuth(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Necessário para o cookie httpOnly de sessão ir e voltar
    credentials: 'include',
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro inesperado. Tente novamente.');
  return data;
}

export const registerRequest = (email, password) =>
  postAuth('/api/auth/register', { email, password });

// Cadastro já retorna o cookie de sessão (registrar = criar + logar em um
// passo), então quem chama isto pode navegar direto para "/" sem exigir um
// segundo login logo em seguida.
export const loginRequest = (email, password) =>
  postAuth('/api/auth/login', { email, password });
