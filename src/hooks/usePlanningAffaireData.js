import { useState, useEffect, useCallback, useRef } from 'react';
import planningAffaireService from '../services/planningAffaireService';

/**
 * Hook usePlanningAffaireData - Gestion état Apple
 * Gère l'état du planning avec filtrage par affaire
 */
export const usePlanningAffaireData = (initialAffaireId = null) => {
  // État principal
  const [planningData, setPlanningData] = useState({
    affaires: [],
    affectations: [],
    ouvriers: [],
    jours: [],
    statistiques: null
  });
  
  // État UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [affaireId, setAffaireId] = useState(initialAffaireId);
  const [viewMode, setViewMode] = useState('grid');
  
  // Références pour éviter les re-renders
  const abortControllerRef = useRef(null);
  const loadingRef = useRef(false);
  
  /**
   * Formate la date pour l'API
   */
  const formatDateForAPI = useCallback((date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return startOfWeek.toISOString().split('T')[0];
  }, []);

  /**
   * Charge les données du planning
   */
  const loadPlanningData = useCallback(async (force = false) => {
    if (loadingRef.current && !force) return;
    
    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 [usePlanningAffaireData] Chargement données pour affaireId:', affaireId);
      
      if (affaireId) {
        // 🚀 NOUVEAU : Si une affaire spécifique est sélectionnée, récupérer TOUTES ses affectations
        console.log('📊 Récupération TOUTES les affectations pour affaire:', affaireId);
        
        const [affectationsResponse, affairesResponse] = await Promise.all([
          planningAffaireService.getAllAffectationsAffaire(affaireId, false),
          planningAffaireService.getAffairesActives()
        ]);
        
        console.log('✅ Affectations récupérées:', affectationsResponse);
        
        // Convertir les données pour compatibilité avec l'interface existante
        const affectationsConverties = affectationsResponse.affectations.map(affectation => ({
          ...affectation,
          date: affectation.dateAffectation.split('T')[0],
          creneau: affectation.periode === 'MATIN' ? 'matin' : 'aprem'
        }));
        
        // Générer les jours depuis les affectations
        const joursUniques = [...new Set(affectationsConverties.map(a => a.date))].sort();
        const jours = joursUniques.map(dateStr => {
          const date = new Date(dateStr);
          return {
            date: dateStr,
            nom: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
            numero: date.getDate()
          };
        });
        
        setPlanningData(prev => ({
          ...prev,
          affaires: affairesResponse,
          affectations: affectationsConverties,
          ouvriers: [], // Les ouvriers seront dans les affectations
          jours: jours,
          statistiques: affectationsResponse.totaux
        }));
        
      } else {
        // Logique originale pour la vue semaine
        const dateDebut = formatDateForAPI(selectedWeek);
        
        const [planningResponse, affairesResponse, statistiquesResponse] = await Promise.all([
          planningAffaireService.getPlanning(dateDebut, affaireId),
          planningAffaireService.getAffairesActives(),
          planningAffaireService.getStatistiques(dateDebut, affaireId)
        ]);
        
        setPlanningData(prev => ({
          ...prev,
          affaires: affairesResponse,
          affectations: planningResponse.affectations || [],
          ouvriers: planningResponse.ouvriers || [],
          jours: planningResponse.jours || [],
          statistiques: statistiquesResponse
        }));
      }
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Erreur lors du chargement du planning');
        console.error('❌ Erreur planning:', err);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [selectedWeek, affaireId, formatDateForAPI]);

  /**
   * Affecte un ouvrier à une affaire
   */
  const affecterOuvrier = useCallback(async (affectationData) => {
    try {
      setLoading(true);
      
      const nouvelleAffectation = await planningAffaireService.affecterOuvrierOptimise(affectationData);
      
      // Mettre à jour l'état local
      setPlanningData(prev => ({
        ...prev,
        affectations: [...prev.affectations, nouvelleAffectation]
      }));
      
      return nouvelleAffectation;
      
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'affectation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Modifie une affectation existante
   */
  const modifierAffectation = useCallback(async (affectationId, updates) => {
    try {
      setLoading(true);
      
      const affectationModifiee = await planningAffaireService.modifierAffectation(affectationId, updates);
      
      // Mettre à jour l'état local
      setPlanningData(prev => ({
        ...prev,
        affectations: prev.affectations.map(a => 
          a.id === affectationId ? affectationModifiee : a
        )
      }));
      
      return affectationModifiee;
      
    } catch (err) {
      setError(err.message || 'Erreur lors de la modification');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Supprime une affectation
   */
  const supprimerAffectation = useCallback(async (affectationId) => {
    try {
      setLoading(true);
      
      await planningAffaireService.supprimerAffectation(affectationId);
      
      // Mettre à jour l'état local
      setPlanningData(prev => ({
        ...prev,
        affectations: prev.affectations.filter(a => a.id !== affectationId)
      }));
      
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Valide une affectation
   */
  const validerAffectation = useCallback(async (affectationId) => {
    try {
      setLoading(true);
      
      const affectationValidee = await planningAffaireService.validerAffectation(affectationId);
      
      // Mettre à jour l'état local
      setPlanningData(prev => ({
        ...prev,
        affectations: prev.affectations.map(a => 
          a.id === affectationId ? affectationValidee : a
        )
      }));
      
      return affectationValidee;
      
    } catch (err) {
      setError(err.message || 'Erreur lors de la validation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Duplique une affectation
   */
  const duplicherAffectation = useCallback(async (affectationId, nouvelleDateDebut) => {
    try {
      setLoading(true);
      
      const nouvelleAffectation = await planningAffaireService.duplicherAffectation(affectationId, nouvelleDateDebut);
      
      // Mettre à jour l'état local
      setPlanningData(prev => ({
        ...prev,
        affectations: [...prev.affectations, nouvelleAffectation]
      }));
      
      return nouvelleAffectation;
      
    } catch (err) {
      setError(err.message || 'Erreur lors de la duplication');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère les ouvriers disponibles
   */
  const getOuvriersDisponibles = useCallback(async (date, creneau) => {
    try {
      return await planningAffaireService.getOuvriersDisponibles(date, creneau);
    } catch (err) {
      console.error('Erreur ouvriers disponibles:', err);
      return [];
    }
  }, []);

  /**
   * Navigation semaine précédente
   */
  const previousWeek = useCallback(() => {
    setSelectedWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }, []);

  /**
   * Navigation semaine suivante
   */
  const nextWeek = useCallback(() => {
    setSelectedWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }, []);

  /**
   * Change le mode de vue
   */
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  /**
   * Filtre par affaire
   */
  const filtrerParAffaire = useCallback((nouvelAffaireId) => {
    setAffaireId(nouvelAffaireId);
  }, []);

  /**
   * Exporte le planning en PDF
   */
  const exporterPDF = useCallback(async () => {
    try {
      setLoading(true);
      
      const dateDebut = formatDateForAPI(selectedWeek);
      const blob = await planningAffaireService.exporterPDF(dateDebut, affaireId);
      
      // Télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `planning-${dateDebut}${affaireId ? `-affaire-${affaireId}` : ''}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'export PDF');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedWeek, affaireId, formatDateForAPI]);

  /**
   * Rafraîchit les données
   */
  const refresh = useCallback(() => {
    loadPlanningData(true);
  }, [loadPlanningData]);

  /**
   * Calcule la semaine courante formatée
   */
  const getCurrentWeekLabel = useCallback(() => {
    const startOfWeek = new Date(selectedWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const weekNumber = Math.ceil((startOfWeek.getTime() - new Date(startOfWeek.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const monthName = startOfWeek.toLocaleDateString('fr-FR', { month: 'long' });
    
    return `Semaine ${weekNumber} - ${monthName} ${startOfWeek.getFullYear()}`;
  }, [selectedWeek]);

  // Chargement initial et lors des changements
  useEffect(() => {
    loadPlanningData();
  }, [loadPlanningData]);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Données
    planningData,
    loading,
    error,
    
    // État UI
    selectedWeek,
    affaireId,
    viewMode,
    currentWeekLabel: getCurrentWeekLabel(),
    
    // Actions principales
    affecterOuvrier,
    modifierAffectation,
    supprimerAffectation,
    validerAffectation,
    duplicherAffectation,
    
    // Utilitaires
    getOuvriersDisponibles,
    exporterPDF,
    refresh,
    
    // Navigation
    previousWeek,
    nextWeek,
    toggleViewMode,
    filtrerParAffaire,
    
    // Setters
    setSelectedWeek,
    setAffaireId,
    setViewMode,
    setError
  };
}; 