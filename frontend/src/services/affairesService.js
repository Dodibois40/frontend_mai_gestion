import api from './api.js';

const AFFAIRES_ENDPOINTS = '/affaires';

// Service pour la gestion des affaires
const affairesService = {
  // Obtenir toutes les affaires avec filtres et pagination
  async getAffaires(params = {}) {
    try {
      const response = await api.get(AFFAIRES_ENDPOINTS, { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des affaires:', error);
      throw error;
    }
  },

  // Obtenir une affaire par ID
  async getAffaireById(id) {
    try {
      const response = await api.get(`${AFFAIRES_ENDPOINTS}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'affaire ${id}:`, error);
      throw error;
    }
  },

  // Créer une nouvelle affaire
  async createAffaire(data) {
    try {
      const response = await api.post(AFFAIRES_ENDPOINTS, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'affaire:', error);
      throw error;
    }
  },

  // Mettre à jour une affaire
  async updateAffaire(id, data) {
    try {
      const response = await api.patch(`${AFFAIRES_ENDPOINTS}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'affaire ${id}:`, error);
      throw error;
    }
  },

  // Supprimer une affaire
  async deleteAffaire(id) {
    try {
      const response = await api.delete(`${AFFAIRES_ENDPOINTS}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'affaire ${id}:`, error);
      throw error;
    }
  },

  // Supprimer une affaire avec toutes ses dépendances (suppression forcée)
  async forceDeleteAffaire(id) {
    try {
      const response = await api.delete(`${AFFAIRES_ENDPOINTS}/${id}/force`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression forcée de l'affaire ${id}:`, error);
      throw error;
    }
  },

  // Dupliquer une affaire avec un nouveau numéro
  async duplicateAffaire(id) {
    try {
      const response = await api.post(`${AFFAIRES_ENDPOINTS}/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la duplication de l'affaire ${id}:`, error);
      throw error;
    }
  },

  // Obtenir les statistiques globales
  async getGlobalStats() {
    try {
      const response = await api.get(`${AFFAIRES_ENDPOINTS}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  // Obtenir les affaires par statut
  async getAffairesByStatus(statut) {
    try {
      const response = await api.get(AFFAIRES_ENDPOINTS, {
        params: { statut }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des affaires par statut:', error);
      throw error;
    }
  },

  // Obtenir les affaires en retard
  async getAffairesEnRetard() {
    try {
      const today = new Date();
      const response = await api.get(AFFAIRES_ENDPOINTS, {
        params: {
          dateCloturePrevue_lt: today.toISOString(),
          statut_ne: 'TERMINE'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des affaires en retard:', error);
      throw error;
    }
  },

  // Obtenir le chiffre d'affaires par période
  async getChiffreAffaires(dateDebut, dateFin) {
    try {
      const response = await api.get(`${AFFAIRES_ENDPOINTS}/chiffre-affaires`, {
        params: { dateDebut, dateFin }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du chiffre d\'affaires:', error);
      throw error;
    }
  },

  // Clôturer une affaire
  async cloturerAffaire(id, donneesCloture = {}) {
    try {
      const response = await api.patch(`${AFFAIRES_ENDPOINTS}/${id}/cloturer`, donneesCloture);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la clôture de l\'affaire:', error);
      throw error;
    }
  },

  // Obtenir les affaires du client
  async getAffairesClient(client) {
    try {
      const response = await api.get(AFFAIRES_ENDPOINTS, {
        params: { client }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des affaires du client:', error);
      throw error;
    }
  },

  // Rechercher des affaires
  async searchAffaires(query) {
    try {
      const response = await api.get(`${AFFAIRES_ENDPOINTS}/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche d\'affaires:', error);
      throw error;
    }
  },

  // Obtenir les dernières affaires modifiées
  async getRecentAffaires(limit = 5) {
    try {
      const response = await api.get(`${AFFAIRES_ENDPOINTS}/recent`, { 
        params: { limit } 
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des affaires récentes:', error);
      throw error;
    }
  },

  // Fonctions utilitaires
  formatStatut(statut) {
    const statuts = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'SUSPENDU': 'Suspendu',
      'TERMINE': 'Terminé',
      'ANNULE': 'Annulé'
    };
    return statuts[statut] || statut;
  },

  getStatutColor(statut) {
    const colors = {
      'EN_ATTENTE': 'yellow',
      'EN_COURS': 'blue',
      'SUSPENDU': 'orange',
      'TERMINE': 'green',
      'ANNULE': 'red'
    };
    return colors[statut] || 'gray';
  },

  formatMontant(montant) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant || 0);
  },

  formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
  },

  // Calculer le pourcentage d'avancement à partir d'un statut
  calculerProgression(statut) {
    switch (statut) {
      case 'EN_ATTENTE':
        return 25;
      case 'EN_COURS':
        return 50; // Peut être affiné avec plus de logique métier
      case 'SUSPENDU':
        return 75;
      case 'TERMINE':
        return 100;
      case 'ANNULE':
        return 0;
      default:
        return 0;
    }
  },

  // Mettre à jour les données réelles d'une affaire
  async updateAffaireReel(id, reelData) {
    try {
      const response = await api.patch(`${AFFAIRES_ENDPOINTS}/${id}/reel`, reelData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données réelles:', error);
      throw error;
    }
  },

  // Calculer automatiquement les données réelles
  async calculateRealData(id) {
    try {
      const response = await api.post(`${AFFAIRES_ENDPOINTS}/${id}/calculate-real`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du calcul des données réelles:', error);
      throw error;
    }
  },

  // Obtenir les statistiques comparatives (Objectif vs Réel)
  async getComparativeStats(id) {
    try {
      const response = await api.get(`${AFFAIRES_ENDPOINTS}/${id}/comparative-stats`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques comparatives:', error);
      throw error;
    }
  },

  // Formater les pourcentages d'écart
  formatEcartPercentage(reel, objectif) {
    if (!objectif || objectif === 0) return 'N/A';
    const ecart = ((reel - objectif) / objectif) * 100;
    const sign = ecart >= 0 ? '+' : '';
    return `${sign}${ecart.toFixed(1)}%`;
  },

  // Obtenir la couleur selon l'écart
  getEcartColor(reel, objectif) {
    if (!objectif || objectif === 0) return 'text-gray-500';
    const ecart = ((reel - objectif) / objectif) * 100;
    
    if (ecart > 10) return 'text-red-600'; // Dépassement important
    if (ecart > 0) return 'text-orange-600'; // Léger dépassement
    if (ecart > -10) return 'text-green-600'; // Dans les clous
    return 'text-blue-600'; // Sous-consommation importante
  },

  // Obtenir la situation financière complète (incluant les coûts des phases)
  async getFinancialSituation(id) {
    try {
      const response = await api.get(`${AFFAIRES_ENDPOINTS}/${id}/financial-situation`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la situation financière:', error);
      throw error;
    }
  },

  // Calculer les coûts totaux des phases
  async getPhasesCosts(id) {
    try {
      const response = await api.get(`${AFFAIRES_ENDPOINTS}/${id}/phases-costs`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du calcul des coûts des phases:', error);
      throw error;
    }
  },

  // Récupérer les achats par catégorie (estimé vs réel)
  async getAchatsParCategorie(affaireId) {
    try {
      const response = await api.get(`${AFFAIRES_ENDPOINTS}/${affaireId}/achats-categorie`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des achats par catégorie:', error);
      throw error;
    }
  },

  // Mettre à jour les estimations d'achats par catégorie
  async updateEstimationsAchatCategorie(affaireId, estimations) {
    try {
      const response = await api.put(`${AFFAIRES_ENDPOINTS}/${affaireId}/estimations-achat-categorie`, {
        estimations
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des estimations par catégorie:', error);
      throw error;
    }
  },

  // Calculer les coûts d'une affaire
  async calculateCosts(id) {
    try {
      const response = await api.post(`${AFFAIRES_ENDPOINTS}/${id}/calculate-costs`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du calcul des coûts de l'affaire ${id}:`, error);
      throw error;
    }
  },

  // Changer le statut d'une affaire
  async changeStatus(id, status) {
    try {
      const response = await api.patch(`${AFFAIRES_ENDPOINTS}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du changement de statut de l'affaire ${id}:`, error);
      throw error;
    }
  }
};

export { affairesService }; 