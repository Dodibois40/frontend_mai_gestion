import React from 'react';
import PropTypes from 'prop-types';

/**
 * Composant AssignmentBadge - Design Apple
 * Badge d'affectation avec drag & drop et actions
 */
const AssignmentBadge = ({ 
  name, 
  color = 'primary',
  draggable = true,
  onClick = null,
  onEdit = null,
  onDelete = null,
  className = '',
  size = 'default'
}) => {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick && typeof onClick === 'function') {
      onClick();
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit && typeof onEdit === 'function') {
      onEdit();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete && typeof onDelete === 'function') {
      onDelete();
    }
  };

  const handleDragStart = (e) => {
    if (draggable) {
      e.dataTransfer.setData('text/plain', name);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <div 
      className={`assignment-badge assignment-badge--${color} assignment-badge--${size} ${
        draggable ? 'assignment-badge--draggable' : ''
      } ${onClick ? 'assignment-badge--clickable' : ''} ${className}`}
      draggable={draggable}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : 'presentation'}
      tabIndex={onClick ? 0 : -1}
    >
      <span className="assignment-badge__name">{name}</span>
      
      {(onEdit || onDelete) && (
        <div className="assignment-badge__actions">
          {onEdit && (
            <button
              className="assignment-badge__action assignment-badge__action--edit"
              onClick={handleEdit}
              title="Modifier"
              aria-label={`Modifier ${name}`}
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              className="assignment-badge__action assignment-badge__action--delete"
              onClick={handleDelete}
              title="Supprimer"
              aria-label={`Supprimer ${name}`}
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  );
};

AssignmentBadge.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info']),
  draggable: PropTypes.bool,
  onClick: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  className: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'default', 'lg'])
};

export default AssignmentBadge; 