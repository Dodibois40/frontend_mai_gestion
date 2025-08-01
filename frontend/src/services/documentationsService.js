import api from './api';

const BASE_URL = '/documentations';

const documentationsService = {
  // Upload d'un nouveau document
  async uploadDocument(affaireId, formData) {
    console.log('🚀 Service: upload document pour affaire', affaireId);
    
    // Log du contenu du FormData
    for (let [key, value] of formData.entries()) {
      console.log(`FormData ${key}:`, value);
    }
    
    try {
      const response = await api.post(`${BASE_URL}/affaire/${affaireId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Upload réussi:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur upload service:', error);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      throw error;
    }
  },

  // Récupérer tous les documents d'une affaire
  async getDocumentsByAffaire(affaireId) {
    const response = await api.get(`${BASE_URL}/affaire/${affaireId}`);
    return response.data;
  },

  // Récupérer les statistiques des documents d'une affaire
  async getStatsByAffaire(affaireId) {
    const response = await api.get(`${BASE_URL}/affaire/${affaireId}/stats`);
    return response.data;
  },

  // Récupérer un document par son ID
  async getDocument(documentId) {
    const response = await api.get(`${BASE_URL}/${documentId}`);
    return response.data;
  },

  // Télécharger un document
  async downloadDocument(documentId) {
    try {
      const response = await api.get(`${BASE_URL}/${documentId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur téléchargement avec headers, tentative avec token en query:', error);
      
      // Fallback: essayer avec le token en query parameter si l'auth par headers échoue
      const token = localStorage.getItem('auth' + '_token');
      if (token) {
        try {
          const baseUrl = api.defaults.baseURL || 'http://localhost:8000/api';
          const downloadUrl = `${baseUrl}${BASE_URL}/${documentId}/download?token=${encodeURIComponent(token)}`;
          
          const response = await fetch(downloadUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          return await response.blob();
        } catch (fallbackError) {
          console.error('❌ Erreur téléchargement avec token en query aussi:', fallbackError);
        }
      }
      
      throw error;
    }
  },

  // Prévisualiser un document
  getPreviewUrl(documentId) {
    // Récupérer le token depuis le localStorage avec la bonne clé
    const token = localStorage.getItem('auth' + '_token');
    
    if (!token) {
      console.error('❌ Aucun token d\'authentification trouvé pour la prévisualisation');
      console.log('🔍 Clés localStorage disponibles:', Object.keys(localStorage));
      throw new Error('Authentification requise pour visualiser le document');
    }
    
    // Construire l'URL avec le token
    const baseUrl = api.defaults.baseURL || 'http://localhost:8000/api';
    const previewUrl = `${baseUrl}${BASE_URL}/${documentId}/preview?token=${encodeURIComponent(token)}`;
    
    console.log('🔗 URL de prévisualisation générée:', previewUrl);
    // Token log removed for security
    
    return previewUrl;
  },

  // Mettre à jour les informations d'un document
  async updateDocument(documentId, data) {
    const response = await api.patch(`${BASE_URL}/${documentId}`, data);
    return response.data;
  },

  // Supprimer un document
  async deleteDocument(documentId) {
    const response = await api.delete(`${BASE_URL}/${documentId}`);
    return response.data;
  },

  // Rechercher des documents
  async searchDocuments(affaireId, searchParams) {
    const response = await api.get(`${BASE_URL}/affaire/${affaireId}/search`, {
      params: searchParams,
    });
    return response.data;
  },

  // Télécharger plusieurs documents en ZIP
  async downloadMultiple(documentIds) {
    const response = await api.post(`${BASE_URL}/download-multiple`, 
      { documentIds },
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Utilitaire pour créer un FormData à partir des données d'upload
  createUploadFormData(fileData) {
    const formData = new FormData();
    formData.append('file', fileData.file);
    formData.append('nom', fileData.nom);
    formData.append('categorie', fileData.categorie);
    
    if (fileData.sousCategorie) {
      formData.append('sousCategorie', fileData.sousCategorie);
    }
    
    if (fileData.description) {
      formData.append('description', fileData.description);
    }

    return formData;
  },

  // Utilitaire pour déclencher le téléchargement d'un blob
  downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Utilitaire pour obtenir l'URL de base de l'API
  getApiBaseUrl() {
    return api.defaults.baseURL || 'http://localhost:8000/api';
  },

  // Utilitaire pour obtenir le token d'authentification
  getAuthToken() {
    // Utiliser la même clé que authService
    const token = localStorage.getItem('auth' + '_token');
    if (!token) {
      console.error('❌ Aucun token d\'authentification trouvé');
      console.log('🔍 Vérification localStorage:', Object.keys(localStorage));
      throw new Error('Authentification requise');
    }
    
    // Vérifier si le token semble valide (basique)
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('⚠️ Token JWT mal formé');
        throw new Error('Token invalide');
      }
      
      // Décoder la partie payload pour vérifier l'expiration
      const payload = JSON.parse(atob(tokenParts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < now) {
        console.warn('⚠️ Token expiré');
        // Ne pas lancer d'erreur, laisser le serveur gérer
      }
      
      // Token validation log removed for security
    } catch (tokenError) {
      console.warn('⚠️ Erreur validation token:', tokenError.message);
      // Continuer quand même, le serveur validera
    }
    
    return token;
  },

  // Générer une URL sécurisée avec token pour accès direct
  generateSecureUrl(endpoint, documentId) {
    try {
      const token = this.getAuthToken();
      const baseUrl = this.getApiBaseUrl();
      const secureUrl = `${baseUrl}${BASE_URL}/${documentId}/${endpoint}?token=${encodeURIComponent(token)}`;
      
      console.log(`🔗 URL sécurisée générée (${endpoint}):`, secureUrl);
      return secureUrl;
    } catch (error) {
      console.error(`❌ Impossible de générer l'URL sécurisée pour ${endpoint}:`, error);
      throw error;
    }
  },

  // Ouvrir un document dans un nouvel onglet (alternative à getPreviewUrl)
  openDocumentInNewTab(documentId) {
    try {
      const previewUrl = this.generateSecureUrl('preview', documentId);
      const newWindow = window.open(previewUrl, '_blank', 'noopener,noreferrer');
      
      if (!newWindow) {
        // Si le popup est bloqué, utiliser la méthode alternative
        console.warn('🚫 Popup bloqué, utilisation de la méthode alternative');
        return this.openDocumentAlternative(documentId);
      }
      
      return newWindow;
    } catch (error) {
      console.error('❌ Erreur lors de l\'ouverture du document:', error);
      throw error;
    }
  },

  // Méthode alternative : ouvrir dans le même onglet
  openDocumentAlternative(documentId) {
    try {
      const previewUrl = this.generateSecureUrl('preview', documentId);
      
      // Créer un lien temporaire et le cliquer
      const link = document.createElement('a');
      link.href = previewUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Ajouter temporairement au DOM
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Document ouvert via méthode alternative');
      return true;
    } catch (error) {
      console.error('❌ Erreur méthode alternative:', error);
      throw error;
    }
  },

  // Créer une iframe pour prévisualiser le document dans une modal
  createDocumentPreviewIframe(documentId, container) {
    try {
      const previewUrl = this.generateSecureUrl('preview', documentId);
      
      const iframe = document.createElement('iframe');
      iframe.src = previewUrl;
      iframe.style.width = '100%';
      iframe.style.height = '600px';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      
      // Gérer les erreurs de chargement de l'iframe
      iframe.onload = () => {
        console.log('✅ Iframe chargée avec succès');
      };
      
      iframe.onerror = () => {
        console.error('❌ Erreur chargement iframe');
        this.handleIframeError(container, documentId);
      };
      
      // Nettoyer le container et ajouter l'iframe
      container.innerHTML = '';
      container.appendChild(iframe);
      
      console.log('✅ Iframe de prévisualisation créée');
      return iframe;
    } catch (error) {
      console.error('❌ Erreur création iframe:', error);
      this.handleIframeError(container, documentId);
      throw error;
    }
  },

  // Gérer les erreurs d'iframe
  handleIframeError(container, documentId) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50 rounded-lg">
        <div class="text-red-500 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Impossible de charger la prévisualisation</h3>
        <p class="text-gray-600 mb-4">Le document ne peut pas être affiché dans cette fenêtre.</p>
        <div class="space-x-2">
          <button onclick="window.documentationsService.openDocumentInNewTab(${documentId})" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Ouvrir dans un nouvel onglet
          </button>
          <button onclick="window.documentationsService.fallbackDownload(${documentId})" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Télécharger
          </button>
        </div>
      </div>
    `;
  },

  // Vérifier la validité de l'authentification
  async checkAuthValidity() {
    try {
      const token = this.getAuthToken();
      
      // Faire un test rapide avec l'API
      const response = await fetch(`${this.getApiBaseUrl()}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn('⚠️ Token invalide, tentative de renouvellement');
        return false;
      }
      
      console.log('✅ Authentification valide');
      return true;
    } catch (error) {
      console.error('❌ Erreur vérification auth:', error);
      return false;
    }
  },

  // Télécharger directement le document si la visualisation échoue
  async fallbackDownload(documentId) {
    try {
      console.log('📥 Fallback: téléchargement direct du document');
      const blob = await this.downloadDocument(documentId);
      
      // Créer un nom de fichier temporaire
      const filename = `document_${documentId}_${Date.now()}`;
      this.downloadBlob(blob, filename);
      
      return true;
    } catch (error) {
      console.error('❌ Erreur téléchargement fallback:', error);
      throw error;
    }
  },

  // Obtenir l'URL de la miniature d'un document
  getThumbnailUrl(documentId) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl}/api/documentations/${documentId}/thumbnail`;
  },
};

// Exposer le service globalement pour les boutons de fallback
if (typeof window !== 'undefined') {
  window.documentationsService = documentationsService;
}

export default documentationsService; 