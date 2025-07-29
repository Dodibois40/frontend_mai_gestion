import api from './api';

/**
 * Service pour la gestion des articles d'inventaire.
 */

// Créer un nouvel article
export const createArticle = async (articleData) => {
  try {
    const { data } = await api.post('/articles', articleData);
    return data;
  } catch (error) {
    console.error("Erreur lors de la création de l'article:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer tous les articles avec filtres et pagination
export const getArticles = async (params = {}) => {
  try {
    const { data } = await api.get('/articles', { params });
    return data; // Devrait retourner { articles: Article[], total: number }
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer un article par son ID
export const getArticleById = async (id) => {
  try {
    const { data } = await api.get(`/articles/${id}`);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'article ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Mettre à jour un article
export const updateArticle = async (id, articleData) => {
  try {
    const { data } = await api.patch(`/articles/${id}`, articleData);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'article ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Supprimer un article (désactivation)
export const deleteArticle = async (id) => {
  try {
    const { data } = await api.delete(`/articles/${id}`);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'article ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer les statistiques des articles
export const getArticlesStats = async () => {
  try {
    const { data } = await api.get('/articles/stats');
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques des articles:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer les articles avec stock faible
export const getArticlesStockFaible = async () => {
  try {
    const { data } = await api.get('/articles/stock-faible');
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des articles à stock faible:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Alias pour getArticleById (compatibilité)
export const getArticle = getArticleById;

// Export par défaut pour l'import
const articlesService = {
  createArticle,
  getArticles,
  getArticleById,
  getArticle,
  updateArticle,
  deleteArticle,
  getArticlesStats,
  getArticlesStockFaible
};

export default articlesService; 