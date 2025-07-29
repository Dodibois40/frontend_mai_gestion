/**
 * Utilitaires pour la génération de liens Google Maps
 */

/**
 * Génère un lien Google Maps à partir des données d'adresse
 * @param {Object} addressData - Données d'adresse
 * @param {string} addressData.adresse - Adresse complète
 * @param {string} addressData.rue - Rue
 * @param {string} addressData.codePostal - Code postal
 * @param {string} addressData.ville - Ville
 * @param {string} addressData.pays - Pays
 * @param {number} addressData.latitude - Latitude GPS
 * @param {number} addressData.longitude - Longitude GPS
 * @returns {string} URL Google Maps
 */
export const generateGoogleMapsLink = (addressData) => {
  if (!addressData) return null;

  // Si on a les coordonnées GPS, les utiliser en priorité
  if (addressData.latitude && addressData.longitude) {
    return `https://www.google.com/maps?q=${addressData.latitude},${addressData.longitude}`;
  }

  // Sinon, construire l'adresse à partir des champs disponibles
  let address = '';
  
  if (addressData.adresse) {
    // Utiliser l'adresse complète si elle existe
    address = addressData.adresse;
  } else {
    // Construire l'adresse à partir des champs séparés
    const parts = [];
    if (addressData.rue) parts.push(addressData.rue);
    if (addressData.codePostal && addressData.ville) {
      parts.push(`${addressData.codePostal} ${addressData.ville}`);
    } else {
      if (addressData.codePostal) parts.push(addressData.codePostal);
      if (addressData.ville) parts.push(addressData.ville);
    }
    if (addressData.pays && addressData.pays !== 'France') {
      parts.push(addressData.pays);
    }
    address = parts.join(', ');
  }

  if (!address) return null;

  // Encoder l'adresse pour l'URL
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
};

/**
 * Génère un lien Google Maps pour les directions depuis la position actuelle
 * @param {Object} addressData - Données d'adresse de destination
 * @returns {string} URL Google Maps pour directions
 */
export const generateGoogleMapsDirectionsLink = (addressData) => {
  if (!addressData) return null;

  if (addressData.latitude && addressData.longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${addressData.latitude},${addressData.longitude}`;
  }

  const link = generateGoogleMapsLink(addressData);
  if (!link) return null;

  // Extraire l'adresse du lien de recherche et créer un lien de directions
  const addressMatch = link.match(/query=(.+)$/);
  if (addressMatch) {
    return `https://www.google.com/maps/dir/?api=1&destination=${addressMatch[1]}`;
  }

  return null;
};

/**
 * Formate une adresse pour l'affichage
 * @param {Object} addressData - Données d'adresse
 * @returns {string} Adresse formatée
 */
export const formatAddress = (addressData) => {
  if (!addressData) return '';

  if (addressData.adresse) {
    return addressData.adresse;
  }

  const parts = [];
  if (addressData.rue) parts.push(addressData.rue);
  if (addressData.codePostal && addressData.ville) {
    parts.push(`${addressData.codePostal} ${addressData.ville}`);
  } else {
    if (addressData.codePostal) parts.push(addressData.codePostal);
    if (addressData.ville) parts.push(addressData.ville);
  }
  if (addressData.pays && addressData.pays !== 'France') {
    parts.push(addressData.pays);
  }

  return parts.join(', ');
};

/**
 * Vérifie si une adresse est complète pour générer un lien Google Maps
 * @param {Object} addressData - Données d'adresse
 * @returns {boolean} True si l'adresse peut être utilisée pour Google Maps
 */
export const isAddressValid = (addressData) => {
  if (!addressData) return false;

  // Si on a les coordonnées GPS
  if (addressData.latitude && addressData.longitude) {
    return true;
  }

  // Si on a une adresse complète
  if (addressData.adresse && addressData.adresse.trim()) {
    return true;
  }

  // Si on a au minimum une ville
  if (addressData.ville && addressData.ville.trim()) {
    return true;
  }

  return false;
}; 