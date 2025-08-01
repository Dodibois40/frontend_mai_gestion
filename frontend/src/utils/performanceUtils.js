/**
 * 🚀 UTILITAIRES DE PERFORMANCE
 * Gestionnaire centralisé pour le cache et le debouncing
 */

// Cache global avec TTL (Time To Live)
class PerformanceCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  // Définir une valeur dans le cache avec TTL
  set(key, value, ttlMs = 60000) { // TTL par défaut: 60 secondes
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry });
    
    // Nettoyer automatiquement après expiration
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttlMs);
    
    this.timers.set(key, timer);
  }

  // Récupérer une valeur du cache
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
      return null;
    }
    
    return item.value;
  }

  // Vérifier si une clé existe et n'est pas expirée
  has(key) {
    return this.get(key) !== null;
  }

  // Nettoyer le cache
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }

  // Obtenir des statistiques du cache
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instance globale du cache
export const performanceCache = new PerformanceCache();

// Gestionnaire de debouncing
class DebounceManager {
  constructor() {
    this.timers = new Map();
  }

  // Debouncer une fonction
  debounce(key, func, delay = 300) {
    // Annuler le timer précédent
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Créer un nouveau timer
    const timer = setTimeout(() => {
      func();
      this.timers.delete(key);
    }, delay);

    this.timers.set(key, timer);
  }

  // Annuler un debounce spécifique
  cancel(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  // Nettoyer tous les timers
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  // Obtenir des statistiques
  getStats() {
    return {
      activeTimers: this.timers.size,
      keys: Array.from(this.timers.keys())
    };
  }
}

// Instance globale du gestionnaire de debouncing
export const debounceManager = new DebounceManager();

// Utilitaire pour créer un hash des données
export const createDataHash = (data) => {
  try {
    return JSON.stringify(data, (key, value) => {
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'object' && value !== null) {
        // Trier les clés des objets pour un hash consistant
        const sorted = {};
        Object.keys(value).sort().forEach(k => {
          sorted[k] = value[k];
        });
        return sorted;
      }
      return value;
    });
  } catch (error) {
    console.warn('Erreur lors de la création du hash:', error);
    return Math.random().toString();
  }
};

// Utilitaire pour paralléliser des requêtes avec gestion d'erreur
export const parallelizeRequests = async (requests, options = {}) => {
  const { 
    maxConcurrent = 5, 
    retryAttempts = 2, 
    retryDelay = 1000,
    timeout = 30000 
  } = options;

  const results = [];
  const chunks = [];
  
  // Diviser les requêtes en chunks pour limiter la concurrence
  for (let i = 0; i < requests.length; i += maxConcurrent) {
    chunks.push(requests.slice(i, i + maxConcurrent));
  }

  for (const chunk of chunks) {
    const chunkPromises = chunk.map(async (request, index) => {
      let lastError;
      
      for (let attempt = 0; attempt <= retryAttempts; attempt++) {
        try {
          // Ajouter un timeout à la requête
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          );
          
          const result = await Promise.race([request(), timeoutPromise]);
          return { success: true, data: result, index: chunk.indexOf(request) };
        } catch (error) {
          lastError = error;
          if (attempt < retryAttempts) {
            console.warn(`Tentative ${attempt + 1} échouée, retry dans ${retryDelay}ms:`, error.message);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }
      
      return { success: false, error: lastError, index: chunk.indexOf(request) };
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
  }

  return results;
};

// Hook personnalisé pour le monitoring des performances
export const usePerformanceMonitor = (componentName) => {
  const start = Date.now();
  
  return {
    logRenderTime: () => {
      const renderTime = Date.now() - start;
      if (renderTime > 100) { // Log seulement si > 100ms
        console.warn(`⚡ ${componentName} render took ${renderTime}ms`);
      }
    },
    
    measureAsync: async (operation, operationName) => {
      const startTime = Date.now();
      try {
        const result = await operation();
        const duration = Date.now() - startTime;
        console.log(`📊 ${componentName} - ${operationName}: ${duration}ms`);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ ${componentName} - ${operationName} failed after ${duration}ms:`, error);
        throw error;
      }
    }
  };
};

// Utilitaire pour optimiser les re-renders
export const shallowEqual = (obj1, obj2) => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
};

// Nettoyage global (à appeler au démontage de l'application)
export const globalCleanup = () => {
  performanceCache.clear();
  debounceManager.clear();
};

// Statistiques globales de performance
export const getPerformanceStats = () => {
  return {
    cache: performanceCache.getStats(),
    debounce: debounceManager.getStats(),
    timestamp: new Date().toISOString()
  };
};