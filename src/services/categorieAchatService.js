import api from './api';

/**
 * Service pour la gestion des catégories d'achat
 */

// Récupérer toutes les catégories d'achat
export const getCategoriesAchat = async () => {
  try {
    const { data } = await api.get('/categories-achat');
    return data;
  } catch (error) {
    throw error;
  }
}; 