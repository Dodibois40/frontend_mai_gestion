import API from './api';

const twoFactorService = {
  /**
   * Récupère le statut de la 2FA pour l'utilisateur connecté
   */
  getStatus: async () => {
    try {
      const { data } = await API.get('/auth/2fa/status');
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du statut 2FA:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du statut 2FA');
    }
  },

  /**
   * Configure la 2FA - génère le QR code et les codes de récupération
   */
  setup: async (email) => {
    try {
      const { data } = await API.post('/auth/2fa/setup', { email });
      return data;
    } catch (error) {
      console.error('Erreur lors de la configuration 2FA:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la configuration 2FA');
    }
  },

  /**
   * Vérifie le code TOTP et active la 2FA
   */
  verifyAndEnable: async (token) => {
    try {
      const { data } = await API.post('/auth/2fa/verify', { token });
      return data;
    } catch (error) {
      console.error('Erreur lors de la vérification 2FA:', error);
      throw new Error(error.response?.data?.message || 'Code de vérification invalide');
    }
  },

  /**
   * Vérifie le code 2FA lors de la connexion
   */
  verifyLogin: async (token) => {
    try {
      const { data } = await API.post('/auth/2fa/verify-login', { token });
      return data;
    } catch (error) {
      console.error('Erreur lors de la vérification 2FA de connexion:', error);
      throw new Error(error.response?.data?.message || 'Code de vérification invalide');
    }
  },

  /**
   * Désactive la 2FA
   */
  disable: async () => {
    try {
      const { data } = await API.delete('/auth/2fa/disable');
      return data;
    } catch (error) {
      console.error('Erreur lors de la désactivation 2FA:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la désactivation 2FA');
    }
  },

  /**
   * Génère de nouveaux codes de récupération
   */
  regenerateBackupCodes: async () => {
    try {
      const { data } = await API.post('/auth/2fa/regenerate-backup-codes');
      return data;
    } catch (error) {
      console.error('Erreur lors de la génération des codes de récupération:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la génération des codes de récupération');
    }
  }
};

export default twoFactorService; 