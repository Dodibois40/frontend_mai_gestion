import api from './api';

const DEVIS_ENDPOINT = '/devis';

// Service pour la gestion des devis
const devisService = {
  // Obtenir tous les devis avec filtres et pagination
  async getAllDevis(params = {}) {
    try {
      const response = await api.get(DEVIS_ENDPOINT, { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des devis:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des devis');
    }
  },

  // Obtenir un devis par ID
  async getDevis(id) {
    try {
      const response = await api.get(`${DEVIS_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du devis:', error);
      throw new Error(error.response?.data?.message || 'Devis non trouvé');
    }
  },

  // Créer un nouveau devis
  async createDevis(devisData) {
    try {
      const response = await api.post(DEVIS_ENDPOINT, devisData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du devis');
    }
  },

  // Mettre à jour un devis
  async updateDevis(id, devisData) {
    try {
      const response = await api.patch(`${DEVIS_ENDPOINT}/${id}`, devisData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du devis:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du devis');
    }
  },

  // Mettre à jour le statut d'un devis
  async updateStatutDevis(id, statut) {
    try {
      const response = await api.patch(`${DEVIS_ENDPOINT}/${id}/statut`, { statut });
      
      // Émettre un événement pour notifier les autres composants
      const affaireId = response.data?.affaire?.id;
      if (affaireId) {
        // Événement personnalisé pour l'affaire spécifique
        window.dispatchEvent(new CustomEvent('affaire_updated', {
          detail: { affaireId, type: 'devis_status_changed', devisId: id, newStatus: statut }
        }));
        
        // Événement général pour les devis
        window.dispatchEvent(new CustomEvent('devis_updated', {
          detail: { affaireId, devisId: id, newStatus: statut }
        }));
        
        // Marquer dans localStorage pour les onglets multiples
        localStorage.setItem(`affaire_${affaireId}_updated`, Date.now().toString());
        localStorage.setItem('devis_updated', Date.now().toString());
        
        console.log(`Événement émis pour affaire ${affaireId} - devis ${id} - statut: ${statut}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  },

  // Supprimer un devis
  async deleteDevis(id) {
    try {
      await api.delete(`${DEVIS_ENDPOINT}/${id}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du devis:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du devis');
    }
  },

  // Obtenir les statistiques des devis
  async getStats() {
    try {
      const response = await api.get(`${DEVIS_ENDPOINT}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  },

  // Obtenir les devis d'une affaire
  async getDevisByAffaire(affaireId) {
    try {
      const response = await api.get(`${DEVIS_ENDPOINT}/affaire/${affaireId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des devis de l\'affaire:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des devis');
    }
  },

  // Obtenir les devis par statut
  async getDevisByStatus(statut) {
    try {
      const response = await api.get(DEVIS_ENDPOINT, {
        params: { statut }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des devis par statut:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des devis');
    }
  },

  // Formater la date
  formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
  },

  // Formater le montant
  formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  },

  // Obtenir le badge de statut
  getStatusBadge(statut) {
    const statusConfig = {
      'EN_ATTENTE_VALIDATION': { 
        label: 'En attente', 
        color: 'bg-yellow-100 text-yellow-800' 
      },
      'VALIDE': { 
        label: 'Validé', 
        color: 'bg-green-100 text-green-800' 
      },
      'REALISE': { 
        label: 'Réalisé', 
        color: 'bg-blue-100 text-blue-800' 
      },
      'REFUSE': { 
        label: 'Refusé', 
        color: 'bg-red-100 text-red-800' 
      },
      'EXPIRE': { 
        label: 'Expiré', 
        color: 'bg-gray-100 text-gray-800' 
      }
    };
    
    return statusConfig[statut] || { 
      label: statut, 
      color: 'bg-gray-100 text-gray-800' 
    };
  },

  // Upload d'un fichier PDF pour un devis
  async uploadPdf(devisId, formData) {
    try {
      const response = await api.post(`${DEVIS_ENDPOINT}/${devisId}/upload-pdf`, formData, {
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

  // Télécharger le fichier PDF d'un devis
  async downloadPdf(devisId) {
    try {
      const response = await api.get(`${DEVIS_ENDPOINT}/${devisId}/download-pdf`, {
        responseType: 'blob', // Important pour les fichiers binaires
      });
      return response;
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors du téléchargement du fichier PDF');
    }
  },

  // Supprimer le fichier PDF d'un devis
  async deletePdf(devisId) {
    try {
      const response = await api.delete(`${DEVIS_ENDPOINT}/${devisId}/pdf`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression du PDF:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du fichier PDF');
    }
  },

  // Obtenir l'URL de visualisation d'un PDF
  getPdfViewUrl(devisId) {
    return `${api.defaults.baseURL}/devis/${devisId}/view-pdf`;
  },

  // Obtenir l'URL d'embed alternative pour le PDF
  getPdfEmbedUrl(devisId) {
    return `${api.defaults.baseURL}/devis/${devisId}/pdf-embed`;
  },

  // Vérifier si un PDF est accessible
  async checkPdfAccess(devisId) {
    try {
      const response = await api.head(`${DEVIS_ENDPOINT}/${devisId}/view-pdf`);
      return { accessible: true, status: response.status };
    } catch (error) {
      console.error('PDF non accessible:', error);
      return { accessible: false, status: error.response?.status || 0, error: error.message };
    }
  },

  // Obtenir les informations d'un PDF sans le télécharger
  async getPdfInfo(devisId) {
    try {
      const response = await api.head(`${DEVIS_ENDPOINT}/${devisId}/view-pdf`);
      return {
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        fileName: response.headers['content-disposition']?.match(/filename="([^"]+)"/)?.[1] || 'devis.pdf'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des info PDF:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des informations du PDF');
    }
  }
};

export default devisService; 