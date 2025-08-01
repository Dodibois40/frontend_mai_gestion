import api from './api';

/**
 * Service Planning Affaire - Optimisé Apple
 * Gestion du planning équipe avec filtrage par affaire
 */
class PlanningAffaireService {
  constructor() {
    this.baseUrl = '/planning-equipe';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Récupère le planning hebdomadaire avec filtrage optionnel
   * @param {string} dateDebut - Date de début de semaine
   * @param {string|null} affaireId - ID de l'affaire (null pour toutes)
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<Object>} Planning hebdomadaire
   */
  async getPlanning(dateDebut, affaireId = null, options = {}) {
    const cacheKey = `planning-${dateDebut}-${affaireId || 'all'}`;
    
    // Vérifier le cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const params = { 
        dateDebut,
        inclureTerminees: options.inclureTerminees || false,
        ...options
      };
      
      // Note: le backend ne supporte pas encore le filtrage par affaireId
      // le filtrage sera fait côté frontend temporairement
      if (affaireId) {
        console.warn('Filtrage par affaireId non supporté par le backend, filtrage côté frontend');
      }
      
      const response = await api.get(`${this.baseUrl}/semaine`, { params });
      
      // Mettre en cache
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du planning:', error);
      throw error;
    }
  }

  /**
   * Affecter un ouvrier de manière optimisée
   * @param {Object} affectationData - Données d'affectation
   * @returns {Promise<Object>} Résultat de l'affectation
   */
  async affecterOuvrierOptimise(affectationData) {
    try {
      // Adapter les données pour correspondre au DTO backend
      const adaptedData = {
        affaireId: affectationData.affaireId,
        userId: affectationData.ouvrierId || affectationData.userId,
        dateAffectation: affectationData.date || affectationData.dateAffectation,
        periode: affectationData.creneau === 'matin' ? 'MATIN' : 'APREM',
        typeActivite: affectationData.typeActivite || 'FABRICATION'
      };
      
      const response = await api.post(`${this.baseUrl}/affecter`, adaptedData);
      
      // Invalider le cache
      this.clearCache();
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error);
      throw error;
    }
  }

  /**
   * Modifier une affectation existante
   * @param {string} affectationId - ID de l'affectation
   * @param {Object} updates - Modifications à apporter
   * @returns {Promise<Object>} Affectation modifiée
   */
  async modifierAffectation(affectationId, updates) {
    try {
      const response = await api.put(`${this.baseUrl}/affectation/${affectationId}`, updates);
      
      // Invalider le cache
      this.clearCache();
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      throw error;
    }
  }

  /**
   * Supprimer une affectation
   * @param {string} affectationId - ID de l'affectation
   * @returns {Promise<void>}
   */
  async supprimerAffectation(affectationId) {
    try {
      await api.delete(`${this.baseUrl}/desaffecter/${affectationId}`);
      
      // Invalider le cache
      this.clearCache();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  }

  /**
   * Récupère les ouvriers disponibles
   * @param {string} date - Date de recherche (non utilisé par le backend)
   * @param {string} creneau - Créneau (non utilisé par le backend)
   * @returns {Promise<Array>} Liste des ouvriers disponibles
   */
  async getOuvriersDisponibles(date, creneau) {
    try {
      // Le backend ne prend pas de paramètres pour cette endpoint
      const response = await api.get(`${this.baseUrl}/ouvriers-disponibles`);
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des ouvriers:', error);
      throw error;
    }
  }

  /**
   * Calcule les coûts main d'œuvre (calcul local temporaire)
   * @param {Array} affectations - Liste des affectations
   * @param {string|null} affaireId - ID de l'affaire (null pour toutes)
   * @returns {Promise<Object>} Détail des coûts
   */
  async calculerCouts(affectations, affaireId = null) {
    try {
      // Calcul local temporaire en attendant l'endpoint backend
      const BASE_FIXE = 2542.90;
      const nombreAffectations = affectations.length;
      const coutParAffectation = nombreAffectations > 0 ? BASE_FIXE / nombreAffectations : 0;
      const coutTotal = coutParAffectation * nombreAffectations;
      
      return {
        coutTotal,
        coutParAffectation,
        nombreAffectations,
        baseFix: BASE_FIXE
      };
    } catch (error) {
      console.error('Erreur lors du calcul des coûts:', error);
      throw error;
    }
  }

  /**
   * Récupère les affaires actives
   * @returns {Promise<Array>} Liste des affaires actives
   */
  async getAffairesActives() {
    try {
      const response = await api.get(`${this.baseUrl}/affaires-actives`);
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des affaires:', error);
      throw error;
    }
  }

  /**
   * Récupère TOUTES les affectations d'une affaire spécifique
   * @param {string} affaireId - ID de l'affaire
   * @param {boolean} inclureTerminees - Inclure les affectations terminées
   * @returns {Promise<Object>} Toutes les affectations de l'affaire avec statistiques
   */
  async getAllAffectationsAffaire(affaireId, inclureTerminees = false) {
    const cacheKey = `affectations-${affaireId}-${inclureTerminees}`;
    
    // Vérifier le cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const params = { inclureTerminees };
      const response = await api.get(`${this.baseUrl}/affaire/${affaireId}/affectations`, { params });
      
      // Mettre en cache
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des affectations de l\'affaire:', error);
      throw error;
    }
  }

  /**
   * Valide une affectation (temporairement désactivé)
   * @param {string} affectationId - ID de l'affectation
   * @returns {Promise<Object>} Affectation validée
   */
  async validerAffectation(affectationId) {
    try {
      // Temporairement désactivé - endpoint non disponible
      console.warn('Validation d\'affectation temporairement désactivée');
      return { id: affectationId, valide: true };
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      throw error;
    }
  }

  /**
   * Dupliquer une affectation (temporairement désactivé)
   * @param {string} affectationId - ID de l'affectation source
   * @param {string} nouvelleDateDebut - Nouvelle date de début
   * @returns {Promise<Object>} Nouvelle affectation
   */
  async duplicherAffectation(affectationId, nouvelleDateDebut) {
    try {
      // Temporairement désactivé - endpoint non disponible
      console.warn('Duplication d\'affectation temporairement désactivée');
      return { id: 'temp-' + Date.now(), affectationId, nouvelleDateDebut };
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques du planning
   * @param {string} dateDebut - Date de début
   * @param {string|null} affaireId - ID de l'affaire (non supporté par le backend)
   * @returns {Promise<Object>} Statistiques
   */
  async getStatistiques(dateDebut, affaireId = null) {
    try {
      const params = { dateDebut };
      // Note: le backend ne supporte pas encore le filtrage par affaireId
      
      const response = await api.get(`${this.baseUrl}/statistiques`, { params });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Exporte le planning en PDF (temporairement désactivé)
   * @param {string} dateDebut - Date de début
   * @param {string|null} affaireId - ID de l'affaire
   * @returns {Promise<Blob>} PDF généré
   */
  async exporterPDF(dateDebut, affaireId = null) {
    try {
      // Temporairement désactivé - endpoint non disponible
      console.warn('Export PDF temporairement désactivé');
      throw new Error('Export PDF temporairement indisponible');
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      throw error;
    }
  }

  /**
   * Vide le cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Nettoyage automatique du cache
   */
  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }
}

// Instance singleton
const planningAffaireService = new PlanningAffaireService();

// Nettoyage automatique du cache toutes les 10 minutes
setInterval(() => {
  planningAffaireService.cleanupCache();
}, 10 * 60 * 1000);

export default planningAffaireService; 