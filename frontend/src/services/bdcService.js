import api from './api';

const BDC_ENDPOINT = '/bdc';

/**
 * Service de gestion des bons de commande (BDC)
 */
const bdcService = {
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

  // Upload d'un fichier PDF pour un BDC
  async uploadPdf(bdcId, formData) {
    try {
      const response = await api.post(`${BDC_ENDPOINT}/${bdcId}/upload-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'upload du PDF:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'upload du fichier PDF');
    }
  },

  // Télécharger le fichier PDF d'un BDC
  async downloadPdf(bdcId) {
    try {
      const response = await api.get(`${BDC_ENDPOINT}/${bdcId}/download-pdf`, {
        responseType: 'blob', // Important pour les fichiers binaires
      });
      return response;
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors du téléchargement du fichier PDF');
    }
  },

  // Supprimer le fichier PDF d'un BDC
  async deletePdf(bdcId) {
    try {
      const response = await api.delete(`${BDC_ENDPOINT}/${bdcId}/pdf`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression du PDF:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du fichier PDF');
    }
  },

  // Obtenir l'URL de visualisation d'un PDF
  getPdfViewUrl(bdcId) {
    return `${api.defaults.baseURL}${BDC_ENDPOINT}/${bdcId}/view-pdf`;
  },

  // Obtenir l'URL d'embed alternative pour le PDF
  getPdfEmbedUrl(bdcId) {
    return `${api.defaults.baseURL}${BDC_ENDPOINT}/${bdcId}/pdf-embed`;
  },

  // Vérifier si un PDF est accessible
  async checkPdfAccess(bdcId) {
    try {
      const response = await api.head(`${BDC_ENDPOINT}/${bdcId}/view-pdf`);
      return { accessible: true, status: response.status };
    } catch (error) {
      console.error('PDF non accessible:', error);
      return { accessible: false, status: error.response?.status || 0, error: error.message };
    }
  },

  // Obtenir les informations d'un PDF sans le télécharger
  async getPdfInfo(bdcId) {
    try {
      const response = await api.head(`${BDC_ENDPOINT}/${bdcId}/view-pdf`);
      return {
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        fileName: response.headers['content-disposition']?.match(/filename="([^"]+)"/)?.[1] || 'bdc.pdf'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des info PDF:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des informations du PDF');
    }
  },

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
      'EN_ATTENTE': 'En attente',
      'VALIDE': 'Validé',
      'RECEPTIONNE': 'Réceptionné',
      'ANNULE': 'Annulé'
    };
    return statuts[statut] || statut;
  },

  getStatutColor(statut) {
    const colors = {
      'EN_ATTENTE': 'orange',
      'VALIDE': 'blue',
      'RECEPTIONNE': 'green',
      'ANNULE': 'red'
    };
    return colors[statut] || 'gray';
  }
};

export default bdcService; 