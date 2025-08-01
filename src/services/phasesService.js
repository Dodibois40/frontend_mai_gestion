import API from './api.js';

const phasesService = {
  // Récupérer toutes les phases d'une affaire
  async getByAffaire(affaireId) {
    try {
      const response = await API.get(`/phases?affaireId=${affaireId}`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des phases');
    }
  },

  // Récupérer une phase par ID
  async getById(id) {
    try {
      const response = await API.get(`/phases/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération de la phase');
    }
  },

  // Créer une nouvelle phase
  async create(data) {
    try {
      console.log('🚀 Données envoyées pour création phase:', data);
      const response = await API.post('/phases', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur détaillée:', error.response?.data || error.message);
      
      // Si c'est un tableau d'erreurs de validation, les afficher en détail
      if (error.response?.data?.message && Array.isArray(error.response.data.message)) {
        console.error('📋 Erreurs de validation:', error.response.data.message);
        throw new Error(`Erreurs de validation: ${error.response.data.message.join(', ')}`);
      }
      
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la phase');
    }
  },

  // Mettre à jour une phase
  async update(id, data) {
    try {
      const response = await API.patch(`/phases/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur détaillée mise à jour:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la phase');
    }
  },

  // Supprimer une phase
  async delete(id) {
    try {
      const response = await API.delete(`/phases/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la suppression de la phase');
    }
  },

  // Récupérer les statistiques d'une phase
  async getStats(id) {
    try {
      const response = await API.get(`/phases/${id}/stats`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  },

  // Recalculer les données réelles d'une phase
  async calculateRealData(id) {
    try {
      const response = await API.patch(`/phases/${id}/calculate`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors du recalcul des données');
    }
  },

  // Récupérer toutes les phases avec filtres
  async getAll(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.affaireId) params.append('affaireId', filters.affaireId);
      if (filters.typePhase) params.append('typePhase', filters.typePhase);
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.skip) params.append('skip', filters.skip);
      if (filters.take) params.append('take', filters.take);

      const response = await API.get(`/phases?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des phases');
    }
  },
};

export default phasesService; 