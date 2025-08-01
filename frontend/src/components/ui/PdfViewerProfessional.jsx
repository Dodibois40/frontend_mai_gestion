import React, { useState, useEffect, useRef } from 'react';
import { 
  IconDownload, 
  IconMaximize, 
  IconMinus,
  IconPlus,
  IconRotateClockwise,
  IconX,
  IconLoader,
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Configuration PDF.js
const pdfjsLib = () => import('pdfjs-dist/webpack');

const PdfViewerProfessional = ({ 
  pdfUrl, 
  fileName = 'document.pdf',
  showControls = true,
  height = 600,
  className = '',
  onClose = null
}) => {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialisation PDF.js
  useEffect(() => {
    const initPdfjs = async () => {
      try {
        const pdfjs = await pdfjsLib();
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;
        loadPdf();
      } catch (err) {
        console.error('Erreur initialisation PDF.js:', err);
        setError('Impossible d\'initialiser le lecteur PDF');
        setLoading(false);
      }
    };

    if (pdfUrl) {
      initPdfjs();
    }
  }, [pdfUrl]);

  // Chargement du document PDF
  const loadPdf = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const pdfjs = await pdfjsLib();
      const pdf = await pdfjs.getDocument({
        url: pdfUrl,
        httpHeaders: {
          'Accept': 'application/pdf',
        },
        withCredentials: false
      }).promise;
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
      await renderPage(pdf, 1);
      setLoading(false);
      
    } catch (err) {
      console.error('Erreur chargement PDF:', err);
      setError(`Impossible de charger le PDF: ${err.message}`);
      setLoading(false);
    }
  };

  // Rendu d'une page
  const renderPage = async (pdf, pageNum) => {
    if (!pdf || !canvasRef.current) return;

    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale, rotation });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
    } catch (err) {
      console.error('Erreur rendu page:', err);
      setError(`Erreur d'affichage de la page ${pageNum}`);
    }
  };

  // Navigation entre les pages
  const goToPage = async (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages || !pdfDoc) return;
    setCurrentPage(pageNum);
    await renderPage(pdfDoc, pageNum);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Contrôles de zoom
  const zoomIn = async () => {
    const newScale = Math.min(scale * 1.2, 3);
    setScale(newScale);
    if (pdfDoc) {
      await renderPage(pdfDoc, currentPage);
    }
  };

  const zoomOut = async () => {
    const newScale = Math.max(scale / 1.2, 0.5);
    setScale(newScale);
    if (pdfDoc) {
      await renderPage(pdfDoc, currentPage);
    }
  };

  // Rotation
  const rotatePage = async () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    if (pdfDoc) {
      await renderPage(pdfDoc, currentPage);
    }
  };

  // Téléchargement
  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    link.click();
  };

  // Mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <IconLoader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Chargement du PDF...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <IconAlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-2">
              <Button onClick={loadPdf} variant="outline">
                Réessayer
              </Button>
              <Button onClick={downloadPdf} variant="default">
                <IconDownload className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-white"
    : `w-full ${className}`;

  return (
    <div className={containerClass}>
      <Card className="w-full h-full">
        {showControls && (
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {fileName} - Page {currentPage} sur {totalPages}
              </CardTitle>
              
              <div className="flex items-center space-x-1">
                {/* Navigation */}
                <Button
                  onClick={prevPage}
                  disabled={currentPage <= 1}
                  variant="outline"
                  size="sm"
                >
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={nextPage}
                  disabled={currentPage >= totalPages}
                  variant="outline"
                  size="sm"
                >
                  <IconChevronRight className="h-4 w-4" />
                </Button>

                {/* Zoom */}
                <Button onClick={zoomOut} variant="outline" size="sm">
                  <IconMinus className="h-4 w-4" />
                </Button>
                
                <span className="text-xs px-2">
                  {Math.round(scale * 100)}%
                </span>
                
                <Button onClick={zoomIn} variant="outline" size="sm">
                  <IconPlus className="h-4 w-4" />
                </Button>

                {/* Rotation */}
                <Button onClick={rotatePage} variant="outline" size="sm">
                  <IconRotateClockwise className="h-4 w-4" />
                </Button>

                {/* Téléchargement */}
                <Button onClick={downloadPdf} variant="outline" size="sm">
                  <IconDownload className="h-4 w-4" />
                </Button>

                {/* Plein écran */}
                <Button onClick={toggleFullscreen} variant="outline" size="sm">
                  <IconMaximize className="h-4 w-4" />
                </Button>

                {/* Fermer (si dans un modal) */}
                {onClose && (
                  <Button onClick={onClose} variant="outline" size="sm">
                    <IconX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        )}

        <CardContent className="p-4">
          <div 
            className="overflow-auto bg-gray-100 rounded-lg"
            style={{ height: isFullscreen ? 'calc(100vh - 120px)' : `${height}px` }}
          >
            <div className="flex justify-center p-4">
              <canvas
                ref={canvasRef}
                className="shadow-lg bg-white rounded border"
                style={{ maxWidth: '100%' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PdfViewerProfessional; 