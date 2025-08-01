import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconBug,
  IconSparkles,
  IconCalendar,
  IconUser,
  IconEye,
  IconEdit,
  IconTrash
} from '@tabler/icons-react';
import ameliorationsService from '../../services/ameliorationsService';

const AmeliorationsList = () => {
  const [ameliorations, setAmeliorations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'ALL',
    statut: 'ALL',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Charger les améliorations
  const loadAmeliorations = async () => {
    try {
      setLoading(true);
      const response = await ameliorationsService.getAll({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      setAmeliorations(response.ameliorations);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }));
    } catch (error) {
      console.error('Erreur chargement améliorations:', error);
      toast.error('Erreur lors du chargement des améliorations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAmeliorations();
  }, [filters, pagination.page]);

  // Gérer les filtres
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset à la page 1
  };

  // Supprimer une amélioration
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette amélioration ?')) {
      try {
        await ameliorationsService.delete(id);
        toast.success('Amélioration supprimée avec succès');
        loadAmeliorations();
      } catch (error) {
        console.error('Erreur suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  // Badge pour le type
  const TypeBadge = ({ type }) => {
    const config = {
      BUG: { icon: IconBug, color: 'bg-red-100 text-red-800', label: 'Bug' },
      AMELIORATION: { icon: IconSparkles, color: 'bg-blue-100 text-blue-800', label: 'Amélioration' }
    };
    
    const { icon: Icon, color, label } = config[type] || config.AMELIORATION;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <Icon size={12} className="mr-1" />
        {label}
      </span>
    );
  };

  // Badge pour le statut
  const StatutBadge = ({ statut }) => {
    const config = {
      NOUVEAU: { color: 'bg-gray-100 text-gray-800', label: '🆕 Nouveau' },
      EN_COURS: { color: 'bg-yellow-100 text-yellow-800', label: '🔧 En cours' },
      TERMINE: { color: 'bg-green-100 text-green-800', label: '✅ Terminé' },
      ABANDONNE: { color: 'bg-red-100 text-red-800', label: '❌ Abandonné' }
    };
    
    const { color, label } = config[statut] || config.NOUVEAU;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🚀 Améliorations CRM</h1>
            <p className="text-gray-600">Gérer les bugs et améliorations du système</p>
          </div>
          <Link
            to="/ameliorations/nouveau"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <IconPlus size={20} className="mr-2" />
            Nouvelle amélioration
          </Link>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Recherche */}
          <div className="relative flex-1 min-w-64">
            <IconSearch size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans titre et description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre Type */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tous les types</option>
            <option value="BUG">🐛 Bugs</option>
            <option value="AMELIORATION">✨ Améliorations</option>
          </select>

          {/* Filtre Statut */}
          <select
            value={filters.statut}
            onChange={(e) => handleFilterChange('statut', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="NOUVEAU">🆕 Nouveau</option>
            <option value="EN_COURS">🔧 En cours</option>
            <option value="TERMINE">✅ Terminé</option>
            <option value="ABANDONNE">❌ Abandonné</option>
          </select>
        </div>
      </div>

      {/* Liste des améliorations */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Chargement...</p>
        </div>
      ) : ameliorations.length === 0 ? (
        <div className="text-center py-12">
          <IconSparkles size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune amélioration trouvée</h3>
          <p className="text-gray-500 mb-4">
            {filters.search || filters.type !== 'ALL' || filters.statut !== 'ALL'
              ? 'Aucun résultat pour ces filtres'
              : 'Commencez par créer votre première amélioration'}
          </p>
          <Link
            to="/ameliorations/nouveau"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <IconPlus size={20} className="mr-2" />
            Créer une amélioration
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ameliorations.map((amelioration) => (
            <div
              key={amelioration.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <TypeBadge type={amelioration.type} />
                    <StatutBadge statut={amelioration.statut} />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {amelioration.titre}
                  </h3>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {amelioration.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <IconUser size={16} className="mr-1" />
                      {amelioration.createur.prenom} {amelioration.createur.nom}
                    </span>
                    <span className="flex items-center">
                      <IconCalendar size={16} className="mr-1" />
                      {new Date(amelioration.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to={`/ameliorations/${amelioration.id}`}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Voir les détails"
                  >
                    <IconEye size={18} />
                  </Link>
                  <Link
                    to={`/ameliorations/${amelioration.id}/modifier`}
                    className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <IconEdit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(amelioration.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <IconTrash size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmeliorationsList;