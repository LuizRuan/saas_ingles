import { tokenizeText, normalizeWord } from '../../utils/storyTokenizer';

// Cada palavra vira um <button>, não um <span onClick>: dentro de <p> é
// conteúdo de fraseado válido, e ganha foco por teclado + a regra global
// button:focus-visible de index.css de graça — sem isso, ler com o teclado
// não teria como ativar uma palavra.
const StoryText = ({ text, onWordClick }) => (
  <p className="story-paragraph">
    {tokenizeText(text).map((tok, i) =>
      tok.type === 'word' ? (
        <button
          key={i}
          type="button"
          className="story-word"
          onClick={() => onWordClick(normalizeWord(tok.text))}
        >
          {tok.text}
        </button>
      ) : (
        <span key={i}>{tok.text}</span>
      )
    )}
  </p>
);

export default StoryText;
