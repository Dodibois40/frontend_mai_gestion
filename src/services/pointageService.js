import api from './api';

/**
 * Service pour la gestion des pointages.
 */

// Créer un nouveau pointage
export const createPointage = async (pointageData) => {
  try {
    const { data } = await api.post('/pointages', pointageData);
    return data;
  } catch (error) {
    console.error("Erreur lors de la création du pointage:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer les pointages avec filtres et pagination
// Les paramètres peuvent inclure : affaireId, userId, dateDebut, dateFin, skip, take
export const getPointages = async (params = {}) => {
  try {
    const { data } = await api.get('/pointages', { params });
    return data; // Devrait retourner { pointages: Pointage[], total: number }
  } catch (error) {
    console.error("Erreur lors de la récupération des pointages:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer un pointage par son ID
export const getPointageById = async (id) => {
  try {
    const { data } = await api.get(`/pointages/${id}`);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du pointage ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Mettre à jour un pointage
export const updatePointage = async (id, pointageData) => {
  try {
    const { data } = await api.patch(`/pointages/${id}`, pointageData);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du pointage ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Supprimer un pointage
export const deletePointage = async (id) => {
  try {
    const { data } = await api.delete(`/pointages/${id}`);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la suppression du pointage ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Potentiellement d'autres fonctions utiles, par exemple :
// export const getPointagesByUser = async (userId, params) => { ... }
// export const getPointagesByAffaire = async (affaireId, params) => { ... }

// Récupérer les statistiques des pointages avec filtres
export const getPointagesStats = async (periode = 'mois') => {
  try {
    // Cette fonction sera remplacée par un appel API réel plus tard
    // Pour l'instant, elle renvoie des données mock pour faire fonctionner le composant
    
    // Simulation du temps de chargement
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      totalHeures: 175.5,
      heuresParType: [
        { type: 'ATELIER', total: 95.0 },
        { type: 'POSE', total: 62.5 },
        { type: 'DEPLACEMENT', total: 18.0 }
      ],
      heuresParAffaire: [
        { affaire: 'A2023-041', total: 42.5 },
        { affaire: 'A2023-053', total: 36.0 },
        { affaire: 'A2023-039', total: 25.5 },
        { affaire: 'A2023-047', total: 22.0 },
        { affaire: 'A2023-051', total: 18.5 }
      ],
      heuresParJour: [
        { date: '2023-06-01', total: 8.5 },
        { date: '2023-06-02', total: 9.0 },
        { date: '2023-06-05', total: 7.5 },
        { date: '2023-06-06', total: 8.0 },
        { date: '2023-06-07', total: 9.5 }
      ]
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

// Export par défaut pour l'import
const pointageService = {
  createPointage,
  getPointages,
  getPointageById,
  updatePointage,
  deletePointage,
  getPointagesStats,
  // Alias pour compatibilité
  getStats: async (periode) => {
    return await getPointagesStats(periode);
  }
};

export default pointageService; 