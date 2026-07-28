import './EmailDomainSuggestions.css';

// Puramente apresentacional — toda a lógica (quando abrir, o que sugerir,
// navegação por teclado) mora em useEmailDomainSuggestions.js.
//
// Os itens usam onMouseDown (não onClick): o blur do input dispara antes do
// click, então um onClick fecharia a lista antes do clique ser processado.
// onMouseDown roda antes do blur e evita essa corrida.
const EmailDomainSuggestions = ({ suggestions, activeIndex, onHover, onSelect }) => {
  if (!suggestions.length) return null;

  return (
    <ul className="email-suggestions glass-card" role="listbox">
      {suggestions.map((domain, i) => (
        <li
          key={domain}
          role="option"
          aria-selected={i === activeIndex}
          className={`email-suggestion ${i === activeIndex ? 'active' : ''}`}
          onMouseDown={(e) => { e.preventDefault(); onSelect(domain); }}
          onMouseEnter={() => onHover(i)}
        >
          @{domain}
        </li>
      ))}
    </ul>
  );
};

export default EmailDomainSuggestions;
