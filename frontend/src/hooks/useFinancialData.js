import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { affairesService } from '@/services/affairesService';
import * as estimationService from '@/services/estimationReelService';

export const useFinancialData = (affaireId, affaire) => {
  const [financialData, setFinancialData] = useState({
    // Données réelles
    totalDevisValides: 0,
    totalAchatsValides: 0,
    heuresReelles: 0,
    // Données objectives
    objectifCA: 0,
    objectifAchats: 0,
    objectifHeures: 0,
    // Marges
    margeReelle: 0,
    margeObjectif: 0,
    pourcentageMargeReelle: 0,
    pourcentageMargeObjectif: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFinancialData = async () => {
    if (!affaireId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // 🔄 NOUVEAU : Récupérer les données d'estimation intelligente
      let estimationData = null;
      try {
        const estimations = await estimationService.getEstimationsByAffaire(affaireId);
        estimationData = estimations && estimations.length > 0 ? estimations[0] : null;
      } catch (estimationError) {
        console.warn('Aucune estimation trouvée pour cette affaire:', estimationError);
        // Pas d'estimation trouvée, utiliser les valeurs par défaut
      }
      
      const financialSituation = await affairesService.getFinancialSituation(affaireId);
      
      const {
        affaire: currentAffaire,
        devis,
        achats,
        phases,
        // 🚀 NOUVEAU : Utiliser les données du planning équipe
        planning,
        bdc,
        fraisGeneraux,
        marges
      } = financialSituation;



      // 🔄 NOUVEAU : Utiliser les données d'estimation intelligente prioritairement
      let coutObjectifMainOeuvre, objectifHeuresFab, objectifHeuresSer, objectifHeuresPose;
      let objectifAchats, objectifFraisGeneraux;
      
      // 🔧 DÉFINIR LES TAUX DE BASE POUR TOUS LES CAS
      const TAUX_FABRICATION = 100; // 100€ HT/h
      const TAUX_SERVICE = 75; // 75€ HT/h
      const TAUX_POSE = 50; // 50€ HT/h
      
      if (estimationData) {
        // Utiliser les données d'estimation intelligente
        console.log('📊 Utilisation des données d\'estimation intelligente:', estimationData);
        coutObjectifMainOeuvre = estimationData.coutMainOeuvreEstime || 0;
        objectifAchats = estimationData.coutAchatsEstime || 0;
        objectifFraisGeneraux = estimationData.coutFraisGenerauxEstime || 0;
        
        // Calculer les heures depuis l'estimation
        const TAUX_MOYEN = estimationData.tauxHoraireMoyenEstime || 85;
        const totalHeuresEstimees = coutObjectifMainOeuvre / TAUX_MOYEN;
        
        // Répartir les heures selon les pourcentages d'estimation
        const heuresFab = (estimationData.demiJourneesFabricationEstimees || 0) * 4;
        const heuresPose = (estimationData.demiJourneesPoseEstimees || 0) * 4;
        
        objectifHeuresFab = heuresFab;
        objectifHeuresSer = Math.max(0, totalHeuresEstimees - heuresFab - heuresPose);
        objectifHeuresPose = heuresPose;
      } else {
        // Fallback vers les anciens objectifs d'affaire (rétrocompatibilité)
        console.log('📊 Fallback vers les anciens objectifs d\'affaire');

        objectifHeuresFab = currentAffaire.objectifHeuresFab || 0;
        objectifHeuresSer = currentAffaire.objectifHeuresSer || 0;
        objectifHeuresPose = currentAffaire.objectifHeuresPose || 0;

        coutObjectifMainOeuvre = (objectifHeuresFab * TAUX_FABRICATION) + (objectifHeuresSer * TAUX_SERVICE) + (objectifHeuresPose * TAUX_POSE);
        
        objectifAchats = currentAffaire.objectifAchatHt || 0;
        objectifFraisGeneraux = currentAffaire.objectifFraisGeneraux || 0;
      }
      
      // 🔧 CALCULER LES COÛTS PAR TYPE DANS TOUS LES CAS (pour la ligne 143)
      const coutObjectifHeuresFab = objectifHeuresFab * TAUX_FABRICATION;
      const coutObjectifHeuresSer = objectifHeuresSer * TAUX_SERVICE;
      const coutObjectifHeuresPose = objectifHeuresPose * TAUX_POSE;

      // Total des achats réels = Achats + BDC (SANS la main-d'œuvre)
      const totalAchatsReels = achats.totalValides + bdc.totalReceptionnes;
      
      // 🚀 NOUVEAU : Utiliser les coûts du planning équipe au lieu des phases
      const totalMainOeuvreReelle = planning.coutTotalReel;

      // Total des achats objectifs = Achats objectifs + Main-d'œuvre objectif (basé sur l'estimation)
      const totalAchatsObjectifs = objectifAchats + coutObjectifMainOeuvre;

      const newFinancialData = {
        // CA
        totalDevisValides: devis.totalValides,
        caReel: devis.totalValides, // CA réel = total des devis validés
        objectifCA: estimationData?.montantTotalEstime || currentAffaire.objectifCaHt,
        
        // Achats (sans main-d'œuvre)
        totalAchatsValides: totalAchatsReels,
        totalAchatsFactures: achats.totalValides,
        totalBdcReceptionnes: bdc.totalReceptionnes,
        achatReel: totalAchatsReels, // Achats réels = achats + BDC réceptionnés
        objectifAchats: objectifAchats,
        
        // Main-d'œuvre
        totalMainOeuvreReelle,
        totalMainOeuvreEstimee: coutObjectifMainOeuvre, // Basé sur les objectifs d'heures de l'affaire
        // 🚀 NOUVEAU : Utiliser les données du planning équipe
        tempsTotalEstime: planning.tempsTotalReel || 0, // Pas d'estimation dans le planning, utiliser le réel
        tempsTotalReel: planning.tempsTotalReel,
        nbAffectations: planning.nbAffectations,
        
        // Compteurs pour les badges d'onglets
        nbDevis: devis.nbDevisValides,
        nbAchats: achats.nbAchatsValides,
        nbBdc: bdc.nbBdcReceptionnes,
        
        // 🚀 NOUVEAU : Heures réelles basées sur le planning équipe
        heuresReelles: planning.tempsTotalReel || 0, // Utiliser les heures du planning équipe
        objectifHeures: objectifHeuresFab + objectifHeuresSer + objectifHeuresPose,
        
        // Détail des objectifs d'heures par type
        objectifHeuresFab,
        objectifHeuresSer,
        objectifHeuresPose,
        coutObjectifHeuresFab,
        coutObjectifHeuresSer,
        coutObjectifHeuresPose,
        coutObjectifMainOeuvre,
        
        // Frais généraux (utiliser l'estimation intelligente prioritairement)
        fraisGenerauxReels: fraisGeneraux?.montantReel || 0,
        fraisGenerauxObjectifs: objectifFraisGeneraux || fraisGeneraux?.montantObjectif || 0,
        pourcentageFraisGeneraux: fraisGeneraux?.pourcentage || 30,
        
        // Marges (recalculées avec les données d'estimation intelligente)
        margeReelle: marges.margeReelle,
        margeObjectif: (estimationData?.montantTotalEstime || currentAffaire.objectifCaHt) - (objectifFraisGeneraux || fraisGeneraux?.montantObjectif || 0) - totalAchatsObjectifs,
        pourcentageMargeReelle: marges.pourcentageMargeReelle,
        pourcentageMargeObjectif: (estimationData?.montantTotalEstime || currentAffaire.objectifCaHt) > 0 ? 
          (((estimationData?.montantTotalEstime || currentAffaire.objectifCaHt) - (objectifFraisGeneraux || fraisGeneraux?.montantObjectif || 0) - totalAchatsObjectifs) / (estimationData?.montantTotalEstime || currentAffaire.objectifCaHt)) * 100 : 0,
        
        // Totaux pour les camemberts (achats + main-d'œuvre + frais généraux)
        totalCoutsReels: totalAchatsReels + totalMainOeuvreReelle + (fraisGeneraux?.montantReel || 0),
        totalCoutsObjectifs: objectifAchats + coutObjectifMainOeuvre + (objectifFraisGeneraux || fraisGeneraux?.montantObjectif || 0)
      };

      setFinancialData(newFinancialData);
    } catch (error) {
      console.error('Erreur lors du chargement des données financières:', error);
      setError(error);
      toast.error('Erreur lors du chargement des données financières');
    } finally {
      setLoading(false);
    }
  };

  const refreshFinancialData = () => {
    fetchFinancialData();
  };

  // Calculer les alertes de marge (SANS frais généraux)
  const getMarginAlerts = () => {
    // Ne pas calculer l'alerte si les données ne sont pas encore chargées
    if (!financialData || financialData.totalDevisValides === 0) {
      return {
        alerteMargeReelle: false,
        alerteMargeObjectif: false,
        coefficientMargeReel: 0,
        coefficientMargeObjectif: 0,
        totalCoutsReels: 0,
        totalCoutsObjectifs: 0
      };
    }
    
    // Calculer les coûts SANS les frais généraux (achats + main-d'œuvre uniquement)
    const totalCoutsReels = financialData.totalAchatsValides + (financialData.totalMainOeuvreReelle || 0);
    const totalCoutsObjectifs = financialData.objectifAchats + (financialData.coutObjectifMainOeuvre || 0);
    const coefficientMargeReel = totalCoutsReels > 0 ? financialData.totalDevisValides / totalCoutsReels : 0;
    const coefficientMargeObjectif = totalCoutsObjectifs > 0 ? financialData.objectifCA / totalCoutsObjectifs : 0;
    const seuilCritique = 1.6;
    

    
    return {
      alerteMargeReelle: coefficientMargeReel > 0 && coefficientMargeReel < seuilCritique,
      alerteMargeObjectif: coefficientMargeObjectif > 0 && coefficientMargeObjectif < seuilCritique,
      coefficientMargeReel,
      coefficientMargeObjectif,
      totalCoutsReels,
      totalCoutsObjectifs
    };
  };

  useEffect(() => {
    if (affaire) {
      fetchFinancialData();
    }
    
    // Écouter les événements de mise à jour des BDC, devis et achats
    const handleBdcUpdate = (event) => {
      const { affaireId: eventAffaireId } = event.detail;
      if (eventAffaireId === affaireId) {
        console.log('🔄 Rafraîchissement automatique des données financières suite à une action BDC');
        fetchFinancialData();
      }
    };
    
    const handleAffaireUpdate = (event) => {
      const { affaireId: eventAffaireId } = event.detail;
      if (eventAffaireId === affaireId) {
        console.log('🔄 Rafraîchissement automatique des données financières suite à une mise à jour d\'affaire');
        fetchFinancialData();
      }
    };
    
    const handleAchatUpdate = (event) => {
      const { affaireId: eventAffaireId, action } = event.detail;
      if (eventAffaireId === affaireId) {
        console.log(`🔄 Rafraîchissement automatique des données financières suite à une action achat: ${action}`);
        fetchFinancialData();
      }
    };
    
    // 🚀 NOUVEAU : Gérer les mises à jour d'utilisateur (taux horaires)
    const handleUserUpdate = (event) => {
      const { userId, action, tarifHoraireCout, tarifHoraireVente } = event.detail;
      console.log(`🔄 Rafraîchissement financier suite à modification utilisateur: ${action}`);
      // Rafraîchir les données financières car les coûts de main d'œuvre peuvent avoir changé
      fetchFinancialData();
    };
    
    // 🔥 NOUVEAU : Gérer la réinitialisation de l'estimation
    const handleEstimationReset = (event) => {
      const { affaireId: eventAffaireId } = event.detail;
      if (eventAffaireId === affaireId) {
        console.log('🔄 Rafraîchissement automatique des données financières suite à une réinitialisation d\'estimation');
        fetchFinancialData();
      }
    };
    
    // 🔥 NOUVEAU : Gérer la mise à jour de l'estimation
    const handleEstimationUpdate = (event) => {
      const { affaireId: eventAffaireId } = event.detail;
      if (eventAffaireId === affaireId) {
        console.log('🔄 Rafraîchissement automatique des données financières suite à une mise à jour d\'estimation');
        fetchFinancialData();
      }
    };
    
    // Ajouter les listeners
    window.addEventListener('bdc_updated', handleBdcUpdate);
    window.addEventListener('affaire_updated', handleAffaireUpdate);
    window.addEventListener('devis_updated', handleAffaireUpdate);
    window.addEventListener('achat_updated', handleAchatUpdate);
    // 🚀 NOUVEAU : Écouter les mises à jour d'utilisateur (taux horaires)
    window.addEventListener('user_updated', handleUserUpdate);
    // 🔥 NOUVEAU : Écouter la réinitialisation de l'estimation
    window.addEventListener('estimation_reset', handleEstimationReset);
    // 🔥 NOUVEAU : Écouter la mise à jour de l'estimation
    window.addEventListener('estimation_updated', handleEstimationUpdate);
    
    // Nettoyer les listeners
    return () => {
      window.removeEventListener('bdc_updated', handleBdcUpdate);
      window.removeEventListener('affaire_updated', handleAffaireUpdate);
      window.removeEventListener('devis_updated', handleAffaireUpdate);
      window.removeEventListener('achat_updated', handleAchatUpdate);
      // 🚀 NOUVEAU : Nettoyer le listener user_updated
      window.removeEventListener('user_updated', handleUserUpdate);
      // 🔥 NOUVEAU : Nettoyer le listener estimation_reset
      window.removeEventListener('estimation_reset', handleEstimationReset);
      // 🔥 NOUVEAU : Nettoyer le listener estimation_updated
      window.removeEventListener('estimation_updated', handleEstimationUpdate);
    };
  }, [affaireId, affaire]);

  return {
    financialData,
    loading,
    error,
    refreshFinancialData,
    getMarginAlerts,
    setFinancialData // Pour les mises à jour manuelles
  };
}; 