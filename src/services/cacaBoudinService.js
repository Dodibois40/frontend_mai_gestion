import API from './api';

const cacaBoudinService = {
  // Récupérer tous les CACA boudins
  getAll: async () => {
    try {
      const response = await API.get('/caca-boudin');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des CACA boudins:', error);
      throw error;
    }
  },

  // Récupérer un CACA boudin par ID
  getById: async (id) => {
    try {
      const response = await API.get(`/caca-boudin/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du CACA boudin ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau CACA boudin
  create: async (data) => {
    try {
      const response = await API.post('/caca-boudin', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du CACA boudin:', error);
      throw error;
    }
  },

  // Modifier un CACA boudin
  update: async (id, data) => {
    try {
      const response = await API.patch(`/caca-boudin/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la modification du CACA boudin ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un CACA boudin
  delete: async (id) => {
    try {
      const response = await API.delete(`/caca-boudin/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du CACA boudin ${id}:`, error);
      throw error;
    }
  },

  // Récupérer les statistiques
  getStats: async () => {
    try {
      const response = await API.get('/caca-boudin/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
};

export default cacaBoudinService; 