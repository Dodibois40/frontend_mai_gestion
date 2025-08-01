import api from './api';

/**
 * Service pour la gestion de l'inventaire et des stocks
 */

// Récupérer tous les articles avec pagination et filtres
export const getArticles = async (params = {}) => {
  try {
    const { data } = await api.get('/inventaire', { params });
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer un article par son ID
export const getArticleById = async (id) => {
  try {
    const { data } = await api.get(`/inventaire/${id}`);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'article ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Créer un nouvel article
export const createArticle = async (articleData) => {
  try {
    const { data } = await api.post('/inventaire', articleData);
    return data;
  } catch (error) {
    console.error("Erreur lors de la création de l'article:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Mettre à jour un article
export const updateArticle = async (id, articleData) => {
  try {
    const { data } = await api.put(`/inventaire/${id}`, articleData);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'article ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Supprimer un article
export const deleteArticle = async (id) => {
  try {
    const { data } = await api.delete(`/inventaire/${id}`);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'article ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Ajuster le stock (entrée ou sortie)
export const ajusterStock = async (id, ajustementData) => {
  try {
    const { data } = await api.post(`/inventaire/${id}/ajuster-stock`, ajustementData);
    return data;
  } catch (error) {
    console.error(`Erreur lors de l'ajustement du stock de l'article ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer les statistiques d'inventaire
export const getStatistiquesInventaire = async () => {
  try {
    const { data } = await api.get('/inventaire/statistiques');
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques d'inventaire:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Obtenir les catégories d'articles pour les filtres
export const getCategoriesArticle = () => {
  return [
    { label: 'Aluminium', value: 'ALUMINIUM' },
    { label: 'Verre', value: 'VERRE' },
    { label: 'Quincaillerie', value: 'QUINCAILLERIE' },
    { label: 'Accessoire', value: 'ACCESSOIRE' },
    { label: 'Outillage', value: 'OUTILLAGE' }
  ];
};

// Obtenir les unités disponibles pour les articles
export const getUnitesArticle = () => {
  return [
    { label: 'Unité', value: 'UNITE' },
    { label: 'Mètre linéaire', value: 'ML' },
    { label: 'Mètre carré', value: 'M2' },
    { label: 'Kilogramme', value: 'KG' }
  ];
}; 