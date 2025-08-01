import React, { useState } from 'react';
import { 
  IconDownload, 
  IconEye, 
  IconFileText,
  IconAlertCircle,
  IconExternalLink,
  IconCheck
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const PdfManagerAlternative = ({ 
  pdfUrl, 
  fileName = 'document.pdf',
  fileSize = null,
  uploadDate = null,
  className = ''
}) => {
  const [downloading, setDownloading] = useState(false);

  // Téléchargement avec feedback
  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${fileName} téléchargé avec succès`);
      
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error('Impossible de télécharger le fichier');
    } finally {
      setDownloading(false);
    }
  };

  // Ouverture dans un nouvel onglet
  const handleOpenInNewTab = () => {
    try {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      toast.success('PDF ouvert dans un nouvel onglet');
    } catch (error) {
      console.error('Erreur ouverture:', error);
      toast.error('Impossible d\'ouvrir le PDF');
    }
  };

  // Fonction pour formater la taille des fichiers
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Taille inconnue';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <IconFileText className="h-8 w-8 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium truncate">
              {fileName}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                PDF
              </Badge>
              {fileSize && (
                <span className="text-xs text-gray-500">
                  {formatFileSize(fileSize)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {uploadDate && (
          <p className="text-xs text-gray-500 mt-2">
            Uploadé le {formatDate(uploadDate)}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Bouton principal - Télécharger */}
          <Button 
            onClick={handleDownload}
            disabled={downloading}
            className="w-full"
            variant="default"
          >
            <IconDownload className="h-4 w-4 mr-2" />
            {downloading ? 'Téléchargement...' : 'Télécharger'}
          </Button>

          {/* Bouton secondaire - Ouvrir dans nouvel onglet */}
          <Button 
            onClick={handleOpenInNewTab}
            variant="outline"
            className="w-full"
          >
            <IconExternalLink className="h-4 w-4 mr-2" />
            Ouvrir dans un nouvel onglet
          </Button>

          {/* Info sur la compatibilité */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <IconAlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Conseils de visualisation :</p>
                <ul className="space-y-1 text-xs">
                  <li>• Utilisez "Ouvrir dans un nouvel onglet" pour voir le PDF directement</li>
                  <li>• Téléchargez le fichier pour une meilleure expérience</li>
                  <li>• Compatible avec tous les navigateurs modernes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PdfManagerAlternative; 