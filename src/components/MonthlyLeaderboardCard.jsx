import { useProgress } from '../hooks/useProgress';
import { getDaysRemainingInMonth, isLastWeekendOfMonth, MONTHLY_REWARDS } from '../utils/monthlyReward';
import './MonthlyLeaderboardCard.css';

const MonthlyLeaderboardCard = () => {
  const { progress } = useProgress();
  const daysRemaining = getDaysRemainingInMonth();
  const isWeekendSprint = isLastWeekendOfMonth();

  const currentScore = progress?.totalScore || 0;

  return (
    <div className="monthly-card glass-card animate-fade-in-up">
      <div className="monthly-card-header">
        <div className="monthly-card-title">
          <span className="monthly-icon">🏆</span>
          <div>
            <h3>Campeonato Mensal de Níveis</h3>
            <p className="text-secondary">O Top 1 do mês ganha 5.000 moedas e o Título Supremo!</p>
          </div>
        </div>
        <div className="monthly-countdown-badge">
          ⏳ Faltam {daysRemaining} dia{daysRemaining !== 1 ? 's' : ''}
        </div>
      </div>

      {isWeekendSprint && (
        <div className="monthly-sprint-alert animate-pulse">
          ⚡ <strong>ARRANCADA DA RETA FINAL:</strong> Jogos valem Pontos em Dobro neste fim de semana!
        </div>
      )}

      <div className="monthly-podium">
        <div className="podium-item top2">
          <div className="podium-rank">2º</div>
          <div className="podium-prize">+{MONTHLY_REWARDS[2].coins} 🪙</div>
          <span className="podium-label">Vice-Campeão</span>
        </div>

        <div className="podium-item top1">
          <div className="podium-crown">👑</div>
          <div className="podium-rank">1º</div>
          <div className="podium-prize">+{MONTHLY_REWARDS[1].coins} 🪙</div>
          <span className="podium-label">Campeão Mensal</span>
        </div>

        <div className="podium-item top3">
          <div className="podium-rank">3º</div>
          <div className="podium-prize">+{MONTHLY_REWARDS[3].coins} 🪙</div>
          <span className="podium-label">Elite do Mês</span>
        </div>
      </div>

      <div className="monthly-my-status">
        <span>Sua Pontuação Atual: <strong>{currentScore} ⭐</strong></span>
        <span className="badge badge-purple">Top 1 Garantido</span>
      </div>
    </div>
  );
};

export default MonthlyLeaderboardCard;
