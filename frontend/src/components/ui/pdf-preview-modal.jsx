import React from 'react';
import { IconX, IconEye } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import PdfViewer from './pdf-viewer-iframe';
import devisService from '@/services/devisService';

const PdfPreviewModal = ({ 
  isOpen, 
  onClose, 
  devisId,
  fileName,
  devisInfo,
  apiService = devisService // Par défaut, utilise devisService pour la compatibilité
}) => {
  if (!isOpen || !devisId) return null;

  const pdfUrl = apiService.getPdfViewUrl(devisId);
  const embedUrl = apiService.getPdfEmbedUrl ? apiService.getPdfEmbedUrl(devisId) : pdfUrl;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay - plus sombre pour un effet plein écran */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-90 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal en plein écran */}
      <div className="fixed inset-0 flex flex-col">
        <div className="bg-white dark:bg-gray-900 w-full h-full flex flex-col">
          {/* Header compact en haut */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <IconEye className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Aperçu du document PDF
                </h3>
                {devisInfo && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {devisInfo.numero} - {devisInfo.libelle}
                  </p>
                )}
              </div>
            </div>
            
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              icon={IconX}
              className="shrink-0"
            >
              Fermer
            </Button>
          </div>
          
          {/* Content qui prend tout l'espace restant */}
          <div className="flex-1 w-full">
            <PdfViewer
              pdfUrl={pdfUrl}
              embedUrl={embedUrl}
              fileName={fileName || `${devisInfo?.numero || 'devis'}.pdf`}
              showControls={false}
              height="100%"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal; 