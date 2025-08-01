import api from './api';

/**
 * Service pour la gestion des estimations d'achats
 */

// Sauvegarder une estimation d'achats pour une affaire
export const sauvegarderEstimationAchats = async (affaireId, estimationData) => {
  try {
    const { data } = await api.post(`/affaires/${affaireId}/estimation-achats`, estimationData);
    return data;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'estimation:', error);
    throw error;
  }
};

// Récupérer l'estimation d'achats d'une affaire
export const getEstimationAchats = async (affaireId) => {
  try {
    const { data } = await api.get(`/affaires/${affaireId}/estimation-achats`);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'estimation:', error);
    throw error;
  }
};

// Mettre à jour une estimation d'achats existante
export const mettreAJourEstimationAchats = async (affaireId, estimationData) => {
  try {
    const { data } = await api.put(`/affaires/${affaireId}/estimation-achats`, estimationData);
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'estimation:', error);
    throw error;
  }
};

// Supprimer une estimation d'achats
export const supprimerEstimationAchats = async (affaireId) => {
  try {
    const { data } = await api.delete(`/affaires/${affaireId}/estimation-achats`);
    return data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'estimation:', error);
    throw error;
  }
};

// Récupérer les estimations pour le tableau de bord
export const getEstimationsPourDashboard = async (params = {}) => {
  try {
    const { data } = await api.get('/estimations-achats/dashboard', { params });
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des estimations pour le dashboard:', error);
    throw error;
  }
};

export default {
  sauvegarderEstimationAchats,
  getEstimationAchats,
  mettreAJourEstimationAchats,
  supprimerEstimationAchats,
  getEstimationsPourDashboard
}; 