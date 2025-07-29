import React, { useState, useEffect } from 'react';
import {
  IconFile,
  IconFolder,
  IconUpload,
  IconDownload,
  IconTrash,
  IconEye,
  IconPlus,
  IconSearch,
  IconFilter,
  IconFileText,
  IconFileZip,
  IconPhoto
} from '@tabler/icons-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentPreviewModal from './DocumentPreviewModal';
import DocumentThumbnail from './DocumentThumbnail';
import documentationsService from '@/services/documentationsService';

const AffaireDocumentations = ({ affaire, onRefreshData }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [documentToPreview, setDocumentToPreview] = useState(null);

  // Catégories de documents
  const categories = [
    { id: 'all', label: 'Tous', color: 'bg-gray-100' },
    { id: 'financier', label: 'Financier', color: 'bg-blue-100' },
    { id: 'plans', label: 'Plans', color: 'bg-green-100' },
    { id: 'photos', label: 'Photos', color: 'bg-purple-100' },
    { id: 'autres', label: 'Autres documents', color: 'bg-orange-100' }
  ];

  // Sous-catégories pour certains types
  const subCategories = {
    financier: ['Devis', 'Factures', 'Avoirs'],
    plans: ['Plan architecte', 'Plan technique']
  };

  // Charger les documents depuis le backend
  useEffect(() => {
    loadDocuments();
  }, [affaire.id]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentationsService.getDocumentsByAffaire(affaire.id);
      setDocuments(data);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      toast.error('Impossible de charger les documents');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir l'icône selon le type de fichier
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <IconFileText className="w-8 h-8 text-red-500" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <IconFileZip className="w-8 h-8 text-yellow-500" />;
      case 'jpg':
      case 'png':
      case 'jpeg':
      case 'gif':
        return <IconPhoto className="w-8 h-8 text-purple-500" />;
      case 'doc':
      case 'docx':
        return <IconFileText className="w-8 h-8 text-blue-500" />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <IconFileText className="w-8 h-8 text-green-500" />;
      case 'dwg':
      case 'dxf':
        return <IconFileText className="w-8 h-8 text-orange-500" />;
      default:
        return <IconFile className="w-8 h-8 text-gray-500" />;
    }
  };

  // Filtrer les documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Gérer l'upload d'un nouveau document
  const handleUpload = (uploadData) => {
    // Recharger tous les documents depuis le backend
    loadDocuments();
    
    // Actualiser les données si nécessaire
    if (onRefreshData) {
      onRefreshData();
    }
  };

  // Gérer la suppression d'un document
  const handleDeleteDocument = async (doc) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le document "${doc.nom}" ?`)) {
      try {
        await documentationsService.deleteDocument(doc.id);
        setDocuments(prev => prev.filter(d => d.id !== doc.id));
        toast.success('Document supprimé avec succès');
        if (onRefreshData) {
          onRefreshData();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du document:', error);
        toast.error('Impossible de supprimer le document');
      }
    }
  };

  // Gérer le téléchargement d'un document
  const handleDownloadDocument = async (doc) => {
    try {
      toast.info(`Téléchargement de "${doc.nom}" en cours...`);
      const blob = await documentationsService.downloadDocument(doc.id);
      documentationsService.downloadBlob(blob, doc.nomOriginal || doc.nom);
      toast.success(`Téléchargement de "${doc.nom}" terminé`);
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      toast.error(`Impossible de télécharger le document "${doc.nom}"`);
    }
  };

  // Gérer la visualisation d'un document
  const handleViewDocument = (doc) => {
    try {
      console.log('👁️ Tentative de visualisation du document:', doc.nom, 'ID:', doc.id);
      
      // Ouvrir la modal de prévisualisation
      setDocumentToPreview(doc);
      setIsPreviewModalOpen(true);
      
      toast.success(`Prévisualisation de "${doc.nom}"`);
    } catch (error) {
      console.error('❌ Erreur lors de la visualisation du document:', error);
      
      // Messages d'erreur plus spécifiques
      if (error.message.includes('Authentification')) {
        toast.error('Authentification requise. Veuillez vous reconnecter.');
      } else {
        toast.error(`Impossible d'ouvrir le document "${doc.nom}"`);
      }
    }
  };

  // Gérer le téléchargement groupé
  const handleDownloadAll = () => {
    const count = filteredDocuments.length;
    if (count === 0) {
      toast.warning('Aucun document à télécharger');
      return;
    }
    toast.info(`Préparation du téléchargement de ${count} document${count > 1 ? 's' : ''}...`);
    // TODO: Implémenter le téléchargement en ZIP de tous les documents filtrés
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-800">
              Documentations de l'affaire
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleDownloadAll}
              >
                <IconDownload className="w-4 h-4" />
                Télécharger
              </Button>
              <Button 
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <IconUpload className="w-4 h-4" />
                Ajouter un document
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Barre de recherche et filtres */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Rechercher un document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              <IconFolder className="w-4 h-4 mr-1" />
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Liste des documents */}
      <Card>
        <CardContent className="p-6">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <IconFolder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun document trouvé</p>
            </div>
          ) : (
            <>
              {/* Affichage en colonnes pour certaines catégories */}
              {(selectedCategory === 'financier' || selectedCategory === 'plans') && subCategories[selectedCategory] ? (
                <div className={`grid grid-cols-1 gap-6 ${
                  selectedCategory === 'financier' 
                    ? 'md:grid-cols-3' 
                    : selectedCategory === 'plans' 
                    ? 'md:grid-cols-2' 
                    : 'md:grid-cols-3'
                }`}>
                  {subCategories[selectedCategory].map(subCat => {
                    const subCatDocs = filteredDocuments.filter(doc => doc.sousCategorie === subCat);
                    return (
                      <div key={subCat} className="space-y-4">
                        <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">{subCat}</h3>
                        {subCatDocs.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <IconFile className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Aucun document</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {subCatDocs.map(doc => (
                              <div
                                key={doc.id}
                                className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer bg-white"
                              >
                                {/* Miniature en haut */}
                                <div className="mb-3">
                                  <DocumentThumbnail 
                                    document={doc} 
                                    className="w-full h-40"
                                  />
                                </div>
                                
                                {/* Informations du document */}
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between">
                                    <h3 className="font-semibold text-sm truncate flex-1 mr-2">{doc.nom}</h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                      {new Date(doc.dateUpload).toLocaleDateString('fr-FR')}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{doc.taille}</span>
                                    <span>{doc.uploadePar}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDocument(doc);
                                    }}
                                  >
                                    <IconEye className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadDocument(doc);
                                    }}
                                  >
                                    <IconDownload className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="flex-1 text-red-500 hover:text-red-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteDocument(doc);
                                    }}
                                  >
                                    <IconTrash className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Affichage normal en grille pour les autres catégories */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments.map(doc => (
                    <div
                      key={doc.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
                    >
                      <div className="flex items-start justify-between mb-3">
                        {getFileIcon(doc.type)}
                        <span className="text-xs text-gray-400">
                          {new Date(doc.dateUpload).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm mb-1 truncate">{doc.nom}</h3>
                      <p className="text-xs text-gray-500 mb-2">{doc.taille}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span>{doc.uploadePar}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocument(doc);
                          }}
                        >
                          <IconEye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadDocument(doc);
                          }}
                        >
                          <IconDownload className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(doc);
                          }}
                        >
                          <IconTrash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
                <p className="text-sm text-gray-500">Documents totaux</p>
              </div>
              <IconFile className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">53.4 MB</p>
                <p className="text-sm text-gray-500">Espace utilisé</p>
              </div>
              <IconFolder className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-500">Utilisateurs</p>
              </div>
              <IconFileText className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">15</p>
                <p className="text-sm text-gray-500">Téléchargements</p>
              </div>
              <IconDownload className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal d'upload */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        affaireId={affaire.id}
      />

      {/* Modal de prévisualisation */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setDocumentToPreview(null);
        }}
        document={documentToPreview}
        onDownload={handleDownloadDocument}
      />
    </div>
  );
};

export default AffaireDocumentations; 