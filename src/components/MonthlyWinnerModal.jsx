import { useState, useEffect } from 'react';
import { useProgress } from '../hooks/useProgress';
import { MONTHLY_REWARDS, checkMonthlyRewardStatus, getPreviousMonthKey } from '../utils/monthlyReward';
import useSound from '../hooks/useSound';
import './MonthlyWinnerModal.css';

const MonthlyWinnerModal = () => {
  const { progress, addPoints, buyShopItem } = useProgress();
  const { playAchievement } = useSound();
  const [winnerInfo, setWinnerInfo] = useState(null);

  useEffect(() => {
    if (!progress) return;
    const status = checkMonthlyRewardStatus(progress);

    if (status.canClaim && status.rewardInfo) {
      const rank = status.rewardInfo.rank || 1;
      setWinnerInfo({
        rank,
        reward: MONTHLY_REWARDS[rank] || MONTHLY_REWARDS[1],
        month: status.rewardInfo.month
      });
      playAchievement();
    }
  }, [progress, playAchievement]);

  if (!winnerInfo) return null;

  const handleClaim = () => {
    // Add coins reward
    addPoints(winnerInfo.reward.coins);

    // Unlock title
    if (winnerInfo.reward.titleId) {
      buyShopItem({ id: winnerInfo.reward.titleId, price: 0, category: 'titulo' });
    }

    // Update localStorage progress
    const stored = JSON.parse(localStorage.getItem('englishplay_progress') || '{}');
    const updatedProgress = {
      ...stored,
      lastMonthlyRewardMonth: winnerInfo.month,
      pendingMonthlyReward: null,
      isMonthlyChampion: winnerInfo.rank === 1
    };
    localStorage.setItem('englishplay_progress', JSON.stringify(updatedProgress));

    setWinnerInfo(null);
  };

  return (
    <div className="monthly-modal-overlay animate-fade-in">
      <div className="monthly-modal-card glass-card animate-pop-in">
        <div className="monthly-modal-badge">🏆 TOP 1 MENSAL</div>
        <div className="monthly-modal-icon">👑</div>
        <h2>Parabéns, Campeão!</h2>
        <p className="monthly-modal-subtitle">
          Você alcançou o <strong>1º Lugar</strong> no Ranking Mensal de Níveis!
        </p>

        <div className="monthly-reward-box">
          <div className="monthly-reward-item">
            <span className="reward-icon">🪙</span>
            <span className="reward-value">+{winnerInfo.reward.coins} Moedas</span>
          </div>
          <div className="monthly-reward-item">
            <span className="reward-icon">🏷️</span>
            <span className="reward-value">Título {winnerInfo.reward.badge}</span>
          </div>
        </div>

        <button className="btn btn-primary btn-lg monthly-claim-btn" onClick={handleClaim}>
          Resgatar +5.000 Moedas 🪙
        </button>
      </div>
    </div>
  );
};

export default MonthlyWinnerModal;
