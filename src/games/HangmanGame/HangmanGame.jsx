import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { shuffleArray } from '../../data/words';
import { categories } from '../../data/categories';
import { useProgress } from '../../hooks/useProgress';
import useCourseData from '../../hooks/useCourseData';
import useSound from '../../hooks/useSound';
import useSpeech from '../../hooks/useSpeech';
import WordExplanation from '../../components/Game/WordExplanation';
import './HangmanGame.css';

const MAX_WRONG = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Categorias que fazem sentido no jogo (as abstratas — verbos, sentimentos,
// perguntas — não dão uma palavra boa pra adivinhar letra a letra).
const CATEGORIAS_DO_JOGO = ['animais', 'comidas', 'cores', 'familia', 'casa', 'escola', 'corpo', 'roupas', 'bebidas', 'cumprimentos', 'numeros'];

// Uma palavra é jogável se dá pra adivinhar: 3+ letras e sem espaço.
const jogaveisDe = (words, catId) =>
  words.filter(w => w.category === catId && w.en.length >= 3 && !w.en.includes(' '));

const tipPtMap = {
  "Dog": "Tem sido nosso companheiro leal há 15.000 anos. Um único farejo diz mais a ele sobre você do que qualquer documento de identidade.",
  "Cat": "Os antigos egípcios o adoravam como divino. Ele consegue se desvirar no ar e sempre cai em pé da mesma forma.",
  "Bird": "A maioria das criaturas da sua classe domina os céus, embora duas famosas — o pinguim e a avestruz — nunca saiam do chão.",
  "Fish": "Passa a vida inteira respirando algo em que outras criaturas se afogariam. Seu plural em inglês é idêntico ao singular.",
  "Horse": "Antes dos motores existirem, seu nome se tornou a unidade usada para medir a potência deles.",
  "Cow": "Seu estômago tem quatro compartimentos e ele mastiga por até oito horas por dia. Civilizações inteiras construíram sua riqueza ao redor dele.",
  "Pig": "Ao contrário de sua reputação, é um dos animais de fazenda mais limpos. Rolar na lama é apenas como ele regula sua temperatura.",
  "Chicken": "Cruzou a estrada muito antes de alguém perguntar o porquê. Tanto sua forma de ovo quanto sua forma adulta estrelam frases famosas em inglês.",
  "Duck": "Suas penas repelem água como se fossem enceradas. A frase 'como água nas costas de um pato' significa críticas que simplesmente não pegam.",
  "Rabbit": "Aparece em chapéus de mágicos e tradições de Páscoa. Na ficção, já guiou uma garota a um mundo fantástico no subsolo.",
  "Lion": "Apesar de ser chamado de rei da selva, ele na verdade evita selvas. Prefere a savana aberta — e as fêmeas fazem a maior parte da caça.",
  "Elephant": "A maior criatura terrestre da Terra. É o único animal conhecido por lamentar seus mortos, ficando em silêncio sobre seus restos.",
  "Monkey": "O parente mais famoso de Darwin. Consegue descascar sua comida favorita pelo lado de baixo — o lado que evita os fiapos.",
  "Bear": "Ele dorme por meses sem comer, mas acorda bem. As crianças têm uma versão de pelúcia dele com o nome de um presidente americano.",
  "Snake": "Não tem pálpebras e não consegue piscar. Na história do Jardim do Éden, mudou tudo com uma conversa decisiva.",
  "Frog": "Passa o início da vida respirando debaixo d'água como uma criatura completamente diferente. Sua pele é um barômetro vivo da saúde ambiental.",
  "Butterfly": "Dentro do casulo, ele se dissolve completamente em líquido antes de se reconstruir em algo totalmente diferente.",
  "Turtle": "Carrega sua casa para todo lugar — e seu esqueleto é fundido a essa casa. Algumas espécies vivem mais que seus donos humanos por um século.",
  "Spider": "Uma criatura de oito patas que tece teias de seda para capturar insetos. É um aracnídeo, não um inseto!",
  "Bat": "O único mamífero que realmente voa! Ele dorme de cabeça para baixo durante o dia e usa som para 'ver' no escuro.",
  "Owl": "Uma ave que caça à noite com olhos enormes para ver no escuro. Ela faz o som 'piu' e consegue girar a cabeça quase toda a volta!",
  "Bee": "Um inseto voador que produz mel e poliniza flores. Vive em uma colmeia com milhares de outras abelhas. Sua picada dói!",
  "Ant": "Não tem pulmões e respira por pequenos buracos no corpo. Uma única colônia pode mover toneladas de terra para construir uma cidade oculta.",
  "Chameleon": "Um lagarto famoso por mudar de cor para se esconder ou se comunicar. Ele também tem olhos que se movem independentemente um do outro!",
  "Tiger": "O maior felino selvagem do mundo, conhecido por sua pelagem listrada.",
  "Wolf": "Um parente selvagem do cão que vive e caça em alcateias.",
  "Fox": "Conhecida em histórias ao redor do mundo por ser esperta e astuta.",
  "Deer": "Seu plural em inglês também é 'deer' — sem precisar adicionar 's'!",
  "Sheep": "Singular e plural são a mesma palavra em inglês: 'one sheep', 'two sheep'.",
  "Goat": "Um animal de fazenda conhecido por comer quase tudo e escalar muito bem.",
  "Mouse": "O plural em inglês é 'mice', e não 'mouses' — um plural irregular!",
  "Shark": "Um poderoso predador do oceano com fileiras de dentes afiados.",
  "Water": "Essencial para toda a vida. Cobre mais de 70% da superfície da Terra.",
  "Apple": "Fruta que cresce em árvores. Dizem que comer uma por dia mantém o médico longe!",
  "Bread": "Alimento básico feito de farinha e água, assado no forno.",
  "Cheese": "Feito de leite. Ratos adoram, e humanos colocam na pizza!",
  "Coffee": "Uma bebida escura popular feita de grãos torrados que te ajuda a acordar.",
  "Tea": "Uma bebida quente feita ao infusionar folhas secas em água quente.",
  "Milk": "Um líquido branco produzido por vacas, rico em cálcio para ossos fortes.",
  "Pizza": "Um famoso prato italiano com base de massa redonda coberta com queijo e molho de tomate.",
  "Red": "A cor do fogo e das placas de pare.",
  "Blue": "A cor do céu e do oceano.",
  "Green": "A cor das plantas e da natureza.",
  "Yellow": "A cor do sol e das bananas.",
  "Black": "A ausência de luz. O oposto do branco.",
  "White": "A cor da neve e do leite.",
};

const getTranslatedHint = (word) => {
  if (!word) return '';
  if (word.tipPt) return word.tipPt;
  if (tipPtMap[word.en]) return tipPtMap[word.en];
  if (word.examplePt) return word.examplePt;
  return word.pt ? `Significado: "${word.pt}"` : word.tip || '';
};

const HangmanGame = () => {
  const { words } = useCourseData();
  // Filtra pelo que o curso ATIVO realmente cobre. A lista fixa acima vale
  // para o inglês; um curso sem 'roupas', por exemplo, ofereceria um botão que
  // levaria a `shuffleArray([])[0]` — palavra `undefined` e tela quebrada.
  const hangmanCategories = useMemo(
    () => categories.filter(c => CATEGORIAS_DO_JOGO.includes(c.id) && jogaveisDe(words, c.id).length > 0),
    [words],
  );
  const [category, setCategory] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [gameState, setGameState] = useState('select'); // select, playing, won, lost
  const { progress, consumeHint, consumeTipTranslation, handleCorrectAnswer, handleWrongAnswer, completeGame, addExploredCategory } = useProgress();
  const { playCorrect, playWrong, playClick } = useSound();
  const { speakNormal } = useSpeech();
  const [tipTranslated, setTipTranslated] = useState(false);

  const startGame = useCallback((cat) => {
    setCategory(cat);
    addExploredCategory(cat.id);
    const categoryWords = jogaveisDe(words, cat.id);
    const word = shuffleArray(categoryWords)[0];
    setCurrentWord(word);
    setGuessedLetters([]);
    setWrongCount(0);
    setTipTranslated(false);
    setGameState('playing');
  }, [addExploredCategory, words]);

  const handleLetterGuess = useCallback((letter) => {
    if (guessedLetters.includes(letter) || gameState !== 'playing') return;

    playClick();
    speakNormal(letter);
    const newGuessed = [...guessedLetters, letter];
    setGuessedLetters(newGuessed);
    
    const wordUpper = currentWord.en.toUpperCase();
    
    if (!wordUpper.includes(letter)) {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      
      if (newWrong >= MAX_WRONG) {
        setGameState('lost');
        handleWrongAnswer(currentWord.en);
        playWrong();
      }
    } else {
      // Check if word is complete (exempting non-alphabet characters like spaces/hyphens)
      const allRevealed = wordUpper.split('').every(l => !/[A-Z]/.test(l) || newGuessed.includes(l));
      if (allRevealed) {
        setGameState('won');
        handleCorrectAnswer(currentWord.en, wrongCount === 0 ? 1 : 2);
        completeGame('hangman');
        playCorrect();
      }
    }
  }, [guessedLetters, gameState, currentWord, wrongCount, playClick, speakNormal, playWrong, playCorrect, handleCorrectAnswer, handleWrongAnswer, completeGame]);

  const handleUseExtraHint = useCallback(() => {
    if (!currentWord || gameState !== 'playing') return;
    if ((progress.hintsAvailable || 0) <= 0) return;

    const unrevealed = currentWord.en.toUpperCase().split('').filter(l => /[A-Z]/.test(l) && !guessedLetters.includes(l));
    if (unrevealed.length === 0) return;

    const letterToReveal = unrevealed[0];
    if (consumeHint()) {
      handleLetterGuess(letterToReveal);
    }
  }, [currentWord, gameState, guessedLetters, progress.hintsAvailable, consumeHint, handleLetterGuess]);

  const renderWord = () => {
    if (!currentWord) return null;
    return currentWord.en.toUpperCase().split('').map((letter, i) => {
      const isLetter = /[A-Z]/.test(letter);
      const isRevealed = !isLetter || guessedLetters.includes(letter) || gameState === 'lost';
      return (
        <span key={i} className={`hangman-letter ${isRevealed ? 'revealed' : ''}`}>
          {isRevealed ? letter : '_'}
        </span>
      );
    });
  };

  const renderHangman = () => {
    return (
      <svg viewBox="0 0 200 250" className="hangman-svg">
        {/* Gallows */}
        <line x1="20" y1="230" x2="180" y2="230" stroke="var(--text-muted)" strokeWidth="3" />
        <line x1="60" y1="230" x2="60" y2="20" stroke="var(--text-muted)" strokeWidth="3" />
        <line x1="60" y1="20" x2="130" y2="20" stroke="var(--text-muted)" strokeWidth="3" />
        <line x1="130" y1="20" x2="130" y2="50" stroke="var(--text-muted)" strokeWidth="3" />
        
        {/* Person parts */}
        {wrongCount >= 1 && <circle cx="130" cy="65" r="15" stroke="var(--accent-red)" strokeWidth="3" fill="none" className="animate-fade-in" />}
        {wrongCount >= 2 && <line x1="130" y1="80" x2="130" y2="150" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
        {wrongCount >= 3 && <line x1="130" y1="100" x2="100" y2="130" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
        {wrongCount >= 4 && <line x1="130" y1="100" x2="160" y2="130" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
        {wrongCount >= 5 && <line x1="130" y1="150" x2="105" y2="200" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
        {wrongCount >= 6 && <line x1="130" y1="150" x2="155" y2="200" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
      </svg>
    );
  };

  // Category selection
  if (gameState === 'select') {
    return (
      <div className="page">
        <div className="container game-container text-center animate-fade-in-up">
          <Link to="/games" className="btn btn-ghost" style={{ marginBottom: 'var(--space-lg)' }}>← Voltar</Link>
          <h1 style={{ marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)' }}>
            <img src="/hangman-icon.webp" alt="" style={{ width: '1.4em', height: '1.4em', borderRadius: 'var(--radius-sm)' }} />
            Jogo da Forca
          </h1>
          <p className="text-secondary" style={{ marginBottom: 'var(--space-2xl)' }}>
            Escolha uma categoria e tente adivinhar a palavra em inglês!
          </p>
          <div className="category-grid">
            {hangmanCategories.map(cat => (
              <button key={cat.id} className="glass-card category-card" onClick={() => startGame(cat)}
                style={{ borderColor: `${cat.color}30` }}>
                <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-desc">{cat.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Won/Lost screen
  if (gameState === 'won' || gameState === 'lost') {
    return (
      <div className="page">
        <div className="container game-container text-center">
          <div className="game-result-card glass-card animate-bounce-in">
            <span style={{ fontSize: '4rem' }}>{gameState === 'won' ? '🎉' : '💪'}</span>
            <h2>{gameState === 'won' ? 'Parabéns!' : 'Boa tentativa!'}</h2>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
              {gameState === 'won'
                ? `Você descobriu a palavra com ${wrongCount} erro${wrongCount !== 1 ? 's' : ''}!`
                : 'Errar faz parte do aprendizado. Vamos aprender essa palavra!'}
            </p>
            <WordExplanation word={currentWord} />
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-primary" onClick={() => startGame(category)}>
                🔄 Jogar novamente
              </button>
              <button className="btn btn-secondary" onClick={() => setGameState('select')}>
                Mudar categoria
              </button>
              <Link to="/games" className="btn btn-ghost">← Outros jogos</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container game-container">
        <div className="game-header animate-fade-in">
          <div className="game-title">
            <Link to="/games" className="btn btn-ghost btn-sm">←</Link>
            <img src="/hangman-icon.webp" alt="" className="icon" style={{ width: '1.25rem', height: '1.25rem', borderRadius: 'var(--radius-sm)' }} />
            <h2>Forca</h2>
            <span className="badge badge-blue">{category.icon} {category.name}</span>
          </div>
          <div className="game-score">
            <div className="game-score-item">
              <span>❌</span>
              <span className="value">{wrongCount}/{MAX_WRONG}</span>
            </div>
          </div>
        </div>

        {/* Hint */}
        <div className="hangman-hint glass-card animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <span>💡 Dica: {tipTranslated ? getTranslatedHint(currentWord) : currentWord.tip}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            {!tipTranslated && (progress.tipTranslationsAvailable || 0) > 0 && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { if (consumeTipTranslation()) setTipTranslated(true); }}>
                🌐 Traduzir Dica ({progress.tipTranslationsAvailable} disp.)
              </button>
            )}
            {(progress.hintsAvailable || 0) > 0 ? (
              <button className="btn btn-secondary btn-sm" onClick={handleUseExtraHint}>
                💡 Revelar Letra ({progress.hintsAvailable} disps)
              </button>
            ) : (
              <Link to="/shop" className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--fs-xs)', textDecoration: 'none' }}>
                🛒 Comprar Dicas na Loja
              </Link>
            )}
          </div>
        </div>

        {/* Hangman Drawing */}
        <div className="hangman-drawing">
          {renderHangman()}
        </div>

        {/* Word */}
        <div className="hangman-word animate-fade-in-up">
          {renderWord()}
        </div>

        {/* Keyboard */}
        <div className="hangman-keyboard animate-fade-in-up">
          {ALPHABET.map(letter => {
            const isGuessed = guessedLetters.includes(letter);
            const isCorrect = isGuessed && currentWord.en.toUpperCase().includes(letter);
            const isWrong = isGuessed && !currentWord.en.toUpperCase().includes(letter);
            
            return (
              <button
                key={letter}
                className={`key-btn ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                onClick={() => handleLetterGuess(letter)}
                disabled={isGuessed}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HangmanGame;
