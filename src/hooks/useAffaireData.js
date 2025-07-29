import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { affairesService } from '@/services/affairesService';

export const useAffaireData = (id) => {
  const [affaire, setAffaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAffaire = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await affairesService.getAffaireById(id);
      setAffaire(data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'affaire:', error);
      setError(error);
      toast.error('Erreur lors du chargement de l\'affaire');
    } finally {
      setLoading(false);
    }
  };

  const updateAffaire = async (updates) => {
    try {
      const updatedAffaire = await affairesService.updateAffaire(id, updates);
      setAffaire(updatedAffaire);
      toast.success('Affaire mise à jour avec succès');
      return updatedAffaire;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'affaire:', error);
      toast.error('Erreur lors de la mise à jour de l\'affaire');
      throw error;
    }
  };

  const refreshAffaire = () => {
    fetchAffaire();
  };

  useEffect(() => {
    fetchAffaire();
  }, [id]);

  return {
    affaire,
    loading,
    error,
    updateAffaire,
    refreshAffaire,
    setAffaire // Pour les mises à jour manuelles
  };
}; 