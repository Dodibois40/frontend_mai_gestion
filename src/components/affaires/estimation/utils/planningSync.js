/**
 * ⚠️ WARNING: CE FICHIER CONTIENT BEAUCOUP DE CODE NON UTILISÉ
 * 
 * Date: 15/07/2025
 * Statut: À OPTIMISER
 * 
 * Fonctions UTILISÉES (à conserver) :
 * - getEstimationAffaire() ✅
 * - clearPlanningEstimation() ✅
 * 
 * Fonctions NON UTILISÉES (à supprimer) :
 * - syncWithPlanning() ❌
 * - getEstimationsActives() ❌
 * - isCaseEstimation() ❌
 * - getCouleurCase() ❌
 * - initPlanningListeners() ❌
 * - usePlanningEstimations() ❌
 * 
 * Action: Extraire les 2 fonctions utiles dans un nouveau fichier minimal
 */

// frontend/src/components/affaires/estimation/utils/planningSync.js

import { getCouleurPastelAffaire } from './couleursPastel';
import { calculerJoursOuvres } from './calculEstimation';

/**
 * Système de Synchronisation Planning - Coloration Cases
 * Synchronise l'estimation avec le planning équipe pour colorer les cases
 */

// Store global pour les estimations actives
window.planningEstimations = window.planningEstimations || new Map();

/**
 * Synchroniser l'estimation avec le planning
 */
export const syncWithPlanning = async (estimationData) => {
  try {
    console.log('🎨 Synchronisation planning démarrée:', estimationData);
    
    // Calculer les cases de planning à colorer
    const planningCells = calculerJoursOuvres(
      estimationData.dateDebut,
      estimationData.totalDemiJournees
    );
    
    // Obtenir la couleur pastel pour cette affaire
    const couleurPastel = getCouleurPastelAffaire(estimationData.affaireId);
    
    // Préparer les données de synchronisation
    const syncData = {
      affaireId: estimationData.affaireId,
      couleurPastel,
      dateDebut: estimationData.dateDebut,
      dateFin: estimationData.dateFin,
      totalDemiJournees: estimationData.totalDemiJournees,
      cells: planningCells.map(cell => ({
        ...cell,
        couleurPastel,
        affaireId: estimationData.affaireId
      })),
      timestamp: Date.now()
    };
    
    // Sauvegarder dans le store global
    window.planningEstimations.set(estimationData.affaireId, syncData);
    
    // Déclencher la mise à jour du planning si le composant est présent
    await updatePlanningComponent(syncData);
    
    console.log('✅ Planning synchronisé:', {
      affaire: estimationData.affaireId,
      cases: planningCells.length,
      couleur: couleurPastel
    });
    
    return syncData;
    
  } catch (error) {
    console.error('❌ Erreur synchronisation planning:', error);
    throw error;
  }
};

/**
 * Mettre à jour le composant planning
 */
const updatePlanningComponent = async (syncData) => {
  // Méthode 1: Event personnalisé
  const planningComponent = document.querySelector('[data-component="planning-equipe"]');
  if (planningComponent) {
    const event = new CustomEvent('estimationUpdated', { 
      detail: syncData 
    });
    planningComponent.dispatchEvent(event);
  }
  
  // Méthode 2: Store Redux si disponible
  if (window.store && window.store.dispatch) {
    window.store.dispatch({
      type: 'PLANNING_ESTIMATION_UPDATED',
      payload: syncData
    });
  }
  
  // Méthode 3: Callback global si défini
  if (window.onPlanningEstimationUpdate) {
    window.onPlanningEstimationUpdate(syncData);
  }
  
  // Méthode 4: Force re-render planning
  const planningElements = document.querySelectorAll('.time-slot-zone, .planning-cell');
  planningElements.forEach(element => {
    updateCellStyle(element, syncData);
  });
};

/**
 * Mettre à jour le style d'une case
 */
