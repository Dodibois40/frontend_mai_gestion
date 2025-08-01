import api from './api';

class PdfService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }

  // Obtenir les informations complètes du PDF avec toutes les options de visualisation
  async getPdfInfo(devisId) {
    try {
      const response = await api.get(`/api/devis-cloud/${devisId}/pdf-info`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération info PDF:', error);
      throw new Error('Impossible de récupérer les informations du PDF');
    }
  }

  // Obtenir le lien de prévisualisation intelligent selon le navigateur
  async getSmartPreview(devisId, userAgent = navigator.userAgent) {
    try {
      const response = await api.get(`/api/devis-cloud/${devisId}/smart-preview`, {
        params: { userAgent }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur smart preview:', error);
      throw new Error('Impossible de générer l\'aperçu intelligent');
    }
  }

  // Obtenir le lien Google Drive
  async getGoogleDrivePreview(devisId) {
    try {
      const response = await api.get(`/api/devis-cloud/${devisId}/google-drive-preview`);
      return response.data;
    } catch (error) {
      console.error('Erreur Google Drive preview:', error);
      throw new Error('Impossible de générer l\'aperçu Google Drive');
    }
  }

  // Obtenir le lien Microsoft Office Online
  async getMicrosoftOfficePreview(devisId) {
    try {
      const response = await api.get(`/api/devis-cloud/${devisId}/microsoft-office-preview`);
      return response.data;
    } catch (error) {
      console.error('Erreur Microsoft Office preview:', error);
      throw new Error('Impossible de générer l\'aperçu Microsoft Office');
    }
  }

  // Télécharger directement le PDF
  downloadPdf(devisId, fileName = 'document.pdf') {
    const downloadUrl = `${this.baseURL}/api/devis/${devisId}/download-pdf`;
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return Promise.resolve({
      success: true,
      message: `${fileName} téléchargé avec succès`
    });
  }

  // Ouvrir le PDF dans un nouvel onglet
  openInNewTab(devisId) {
    const viewUrl = `${this.baseURL}/api/devis/${devisId}/view-pdf`;
    window.open(viewUrl, '_blank', 'noopener,noreferrer');
    
    return Promise.resolve({
      success: true,
      message: 'PDF ouvert dans un nouvel onglet'
    });
  }

  // Vérifier la disponibilité du PDF
  async checkPdfAvailability(devisId) {
    try {
      const response = await api.head(`/api/devis/${devisId}/view-pdf`);
      return {
        available: true,
        status: response.status
      };
    } catch (error) {
      return {
        available: false,
        status: error.response?.status || 0,
        error: error.message
      };
    }
  }

  // Obtenir les statistiques d'utilisation des viewers
  getViewerStats() {
    const stats = localStorage.getItem('pdf-viewer-stats');
    if (stats) {
      return JSON.parse(stats);
    }
    return {
      pdfjs: 0,
      google: 0,
      microsoft: 0,
      download: 0,
      lastUsed: null
    };
  }

  // Enregistrer l'utilisation d'un viewer
  recordViewerUsage(viewerType) {
    const stats = this.getViewerStats();
    stats[viewerType] = (stats[viewerType] || 0) + 1;
    stats.lastUsed = new Date().toISOString();
    localStorage.setItem('pdf-viewer-stats', JSON.stringify(stats));
  }

  // Obtenir le viewer recommandé basé sur l'historique utilisateur
  getRecommendedViewer() {
    const stats = this.getViewerStats();
    const viewers = ['pdfjs', 'google', 'microsoft', 'download'];
    
    // Trouver le viewer le plus utilisé
    let mostUsed = viewers[0];
    let maxUsage = stats[mostUsed] || 0;
    
    viewers.forEach(viewer => {
      if ((stats[viewer] || 0) > maxUsage) {
        maxUsage = stats[viewer];
        mostUsed = viewer;
      }
    });
    
    return mostUsed;
  }

  // Détecter les capacités du navigateur
  detectBrowserCapabilities() {
    const userAgent = navigator.userAgent;
    
    return {
      isChrome: /Chrome/i.test(userAgent) && !/Edge/i.test(userAgent),
      isFirefox: /Firefox/i.test(userAgent),
      isSafari: /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent),
      isEdge: /Edge/i.test(userAgent),
      supportsPdfPlugin: 'application/pdf' in navigator.mimeTypes,
      supportsCanvas: !!document.createElement('canvas').getContext,
      supportsWorkers: typeof Worker !== 'undefined',
      isMobile: /Mobi|Android/i.test(userAgent)
    };
  }

  // Obtenir la meilleure stratégie d'affichage
  getBestViewingStrategy(devisId) {
    const capabilities = this.detectBrowserCapabilities();
    const userPreference = this.getRecommendedViewer();
    
    let strategy = {
      primary: 'download', // par défaut
      fallbacks: ['google', 'microsoft'],
      reasoning: 'Solution universelle'
    };

    if (capabilities.isChrome || capabilities.isEdge) {
      strategy = {
        primary: 'pdfjs',
        fallbacks: ['google', 'download'],
        reasoning: 'Excellent support PDF natif'
      };
    } else if (capabilities.isFirefox) {
      strategy = {
        primary: 'google',
        fallbacks: ['pdfjs', 'download'],
        reasoning: 'Google Drive fonctionne bien avec Firefox'
      };
    } else if (capabilities.isSafari) {
      strategy = {
        primary: 'microsoft',
        fallbacks: ['google', 'download'],
        reasoning: 'Microsoft Office Online optimisé pour Safari'
      };
    }

    // Respecter la préférence utilisateur si elle existe
    if (userPreference && userPreference !== 'download') {
      strategy.primary = userPreference;
      strategy.reasoning += ' (basé sur vos préférences)';
    }

    return strategy;
  }
}

// Instance singleton
const pdfService = new PdfService();

export default pdfService; 