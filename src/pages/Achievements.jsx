import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { achievementsList } from '../data/achievements';

const Achievements = () => {
  const { progress } = useProgress();
  const unlockedIds = progress.achievements || [];

  return (
    <div className="page">
      <div className="container">
        <div className="animate-fade-in-up" style={{ marginBottom: 'var(--space-xl)' }}>
          <Link to="/" className="btn btn-ghost" style={{ marginBottom: 'var(--space-md)' }}>← Voltar</Link>
          <h1>🏆 Conquistas</h1>
          <p className="text-secondary" style={{ marginTop: 'var(--space-sm)' }}>
            {unlockedIds.length} de {achievementsList.length} conquistas desbloqueadas
          </p>
        </div>

        <div className="progress-bar" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="progress-bar-fill" style={{ width: `${(unlockedIds.length / achievementsList.length) * 100}%` }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
          {achievementsList.map((achievement) => {
            const unlocked = unlockedIds.includes(achievement.id);
            return (
              <div key={achievement.id}
                className="glass-card animate-fade-in-up"
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                  padding: 'var(--space-lg)',
                  opacity: unlocked ? 1 : 0.4,
                  borderColor: unlocked ? 'rgba(245, 158, 11, 0.3)' : undefined,
                }}>
                <span style={{ fontSize: '2rem', filter: unlocked ? 'none' : 'grayscale(1)' }}>
                  {achievement.icon}
                </span>
                <div>
                  <h4 style={{ color: unlocked ? 'var(--accent-orange)' : 'var(--text-muted)' }}>
                    {achievement.title}
                  </h4>
                  <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
                    {achievement.description}
                  </p>
                  {unlocked && (
                    <span className="badge badge-orange" style={{ marginTop: '4px' }}>✅ Desbloqueada</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
