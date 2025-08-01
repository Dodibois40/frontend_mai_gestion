import api from './api';

/**
 * Service pour la gestion des mouvements de stock.
 */

// Créer un nouveau mouvement de stock
export const createMouvementStock = async (mouvementData) => {
  try {
    const { data } = await api.post('/mouvements-stock', mouvementData);
    return data;
  } catch (error) {
    console.error("Erreur lors de la création du mouvement de stock:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer tous les mouvements avec filtres et pagination
export const getMouvementsStock = async (params = {}) => {
  try {
    const { data } = await api.get('/mouvements-stock', { params });
    return data; // Devrait retourner { mouvements: MouvementStock[], total: number }
  } catch (error) {
    console.error("Erreur lors de la récupération des mouvements de stock:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer un mouvement par son ID
export const getMouvementStockById = async (id) => {
  try {
    const { data } = await api.get(`/mouvements-stock/${id}`);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du mouvement ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer l'historique des mouvements d'un article
export const getHistoriqueMouvementsArticle = async (articleId, params = {}) => {
  try {
    const { data } = await api.get(`/mouvements-stock/article/${articleId}`, { params });
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'historique de l'article ${articleId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer les statistiques des mouvements
export const getMouvementsStockStats = async (params = {}) => {
  try {
    const { data } = await api.get('/mouvements-stock/stats', { params });
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques des mouvements:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Types de mouvements disponibles
export const TYPES_MOUVEMENT = {
  ENTREE: 'ENTREE',
  SORTIE: 'SORTIE',
  AJUSTEMENT: 'AJUSTEMENT',
  INVENTAIRE: 'INVENTAIRE',
};

// Labels pour les types de mouvements
export const LABELS_TYPES_MOUVEMENT = {
  [TYPES_MOUVEMENT.ENTREE]: 'Entrée',
  [TYPES_MOUVEMENT.SORTIE]: 'Sortie',
  [TYPES_MOUVEMENT.AJUSTEMENT]: 'Ajustement',
  [TYPES_MOUVEMENT.INVENTAIRE]: 'Inventaire',
}; 