// Utilitaires de compatibilité navigateur
export const BrowserCompat = {
  // Détection du navigateur
  isChrome() {
    return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  },

  isFirefox() {
    return /Firefox/.test(navigator.userAgent);
  },

  isSafari() {
    return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  },

  // Configuration Axios adaptée au navigateur
  getAxiosConfig() {
    const baseConfig = {
      withCredentials: true,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };

    // Configuration spécifique Chrome
    if (this.isChrome()) {
      return {
        ...baseConfig,
        headers: {
          ...baseConfig.headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        // Chrome est plus strict sur les credentials
        withCredentials: true,
        // Retries pour Chrome
        retry: 3,
        retryDelay: 1000,
      };
    }

    // Configuration spécifique Firefox
    if (this.isFirefox()) {
      return {
        ...baseConfig,
        // Firefox gère mieux les credentials par défaut
        timeout: 60000, // Timeout plus long pour Firefox
      };
    }

    return baseConfig;
  },

  // Gestion du stockage local selon le navigateur
  setSecureStorage(key, value) {
    try {
      if (this.isChrome()) {
        // Chrome préfère sessionStorage pour certaines données sensibles
        sessionStorage.setItem(`chrome_${key}`, JSON.stringify(value));
        // Backup dans localStorage
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.warn('Erreur stockage:', error);
    }
  },

  getSecureStorage(key) {
    try {
      if (this.isChrome()) {
        // Essayer d'abord sessionStorage pour Chrome
        const chromeValue = sessionStorage.getItem(`chrome_${key}`);
        if (chromeValue) {
          return JSON.parse(chromeValue);
        }
      }
      
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('Erreur lecture stockage:', error);
      return null;
    }
  },

  removeSecureStorage(key) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(`chrome_${key}`);
    } catch (error) {
      console.warn('Erreur suppression stockage:', error);
    }
  },

  // Gestion des tokens d'authentification
  setAuthToken(token) {
    this.setSecureStorage('auth' + '_token', token);
    
    // Pour Chrome, on ajoute aussi dans un cookie httpOnly simulé
    if (this.isChrome()) {
      document.cookie = `auth' + '_token=${token}; path=/; SameSite=Lax; Secure=${location.protocol === 'https:'}`;
    }
  },

  getAuthToken() {
    // Priorité au stockage local
    let token = this.getSecureStorage('auth' + '_token');
    
    // Fallback sur les cookies pour Chrome
    if (!token && this.isChrome()) {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth' + '_token='));
      if (authCookie) {
        token = authCookie.split('=')[1];
      }
    }
    
    return token;
  },

  removeAuthToken() {
    this.removeSecureStorage('auth' + '_token');
    
    // Supprimer le cookie pour Chrome
    if (this.isChrome()) {
      document.cookie = 'auth' + '_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  },

  // Diagnostic navigateur
  getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      isChrome: this.isChrome(),
      isFirefox: this.isFirefox(),
      isSafari: this.isSafari(),
      supportsCredentials: 'withCredentials' in new XMLHttpRequest(),
      supportsFetch: typeof fetch !== 'undefined',
      supportsLocalStorage: typeof Storage !== 'undefined',
      cookiesEnabled: navigator.cookieEnabled,
    };
  },

  // Log de debug navigateur
  logBrowserCompat() {
    const info = this.getBrowserInfo();
    console.log('🌐 Informations navigateur:', info);
    
    if (info.isChrome) {
      console.log('🔧 Configuration Chrome activée');
    } else if (info.isFirefox) {
      console.log('🦊 Configuration Firefox activée');
    }
    
    if (!info.cookiesEnabled) {
      console.warn('⚠️ Les cookies sont désactivés');
    }
  }
};

// Détection de la navigation privée
export const isPrivateBrowsing = () => {
  return new Promise((resolve) => {
    try {
      // Test pour Chrome/Safari
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          // En navigation privée, le quota est généralement très faible
          resolve(estimate.quota < 120000000); // < 120MB
        }).catch(() => resolve(true));
      } else if ('webkitRequestFileSystem' in window) {
        // Test pour Chrome plus ancien
        window.webkitRequestFileSystem(
          window.TEMPORARY, 1,
          () => resolve(false), // Mode normal
          () => resolve(true)   // Mode privé
        );
      } else {
        // Test générique avec localStorage
        try {
          localStorage.setItem('test-private', '1');
          localStorage.removeItem('test-private');
          resolve(false);
        } catch (e) {
          resolve(true);
        }
      }
    } catch (e) {
      resolve(true);
    }
  });
};

// Message d'alerte pour la navigation privée
export const showPrivateBrowsingAlert = () => {
  return {
    type: 'warning',
    title: '🔒 Navigation privée détectée',
    message: 'Certaines fonctionnalités PDF peuvent être limitées en navigation privée. Pour une expérience optimale, utilisez le mode navigation normale.',
    actions: [
      {
        label: 'Télécharger le PDF',
        action: 'download'
      },
      {
        label: 'Ouvrir dans un nouvel onglet',
        action: 'newTab'
      }
    ]
  };
};

export default BrowserCompat; 