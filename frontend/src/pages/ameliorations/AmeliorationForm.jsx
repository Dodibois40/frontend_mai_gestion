import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconBug,
  IconSparkles,
  IconPhoto,
  IconX
} from '@tabler/icons-react';
import ameliorationsService from '../../services/ameliorationsService';

const AmeliorationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [formData, setFormData] = useState({
    type: 'BUG',
    titre: '',
    description: '',
    statut: 'NOUVEAU',
    imageUrl: ''
  });

  // Charger les données en mode édition
  useEffect(() => {
    if (isEditing) {
      loadAmelioration();
    }
  }, [id, isEditing]);

  const loadAmelioration = async () => {
    try {
      setInitialLoading(true);
      const data = await ameliorationsService.getById(id);
      setFormData({
        type: data.type,
        titre: data.titre,
        description: data.description,
        statut: data.statut,
        imageUrl: data.imageUrl || ''
      });
    } catch (error) {
      console.error('Erreur chargement amélioration:', error);
      toast.error('Erreur lors du chargement');
      navigate('/ameliorations');
    } finally {
      setInitialLoading(false);
    }
  };

  // Gérer les changements de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction de compression d'images
  const compressImage = (file, maxWidth = 1600, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculer les nouvelles dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Configurer le canvas
        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en base64 avec compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Calculer la réduction de taille
        const originalSize = file.size;
        const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
        const reduction = Math.round(((originalSize - compressedSize) / originalSize) * 100);
        
        resolve({
          dataUrl: compressedDataUrl,
          originalSize,
          compressedSize,
          reduction,
          dimensions: `${width}x${height}`
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Gérer l'upload d'image en base64 avec compression automatique
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Vérifier la taille (max 50MB pour images HD)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('L\'image est trop grande (max 50MB)');
        return;
      }

      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image');
        return;
      }

      try {
        // Afficher le message de compression
        toast.loading('Compression de l\'image en cours...', { id: 'compression' });
        
        // Compresser l'image
        const result = await compressImage(file);
        
        // Mettre à jour l'état avec l'image compressée
        setFormData(prev => ({
          ...prev,
          imageUrl: result.dataUrl
        }));
        
        // Message de succès avec statistiques
        toast.success(
          `Image ajoutée ! Compressée de ${(result.originalSize / 1024 / 1024).toFixed(1)}MB à ${(result.compressedSize / 1024 / 1024).toFixed(1)}MB (-${result.reduction}%)`,
          { id: 'compression', duration: 4000 }
        );
        
      } catch (error) {
        console.error('Erreur lors de la compression de l\'image:', error);
        toast.error('Erreur lors de la compression de l\'image', { id: 'compression' });
      }
    }
  };

  // Supprimer l'image
  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titre.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('La description est obligatoire');
      return;
    }

    try {
      setLoading(true);
      
      const dataToSend = {
        type: formData.type,
        titre: formData.titre.trim(),
        description: formData.description.trim(),
        ...(formData.imageUrl && { imageUrl: formData.imageUrl }),
        ...(isEditing && { statut: formData.statut })
      };

      if (isEditing) {
        await ameliorationsService.update(id, dataToSend);
        toast.success('Amélioration mise à jour avec succès');
      } else {
        await ameliorationsService.create(dataToSend);
        toast.success('Amélioration créée avec succès');
      }
      
      navigate('/ameliorations');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Chargement...</p>
        </div>
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
        
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? '✏️ Modifier l\'amélioration' : '📝 Nouvelle amélioration'}
        </h1>
        <p className="text-gray-600">
          {isEditing 
            ? 'Modifiez les informations de l\'amélioration'
            : 'Décrivez le bug ou l\'amélioration que vous souhaitez voir'
          }
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {/* Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="type"
                  value="BUG"
                  checked={formData.type === 'BUG'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg mr-4 ${
                  formData.type === 'BUG' 
                    ? 'bg-red-100 text-red-600 border-red-300' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <IconBug size={24} />
                </div>
                <div>
                  <div className="font-medium text-gray-900">🐛 Bug</div>
                  <div className="text-sm text-gray-500">Dysfonctionnement à corriger</div>
                </div>
                <div className={`ml-auto w-4 h-4 border-2 rounded-full ${
                  formData.type === 'BUG' 
                    ? 'bg-red-600 border-red-600' 
                    : 'border-gray-300'
                }`}>
                  {formData.type === 'BUG' && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                </div>
              </label>

              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="type"
                  value="AMELIORATION"
                  checked={formData.type === 'AMELIORATION'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg mr-4 ${
                  formData.type === 'AMELIORATION' 
                    ? 'bg-blue-100 text-blue-600 border-blue-300' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <IconSparkles size={24} />
                </div>
                <div>
                  <div className="font-medium text-gray-900">✨ Amélioration</div>
                  <div className="text-sm text-gray-500">Fonctionnalité à améliorer</div>
                </div>
                <div className={`ml-auto w-4 h-4 border-2 rounded-full ${
                  formData.type === 'AMELIORATION' 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300'
                }`}>
                  {formData.type === 'AMELIORATION' && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                </div>
              </label>
            </div>
          </div>

          {/* Titre */}
          <div className="mb-6">
            <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-2">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titre"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex: Erreur lors de la sauvegarde d'une affaire"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={200}
              required
            />
            <div className="mt-1 text-sm text-gray-500">
              {formData.titre.length}/200 caractères
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez le problème ou l'amélioration en détail..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Statut (seulement en édition) */}
          {isEditing && (
            <div className="mb-6">
              <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="NOUVEAU">🆕 Nouveau</option>
                <option value="EN_COURS">🔧 En cours</option>
                <option value="TERMINE">✅ Terminé</option>
                <option value="ABANDONNE">❌ Abandonné</option>
              </select>
            </div>
          )}

          {/* Upload d'image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image (capture d'écran) - Max 50MB
            </label>
            <p className="text-xs text-gray-500 mb-3">
              ✨ Compression automatique activée - Les images HD seront optimisées automatiquement
            </p>
            
            {formData.imageUrl ? (
              <div className="relative border-2 border-dashed border-green-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <IconPhoto size={20} className="text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Image ajoutée</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Supprimer l'image"
                  >
                    <IconX size={16} />
                  </button>
                </div>
                {/* Prévisualisation de l'image */}
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Prévisualisation"
                    className="max-w-full max-h-64 rounded-lg border border-gray-200 object-contain mx-auto"
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Cliquez sur l'image pour la voir en grand
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <IconPhoto size={32} className="mx-auto text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600 mb-2">
                    Glissez une image HD ici ou cliquez pour sélectionner
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    📷 Captures d'écran, images HD acceptées (jusqu'à 50MB)
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    Choisir un fichier
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/ameliorations')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
            <IconDeviceFloppy size={20} className="mr-2" />
            {isEditing ? 'Mettre à jour' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AmeliorationForm;