import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Composant DroppableZone - Design Apple
 * Zone de dépôt pour drag & drop
 */
const DroppableZone = ({ 
  children,
  onDrop,
  onDragOver,
  className = '',
  acceptedTypes = ['text/plain'],
  disabled = false,
  placeholder = 'Glissez un élément ici'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (disabled) return;
    
    setIsDragOver(true);
    if (onDragOver && typeof onDragOver === 'function') {
      onDragOver(e);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (disabled) return;
    
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    
    setIsDragOver(false);
    
    const draggedData = e.dataTransfer.getData('text/plain');
    
    if (onDrop && typeof onDrop === 'function') {
      onDrop(e, draggedData);
    }
  };

  const isEmpty = !children || (Array.isArray(children) && children.length === 0);

  return (
    <div
      className={`droppable-zone ${
        isDragOver ? 'droppable-zone--dragover' : ''
      } ${disabled ? 'droppable-zone--disabled' : ''} ${
        isEmpty ? 'droppable-zone--empty' : ''
      } ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="region"
      aria-label="Zone de dépôt"
    >
      {isEmpty ? (
        <div className="droppable-zone__placeholder">
          <span className="droppable-zone__placeholder-text">
            {placeholder}
          </span>
        </div>
      ) : (
        <div className="droppable-zone__content">
          {children}
        </div>
      )}
    </div>
  );
};

DroppableZone.propTypes = {
  children: PropTypes.node,
  onDrop: PropTypes.func.isRequired,
  onDragOver: PropTypes.func,
  className: PropTypes.string,
  acceptedTypes: PropTypes.arrayOf(PropTypes.string),
  disabled: PropTypes.bool,
  placeholder: PropTypes.string
};

export default DroppableZone; 