import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// TEMPORAIREMENT DÉSACTIVÉ POUR DÉPLOIEMENT - PDF viewer non disponible
const PdfViewerProfessional = ({ 
  pdfUrl, 
  fileName = 'document.pdf',
  showControls = true,
  height = 600,
  className = '',
  onClose = null
}) => {
  return (
    <Card className={`w-full ${className}`} style={{ height: `${height}px` }}>
      <CardHeader>
        <CardTitle>🚧 Visionneuse PDF temporairement indisponible</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            La visionneuse PDF sera réactivée prochainement.
          </p>
          {pdfUrl && (
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              📄 Télécharger le PDF
            </a>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Fermer
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PdfViewerProfessional; 