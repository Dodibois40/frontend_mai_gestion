import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Text, Badge, Tooltip } from '@mantine/core';
import { IconUser, IconCalendar, IconCurrencyEuro } from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AffaireCard = ({ 
  affaire, 
  isDragging = false, 
  isCompact = false, 
  onClick,
  style = {} 
}) => {
  
  // Configuration du drag & drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDnd,
  } = useDraggable({
    id: affaire.id,
    data: {
      affaire: affaire,
      type: 'affaire'
    }
  });

  // Calculer la couleur plus foncée pour la bordure
  const darkenColor = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;
  };

  // Couleur de statut
  const getStatutColor = (statut) => {
    switch (statut) {
      case 'EN_COURS': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a' };
      case 'TERMINEE': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb' };
      case 'PLANIFIEE': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706' };
      case 'ANNULEE': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626' };
      default: return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };
    }
  };

  // Calculer la progression (si disponible)
  const progression = affaire.progression || 0;

  // Styles de transformation pour le drag
  const transformStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0) ${isDragging ? 'rotate(5deg)' : ''}`,
  } : {};

  const statutColors = getStatutColor(affaire.statut);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`
        relative overflow-hidden cursor-grab rounded-lg transition-all duration-200
        ${isDnd || isDragging ? 'cursor-grabbing opacity-80 z-50' : 'hover:scale-105 hover:shadow-lg'}
        ${isCompact ? 'min-h-[60px]' : 'min-h-[120px]'}
      `}
      style={{
        backgroundColor: affaire.couleur,
        border: `2px solid ${darkenColor(affaire.couleur)}`,
        boxShadow: isDnd || isDragging 
          ? '0 10px 25px rgba(0,0,0,0.3)' 
          : '0 2px 8px rgba(0,0,0,0.1)',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        touchAction: 'manipulation',
        ...transformStyle,
        ...style
      }}
    >
      {/* Barre de progression */}
      {progression > 0 && (
        <div 
          className="absolute top-0 left-0 h-1 bg-white bg-opacity-80 transition-all duration-300"
          style={{ width: `${progression}%` }}
        />
      )}

      <div className="p-3 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Text 
              size={isCompact ? "xs" : "sm"} 
              fw={700} 
              className="text-white text-shadow-sm truncate"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
            >
              {affaire.numero}
            </Text>
            
            <div 
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: statutColors.bg,
                color: statutColors.text 
              }}
            >
              {affaire.statut?.replace('_', ' ')}
            </div>
          </div>

          {!isCompact && (
            <Text 
              size="xs" 
              className="text-white text-opacity-95 line-clamp-2"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
            >
              {affaire.libelle}
            </Text>
          )}
        </div>

        {/* Client */}
        <div className="flex items-center space-x-1 mt-2">
          <IconUser size={12} className="text-white text-opacity-80" />
          <Text 
            size="xs" 
            className="text-white text-opacity-90 truncate"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
          >
            {affaire.client}
          </Text>
        </div>

        {/* Footer avec dates et montant */}
        {!isCompact && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <IconCalendar size={12} className="text-white text-opacity-80" />
                <Text 
                  size="xs" 
                  className="text-white text-opacity-90"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {format(affaire.dateDebut, 'dd/MM', { locale: fr })}
                </Text>
              </div>
              
              {affaire.estimationBudget && (
                <div className="flex items-center space-x-1">
                  <IconCurrencyEuro size={12} className="text-white text-opacity-80" />
                  <Text 
                    size="xs" 
                    className="text-white text-opacity-90"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {(affaire.estimationBudget / 1000).toFixed(0)}k
                  </Text>
                </div>
              )}
            </div>

            {/* Durée de l'affaire */}
            <div className="flex justify-center">
              <div className="bg-white bg-opacity-20 px-2 py-1 rounded-full">
                <Text 
                  size="xs" 
                  className="text-white font-medium"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {affaire.dureeJours || Math.ceil((affaire.dateFin - affaire.dateDebut) / (1000 * 60 * 60 * 24))} j
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* Équipe (si disponible) */}
        {affaire.equipe && affaire.equipe.length > 0 && !isCompact && (
          <div className="mt-2 flex items-center space-x-1">
            <div className="flex -space-x-1">
              {affaire.equipe.slice(0, 3).map((membre, index) => (
                <Tooltip
                  key={membre.id}
                  label={`${membre.prenom} ${membre.nom}`}
                  position="top"
                >
                  <div
                    className="w-6 h-6 rounded-full bg-white bg-opacity-90 flex items-center justify-center text-xs font-bold border-2 border-white"
                    style={{ 
                      color: affaire.couleur,
                      zIndex: affaire.equipe.length - index 
                    }}
                  >
                    {membre.prenom?.charAt(0) || membre.nom?.charAt(0) || '?'}
                  </div>
                </Tooltip>
              ))}
              {affaire.equipe.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-white bg-opacity-70 flex items-center justify-center text-xs font-bold border-2 border-white">
                  +{affaire.equipe.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 pointer-events-none" />
    </div>
  );
};

export default AffaireCard; 