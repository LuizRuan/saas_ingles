import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { conversations } from '../data/conversations';
import { verificarResposta } from '../utils/answerCheck';
import { useProgress } from '../hooks/useProgress';
import useSound from '../hooks/useSound';
import useSpeech from '../hooks/useSpeech';
import './Conversation.css';

// ATENÇÃO AO IDIOMA: esta é a única tela do app com a interface em inglês —
// decisão de produto, para o treino ser imersivo. As CORREÇÕES gramaticais
// continuam em português (vêm de answerCheck.js): explicar em inglês o erro de
// quem ainda não lê inglês não ensinaria nada.

const Conversation = () => {
  const [convo, setConvo] = useState(null);
  const [nodeId, setNodeId] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [completa, setCompleta] = useState(false);
  const [texto, setTexto] = useState('');
  const [resultado, setResultado] = useState(null);
  const [traduzirTudo, setTraduzirTudo] = useState(false);
  const [traduzidas, setTraduzidas] = useState(() => new Set());

  const entradaRef = useRef(null);
  const { completeConversation, handleCorrectAnswer, handleWrongAnswer } = useProgress();
  const { playClick, playCorrect, playWrong } = useSound();
  const { speakNormal, speakSlow, isAvailable: temVoz } = useSpeech();

  const noAtual = convo && nodeId ? convo.nodes[nodeId] : null;

  const iniciar = useCallback((escolhida) => {
    const inicial = escolhida.nodes[escolhida.start];
    setConvo(escolhida);
    setNodeId(escolhida.start);
    setHistorico([{ role: 'system', text: inicial.text, translation: inicial.translation }]);
    setCompleta(false);
    setResultado(null);
    setTexto('');
    setTraduzidas(new Set());
  }, []);

  const alternarTraducao = useCallback((i) => {
    setTraduzidas(prev => {
      const proximo = new Set(prev);
      if (proximo.has(i)) proximo.delete(i);
      else proximo.add(i);
      return proximo;
    });
  }, []);

  // `nota` sobrevive ao avanço: é como a correção de um "quase certo" continua
  // visível depois que a conversa já seguiu em frente.
  const avancar = useCallback((reply, nota = null) => {
    if (!convo) return;
    const proximo = convo.nodes[reply.next];
    if (!proximo) return;

    setHistorico(prev => [
      ...prev,
      { role: 'user', text: reply.text, translation: reply.translation },
      { role: 'system', text: proximo.text, translation: proximo.translation },
    ]);
    setNodeId(reply.next);
    setResultado(nota);
    setTexto('');

    // Nó sem respostas é o fim do diálogo
    if (!(proximo.replies || []).length) {
      setCompleta(true);
      completeConversation();
      playCorrect();
    }
  }, [convo, completeConversation, playCorrect]);

  const escolherOpcao = useCallback((reply) => {
    playClick();
    avancar(reply);
  }, [playClick, avancar]);

  const enviarTexto = useCallback((e) => {
    e.preventDefault();
    if (!noAtual || completa) return;

    const r = verificarResposta(texto, noAtual);

    if (r.status === 'certo') {
      playCorrect();
      handleCorrectAnswer(r.reply.text, 1);
      avancar(r.reply);
      return;
    }

    if (r.status === 'quase') {
      // Erro de digitação não trava o diálogo, mas a forma certa fica na tela
      playCorrect();
      handleCorrectAnswer(r.reply.text, 2);
      avancar(r.reply, r);
      return;
    }

    playWrong();
    // Só registra o erro quando dá para saber o que a pessoa tentava dizer.
    // Frase solta e irreconhecível não vira estatística de nada.
    if (r.correcao) handleWrongAnswer(r.correcao);
    setResultado(r);
    entradaRef.current?.focus();
  }, [noAtual, completa, texto, playCorrect, playWrong, handleCorrectAnswer, handleWrongAnswer, avancar]);

  // ---------------------------------------------------------------- seleção
  if (!convo) {
    return (
      <div className="page">
        <div className="container">
          <div className="text-center animate-fade-in-up" style={{ marginBottom: 'var(--space-2xl)' }}>
            <Link to="/" className="btn btn-ghost" style={{ marginBottom: 'var(--space-lg)' }}>← Voltar</Link>
            <h1>💬 Conversation Practice</h1>
            <p className="text-secondary" style={{ marginTop: 'var(--space-sm)' }}>
              Practice everyday dialogues in English. Pick a topic:
            </p>
          </div>
          <div className="convo-topics">
            {[...conversations].sort((a, b) => (a.level || 1) - (b.level || 1)).map((c) => (
              <button key={c.id} className="glass-card convo-topic-card" onClick={() => iniciar(c)}>
                <span className="convo-topic-icon">{c.icon}</span>
                <div className="convo-topic-body">
                  <h3>{c.topic}</h3>
                  <p className="text-secondary">{c.topicPt}</p>
                </div>
                <span className="badge badge-purple convo-topic-level">Level {c.level}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------ chat
  const opcoes = !completa && noAtual ? (noAtual.replies || []) : [];

  return (
    <div className="page">
      <div className="container game-container">
        <div className="game-header animate-fade-in">
          <div className="game-title">
            <button className="btn btn-ghost btn-sm" onClick={() => setConvo(null)} aria-label="Back to topics">←</button>
            <span className="icon">{convo.icon}</span>
            <h2>{convo.topic}</h2>
          </div>
          <button
            className={`btn btn-sm ${traduzirTudo ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setTraduzirTudo(v => !v)}
            aria-pressed={traduzirTudo}
          >
            🇧🇷 {traduzirTudo ? 'Hide translations' : 'Show translations'}
          </button>
        </div>

        <div className="chat-container" aria-live="polite">
          {historico.map((msg, i) => {
            const mostrarTraducao = traduzirTudo || traduzidas.has(i);
            return (
              <div key={i} className={`chat-bubble ${msg.role} animate-fade-in-up`}>
                <div className="chat-text">{msg.text}</div>

                {mostrarTraducao && <div className="chat-translation">{msg.translation}</div>}

                <div className="chat-actions">
                  {temVoz && (
                    <>
                      <button className="chat-action" onClick={() => speakNormal(msg.text)} aria-label="Listen">🔊</button>
                      <button className="chat-action" onClick={() => speakSlow(msg.text)} aria-label="Listen slowly">🐢</button>
                    </>
                  )}
                  <button
                    className="chat-action"
                    onClick={() => alternarTraducao(i)}
                    aria-pressed={mostrarTraducao}
                    aria-label="Translate"
                  >
                    🇧🇷
                  </button>
                </div>
              </div>
            );
          })}

          {completa && (
            <div className="chat-complete animate-bounce-in">
              <span style={{ fontSize: '2rem' }}>🎉</span>
              <h3>Conversation complete!</h3>
              <p className="text-secondary">
                Great job! Try it again and choose different answers — the dialogue changes.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => iniciar(convo)}>🔄 Play again</button>
                <button className="btn btn-secondary" onClick={() => setConvo(null)}>Another topic</button>
              </div>
            </div>
          )}
        </div>

        {!completa && opcoes.length > 0 && (
          <div className="chat-options animate-fade-in-up">
            <p className="chat-options-label">Choose a reply:</p>
            {opcoes.map((reply, i) => (
              <button key={i} className="chat-option glass-card" onClick={() => escolherOpcao(reply)}>
                <span>{reply.text}</span>
                {(traduzirTudo || resultado) && <span className="chat-option-pt">{reply.translation}</span>}
              </button>
            ))}

            <form onSubmit={enviarTexto} className="chat-input-form">
              <input
                ref={entradaRef}
                type="text"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="…or type your own reply in English"
                className="chat-input"
                aria-label="Type your reply in English"
                autoComplete="off"
              />
              <button type="submit" className="btn btn-primary btn-sm">Send</button>
            </form>
          </div>
        )}

        {/* Correção em português — de propósito, mesmo com a tela em inglês */}
        {resultado?.explicacaoPt && (
          <div className={`chat-feedback animate-fade-in-up ${resultado.status}`} role="status">
            <div className="chat-feedback-head">
              <span>{resultado.status === 'quase' ? '🟡' : '📝'}</span>
              <strong>{resultado.status === 'quase' ? 'Quase certo' : 'Vamos corrigir'}</strong>
            </div>
            <p className="chat-feedback-text">{resultado.explicacaoPt}</p>
            {resultado.correcao && (
              <div className="chat-feedback-fix">
                <span className="chat-feedback-en">{resultado.correcao}</span>
                {temVoz && (
                  <button className="chat-action" onClick={() => speakNormal(resultado.correcao)} aria-label="Listen">🔊</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversation;
