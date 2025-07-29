import React from 'react';
import PropTypes from 'prop-types';

/**
 * Composant FilterButton - Design Apple
 * Bouton de filtre avec état actif/inactif
 */
const FilterButton = ({ 
  label, 
  active = false, 
  onClick, 
  variant = 'default',
  disabled = false,
  className = '',
  icon = null
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
      className={`filter-button filter-button--${variant} ${
        active ? 'filter-button--active' : ''
      } ${disabled ? 'filter-button--disabled' : ''} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      role="button"
      aria-pressed={active}
      tabIndex={disabled ? -1 : 0}
    >
      {icon && <span className="filter-button__icon">{icon}</span>}
      <span className="filter-button__label">{label}</span>
      {active && (
        <span className="filter-button__check" role="presentation">
          ✓
        </span>
      )}
    </button>
  );
};

FilterButton.propTypes = {
  label: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'accent']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};

export default FilterButton; 