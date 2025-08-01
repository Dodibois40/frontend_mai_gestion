// Utilitaire de debug pour identifier les problèmes
import BrowserCompat from './browserCompat.js';

export const DebugHelper = {
  // Log détaillé des erreurs
  logError(context, error, additionalData = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      browser: BrowserCompat.getBrowserInfo(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      },
      additionalData,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    console.group(`🐛 Erreur Debug - ${context}`);
    console.error('Détails de l\'erreur:', errorInfo);
    console.groupEnd();

    // Stocker l'erreur pour analyse
    this.storeError(errorInfo);

    return errorInfo;
  },

  // Stocker les erreurs pour analyse
  storeError(errorInfo) {
    try {
      const errors = JSON.parse(localStorage.getItem('debug_errors') || '[]');
      errors.push(errorInfo);
      
      // Garder seulement les 50 dernières erreurs
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('debug_errors', JSON.stringify(errors));
    } catch (e) {
      console.warn('Impossible de stocker l\'erreur:', e);
    }
  },

  // Récupérer les erreurs stockées
  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('debug_errors') || '[]');
    } catch (e) {
      return [];
    }
  },

  // Nettoyer les erreurs stockées
  clearStoredErrors() {
    localStorage.removeItem('debug_errors');
  },

  // Test de connectivité API
  async testApiConnectivity() {
    const tests = [];

    // Test 1: Health check
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        credentials: 'include',
      });
      tests.push({
        name: 'Health Check',
        status: response.ok ? 'success' : 'error',
        details: `${response.status} ${response.statusText}`,
      });
    } catch (error) {
      tests.push({
        name: 'Health Check',
        status: 'error',
        details: error.message,
      });
    }

    // Test 2: CORS preflight
    try {
      const response = await fetch('/api/health', {
        method: 'OPTIONS',
        credentials: 'include',
      });
      tests.push({
        name: 'CORS Preflight',
        status: response.ok ? 'success' : 'error',
        details: `${response.status} ${response.statusText}`,
      });
    } catch (error) {
      tests.push({
        name: 'CORS Preflight',
        status: 'error',
        details: error.message,
      });
    }

    // Test 3: Authentication endpoint
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${BrowserCompat.getAuthToken()}`,
        },
      });
      tests.push({
        name: 'Auth Endpoint',
        status: response.status === 401 ? 'warning' : response.ok ? 'success' : 'error',
        details: `${response.status} ${response.statusText}`,
      });
    } catch (error) {
      tests.push({
        name: 'Auth Endpoint',
        status: 'error',
        details: error.message,
      });
    }

    return tests;
  },

  // Test de création d'utilisateur
  async testUserCreation(userData) {
    console.group('🧪 Test création utilisateur');
    
    try {
      // Log des données envoyées
      console.log('Données utilisateur:', userData);
      // Token log removed for security
      console.log('Configuration navigateur:', BrowserCompat.getBrowserInfo());

      const response = await fetch('/api/users', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BrowserCompat.getAuthToken()}`,
        },
        body: JSON.stringify(userData),
      });

      const responseData = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(responseData);
      } catch (e) {
        parsedData = responseData;
      }

      console.log('Réponse serveur:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: parsedData,
      });

      console.groupEnd();

      return {
        success: response.ok,
        status: response.status,
        data: parsedData,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      console.error('Erreur test création:', error);
      console.groupEnd();
      
      this.logError('Test création utilisateur', error, { userData });
      throw error;
    }
  },

  // Diagnostic complet
  async runFullDiagnostic() {
    console.group('🔍 Diagnostic complet');
    
    const results = {
      browser: BrowserCompat.getBrowserInfo(),
      connectivity: await this.testApiConnectivity(),
      storage: this.testStorage(),
      errors: this.getStoredErrors(),
      timestamp: new Date().toISOString(),
    };

    console.log('Résultats diagnostic:', results);
    console.groupEnd();

    return results;
  },

  // Test du stockage
  testStorage() {
    const tests = [];

    // Test localStorage
    try {
      const testKey = 'debug_test_' + Date.now();
      localStorage.setItem(testKey, 'test');
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      tests.push({
        name: 'LocalStorage',
        status: retrieved === 'test' ? 'success' : 'error',
        details: 'Lecture/écriture OK',
      });
    } catch (error) {
      tests.push({
        name: 'LocalStorage',
        status: 'error',
        details: error.message,
      });
    }

    // Test sessionStorage
    try {
      const testKey = 'debug_test_' + Date.now();
      sessionStorage.setItem(testKey, 'test');
      const retrieved = sessionStorage.getItem(testKey);
      sessionStorage.removeItem(testKey);
      
      tests.push({
        name: 'SessionStorage',
        status: retrieved === 'test' ? 'success' : 'error',
        details: 'Lecture/écriture OK',
      });
    } catch (error) {
      tests.push({
        name: 'SessionStorage',
        status: 'error',
        details: error.message,
      });
    }

    // Test cookies
    try {
      const testCookie = 'debug_test=' + Date.now();
      document.cookie = testCookie + '; path=/';
      const cookieExists = document.cookie.includes('debug_test');
      
      // Nettoyer
      document.cookie = 'debug_test=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      tests.push({
        name: 'Cookies',
        status: cookieExists ? 'success' : 'error',
        details: 'Lecture/écriture OK',
      });
    } catch (error) {
      tests.push({
        name: 'Cookies',
        status: 'error',
        details: error.message,
      });
    }

    return tests;
  },

  // Export des données de debug
  exportDebugData() {
    const data = {
      browser: BrowserCompat.getBrowserInfo(),
      errors: this.getStoredErrors(),
      storage: this.testStorage(),
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

export default DebugHelper; 