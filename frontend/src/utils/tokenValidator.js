/**
 * Utilitaire pour valider et nettoyer les tokens JWT
 */

/**
 * Vérifie si un token JWT est valide structurellement
 * @param {string} token - Le token JWT à vérifier
 * @returns {Object} - Résultat de la validation
 */
export function validateTokenStructure(token) {
  if (!token || typeof token !== 'string') {
    return { isValid: false, reason: 'Token manquant ou invalide' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { isValid: false, reason: 'Structure JWT invalide' };
  }

  try {
    // Décoder le payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Vérifier les champs obligatoires
    if (!payload.sub || !payload.email || !payload.exp) {
      return { isValid: false, reason: 'Payload JWT incomplet' };
    }

    // Vérifier l'expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { isValid: false, reason: 'Token expiré', expired: true };
    }

    return { 
      isValid: true, 
      payload,
      expiresIn: payload.exp - now 
    };
  } catch (error) {
    return { isValid: false, reason: 'Erreur de décodage JWT' };
  }
}

/**
 * Nettoie automatiquement les tokens invalides du localStorage
 */
export function cleanupInvalidTokens() {
  const token = localStorage.getItem('auth' + '_token');
  const userData = localStorage.getItem('user_data');
  
  if (token) {
    const validation = validateTokenStructure(token);
    if (!validation.isValid) {
      console.warn('🧹 Token invalide détecté, nettoyage automatique:', validation.reason);
      localStorage.removeItem('auth' + '_token');
      localStorage.removeItem('user_data');
      return { cleaned: true, reason: validation.reason };
    }
    
    // Avertir si le token expire bientôt (moins de 1 heure)
    if (validation.expiresIn < 3600) {
      console.warn('⚠️ Token expirera bientôt:', {
        expiresIn: validation.expiresIn,
        expiresAt: new Date(validation.payload.exp * 1000).toLocaleString()
      });
    }
  }
  
  // Vérifier la cohérence entre token et userData
  if (token && !userData) {
    console.warn('🧹 Données utilisateur manquantes, nettoyage du token');
    localStorage.removeItem('auth' + '_token');
    return { cleaned: true, reason: 'Données utilisateur incohérentes' };
  }
  
  if (!token && userData) {
    console.warn('🧹 Token manquant, nettoyage des données utilisateur');
    localStorage.removeItem('user_data');
    return { cleaned: true, reason: 'Token manquant' };
  }
  
  return { cleaned: false };
}

/**
 * Vérifie périodiquement la validité du token
 * @param {Function} onInvalidToken - Callback appelé si le token devient invalide
 */
export function startTokenValidationWatcher(onInvalidToken = null) {
  const checkInterval = 60000; // Vérifier toutes les minutes
  
  const checkToken = () => {
    const result = cleanupInvalidTokens();
    if (result.cleaned && onInvalidToken) {
      onInvalidToken(result.reason);
    }
  };
  
  // Vérification initiale
  checkToken();
  
  // Vérification périodique
  const intervalId = setInterval(checkToken, checkInterval);
  
  // Retourner une fonction pour arrêter la surveillance
  return () => clearInterval(intervalId);
}

/**
 * Extrait les informations utilisateur du token
 * @param {string} token - Le token JWT
 * @returns {Object|null} - Les informations utilisateur ou null si invalide
 */
export function extractUserFromToken(token) {
  const validation = validateTokenStructure(token);
  if (!validation.isValid) {
    return null;
  }
  
  return {
    id: validation.payload.sub,
    email: validation.payload.email,
    nom: validation.payload.nom,
    prenom: validation.payload.prenom,
    role: validation.payload.role,
    expiresAt: new Date(validation.payload.exp * 1000)
  };
}

/**
 * Vérifie si l'utilisateur actuel existe encore côté serveur
 * @returns {Promise<boolean>} - true si l'utilisateur existe et est valide
 */
export async function validateUserExists() {
  const token = localStorage.getItem('auth' + '_token');
  if (!token) return false;
  
  try {
    const response = await fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      // L'utilisateur n'existe plus ou le token est invalide
      cleanupInvalidTokens();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la validation utilisateur:', error);
    return false;
  }
} 