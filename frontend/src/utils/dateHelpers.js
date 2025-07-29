// Utilitaires pour la gestion des dates de livraison

/**
 * Vérifie si une date est aujourd'hui
 */
export const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  const compareDate = new Date(date);
  return compareDate.toDateString() === today.toDateString();
};

/**
 * Vérifie si une date est dans le futur proche (dans les 3 prochains jours)
 */
export const isUpcoming = (date) => {
  if (!date) return false;
  const today = new Date();
  const compareDate = new Date(date);
  const diffTime = compareDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 3;
};

/**
 * Vérifie si une date est en retard (dans le passé)
 */
export const isOverdue = (date) => {
  if (!date) return false;
  const today = new Date();
  const compareDate = new Date(date);
  return compareDate < today;
};

/**
 * Retourne le style CSS approprié pour une date de livraison
 */
export const getDeliveryDateStyle = (date) => {
  if (isToday(date)) {
    return {
      badge: 'bg-orange-100 text-orange-800 border-orange-300',
      text: '📍 AUJOURD\'HUI',
      priority: 'high'
    };
  }
  
  if (isUpcoming(date)) {
    return {
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      text: '⏰ BIENTÔT',
      priority: 'medium'
    };
  }
  
  if (isOverdue(date)) {
    return {
      badge: 'bg-red-100 text-red-800 border-red-300',
      text: '⚠️ EN RETARD',
      priority: 'urgent'
    };
  }
  
  return {
    badge: 'bg-gray-100 text-gray-800 border-gray-300',
    text: '📅 PROGRAMMÉ',
    priority: 'normal'
  };
};

/**
 * Formate une date pour l'affichage
 */
export const formatDisplayDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}; 