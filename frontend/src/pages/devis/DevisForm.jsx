import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  IconArrowLeft, 
  IconCheck, 
  IconX,
  IconLoader
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import devisService from '@/services/devisService';
import { affairesService } from '@/services/affairesService';

const DevisForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [affaires, setAffaires] = useState([]);
  const [formData, setFormData] = useState({
    libelle: '',
    description: '',
    montantHt: '',
    dateValidite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 jours par défaut
    affaireId: '',
    commentaire: ''
  });

  useEffect(() => {
    fetchAffaires();
    if (isEdit) {
      fetchDevis();
    }
  }, [id, isEdit]);

  const fetchAffaires = async () => {
    try {
      const affairesData = await affairesService.getAffaires();
      setAffaires(Array.isArray(affairesData) ? affairesData : []);
    } catch (error) {
      console.error('Erreur lors du chargement des affaires:', error);
      toast.error('Erreur lors du chargement des affaires');
    }
  };

  const fetchDevis = async () => {
    try {
      setLoading(true);
      const response = await devisService.getDevis(id);
      const devisData = response.data || response;
      
      setFormData({
        libelle: devisData.libelle || '',
        description: devisData.description || '',
        montantHt: devisData.montantHt?.toString() || '',
        dateValidite: devisData.dateValidite ? new Date(devisData.dateValidite).toISOString().split('T')[0] : '',
        affaireId: devisData.affaireId || '',
        commentaire: devisData.commentaire || ''
      });
    } catch (error) {
      console.error('Erreur lors du chargement du devis:', error);
      toast.error('Erreur lors du chargement du devis');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.libelle.trim()) {
      toast.error('Le libellé est obligatoire');
      return;
    }
    
    if (!formData.affaireId) {
      toast.error('Veuillez sélectionner une affaire');
      return;
    }
    
    if (!formData.montantHt || parseFloat(formData.montantHt) <= 0) {
      toast.error('Le montant HT doit être supérieur à 0');
      return;
    }
    
    if (!formData.dateValidite) {
      toast.error('La date de validité est obligatoire');
      return;
    }

    try {
      setLoading(true);
      
      const devisData = {
        libelle: formData.libelle.trim(),
        description: formData.description.trim(),
        montantHt: parseFloat(formData.montantHt),
        dateValidite: new Date(formData.dateValidite),
        affaireId: formData.affaireId,
        commentaire: formData.commentaire?.trim() || ''
      };

      if (isEdit) {
        await devisService.updateDevis(id, devisData);
        toast.success('Devis modifié avec succès');
      } else {
        await devisService.createDevis(devisData);
        toast.success('Devis créé avec succès');
      }
      
      navigate('/devis');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(`Erreur lors de la ${isEdit ? 'modification' : 'création'} du devis`);
    } finally {
      setLoading(false);
    }
  };

  const getAffaireLabel = (affaire) => {
    return `${affaire.numero} - ${affaire.libelle} (${affaire.client})`;
  };

  if (loading && isEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/devis')}
            icon={IconArrowLeft}
          >
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Modifier le devis' : 'Nouveau devis'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEdit ? 'Modifiez les informations du devis' : 'Créez un nouveau devis pour une affaire'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du devis</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Affaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Affaire *
              </label>
              <select
                name="affaireId"
                value={formData.affaireId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">Sélectionnez une affaire</option>
                {affaires.map(affaire => (
                  <option key={affaire.id} value={affaire.id}>
                    {getAffaireLabel(affaire)}
                  </option>
                ))}
              </select>
            </div>

            {/* Libellé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Libellé *
              </label>
              <input
                type="text"
                name="libelle"
                value={formData.libelle}
                onChange={handleInputChange}
                required
                placeholder="Ex: Devis installation électrique"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Description détaillée du devis..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Montant HT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Montant HT (€) *
              </label>
              <input
                type="number"
                name="montantHt"
                value={formData.montantHt}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Date de validité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de validité *
              </label>
              <input
                type="date"
                name="dateValidite"
                value={formData.dateValidite}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Date limite de validité du devis
              </p>
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commentaire
              </label>
              <textarea
                name="commentaire"
                value={formData.commentaire}
                onChange={handleInputChange}
                rows={3}
                placeholder="Commentaire sur le devis..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/devis')}
                icon={IconX}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                icon={loading ? IconLoader : IconCheck}
              >
                {loading ? 'Sauvegarde...' : (isEdit ? 'Modifier' : 'Créer')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevisForm; 