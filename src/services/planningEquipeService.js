import api from './api';
import usersService from './usersService';

/**
 * Service pour gérer le planning équipe
 */
class PlanningEquipeService {
  // =============== RÉCUPÉRATION DES DONNÉES ===============

  /**
   * Récupérer le planning hebdomadaire
   * @param {string} dateDebut - Date de début de semaine (format ISO)
   * @param {boolean} inclureTerminees - Inclure les affectations terminées
   * @returns {Promise} Planning hebdomadaire
   */
  async getPlanningHebdomadaire(dateDebut, inclureTerminees = false) {
    try {
      const response = await api.get('/planning-equipe/semaine', {
        params: {
          dateDebut,
          inclureTerminees
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du planning hebdomadaire:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du planning');
    }
  }

  /**
   * Récupérer la liste des ouvriers disponibles pour le planning
   * @returns {Promise} Liste des ouvriers avec leurs couleurs
   */
  async getOuvriersDisponibles() {
    try {
      console.log('🔄 [PlanningEquipeService] Récupération équipe disponible');
      const response = await api.get('/planning-equipe/ouvriers-disponibles');
      console.log('✅ [PlanningEquipeService] Équipe récupérée:', response.data);
      
      // Adapter la structure des données pour le frontend
      const { salaries, sousTraitants } = response.data;
      return {
        salaries: salaries || [],
        sousTraitants: sousTraitants || []
      };
    } catch (error) {
      console.error('❌ [PlanningEquipeService] Erreur récupération équipe:', error);
      throw error;
    }
  }

  /**
   * Récupérer la liste des affaires actives
   * @returns {Promise} Liste des affaires actives
   */
  async getAffairesActives() {
    try {
      const response = await api.get('/planning-equipe/affaires-actives');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des affaires:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des affaires');
    }
  }

  /**
   * Obtenir les statistiques du planning pour une semaine
   * @param {string} dateDebut - Date de début de semaine (ISO)
   * @returns {Promise} Statistiques du planning
   */
  async getStatistiquesPlanning(dateDebut) {
    try {
      const response = await api.get('/planning-equipe/statistiques', {
        params: {
          dateDebut
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // =============== GESTION DES AFFECTATIONS ===============

  /**
   * Affecter un ouvrier au planning
   * @param {Object} affectationData - Données de l'affectation
   * @param {string} affectationData.affaireId - ID de l'affaire
   * @param {string} affectationData.userId - ID de l'ouvrier
   * @param {string} affectationData.dateAffectation - Date d'affectation (ISO)
   * @param {string} affectationData.periode - Période (MATIN ou APREM)
   * @param {string} affectationData.typeActivite - Type d'activité (FABRICATION ou POSE)
   * @param {string} affectationData.commentaire - Commentaire optionnel
   * @returns {Promise} Affectation créée
   */
  async affecterOuvrier(affectationData) {
    try {
      const response = await api.post('/planning-equipe/affecter', affectationData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'affectation');
    }
  }

  /**
   * Mettre à jour une affectation existante
   * @param {string} affectationId - ID de l'affectation
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise} Affectation mise à jour
   */
  async updateAffectation(affectationId, updateData) {
    try {
      const response = await api.put(`/planning-equipe/affectation/${affectationId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  }

  /**
   * Modifier le type d'activité d'une affectation
   * @param {string} affectationId - ID de l'affectation
   * @param {string} typeActivite - Nouveau type d'activité (FABRICATION ou POSE)
   * @returns {Promise} Affectation mise à jour
   */
  async modifierTypeActivite(affectationId, typeActivite) {
    try {
      const response = await api.put(`/planning-equipe/modifier-activite/${affectationId}`, {
        typeActivite
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la modification du type d\'activité:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  }

  /**
   * Désaffecter un ouvrier (supprimer affectation)
   * @param {string} affectationId - ID de l'affectation à supprimer
   * @returns {Promise} Confirmation de suppression
   */
  async desaffecterOuvrier(affectationId) {
    try {
      const response = await api.delete(`/planning-equipe/desaffecter/${affectationId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la désaffectation:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la désaffectation');
    }
  }

  // =============== VALIDATION ET STATISTIQUES ===============

  /**
   * Valider la disponibilité d'un ouvrier pour une affectation
   * @param {string} affaireId - ID de l'affaire
   * @param {string} userId - ID de l'ouvrier
   * @param {string} dateAffectation - Date d'affectation (ISO)
   * @param {string} periode - Période (MATIN ou APREM)
   * @returns {Promise} Résultat de la validation
   */
  async validerDisponibilite(affaireId, userId, dateAffectation, periode) {
    try {
      const response = await api.get(`/planning-equipe/validation/${affaireId}/${userId}`, {
        params: {
          dateAffectation,
          periode
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la validation');
    }
  }

  // Nouvelle méthode : Récupérer l'historique complet des affectations d'un ouvrier sur une affaire
  async getHistoriqueOuvrierAffaire(userId, affaireId) {
    try {
      console.log(`📊 Récupération historique ouvrier ${userId} sur affaire ${affaireId}...`);
      
      const response = await api.get(`/planning-equipe/historique/${userId}/${affaireId}`);
      
      console.log('📊 Historique récupéré:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique ouvrier-affaire:', error);
      throw error;
    }
  }

  // Nouvelle méthode : Récupérer les totaux historiques complets pour une affaire
  async getTotauxHistoriquesAffaire(affaireId) {
    try {
      console.log(`📊 Récupération totaux historiques pour affaire ${affaireId}...`);
      
      const response = await api.get(`/planning-equipe/totaux-historiques-affaire/${affaireId}`);
      
      console.log('📊 Totaux historiques récupérés:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des totaux historiques affaire:', error);
      throw error;
    }
  }

  /**
   * 📊 NOUVEAU : Récupérer les frais généraux de la semaine avec détails d'absorption
   * @param {string} dateRef - Date de référence pour identifier la semaine (format ISO)
   * @returns {Promise} Informations complètes sur les frais généraux de la semaine
   */
  async getFraisGenerauxSemaine(dateRef) {
    try {
      console.log(`📊 Récupération frais généraux semaine pour date: ${dateRef}`);
      
      const response = await api.get('/planning-equipe/frais-generaux-semaine', {
        params: { dateRef }
      });
      
      console.log('📊 Frais généraux semaine récupérés:', {
        semaine: response.data.semaine,
        annee: response.data.annee,
        fraisGenerauxRestants: response.data.fraisGenerauxRestants,
        tauxAbsorption: response.data.tauxAbsorption
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des frais généraux semaine:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des frais généraux de la semaine');
    }
  }

  // =============== UTILITAIRES ===============

  /**
   * Obtenir le début de la semaine pour une date donnée
   * @param {Date} date - Date de référence
   * @returns {string} Date de début de semaine (ISO)
   */
  getDebutSemaine(date = new Date()) {
    const debut = new Date(date);
    const jour = debut.getDay();
    // Calculer le nombre de jours à soustraire pour arriver au lundi
    // Dimanche = 0, Lundi = 1, Mardi = 2, etc.
    // Si c'est dimanche (0), on veut le lundi suivant (+1)
    // Si c'est lundi (1), on reste sur le lundi actuel (0)
    // Si c'est mardi (2), on recule d'un jour (-1)
    const diff = jour === 0 ? 1 : -(jour - 1);
    debut.setDate(debut.getDate() + diff);
    debut.setHours(0, 0, 0, 0);
    return debut.toISOString().split('T')[0];
  }

  /**
   * Obtenir les dates de la semaine
   * @param {string} dateDebut - Date de début de semaine (ISO)
   * @returns {Array} Tableau des dates de la semaine
   */
  getDatesJoursSemaine(dateDebut) {
    const dates = [];
    for (let i = 0; i < 5; i++) { // Lundi à Vendredi
      const date = new Date(dateDebut);
      date.setDate(date.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        nom: date.toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase(),
        numeroJour: date.getDate(),
        mois: date.toLocaleDateString('fr-FR', { month: '2-digit' }),
        annee: date.getFullYear()
      });
    }
    return dates;
  }

  /**
   * Formater la couleur de l'employé
   * @param {Object} employe - Objet employé avec couleurPlanning
   * @returns {string} Classes CSS pour la couleur
   */
  getEmployeeColorClass(employe) {
    if (!employe?.couleurPlanning) {
      return 'bg-gray-100 text-gray-700 border-gray-200';
    }

    // Conversion couleur hex vers classes Tailwind (palette terre/bois/olive/soleil)
    const colorMap = {
      // Tons terre
      '#8B4513': 'bg-yellow-100 text-yellow-800 border-yellow-200', // Marron terre cuite
      '#A0522D': 'bg-orange-100 text-orange-800 border-orange-200', // Brun sienna
      '#CD853F': 'bg-amber-100 text-amber-800 border-amber-200', // Brun doré
      '#D2691E': 'bg-orange-100 text-orange-700 border-orange-200', // Chocolat
      
      // Tons bois
      '#DEB887': 'bg-yellow-50 text-yellow-700 border-yellow-200', // Bois clair
      '#BC8F8F': 'bg-rose-100 text-rose-700 border-rose-200', // Bois rosé
      '#F4A460': 'bg-orange-100 text-orange-700 border-orange-200', // Bois de sable
      '#DAA520': 'bg-yellow-100 text-yellow-700 border-yellow-200', // Bois doré
      
      // Tons olive
      '#556B2F': 'bg-green-100 text-green-800 border-green-200', // Olive foncé
      '#6B8E23': 'bg-lime-100 text-lime-800 border-lime-200', // Olive yellow green
      '#808000': 'bg-yellow-100 text-yellow-800 border-yellow-200', // Olive classique
      '#9ACD32': 'bg-lime-100 text-lime-700 border-lime-200', // Olive clair
      
      // Tons soleil
      '#FF8C00': 'bg-orange-100 text-orange-700 border-orange-200', // Orange soleil
      '#FFB347': 'bg-orange-100 text-orange-600 border-orange-200', // Orange pêche
      '#FFA500': 'bg-orange-100 text-orange-700 border-orange-200', // Orange vif
      '#F0E68C': 'bg-yellow-100 text-yellow-700 border-yellow-200', // Jaune khaki soleil
      
      // Couleurs complémentaires terre
      '#B22222': 'bg-red-100 text-red-800 border-red-200', // Rouge brique
      '#CD5C5C': 'bg-red-100 text-red-700 border-red-200', // Rouge indien
      '#D2B48C': 'bg-yellow-100 text-yellow-700 border-yellow-200', // Tan
      '#F5DEB3': 'bg-yellow-50 text-yellow-700 border-yellow-200'  // Blé
    };

    return colorMap[employe.couleurPlanning] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  /**
   * Obtenir la couleur de fond directe pour un employé (utilisée dans les composants)
   * @param {Object} employe - Objet employé avec couleurPlanning
   * @returns {string} Code couleur hexadécimal
   */
  getEmployeeBackgroundColor(employe) {
    return employe?.couleurPlanning || '#9CA3AF';
  }

  /**
   * Obtenir une couleur de texte contrastée pour une couleur de fond
   * @param {string} backgroundColor - Couleur de fond en hex
   * @returns {string} Couleur de texte (blanc ou noir)
   */
  getContrastTextColor(backgroundColor) {
    if (!backgroundColor) return '#000000';
    
    // Convertir hex en RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculer la luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Retourner blanc si sombre, noir si clair
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  // =============== SUPPRESSION DES AFFECTATIONS ===============

  /**
   * 🚨 DANGER: Supprimer TOUTES les affectations du planning
   * @returns {Promise} Résultat de la suppression
   */
  async supprimerToutesLesAffectations() {
    try {
      const response = await api.delete('/planning-equipe/affectations/all');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les affectations:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression des affectations');
    }
  }

  /**
   * Supprimer les affectations d'une affaire spécifique
   * @param {string} affaireId - ID de l'affaire
   * @returns {Promise} Résultat de la suppression
   */
  async supprimerAffectationsAffaire(affaireId) {
    try {
      const response = await api.delete(`/planning-equipe/affectations/affaire/${affaireId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression des affectations de l'affaire ${affaireId}:`, error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression des affectations');
    }
  }
}

// Export d'une instance unique du service
const planningEquipeService = new PlanningEquipeService();
export default planningEquipeService;

export {
  planningEquipeService,
  PlanningEquipeService
}; 