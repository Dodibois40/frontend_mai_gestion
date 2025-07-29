import api from './api.js';

// Palette de 24 couleurs distinctives pour les affaires
const COLOR_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
  '#F1948A', '#85C1E9', '#D7BDE2', '#A3E4D7', '#F9E79F', '#D5A6BD',
  '#AED6F1', '#A9DFBF', '#FAD7A0', '#E8DAEF', '#D6EAF8', '#D5F4E6'
];

// Cache local pour les couleurs d'affaires
const colorCache = new Map();

class PlanningInteractifService {
  
  // Générer une couleur automatique pour une affaire
  getAutoColor(affaireId) {
    if (colorCache.has(affaireId)) {
      return colorCache.get(affaireId);
    }
    
    const hash = affaireId.toString().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const color = COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
    colorCache.set(affaireId, color);
    
    return color;
  }

  // Récupérer les affaires pour le planning
  async getAffairesPlanning(dateDebut, dateFin) {
    try {
      const response = await api.get('/planning/affaires', {
        params: { 
          dateDebut: dateDebut.toISOString(),
          dateFin: dateFin.toISOString()
        }
      });
      
      // Ajouter la couleur automatique à chaque affaire
      const affairesWithColors = response.data.map(affaire => ({
        ...affaire,
        couleur: affaire.couleur || this.getAutoColor(affaire.id),
        dateDebut: new Date(affaire.dateDebut),
        dateFin: new Date(affaire.dateFin)
      }));
      
      return affairesWithColors;
    } catch (error) {
      console.error('Erreur lors de la récupération des affaires planning:', error);
      
      // Fallback : utiliser les affaires existantes
      try {
        const response = await api.get('/affaires');
        return response.data.map(affaire => ({
          ...affaire,
          couleur: this.getAutoColor(affaire.id),
          dateDebut: affaire.dateDebutPrevue ? new Date(affaire.dateDebutPrevue) : new Date(),
          dateFin: affaire.dateCloturePrevue ? new Date(affaire.dateCloturePrevue) : new Date()
        }));
      } catch (fallbackError) {
        console.error('Erreur fallback affaires:', fallbackError);
        throw error;
      }
    }
  }

  // Déplacer une affaire dans le planning
  async moveAffaire(affaireId, newDateDebut, newDateFin) {
    try {
      const response = await api.patch(`/planning/affaires/${affaireId}/planning`, {
        dateDebut: newDateDebut.toISOString(),
        dateFin: newDateFin.toISOString()
      });
      
      // Notification temps réel (si supporté)
      this.notifyPlanningChange(affaireId, 'MOVED');
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors du déplacement de l\'affaire:', error);
      throw error;
    }
  }

  // Mettre à jour la couleur d'une affaire
  async updateCouleur(affaireId, couleur) {
    try {
      const response = await api.patch(`/affaires/${affaireId}/couleur`, { couleur });
      
      // Mettre à jour le cache local
      colorCache.set(affaireId, couleur);
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de couleur:', error);
      // Fallback : garder en cache local uniquement
      colorCache.set(affaireId, couleur);
      return { id: affaireId, couleur };
    }
  }

  // Récupérer les utilisateurs/équipes
  async getUsers() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  // Notifications temps réel pour changements planning
  notifyPlanningChange(affaireId, action) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(`Planning mis à jour`, {
          body: `Affaire ${affaireId} ${action.toLowerCase()}`,
          icon: '/favicon.ico',
          tag: 'planning-update'
        });
      }).catch(error => {
        console.log('Notifications pas supportées:', error);
      });
    }
  }

  // Récupérer les affaires par période (jour/semaine/mois)
  async getAffairesByPeriod(startDate, endDate, viewType = 'week') {
    try {
      const response = await api.get('/planning/affaires/period', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          viewType
        }
      });
      
      return response.data.map(affaire => ({
        ...affaire,
        couleur: affaire.couleur || this.getAutoColor(affaire.id),
        dateDebut: new Date(affaire.dateDebut),
        dateFin: new Date(affaire.dateFin)
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération par période:', error);
      // Fallback vers getAffairesPlanning
      return this.getAffairesPlanning(startDate, endDate);
    }
  }

  // Récupérer les stats du planning
  async getPlanningStats(dateDebut, dateFin) {
    try {
      const response = await api.get('/planning/stats', {
        params: {
          dateDebut: dateDebut.toISOString(),
          dateFin: dateFin.toISOString()
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      return {
        totalAffaires: 0,
        affairesEnCours: 0,
        affairesTerminees: 0,
        affairesPlanifiees: 0,
        chargeEquipe: 0
      };
    }
  }

  // Valider le déplacement d'une affaire
  validateMove(affaire, newStartDate, newEndDate) {
    const errors = [];
    
    // Vérifier que la date de fin n'est pas avant la date de début
    if (newEndDate && newStartDate > newEndDate) {
      errors.push('La date de fin ne peut pas être antérieure à la date de début');
    }
    
    // Vérifier que la date de début n'est pas dans le passé (pour nouvelles affaires)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newStartDate < today && affaire.statut === 'PLANIFIEE') {
      errors.push('Impossible de planifier une affaire dans le passé');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Nettoyer le cache des couleurs
  clearColorCache() {
    colorCache.clear();
  }

  // Obtenir toutes les couleurs en cache
  getCachedColors() {
    return Object.fromEntries(colorCache);
  }
}

const planningInteractifService = new PlanningInteractifService();
export default planningInteractifService; 