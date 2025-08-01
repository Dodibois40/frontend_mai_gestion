import React from 'react';
import PropTypes from 'prop-types';

/**
 * Composant IconButton - Design Apple
 * Bouton avec icône uniquement, style Apple
 */
const IconButton = ({ 
  icon, 
  onClick, 
  variant = 'default',
  size = 'default',
  disabled = false,
  className = '',
  title = '',
  ariaLabel = ''
}) => {
  const handleClick = () => {
    if (!disabled && onClick && typeof onClick === 'function') {
      onClick();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button 
      className={`icon-button icon-button--${variant} icon-button--${size} ${
        disabled ? 'icon-button--disabled' : ''
      } ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || title}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      <span className="icon-button__icon">{icon}</span>
    </button>
  );
};

IconButton.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info']),
  size: PropTypes.oneOf(['xs', 'sm', 'default', 'lg']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  title: PropTypes.string,
  ariaLabel: PropTypes.string
};

export default IconButton; 