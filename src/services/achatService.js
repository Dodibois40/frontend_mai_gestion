import api from './api';

/**
 * Service pour la gestion des bons de commande (BDC) et des achats/factures
 */

// Récupérer tous les bons de commande avec pagination et filtres
export const getBdcs = async (params = {}) => {
  try {
    const { data } = await api.get('/bdc', { params });
    return data;
  } catch (error) {
    throw error;
  }
};

// Récupérer un bon de commande par son ID
export const getBdc = async (id) => {
  try {
    const { data } = await api.get(`/bdc/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Créer un nouveau bon de commande
export const createBdc = async (bdcData) => {
  try {
    const { data } = await api.post('/bdc', bdcData);
    return data;
  } catch (error) {
    throw error;
  }
};

// Mettre à jour un bon de commande
export const updateBdc = async (id, bdcData) => {
  try {
    const { data } = await api.patch(`/bdc/${id}`, bdcData);
    return data;
  } catch (error) {
    throw error;
  }
};

// Supprimer un bon de commande
export const deleteBdc = async (id, password = null) => {
  try {
    const config = {
      method: 'DELETE',
      url: `/bdc/${id}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Si un mot de passe est fourni, l'envoyer dans le body
    if (password) {
      config.data = { password };
    }

    const { data } = await api(config);
    return data;
  } catch (error) {
    throw error;
  }
};

// Réceptionner un bon de commande
export const receptionnerBdc = async (id, dateReception = new Date()) => {
  try {
    const { data } = await api.patch(`/bdc/${id}/receptionner`, { 
      dateReception: dateReception.toISOString() 
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// Valider un bon de commande
export const validerBdc = async (id) => {
  try {
    const { data } = await api.patch(`/bdc/${id}/valider`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Annuler un bon de commande
export const annulerBdc = async (id) => {
  try {
    const { data } = await api.patch(`/bdc/${id}/annuler`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Obtenir les statistiques d'achat par affaire
export const getStatsByAffaire = async (affaireId) => {
  try {
    const { data } = await api.get(`/bdc/affaire/${affaireId}/stats`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Récupérer les catégories d'achat
export const getCategoriesAchat = async () => {
  try {
    console.log('📡 [CATEGORIES] Appel API vers /categories-achat');
    const { data } = await api.get('/categories-achat');
    console.log('✅ [CATEGORIES] Catégories reçues du backend:', data);
    return data;
  } catch (error) {
    console.error('❌ [CATEGORIES] Erreur lors du chargement des catégories:', error);
    throw error; // Ne plus utiliser de catégories de secours, mais utiliser vraiment la base de données
  }
};

// Récupérer les affaires (utilisé pour les sélecteurs de BDC)
export const getAffaires = async () => {
  try {
    // Récupérer toutes les affaires (pas de pagination pour les sélecteurs)
    const { data } = await api.get('/affaires', {
      params: {
        take: 1000, // Limite suffisamment haute pour récupérer toutes les affaires
        skip: 0
      }
    });
    
    // Le backend retourne { affaires: [...], total: number }
    return data.affaires || [];
  } catch (error) {
    console.error('❌ [ACHAT-SERVICE] Erreur lors de la récupération des affaires:', error);
    throw error;
  }
};

/**
 * Fonctions pour la gestion des achats/factures
 */

// Récupérer tous les achats avec pagination et filtres
export const getAchats = async (params = {}) => {
  try {
    const { data } = await api.get('/achats', { params });
    return data;
  } catch (error) {
    throw error;
  }
};

// Récupérer un achat par son ID
export const getAchat = async (id) => {
  try {
    const { data } = await api.get(`/achats/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Créer un nouvel achat/facture
export const createAchat = async (achatData) => {
  try {
    const { data } = await api.post('/achats', achatData);
    return data;
  } catch (error) {
    throw error;
  }
};

// Mettre à jour un achat
export const updateAchat = async (id, achatData) => {
  try {
    const { data } = await api.patch(`/achats/${id}`, achatData);
    return data;
  } catch (error) {
    throw error;
  }
};

// Supprimer un achat
export const deleteAchat = async (id) => {
  try {
    const { data } = await api.delete(`/achats/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Valider un achat
export const validerAchat = async (id) => {
  try {
    const { data } = await api.patch(`/achats/${id}/valider`);
    return data;
  } catch (error) {
    console.error('Erreur validation achat:', error);
    throw error;
  }
};

// Marquer un achat comme payé
export const payerAchat = async (id, datePaiement) => {
  try {
    const { data } = await api.patch(`/achats/${id}/payer`, { datePaiement });
    return data;
  } catch (error) {
    throw error;
  }
};

// Obtenir les statistiques d'achat par affaire
export const getAchatsStatsByAffaire = async (affaireId) => {
  try {
    const { data } = await api.get(`/achats/affaire/${affaireId}/stats`);
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fonctions pour la gestion des fichiers PDF des BDC
 */

// Upload d'un fichier PDF pour un BDC
export const uploadBdcPdf = async (bdcId, formData) => {
  try {
    const response = await api.post(`/bdc/${bdcId}/upload-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'upload du PDF:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de l\'upload du fichier PDF');
  }
};

// Télécharger le PDF d'un bon de commande
export const downloadBdcPdf = async (bdcId) => {
  console.log('🔽 downloadBdcPdf appelé avec bdcId:', bdcId);
  console.trace('🔍 Stack trace pour identifier l\'appelant:');
  
  try {
    const response = await api.get(`/bdc/${bdcId}/download-pdf`, {
      responseType: 'blob', // Important pour télécharger des fichiers binaires
    });
    
    // Créer un blob et déclencher le téléchargement
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Extraire le nom du fichier depuis les headers de réponse
    // Essayer différentes variations du header (case insensitive)
    const contentDisposition = response.headers['content-disposition'] || 
                               response.headers['Content-Disposition'] ||
                               response.headers.get?.('content-disposition') ||
                               response.headers.get?.('Content-Disposition');
    
    let fileName = 'bon-de-commande.pdf'; // Nom de fallback générique
    
    console.log('🔍 Headers de réponse:', response.headers);
    console.log('🔍 Content-Disposition:', contentDisposition);
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (fileNameMatch) {
        fileName = fileNameMatch[1];
        console.log('✅ Nom de fichier extrait:', fileName);
      }
    } else {
      console.warn('⚠️ Aucun header Content-Disposition trouvé. Le backend ne renvoie pas le bon header.');
    }
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    
    // Nettoyer
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Erreur lors du téléchargement du PDF:', error);
    throw error;
  }
};

// Supprimer le fichier PDF d'un BDC
export const deleteBdcPdf = async (bdcId) => {
  try {
    const response = await api.delete(`/bdc/${bdcId}/pdf`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du PDF:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du fichier PDF');
  }
};

// Obtenir l'URL de visualisation d'un PDF de BDC
export const getBdcPdfViewUrl = (bdcId) => {
  return `${api.defaults.baseURL}/bdc/${bdcId}/view-pdf`;
};

// Vérifier si un PDF de BDC est accessible
export const checkBdcPdfAccess = async (bdcId) => {
  try {
    const response = await api.head(`/bdc/${bdcId}/view-pdf`);
    return { accessible: true, status: response.status };
  } catch (error) {
    console.error('PDF non accessible:', error);
    return { accessible: false, status: error.response?.status || 0, error: error.message };
  }
};

// Obtenir les informations d'un PDF de BDC sans le télécharger
export const getBdcPdfInfo = async (bdcId) => {
  try {
    const response = await api.head(`/bdc/${bdcId}/view-pdf`);
    return {
      contentType: response.headers['content-type'],
      contentLength: response.headers['content-length'],
      fileName: response.headers['content-disposition']?.match(/filename="([^"]+)"/)?.[1] || 'bdc.pdf'
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des info PDF:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des informations du PDF');
  }
};
