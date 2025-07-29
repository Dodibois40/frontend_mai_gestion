import React from 'react';
import PropTypes from 'prop-types';

/**
 * Composant StatCard - Design Apple
 * Affiche une statistique avec icône, valeur et tendance
 */
const StatCard = ({ 
  icon, 
  label, 
  value, 
  color = 'primary',
  trend = null,
  onClick = null,
  className = ''
}) => {
  const handleClick = () => {
    if (onClick && typeof onClick === 'function') {
      onClick();
    }
  };

  return (
    <div 
      className={`stat-card stat-card--${color} ${className} ${
        onClick ? 'stat-card--clickable' : ''
      }`}
      onClick={handleClick}
      role={onClick ? 'button' : 'presentation'}
      tabIndex={onClick ? 0 : -1}
    >
      <div className="stat-card__icon">
        <span className="icon">{icon}</span>
      </div>
      <div className="stat-card__content">
        <div className="stat-card__label">{label}</div>
        <div className="stat-card__value">{value}</div>
        {trend && (
          <div className={`stat-card__trend stat-card__trend--${trend.type}`}>
            {trend.type === 'up' ? '↗' : '↘'} {trend.value}
          </div>
        )}
      </div>
    </div>
  );
};

StatCard.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.oneOf(['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info']),
  trend: PropTypes.shape({
    type: PropTypes.oneOf(['up', 'down']).isRequired,
    value: PropTypes.string.isRequired
  }),
  onClick: PropTypes.func,
  className: PropTypes.string
};

export default StatCard; 