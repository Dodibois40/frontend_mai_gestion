<<<<<<< HEAD
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { IconFileText } from '@tabler/icons-react';

// COMPOSANT TEMPORAIREMENT DÉSACTIVÉ POUR DEPLOY - CONFLIT REACT-PDF
=======
import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  IconChevronLeft, 
  IconChevronRight, 
  IconZoomIn, 
  IconZoomOut,
  IconDownload,
  IconMaximize,
  IconX,
  IconLoader,
  IconAlertCircle
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

// Configuration alternative sans worker externe
if (typeof window !== 'undefined') {
  // Désactiver le worker pour éviter les problèmes de CORS
  pdfjs.GlobalWorkerOptions.workerSrc = null;
  pdfjs.disableWorker = true;
}

>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd
export default function PdfViewer({ 
  pdfUrl, 
  fileName = 'document.pdf',
  showControls = true,
  height = 600,
  className = ''
}) {
<<<<<<< HEAD
  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        <div 
          className="flex flex-col items-center justify-center text-gray-500"
          style={{ height: `${height}px` }}
        >
          <IconFileText size={64} className="mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">PDF Viewer en maintenance</h3>
          <p className="text-sm text-center mb-4">
            Le visualiseur PDF est temporairement indisponible.
          </p>
          {pdfUrl && (
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Télécharger {fileName}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
=======
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    console.log('PDF chargé avec succès:', numPages, 'pages');
  }, []);

  const onDocumentLoadError = useCallback((error) => {
    console.error('Erreur lors du chargement du PDF:', error);
    setError('Impossible de charger le document PDF');
    setLoading(false);
  }, []);

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Téléchargement du PDF démarré');
  };

  if (error) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardContent className="p-6 text-center">
          <IconAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="text-red-600 border-red-300"
            >
              Réessayer
            </Button>
            <br />
            <Button
              onClick={downloadPdf}
              variant="outline"
              icon={IconDownload}
              className="ml-2"
            >
              Télécharger le PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ViewerContent = () => (
    <div className="relative">
      {/* Contrôles */}
      {showControls && (
        <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b">
          <div className="flex items-center gap-2">
            <Button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1 || loading}
              variant="outline"
              size="sm"
              icon={IconChevronLeft}
            >
              Précédent
            </Button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400 px-3">
              Page {pageNumber} sur {numPages || '?'}
            </span>
            
            <Button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages || loading}
              variant="outline"
              size="sm"
              icon={IconChevronRight}
            >
              Suivant
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={zoomOut}
              variant="outline"
              size="sm"
              icon={IconZoomOut}
              disabled={scale <= 0.5}
            />
            
            <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
              {Math.round(scale * 100)}%
            </span>
            
            <Button
              onClick={zoomIn}
              variant="outline"
              size="sm"
              icon={IconZoomIn}
              disabled={scale >= 3.0}
            />

            <div className="border-l border-gray-300 dark:border-gray-600 mx-2 h-6" />

            <Button
              onClick={downloadPdf}
              variant="outline"
              size="sm"
              icon={IconDownload}
            >
              Télécharger
            </Button>

            {!isFullscreen && (
              <Button
                onClick={toggleFullscreen}
                variant="outline"
                size="sm"
                icon={IconMaximize}
              >
                Plein écran
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Zone de visualisation */}
      <div 
        className="overflow-auto bg-gray-200 dark:bg-gray-900 flex justify-center items-center"
        style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-center">
              <IconLoader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">Chargement du PDF...</p>
            </div>
          </div>
        )}

        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading=""
          error=""
          className="flex justify-center"
          options={{
            cMapUrl: 'https://unpkg.com/pdfjs-dist@2.16.105/cmaps/',
            cMapPacked: true,
            standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@2.16.105/standard_fonts/',
          }}
        >
          {!loading && (
            <Page
              pageNumber={pageNumber}
              scale={scale}
              className="shadow-lg"
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading=""
              error=""
            />
          )}
        </Document>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-900">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {fileName}
          </h3>
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
            icon={IconX}
          >
            Fermer
          </Button>
        </div>
        <ViewerContent />
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <ViewerContent />
      </CardContent>
    </Card>
  );
} 
>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd
