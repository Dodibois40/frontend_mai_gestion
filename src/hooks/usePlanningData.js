import { useState, useEffect, useCallback, useRef } from 'react';
import planningEquipeService from '../services/planningEquipeService';
import { toast } from 'sonner';

/**
 * Hook principal pour la gestion des données du planning équipe
 * Centralise toute la logique de state management et les appels API
 */
const usePlanningData = (options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 secondes
    loadOnMount = true
  } = options;

  // ========== ÉTAT LOCAL ==========
  
  const [currentWeek, setCurrentWeek] = useState(() => {
    return planningEquipeService.getWeekStart(new Date());
  });
  
  const [planningData, setPlanningData] = useState(null);
  const [ouvriers, setOuvriers] = useState(null);
  const [affaires, setAffaires] = useState([]);
  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Refs pour cleanup et gestion lifecycle
  const refreshIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // ========== UTILITAIRES ==========

  /**
   * Obtenir les jours de la semaine courante
   */
  const getWeekDays = useCallback(() => {
    return planningEquipeService.getWeekDays(currentWeek);
  }, [currentWeek]);

  /**
   * Naviguer vers la semaine précédente/suivante
   */
  const navigateWeek = useCallback((direction) => {
    const newWeek = new Date(currentWeek);
    if (direction === 'prev') {
      newWeek.setDate(currentWeek.getDate() - 7);
    } else if (direction === 'next') {
      newWeek.setDate(currentWeek.getDate() + 7);
    }
    setCurrentWeek(newWeek);
  }, [currentWeek]);

  /**
   * Aller à la semaine courante
   */
  const goToToday = useCallback(() => {
    const today = planningEquipeService.getWeekStart(new Date());
    setCurrentWeek(today);
  }, []);

  // ========== CHARGEMENT DONNÉES ==========

  /**
   * Charger les données du planning pour la semaine courante
   */
  const loadPlanningData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      // Annuler les requêtes précédentes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      console.log('📅 Chargement planning pour la semaine:', currentWeek);

      // Charger les données en parallèle
      const [planningResult, statistiquesResult] = await Promise.all([
        planningEquipeService.getPlanningHebdomadaire(currentWeek, false),
        planningEquipeService.getStatistiquesPlanning(currentWeek)
      ]);

      setPlanningData(planningResult);
      setStatistiques(statistiquesResult);
      setLastRefresh(new Date());
      setRefreshCount(prev => prev + 1);

      console.log('✅ Planning chargé avec succès');
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🔄 Requête annulée');
        return;
      }
      
      console.error('❌ Erreur lors du chargement du planning:', error);
      setError(error.message || 'Erreur lors du chargement du planning');
      toast.error(error.message || 'Erreur lors du chargement du planning');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [currentWeek]);

  /**
   * Charger les ouvriers disponibles
   */
  const loadOuvriers = useCallback(async () => {
    try {
      console.log('👥 Chargement des ouvriers...');
      const ouvriersResult = await planningEquipeService.getOuvriersDisponibles();
      setOuvriers(ouvriersResult);
      console.log('✅ Ouvriers chargés:', ouvriersResult);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des ouvriers:', error);
      toast.error(error.message || 'Erreur lors du chargement des ouvriers');
    }
  }, []);

  /**
   * Charger les affaires actives
   */
  const loadAffaires = useCallback(async () => {
    try {
      console.log('📋 Chargement des affaires...');
      const affairesResult = await planningEquipeService.getAffairesActives();
      setAffaires(affairesResult);
      console.log('✅ Affaires chargées:', affairesResult);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des affaires:', error);
      toast.error(error.message || 'Erreur lors du chargement des affaires');
    }
  }, []);

  /**
   * Rafraîchir toutes les données
   */
  const refreshPlanning = useCallback(async () => {
    console.log('🔄 Rafraîchissement complet du planning...');
    
    await Promise.all([
      loadPlanningData(false), // false = pas de loading global
      loadOuvriers(),
      loadAffaires()
    ]);
    
    toast.success('Planning actualisé');
  }, [loadPlanningData, loadOuvriers, loadAffaires]);

  // ========== ACTIONS AFFECTATIONS ==========

  /**
   * Affecter un ouvrier au planning
   */
  const affecterOuvrier = useCallback(async (affectationData) => {
    try {
      console.log('🎯 Affectation en cours...', affectationData);
      
      const result = await planningEquipeService.affecterOuvrier(affectationData);
      
      // Recharger les données pour avoir l'état à jour
      await loadPlanningData(false);
      
      toast.success(`${result.user?.prenom} ${result.user?.nom} affecté avec succès`);
      
      return {
        success: true,
        affectation: result,
        message: 'Affectation réussie'
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'affectation:', error);
      toast.error(error.message);
      
      return {
        success: false,
        message: error.message
      };
    }
  }, [loadPlanningData]);

  /**
   * Changer le type d'activité d'une affectation
   */
  const changerTypeActivite = useCallback(async (affectationId, nouveauType) => {
    try {
      console.log(`🔄 Changement type activité vers ${nouveauType}...`);
      
      await planningEquipeService.changerTypeActivite(affectationId, nouveauType);
      
      // Recharger les données
      await loadPlanningData(false);
      
      toast.success(`Type d'activité changé vers ${nouveauType}`);
    } catch (error) {
      console.error('❌ Erreur lors du changement de type:', error);
      toast.error(error.message);
      throw error;
    }
  }, [loadPlanningData]);

  /**
   * Désaffecter un ouvrier
   */
  const desaffecterOuvrier = useCallback(async (affectationId) => {
    try {
      console.log('🗑️ Désaffectation en cours...');
      
      await planningEquipeService.desaffecterOuvrier(affectationId);
      
      // Recharger les données
      await loadPlanningData(false);
      
      toast.success('Ouvrier désaffecté avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la désaffectation:', error);
      toast.error(error.message);
      throw error;
    }
  }, [loadPlanningData]);

  /**
   * Mettre à jour une affectation
   */
  const updateAffectation = useCallback(async (affectationId, updateData) => {
    try {
      console.log('📝 Mise à jour affectation...', updateData);
      
      await planningEquipeService.updateAffectation(affectationId, updateData);
      
      // Recharger les données
      await loadPlanningData(false);
      
      toast.success('Affectation mise à jour');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      toast.error(error.message);
      throw error;
    }
  }, [loadPlanningData]);

  // ========== EFFECTS ==========

  /**
   * Chargement initial au montage
   */
  useEffect(() => {
    if (loadOnMount) {
      console.log('🏁 Chargement initial du planning...');
      loadOuvriers();
      loadAffaires();
      loadPlanningData();
    }

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Intentionnellement vide pour le chargement initial

  /**
   * Rechargement lors du changement de semaine
   */
  useEffect(() => {
    if (planningData !== null) { // Éviter le double appel au montage
      console.log('📅 Changement de semaine détecté, rechargement...');
      loadPlanningData();
    }
  }, [currentWeek, loadPlanningData]);

  /**
   * Auto-refresh si activé
   */
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      console.log(`⏰ Auto-refresh activé: ${refreshInterval}ms`);
      
      refreshIntervalRef.current = setInterval(() => {
        console.log('🔄 Auto-refresh du planning...');
        loadPlanningData(false);
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, loadPlanningData]);

  /**
   * Cleanup global
   */
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ========== RETOUR DU HOOK ==========

  return {
    // État
    currentWeek,
    planningData,
    ouvriers,
    affaires,
    statistiques,
    loading,
    isRefreshing,
    error,
    lastRefresh,
    refreshCount,

    // Actions navigation
    setCurrentWeek,
    navigateWeek,
    goToToday,
    getWeekDays,

    // Actions données
    refreshPlanning,
    loadPlanningData,
    loadOuvriers,
    loadAffaires,

    // Actions affectations
    affecterOuvrier,
    changerTypeActivite,
    desaffecterOuvrier,
    updateAffectation,

    // État des données formatées
    weekDays: getWeekDays(),
    isDataLoaded: planningData !== null && ouvriers !== null,
    hasError: error !== null,
    isEmpty: planningData?.affaires?.length === 0,
    
    // Métadonnées
    semaine: planningData?.semaine,
    nombreAffaires: planningData?.affaires?.length || 0,
    nombreOuvriers: ouvriers?.total || 0,
  };
};

export default usePlanningData; 