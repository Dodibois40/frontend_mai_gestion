import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { affairesService } from '../../services/affairesService';
import AffairesPageContainer from '../../components/layout/AffairesPageContainer';
import PlanningEquipeIntegre from '../../components/planning-equipe/PlanningEquipeIntegre';

/**
 * Page AffairesList avec Design Apple - Structure 3 blocs
 * Intégration complète du planning équipe
 */
const AffairesListApple = () => {
  const navigate = useNavigate();
  
  // État principal
  const [affaires, setAffaires] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // État filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const [activeFilters, setActiveFilters] = useState(['statut-chargé']);
  
  // État pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  /**
   * Charge les données des affaires
   */
  const fetchAffaires = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        search: searchTerm,
        statut: filterStatus,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      const data = await affairesService.getAffaires(params);
      
      setAffaires(data.affaires || []);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: Math.ceil(data.total / prev.limit)
      }));
      
    } catch (err) {
      setError('Erreur lors du chargement des affaires');
      console.error('Erreur chargement affaires:', err);
      toast.error('Impossible de charger les affaires');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filterStatus]);

  /**
   * Charge les statistiques
   */
  const fetchStats = useCallback(async () => {
    try {
      const data = await affairesService.getGlobalStats();
      setStats(data);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
      toast.error('Impossible de charger les statistiques');
    }
  }, []);

  /**
   * Chargement initial
   */
  useEffect(() => {
    fetchAffaires();
    fetchStats();
  }, [fetchAffaires, fetchStats]);

  /**
   * Actualise les données
   */
  const handleRefresh = useCallback(() => {
    fetchAffaires();
    fetchStats();
    toast.success('Données actualisées');
  }, [fetchAffaires, fetchStats]);

  /**
   * Gère la recherche
   */
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Gère les filtres d'équipe
   */
  const handleFilterChange = useCallback((filterId) => {
    setActiveFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(id => id !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  }, []);

  /**
   * Gère l'ajout d'une nouvelle affaire
   */
  const handleAddAffaire = useCallback(() => {
    navigate('/affaires/nouveau');
  }, [navigate]);

  /**
   * Supprime une affaire
   */
  const handleDeleteAffaire = useCallback(async (affaire) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'affaire "${affaire.numero}" ?`)) {
      try {
        await affairesService.deleteAffaire(affaire.id);
        toast.success('Affaire supprimée avec succès');
        handleRefresh();
      } catch (err) {
        console.error('Erreur suppression:', err);
        toast.error('Erreur lors de la suppression');
      }
    }
  }, [handleRefresh]);

  /**
   * Calcule le taux de marge réel
   */
  const calculerTauxMargeReel = useCallback((affaire) => {
    const caReel = affaire.caReelHt || 0;
    const depensesReelles = affaire.achatReelHt || 0;
    
    if (caReel === 0) return 0;
    
    const margeReelle = caReel - depensesReelles;
    return (margeReelle / caReel) * 100;
  }, []);

  /**
   * Prépare les données pour le header
   */
  const headerStats = [
    {
      id: 'total',
      icon: '💰',
      label: 'CA Total',
      value: `${(stats.caTotal || 0).toLocaleString('fr-FR')} €`,
      color: 'primary'
    },
    {
      id: 'achats',
      icon: '🛒',
      label: 'Achats',
      value: `${(stats.achatsTotal || 0).toLocaleString('fr-FR')} €`,
      color: 'secondary'
    },
    {
      id: 'affaires',
      icon: '📊',
      label: 'Affaires',
      value: stats.totalAffaires || 0,
      color: 'accent'
    },
    {
      id: 'en-cours',
      icon: '⚙️',
      label: 'En cours',
      value: stats.enCours || 0,
      color: 'info'
    }
  ];

  const headerFilters = [
    {
      label: 'Statut',
      items: [
        { id: 'statut-chargé', label: 'Chargé', variant: 'primary' },
        { id: 'statut-poseur', label: 'Poseur', variant: 'secondary' },
        { id: 'statut-dessinateur', label: 'Dessinateur', variant: 'accent' },
                    { id: 'statut-fabricant', label: 'Fabricant', variant: 'secondary' }
      ]
    },
    {
      label: 'Sous Traitant',
      items: [
        { id: 'sous-traitant-maçon', label: 'Maçon', variant: 'default' },
        { id: 'sous-traitant-béton', label: 'Béton', variant: 'default' },
        { id: 'sous-traitant-finition', label: 'Finition', variant: 'default' },
        { id: 'sous-traitant-situation', label: 'Situation', variant: 'default' }
      ]
    }
  ];

  const tableActions = [
    {
      icon: '📊',
      onClick: () => console.log('Statistiques'),
      title: 'Statistiques',
      variant: 'default'
    },
    {
      icon: '📄',
      onClick: () => console.log('Export'),
      title: 'Export',
      variant: 'default'
    }
  ];

  const planningActions = [
    {
      icon: '📄',
      onClick: () => console.log('Export Planning'),
      title: 'Export Planning',
      variant: 'default'
    }
  ];

  /**
   * Rendu du tableau des affaires
   */
  const renderTableContent = () => {
    if (loading) {
      return (
        <div className="table-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des affaires...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="table-error">
          <p>{error}</p>
          <button onClick={handleRefresh}>Réessayer</button>
        </div>
      );
    }

    if (affaires.length === 0) {
      return (
        <div className="table-empty">
          <p>Aucune affaire trouvée</p>
          <button onClick={handleAddAffaire}>Créer une affaire</button>
        </div>
      );
    }

    return (
      <table className="affaires-table">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Libellé</th>
            <th>Client</th>
            <th>Statut</th>
            <th>Date Clôture</th>
            <th>CA Prévu</th>
            <th>CA Réel</th>
            <th>Marge</th>
            <th>Planning</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {affaires.map(affaire => (
            <tr key={affaire.id}>
              <td>
                <div className="affaire-numero">
                  <span className="numero-badge">{affaire.numero}</span>
                </div>
              </td>
              <td>
                <div className="affaire-libelle">
                  <span className="libelle-text">{affaire.libelle}</span>
                </div>
              </td>
              <td>
                <div className="affaire-client">
                  <span className="client-text">{affaire.client}</span>
                </div>
              </td>
              <td>
                <div className="affaire-statut">
                  <span className={`statut-badge statut-${affaire.statut.toLowerCase()}`}>
                    {affaire.statut}
                  </span>
                </div>
              </td>
              <td>
                <div className="affaire-date">
                  {affaire.dateCloturePrevue 
                    ? new Date(affaire.dateCloturePrevue).toLocaleDateString('fr-FR')
                    : 'N/A'
                  }
                </div>
              </td>
              <td>
                <div className="affaire-ca-prevu">
                  {(affaire.objectifCaHt || 0).toLocaleString('fr-FR')} €
                </div>
              </td>
              <td>
                <div className="affaire-ca-reel">
                  {(affaire.caReelHt || 0).toLocaleString('fr-FR')} €
                </div>
              </td>
              <td>
                <div className="affaire-marge">
                  <span className="marge-value">
                    {calculerTauxMargeReel(affaire).toFixed(1)}%
                  </span>
                </div>
              </td>
              <td>
                <div className="affaire-planning">
                  <button 
                    onClick={() => navigate(`/affaires/${affaire.id}/planning`)}
                    className="planning-button"
                  >
                    📅 Planning
                  </button>
                </div>
              </td>
              <td>
                <div className="affaire-actions">
                  <button 
                    onClick={() => navigate(`/affaires/${affaire.id}`)}
                    className="action-button action-view"
                    title="Voir"
                  >
                    👁️
                  </button>
                  <button 
                    onClick={() => navigate(`/affaires/${affaire.id}/modifier`)}
                    className="action-button action-edit"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDeleteAffaire(affaire)}
                    className="action-button action-delete"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  /**
   * Rendu du contenu planning
   */
  const renderPlanningContent = () => {
    return (
      <PlanningEquipeIntegre 
        className="planning-equipe-affaires"
      />
    );
  };

  return (
    <AffairesPageContainer
      // Header props
      headerStats={headerStats}
      headerFilters={headerFilters}
      activeFilters={activeFilters}
      onFilterChange={handleFilterChange}
      title="Gestion des Affaires"
      subtitle="Suivi et gestion avancée avec planning intégré"
      
      // Table props
      tableTitle="Liste des Affaires"
      searchPlaceholder="Rechercher une affaire..."
      onSearch={handleSearch}
      onAddAffaire={handleAddAffaire}
      onFilterAffaires={() => console.log('Filtrer affaires')}
      tableActions={tableActions}
      tableLoading={loading}
      
      // Planning props
      planningTitle="Planning Équipe"
      currentWeek="Semaine 28 - Juillet 2025"
      onPreviousWeek={() => console.log('Semaine précédente')}
      onNextWeek={() => console.log('Semaine suivante')}
      onPlanningSettings={() => console.log('Paramètres planning')}
      onViewToggle={() => console.log('Toggle view')}
      viewMode="grid"
      planningLoading={false}
      planningActions={planningActions}
      
      // Contenu
      tableContent={renderTableContent()}
      planningContent={renderPlanningContent()}
    />
  );
};

export default AffairesListApple; 