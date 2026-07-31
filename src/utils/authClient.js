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

async function callAuth(path, { method = 'POST', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    // Necessário para o cookie httpOnly de sessão ir e voltar
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro inesperado. Tente novamente.');
  return data;
}

const postAuth = (path, body) => callAuth(path, { method: 'POST', body });

export const registerRequest = (email, password) =>
  postAuth('/api/auth/register', { email, password });

// Cadastro já retorna o cookie de sessão (registrar = criar + logar em um
// passo), então quem chama isto pode navegar direto para "/" sem exigir um
// segundo login logo em seguida.
export const loginRequest = (email, password) =>
  postAuth('/api/auth/login', { email, password });

// Limpa o cookie de sessão no servidor. Diferente das outras duas, esta NUNCA
// rejeita: quem chama está saindo, e travar a saída porque o backend não
// respondeu deixaria a pessoa presa dentro do app. O backend não precisa de
// banco para esta rota, mas hoje ele nem está no ar — e mesmo assim o "Sair"
// tem de funcionar, porque a parte que importa no cliente (a escolha de
// entrada, em entryChoice.js) é local.
export const logoutRequest = async () => {
  try {
    await postAuth('/api/auth/logout', {});
  } catch { /* sair é sempre permitido */ }
};

// { email, nickname } de quem está logado. Usado pela tela de Perfil (dentro
// de Configurações) para mostrar o estado real da conta, em vez de confiar só
// na escolha local salva em entryChoice.js.
export const getProfileRequest = () => callAuth('/api/auth/profile', { method: 'GET' });

export const updateProfileRequest = (nickname) =>
  callAuth('/api/auth/profile', { method: 'PATCH', body: { nickname } });
