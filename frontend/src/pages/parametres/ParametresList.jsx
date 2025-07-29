import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getParametres, 
  deleteParametre, 
  initializeDefaultParameters 
} from '@/services/parametresService';

const ParametresList = () => {
  const [parametres, setParametres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les paramètres
  const loadParametres = async () => {
    try {
      setLoading(true);
      const data = await getParametres();
      setParametres(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des paramètres');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un paramètre
  const handleDelete = async (id, cle) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le paramètre "${cle}" ?`)) {
      try {
        await deleteParametre(id);
        await loadParametres(); // Recharger la liste
      } catch (err) {
        setError('Erreur lors de la suppression du paramètre');
        console.error(err);
      }
    }
  };

  // Initialiser les paramètres par défaut
  const handleInitializeDefaults = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir initialiser les paramètres par défaut ?')) {
      try {
        await initializeDefaultParameters();
        await loadParametres(); // Recharger la liste
      } catch (err) {
        setError('Erreur lors de l\'initialisation des paramètres par défaut');
        console.error(err);
      }
    }
  };

  useEffect(() => {
    loadParametres();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres Globaux</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleInitializeDefaults}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Initialiser par défaut
          </button>
          <Link
            to="/parametres/nouveau"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Nouveau Paramètre
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clé
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernière modification
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parametres.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Aucun paramètre trouvé
                </td>
              </tr>
            ) : (
              parametres.map((parametre) => (
                <tr key={parametre.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {parametre.cle}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {parametre.valeur}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {parametre.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(parametre.updatedAt).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/parametres/${parametre.id}/modifier`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(parametre.id, parametre.cle)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParametresList; 