import API from './api';

/**
 * Service pour les fonctionnalités de sécurité avancées
 */
const securityService = {
  
  /**
   * Changer le mot de passe avec validation avancée
   */
  changePassword: async (passwordData) => {
    try {
      const { data } = await API.post('/auth/change-password', passwordData);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  },

  /**
   * Valider la force d'un mot de passe
   */
  validatePassword: async (password) => {
    try {
      const { data } = await API.post('/auth/validate-password', { password });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la validation du mot de passe');
    }
  },

  /**
   * Récupérer l'historique des connexions
   */
  getLoginHistory: async (page = 1, limit = 20) => {
    try {
      const { data } = await API.get('/auth/login-history', {
        params: { page, limit }
      });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'historique');
    }
  },

  /**
   * Récupérer les sessions actives
   */
  getActiveSessions: async () => {
    try {
      const { data } = await API.get('/auth/active-sessions');
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des sessions');
    }
  },

  /**
   * Termine une session spécifique par son ID
   */
  terminateSession: async (sessionId) => {
    try {
      const { data } = await API.post(`/auth/terminate-session/${sessionId}`);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la déconnexion de la session');
    }
  },

  /**
   * Déconnecter toutes les autres sessions
   */
  logoutAllSessions: async () => {
    try {
      const { data } = await API.post('/auth/logout-all');
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la déconnexion des sessions');
    }
  },

  /**
   * Récupérer les paramètres de sécurité globaux
   */
  getSecuritySettings: async () => {
    try {
      const { data } = await API.get('/auth/security-settings');
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des paramètres de sécurité');
    }
  },

  /**
   * Obtenir des informations sur l'appareil/navigateur actuel
   */
  getDeviceInfo: () => {
    const parser = new UAParser();
    const result = parser.getResult();
    
    return {
      browser: `${result.browser.name} ${result.browser.version}`,
      os: `${result.os.name} ${result.os.version}`,
      device: result.device.type || 'Desktop',
      userAgent: navigator.userAgent
    };
  },

  /**
   * Obtenir l'adresse IP (approximative) via une API externe
   */
  getClientIP: async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'Non disponible';
    }
  },

  /**
   * Calculer la force d'un mot de passe côté client
   */
  calculatePasswordStrength: (password) => {
    let score = 0;
    let feedback = [];

    if (!password) {
      return { score: 0, strength: 'Très faible', feedback: ['Mot de passe requis'] };
    }

    // Longueur
    if (password.length >= 8) score += 1;
    else feedback.push('Au moins 8 caractères');

    if (password.length >= 12) score += 1;

    // Majuscules
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Au moins une majuscule');

    // Minuscules
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Au moins une minuscule');

    // Chiffres
    if (/\d/.test(password)) score += 1;
    else feedback.push('Au moins un chiffre');

    // Caractères spéciaux
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else feedback.push('Au moins un caractère spécial');

    // Déterminer la force
    let strength = 'Très faible';
    if (score >= 5) strength = 'Très forte';
    else if (score >= 4) strength = 'Forte';
    else if (score >= 3) strength = 'Moyenne';
    else if (score >= 2) strength = 'Faible';

    return { score, strength, feedback };
  },

  /**
   * Formater la date de dernière connexion
   */
  formatLastLogin: (date) => {
    if (!date) return 'Jamais';
    
    const now = new Date();
    const loginDate = new Date(date);
    const diffInMinutes = Math.floor((now - loginDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    
    return loginDate.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

export default securityService; 