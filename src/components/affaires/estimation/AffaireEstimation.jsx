import React, { useState, useEffect } from 'react';
import { 
  IconDeviceFloppy, 
  IconRefresh,
  IconChartBar,
  IconUsers,
  IconTruckDelivery
} from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EstimationCartouche from './EstimationCartouche';
import BlocMontant from './blocs/BlocMontant';
import BlocTemps from './blocs/BlocTemps';
import CamembertEstimation from './blocs/CamembertEstimation';
import BlocEquipe from './blocs/BlocEquipe';
import BlocAchats from './blocs/BlocAchats';
import BlocAffectations from './blocs/BlocAffectations';

import { getCouleursAffaire } from './utils/couleursPastel';
import { getEstimationAffaire } from './utils/planningSync';
import * as estimationService from '../../../services/estimationReelService';
import { affairesService } from '../../../services/affairesService';

/**
 * Composant Principal - Estimation Affaires
 * Assemblage de tous les blocs d'estimation avec design Apple
 */
const AffaireEstimation = ({ affaire, onEstimationSave, onEstimationReset }) => {
  const [estimation, setEstimation] = useState({
    montantDevis: 0,
    dateDebut: '',
    dateFin: '',
    totalDemiJournees: 0,
    nombrePersonnes: 2,
    nombreSousTraitants: 0,
    montantAchats: 0,
    montantMainOeuvre: 0,
    montantMainOeuvreCout: 0,
    montantMainOeuvreVente: 0,
    montantMainOeuvreGain: 0,
    montantFraisGeneraux: 0,
    montantMarge: 0,
    tauxHoraireCout: 25,
    tauxHoraireVente: 75
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [couleurAffaire, setCouleurAffaire] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [affectationsDetectees, setAffectationsDetectees] = useState([]);
  const [dateSurvolee, setDateSurvolee] = useState(null);
  const [affectationsJourSurvole, setAffectationsJourSurvole] = useState([]);
  const [justReset, setJustReset] = useState(false); // 🔒 Flag pour empêcher le rechargement après reset
  const [resetTrigger, setResetTrigger] = useState(0); // 🔄 Trigger pour forcer la réinitialisation du calendrier
  const [isSelectingDates, setIsSelectingDates] = useState(false); // 🔒 Flag pour empêcher rechargement pendant sélection
  const [justSaved, setJustSaved] = useState(false); // 🔒 Flag pour empêcher rechargement après sauvegarde
  
  // 🌟 États de progression intelligente
  const [hasMontantValide, setHasMontantValide] = useState(false);
  const [hasPlanningComplete, setHasPlanningComplete] = useState(false);
  
  // Charger l'estimation existante
  useEffect(() => {
    // 🔄 NOUVELLE CORRECTION : Nettoyer TOUTES les sources de persistance au changement d'affaire
    console.log('🧹 CHANGEMENT D\'AFFAIRE - Nettoyage complet des caches:', affaire.id);
    
    // Nettoyer le cache en mémoire (window.planningEstimations)
    if (window.planningEstimations && window.planningEstimations.has(affaire.id)) {
      window.planningEstimations.delete(affaire.id);
      console.log('🧹 Cache mémoire nettoyé pour affaire:', affaire.id);
    }
    
    // Nettoyer localStorage
    try {
      localStorage.removeItem(`estimation_${affaire.id}`);
      console.log('🧹 LocalStorage nettoyé pour affaire:', affaire.id);
    } catch (error) {
      // Ignore les erreurs localStorage
    }
    
    // Réinitialiser l'estimation locale AVANT de charger
    setEstimation({
      montantDevis: 0,
      dateDebut: '',
      dateFin: '',
      totalDemiJournees: 0,
      nombrePersonnes: 2,
      nombreSousTraitants: 0,
      montantAchats: 0,
      montantMainOeuvre: 0,
      montantMainOeuvreCout: 0,
      montantMainOeuvreVente: 0,
      montantMainOeuvreGain: 0,
      montantFraisGeneraux: 0,
      montantMarge: 0,
      tauxHoraireCout: 25,
      tauxHoraireVente: 75
    });
    
    // Forcer la réinitialisation du calendrier
    setResetTrigger(prev => prev + 1);
    
    // Charger l'estimation depuis l'API seulement après nettoyage
    setTimeout(() => {
      if (!isSelectingDates) {
        chargerEstimationExistante();
      }
    }, 100);
    
    // Obtenir la couleur de l'affaire
    const couleurs = getCouleursAffaire(affaire.id);
    setCouleurAffaire(couleurs);
  }, [affaire.id]); // Simplification des dépendances
  
  // 🔒 Gérer le flag justReset séparément
  useEffect(() => {
    if (justReset) {
      // Remettre le flag à false après un délai très court
      const timer = setTimeout(() => {
        setJustReset(false);
      }, 500); // 500ms seulement - plus permissif
      
      return () => clearTimeout(timer);
    }
  }, [justReset]);

  // 🔒 Gérer le flag justSaved séparément
  useEffect(() => {
    if (justSaved) {
      // Remettre le flag à false après un délai très court
      const timer = setTimeout(() => {
        setJustSaved(false);
      }, 300); // 300ms seulement - très permissif
      
      return () => clearTimeout(timer);
    }
  }, [justSaved]);

  // 🔒 Empêcher le rechargement automatique pendant la sélection
  useEffect(() => {
    if (isSelectingDates) {
      // Annuler tous les timeouts de sauvegarde pendant la sélection
      if (window.autoSaveTimeout) {
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = null;
      }
      
      // Désactiver automatiquement après un délai court
      const timer = setTimeout(() => {
        setIsSelectingDates(false);
      }, 2000); // 2 secondes max
      
      return () => clearTimeout(timer);
    }
  }, [isSelectingDates]);
  

  
  // 🌟 Logique de progression intelligente
  useEffect(() => {
    // Étape 1 : Validation du montant
    const montantEstValide = estimation.montantDevis > 0;
    setHasMontantValide(montantEstValide);
    
    // Étape 2 : Planning complet (dates renseignées) - Vérifier les deux formats de dates
    const dateDebut = estimation.dateDebut || estimation.dateCommencement;
    const dateFin = estimation.dateFin || estimation.dateReception;
    const planningComplet = montantEstValide && dateDebut && dateFin;
    setHasPlanningComplete(planningComplet);
  }, [estimation.montantDevis, estimation.dateDebut, estimation.dateFin, estimation.dateCommencement, estimation.dateReception]);
  
  const chargerEstimationExistante = async () => {
    try {
      // 🔄 CORRECTION : Protection allégée - seulement pendant sélection active
      if (isSelectingDates) {
        return;
      }
      
      // Charger depuis l'API backend
      const estimationsExistantes = await estimationService.getEstimationsByAffaire(affaire.id);
      
      if (estimationsExistantes && estimationsExistantes.length > 0) {
        const estimationApi = estimationsExistantes[0];
        
        // Convertir les données API vers le format du composant
        const estimationConvertie = {
          montantDevis: estimationApi.montantTotalEstime || 0,
          dateDebut: estimationApi.dateCommencementEstimee || '',
          dateFin: estimationApi.dateReceptionEstimee || '',
          totalDemiJournees: estimationApi.dureeTotaleEstimee || 0,
          nombrePersonnes: estimationApi.nombrePersonnesEstime || 2,
          nombreSousTraitants: estimationApi.nombreSousTraitants || 0,
          montantAchats: estimationApi.coutAchatsEstime || 0,
          montantMainOeuvre: estimationApi.coutMainOeuvreEstime || 0,
          montantMainOeuvreCout: estimationApi.coutMainOeuvreEstime || 0,
          montantMainOeuvreVente: estimationApi.montantMainOeuvreVente || 0,
          montantMainOeuvreGain: estimationApi.montantMainOeuvreGain || 0,
          montantFraisGeneraux: estimationApi.coutFraisGenerauxEstime || 0,
          montantMarge: estimationApi.margeEstimee || 0,
          // 🔧 CORRECTION : Inclure les propriétés spécifiques aux blocs
          demiJourneesFabrication: estimationApi.demiJourneesFabricationEstimees || 0,
          demiJourneesPose: estimationApi.demiJourneesPoseEstimees || 0,
          tauxHoraire: estimationApi.tauxHoraireMoyenEstime || 25,
          tauxHoraireCout: estimationApi.tauxHoraireMoyenEstime || 25,
          tauxHoraireVente: estimationApi.tauxHoraireVente || 75,
          // Propriétés calculées pour les blocs
          dateCommencement: estimationApi.dateCommencementEstimee || '',
          dateReception: estimationApi.dateReceptionEstimee || '',
          // Conserver les propriétés étendues si elles existent
          categoriesAchats: estimationApi.categoriesAchats || [],
          repartitionAchats: estimationApi.repartitionAchats || {},
          repartitionFabrication: estimationApi.repartitionFabrication || 60,
          repartitionPose: estimationApi.repartitionPose || 40
        };
        
        // 🔄 CORRECTION : Chargement conditionnel plus permissif
        if (!isSelectingDates) {
          setEstimation(prevEstimation => ({
            ...prevEstimation, // Conserver les données existantes
            ...estimationConvertie, // Appliquer les nouvelles données
            // 🔧 PRÉSERVER spécifiquement les données de l'équipe si elles existent déjà
            demiJourneesFabrication: estimationConvertie.demiJourneesFabricationEstimees || prevEstimation.demiJourneesFabrication || 0,
            demiJourneesPose: estimationConvertie.demiJourneesPoseEstimees || prevEstimation.demiJourneesPose || 0,
            nombrePersonnes: estimationConvertie.nombrePersonnesEstime || prevEstimation.nombrePersonnes || 2,
            tauxHoraire: estimationConvertie.tauxHoraireMoyenEstime || prevEstimation.tauxHoraire || 75,
            repartitionFabrication: estimationConvertie.repartitionFabrication || prevEstimation.repartitionFabrication || 60,
            repartitionPose: estimationConvertie.repartitionPose || prevEstimation.repartitionPose || 40
          }));
        }
      } else {
        // Fallback vers le stockage local si aucune estimation en base
        const estimationLocale = getEstimationAffaire(affaire.id);
        if (estimationLocale && !isSelectingDates) {
          setEstimation(prevEstimation => ({
            ...prevEstimation, // Conserver les données existantes
            ...estimationLocale // Appliquer les données locales
          }));
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement estimation depuis l\'API:', error);
      // Fallback vers le stockage local en cas d'erreur
      try {
        const estimationLocale = getEstimationAffaire(affaire.id);
        if (estimationLocale && !isSelectingDates) {
          setEstimation(prevEstimation => ({
            ...prevEstimation, // Conserver les données existantes
            ...estimationLocale // Appliquer les données locales
          }));
        }
      } catch (fallbackError) {
        console.error('❌ Erreur fallback estimation:', fallbackError);
      }
    }
  };
  

  
  const handleEstimationChange = (nouvelleEstimation) => {
    console.log('🔄 Changement détecté dans l\'estimation:', nouvelleEstimation);
    
    // Créer une copie mutable pour éviter l'erreur "Assignment to constant variable"
    let estimationMiseAJour = { ...estimation, ...nouvelleEstimation };
    
    // DEBUG
    console.log('🔍 DEBUG AffaireEstimation - handleEstimationChange:', {
      recalculerRepartition: estimationMiseAJour.recalculerRepartition,
      montantDevis: estimationMiseAJour.montantDevis,
      montantAchats: estimationMiseAJour.montantAchats,
      montantMainOeuvre: estimationMiseAJour.montantMainOeuvre,
      montantFraisGeneraux: estimationMiseAJour.montantFraisGeneraux,
      montantMarge: estimationMiseAJour.montantMarge
    });
    
    // 💰 NOUVEAU : Recalculer la répartition financière si demandé
    if (estimationMiseAJour.recalculerRepartition && estimationMiseAJour.montantDevis > 0) {
      console.log('💰 Recalcul de la répartition financière demandé');
      
      const montantDevis = estimationMiseAJour.montantDevis;
      const montantMainOeuvre = estimationMiseAJour.montantMainOeuvreCout || estimationMiseAJour.montantMainOeuvre || 0;
      
      // 🔥 NOUVEAU : Achats par défaut à 20% du devis
      let montantAchats = estimationMiseAJour.montantAchats || Math.round(montantDevis * 0.2);
      
      // 🔥 NOUVEAU : Frais généraux TOUJOURS à 30% du devis
      let montantFraisGeneraux = Math.round(montantDevis * 0.3);
      
      // Calculer la marge comme le reste après main d'œuvre, achats et frais généraux
      let montantMarge = montantDevis - montantMainOeuvre - montantAchats - montantFraisGeneraux;
      
      // Si la marge devient négative, ajuster la répartition
      if (montantMarge < 0) {
        // Calculer ce qui reste après la main d'œuvre
        const resteApresMO = montantDevis - montantMainOeuvre;
        
        if (resteApresMO > 0) {
          // Répartir le reste entre achats (20%), frais généraux (30%) et marge (le reste)
          // Si pas assez de place, prioriser dans l'ordre : achats, frais généraux, marge
          if (resteApresMO >= montantAchats + montantFraisGeneraux) {
            // Cas normal : il y a de la place pour achats + frais généraux
            montantMarge = resteApresMO - montantAchats - montantFraisGeneraux;
          } else if (resteApresMO >= montantAchats) {
            // Pas assez pour les frais généraux complets
            montantFraisGeneraux = resteApresMO - montantAchats;
            montantMarge = 0;
          } else {
            // Même pas assez pour les achats complets
            montantAchats = resteApresMO;
            montantFraisGeneraux = 0;
            montantMarge = 0;
          }
        } else {
          // La main d'œuvre dépasse le devis
          montantAchats = 0;
          montantFraisGeneraux = 0;
          montantMarge = 0;
        }
      }
      
      // Calculer les pourcentages réels
      const pourcentageMainOeuvre = montantDevis > 0 ? Math.round((montantMainOeuvre / montantDevis) * 100) : 0;
      const pourcentageAchats = montantDevis > 0 ? Math.round((montantAchats / montantDevis) * 100) : 0;
      const pourcentageFraisGeneraux = montantDevis > 0 ? Math.round((montantFraisGeneraux / montantDevis) * 100) : 0;
      const pourcentageMarge = montantDevis > 0 ? Math.round((montantMarge / montantDevis) * 100) : 0;
      
      console.log('💰 Nouvelle répartition:', {
        montantDevis,
        montantMainOeuvre: `${montantMainOeuvre}€ (${pourcentageMainOeuvre}%)`,
        montantAchats: `${montantAchats}€ (${pourcentageAchats}%)`,
        montantFraisGeneraux: `${montantFraisGeneraux}€ (${pourcentageFraisGeneraux}%)`,
        montantMarge: `${montantMarge}€ (${pourcentageMarge}%)`
      });
      
      // Mise à jour avec la nouvelle répartition
      estimationMiseAJour = {
        ...estimationMiseAJour,
        montantAchats,
        montantMainOeuvre,
        montantFraisGeneraux,
        montantMarge,
        pourcentages: {
          achats: pourcentageAchats,
          mainOeuvre: pourcentageMainOeuvre,
          fraisGeneraux: pourcentageFraisGeneraux,
          marge: pourcentageMarge
        },
        // 💰 NOUVEAU : Ajouter les montants détaillés de main d'œuvre
        montantMainOeuvreCout: montantMainOeuvre,
        montantMainOeuvreVente: estimationMiseAJour.montantMainOeuvreVente || montantMainOeuvre * 3,
        montantMainOeuvreGain: estimationMiseAJour.montantMainOeuvreGain || montantMainOeuvre * 2
      };
      
      // Plus besoin de recalculer
      delete estimationMiseAJour.recalculerRepartition;
    }
    
    // 🚀 SYNC : Utiliser l'état local
    setEstimation(estimationMiseAJour);
    setHasChanges(true);
    
    // 🔄 CORRECTION : Protection légère seulement pour les changements de dates
    if (estimationMiseAJour.dateDebut || estimationMiseAJour.dateFin) {
      setIsSelectingDates(true);
      // Désactiver après un délai très court
      setTimeout(() => {
        setIsSelectingDates(false);
      }, 500); // 500ms seulement
    }
    
    // 🚫 DÉSACTIVER COMPLÈTEMENT LA SAUVEGARDE AUTOMATIQUE
    // La sauvegarde automatique cause des conflits avec les modifications utilisateur
    // SEULE la sauvegarde manuelle est autorisée
    
    // 🔧 Nettoyer tout timeout existant
    if (window.autoSaveTimeout) {
      clearTimeout(window.autoSaveTimeout);
      window.autoSaveTimeout = null;
    }
  };
  
  // 🚫 SUPPRIMER COMPLÈTEMENT LA SAUVEGARDE AUTOMATIQUE
  // Cette fonction n'est plus utilisée pour éviter les conflits
  
  const handleSauvegarder = async () => {
    if (!estimation.montantDevis || estimation.montantDevis <= 0) {
      alert('Veuillez saisir un montant valide avant de sauvegarder');
      return;
    }
    
    // 🔧 PROTECTION : Empêcher les sauvegardes multiples simultanées
    if (isSaving) {
      console.log('🔒 Sauvegarde déjà en cours, ignorée');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // 🔧 NETTOYER tout timeout de sauvegarde automatique
      if (window.autoSaveTimeout) {
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = null;
      }
      
      // Préparer les données pour sauvegarde
      const estimationComplete = {
        ...estimation,
        affaireId: affaire.id,
        affaireNumero: affaire.numero,
        affaireClient: affaire.client,
        couleurPastel: couleurAffaire?.pastel,
        couleurBordure: couleurAffaire?.bordure,
        dateCreation: new Date().toISOString(),
        version: '1.0'
      };
      
      console.log('💾 SAUVEGARDE MANUELLE UNIQUE:', estimationComplete);
      console.log('🔍 DEBUG - État estimation actuel:', {
        montantDevis: estimation.montantDevis,
        montantAchats: estimation.montantAchats,
        montantMainOeuvre: estimation.montantMainOeuvre,
        montantMainOeuvreCout: estimation.montantMainOeuvreCout,
        montantFraisGeneraux: estimation.montantFraisGeneraux,
        montantMarge: estimation.montantMarge,
        totalDemiJournees: estimation.totalDemiJournees
      });
      
      // Sauvegarder via le callback parent
      if (onEstimationSave) {
        await onEstimationSave(estimationComplete);
      }
      
      // 🔥 NOUVEAU : Émettre un événement pour notifier le parent
      window.dispatchEvent(new CustomEvent('estimation_updated', { 
        detail: { affaireId: affaire.id } 
      }));
      
      // ✅ Marquer comme sauvegardé (l'appel à onEstimationSave a déjà été fait ligne 432)
      setLastSaved(new Date());
      setJustSaved(true); // 🔒 Activer le flag après sauvegarde
      
      console.log('✅ SAUVEGARDE TERMINÉE - Modifications futures autorisées');
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
      // 🔧 PAS DE FLAG DE PROTECTION - Autoriser modifications immédiates
    }
  };
  
  const handleReset = async () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser l\'estimation ?\n\nCette action supprimera :\n- L\'estimation intelligente\n- Les objectifs de l\'affaire (CA, achats, heures...)\n- Les affectations planning associées\n- Toutes les données en cache')) {
      console.log('🔄 DÉBUT RÉINITIALISATION COMPLÈTE');
      
      // 🛑 Annuler la sauvegarde automatique en cours
      if (window.autoSaveTimeout) {
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = null;
      }
      
      // 🗑️ ÉTAPE 1 : Nettoyer TOUTES les sources de données
      try {
        // Supprimer de l'API
        await estimationService.deleteEstimationsByAffaire(affaire.id);
        console.log('🧹 Base de données nettoyée');
        
        // 🆕 ÉTAPE 1.5 : Supprimer les affectations du planning pour cette affaire
        try {
          const { default: planningEquipeService } = await import('../../../services/planningEquipeService');
          await planningEquipeService.supprimerAffectationsAffaire(affaire.id);
          console.log('🧹 Affectations planning supprimées');
        } catch (planningError) {
          console.warn('⚠️ Erreur lors de la suppression des affectations planning:', planningError);
        }
        
        // 🔥 NOUVEAU : Remettre à zéro les objectifs de l'affaire
        try {
          console.log('🔄 Tentative de mise à jour des objectifs pour affaire:', affaire.id);
          const updateData = {
            objectifCaHt: 0,
            objectifAchatHt: 0,
            objectifHeuresFab: 0,
            objectifHeuresSer: 0,
            objectifHeuresPose: 0,
            objectifFraisGeneraux: 0,
            dateCommencement: null,
            dateCloturePrevue: null
          };
          console.log('📊 Données à envoyer:', updateData);
          
          const result = await affairesService.updateAffaire(affaire.id, updateData);
          console.log('✅ Résultat de la mise à jour:', result);
          console.log('🧹 Objectifs de l\'affaire remis à zéro avec succès');
        } catch (updateError) {
          console.error('❌ ERREUR DÉTAILLÉE lors de la mise à jour des objectifs:', updateError);
          console.error('❌ Message:', updateError.message);
          console.error('❌ Stack:', updateError.stack);
          console.error('❌ Response:', updateError.response);
          
          // Afficher une alerte à l'utilisateur
          alert(`Erreur lors de la remise à zéro des objectifs: ${updateError.message || 'Erreur inconnue'}`);
        }
        
        // Nettoyer le cache en mémoire (window.planningEstimations)
        if (window.planningEstimations && window.planningEstimations.has(affaire.id)) {
          window.planningEstimations.delete(affaire.id);
          console.log('🧹 Cache mémoire nettoyé');
        }
        
        // Nettoyer localStorage
        try {
          localStorage.removeItem(`estimation_${affaire.id}`);
          console.log('🧹 LocalStorage nettoyé');
        } catch (localError) {
          // Stockage local non accessible
        }
        
        // 🆕 Nettoyer la synchronisation planning
        try {
          const { clearPlanningEstimation } = await import('./utils/planningSync');
          clearPlanningEstimation(affaire.id);
          console.log('🧹 Synchronisation planning nettoyée');
        } catch (syncError) {
          console.warn('⚠️ Erreur lors du nettoyage de la synchronisation:', syncError);
        }
      } catch (error) {
        console.warn('⚠️ Erreur lors de la suppression:', error);
        // Continuer malgré l'erreur pour au moins réinitialiser localement
      }
      
      // 🔄 ÉTAPE 2 : Réinitialiser l'estimation locale
      const estimationVide = {
        montantDevis: 0,
        dateDebut: '',
        dateFin: '',
        totalDemiJournees: 0,
        nombrePersonnes: 2,
        montantAchats: 0,
        montantMainOeuvre: 0,
        montantFraisGeneraux: 0,
        montantMarge: 0,
        // 🆕 Réinitialiser aussi les propriétés étendues
        demiJourneesFabrication: 0,
        demiJourneesPose: 0,
        tauxHoraire: 75,
        dateCommencement: '',
        dateReception: '',
        categoriesAchats: [],
        repartitionAchats: {},
        repartitionFabrication: 60,
        repartitionPose: 40
      };
      
      setEstimation(estimationVide);
      
      // 🧹 ÉTAPE 3 : Nettoyer tous les états associés
      setHasChanges(false);
      setAffectationsDetectees([]);
      setDateSurvolee(null);
      setAffectationsJourSurvole([]);
      setLastSaved(null);
      setHasMontantValide(false);
      setHasPlanningComplete(false);
      
      // 🔄 ÉTAPE 4 : Déclencher la réinitialisation forcée du calendrier
      setResetTrigger(prev => prev + 1);
      
      // 🆕 ÉTAPE 5 : Forcer le rechargement du calendrier après un délai
      setTimeout(() => {
        setResetTrigger(prev => prev + 1);
      }, 300);
      
      // 🔥 NOUVEAU : Émettre un événement pour notifier le parent
      window.dispatchEvent(new CustomEvent('estimation_reset', { 
        detail: { affaireId: affaire.id } 
      }));
      
      console.log('✅ RÉINITIALISATION COMPLÈTE TERMINÉE');
      
      // 🆕 Notification visuelle
      alert('✅ Estimation réinitialisée avec succès !\n\n- Données supprimées de la base\n- Objectifs de l\'affaire remis à zéro\n- Affectations planning nettoyées\n- Caches vidés');
      
      // 🔄 NOUVEAU : Rafraîchir les données financières après réinitialisation
      if (onEstimationReset) {
        onEstimationReset();
      }
      
      // 🔥 FORCER LE RECHARGEMENT DE LA PAGE pour garantir la mise à jour
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };
  
  const isEstimationComplete = estimation.montantDevis > 0 && estimation.dateDebut && estimation.dateFin;
  
  return (
    <div className="affaire-estimation space-y-6 p-6 bg-white min-h-screen">
      {/* 🎨 Cartouche principal */}
      <EstimationCartouche 
        affaire={affaire}
        onEstimationChange={handleEstimationChange}
      />
      
      {/* 📊 Barre d'état */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* 🌟 Indicateur de progression intelligente */}
              <div className="flex items-center gap-2">
                <Badge 
                  variant={hasMontantValide ? "default" : "secondary"}
                  className={hasMontantValide ? "bg-blue-100 text-blue-800" : ""}
                >
                  {hasMontantValide ? "1️⃣ Montant ✅" : "1️⃣ Montant ⏳"}
                </Badge>
                <span className="text-gray-400">→</span>
                <Badge 
                  variant={hasPlanningComplete ? "default" : "secondary"}
                  className={hasPlanningComplete ? "bg-purple-100 text-purple-800" : ""}
                >
                  {hasPlanningComplete ? "2️⃣ Planning ✅" : "2️⃣ Planning ⏳"}
                </Badge>
                <span className="text-gray-400">→</span>
                <Badge 
                  variant={isEstimationComplete ? "default" : "secondary"}
                  className={isEstimationComplete ? "bg-green-100 text-green-800" : ""}
                >
                  {isEstimationComplete ? "3️⃣ Calculs ✅" : "3️⃣ Calculs ⏳"}
                </Badge>
              </div>
              
              {estimation.montantDevis > 0 && (
                <Badge variant="outline" className="text-blue-600">
                  <IconChartBar className="w-4 h-4 mr-1" />
                  {estimation.montantDevis.toLocaleString()}€
                </Badge>
              )}
              
              {estimation.totalDemiJournees > 0 && (
                <Badge variant="outline" className="text-purple-600">
                  <IconUsers className="w-4 h-4 mr-1" />
                  {estimation.totalDemiJournees} demi-j
                </Badge>
              )}
              
              {couleurAffaire && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ 
                      backgroundColor: couleurAffaire.pastel,
                      borderColor: couleurAffaire.bordure
                    }}
                  />
                  <span className="text-sm text-gray-600">Planning coloré</span>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {lastSaved && !hasChanges && (
                <Badge variant="secondary" className="text-green-600">
                  <IconDeviceFloppy className="w-4 h-4 mr-1" />
                  Sauvegardé à {lastSaved.toLocaleTimeString()}
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
              >
                <IconRefresh className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
              
              <Button
                onClick={handleSauvegarder}
                disabled={isSaving || !estimation.montantDevis}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <IconDeviceFloppy className={`w-4 h-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 🔥 Grille des blocs d'estimation - 4 colonnes pour espace maximal */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* 💰 Colonne 1 - Montant & Affectations */}
        <div className="space-y-6">
          <BlocMontant
            affaire={affaire}
            estimation={estimation}
            onEstimationChange={handleEstimationChange}
          />
          
          {/* 👥 Bloc Affectations - Sous le montant */}
          <div className={`relative transition-all duration-500 ${!hasMontantValide ? 'opacity-50 pointer-events-none' : ''}`}>
            <BlocAffectations
              affectations={affectationsJourSurvole}
              dateSurvolee={dateSurvolee}
              disabled={!hasMontantValide}
              onRefresh={() => {
                // Déclencher le rechargement des affectations via le calendrier
                console.log('🔄 Rechargement des affectations depuis le bloc dédié');
              }}
            />
            {!hasMontantValide && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg backdrop-blur-sm">
                <div className="text-center text-gray-500">
                  <div className="text-lg font-semibold">🔒 Verrouillé</div>
                  <div className="text-sm">Validez d'abord le montant du devis</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 📅 Colonne 2 - Planning & Temps */}
        <div className="space-y-6">
          {/* 📅 Bloc Temps - Révélé après validation montant */}
          <div className={`relative transition-all duration-500 ${!hasMontantValide ? 'opacity-50 pointer-events-none' : ''}`}>
            <BlocTemps
              estimation={estimation}
              onEstimationChange={handleEstimationChange}
              affaire={affaire}
              disabled={!hasMontantValide}
              resetTrigger={resetTrigger}
              onAffectationsChange={setAffectationsDetectees}
              onDateSurvol={(date, affectations) => {
                setDateSurvolee(date);
                setAffectationsJourSurvole(affectations);
              }}
            />
            {!hasMontantValide && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg backdrop-blur-sm">
                <div className="text-center text-gray-500">
                  <div className="text-lg font-semibold">🔒 Verrouillé</div>
                  <div className="text-sm">Validez d'abord le montant du devis</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 🛠️ Colonne 3 - Ressources & Achats */}
        <div className="space-y-6">
          {/* Bloc Équipe - Révélé après planning complet */}
          <div className={`relative transition-all duration-500 ${!hasPlanningComplete ? 'opacity-50 pointer-events-none' : ''}`}>
            <BlocEquipe 
              estimation={estimation} 
              onEstimationChange={handleEstimationChange}
              disabled={!hasPlanningComplete}
            />
            {!hasPlanningComplete && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg backdrop-blur-sm">
                <div className="text-center text-gray-500">
                  <div className="text-lg font-semibold">🔒 Verrouillé</div>
                  <div className="text-sm">Complétez le planning pour révéler les calculs</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Bloc Achats - Révélé après planning complet */}
          <div className={`relative transition-all duration-500 ${!hasPlanningComplete ? 'opacity-50 pointer-events-none' : ''}`}>
            <BlocAchats 
              estimation={estimation} 
              onEstimationChange={handleEstimationChange}
              disabled={!hasPlanningComplete}
              montantDevis={estimation.montantDevis}
            />
            {!hasPlanningComplete && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg backdrop-blur-sm">
                <div className="text-center text-gray-500">
                  <div className="text-lg font-semibold">🔒 Verrouillé</div>
                  <div className="text-sm">Complétez le planning pour révéler les calculs</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 📊 Colonne 4 - Analyses & Graphiques */}
        <div className="space-y-6">
          {/* 📊 Camembert de répartition */}
          <div className={`relative transition-all duration-500 ${!hasPlanningComplete ? 'opacity-50 pointer-events-none' : ''}`}>
            <CamembertEstimation estimation={estimation} />
            {!hasPlanningComplete && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg backdrop-blur-sm">
                <div className="text-center text-gray-500">
                  <div className="text-lg font-semibold">🔒 Verrouillé</div>
                  <div className="text-sm">Complétez le planning pour révéler les calculs</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 🎯 Résumé final si estimation complète */}
      {isEstimationComplete && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-green-900">
                🎉 Estimation Complète
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-800">
                    {estimation.montantDevis.toLocaleString()}€
                  </div>
                  <div className="text-sm text-green-600">Montant total</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-green-800">
                    {estimation.totalDemiJournees || 0}
                  </div>
                  <div className="text-sm text-green-600">Demi-journées</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-green-800">
                    {new Date(estimation.dateDebut).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="text-sm text-green-600">Date début</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-green-800">
                    {new Date(estimation.dateFin).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="text-sm text-green-600">Date fin</div>
                </div>
              </div>
              
              <div className="text-sm text-green-600">
                L'estimation est synchronisée avec le planning équipe
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AffaireEstimation; 