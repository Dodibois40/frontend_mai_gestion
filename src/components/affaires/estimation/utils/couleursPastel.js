/**
 * ⚠️ WARNING: CE FICHIER CONTIENT BEAUCOUP DE CODE NON UTILISÉ
 * 
 * Date: 15/07/2025
 * Statut: À OPTIMISER
 * 
 * Fonctions UTILISÉES (à conserver) :
 * - getCouleursAffaire() ✅ (dans AffaireEstimation)
 * - getCouleurPastelAffaire() ✅ (dans planningSync)
 * 
 * Fonctions NON UTILISÉES (à supprimer) :
 * - getCouleurBordureAffaire() ❌
 * - resetCouleurAffaire() ❌
 * - getCouleursAssignees() ❌
 * - getAllCouleursPastel() ❌
 * - resetToutesLesCouleurs() ❌
 * - forcerCouleurAffaire() ❌
 * - getCouleurTexteContraste() ❌
 * - getGradientAffaire() ❌
 * - createCouleurPreview() ❌
 * - exportAssignations() ❌
 * - importAssignations() ❌
 * - sauvegarderCouleurs() ❌
 * - chargerCouleurs() ❌
 * 
 * Action: Extraire les 2 fonctions utiles dans un nouveau fichier minimal
 */

// frontend/src/components/affaires/estimation/utils/couleursPastel.js

/**
 * Système de Couleurs Pastel - Affaires
 * Gestion des couleurs pour la coloration du planning
 */

// Palette de couleurs pastel Apple-style
const COULEURS_PASTEL = [
  '#FFF8E1', // Pastel soleil (jaune très clair)
  '#E8F5E8', // Pastel vert olive
  '#F3E5AB', // Pastel terre
  '#E1F5FE', // Pastel bleu
  '#FCE4EC', // Pastel rose
  '#F1F8E9', // Pastel vert clair
  '#FFF3E0', // Pastel orange
  '#F3E5F5', // Pastel violet
  '#E8EAF6', // Pastel indigo
  '#E0F2F1', // Pastel cyan
  '#FFEBEE', // Pastel rouge clair
  '#F9FBE7', // Pastel lime
  '#FFF8E1', // Pastel ambre
  '#EFEBE9', // Pastel brun clair
  '#FAFAFA'  // Pastel gris très clair
];

// Couleurs de bordure correspondantes (plus foncées)
const COULEURS_BORDURE = [
  '#FFC107', // Soleil
  '#8B9B7A', // Vert olive
  '#A67C52', // Terre
  '#2196F3', // Bleu
  '#E91E63', // Rose
  '#4CAF50', // Vert
  '#FF9800', // Orange
  '#9C27B0', // Violet
  '#3F51B5', // Indigo
  '#009688', // Cyan
  '#F44336', // Rouge
  '#8BC34A', // Lime
  '#FF6F00', // Ambre foncé
  '#5D4037', // Brun
  '#757575'  // Gris
];

// Map pour associer affaires → couleurs
const affaireCouleurMap = new Map();
const couleurUtilisees = new Set();

/**
 * Obtenir la couleur pastel d'une affaire
 */
export const getCouleurPastelAffaire = (affaireId) => {
  // Si la couleur est déjà assignée, la retourner
  if (affaireCouleurMap.has(affaireId)) {
    return affaireCouleurMap.get(affaireId);
  }
  
  // Trouver une couleur libre
  let couleurIndex = 0;
  let couleur = COULEURS_PASTEL[0];
  
  // Essayer de trouver une couleur non utilisée
  for (let i = 0; i < COULEURS_PASTEL.length; i++) {
    if (!couleurUtilisees.has(i)) {
      couleurIndex = i;
      couleur = COULEURS_PASTEL[i];
      break;
    }
  }
  
  // Si toutes les couleurs sont utilisées, utiliser un hash de l'ID
  if (couleurUtilisees.size >= COULEURS_PASTEL.length) {
    const hash = hashCode(affaireId);
    couleurIndex = Math.abs(hash) % COULEURS_PASTEL.length;
    couleur = COULEURS_PASTEL[couleurIndex];
  }
  
  // Marquer la couleur comme utilisée
  couleurUtilisees.add(couleurIndex);
  affaireCouleurMap.set(affaireId, couleur);
  
  console.log(`🎨 Couleur assignée à ${affaireId}:`, couleur);
  
  return couleur;
};

/**
 * Obtenir la couleur de bordure correspondante
 */
export const getCouleurBordureAffaire = (affaireId) => {
  const couleurPastel = getCouleurPastelAffaire(affaireId);
  const index = COULEURS_PASTEL.indexOf(couleurPastel);
  return index >= 0 ? COULEURS_BORDURE[index] : '#666666';
};

/**
 * Obtenir les couleurs complètes d'une affaire
 */
export const getCouleursAffaire = (affaireId) => {
  return {
    pastel: getCouleurPastelAffaire(affaireId),
    bordure: getCouleurBordureAffaire(affaireId),
    affaireId
  };
};

/**
 * Libérer la couleur d'une affaire
 */
