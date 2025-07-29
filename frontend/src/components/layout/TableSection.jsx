import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '../ui/IconButton';

/**
 * Composant TableSection - BLOC 2
 * Tableau des affaires avec header et actions
 */
const TableSection = ({ 
  children,
  title = "Liste des Affaires",
  searchPlaceholder = "Rechercher une affaire...",
  onSearch = () => {},
  onAdd = () => {},
  onFilter = () => {},
  actions = [],
  loading = false
}) => {
  return (
    <div className="table-section">
      <div className="table-header">
        <h2 className="section-title">{title}</h2>
        <div className="table-actions">
          {/* Recherche */}
          <div className="search-input-container">
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          {/* Bouton filtre */}
          <IconButton
            icon="⚙️"
            onClick={onFilter}
            title="Filtres"
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
          
          {/* Bouton d'ajout */}
          <button
            onClick={onAdd}
            className="add-button"
            title="Nouvelle Affaire"
          >
            <span className="add-button__icon">+</span>
            <span className="add-button__label">Nouvelle Affaire</span>
          </button>
        </div>
      </div>
      
      <div className="table-container">
        {loading ? (
          <div className="table-loading">
            <div className="loading-spinner"></div>
            <p>Chargement des affaires...</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

TableSection.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  onSearch: PropTypes.func,
  onAdd: PropTypes.func,
  onFilter: PropTypes.func,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
      onClick: PropTypes.func.isRequired,
      title: PropTypes.string.isRequired,
      variant: PropTypes.string
    })
  ),
  loading: PropTypes.bool
};

export default TableSection; 