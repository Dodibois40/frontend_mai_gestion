import api from './api.js';

/**
 * Service pour la génération de rapports et de statistiques.
 */

// Récupérer les données globales pour le dashboard (KPIs principaux)
export const getDashboardData = async (params = {}) => {
  try {
    const { data } = await api.get('/reporting/dashboard', { params });
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données du dashboard:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer les données de performance des affaires
export const getAffairesPerformance = async (params = {}) => {
  try {
    const { data } = await api.get('/reporting/affaires-performance', { params });
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des performances des affaires:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer les statistiques d'heures par type et par affaire
export const getHeuresStats = async (params = {}) => {
  try {
    const { data } = await api.get('/reporting/heures-stats', { params });
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques d'heures:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer l'évolution des achats dans le temps
export const getAchatsEvolution = async (params = {}) => {
  try {
    const { data } = await api.get('/reporting/achats-evolution', { params });
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'évolution des achats:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer les marges par affaire
export const getMargesAffaires = async (params = {}) => {
  try {
    const { data } = await api.get('/reporting/marges-affaires', { params });
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des marges par affaire:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Exporter les données en CSV
export const exportCsv = async (reportType, params = {}) => {
  try {
    const response = await api.get(`/reporting/export/${reportType}`, {
      params,
      responseType: 'blob'
    });
    
    // Créer un lien de téléchargement pour le fichier
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'exportation des données:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Exporter les données en PDF
export const exportPdf = async (reportType, params = {}) => {
  try {
    const response = await api.get(`/reporting/export/${reportType}`, {
      params: { ...params, format: 'pdf' },
      responseType: 'blob'
    });
    
    // Créer un lien de téléchargement pour le fichier
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'exportation des données:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Récupérer les statistiques d'inventaire
export const getInventaireStats = async (params = {}) => {
  try {
    const { data } = await api.get('/reporting/inventaire-stats', { params });
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques d'inventaire:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Export par défaut pour l'import
const reportingService = {
  getDashboardData,
  getAffairesPerformance,
  getHeuresStats,
  getAchatsEvolution,
  getMargesAffaires,
  exportCsv,
  exportPdf,
  getInventaireStats
};

export { reportingService };
export default reportingService; 