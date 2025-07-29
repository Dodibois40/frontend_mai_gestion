import API from './api';

/**
 * Service de gestion des tâches
 */
const taskService = {
  /**
   * Récupère toutes les tâches avec options de filtrage
   * @param {Object} filters - Filtres (statut, priorite, etc.)
   * @returns {Promise} - Promesse avec liste des tâches
   */
  getAllTasks: async (filters = {}) => {
    try {
      // Construire l'URL avec les paramètres de requête
      const queryParams = new URLSearchParams();
      
      // Ajouter les filtres à l'URL
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      const queryString = queryParams.toString();
      const url = `/tasks${queryString ? `?${queryString}` : ''}`;
      
      return await API.get(url);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Récupère une tâche par son ID
   * @param {String} id - ID de la tâche
   * @returns {Promise} - Promesse avec la tâche
   */
  getTaskById: async (id) => {
    try {
      return await API.get(`/tasks/${id}`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Crée une nouvelle tâche
   * @param {Object} taskData - Données de la tâche
   * @returns {Promise} - Promesse avec la tâche créée
   */
  createTask: async (taskData) => {
    try {
      return await API.post('/tasks', taskData);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Met à jour une tâche existante
   * @param {String} id - ID de la tâche
   * @param {Object} taskData - Données à mettre à jour
   * @returns {Promise} - Promesse avec la tâche mise à jour
   */
  updateTask: async (id, taskData) => {
    try {
      return await API.put(`/tasks/${id}`, taskData);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Supprime une tâche
   * @param {String} id - ID de la tâche
   * @returns {Promise} - Promesse avec confirmation de suppression
   */
  deleteTask: async (id) => {
    try {
      return await API.delete(`/tasks/${id}`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Récupère les statistiques des tâches
   * @returns {Promise} - Promesse avec les statistiques
   */
  getTasksStats: async () => {
    try {
      return await API.get('/tasks/stats');
    } catch (error) {
      throw error;
    }
  }
};

export default taskService; 