import React, { useState, useRef } from 'react';
import { IconTrash } from '@tabler/icons-react';

/**
 * Composant TrashZone - Corbeille flottante améliorée pour le drag & drop
 * Zone plus grande, gestion anti-scintillement, position ergonomique
 */
const TrashZone = ({ isVisible, isActive, onDrop, onDragOver, onDragLeave }) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);

  // Gestion anti-scintillement pour dragOver
  const handleDragOver = (e) => {
    e.preventDefault();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(true);
    onDragOver(e);
  };

  // Gestion anti-scintillement pour dragLeave
  const handleDragLeave = (e) => {
    e.preventDefault();
    // Délai avant de déclencher dragLeave pour éviter le scintillement
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      onDragLeave(e);
    }, 100);
  };

  // Gestion du drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(false);
    onDrop(e);
  };

  return (
    <>
      {/* Zone de drop élargie invisible pour faciliter le drop */}
      <div 
        className={`
          fixed bottom-8 right-8 z-40 transition-all duration-300 ease-in-out
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
          w-32 h-32 rounded-full flex items-center justify-center
          ${isVisible ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Corbeille visible */}
        <div 
          className={`
            transition-all duration-300 ease-in-out
            ${isActive || isHovered ? 'scale-125 bg-red-500 shadow-2xl' : 'scale-100 bg-gray-500 shadow-lg'}
            w-20 h-20 rounded-full flex items-center justify-center
            hover:shadow-2xl cursor-pointer relative
          `}
        >
          <IconTrash 
            size={32} 
            className={`
              text-white transition-all duration-200 z-10
              ${isActive || isHovered ? 'scale-110' : 'scale-100'}
            `} 
          />
          
          {/* Effet de pulsation quand active */}
          {(isActive || isHovered) && (
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
          )}
          
          {/* Cercle indicateur de zone de drop */}
          {isVisible && (
            <div 
              className={`
                absolute inset-0 rounded-full border-2 border-dashed transition-all duration-200
                ${isActive || isHovered ? 'border-red-300 scale-150' : 'border-gray-300 scale-125'}
                opacity-50
              `}
            />
          )}
        </div>
      </div>



      {/* Zone d'attraction magnétique visuelle */}
      {isVisible && (isActive || isHovered) && (
        <div 
          className="fixed bottom-8 right-8 z-30 w-40 h-40 rounded-full border-4 border-red-300 border-dashed opacity-30 animate-pulse pointer-events-none"
          style={{
            transform: 'translate(-50%, 50%)',
            marginLeft: '50%',
            marginBottom: '-50%'
          }}
        />
      )}
    </>
  );
};

export default TrashZone; 