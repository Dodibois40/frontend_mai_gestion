import api from './api';

/**
 * Service pour la gestion des paramètres globaux.
 */

// Créer un nouveau paramètre
export const createParametre = async (parametreData) => {
  try {
    const { data } = await api.post('/parametres', parametreData);
    return data;
  } catch (error) {
    console.error("Erreur lors de la création du paramètre:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer tous les paramètres
export const getParametres = async () => {
  try {
    const { data } = await api.get('/parametres');
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer un paramètre par son ID
export const getParametreById = async (id) => {
  try {
    const { data } = await api.get(`/parametres/${id}`);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du paramètre ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer un paramètre par sa clé
export const getParametreByKey = async (cle) => {
  try {
    const { data } = await api.get(`/parametres/key/${cle}`);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du paramètre avec la clé ${cle}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Mettre à jour un paramètre
export const updateParametre = async (id, parametreData) => {
  try {
    const { data } = await api.patch(`/parametres/${id}`, parametreData);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du paramètre ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Supprimer un paramètre
export const deleteParametre = async (id) => {
  try {
    const { data } = await api.delete(`/parametres/${id}`);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la suppression du paramètre ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Initialiser les paramètres par défaut
export const initializeDefaultParameters = async () => {
  try {
    const { data } = await api.post('/parametres/initialize');
    return data;
  } catch (error) {
    console.error("Erreur lors de l'initialisation des paramètres par défaut:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Fonctions utilitaires pour récupérer des valeurs spécifiques
export const getTauxHoraire = async () => {
  try {
    const { data } = await api.get('/parametres/values/taux-horaire');
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération du taux horaire:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getTauxFraisGeneraux = async () => {
  try {
    const { data } = await api.get('/parametres/values/taux-frais-generaux');
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération du taux de frais généraux:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getTauxTVA = async () => {
  try {
    const { data } = await api.get('/parametres/values/taux-tva');
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération du taux de TVA:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
}; 