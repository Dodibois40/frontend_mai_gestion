import React from 'react';
import PropTypes from 'prop-types';
import StatCard from '../ui/StatCard';
import FilterButton from '../ui/FilterButton';

/**
 * Composant HeaderSection - BLOC 1
 * En-tête avec héro, statistiques et filtres d'équipe
 */
const HeaderSection = ({ 
  stats = [],
  filters = [],
  activeFilters = [],
  onFilterChange = () => {},
  title = "Gestion des Affaires",
  subtitle = "Suivi et gestion avancée avec planning intégré"
}) => {
  const handleFilterClick = (filterId) => {
    onFilterChange(filterId);
  };

  return (
    <div className="header-section">
      {/* En-tête principal avec dégradé Apple */}
      <div className="hero-header">
        <h1 className="title">{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
      
      {/* Statistiques - Cartes Apple-style */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.id || index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
            trend={stat.trend}
            onClick={stat.onClick}
          />
        ))}
      </div>
      
      {/* Filtres équipe - Style Apple */}
      <div className="team-filters">
        {filters.map((filterGroup, groupIndex) => (
          <div key={groupIndex} className="filter-group">
            <span className="filter-label">{filterGroup.label} :</span>
            {filterGroup.items.map((filter) => (
              <FilterButton
                key={filter.id}
                label={filter.label}
                active={activeFilters.includes(filter.id)}
                onClick={() => handleFilterClick(filter.id)}
                variant={filter.variant || 'default'}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

HeaderSection.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      color: PropTypes.string,
      trend: PropTypes.object,
      onClick: PropTypes.func
    })
  ),
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          variant: PropTypes.string
        })
      ).isRequired
    })
  ),
  activeFilters: PropTypes.arrayOf(PropTypes.string),
  onFilterChange: PropTypes.func,
  title: PropTypes.string,
  subtitle: PropTypes.string
};

export default HeaderSection; 