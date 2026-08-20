import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { shuffleArray } from '../data/words';
import useCourseData from '../hooks/useCourseData';
import { AVAILABLE_COURSES } from '../data/index';
import { useProgress } from '../hooks/useProgress';
import { getWordsToReview, getPhrasesToReview } from '../utils/reviewSystem';
import useSound from '../hooks/useSound';
import WordExplanation from '../components/Game/WordExplanation';

// Normaliza para comparação: lowercase, sem pontuação nas pontas, trim.
const normalize = (s) =>
  s.trim().toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');

const ReviewErrors = () => {
  const { progress, handleCorrectAnswer, handleWrongAnswer, incrementReviewed } = useProgress();
  const { words, sentences: courseSentences, fillBlanks: courseFillBlanks,
          translationQuizzes: courseTranslationQuizzes } = useCourseData();
  const { playCorrect, playWrong } = useSound();

  const courseName = AVAILABLE_COURSES.find(c => c.id === progress.activeCourse)?.targetName || 'Inglês';

  // === PALAVRAS (quiz de múltipla escolha — não muda) ===
  const [reviewWords] = useState(() => getWordsToReview(progress, words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selected, setSelected] = useState(null);

  // === FRASES (quiz de digitação — novo) ===
  const [phraseQueue, setPhraseQueue] = useState(() => getPhrasesToReview(progress));
  const [phraseFeedback, setPhraseFeedback] = useState(null); // null | 'correct' | 'wrong'

  const currentPhrase = phraseQueue[0] || null;
  const totalPhrases = useMemo(() => getPhrasesToReview(progress).length, []);
  const phrasesReviewed = totalPhrases - phraseQueue.length;

  // --- Handlers de PALAVRA (inalterado) ---
  const current = reviewWords[currentIndex];
  const options = useMemo(() => {
    if (!current) return [];
    const wrong = shuffleArray(words.filter(w => w.en !== current.en)).slice(0, 3);
    return shuffleArray([current, ...wrong]);
  }, [current]);

  const handleAnswer = useCallback((option) => {
    if (feedback) return;
    setSelected(option);
    if (option.en === current.en) {
      setFeedback('correct');
      handleCorrectAnswer(current.en, 1);
      incrementReviewed();
      playCorrect();
    } else {
      setFeedback('wrong');
      handleWrongAnswer(current.en);
      playWrong();
    }
  }, [feedback, current, handleCorrectAnswer, handleWrongAnswer, incrementReviewed, playCorrect, playWrong]);

  const nextWord = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
    setFeedback(null);
    setSelected(null);
  }, []);

  // --- Handlers de FRASE (quiz de tradução — corrigido) ---
  // O modelo anterior tentava esconder uma palavra da frase e pedir pra
  // preencher, mas phraseStats guarda chaves que podem ser palavras soltas
  // ("tired") ou frases curtas — esconder a única palavra dá "____" sem
  // contexto nenhum, e os distratores misturavam português com inglês.
  //
  // Agora funciona como quiz de tradução: mostra o texto em português e pede
  // pra escolher a opção correta em inglês (ou vice-versa, conforme o dado).



  // Monta um mapa rápido de tradução a partir de todas as fontes de conteúdo
  // disponíveis: banco de palavras, frases, fillBlanks, translationQuizzes.
  const translationMap = useMemo(() => {
    const map = new Map(); // chave normalizada (en) → { en, pt }

    // Banco de palavras (word.en → word.pt)
    for (const w of words) {
      map.set(normalize(w.en), { en: w.en, pt: w.pt });
    }

    // Frases (sentences) — { en, pt } ou { text, translation }
    for (const s of (courseSentences || [])) {
      const en = s.en || s.text;
      const pt = s.pt || s.translation;
      if (en && pt) map.set(normalize(en), { en, pt });
    }

    // Fill blanks — { sentence, fullSentence, answer, translation, ... }
    // phraseStats pode guardar tanto a frase com lacuna quanto a completa.
    for (const fb of (courseFillBlanks || [])) {
      if (fb.fullSentence && fb.translation) {
        map.set(normalize(fb.fullSentence), { en: fb.fullSentence, pt: fb.translation });
      }
      if (fb.sentence && fb.translation) {
        map.set(normalize(fb.sentence), { en: fb.sentence, pt: fb.translation });
      }
    }

    // Translation quizzes — { direction, question, correct }
    // direction='en-pt': question é em inglês, correct é em português
    // direction='pt-en': question é em português, correct é em inglês
    for (const tq of (courseTranslationQuizzes || [])) {
      if (tq.question && tq.correct) {
        if (tq.direction === 'pt-en') {
          map.set(normalize(tq.correct), { en: tq.correct, pt: tq.question });
        } else {
          map.set(normalize(tq.question), { en: tq.question, pt: tq.correct });
        }
      }
    }

    return map;
  }, [words, courseSentences, courseFillBlanks, courseTranslationQuizzes]);

  // Para cada frase, gera um quiz de tradução com 4 opções no mesmo idioma.
  const phraseQuiz = useMemo(() => {
    if (!currentPhrase) return null;

    const key = normalize(currentPhrase.text);
    const pair = translationMap.get(key);

    if (pair) {
      // Encontrou tradução: mostra o PT e pede pra escolher o EN correto
      const answer = pair.en;

      // Distratores: outras traduções EN do mesmo tipo
      const allOptions = [...translationMap.values()]
        .map(v => v.en)
        .filter(en => normalize(en) !== normalize(answer));
      const distractors = shuffleArray(allOptions).slice(0, 3);

      return {
        prompt: pair.pt,
        promptLabel: `Qual é a tradução em ${courseName.toLowerCase()} de:`,
        answer,
        options: shuffleArray([answer, ...distractors]),
      };
    }

    // Sem tradução encontrada: mostra o texto original e pede pra escolher
    // a tradução correta entre opções em português (fallback razoável).
    // Tenta achar se o texto é um PT e a tradução está invertida.
    let invertedPair = null;
    for (const [, v] of translationMap) {
      if (normalize(v.pt) === key) { invertedPair = v; break; }
    }

    if (invertedPair) {
      const answer = invertedPair.pt;
      const allOptions = [...translationMap.values()]
        .map(v => v.pt)
        .filter(pt => normalize(pt) !== normalize(answer));
      const distractors = shuffleArray(allOptions).slice(0, 3);

      return {
        prompt: invertedPair.en,
        promptLabel: 'Qual é a tradução em português de:',
        answer,
        options: shuffleArray([answer, ...distractors]),
      };
    }

    // Último fallback: mostra o texto e pede pra reconhecer entre opções
    // geradas do próprio phraseQueue (todas no mesmo idioma).
    const answer = currentPhrase.text;
    const otherPhrases = phraseQueue
      .filter(p => normalize(p.text) !== normalize(answer))
      .map(p => p.text);
    const distractors = shuffleArray(otherPhrases).slice(0, 3);

    // Complementa com palavras do banco se faltar distratores
    const fallbackEn = shuffleArray(words.map(w => w.en)).filter(
      en => normalize(en) !== normalize(answer) && !distractors.some(d => normalize(d) === normalize(en))
    );
    while (distractors.length < 3 && fallbackEn.length > 0) {
      distractors.push(fallbackEn.shift());
    }

    return {
      prompt: answer,
      promptLabel: 'Qual destas é a tradução correta?',
      answer,
      options: shuffleArray([answer, ...distractors]),
    };
  }, [currentPhrase, translationMap, phraseQueue, words]);

  const [phraseSelected, setPhraseSelected] = useState(null);

  const handlePhraseAnswer = useCallback((option) => {
    if (phraseFeedback) return;
    setPhraseSelected(option);

    const correct = normalize(option) === normalize(phraseQuiz.answer);
    if (correct) {
      setPhraseFeedback('correct');
      handleCorrectAnswer(currentPhrase.text, 1);
      incrementReviewed();
      playCorrect();
    } else {
      setPhraseFeedback('wrong');
      handleWrongAnswer(currentPhrase.text);
      playWrong();
    }
  }, [phraseFeedback, phraseQuiz, currentPhrase, handleCorrectAnswer, handleWrongAnswer, incrementReviewed, playCorrect, playWrong]);

  const nextPhrase = useCallback(() => {
    if (phraseFeedback === 'correct') {
      setPhraseQueue(prev => prev.slice(1));
    } else {
      setPhraseQueue(prev => [...prev.slice(1), prev[0]]);
    }
    setPhraseFeedback(null);
    setPhraseSelected(null);
  }, [phraseFeedback]);

  // === TELA: Nenhuma revisão pendente ===
  if (reviewWords.length === 0 && phraseQueue.length === 0 && currentIndex === 0) {
    return (
      <div className="page">
        <div className="container game-container text-center animate-fade-in-up">
          <div className="glass-card" style={{ padding: 'var(--space-2xl)' }}>
            <span style={{ fontSize: '4rem' }}>🎉</span>
            <h2 style={{ margin: 'var(--space-md) 0' }}>Nenhuma revisão pendente!</h2>
            <p className="text-secondary">Continue jogando para encontrar novas palavras para revisar.</p>
            <Link to="/games" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>🎮 Ir para os jogos</Link>
          </div>
        </div>
      </div>
    );
  }

  // === TELA: Quiz de PALAVRAS (múltipla escolha — inalterado) ===
  if (currentIndex < reviewWords.length) {
    return (
      <div className="page">
        <div className="container game-container">
          <div className="game-header animate-fade-in">
            <div className="game-title">
              <Link to="/" className="btn btn-ghost btn-sm">←</Link>
              <span className="icon">🔄</span>
              <h2>Revisar Erros</h2>
            </div>
            <div className="game-score">
              <div className="game-score-item"><span>📝</span> <span className="value">{currentIndex + 1}/{reviewWords.length}</span></div>
            </div>
          </div>

          <div className="progress-bar" style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="progress-bar-fill" style={{ width: `${(currentIndex / reviewWords.length) * 100}%` }}></div>
          </div>

          <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-xl)', textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-sm)' }}>Qual é a tradução de:</p>
            <p style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--accent-purple-light)' }}>{current.pt}</p>
            {progress.wordStats[current.en] && (
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
                Erros anteriores: {progress.wordStats[current.en].wrong}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {options.map((opt, i) => {
              let style = {};
              if (feedback && opt.en === current.en) style = { background: 'rgba(16,185,129,0.15)', borderColor: 'var(--accent-green)' };
              else if (feedback && opt === selected) style = { background: 'rgba(239,68,68,0.1)', borderColor: 'var(--accent-red)' };
              
              return (
                <button key={i} className="btn btn-secondary" style={{ padding: 'var(--space-md)', justifyContent: 'flex-start', ...style }}
                  onClick={() => handleAnswer(opt)} disabled={!!feedback}>
                  {opt.en}
                </button>
              );
            })}
          </div>

          {feedback && (
            <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-lg)' }}>
              <p style={{ textAlign: 'center', fontWeight: 600, marginBottom: 'var(--space-md)',
                color: feedback === 'correct' ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                {feedback === 'correct' ? '✅ Correto!' : '❌ Errar faz parte do aprendizado!'}
              </p>
              <WordExplanation word={current} />
              <button className="btn btn-primary" onClick={nextWord} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
                Próxima →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === TELA: Quiz de FRASES (tradução — corrigido) ===
  if (phraseQueue.length > 0 && currentPhrase && phraseQuiz) {
    return (
      <div className="page">
        <div className="container game-container">
          <div className="game-header animate-fade-in">
            <div className="game-title">
              <Link to="/" className="btn btn-ghost btn-sm">←</Link>
              <span className="icon">💬</span>
              <h2>Revisar Frases</h2>
            </div>
            <div className="game-score">
              <div className="game-score-item"><span>📝</span> <span className="value">{phrasesReviewed}/{totalPhrases}</span></div>
            </div>
          </div>

          <div className="progress-bar" style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="progress-bar-fill" style={{ width: `${(phrasesReviewed / totalPhrases) * 100}%` }}></div>
          </div>

          <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-xl)', textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-sm)' }}>
              {phraseQuiz.promptLabel}
            </p>
            <p style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--accent-purple-light)' }}>
              {phraseQuiz.prompt}
            </p>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
              Errada {currentPhrase.wrong}x
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {phraseQuiz.options.map((opt, i) => {
              let style = {};
              if (phraseFeedback && normalize(opt) === normalize(phraseQuiz.answer)) {
                style = { background: 'rgba(16,185,129,0.15)', borderColor: 'var(--accent-green)' };
              } else if (phraseFeedback && opt === phraseSelected) {
                style = { background: 'rgba(239,68,68,0.1)', borderColor: 'var(--accent-red)' };
              }

              return (
                <button
                  key={i}
                  className="btn btn-secondary"
                  style={{ padding: 'var(--space-md)', justifyContent: 'flex-start', ...style }}
                  onClick={() => handlePhraseAnswer(opt)}
                  disabled={!!phraseFeedback}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {phraseFeedback && (
            <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-lg)' }}>
              <p style={{
                textAlign: 'center', fontWeight: 600, marginBottom: 'var(--space-md)',
                color: phraseFeedback === 'correct' ? 'var(--accent-green)' : 'var(--accent-orange)'
              }}>
                {phraseFeedback === 'correct'
                  ? '✅ Correto!'
                  : '❌ Errar faz parte do aprendizado!'}
              </p>

              {phraseFeedback === 'wrong' && (
                <div className="glass-card" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-md)', textAlign: 'center' }}>
                  <p className="text-secondary" style={{ fontSize: 'var(--fs-xs)', marginBottom: '4px' }}>A resposta correta é:</p>
                  <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--accent-green)' }}>
                    {phraseQuiz.answer}
                  </p>
                  <p className="text-secondary" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--space-sm)' }}>
                    Essa frase vai voltar para você tentar de novo.
                  </p>
                </div>
              )}

              <button className="btn btn-primary" onClick={nextPhrase} style={{ width: '100%' }}>
                {phraseFeedback === 'correct' ? 'Próxima →' : 'Tentar de novo →'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === TELA: Revisão concluída ===
  return (
    <div className="page">
      <div className="container game-container text-center animate-bounce-in">
        <div className="glass-card" style={{ padding: 'var(--space-2xl)' }}>
          <span style={{ fontSize: '4rem' }}>✅</span>
          <h2 style={{ margin: 'var(--space-md) 0' }}>Revisão Concluída!</h2>
          <p className="text-secondary">
            Você revisou {reviewWords.length > 0 ? `${reviewWords.length} palavra${reviewWords.length === 1 ? '' : 's'}` : ''}
            {reviewWords.length > 0 && totalPhrases > 0 ? ' e ' : ''}
            {totalPhrases > 0 ? `${totalPhrases} frase${totalPhrases === 1 ? '' : 's'}` : ''}.
            Continue praticando!
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
            <Link to="/" className="btn btn-primary">← Ir para o Início</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewErrors;

