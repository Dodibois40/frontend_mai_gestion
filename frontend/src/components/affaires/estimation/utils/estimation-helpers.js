/**
 * Fichier utilitaire minimal pour le module estimation
 * Contient uniquement les fonctions réellement utilisées
 * Date: 15/07/2025
 */

// ========================================
// Depuis calculEstimation.js
// ========================================

export const formatEuros = (montant) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(montant);
};

// ========================================
// Depuis couleursPastel.js
// ========================================

// Palette de couleurs pastels Apple
const couleursPastel = [
  { pastel: '#E8F5E9', bordure: '#81C784' }, // Vert clair
  { pastel: '#FFF3E0', bordure: '#FFB74D' }, // Orange clair
  { pastel: '#E3F2FD', bordure: '#64B5F6' }, // Bleu clair
  { pastel: '#FCE4EC', bordure: '#F06292' }, // Rose clair
  { pastel: '#F3E5F5', bordure: '#BA68C8' }, // Violet clair
  { pastel: '#E0F2F1', bordure: '#4DB6AC' }, // Turquoise clair
  { pastel: '#FFF8E1', bordure: '#FFD54F' }, // Jaune clair
  { pastel: '#E8EAF6', bordure: '#7986CB' }, // Indigo clair
  { pastel: '#EFEBE9', bordure: '#A1887F' }, // Brun clair
  { pastel: '#FAFAFA', bordure: '#9E9E9E' }, // Gris clair
];

// Store des couleurs assignées
const couleursAssignees = new Map();

export const getCouleurPastelAffaire = (affaireId) => {
  if (couleursAssignees.has(affaireId)) {
    return couleursAssignees.get(affaireId).pastel;
  }
  
  const indexCouleur = couleursAssignees.size % couleursPastel.length;
  const couleur = couleursPastel[indexCouleur];
  couleursAssignees.set(affaireId, couleur);
  
  return couleur.pastel;
};

export const getCouleursAffaire = (affaireId) => {
  if (couleursAssignees.has(affaireId)) {
    return couleursAssignees.get(affaireId);
  }
  
  const indexCouleur = couleursAssignees.size % couleursPastel.length;
  const couleur = couleursPastel[indexCouleur];
  couleursAssignees.set(affaireId, couleur);
  
  return couleur;
};

// ========================================
// Depuis planningSync.js  
// ========================================

// Store global pour les estimations actives
window.planningEstimations = window.planningEstimations || new Map();

export const getEstimationAffaire = (affaireId) => {
  return window.planningEstimations.get(affaireId);
};

export const clearPlanningEstimation = (affaireId) => {
  console.log('🗑️ Suppression planning estimation:', affaireId);
  
  // Supprimer du store
  window.planningEstimations.delete(affaireId);
  
  // Nettoyer le localStorage
  const storageKey = `estimation_planning_${affaireId}`;
  localStorage.removeItem(storageKey);
  
  // Émettre un événement pour notifier les composants
  window.dispatchEvent(new CustomEvent('planningEstimationCleared', {
    detail: { affaireId }
  }));
  
  console.log('✅ Planning estimation nettoyé');
}; 