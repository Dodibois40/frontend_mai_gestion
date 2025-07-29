import api from './api';

const migrationService = {
  // Exporter les affaires vers Excel
  async exportAffaires() {
    try {
      const response = await api.get('/migration/export/affaires', {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `affaires_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Export des affaires terminé' };
    } catch (error) {
      console.error('Erreur lors de l\'export des affaires:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'export');
    }
  },

  // Exporter les articles vers Excel
  async exportArticles() {
    try {
      const response = await api.get('/migration/export/articles', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `articles_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Export des articles terminé' };
    } catch (error) {
      console.error('Erreur lors de l\'export des articles:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'export');
    }
  },

  // Exporter les BDC vers Excel
  async exportBdc() {
    try {
      const response = await api.get('/migration/export/bdc', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bdc_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Export des BDC terminé' };
    } catch (error) {
      console.error('Erreur lors de l\'export des BDC:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'export');
    }
  },

  // Télécharger le modèle Excel pour les articles
  async downloadArticlesTemplate() {
    try {
      const response = await api.get('/migration/template/articles', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'modele_articles.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Modèle téléchargé' };
    } catch (error) {
      console.error('Erreur lors du téléchargement du modèle:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors du téléchargement');
    }
  },

  // Télécharger le modèle Excel pour les affaires
  async downloadAffairesTemplate() {
    try {
      const response = await api.get('/migration/template/affaires', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'modele_affaires.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Modèle téléchargé' };
    } catch (error) {
      console.error('Erreur lors du téléchargement du modèle:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors du téléchargement');
    }
  },

  // Importer des articles depuis Excel
  async importArticles(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/migration/import/articles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'import des articles:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'import');
    }
  },

  // Importer des affaires depuis Excel
  async importAffaires(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/migration/import/affaires', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'import des affaires:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'import');
    }
  }
};

export default migrationService; 