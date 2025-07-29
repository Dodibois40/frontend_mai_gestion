import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getArticles, 
  deleteArticle,
  getArticlesStats,
  getArticlesStockFaible
} from '@/services/articlesService';

const ArticlesList = () => {
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    actif: true,
    stockFaible: false
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    take: 20,
    total: 0
  });

  // Charger les articles et statistiques
  const loadData = async () => {
    try {
      setLoading(true);
      const [articlesData, statsData] = await Promise.all([
        getArticles({
          ...filters,
          skip: pagination.skip,
          take: pagination.take
        }),
        getArticlesStats()
      ]);
      
      setArticles(articlesData.articles);
      setPagination(prev => ({ ...prev, total: articlesData.total }));
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un article
  const handleDelete = async (id, designation) => {
    if (window.confirm(`Êtes-vous sûr de vouloir désactiver l'article "${designation}" ?`)) {
      try {
        await deleteArticle(id);
        await loadData(); // Recharger la liste
      } catch (err) {
        setError('Erreur lors de la suppression de l\'article');
        console.error(err);
      }
    }
  };

  // Gérer les changements de filtres
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, skip: 0 })); // Revenir au début
  };

  // Gérer la pagination
  const handlePreviousPage = () => {
    if (pagination.skip > 0) {
      setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.take) }));
    }
  };

  const handleNextPage = () => {
    if (pagination.skip + pagination.take < pagination.total) {
      setPagination(prev => ({ ...prev, skip: prev.skip + prev.take }));
    }
  };

  useEffect(() => {
    loadData();
  }, [filters, pagination.skip]);

  if (loading && articles.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête avec statistiques */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Articles</h1>
          <Link
            to="/articles/nouveau"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Nouvel Article
          </Link>
        </div>

        {/* Cartes de statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.totalArticles}</div>
              <div className="text-gray-600">Total Articles</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.articlesActifs}</div>
              <div className="text-gray-600">Articles Actifs</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-red-600">{stats.articlesStockFaible}</div>
              <div className="text-gray-600">Stock Faible</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {stats.valeurTotaleStock?.toFixed(2) || '0.00'} €
              </div>
              <div className="text-gray-600">Valeur Stock</div>
            </div>
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Code, désignation, fournisseur..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={filters.actif}
              onChange={(e) => handleFilterChange('actif', e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="true">Articles actifs</option>
              <option value="false">Articles inactifs</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.stockFaible}
                onChange={(e) => handleFilterChange('stockFaible', e.target.checked)}
                className="mr-2"
              />
              Stock faible uniquement
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tableau des articles */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Désignation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix Unitaire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Actuel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Min.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fournisseur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articles.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  {loading ? 'Chargement...' : 'Aucun article trouvé'}
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {article.code}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{article.designation}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{article.unite}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{article.prixUnitaire.toFixed(2)} €</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      article.stockActuel <= article.stockMinimum 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {article.stockActuel}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{article.stockMinimum}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{article.fournisseur || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/articles/${article.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Détails
                      </Link>
                      <Link
                        to={`/articles/${article.id}/modifier`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Modifier
                      </Link>

                      <button
                        onClick={() => handleDelete(article.id, article.designation)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Désactiver
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePreviousPage}
              disabled={pagination.skip === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={handleNextPage}
              disabled={pagination.skip + pagination.take >= pagination.total}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de{' '}
                <span className="font-medium">{pagination.skip + 1}</span> à{' '}
                <span className="font-medium">
                  {Math.min(pagination.skip + pagination.take, pagination.total)}
                </span>{' '}
                sur <span className="font-medium">{pagination.total}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={handlePreviousPage}
                  disabled={pagination.skip === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={pagination.skip + pagination.take >= pagination.total}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlesList; 