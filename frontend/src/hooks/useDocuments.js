import { useState, useEffect, useCallback } from 'react';
import documentationsService from '../services/documentationsService';
import { toast } from 'sonner';

export const useDocuments = (affaireId) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    totalSize: 0,
    byCategory: {}
  });

  // Charger les documents
  const fetchDocuments = useCallback(async () => {
    if (!affaireId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Pour l'instant, on utilise des données de démonstration
      // À remplacer par l'appel API réel : 
      // const data = await documentationsService.getDocumentsByAffaire(affaireId);
      
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Données de démonstration (à remplacer)
      const mockDocuments = [
        {
          id: 1,
          nom: 'Devis_Initial_' + affaireId + '.pdf',
          categorie: 'financier',
          sousCategorie: 'Devis',
          taille: '2.4 MB',
          dateUpload: '2025-01-15',
          uploadePar: 'Jean Dupont',
          type: 'pdf'
        }
      ];
      
      setDocuments(mockDocuments);
      calculateStats(mockDocuments);
    } catch (err) {
      console.error('Erreur lors du chargement des documents:', err);
      setError('Impossible de charger les documents');
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  }, [affaireId]);

  // Calculer les statistiques
  const calculateStats = (docs) => {
    const stats = {
      total: docs.length,
      totalSize: 0,
      byCategory: {}
    };

    docs.forEach(doc => {
      // Compter par catégorie
      if (!stats.byCategory[doc.categorie]) {
        stats.byCategory[doc.categorie] = 0;
      }
      stats.byCategory[doc.categorie]++;
    });

    setStats(stats);
  };

  // Ajouter un document
  const addDocument = useCallback(async (documentData) => {
    try {
      // Pour l'instant, ajout local
      // À remplacer par : await documentationsService.uploadDocument(affaireId, documentData);
      
      const newDoc = {
        id: Date.now(),
        ...documentData,
        dateUpload: new Date().toISOString()
      };
      
      setDocuments(prev => [newDoc, ...prev]);
      calculateStats([newDoc, ...documents]);
      
      return newDoc;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du document:', err);
      throw err;
    }
  }, [affaireId, documents]);

  // Supprimer un document
  const deleteDocument = useCallback(async (documentId) => {
    try {
      // Pour l'instant, suppression locale
      // À remplacer par : await documentationsService.deleteDocument(documentId);
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      calculateStats(documents.filter(doc => doc.id !== documentId));
      
      toast.success('Document supprimé');
    } catch (err) {
      console.error('Erreur lors de la suppression du document:', err);
      toast.error('Erreur lors de la suppression');
      throw err;
    }
  }, [documents]);

  // Télécharger un document
  const downloadDocument = useCallback(async (documentId) => {
    try {
      // À implémenter avec l'API
      // const blob = await documentationsService.downloadDocument(documentId);
      // Créer un lien de téléchargement...
      
      toast.info('Téléchargement du document...');
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      toast.error('Erreur lors du téléchargement');
      throw err;
    }
  }, []);

  // Rechercher des documents
  const searchDocuments = useCallback((searchTerm, category) => {
    return documents.filter(doc => {
      const matchesSearch = doc.nom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || doc.categorie === category;
      return matchesSearch && matchesCategory;
    });
  }, [documents]);

  // Charger les documents au montage
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    stats,
    fetchDocuments,
    addDocument,
    deleteDocument,
    downloadDocument,
    searchDocuments
  };
}; 