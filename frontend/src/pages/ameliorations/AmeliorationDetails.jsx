import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconBug,
  IconSparkles,
  IconCalendar,
  IconUser,
  IconPhoto,
  IconExternalLink
} from '@tabler/icons-react';
import ameliorationsService from '../../services/ameliorationsService';

const AmeliorationDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [amelioration, setAmelioration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAmelioration();
  }, [id]);

  const loadAmelioration = async () => {
    try {
      setLoading(true);
      const data = await ameliorationsService.getById(id);
      setAmelioration(data);
    } catch (error) {
      console.error('Erreur chargement amélioration:', error);
      toast.error('Erreur lors du chargement');
      navigate('/ameliorations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette amélioration ?')) {
      try {
        await ameliorationsService.delete(id);
        toast.success('Amélioration supprimée avec succès');
        navigate('/ameliorations');
      } catch (error) {
        console.error('Erreur suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  // Badge pour le type
  const TypeBadge = ({ type }) => {
    const config = {
      BUG: { icon: IconBug, color: 'bg-red-100 text-red-800 border border-red-200', label: 'Bug' },
      AMELIORATION: { icon: IconSparkles, color: 'bg-blue-100 text-blue-800 border border-blue-200', label: 'Amélioration' }
    };
    
    const { icon: Icon, color, label } = config[type] || config.AMELIORATION;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        <Icon size={16} className="mr-2" />
        {label}
      </span>
    );
  };

  // Badge pour le statut
  const StatutBadge = ({ statut }) => {
    const config = {
      NOUVEAU: { color: 'bg-gray-100 text-gray-800 border border-gray-200', label: '🆕 Nouveau' },
      EN_COURS: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', label: '🔧 En cours' },
      TERMINE: { color: 'bg-green-100 text-green-800 border border-green-200', label: '✅ Terminé' },
      ABANDONNE: { color: 'bg-red-100 text-red-800 border border-red-200', label: '❌ Abandonné' }
    };
    
    const { color, label } = config[statut] || config.NOUVEAU;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!amelioration) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Amélioration non trouvée</h3>
        <p className="text-gray-500 mb-4">Cette amélioration n'existe pas ou a été supprimée.</p>
        <Link
          to="/ameliorations"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <IconArrowLeft size={20} className="mr-2" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/ameliorations')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <IconArrowLeft size={20} className="mr-2" />
          Retour à la liste
        </button>
        
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <TypeBadge type={amelioration.type} />
              <StatutBadge statut={amelioration.statut} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {amelioration.titre}
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <Link
              to={`/ameliorations/${amelioration.id}/modifier`}
              className="inline-flex items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <IconEdit size={18} className="mr-2" />
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              <IconTrash size={18} className="mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {amelioration.description}
              </p>
            </div>
          </div>

          {/* Image */}
          {amelioration.imageUrl && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <IconPhoto size={20} className="mr-2" />
                Capture d'écran
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={amelioration.imageUrl}
                  alt="Capture d'écran"
                  className="w-full h-auto max-h-96 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    // Ouvrir l'image dans un nouvel onglet pour la voir en grand
                    const newWindow = window.open('', '_blank');
                    newWindow.document.write(`
                      <html>
                        <head><title>Capture d'écran - ${amelioration.titre}</title></head>
                        <body style="margin:0; padding:20px; background:#f3f4f6; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                          <img src="${amelioration.imageUrl}" style="max-width:100%; max-height:100%; object-fit:contain;" alt="Capture d'écran" />
                        </body>
                      </html>
                    `);
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden p-4 text-center text-gray-500">
                  <IconPhoto size={32} className="mx-auto mb-2" />
                  <p>Image non disponible</p>
                  <p className="text-xs mt-2">Problème de chargement de l'image</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                💡 Cliquez sur l'image pour la voir en grand
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informations */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Créé par</label>
                <div className="flex items-center">
                  <IconUser size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {amelioration.createur.prenom} {amelioration.createur.nom}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Date de création</label>
                <div className="flex items-center">
                  <IconCalendar size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {new Date(amelioration.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {amelioration.updatedAt !== amelioration.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Dernière modification</label>
                  <div className="flex items-center">
                    <IconCalendar size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {new Date(amelioration.updatedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <Link
                to={`/ameliorations/${amelioration.id}/modifier`}
                className="block w-full text-center px-4 py-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Modifier cette amélioration
              </Link>
              
              <Link
                to="/ameliorations/nouveau"
                className="block w-full text-center px-4 py-2 text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                Créer une nouvelle amélioration
              </Link>
              
              <button
                onClick={handleDelete}
                className="block w-full text-center px-4 py-2 text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                Supprimer cette amélioration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmeliorationDetails;