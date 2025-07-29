import React, { useState, useRef } from 'react';
import { 
  IconUpload, 
  IconFile, 
  IconDownload, 
  IconTrash, 
  IconEye,
  IconLoader,
  IconX,
  IconCheck
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const PdfUpload = ({ 
  devisId,
  currentFile,
  onFileUploaded,
  onFileDeleted,
  onPreviewRequested,
  apiService,
  disabled = false 
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validation du type de fichier
    if (file.type !== 'application/pdf') {
      toast.error('Seuls les fichiers PDF sont autorisés');
      return;
    }

    // Validation de la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (maximum 10MB)');
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiService.uploadPdf(devisId, formData);
      
      toast.success('Fichier PDF uploadé avec succès');
      
      if (onFileUploaded) {
        onFileUploaded(response);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error(error.message || 'Erreur lors de l\'upload du fichier');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier PDF ?')) {
      return;
    }

    setDeleting(true);
    
    try {
      await apiService.deletePdf(devisId);
      toast.success('Fichier PDF supprimé avec succès');
      
      if (onFileDeleted) {
        onFileDeleted();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression du fichier');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadFile = async () => {
    try {
      const response = await apiService.downloadPdf(devisId);
      
      // Créer un lien de téléchargement
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentFile?.nomFichier || 'devis.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Fichier téléchargé avec succès');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error(error.message || 'Erreur lors du téléchargement du fichier');
    }
  };

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
    // Réinitialiser l'input pour permettre la sélection du même fichier
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  // Si un fichier existe déjà
  if (currentFile && currentFile.fichierPdf) {
    return (
      <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-900/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                <IconFile className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  {currentFile.nomFichier}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {formatFileSize(currentFile.tailleFichier)} • 
                  Uploadé le {new Date(currentFile.dateUpload).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onPreviewRequested && onPreviewRequested()}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-100"
                icon={IconEye}
              >
                Aperçu
              </Button>
              
              <Button
                onClick={handleDownloadFile}
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200 hover:bg-green-100"
                icon={IconDownload}
              >
                Télécharger
              </Button>
              
              {!disabled && (
                <>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    icon={uploading ? IconLoader : IconUpload}
                  >
                    {uploading ? 'Upload...' : 'Remplacer'}
                  </Button>
                  
                  <Button
                    onClick={handleDeleteFile}
                    variant="outline"
                    size="sm"
                    disabled={deleting}
                    className="text-red-600 border-red-200 hover:bg-red-100"
                    icon={deleting ? IconLoader : IconTrash}
                  >
                    {deleting ? 'Suppression...' : 'Supprimer'}
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>
    );
  }

  // Zone d'upload
  return (
    <Card 
      className={`border-2 border-dashed transition-colors ${
        dragOver 
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-600'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <CardContent 
        className="p-8"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-center">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            {uploading ? (
              <IconLoader className="w-8 h-8 text-blue-600 animate-spin" />
            ) : (
              <IconUpload className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Uploader un fichier PDF
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Glissez-déposez votre fichier ici, ou cliquez pour sélectionner
          </p>
          
          <div className="space-y-2 text-sm text-gray-400 mb-6">
            <p>• Format accepté : PDF uniquement</p>
            <p>• Taille maximum : 10MB</p>
          </div>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || disabled}
            variant="primary"
            icon={uploading ? IconLoader : IconUpload}
          >
            {uploading ? 'Upload en cours...' : 'Sélectionner un fichier'}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PdfUpload; 