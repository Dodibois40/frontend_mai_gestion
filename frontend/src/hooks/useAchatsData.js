import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { affairesService } from '@/services/affairesService';

export const useAchatsData = (affaireId) => {
  const [achatsParCategorie, setAchatsParCategorie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAchatsParCategorie = async () => {
    if (!affaireId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await affairesService.getAchatsParCategorie(affaireId);
      setAchatsParCategorie(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des achats par catégorie:', error);
      setError(error);
      toast.error('Erreur lors du chargement des achats');
    } finally {
      setLoading(false);
    }
  };

  const refreshAchatsData = () => {
    fetchAchatsParCategorie();
  };

  useEffect(() => {
    if (affaireId) {
      fetchAchatsParCategorie();
    }
  }, [affaireId]);

  return {
    achatsParCategorie,
    loading,
    error,
    refreshAchatsData,
    setAchatsParCategorie // Pour les mises à jour manuelles
  };
}; 