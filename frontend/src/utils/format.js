/**
 * Fonctions utilitaires de formatage
 */

/**
 * Formater un montant en euros
 * @param {number} montant - Le montant à formater
 * @returns {string} Le montant formaté en euros
 */
export const formatEuros = (montant) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(montant || 0);
};

/**
 * Formater un pourcentage
 * @param {number} value - La valeur à formater en pourcentage
 * @returns {string} Le pourcentage formaté
 */
export const formatPercentage = (value) => {
  const rounded = Math.round(value * 10) / 10;
  return rounded % 1 === 0 ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}; 