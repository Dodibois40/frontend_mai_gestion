import React from 'react';
import PropTypes from 'prop-types';
import HeaderSection from './HeaderSection';
import TableSection from './TableSection';
import PlanningSection from './PlanningSection';

/**
 * Container principal - Structure Apple 3 blocs
 * Orchestre les blocs avec anti-chevauchement parfait
 */
const AffairesPageContainer = ({ 
  // Props pour HeaderSection
  headerStats = [],
  headerFilters = [],
  activeFilters = [],
  onFilterChange = () => {},
  title = "Gestion des Affaires",
  subtitle = "Suivi et gestion avancée avec planning intégré",
  
  // Props pour TableSection
  tableTitle = "Liste des Affaires",
  searchPlaceholder = "Rechercher une affaire...",
  onSearch = () => {},
  onAddAffaire = () => {},
  onFilterAffaires = () => {},
  tableActions = [],
  tableLoading = false,
  
  // Props pour PlanningSection
  planningTitle = "Planning Équipe",
  currentWeek = "Semaine 28 - Juillet 2025",
  onPreviousWeek = () => {},
  onNextWeek = () => {},
  onPlanningSettings = () => {},
  onViewToggle = () => {},
  viewMode = "grid",
  planningLoading = false,
  planningActions = [],
  
  // Contenu des sections
  tableContent,
  planningContent
}) => {
  return (
    <div className="affaires-page-container">
      {/* BLOC 1 : En-tête + Statistiques + Filtres */}
      <HeaderSection
        stats={headerStats}
        filters={headerFilters}
        activeFilters={activeFilters}
        onFilterChange={onFilterChange}
        title={title}
        subtitle={subtitle}
      />
      
      {/* BLOC 2 : Tableau des affaires */}
      <TableSection
        title={tableTitle}
        searchPlaceholder={searchPlaceholder}
        onSearch={onSearch}
        onAdd={onAddAffaire}
        onFilter={onFilterAffaires}
        actions={tableActions}
        loading={tableLoading}
      >
        {tableContent}
      </TableSection>
      
      {/* BLOC 3 : Planning équipe intégré */}
      <PlanningSection
        title={planningTitle}
        currentWeek={currentWeek}
        onPreviousWeek={onPreviousWeek}
        onNextWeek={onNextWeek}
        onSettings={onPlanningSettings}
        onViewToggle={onViewToggle}
        viewMode={viewMode}
        loading={planningLoading}
        actions={planningActions}
      >
        {planningContent}
      </PlanningSection>
    </div>
  );
};

AffairesPageContainer.propTypes = {
  // HeaderSection props
  headerStats: PropTypes.array,
  headerFilters: PropTypes.array,
  activeFilters: PropTypes.array,
  onFilterChange: PropTypes.func,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  
  // TableSection props
  tableTitle: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  onSearch: PropTypes.func,
  onAddAffaire: PropTypes.func,
  onFilterAffaires: PropTypes.func,
  tableActions: PropTypes.array,
  tableLoading: PropTypes.bool,
  
  // PlanningSection props
  planningTitle: PropTypes.string,
  currentWeek: PropTypes.string,
  onPreviousWeek: PropTypes.func,
  onNextWeek: PropTypes.func,
  onPlanningSettings: PropTypes.func,
  onViewToggle: PropTypes.func,
  viewMode: PropTypes.string,
  planningLoading: PropTypes.bool,
  planningActions: PropTypes.array,
  
  // Contenu
  tableContent: PropTypes.node,
  planningContent: PropTypes.node
};

export default AffairesPageContainer; 