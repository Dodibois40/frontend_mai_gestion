/**
 * Utilitaires partagés pour le module Affaires
 * Centralise les fonctions communes pour éviter la duplication de code
 */

// Formatage des montants en euros
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

// Formatage des dates en français
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Formatage des dates avec heure
export const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Configuration des statuts d'affaires
export const getStatusConfig = (statut) => {
  const statusMapping = {
    'NOUVELLE': { 
      label: 'Nouvelle', 
      color: 'bg-blue-100 text-blue-800', 
      icon: 'IconPlus',
      severity: 'info'
    },
    'PLANIFIEE': { 
      label: 'Planifiée', 
      color: 'bg-purple-100 text-purple-800', 
      icon: 'IconCalendarEvent',
      severity: 'info'
    },
    'EN_COURS': { 
      label: 'En cours', 
      color: 'bg-orange-100 text-orange-800', 
      icon: 'IconClock',
      severity: 'warning'
    },
    'TERMINEE': { 
      label: 'Terminée', 
      color: 'bg-green-100 text-green-800', 
      icon: 'IconCheck',
      severity: 'success'
    },
    'CLOTUREE': { 
      label: 'Clôturée', 
      color: 'bg-slate-100 text-slate-800', 
      icon: 'IconCheck',
      severity: 'success'
    },
    'SUSPENDUE': { 
      label: 'Suspendue', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: 'IconAlertTriangle',
      severity: 'warning'
    },
    'ANNULEE': { 
      label: 'Annulée', 
      color: 'bg-red-100 text-red-800', 
      icon: 'IconX',
      severity: 'error'
    }
  };

  return statusMapping[statut] || statusMapping['NOUVELLE'];
};

// Calcul des métriques financières
export const calculateFinancialMetrics = (affaire, devis = [], achats = []) => {
  const caReel = devis
    .filter(d => d.statut === 'VALIDE')
    .reduce((sum, d) => sum + (d.montantHt || 0), 0);

  const achatsReels = achats
    .filter(a => a.statut === 'VALIDE')
    .reduce((sum, a) => sum + (a.montantHt || 0), 0);

  const objectifCA = affaire?.objectifCaHt || 0;
  const objectifAchats = affaire?.objectifAchatHt || 0;

  const margeReelle = caReel - achatsReels;
  const margeObjectif = objectifCA - objectifAchats;

  const tauxMargeReel = caReel > 0 ? (margeReelle / caReel) * 100 : 0;
  const tauxMargeObjectif = objectifCA > 0 ? (margeObjectif / objectifCA) * 100 : 0;

  const avancementCA = objectifCA > 0 ? (caReel / objectifCA) * 100 : 0;
  const avancementAchats = objectifAchats > 0 ? (achatsReels / objectifAchats) * 100 : 0;

  return {
    caReel,
    achatsReels,
    objectifCA,
    objectifAchats,
    margeReelle,
    margeObjectif,
    tauxMargeReel,
    tauxMargeObjectif,
    avancementCA,
    avancementAchats
  };
};

// Formatage des heures
export const formatHours = (hours) => {
  if (!hours) return '0h';
  return `${hours.toFixed(1)}h`;
};

// Formatage des pourcentages
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(1)}%`;
};

// Calcul du pourcentage d'avancement
export const calculateProgress = (current, target) => {
  if (!target || target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

// Détermination de la couleur selon l'avancement
export const getProgressColor = (percentage) => {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 70) return 'text-orange-600';
  if (percentage >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

// Validation des données d'affaire (simplifiée)
export const validateAffaire = (affaire) => {
  const errors = {};

  if (!affaire.libelle?.trim()) {
    errors.libelle = 'Le libellé est requis';
  }

  if (!affaire.client?.trim()) {
    errors.client = 'Le nom du client est requis';
  }

  // Plus de validation pour objectifCaHt, dates et statut
  // Ces champs seront définis dans le module d'estimation intelligente

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Génération du numéro d'affaire automatique
export const generateAffaireNumber = (year = new Date().getFullYear()) => {
  return `AFF-${year}-${String(Date.now()).slice(-6)}`;
};

// Tri des affaires selon différents critères
export const sortAffaires = (affaires, sortBy = 'createdAt', sortOrder = 'desc') => {
  return [...affaires].sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case 'numero':
        valueA = a.numero || '';
        valueB = b.numero || '';
        break;
      case 'client':
        valueA = a.client || '';
        valueB = b.client || '';
        break;
      case 'objectifCaHt':
        valueA = a.objectifCaHt || 0;
        valueB = b.objectifCaHt || 0;
        break;
      case 'dateCommencement':
        valueA = new Date(a.dateCommencement || 0);
        valueB = new Date(b.dateCommencement || 0);
        break;
      case 'createdAt':
      default:
        valueA = new Date(a.createdAt || 0);
        valueB = new Date(b.createdAt || 0);
        break;
    }

    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
};

// Filtrage des affaires
export const filterAffaires = (affaires, filters = {}) => {
  return affaires.filter(affaire => {
    // Filtre par statut
    if (filters.statut && filters.statut !== 'all' && affaire.statut !== filters.statut) {
      return false;
    }

    // Filtre par recherche textuelle
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchFields = [
        affaire.numero,
        affaire.libelle,
        affaire.client,
        affaire.adresse
      ].join(' ').toLowerCase();
      
      if (!searchFields.includes(searchTerm)) {
        return false;
      }
    }

    // Filtre par période
    if (filters.dateDebut) {
      const dateDebut = new Date(filters.dateDebut);
      const affaireDateCommencement = new Date(affaire.dateCommencement || 0);
      if (affaireDateCommencement < dateDebut) {
        return false;
      }
    }

    if (filters.dateFin) {
      const dateFin = new Date(filters.dateFin);
      const affaireDateCloture = new Date(affaire.dateCloturePrevue || Date.now());
      if (affaireDateCloture > dateFin) {
        return false;
      }
    }

    return true;
  });
}; 