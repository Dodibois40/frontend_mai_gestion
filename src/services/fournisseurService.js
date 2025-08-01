import api from './api';

const BASE_URL = '/fournisseurs';

// Créer un nouveau fournisseur
export const createFournisseur = async (fournisseurData) => {
  try {
    const response = await api.post(BASE_URL, fournisseurData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du fournisseur:', error);
    throw error;
  }
};

// Récupérer tous les fournisseurs avec pagination et filtres
export const getFournisseurs = async (params = {}) => {
  try {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error);
    throw error;
  }
};

// Récupérer tous les fournisseurs actifs (pour les listes déroulantes)
export const getFournisseursActifs = async () => {
  try {
    const response = await api.get(`${BASE_URL}/active`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs actifs:', error);
    throw error;
  }
};

// Récupérer un fournisseur par ID
export const getFournisseur = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du fournisseur:', error);
    throw error;
  }
};

// Mettre à jour un fournisseur
export const updateFournisseur = async (id, fournisseurData) => {
  try {
    const response = await api.patch(`${BASE_URL}/${id}`, fournisseurData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du fournisseur:', error);
    throw error;
  }
};

// Désactiver un fournisseur
export const deleteFournisseur = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du fournisseur:', error);
    throw error;
  }
};

// Réactiver un fournisseur
export const reactivateFournisseur = async (id) => {
  try {
    const response = await api.patch(`${BASE_URL}/${id}/reactivate`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la réactivation du fournisseur:', error);
    throw error;
  }
};

// Récupérer les statistiques des fournisseurs
export const getFournisseurStats = async () => {
  try {
    const response = await api.get(`${BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

// Supprimer définitivement un fournisseur
export const deleteFournisseurPermanent = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}/${id}/permanent`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression définitive du fournisseur:', error);
    throw error;
  }
};

// Export par défaut
export default {
  createFournisseur,
  getFournisseurs,
  getFournisseursActifs,
  getFournisseur,
  updateFournisseur,
  deleteFournisseur,
  reactivateFournisseur,
  getFournisseurStats,
  deleteFournisseurPermanent,
}; 