import { Component } from 'react';
import { ehFalhaDeCarregamento } from '../../utils/chunkError';

/**
 * Rede de segurança para erros de renderização.
 *
 * Existe por dois motivos concretos:
 *
 * 1. Sem ela, um erro em QUALQUER componente derruba a árvore inteira e a
 *    pessoa fica com uma página em branco, sem mensagem e sem saída. Já
 *    aconteceu neste projeto: uma chamada a uma ação que não existia
 *    (`addCoins`) quebrava o app inteiro toda vez que uma partida terminava.
 *
 * 2. As rotas agora são carregadas sob demanda (`lazy` em App.jsx), e isso cria
 *    um modo de falha novo e comum: a pessoa abre o site, um deploy novo sai, e
 *    o pedaço de JS que a aba dela conhece deixa de existir no servidor. O
 *    `import()` rejeita e o React joga o erro aqui. Nesse caso específico
 *    recarregar resolve de verdade, então recarregamos — uma vez só, com
 *    trava em sessionStorage, porque um recarregamento automático sem trava
 *    vira um laço infinito se a causa for outra.
 *
 * Precisa ser classe: `componentDidCatch`/`getDerivedStateFromError` não têm
 * equivalente em hook.
 */

const CHAVE_RECARGA = 'englishplay_chunk_reload';

class ErrorBoundary extends Component {
  state = { erro: null };

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    // Não engolir: sem isto o erro real some e sobra só a tela amigável, que é
    // o pior cenário para depurar.
    console.error('[ErrorBoundary]', erro, info?.componentStack);

    if (ehFalhaDeCarregamento(erro)) {
      let jaTentou = false;
      try {
        jaTentou = sessionStorage.getItem(CHAVE_RECARGA) === '1';
        sessionStorage.setItem(CHAVE_RECARGA, '1');
      } catch {
        // Navegador em modo privado pode barrar sessionStorage. Sem a trava,
        // é mais seguro NÃO recarregar do que arriscar o laço.
        jaTentou = true;
      }
      if (!jaTentou) window.location.reload();
    }
  }

  recarregar = () => {
    try {
      sessionStorage.removeItem(CHAVE_RECARGA);
    } catch { /* segue mesmo assim */ }
    window.location.reload();
  };

  render() {
    if (!this.state.erro) return this.props.children;

    const falhaDeRede = ehFalhaDeCarregamento(this.state.erro);

    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 520, textAlign: 'center', paddingTop: 'var(--space-3xl)' }}>
          <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }} aria-hidden="true">
              {falhaDeRede ? '📡' : '😕'}
            </div>
            <h2 style={{ marginBottom: 'var(--space-sm)' }}>
              {falhaDeRede ? 'Não conseguimos carregar esta tela' : 'Algo deu errado'}
            </h2>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
              {falhaDeRede
                ? 'Parece problema de conexão. Seu progresso está salvo — é só tentar de novo.'
                : 'Seu progresso está salvo. Recarregue a página para continuar de onde parou.'}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={this.recarregar}>🔄 Recarregar</button>
              <a className="btn btn-secondary" href="/">🏠 Ir para o início</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
