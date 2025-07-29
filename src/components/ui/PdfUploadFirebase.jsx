import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import PdfViewer from './PdfViewer';

/**
 * Composant d'upload PDF avec Firebase Storage
 */
const PdfUploadFirebase = ({
  entityId,
  entityType = 'bdc',
  onUploadSuccess,
  onUploadError,
  existingFile = null,
  uploadFunction,
  deleteFunction,
  getViewUrlFunction,
  onPreview = null // Fonction de prévisualisation personnalisée
}) => {
  // États du composant
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(existingFile);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Synchroniser l'état local avec les props
  useEffect(() => {
    console.log('🔥 PdfUploadFirebase - existingFile changed:', existingFile);
    setCurrentFile(existingFile);
  }, [existingFile]);

  // Validation du fichier
  const validateFile = (file) => {
    if (!file) {
      throw new Error('Aucun fichier sélectionné');
    }
    if (file.type !== 'application/pdf') {
      throw new Error('Le fichier doit être un PDF');
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error('Le fichier ne doit pas dépasser 10MB');
    }
    return true;
  };

  // Gestion de l'upload
  const handleUpload = async (file) => {
    try {
      validateFile(file);
      setIsUploading(true);
      setUploadProgress(0);

      const onProgress = (progress) => {
        setUploadProgress(progress);
      };

      const result = await uploadFunction(entityId, file, onProgress);
      
      setCurrentFile({
        nomFichier: result.fileName || result.nomFichier || file.name,
        tailleFichier: result.size || result.tailleFichier || file.size,
        dateUpload: result.uploadedAt || result.dateUpload || new Date().toISOString(),
        firebaseDownloadUrl: result.downloadURL || result.firebaseDownloadUrl,
        firebaseStoragePath: result.fullPath || result.firebaseStoragePath
      });

      toast.success('Fichier PDF uploadé avec succès !');
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error(error.message || 'Erreur lors de l\'upload du fichier');
      
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Gestion de la suppression
  const handleDelete = async () => {
    if (!currentFile) return;

    try {
      await deleteFunction(entityId);
      setCurrentFile(null);
      toast.success('Fichier PDF supprimé avec succès !');
      
      if (onUploadSuccess) {
        onUploadSuccess(null);
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression du fichier');
    }
  };

  // Gestion de la prévisualisation
  const handlePreview = async () => {
    if (!currentFile) return;

    // Si une fonction de prévisualisation personnalisée est fournie, l'utiliser
    if (onPreview) {
      console.log('🔄 Utilisation de la fonction de prévisualisation personnalisée');
      onPreview(currentFile);
      return;
    }

    // Sinon, utiliser la prévisualisation par défaut
    try {
      let url;
      
      if (currentFile.firebaseDownloadUrl) {
        url = currentFile.firebaseDownloadUrl;
      } else {
        url = await getViewUrlFunction(entityId);
      }
      
      setPdfViewerUrl(url);
      setShowPdfViewer(true);
      
    } catch (error) {
      console.error('Erreur prévisualisation:', error);
      toast.error('Erreur lors de l\'ouverture du PDF');
    }
  };

  // Gestion du téléchargement
  const handleDownload = async () => {
    if (!currentFile) return;

    try {
      let url;
      
      if (currentFile.firebaseDownloadUrl) {
        url = currentFile.firebaseDownloadUrl;
      } else {
        url = await getViewUrlFunction(entityId);
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = currentFile.nomFichier || `${entityType}_${entityId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Téléchargement démarré !');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error('Erreur lors du téléchargement du PDF');
    }
  };

  // Gestion du drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  // Gestion du clic sur input file
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  // Utilitaires de formatage
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Taille inconnue';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatFileName = (fileName) => {
    if (!fileName) return 'Fichier PDF';
    
    // Si le nom commence par un timestamp (format: 1234567890123_nom.pdf), l'extraire
    const timestampMatch = fileName.match(/^\d{13}_(.+)$/);
    if (timestampMatch) {
      fileName = timestampMatch[1]; // Utiliser le nom sans le timestamp
    }
    
    // Si c'est un fichier au format BDC-YYYY-XXX.pdf, l'afficher tel quel (c'est déjà propre)
    const bdcMatch = fileName.match(/^BDC-\d{4}-\d{3}\.pdf$/);
    if (bdcMatch) {
      return fileName; // Garder le nom tel quel pour les BDC
    }
    
    // Troncature intelligente pour les noms très longs
    if (fileName.length > 60) {
      const ext = fileName.split('.').pop();
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
      return `${nameWithoutExt.substring(0, 25)}...${nameWithoutExt.slice(-20)}.${ext}`;
    }
    
    return fileName;
  };

  // Rendu du composant
  return (
    <div className="space-y-4">
      {/* Zone d'upload ou fichier existant */}
      {currentFile ? (
        // Affichage du fichier existant
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <FileText className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 break-words" title={currentFile.nomFichier}>
                  {formatFileName(currentFile.nomFichier)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(currentFile.tailleFichier)} • 
                  Uploadé le {formatDate(currentFile.dateUpload)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreview}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Eye className="w-4 h-4 mr-1" />
                Aperçu
              </button>
              
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Download className="w-4 h-4 mr-1" />
                Télécharger
              </button>
              
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <X className="w-4 h-4 mr-1" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Zone d'upload
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Upload en cours...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Glissez-déposez un fichier PDF ici, ou{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    parcourez
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF uniquement, max 10MB
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>
      )}

      {/* Viewer PDF */}
      {showPdfViewer && pdfViewerUrl && (
        <PdfViewer
          url={pdfViewerUrl}
          filename={currentFile?.nomFichier}
          onClose={() => {
            setShowPdfViewer(false);
            setPdfViewerUrl(null);
          }}
        />
      )}
    </div>
  );
};

export default PdfUploadFirebase; 