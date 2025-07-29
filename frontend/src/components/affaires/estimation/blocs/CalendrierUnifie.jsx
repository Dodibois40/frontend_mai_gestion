import React, { useState, useEffect } from 'react';
import { 
  IconCalendar, 
  IconChevronLeft, 
  IconChevronRight,
  IconAlertTriangle,
  IconInfoCircle,
  IconUsers,
  IconClock,
  IconCheck,
  IconRefresh
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import planningEquipeService from '../../../../services/planningEquipeService';

/**
 * Calendrier Unifié - Sélection de plage avec affichage des affectations existantes
 * Remplace les deux champs de dates séparés
 */
const CalendrierUnifie = ({ 
  dateDebut, 
  dateFin, 
  onDateRangeChange,
  affaireId,
  estimation = {},
  resetTrigger = 0,
  className = '',
  onAffectationsChange,
  onDateSurvol,
  affaire = null
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempDateDebut, setTempDateDebut] = useState('');
  const [tempDateFin, setTempDateFin] = useState('');
  const [selectingStart, setSelectingStart] = useState(true);
  const [affectationsExistantes, setAffectationsExistantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const [lastAffaireId, setLastAffaireId] = useState(affaireId);

  // 🔧 Fonction utilitaire pour formater les dates localement
  const formatDateLocal = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 🔄 DÉTECTION CHANGEMENT D'AFFAIRE : Réinitialiser automatiquement
  useEffect(() => {
    if (affaireId !== lastAffaireId) {
      console.log('🔄 CHANGEMENT D\'AFFAIRE DÉTECTÉ dans le calendrier:', lastAffaireId, '→', affaireId);
      
      // Réinitialiser tous les états temporaires ET les props
      setIsSelecting(false);
      setTempDateDebut('');
      setTempDateFin('');
      setSelectingStart(true);
      setLastClickTime(0);
      setAffectationsExistantes([]);
      
      // 🔄 NOUVEAU : Notifier le parent pour effacer aussi les dates sélectionnées
      if (onDateRangeChange) {
        onDateRangeChange('', '');
      }
      
      // Mettre à jour la référence
      setLastAffaireId(affaireId);
      
      // Notifier le parent du vidage
      if (onAffectationsChange) {
        onAffectationsChange([]);
      }
      
      // Recharger les affectations pour la nouvelle affaire après un délai
      setTimeout(() => {
        chargerAffectationsExistantes();
      }, 100);
    }
  }, [affaireId, lastAffaireId]);

  // Charger les affectations existantes
  useEffect(() => {
    // 🔄 CORRECTION : Rechargement intelligent - seulement si nécessaire
    const shouldReload = !isSelecting && !tempDateDebut && !tempDateFin && selectingStart;
    if (shouldReload) {
      chargerAffectationsExistantes();
    }
  }, [currentMonth]);

  // 🔄 FORCE : Réinitialiser quand le trigger change (depuis le parent)
  useEffect(() => {
    if (resetTrigger > 0) {
      console.log('🔄 RÉINITIALISATION FORCÉE DU CALENDRIER - resetTrigger:', resetTrigger);
      
      // 🧹 ÉTAPE 1 : Nettoyer TOUS les états temporaires
      setIsSelecting(false);
      setTempDateDebut('');
      setTempDateFin('');
      setSelectingStart(true);
      setLastClickTime(0);
      
      // 🧹 ÉTAPE 2 : Vider les affectations existantes IMMÉDIATEMENT
      console.log('🔄 Vidage immédiat des affectations du calendrier');
      setAffectationsExistantes([]);
      if (onAffectationsChange) {
        onAffectationsChange([]);
      }
      
      // 🧹 ÉTAPE 3 : FORCER la notification au parent pour effacer les dates
      if (onDateRangeChange) {
        console.log('🔄 Notification au parent pour effacer les dates');
        onDateRangeChange('', '');
      }
      
      // 🔄 ÉTAPE 4 : Rechargement différé pour éviter conflits
      setTimeout(() => {
        chargerAffectationsExistantes();
      }, 200);
    }
  }, [resetTrigger]);

  // 🔄 CORRECTION : Réinitialiser les états temporaires quand l'estimation est réinitialisée
  useEffect(() => {
    // Si l'estimation est réinitialisée (montant = 0), forcer la remise à zéro
    if (estimation.montantDevis === 0) {
      setIsSelecting(false);
      setTempDateDebut('');
      setTempDateFin('');
      setSelectingStart(true);
    }
  }, [estimation.montantDevis]);

  // 🔄 SYNC OPTIMISÉE : Synchronisation intelligente avec les props
  useEffect(() => {
    // 🔄 CORRECTION : Synchronisation seulement si changement significatif
    const datesChanged = (dateDebut !== tempDateDebut || dateFin !== tempDateFin);
    const hasValidDates = dateDebut && dateFin;
    
    if (datesChanged && hasValidDates) {
      // Si on a des dates validées, effacer les états temporaires
      setTempDateDebut('');
      setTempDateFin('');
      setSelectingStart(true);
      setIsSelecting(false);
    } else if (!dateDebut && !dateFin && (tempDateDebut || tempDateFin)) {
      // Si les dates sont effacées mais on a des temporaires, les garder
      // Ne pas réinitialiser pour préserver le travail utilisateur
    }
  }, [dateDebut, dateFin]);

  // 🔄 CORRECTION : Rechargement intelligent basé sur le montant
  useEffect(() => {
    if (estimation && typeof estimation.montantDevis !== 'undefined') {
      // 🔄 CORRECTION : Ne pas recharger si utilisateur en cours de sélection
      if (isSelecting || tempDateDebut || tempDateFin) {
        return;
      }
      
      // Rechargement différé et conditionnel
      const shouldReload = estimation.montantDevis === 0 || 
                          (estimation.montantDevis > 0 && !dateDebut && !dateFin);
      
      if (shouldReload) {
        const timer = setTimeout(() => {
          // Double vérification avant rechargement
          if (!isSelecting && !tempDateDebut && !tempDateFin) {
            chargerAffectationsExistantes();
          }
        }, 300);
        
        return () => clearTimeout(timer);
      }
    }
  }, [estimation.montantDevis]);
  
  // 🔄 CORRECTION : Synchronisation douce des dates props
  useEffect(() => {
    if (dateDebut && dateFin) {
      // Ne pas interférer avec les états temporaires
      // Juste s'assurer qu'on n'est pas en mode sélection
      if (isSelecting && !tempDateDebut && !tempDateFin) {
        setIsSelecting(false);
        setSelectingStart(true);
      }
    }
  }, [dateDebut, dateFin]);

  // 🔧 Fonction utilitaire pour notifier le parent avec les affectations filtrées
  const notifierParentAffectationsFiltrées = () => {
    if (onAffectationsChange && affectationsExistantes.length > 0) {
      let affectationsFiltrées = affectationsExistantes;
      
      // 🔄 CORRECTION : Masquage intelligent basé sur l'état de l'estimation
      const shouldMask = affaireId && (!estimation.montantDevis || estimation.montantDevis <= 0);
      if (shouldMask) {
        affectationsFiltrées = affectationsExistantes.filter(affectation => affectation.affaireId !== affaireId);
      }
      
      onAffectationsChange(affectationsFiltrées);
    }
  };

  // Gestion des raccourcis clavier pour la navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Éviter de déclencher si l'utilisateur tape dans un input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateMonth(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigateMonth(1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);



  // Gestionnaires d'événements de survol pour le bloc dédié
  const handleMouseEnterDate = (date) => {
    const dateStr = formatDateLocal(date);
    const affectationsDate = getAffectationsDate(date);
    
    // Transmettre les informations de survol au bloc dédié
    if (onDateSurvol) {
      onDateSurvol(dateStr, affectationsDate);
    }
  };

  const handleMouseLeaveDate = () => {
    // Notifier qu'on quitte la date
    if (onDateSurvol) {
      onDateSurvol(null, []);
    }
  };

  // Fonction utilitaire pour formater une date sans problème de timezone (utilise la fonction principale)

  // Fonction de diagnostic pour comparer avec le planning équipe
  const chargerAffectationsExistantes = async () => {
    try {
      // 🔒 Protection : ne pas recharger si on est en cours de sélection
      if (isSelecting || !selectingStart || tempDateDebut || tempDateFin) {
        return;
      }
      
      // 🔄 CORRECTION : Si l'estimation est réinitialisée, vider les affectations
      if (estimation.montantDevis === 0) {
        console.log('🔄 Estimation réinitialisée, vidage des affectations du calendrier');
        setAffectationsExistantes([]);
        if (onAffectationsChange) {
          onAffectationsChange([]);
        }
        return;
      }
      
      setLoading(true);
      
      // Calculer la plage du mois avec quelques jours avant/après
      const debutMois = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const finMois = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      // Étendre la plage pour inclure les jours visibles du calendrier
      const premierJourVisible = new Date(debutMois);
      premierJourVisible.setDate(premierJourVisible.getDate() - ((debutMois.getDay() || 7) - 1));
      
      const dernierJourVisible = new Date(finMois);
      dernierJourVisible.setDate(dernierJourVisible.getDate() + (7 - finMois.getDay()));
      
      // 🔥 NOUVELLE APPROCHE : Récupérer TOUTES les semaines avec un chevauchement pour éviter les pertes
      const affectationsCompletes = [];
      let dateActuelle = new Date(premierJourVisible);
      
      // Assurer qu'on commence un lundi
      while (dateActuelle.getDay() !== 1) {
        dateActuelle.setDate(dateActuelle.getDate() - 1);
      }
      
      const semainesRecuperees = [];
      
      while (dateActuelle <= dernierJourVisible) {
        try {
          const dateActuelleStr = formatDateLocal(dateActuelle);
          
          const planningData = await planningEquipeService.getPlanningHebdomadaire(
            dateActuelleStr,
            false
          );
          
          semainesRecuperees.push(dateActuelleStr);
          
          // L'API retourne directement un array d'affectations
          if (Array.isArray(planningData)) {
            affectationsCompletes.push(...planningData);
          } else if (planningData && planningData.affectations) {
            // Fallback au cas où la structure changerait
            affectationsCompletes.push(...planningData.affectations);
          }
          
        } catch (error) {
          console.error(`❌ Erreur chargement semaine ${formatDateLocal(dateActuelle)}:`, error);
        }
        
        // Passer à la semaine suivante (7 jours exactement)
        dateActuelle.setDate(dateActuelle.getDate() + 7);
      }
      
      // 🔍 DÉDUPLICATION : Éliminer les doublons éventuels
      const affectationsUniques = new Map();
      affectationsCompletes.forEach(affectation => {
        const key = `${affectation.id}-${affectation.dateAffectation}-${affectation.userId}-${affectation.periode}`;
        if (!affectationsUniques.has(key)) {
          affectationsUniques.set(key, affectation);
        }
      });
      
      const affectationsDedupliquees = Array.from(affectationsUniques.values());
      

      
      // AMÉLIORATION : Extraire TOUTES les affectations (plus seulement les "autres affaires")
      const datesOccupees = [];

      affectationsDedupliquees.forEach((affectation, index) => {
        // CORRECTION : Normaliser la date au format YYYY-MM-DD SANS problème de timezone
        let dateAffectation;
        if (typeof affectation.dateAffectation === 'string') {
          // Si c'est une string, extraire la date (peut être ISO ou juste date)
          dateAffectation = affectation.dateAffectation.split('T')[0];
        } else {
          // Si c'est un objet Date, convertir EN ÉVITANT les problèmes de timezone
          const date = new Date(affectation.dateAffectation);
          // Forcer la date locale (éviter la conversion UTC)
          dateAffectation = formatDateLocal(date);
        }
        
        // NOUVELLE LOGIQUE : Afficher TOUTES les affectations avec indication si c'est l'affaire courante
        const estAffaireCourante = affaireId && affectation.affaireId === affaireId;
        
        datesOccupees.push({
          date: dateAffectation,
          affaireNumero: affectation.affaire?.numero || 'N/A',
          affaireLibelle: affectation.affaire?.libelle || 'Affaire',
          periode: affectation.periode,
          ouvrier: `${affectation.user?.prenom || ''} ${affectation.user?.nom || ''}`.trim(),
          affaireId: affectation.affaireId,
          estAffaireCourante: estAffaireCourante
        });
      });
      
      // 🔍 DIAGNOSTIC WEEKEND - Détecter les affectations de weekend suspectes
      const affectationsWeekend = datesOccupees.filter(affectation => {
        const date = new Date(affectation.date + 'T12:00:00'); // Forcer midi pour éviter les problèmes de timezone
        const jour = date.getDay(); // 0 = dimanche, 6 = samedi
        return jour === 0 || jour === 6;
      });
      
      if (affectationsWeekend.length > 0) {
        console.warn(`🚨 WEEKEND ALERT: ${affectationsWeekend.length} affectation(s) détectée(s) en WEEKEND :`);
        affectationsWeekend.forEach(affectation => {
          const date = new Date(affectation.date + 'T12:00:00');
          const jourNom = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][date.getDay()];
          console.warn(`  - ${affectation.date} (${jourNom}) : ${affectation.affaireNumero} - ${affectation.ouvrier} (${affectation.periode})`);
        });
        
        // Afficher une alerte dans l'interface aussi
      }
      
      setAffectationsExistantes(datesOccupees);
      
      // Notifier le parent des affectations chargées - AVEC FILTRAGE
      // Attendre que l'état soit mis à jour avant de notifier
      setTimeout(() => {
        notifierParentAffectationsFiltrées();
      }, 0);
      
    } catch (error) {
      console.error('❌ Erreur chargement affectations:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() || 7) - 1));
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Générer 42 jours (6 semaines)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const isDateOccupied = (date) => {
    // Utiliser la fonction filtrée pour respecter le masquage des affectations
    const affectationsDate = getAffectationsDate(date);
    return affectationsDate.length > 0;
  };

  const getAffectationsDate = (date) => {
    // Utiliser la date locale pour éviter les problèmes de timezone
    const dateStr = formatDateLocal(date);
    
    // Filtrer les affectations pour cette date
    let affectationsDate = affectationsExistantes.filter(affectation => affectation.date === dateStr);
    
    // 🔒 NOUVELLE LOGIQUE : TOUJOURS masquer les affectations de l'affaire courante 
    // SAUF si on a sélectionné explicitement de nouvelles dates dans cette session
    if (affaireId) {
      const aSelectionneNouvellesDates = (dateDebut && dateFin) || (tempDateDebut && tempDateFin);
      
      // Si on n'a pas sélectionné de nouvelles dates, masquer les affectations de cette affaire
      if (!aSelectionneNouvellesDates) {
        affectationsDate = affectationsDate.filter(affectation => affectation.affaireId !== affaireId);
        console.log(`🔒 Masquage affectations affaire ${affaireId} pour date ${dateStr} (pas de nouvelle sélection)`);
      }
    }
    
    return affectationsDate;
  };

  const isDateInCurrentMonth = (date) => {
    const inCurrentMonth = date.getMonth() === currentMonth.getMonth();
    
    return inCurrentMonth;
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // 🎉 NOUVEAU : Calculer les jours fériés français
  const getJoursFeries = (annee) => {
    const joursFeries = [];
    
    // Jours fériés fixes
    joursFeries.push(`${annee}-01-01`); // Jour de l'An
    joursFeries.push(`${annee}-05-01`); // Fête du Travail
    joursFeries.push(`${annee}-05-08`); // Victoire 1945
    joursFeries.push(`${annee}-07-14`); // Fête Nationale
    joursFeries.push(`${annee}-08-15`); // Assomption
    joursFeries.push(`${annee}-11-01`); // Toussaint
    joursFeries.push(`${annee}-11-11`); // Armistice 1918
    joursFeries.push(`${annee}-12-25`); // Noël
    
    // Calcul de Pâques (algorithme de Meeus/Jones/Butcher)
    const a = annee % 19;
    const b = Math.floor(annee / 100);
    const c = annee % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mois = Math.floor((h + l - 7 * m + 114) / 31);
    const jour = ((h + l - 7 * m + 114) % 31) + 1;
    
    const paques = new Date(annee, mois - 1, jour);
    
    // Lundi de Pâques (1 jour après Pâques)
    const lundiPaques = new Date(paques);
    lundiPaques.setDate(paques.getDate() + 1);
    joursFeries.push(formatDateLocal(lundiPaques));
    
    // Ascension (39 jours après Pâques)
    const ascension = new Date(paques);
    ascension.setDate(paques.getDate() + 39);
    joursFeries.push(formatDateLocal(ascension));
    
    // Lundi de Pentecôte (50 jours après Pâques)
    const pentecote = new Date(paques);
    pentecote.setDate(paques.getDate() + 50);
    joursFeries.push(formatDateLocal(pentecote));
    
    return joursFeries;
  };

  // Vérifier si une date est un jour férié
  const isJourFerie = (date) => {
    const dateStr = formatDateLocal(date);
    const annee = date.getFullYear();
    const joursFeries = getJoursFeries(annee);
    return joursFeries.includes(dateStr);
  };

  // Obtenir le nom du jour férié
  const getNomJourFerie = (date) => {
    const dateStr = formatDateLocal(date);
    const mois = date.getMonth() + 1;
    const jour = date.getDate();
    
    if (mois === 1 && jour === 1) return "Jour de l'An";
    if (mois === 5 && jour === 1) return "Fête du Travail";
    if (mois === 5 && jour === 8) return "Victoire 1945";
    if (mois === 7 && jour === 14) return "Fête Nationale";
    if (mois === 8 && jour === 15) return "Assomption";
    if (mois === 11 && jour === 1) return "Toussaint";
    if (mois === 11 && jour === 11) return "Armistice 1918";
    if (mois === 12 && jour === 25) return "Noël";
    
    // Pour les dates mobiles, on vérifie
    const annee = date.getFullYear();
    const joursFeries = getJoursFeries(annee);
    if (joursFeries.includes(dateStr)) {
      // Identifier lequel c'est basé sur la proximité de Pâques
      const a = annee % 19;
      const b = Math.floor(annee / 100);
      const c = annee % 100;
      const d = Math.floor(b / 4);
      const e = b % 4;
      const f = Math.floor((b + 8) / 25);
      const g = Math.floor((b - f + 1) / 3);
      const h = (19 * a + b - d - g + 15) % 30;
      const i = Math.floor(c / 4);
      const k = c % 4;
      const l = (32 + 2 * e + 2 * i - h - k) % 7;
      const m = Math.floor((a + 11 * h + 22 * l) / 451);
      const moisPaques = Math.floor((h + l - 7 * m + 114) / 31);
      const jourPaques = ((h + l - 7 * m + 114) % 31) + 1;
      
      const paques = new Date(annee, moisPaques - 1, jourPaques);
      const diffJours = Math.round((date - paques) / (1000 * 60 * 60 * 24));
      
      if (diffJours === 1) return "Lundi de Pâques";
      if (diffJours === 39) return "Ascension";
      if (diffJours === 50) return "Lundi de Pentecôte";
    }
    
    return "";
  };

  const isDateSelected = (date) => {
    // Utiliser la date locale pour éviter les problèmes de timezone
    const dateStr = formatDateLocal(date);
    
    // 🔄 CORRECTION : Priorité aux props validées (après sauvegarde)
    // Si on a des dates validées, les états temporaires ne doivent pas interférer
    if (dateDebut && dateFin) {
      // Si on a des dates validées, on ne considère comme "sélectionnées" que si on est en cours de modification
      if (tempDateDebut || tempDateFin) {
        return dateStr === tempDateDebut || dateStr === tempDateFin;
      }
      // Sinon, aucune date n'est "sélectionnée" (elles sont dans l'estimation)
      return false;
    }
    
    // Sinon, utiliser les états temporaires pour la sélection en cours
    return dateStr === tempDateDebut || dateStr === tempDateFin;
  };

  const isDateInRange = (date) => {
    // 🔄 CORRECTION : Priorité aux props validées, puis états temporaires
    const debut = dateDebut || tempDateDebut;
    const fin = dateFin || tempDateFin;
    
    if (!debut || !fin) return false;
    
    // Utiliser la date locale pour éviter les problèmes de timezone
    const dateStr = formatDateLocal(date);
    
    // 🔄 CORRECTION : Si on a des dates validées, ne pas considérer comme "range sélectionnée"
    if (dateDebut && dateFin) {
      // Les dates validées sont dans l'estimation, pas dans la range de sélection
      return false;
    }
    
    // Sinon, utiliser les états temporaires pour la sélection en cours
    return dateStr >= debut && dateStr <= fin;
  };

  const isDateInEstimation = (date) => {
    const dateStr = formatDateLocal(date);
    
    // 🔒 SOLUTION DRASTIQUE : MASQUER TOUTES LES DATES VERTES si montant = 0
    if (!estimation.montantDevis || estimation.montantDevis <= 0) {
      return false; // AUCUNE date verte si pas de montant
    }
    
    // 🔄 CORRECTION FINALE : Vérifier d'abord si les dates sont effacées (après réinitialisation)
    if (!dateDebut || !dateFin || dateDebut === '' || dateFin === '') {
      return false; // Pas de dates vertes si les props sont vides
    }
    
    // 🔧 EXTRACTION DE LA DATE depuis les props ISO avec timestamp
    let debutISO = dateDebut;
    let finISO = dateFin;
    
    if (typeof dateDebut === 'string' && dateDebut.includes('T')) {
      debutISO = dateDebut.split('T')[0]; // 2025-08-12T00:00:00.000Z → 2025-08-12
    }
    if (typeof dateFin === 'string' && dateFin.includes('T')) {
      finISO = dateFin.split('T')[0]; // 2025-08-15T00:00:00.000Z → 2025-08-15
    }
    
    const isInRange = dateStr >= debutISO && dateStr <= finISO;
    
    // 🔄 NOUVEAU : Exclure les weekends de l'affichage vert
    if (isInRange && isWeekend(date)) {
      return false; // Pas d'affichage vert sur les weekends
    }
    
    // 🎉 NOUVEAU : Exclure les jours fériés de l'affichage vert
    if (isInRange && isJourFerie(date)) {
      return false; // Pas d'affichage vert sur les jours fériés
    }
    
    return isInRange;
    
    // 🔄 CORRECTION NOUVELLE : Vérifier les dates de l'affaire mise à jour
    if (affaire && affaire.dateCommencement && affaire.dateCloturePrevue) {
      try {
        // Gestion robuste des formats de dates
        let affaireDateDebut, affaireDateFin;
        
        if (typeof affaire.dateCommencement === 'string') {
          affaireDateDebut = affaire.dateCommencement.split('T')[0];
        } else if (affaire.dateCommencement instanceof Date) {
          affaireDateDebut = formatDateLocal(affaire.dateCommencement);
        } else {
          affaireDateDebut = affaire.dateCommencement;
        }
        
        if (typeof affaire.dateCloturePrevue === 'string') {
          affaireDateFin = affaire.dateCloturePrevue.split('T')[0];
        } else if (affaire.dateCloturePrevue instanceof Date) {
          affaireDateFin = formatDateLocal(affaire.dateCloturePrevue);
        } else {
          affaireDateFin = affaire.dateCloturePrevue;
        }
        
        if (affaireDateDebut && affaireDateFin) {
          const isInRange = dateStr >= affaireDateDebut && dateStr <= affaireDateFin;
          return isInRange;
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des dates de l\'affaire:', error);
      }
    }
    
    // 🔄 FALLBACK : Vérifier les dates de l'estimation locale
    if (estimation.dateCommencementEstimee && estimation.dateReceptionEstimee) {
      try {
        // Conversion des dates françaises vers ISO si nécessaire
        let dateDebutISO = estimation.dateCommencementEstimee;
        let dateFinISO = estimation.dateReceptionEstimee;
        
        if (dateDebutISO.includes('/')) {
          const [jour, mois, annee] = dateDebutISO.split('/');
          dateDebutISO = `${annee}-${mois.padStart(2, '0')}-${jour.padStart(2, '0')}`;
        }
        
        if (dateFinISO.includes('/')) {
          const [jour, mois, annee] = dateFinISO.split('/');
          dateFinISO = `${annee}-${mois.padStart(2, '0')}-${jour.padStart(2, '0')}`;
        }
        
        const isInRange = dateStr >= dateDebutISO && dateStr <= dateFinISO;
        return isInRange;
      } catch (error) {
        console.error('Erreur lors de la vérification des dates de l\'estimation:', error);
      }
    }
    
    return false;
  };

  const handleDateClick = (date) => {
    // 🔒 Protection : éviter les clics multiples rapides (debounce)
    const now = Date.now();
    if (now - lastClickTime < 300) return; // 300ms de délai
    setLastClickTime(now);
    
    // Utiliser la date locale pour éviter les problèmes de timezone
    const dateStr = formatDateLocal(date);
    const today = new Date();
    const todayStr = formatDateLocal(today);
    
    // Pas de sélection dans le passé
    if (dateStr < todayStr) return;
    
    // Pas de sélection le weekend
    if (isWeekend(date)) return;
    
    // 🎉 NOUVEAU : Pas de sélection les jours fériés
    if (isJourFerie(date)) return;

    if (selectingStart) {
      // Sélection date de début
      setIsSelecting(true); // 🔒 Activer la protection
      setTempDateDebut(dateStr);
      setTempDateFin('');
      setSelectingStart(false);
    } else {
      // Sélection date de fin
      if (dateStr >= tempDateDebut) {
        
        // 🔄 Propagation immédiate vers le parent
        if (onDateRangeChange) {
          onDateRangeChange(tempDateDebut, dateStr);
        }
        
        // 🔄 CORRECTION : Remettre à zéro les états temporaires après propagation
        setTimeout(() => {
          setTempDateDebut('');
          setTempDateFin('');
          setIsSelecting(false);
          setSelectingStart(true);
        }, 100); // Court délai pour laisser le temps à la propagation
        
      } else {
        // Date de fin antérieure au début, recommencer
        setTempDateDebut(dateStr);
        setTempDateFin('');
        setSelectingStart(false);
      }
    }
  };

  const resetSelection = () => {
    setIsSelecting(false); // 🔒 Désactiver la protection
    setTempDateDebut('');
    setTempDateFin('');
    setSelectingStart(true);
    
    // Notifier le composant parent pour effacer les dates validées
    if (onDateRangeChange) {
      onDateRangeChange({
        dateDebut: '',
        dateFin: ''
      });
    }
  };

  const getDayClass = (date) => {
    const base = "relative w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-200";
    
    // Utiliser la date locale pour éviter les problèmes de timezone
    const today = new Date();
    const todayStr = formatDateLocal(today);
    const dateStr = formatDateLocal(date);
    
    let classes = [base];
    
    // Mois courant
    if (!isDateInCurrentMonth(date)) {
      classes.push("text-gray-300");
    } else {
      classes.push("text-gray-700");
    }
    
    // Passé
    if (dateStr < todayStr) {
      classes.push("text-gray-400 cursor-not-allowed");
    }
    
    // Weekend
    if (isWeekend(date)) {
      classes.push("text-gray-500 cursor-not-allowed bg-gray-50 border border-gray-200");
      // Ajouter un style spécial pour les weekends dans le mois courant
      if (isDateInCurrentMonth(date)) {
        classes.push("relative overflow-hidden");
      }
    }
    
    // 🎉 NOUVEAU : Jours fériés
    if (isJourFerie(date)) {
      classes.push("text-orange-700 cursor-not-allowed bg-orange-50 border border-orange-200 font-semibold");
      if (isDateInCurrentMonth(date)) {
        classes.push("relative overflow-hidden");
      }
    }
    
    // Aujourd'hui
    if (dateStr === todayStr) {
      classes.push("font-bold bg-yellow-100 border-2 border-yellow-400 text-yellow-800 shadow-lg");
    }
    
    // 🔄 CORRECTION : Priorité corrigée pour l'affichage
    // 1. Dates en cours de sélection (bleu) - seulement si pas de dates validées
    if (isDateSelected(date) || isDateInRange(date)) {
      classes.push("bg-blue-500 text-white font-bold");
    }
    // 2. Dates d'estimation validées (vert) - priorité après sélection
    else if (isDateInEstimation(date)) {
      classes.push("bg-green-100 text-green-800 border-2 border-green-400");
      
    }
    
    // Disponible pour sélection
    if (dateStr >= todayStr && !isWeekend(date) && !isJourFerie(date) && isDateInCurrentMonth(date)) {
      classes.push("hover:bg-blue-50 hover:border-blue-200");
    }
    
    // Retirer l'effet hover des weekends
    if (isWeekend(date)) {
      classes.push("hover:bg-gray-50"); // Garder le même fond gris au hover
    }
    
    // 🎉 NOUVEAU : Retirer l'effet hover des jours fériés
    if (isJourFerie(date)) {
      classes.push("hover:bg-orange-50"); // Garder le même fond orange au hover
    }

    return classes.join(" ");
  };



  // Système de couleurs par affaire (consistant) - CORRIGÉ
  const getCouleurAffaire = (affaireNumero) => {
    const couleurs = [
      { bg: '#3b82f6', border: '#2563eb', name: 'Bleu' }, // Bleu
      { bg: '#10b981', border: '#059669', name: 'Vert' }, // Vert
      { bg: '#8b5cf6', border: '#7c3aed', name: 'Violet' }, // Violet
      { bg: '#f59e0b', border: '#d97706', name: 'Orange' }, // Orange
      { bg: '#ef4444', border: '#dc2626', name: 'Rouge' }, // Rouge
      { bg: '#06b6d4', border: '#0891b2', name: 'Cyan' }, // Cyan
      { bg: '#84cc16', border: '#65a30d', name: 'Lime' }, // Lime
      { bg: '#d946ef', border: '#c026d3', name: 'Magenta' }, // Magenta
    ];
    
    // CORRECTION : Utiliser le numéro d'affaire au lieu de l'ID
    // Génère un hash simple basé sur le NUMÉRO de l'affaire pour une couleur consistante
    if (!affaireNumero || affaireNumero === 'N/A') {
      // Si pas de numéro, utiliser une couleur par défaut (gris)
      return { bg: '#6b7280', border: '#4b5563', name: 'Gris' };
    }
    
    let hash = 0;
    for (let i = 0; i < affaireNumero.toString().length; i++) {
      hash = affaireNumero.toString().charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return couleurs[Math.abs(hash) % couleurs.length];
  };

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <>
    <div className={`calendrier-unifie relative space-y-4 ${className}`}>
        {/* En-tête avec navigation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <IconCalendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900 capitalize">
                {monthName}
              </h3>
              <p className="text-sm text-blue-600">
                Navigation du planning
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="default"
              onClick={() => navigateMonth(-1)}
              className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 shadow-md hover:shadow-lg"
              title="Mois précédent (ou utilisez ←)"
            >
              <IconChevronLeft className="w-5 h-5" />
              <span className="hidden md:inline font-medium">Précédent</span>
            </Button>
            
            <Button
              variant="default"
              size="default"
              onClick={goToToday}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              title="Revenir au mois actuel"
            >
              <span className="font-medium">Aujourd'hui</span>
            </Button>
            
            <Button
              variant="outline"
              size="default"
              onClick={() => navigateMonth(1)}
              className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 shadow-md hover:shadow-lg"
              title="Mois suivant (ou utilisez →)"
            >
              <span className="hidden md:inline font-medium">Suivant</span>
              <IconChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Alerte planification obligatoire */}
      {estimation.montantDevis > 0 && (!dateDebut || !dateFin) && (
        <div className="mb-4 bg-orange-50 border border-orange-300 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800 font-medium mb-2">
            <IconAlertTriangle className="w-5 h-5" />
            Planification obligatoire
          </div>
          <div className="text-orange-700 text-sm">
            Pour finaliser votre estimation de <strong>{estimation.montantDevis?.toLocaleString()}€</strong>, vous devez obligatoirement sélectionner les dates dans le calendrier ci-dessous.
          </div>
          <div className="text-orange-600 text-xs mt-1">
            💡 Cette planification permet de synchroniser automatiquement le planning équipe et d'avoir une estimation précise.
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-800">
            <IconClock className="w-4 h-4" />
            <span className="font-medium">
              {selectingStart ? 'Cliquez sur la date de début' : 'Cliquez sur la date de fin'}
            </span>
          </div>
          
          {loading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Chargement...</span>
            </div>
          )}
        </div>
        
        {tempDateDebut && (
          <div className="mt-2 flex items-center gap-2 text-blue-700">
            <span>Début : {new Date(tempDateDebut).toLocaleDateString('fr-FR')}</span>
            {tempDateFin && (
              <span>• Fin : {new Date(tempDateFin).toLocaleDateString('fr-FR')}</span>
            )}
          </div>
        )}
        
        {/* Statut de connexion au planning */}
        <div className="mt-2 space-y-1">
          {affectationsExistantes.length > 0 && !loading && (
            <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-2 py-1 rounded">
              <IconInfoCircle className="w-4 h-4" />
              <span className="text-xs font-medium">
                {affectationsExistantes.length} affectation(s) détectée(s) - 
                {[...new Set(affectationsExistantes.map(d => d.affaireNumero))].length} affaire(s) distincte(s) trouvée(s)
              </span>
              <button
                onClick={() => {
                  const affairesUniques = [...new Set(affectationsExistantes.map(d => d.affaireNumero))];
                  const message = `🎯 AFFAIRES TROUVÉES (${affairesUniques.length} distinctes) :\n\n` +
                    affairesUniques.map((affaire, index) => {
                      const nbAffectations = affectationsExistantes.filter(d => d.affaireNumero === affaire).length;
                      return `${index + 1}. ${affaire} (${nbAffectations} affectations)`;
                    }).join('\n');
                  alert(message);
                }}
                className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 rounded hover:bg-blue-200"
              >
                📋 Détails
              </button>
            </div>
          )}
          
          {loading && (
            <div className="flex items-center gap-2 text-orange-700 bg-orange-50 px-2 py-1 rounded">
              <div className="w-4 h-4 border-2 border-orange-700 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Chargement des affectations...</span>
            </div>
          )}
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Jours du mois */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const dateStr = formatDateLocal(date);
                          const isOccupied = isDateOccupied(date);
              const affectationsExistantesDate = getAffectationsDate(date);
            const inEstimation = isDateInEstimation(date);
            
            return (
              <div
                key={index}
                className={getDayClass(date)}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => handleMouseEnterDate(date)}
                onMouseLeave={handleMouseLeaveDate}
                title={
                  isJourFerie(date)
                    ? getNomJourFerie(date)
                    : isOccupied 
                      ? `${affectationsExistantesDate.length} affectation(s) existante(s)` 
                      : inEstimation 
                        ? 'Date incluse dans l\'estimation'
                        : ''
                }
              >
                {date.getDate()}
                
                {/* Indicateur Jour Férié */}
                {isJourFerie(date) && isDateInCurrentMonth(date) && (
                  <div className="absolute top-0.5 right-0.5 text-[8px] font-bold text-orange-600 bg-orange-100 px-1 rounded">
                    JF
                  </div>
                )}

                
                {/* Indicateurs multiples - un par affaire distincte - CORRIGÉ */}
                {isOccupied && (() => {
                  // CORRECTION : Grouper les affectations par NUMÉRO d'affaire au lieu de l'ID
                  const affectationsParAffaire = affectationsExistantesDate.reduce((acc, affectation) => {
                    const key = affectation.affaireNumero || 'sans-numero';
                    if (!acc[key]) {
                      acc[key] = {
                        affaireId: affectation.affaireId,
                        affaireNumero: affectation.affaireNumero,
                        affectations: []
                      };
                    }
                    acc[key].affectations.push(affectation);
                    return acc;
                  }, {});
                  
                  const affairesDistinctes = Object.values(affectationsParAffaire);
                  const totalAffectations = affectationsExistantesDate.length;
                  
                  // NOUVELLE APPROCHE : Un seul indicateur compact avec le total
                  return (
                    <div 
                      className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md border-2 border-white"
                      style={{
                        zIndex: 30,
                        // Gradient basé sur le nombre d'affaires
                        background: affairesDistinctes.length > 1 
                          ? 'linear-gradient(135deg, #a855f7, #9333ea)' 
                          : getCouleurAffaire(affairesDistinctes[0].affaireNumero).bg
                      }}
                      title={`${totalAffectations} affectation(s) - ${affairesDistinctes.length} affaire(s): ${affairesDistinctes.map(a => a.affaireNumero).join(', ')}`}
                    >
                      {totalAffectations}
                    </div>
                  );
                })()}
                


              </div>
            );
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-100 rounded border-2 border-green-400"></div>
          <span>Estimation actuelle</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center -space-x-1">
            <div className="w-5 h-5 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">3</span>
            </div>
          </div>
          <span>Badge violet = nombre total d'affectations sur ce jour</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded relative flex items-center justify-center">
          </div>
          <span>Weekend (non travaillé)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-orange-50 border border-orange-200 rounded font-semibold flex items-center justify-center text-orange-700 text-[10px]">
            JF
          </div>
          <span>Jour férié (non travaillé)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded shadow-lg"></div>
          <span>Aujourd'hui</span>
        </div>
      </div>
      
    </div>
    
  </>
  );
};

export default CalendrierUnifie; 