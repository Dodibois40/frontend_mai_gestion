import API from './api';

const BASE_URL = '/frais-generaux';

export const fraisGenerauxService = {
  // Récupérer tous les frais généraux actifs
  async getAll(includeInactifs = false) {
    try {
      const response = await API.get(`${BASE_URL}?includeInactifs=${includeInactifs}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des frais généraux:', error);
      throw error;
    }
  },

  // Récupérer un frais général par ID
  async getById(id) {
    try {
      const { data } = await API.get(`${BASE_URL}/${id}`);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du frais général:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Créer un nouveau frais général
  async create(fraisGeneralData) {
    try {
      const { data } = await API.post(BASE_URL, fraisGeneralData);
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du frais général:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Mettre à jour un frais général
  async update(id, fraisGeneralData) {
    try {
      const { data } = await API.patch(`${BASE_URL}/${id}`, fraisGeneralData);
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du frais général:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Supprimer (désactiver) un frais général
  async delete(id) {
    try {
      const { data } = await API.delete(`${BASE_URL}/${id}`);
      return data;
    } catch (error) {
      console.error('Erreur lors de la suppression du frais général:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Supprimer définitivement un frais général
  async permanentDelete(id) {
    try {
      const { data } = await API.delete(`${BASE_URL}/${id}/permanent`);
      return data;
    } catch (error) {
      console.error('Erreur lors de la suppression définitive du frais général:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Réactiver un frais général
  async reactivate(id) {
    try {
      const { data } = await API.patch(`${BASE_URL}/${id}/reactivate`);
      return data;
    } catch (error) {
      console.error('Erreur lors de la réactivation du frais général:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Récupérer les statistiques des frais généraux
  async getStats() {
    try {
      const response = await API.get(`${BASE_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats frais généraux:', error);
      throw error;
    }
  },

  // Calculer les frais généraux pour une période
  async calculerFraisGenerauxPeriode(calculDto) {
    try {
      const response = await API.post(`${BASE_URL}/calcul`, calculDto);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du calcul des frais généraux:', error);
      throw error;
    }
  },

  // Initialiser les frais généraux par défaut
  async initialiserDefaut() {
    try {
      const { data } = await API.post(`${BASE_URL}/initialiser`);
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Utilitaire pour calculer les jours ouvrés côté frontend
  calculerJoursOuvres(dateDebut, dateFin, joursParSemaine = 5) {
    let joursOuvres = 0;
    const currentDate = new Date(dateDebut);
    const finDate = new Date(dateFin);

    // Assurer que nous incluons la date de fin
    finDate.setHours(23, 59, 59, 999);

    while (currentDate <= finDate) {
      const dayOfWeek = currentDate.getDay();
      
      // 0 = Dimanche, 6 = Samedi
      if (joursParSemaine === 5) {
        // Lundi à Vendredi
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          joursOuvres++;
        }
      } else if (joursParSemaine === 6) {
        // Lundi à Samedi
        if (dayOfWeek >= 1 && dayOfWeek <= 6) {
          joursOuvres++;
        }
      } else if (joursParSemaine === 7) {
        // Tous les jours
        joursOuvres++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return joursOuvres;
  },
};

export default fraisGenerauxService; 