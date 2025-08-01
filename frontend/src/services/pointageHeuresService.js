import api from './api';

const pointageHeuresService = {
  // Créer un nouveau pointage
  async createPointage(pointageData) {
    try {
      const response = await api.post('/pointage-heures', pointageData);
      return response.data;
    } catch (error) {
      console.error('Erreur création pointage:', error);
      throw error;
    }
  },

  // Obtenir tous les pointages avec filtres
  async getPointages(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
      if (filters.dateFin) params.append('dateFin', filters.dateFin);
      if (filters.lieuTravail) params.append('lieuTravail', filters.lieuTravail);

      const response = await api.get(`/pointage-heures?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération pointages:', error);
      throw error;
    }
  },

  // Obtenir les pointages par période
  async getPointagesByPeriod(dateDebut, dateFin) {
    try {
      const response = await api.get(`/pointage-heures/periode/${dateDebut}/${dateFin}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération pointages par période:', error);
      throw error;
    }
  },

  // Obtenir un pointage par ID
  async getPointage(id) {
    try {
      const response = await api.get(`/pointage-heures/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération pointage:', error);
      throw error;
    }
  },

  // Mettre à jour un pointage
  async updatePointage(id, pointageData) {
    try {
      const response = await api.patch(`/pointage-heures/${id}`, pointageData);
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour pointage:', error);
      throw error;
    }
  },

  // Supprimer un pointage
  async deletePointage(id) {
    try {
      const response = await api.delete(`/pointage-heures/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur suppression pointage:', error);
      throw error;
    }
  },

  // Obtenir les statistiques d'un utilisateur
  async getStatistiquesUtilisateur(userId, dateDebut, dateFin) {
    try {
      const response = await api.get(`/pointage-heures/stats/utilisateur/${userId}?dateDebut=${dateDebut}&dateFin=${dateFin}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération statistiques utilisateur:', error);
      throw error;
    }
  },

  // Obtenir les statistiques de l'équipe
  async getStatistiquesEquipe(dateDebut, dateFin) {
    try {
      const response = await api.get(`/pointage-heures/stats/equipe?dateDebut=${dateDebut}&dateFin=${dateFin}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération statistiques équipe:', error);
      throw error;
    }
  },

  // Utilitaires
  TypePresence: {
    PRESENT: 'PRESENT',
    ABSENT: 'ABSENT',
    RETARD: 'RETARD',
    CONGE: 'CONGE',
    MALADIE: 'MALADIE'
  },

  LieuTravail: {
    ATELIER_CAME: 'ATELIER_CAME',
    ATELIER_HOSSEGOR: 'ATELIER_HOSSEGOR',
    CHANTIER: 'CHANTIER'
  },

  // Helpers pour la gestion des dates
  formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
  },

  formatDateDisplay(date) {
    return new Date(date).toLocaleDateString('fr-FR');
  },

  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour commencer par lundi
    return new Date(d.setDate(diff));
  },

  getWeekEnd(date) {
    const start = this.getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  },

  getMonthStart(date) {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  },

  getMonthEnd(date) {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  }
};

export default pointageHeuresService; 