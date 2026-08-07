import './AvatarDisplay.css';

export const ANIMATED_AVATARS = {
  anim_dragon: { icon: '🔥', name: 'Dragão Flamejante', className: 'anim-avatar-dragon' },
  anim_robot:  { icon: '⚡', name: 'Cyber Robô Neon',  className: 'anim-avatar-robot' },
  anim_cosmic: { icon: '🌌', name: 'Astronauta Cósmico', className: 'anim-avatar-cosmic' },
  anim_king:   { icon: '👑', name: 'Rei Dourado',      className: 'anim-avatar-king' },
  anim_ghost:  { icon: '👻', name: 'Fantasma Místico', className: 'anim-avatar-ghost' },
};

const AvatarDisplay = ({ avatar = '👤', size = 'sm', className = '' }) => {
  const animatedConfig = ANIMATED_AVATARS[avatar];

  const sizeClass = `avatar-display--${size}`;

  if (animatedConfig) {
    return (
      <div className={`avatar-display-container ${sizeClass} ${className}`} title={animatedConfig.name}>
        <div className={`avatar-display-animated ${animatedConfig.className}`}>
          <span>{animatedConfig.icon}</span>
        </div>
      </div>
    );
  }

  // Avatar estático padrão (emoji ou texto como "R" / "U")
  return (
    <div className={`avatar-display-container ${sizeClass} ${className}`}>
      <div className="avatar-display-static">
        <span>{avatar || '👤'}</span>
      </div>
    </div>
  );
};

export default AvatarDisplay;
