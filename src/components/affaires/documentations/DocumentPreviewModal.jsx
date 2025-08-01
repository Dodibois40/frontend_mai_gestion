import React, { useEffect, useRef } from 'react';
import {
  IconX,
  IconDownload,
  IconExternalLink,
  IconFileText
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import documentationsService from '@/services/documentationsService';
import { toast } from 'sonner';

const DocumentPreviewModal = ({ isOpen, onClose, document, onDownload }) => {
  const iframeContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && document && iframeContainerRef.current) {
      const loadPreview = async () => {
        try {
          // Vérifier l'authentification avant de charger
          const authValid = await documentationsService.checkAuthValidity();
          if (!authValid) {
            console.warn('⚠️ Authentification invalide, affichage des options de fallback');
            documentationsService.handleIframeError(iframeContainerRef.current, document.id);
            return;
          }
          
          // Créer l'iframe de prévisualisation
          documentationsService.createDocumentPreviewIframe(
            document.id, 
            iframeContainerRef.current
          );
        } catch (error) {
          console.error('Erreur lors de la création de la prévisualisation:', error);
          documentationsService.handleIframeError(iframeContainerRef.current, document.id);
          toast.error('Impossible de prévisualiser le document. Utilisez les boutons alternatifs.');
        }
      };
      
      loadPreview();
    }
  }, [isOpen, document]);

  const handleExternalOpen = () => {
    try {
      // Utiliser la méthode du service qui gère déjà les fallbacks
      documentationsService.openDocumentInNewTab(document.id);
      toast.success('Document ouvert dans un nouvel onglet');
    } catch (error) {
      console.error('Erreur ouverture externe:', error);
      toast.error('Impossible d\'ouvrir le document');
    }
  };

  const handleDownload = async () => {
    try {
      if (onDownload) {
        await onDownload(document);
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error('Impossible de télécharger le document');
    }
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between py-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <IconFileText className="w-5 h-5 text-blue-600" />
            {document.nom}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExternalOpen}
              className="flex items-center gap-2"
            >
              <IconExternalLink className="w-4 h-4" />
              Ouvrir dans un nouvel onglet
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <IconDownload className="w-4 h-4" />
              Télécharger
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <IconX className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div 
            ref={iframeContainerRef}
            className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center"
          >
            <div className="text-center text-gray-500">
              <IconFileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Chargement du document...</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span><strong>Catégorie:</strong> {document.categorie}</span>
              {document.sousCategorie && (
                <span><strong>Sous-catégorie:</strong> {document.sousCategorie}</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span><strong>Taille:</strong> {document.taille}</span>
              <span><strong>Uploadé le:</strong> {new Date(document.dateUpload).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal; 