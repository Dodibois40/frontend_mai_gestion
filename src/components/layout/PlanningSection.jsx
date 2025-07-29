import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '../ui/IconButton';

/**
 * Composant PlanningSection - BLOC 3
 * Planning équipe intégré avec navigation et contrôles
 */
const PlanningSection = ({ 
  children,
  title = "Planning Équipe",
  currentWeek = "Semaine 28 - Juillet 2025",
  onPreviousWeek = () => {},
  onNextWeek = () => {},
  onSettings = () => {},
  onViewToggle = () => {},
  viewMode = "grid",
  loading = false,
  actions = []
}) => {
  return (
    <div className="planning-section">
      <div className="planning-header">
        <h2 className="section-title">{title}</h2>
        <div className="planning-controls">
          {/* Navigation semaine */}
          <div className="week-navigation">
            <IconButton
              icon="◀"
              onClick={onPreviousWeek}
              title="Semaine précédente"
              size="sm"
            />
            <span className="week-label">{currentWeek}</span>
            <IconButton
              icon="▶"
              onClick={onNextWeek}
              title="Semaine suivante"
              size="sm"
            />
          </div>
          
          {/* Toggle vue */}
          <IconButton
            icon={viewMode === 'grid' ? '📅' : '📋'}
            onClick={onViewToggle}
            title={`Basculer vers ${viewMode === 'grid' ? 'liste' : 'grille'}`}
            variant="default"
          />
          
          {/* Actions personnalisées */}
          {actions.map((action, index) => (
            <IconButton
              key={index}
              icon={action.icon}
              onClick={action.onClick}
              title={action.title}
              variant={action.variant || 'default'}
            />
          ))}
          
          {/* Paramètres */}
          <IconButton
            icon="⚙️"
            onClick={onSettings}
            title="Paramètres"
            variant="default"
          />
        </div>
      </div>
      
      <div className="planning-container">
        {loading ? (
          <div className="planning-loading">
            <div className="loading-spinner"></div>
            <p>Chargement du planning...</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

PlanningSection.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  currentWeek: PropTypes.string,
  onPreviousWeek: PropTypes.func,
  onNextWeek: PropTypes.func,
  onSettings: PropTypes.func,
  onViewToggle: PropTypes.func,
  viewMode: PropTypes.oneOf(['grid', 'list']),
  loading: PropTypes.bool,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
      onClick: PropTypes.func.isRequired,
      title: PropTypes.string.isRequired,
      variant: PropTypes.string
    })
  )
};

export default PlanningSection; 