export const resetCouleurAffaire = (affaireId) => {
  const couleurPastel = affaireCouleurMap.get(affaireId);
  if (couleurPastel) {
    const index = COULEURS_PASTEL.indexOf(couleurPastel);
    if (index >= 0) {
      couleurUtilisees.delete(index);
    }
    affaireCouleurMap.delete(affaireId);
    console.log(`🎨 Couleur libérée pour ${affaireId}:`, couleurPastel);
  }
};

/**
 * Obtenir toutes les couleurs assignées
 */
export const getCouleursAssignees = () => {
  const assignations = [];
  for (const [affaireId, couleur] of affaireCouleurMap.entries()) {
    const index = COULEURS_PASTEL.indexOf(couleur);
    assignations.push({
      affaireId,
      couleurPastel: couleur,
      couleurBordure: index >= 0 ? COULEURS_BORDURE[index] : '#666666',
      index
    });
  }
  return assignations;
};

/**
 * Obtenir la palette complète
 */
export const getAllCouleursPastel = () => {
  return COULEURS_PASTEL.map((pastel, index) => ({
    index,
    pastel,
    bordure: COULEURS_BORDURE[index],
    utilisee: couleurUtilisees.has(index)
  }));
};

/**
 * Réinitialiser toutes les couleurs
 */
export const resetToutesLesCouleurs = () => {
  affaireCouleurMap.clear();
  couleurUtilisees.clear();
  console.log('🎨 Toutes les couleurs réinitialisées');
};

/**
 * Forcer une couleur pour une affaire
 */
export const forcerCouleurAffaire = (affaireId, couleurIndex) => {
  if (couleurIndex >= 0 && couleurIndex < COULEURS_PASTEL.length) {
    // Libérer l'ancienne couleur si elle existe
    resetCouleurAffaire(affaireId);
    
    // Assigner la nouvelle couleur
    const couleur = COULEURS_PASTEL[couleurIndex];
    affaireCouleurMap.set(affaireId, couleur);
    couleurUtilisees.add(couleurIndex);
    
    console.log(`🎨 Couleur forcée pour ${affaireId}:`, couleur);
    return couleur;
  }
  return null;
};

/**
 * Hash simple pour générer un index basé sur l'ID
 */
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

/**
 * Obtenir une couleur contrastante pour le texte
 */
export const getCouleurTexteContraste = (couleurFond) => {
  // Convertir couleur hex en RGB
  const r = parseInt(couleurFond.slice(1, 3), 16);
  const g = parseInt(couleurFond.slice(3, 5), 16);
  const b = parseInt(couleurFond.slice(5, 7), 16);
  
  // Calculer la luminosité
  const luminosite = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retourner noir ou blanc selon la luminosité
  return luminosite > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Générer un dégradé basé sur la couleur de l'affaire
 */
export const getGradientAffaire = (affaireId) => {
  const couleurPastel = getCouleurPastelAffaire(affaireId);
  const couleurBordure = getCouleurBordureAffaire(affaireId);
  
  return `linear-gradient(135deg, ${couleurPastel} 0%, ${couleurBordure}20 100%)`;
};

/**
 * Créer un aperçu des couleurs pour l'interface
 */
export const createCouleurPreview = (affaireId, size = 'md') => {
  const couleurs = getCouleursAffaire(affaireId);
  const sizes = {
    sm: '16px',
    md: '24px',
    lg: '32px'
  };
  
  return {
    style: {
      width: sizes[size],
      height: sizes[size],
      backgroundColor: couleurs.pastel,
      border: `2px solid ${couleurs.bordure}`,
      borderRadius: '50%',
      display: 'inline-block',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    className: 'couleur-preview',
    title: `Affaire ${affaireId} - ${couleurs.pastel}`
  };
};

/**
 * Exporter les assignations (pour sauvegarde)
 */
export const exportAssignations = () => {
  const assignations = {};
  for (const [affaireId, couleur] of affaireCouleurMap.entries()) {
    const index = COULEURS_PASTEL.indexOf(couleur);
    assignations[affaireId] = {
      couleur,
      index,
      timestamp: Date.now()
    };
  }
  return assignations;
};

/**
 * Importer les assignations (pour restauration)
 */
export const importAssignations = (assignations) => {
  resetToutesLesCouleurs();
  
  for (const [affaireId, data] of Object.entries(assignations)) {
    if (data.index >= 0 && data.index < COULEURS_PASTEL.length) {
      affaireCouleurMap.set(affaireId, data.couleur);
      couleurUtilisees.add(data.index);
    }
  }
  

};

// Auto-sauvegarde dans localStorage
const STORAGE_KEY = 'mai-gestion-couleurs-affaires';

export const sauvegarderCouleurs = () => {
  try {
    const assignations = exportAssignations();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignations));
  } catch (error) {
    console.warn('⚠️ Impossible de sauvegarder les couleurs:', error);
  }
};

export const chargerCouleurs = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const assignations = JSON.parse(stored);
      importAssignations(assignations);
  
    }
  } catch (error) {
    console.warn('⚠️ Impossible de charger les couleurs:', error);
  }
};

// Auto-chargement au démarrage
if (typeof window !== 'undefined') {
  chargerCouleurs();
  
  // Sauvegarde automatique lors des changements
  const originalSetCouleur = affaireCouleurMap.set.bind(affaireCouleurMap);
  affaireCouleurMap.set = function(key, value) {
    const result = originalSetCouleur(key, value);
    sauvegarderCouleurs();
    return result;
  };
} 