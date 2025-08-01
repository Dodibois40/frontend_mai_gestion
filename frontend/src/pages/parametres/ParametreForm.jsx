import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  createParametre, 
  updateParametre, 
  getParametreById 
} from '@/services/parametresService';

const ParametreForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    cle: '',
    valeur: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger le paramètre en mode édition
  useEffect(() => {
    if (isEdit) {
      loadParametre();
    }
  }, [id, isEdit]);

  const loadParametre = async () => {
    try {
      setLoading(true);
      const parametre = await getParametreById(id);
      setFormData({
        cle: parametre.cle,
        valeur: parametre.valeur,
        description: parametre.description || ''
      });
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement du paramètre');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cle.trim() || !formData.valeur.trim()) {
      setError('La clé et la valeur sont obligatoires');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit) {
        await updateParametre(id, formData);
      } else {
        await createParametre(formData);
      }

      navigate('/parametres');
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde du paramètre');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Annuler et retourner à la liste
  const handleCancel = () => {
    navigate('/parametres');
  };

  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isEdit ? 'Modifier le Paramètre' : 'Nouveau Paramètre'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="cle" className="block text-sm font-medium text-gray-700 mb-2">
                Clé *
              </label>
              <input
                type="text"
                id="cle"
                name="cle"
                value={formData.cle}
                onChange={handleChange}
                disabled={isEdit} // La clé ne peut pas être modifiée en édition
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  isEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Ex: TAUX_HORAIRE_DEFAUT"
                required
              />
              {isEdit && (
                <p className="mt-1 text-sm text-gray-500">
                  La clé ne peut pas être modifiée
                </p>
              )}
            </div>

            <div>
              <label htmlFor="valeur" className="block text-sm font-medium text-gray-700 mb-2">
                Valeur *
              </label>
              <input
                type="text"
                id="valeur"
                name="valeur"
                value={formData.valeur}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 45.00"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description du paramètre..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sauvegarde...' : (isEdit ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParametreForm; 