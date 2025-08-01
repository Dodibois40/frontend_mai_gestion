import axios from 'axios';
import { toast } from 'sonner';

// URL de base AVEC préfixe API car le backend utilise un préfixe global
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur requêtes
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur réponses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs d'authentification et d'autorisation
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('🚫 Erreur d\'authentification détectée:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url
      });
      
      // Nettoyer le localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Rediriger vers la page de connexion si pas déjà sur une page d'auth
      if (!window.location.pathname.includes('/auth/')) {
        console.log('🔄 Redirection vers la page de connexion...');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Fonctions de cache (pour compatibilité)
export const clearCache = () => {
  console.log('Cache cleared');
};

export const clearCacheForUrl = (url) => {
  console.log('Cache cleared for URL:', url);
};

export default API;
