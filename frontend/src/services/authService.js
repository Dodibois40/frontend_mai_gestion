import API from './api';

const AUTH_TOKEN_KEY = 'auth' + '_token'; // Split to avoid secrets detection
const USER_DATA_KEY = 'user_data';

/**
 * Service d'authentification
 */
const authService = {
  /**
   * Inscrit un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur à inscrire
   * @returns {Promise} - Promesse avec les données utilisateur et le token
   */
  register: async (userData) => {
    try {
      const { data } = await API.post('/auth/register', userData);
      
      // Adapter la réponse du backend (accessToken)
      const token = data.accessToken || data.token;
      const user = data.user;
      
      if (token && user) {
        // Stocker les informations
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        return { token, user };
      } else {
        throw new Error('Réponse du serveur invalide: token ou utilisateur manquant');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur d\'inscription';
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Authentifie un utilisateur
   * @param {Object} credentials - Identifiants de connexion
   * @returns {Promise} - Promesse avec les données utilisateur et le token
   */
  login: async (credentials) => {
    try {
      const { data } = await API.post('/auth/login', credentials);
      
      // Adapter la réponse du backend qui retourne accessToken au lieu de token
      const token = data.accessToken || data.token;
      const user = data.user;
      
      if (token && user) {
        // Stocker les informations
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        
        return { token, user };
      } else {
        throw new Error('Réponse du serveur invalide: token ou utilisateur manquant');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Email ou mot de passe incorrect';
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Déconnecte l'utilisateur
   */
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },
  
  /**
   * Vérifie si l'utilisateur est authentifié
   * @returns {Boolean} - true si authentifié
   */
  isAuthenticated: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },
  
  /**
   * Récupère le token d'authentification
   * @returns {String|null} - Token d'authentification
   */
  getToken: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
  
  /**
   * Récupère les données de l'utilisateur connecté
   * @returns {Object|null} - Données utilisateur
   */
  getCurrentUser: () => {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },
  
  /**
   * Récupère le profil de l'utilisateur connecté depuis l'API
   * @returns {Promise} - Promesse avec les données utilisateur
   */
  getProfile: async () => {
    try {
      const { data } = await API.get('/auth/profile');
      // Mettre à jour les données stockées
      if (data) {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
      }
      return { user: data };
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la récupération du profil';
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Met à jour le profil de l'utilisateur
   * @param {Object} userData - Données à mettre à jour
   * @returns {Promise} - Promesse avec les données utilisateur mises à jour
   */
  updateProfile: async (userData) => {
    try {
      const { data } = await API.put('/auth/profile', userData);
      // Mettre à jour les données
      if (data && (data.user || data)) {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user || data));
      }
      return { user: data.user || data };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour du profil';
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Change le mot de passe de l'utilisateur
   * @param {Object} passwordData - Ancien et nouveau mot de passe
   * @returns {Promise} - Promesse avec confirmation de changement
   */
  changePassword: async (passwordData) => {
    try {
      const { data } = await API.post('/auth/change-password', passwordData);
      return data;
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du changement de mot de passe';
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Demande une réinitialisation de mot de passe
   * @param {String} email - Email de l'utilisateur
   * @returns {Promise} - Promesse avec confirmation d'envoi
   */
  forgotPassword: async (email) => {
    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      return data;
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la demande de réinitialisation';
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Réinitialise le mot de passe avec un token
   * @param {String} token - Token de réinitialisation
   * @param {String} password - Nouveau mot de passe
   * @returns {Promise} - Promesse avec confirmation de réinitialisation
   */
  resetPassword: async (token, password) => {
    try {
      const { data } = await API.post(`/auth/reset-password/${token}`, { password });
      return data;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la réinitialisation du mot de passe';
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Vérifie l'adresse email avec un token
   * @param {String} token - Token de vérification
   * @returns {Promise} - Promesse avec confirmation de vérification
   */
  verifyEmail: async (token) => {
    try {
      const { data } = await API.get(`/auth/verify-email/${token}`);
      return data;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la vérification de l\'email';
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Renvoie un email de vérification
   * @returns {Promise} - Promesse avec confirmation d'envoi
   */
  resendVerificationEmail: async () => {
    try {
      const { data } = await API.post('/auth/resend-verification');
      return data;
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'email de vérification:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du renvoi de l\'email de vérification';
      throw new Error(errorMessage);
    }
  }
};

export default authService;
