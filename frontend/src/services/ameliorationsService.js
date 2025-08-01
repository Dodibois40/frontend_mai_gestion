import api from './api';

const ameliorationsService = {
  // Récupérer toutes les améliorations avec filtres
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.type && params.type !== 'ALL') {
      queryParams.append('type', params.type);
    }
    
    if (params.statut && params.statut !== 'ALL') {
      queryParams.append('statut', params.statut);
    }
    
    if (params.search) {
      queryParams.append('search', params.search);
    }
    
    if (params.page) {
      queryParams.append('page', params.page);
    }
    
    if (params.limit) {
      queryParams.append('limit', params.limit);
    }

    const url = `/ameliorations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Récupérer une amélioration par ID
  async getById(id) {
    const response = await api.get(`/ameliorations/${id}`);
    return response.data;
  },

  // Créer une nouvelle amélioration
  async create(data) {
    const response = await api.post('/ameliorations', data);
    return response.data;
  },

  // Mettre à jour une amélioration
  async update(id, data) {
    const response = await api.patch(`/ameliorations/${id}`, data);
    return response.data;
  },

  // Supprimer une amélioration
  async delete(id) {
    const response = await api.delete(`/ameliorations/${id}`);
    return response.data;
  },

  // Récupérer les statistiques
  async getStats() {
    const response = await api.get('/ameliorations/stats');
    return response.data;
  }
};

export default ameliorationsService;