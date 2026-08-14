import { Link } from 'react-router-dom';

// Rota coringa (ver App.jsx, path="*"). Sem isto, uma URL digitada errado ou
// um link quebrado caía numa tela em branco: o EntryGate já deixa passar quem
// já entrou, e sem Route nenhuma casando o React Router não renderiza nada —
// só a navbar do Layout ficava de pé, sem nenhuma pista do que houve.
const NotFound = () => (
  <div className="page">
    <div className="container" style={{ maxWidth: 480 }}>
      <div className="text-center animate-fade-in-up" style={{ paddingTop: 'var(--space-3xl)' }}>
        <span style={{ fontSize: '3rem' }}>🧭</span>
        <h1 style={{ marginTop: 'var(--space-md)' }}>Página não encontrada</h1>
        <p className="text-secondary" style={{ marginTop: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
          Esse endereço não existe no Wordly. Talvez o link esteja quebrado ou a URL tenha um erro de digitação.
        </p>
        <Link to="/" className="btn btn-primary">🏠 Voltar para o início</Link>
      </div>
    </div>
  </div>
);

export default NotFound;
