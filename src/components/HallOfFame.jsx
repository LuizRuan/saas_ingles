import AvatarDisplay from './Avatar/AvatarDisplay';
import './HallOfFame.css';

const DEFAULT_CHAMPIONS = [
  { month: 'Julho 2026', name: 'Ruan', avatar: 'R', title: '🏆 Campeão Mensal', score: 3450, prize: '5.000 🪙' },
  { month: 'Junho 2026', name: 'Ana', avatar: 'A', title: '🏆 Campeão Mensal', score: 2980, prize: '5.000 🪙' },
  { month: 'Maio 2026', name: 'Carlos', avatar: 'C', title: '🏆 Campeão Mensal', score: 2710, prize: '5.000 🪙' },
];

const HallOfFame = () => {
  return (
    <div className="hall-container glass-card animate-fade-in-up">
      <div className="hall-header">
        <span className="hall-icon">🏛️</span>
        <div>
          <h3>Hall da Fama dos Campeões</h3>
          <p className="text-secondary">Galeria histórica dos Top 1 de cada mês no Wordly</p>
        </div>
      </div>

      <div className="hall-grid">
        {DEFAULT_CHAMPIONS.map((champ, idx) => (
          <div key={idx} className="hall-card">
            <div className="hall-month">{champ.month}</div>
            <div className="hall-avatar-wrapper">
              <AvatarDisplay avatar={champ.avatar} size="md" />
              <span className="hall-crown">👑</span>
            </div>
            <strong className="hall-name">{champ.name}</strong>
            <span className="hall-title-tag">{champ.title}</span>
            <div className="hall-stats">
              <span>{champ.score} ⭐</span>
              <span className="hall-prize">{champ.prize}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HallOfFame;
