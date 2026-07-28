import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { conversations } from '../data/conversations';
import { useProgress } from '../hooks/useProgress';
import useSound from '../hooks/useSound';
import './Conversation.css';

const Conversation = () => {
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [convoComplete, setConvoComplete] = useState(false);
  const [freeText, setFreeText] = useState('');
  const { completeConversation } = useProgress();
  const { playClick, playCorrect } = useSound();

  const startConversation = useCallback((convo) => {
    setSelectedConvo(convo);
    setMessageIndex(0);
    setChatHistory([{ role: 'system', text: convo.messages[0].text, translation: convo.messages[0].translation }]);
    setConvoComplete(false);
  }, []);

  const handleResponse = useCallback((option) => {
    if (!selectedConvo) return;
    playClick();
    
    const newHistory = [...chatHistory, { role: 'user', text: option.text, translation: option.translation }];
    
    // Find next system message
    let nextIdx = messageIndex + 2; // Skip user options, go to next system message
    
    if (nextIdx < selectedConvo.messages.length) {
      const nextMsg = selectedConvo.messages[nextIdx];
      newHistory.push({ role: 'system', text: nextMsg.text, translation: nextMsg.translation });
      setMessageIndex(nextIdx);
    } else {
      // Conversation complete
      setConvoComplete(true);
      completeConversation();
      playCorrect();
    }
    
    setChatHistory(newHistory);
  }, [selectedConvo, chatHistory, messageIndex, playClick, playCorrect, completeConversation]);

  const handleFreeTextSubmit = useCallback((e) => {
    e.preventDefault();
    if (!freeText.trim()) return;
    
    const currentOptions = selectedConvo.messages[messageIndex + 1]?.options;
    if (currentOptions) {
      // Find closest match or accept any
      const match = currentOptions.find(o => o.text.toLowerCase().includes(freeText.toLowerCase().trim()));
      handleResponse(match || currentOptions[0]);
    }
    setFreeText('');
  }, [freeText, selectedConvo, messageIndex, handleResponse]);

  const getCurrentOptions = () => {
    if (!selectedConvo || convoComplete) return null;
    const optionsMsg = selectedConvo.messages[messageIndex + 1];
    if (optionsMsg?.role === 'user') return optionsMsg.options;
    return null;
  };

  // Topic selection
  if (!selectedConvo) {
    return (
      <div className="page">
        <div className="container">
          <div className="text-center animate-fade-in-up" style={{ marginBottom: 'var(--space-2xl)' }}>
            <Link to="/" className="btn btn-ghost" style={{ marginBottom: 'var(--space-lg)' }}>← Voltar</Link>
            <h1>💬 Treino de Conversação</h1>
            <p className="text-secondary" style={{ marginTop: 'var(--space-sm)' }}>
              Pratique diálogos do dia a dia em inglês. Escolha um tema:
            </p>
          </div>
          <div className="convo-topics">
            {conversations.map((convo) => (
              <button key={convo.id} className="glass-card convo-topic-card" onClick={() => startConversation(convo)}>
                <span style={{ fontSize: '2rem' }}>{convo.icon}</span>
                <div>
                  <h3>{convo.topicPt}</h3>
                  <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>{convo.topic}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const options = getCurrentOptions();

  return (
    <div className="page">
      <div className="container game-container">
        <div className="game-header animate-fade-in">
          <div className="game-title">
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedConvo(null)}>←</button>
            <span className="icon">{selectedConvo.icon}</span>
            <h2>{selectedConvo.topicPt}</h2>
          </div>
        </div>

        {/* Chat */}
        <div className="chat-container">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role} animate-fade-in-up`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="chat-text">{msg.text}</div>
              <div className="chat-translation">{msg.translation}</div>
            </div>
          ))}

          {convoComplete && (
            <div className="chat-complete animate-bounce-in">
              <span style={{ fontSize: '2rem' }}>🎉</span>
              <h3>Conversa concluída!</h3>
              <p className="text-secondary">Ótimo trabalho praticando essa conversa!</p>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => startConversation(selectedConvo)}>🔄 Repetir</button>
                <button className="btn btn-secondary" onClick={() => setSelectedConvo(null)}>Outro tema</button>
              </div>
            </div>
          )}
        </div>

        {/* Response options */}
        {options && !convoComplete && (
          <div className="chat-options animate-fade-in-up">
            <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-sm)' }}>
              Escolha uma resposta:
            </p>
            {options.map((option, i) => (
              <button key={i} className="chat-option glass-card" onClick={() => handleResponse(option)}>
                <span>{option.text}</span>
                <span className="chat-option-pt">{option.translation}</span>
              </button>
            ))}
            
            {/* Free text input */}
            <form onSubmit={handleFreeTextSubmit} className="chat-input-form">
              <input
                type="text"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Ou digite sua resposta em inglês..."
                className="chat-input"
              />
              <button type="submit" className="btn btn-primary btn-sm">Enviar</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversation;
