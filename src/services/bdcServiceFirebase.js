import api from './api';
import firebaseStorageService from './firebaseStorageService';

const BDC_ENDPOINT = '/bdc';

/**
 * Service de gestion des bons de commande (BDC) avec Firebase Storage
 */
const bdcServiceFirebase = {
  // Récupérer tous les BDC avec pagination et filtres
  async getAll(params = {}) {
    try {
      const response = await api.get(BDC_ENDPOINT, { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des BDC:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des BDC');
    }
  },

  // Récupérer un BDC par son ID
  async getById(id) {
    try {
      const response = await api.get(`${BDC_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du BDC:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du BDC');
    }
  },

  // Récupérer les BDC d'une affaire
  async getBdcsByAffaire(affaireId) {
    try {
      const response = await api.get(BDC_ENDPOINT, { 
        params: { affaireId } 
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des BDC de l\'affaire:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des BDC de l\'affaire');
    }
  },

  // Créer un nouveau BDC
  async create(bdcData) {
    try {
      const response = await api.post(BDC_ENDPOINT, bdcData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du BDC:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du BDC');
    }
  },

  // Mettre à jour un BDC
  async update(id, bdcData) {
    try {
      const response = await api.patch(`${BDC_ENDPOINT}/${id}`, bdcData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du BDC:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du BDC');
    }
  },

  // Supprimer un BDC
  async delete(id) {
    try {
      const response = await api.delete(`${BDC_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression du BDC:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du BDC');
    }
  },

  // Valider un BDC
  async valider(id) {
    try {
      const response = await api.patch(`${BDC_ENDPOINT}/${id}/valider`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la validation du BDC:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la validation du BDC');
    }
  },

  // Annuler un BDC
  async annuler(id) {
    try {
      const response = await api.patch(`${BDC_ENDPOINT}/${id}/annuler`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'annulation du BDC:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'annulation du BDC');
    }
  },

  // Réceptionner un BDC
  async receptionner(id, dateReception = new Date()) {
    try {
      const response = await api.patch(`${BDC_ENDPOINT}/${id}/receptionner`, {
        dateReception: dateReception.toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la réception du BDC:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la réception du BDC');
    }
  },

  // ========== MÉTHODES FIREBASE POUR LES PDFs ==========

  /**
   * Upload d'un fichier PDF pour un BDC via Firebase Storage
   * @param {string} bdcId - ID du BDC
   * @param {File} file - Fichier PDF à uploader
   * @param {Function} onProgress - Callback pour le progress (optionnel)
   * @returns {Promise<Object>} - Données du BDC mis à jour
   */
  async uploadPdfFirebase(bdcId, file, onProgress = null) {
    try {
      // 1. Récupérer les informations du BDC pour obtenir son numéro
      const bdcResponse = await api.get(`${BDC_ENDPOINT}/${bdcId}`);
      const bdcNumero = bdcResponse.data.numero;
      
      // 2. Upload vers Firebase Storage avec le numéro de BDC comme nom de fichier
      const firebaseResult = await firebaseStorageService.uploadBdcPdf(bdcId, file, onProgress, bdcNumero);
      
      // 3. Mettre à jour le BDC dans la base de données avec les infos Firebase
      const updateData = {
        firebaseStoragePath: firebaseResult.fullPath,
        firebaseDownloadUrl: firebaseResult.downloadURL,
        nomFichier: firebaseResult.originalName,
        tailleFichier: firebaseResult.size,
        dateUpload: new Date().toISOString()
      };

      const response = await api.patch(`${BDC_ENDPOINT}/${bdcId}`, updateData);
      
      return {
        ...response.data,
        firebaseData: firebaseResult
      };
    } catch (error) {
      console.error('Erreur lors de l\'upload Firebase du PDF:', error);
      throw new Error(error.message || 'Erreur lors de l\'upload du fichier PDF');
    }
  },

  /**
   * Obtenir l'URL de visualisation d'un PDF depuis Firebase
   * @param {string} bdcId - ID du BDC
   * @returns {Promise<string>} - URL de visualisation Firebase
   */
  async getPdfViewUrlFirebase(bdcId) {
    try {
      const bdc = await this.getById(bdcId);
      
      if (!bdc.firebaseStoragePath) {
        throw new Error('Aucun fichier PDF associé à ce BDC');
      }

      // Obtenir l'URL de téléchargement Firebase (valide et sécurisée)
      return await firebaseStorageService.getPdfDownloadUrl(bdc.firebaseStoragePath);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'URL Firebase:', error);
      throw new Error(error.message || 'Erreur lors de la récupération de l\'URL du PDF');
    }
  },

  /**
   * Supprimer le fichier PDF d'un BDC depuis Firebase
   * @param {string} bdcId - ID du BDC
   * @returns {Promise<Object>} - BDC mis à jour
   */
  async deletePdfFirebase(bdcId) {
    try {
      const bdc = await this.getById(bdcId);
      
      if (!bdc.firebaseStoragePath) {
        throw new Error('Aucun fichier PDF associé à ce BDC');
      }

      // 1. Supprimer de Firebase Storage
      await firebaseStorageService.deletePdf(bdc.firebaseStoragePath);
      
      // 2. Mettre à jour le BDC dans la base de données
      const updateData = {
        firebaseStoragePath: null,
        firebaseDownloadUrl: null,
        nomFichier: null,
        tailleFichier: null,
        dateUpload: null
      };

      const response = await api.patch(`${BDC_ENDPOINT}/${bdcId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression Firebase du PDF:', error);
      throw new Error(error.message || 'Erreur lors de la suppression du fichier PDF');
    }
  },

  /**
   * Vérifier si un PDF existe dans Firebase
   * @param {string} bdcId - ID du BDC
   * @returns {Promise<boolean>} - true si le PDF existe
   */
  async checkPdfExistsFirebase(bdcId) {
    try {
      const bdc = await this.getById(bdcId);
      
      if (!bdc.firebaseStoragePath) {
        return false;
      }

      return await firebaseStorageService.pdfExists(bdc.firebaseStoragePath);
    } catch (error) {
      console.error('Erreur lors de la vérification Firebase du PDF:', error);
      return false;
    }
  },

  /**
   * Obtenir les métadonnées d'un PDF depuis Firebase
   * @param {string} bdcId - ID du BDC
   * @returns {Promise<Object>} - Métadonnées du PDF
   */
  async getPdfMetadataFirebase(bdcId) {
    try {
      const bdc = await this.getById(bdcId);
      
      if (!bdc.firebaseStoragePath) {
        throw new Error('Aucun fichier PDF associé à ce BDC');
      }

      return await firebaseStorageService.getPdfMetadata(bdc.firebaseStoragePath);
    } catch (error) {
      console.error('Erreur lors de la récupération des métadonnées Firebase:', error);
      throw new Error(error.message || 'Erreur lors de la récupération des métadonnées du PDF');
    }
  },

  // ========== MÉTHODES DE COMPATIBILITÉ (pour migration progressive) ==========

  // Obtenir l'URL de visualisation (Firebase ou legacy)
  async getPdfViewUrl(bdcId) {
    try {
      const bdc = await this.getById(bdcId);
      
      // Si Firebase est configuré, utiliser Firebase
      if (bdc.firebaseStoragePath) {
        return await this.getPdfViewUrlFirebase(bdcId);
      }
      
      // Sinon, utiliser l'ancien système
      return `${api.defaults.baseURL}${BDC_ENDPOINT}/${bdcId}/view-pdf`;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'URL PDF:', error);
      // Fallback vers l'ancien système
      return `${api.defaults.baseURL}${BDC_ENDPOINT}/${bdcId}/view-pdf`;
    }
  },

  // Obtenir l'URL d'embed (Firebase ou legacy)
  async getPdfEmbedUrl(bdcId) {
    try {
      const bdc = await this.getById(bdcId);
      
      // Si Firebase est configuré, utiliser Firebase
      if (bdc.firebaseStoragePath) {
        return await this.getPdfViewUrlFirebase(bdcId);
      }
      
      // Sinon, utiliser l'ancien système
      return `${api.defaults.baseURL}${BDC_ENDPOINT}/${bdcId}/pdf-embed`;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'URL embed:', error);
      // Fallback vers l'ancien système
      return `${api.defaults.baseURL}${BDC_ENDPOINT}/${bdcId}/pdf-embed`;
    }
  },

  // ========== MÉTHODES UTILITAIRES ==========

  // Obtenir toutes les catégories d'achat
  async getCategories() {
    try {
      const response = await api.get('/categories-achat');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des catégories');
    }
  },

  // Formatage des statuts
  formatStatut(statut) {
    const statuts = {
      'EN_ATTENTE_VALIDATION': 'En attente de validation',
      'VALIDE': 'Validé',
      'COMMANDE': 'Commandé',
      'RECEPTIONNE': 'Réceptionné',
      'ANNULE': 'Annulé'
    };
    return statuts[statut] || statut;
  },

  // Couleur du statut
  getStatutColor(statut) {
    const colors = {
      'EN_ATTENTE_VALIDATION': 'orange',
      'VALIDE': 'blue',
      'COMMANDE': 'purple',
      'RECEPTIONNE': 'green',
      'ANNULE': 'red'
    };
    return colors[statut] || 'gray';
  }
};

export default bdcServiceFirebase; 