const updateCellStyle = (element, syncData) => {
  const cellDate = element.dataset.date;
  const cellCreneau = element.dataset.creneau;
  
  if (!cellDate || !cellCreneau) return;
  
  // Vérifier si cette case fait partie de l'estimation
  const isEstimationCell = syncData.cells.some(cell => 
    cell.date === cellDate && cell.creneau === cellCreneau
  );
  
  if (isEstimationCell) {
    // Appliquer le style d'estimation
    element.style.backgroundColor = syncData.couleurPastel;
    element.style.border = `2px solid ${darkenColor(syncData.couleurPastel, 20)}`;
    element.style.position = 'relative';
    
    // Ajouter un indicateur visuel
    if (!element.querySelector('.estimation-indicator')) {
      const indicator = document.createElement('div');
      indicator.className = 'estimation-indicator';
      indicator.innerHTML = '📊';
      indicator.style.cssText = `
        position: absolute;
        top: 2px;
        right: 2px;
        font-size: 10px;
        opacity: 0.7;
      `;
      element.appendChild(indicator);
    }
  }
};

/**
 * Assombrir une couleur hexadécimale
 */
const darkenColor = (color, percent) => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

/**
 * Effacer l'estimation d'une affaire du planning
 */
export const clearPlanningEstimation = (affaireId) => {
  try {
    // Retirer du store
    window.planningEstimations.delete(affaireId);
    
    // Event de nettoyage
    const planningComponent = document.querySelector('[data-component="planning-equipe"]');
    if (planningComponent) {
      const event = new CustomEvent('estimationCleared', { 
        detail: { affaireId } 
      });
      planningComponent.dispatchEvent(event);
    }
    
    // Nettoyer les styles des cases
    const planningElements = document.querySelectorAll('.time-slot-zone, .planning-cell');
    planningElements.forEach(element => {
      const indicators = element.querySelectorAll('.estimation-indicator');
      indicators.forEach(indicator => indicator.remove());
      
      // Reset styles si cette case appartenait à l'affaire
      if (element.dataset.affaireEstimation === affaireId) {
        element.style.backgroundColor = '';
        element.style.border = '';
        delete element.dataset.affaireEstimation;
      }
    });
    
    console.log('🧹 Estimation nettoyée du planning:', affaireId);
    
  } catch (error) {
    console.error('❌ Erreur nettoyage planning:', error);
  }
};

/**
 * Récupérer toutes les estimations actives
 */
export const getEstimationsActives = () => {
  return Array.from(window.planningEstimations.values());
};

/**
 * Récupérer l'estimation d'une affaire
 */
export const getEstimationAffaire = (affaireId) => {
  return window.planningEstimations.get(affaireId);
};

/**
 * Vérifier si une case fait partie d'une estimation
 */
export const isCaseEstimation = (date, creneau) => {
  const estimations = getEstimationsActives();
  
  return estimations.some(estimation => 
    estimation.cells.some(cell => 
      cell.date === date && cell.creneau === creneau
    )
  );
};

/**
 * Récupérer la couleur d'une case
 */
export const getCouleurCase = (date, creneau) => {
  const estimations = getEstimationsActives();
  
  for (const estimation of estimations) {
    const cell = estimation.cells.find(cell => 
      cell.date === date && cell.creneau === creneau
    );
    if (cell) {
      return cell.couleurPastel;
    }
  }
  
  return null;
};

/**
 * Initialiser les listeners pour le planning
 */
export const initPlanningListeners = () => {
  // Listener pour les mises à jour d'estimation
  document.addEventListener('estimationUpdated', (event) => {
    console.log('🔄 Estimation mise à jour:', event.detail);
    // Le planning peut réagir à cette event
  });
  
  // Listener pour les nettoyages
  document.addEventListener('estimationCleared', (event) => {
    console.log('🧹 Estimation supprimée:', event.detail);
    // Le planning peut réagir à cette event
  });
  

};

/**
 * Hook pour le planning (à utiliser dans le composant PlanningEquipe)
 */
export const usePlanningEstimations = () => {
  const estimations = getEstimationsActives();
  
  const getCellProps = (date, creneau) => {
    const couleur = getCouleurCase(date, creneau);
    const isEstimation = isCaseEstimation(date, creneau);
    
    return {
      style: {
        backgroundColor: couleur || 'transparent',
        border: couleur ? `2px solid ${darkenColor(couleur, 20)}` : '1px solid #e5e7eb',
        position: 'relative'
      },
      'data-estimation': isEstimation,
      'data-couleur': couleur,
      className: isEstimation ? 'planning-cell-estimation' : 'planning-cell-normal'
    };
  };
  
  return {
    estimations,
    getCellProps,
    isCaseEstimation,
    getCouleurCase
  };
};

// Auto-initialisation
if (typeof window !== 'undefined') {
  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlanningListeners);
  } else {
    initPlanningListeners();
  }
} 