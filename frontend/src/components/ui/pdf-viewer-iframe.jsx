import React, { useState, useEffect } from 'react';
import { 
  IconDownload,
  IconX,
  IconAlertCircle,
  IconEye,
  IconLoader,
  IconRefresh
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PdfViewer({ 
  pdfUrl, 
  embedUrl,
  fileName = 'document.pdf',
  showControls = true,
  height = 600,
  className = ''
}) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [currentStrategy, setCurrentStrategy] = useState('embed'); // 'embed', 'iframe', 'blob'
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (pdfUrl) {
      loadPdf();
    }
  }, [pdfUrl, currentStrategy]);

  const loadPdf = async () => {
    try {
      setLoading(true);
      setError(false);
      
      const urlToTry = embedUrl && currentStrategy === 'embed' ? embedUrl : pdfUrl;
      
      const response = await fetch(urlToTry);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      if (blob.type !== 'application/pdf') {
        throw new Error('Le fichier n\'est pas un PDF valide');
      }
      
      const objectUrl = URL.createObjectURL(blob);
      setPdfBlob(objectUrl);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement du PDF:', err);
      
      // Essayer les stratégies de fallback
      if (currentStrategy === 'embed' && embedUrl && retryCount < 2) {
        console.log('Tentative avec iframe...');
        setCurrentStrategy('iframe');
        setRetryCount(prev => prev + 1);
        return;
      }
      
      if (currentStrategy === 'iframe' && retryCount < 3) {
        console.log('Tentative avec blob...');
        setCurrentStrategy('blob');
        setRetryCount(prev => prev + 1);
        return;
      }
      
      setError(true);
      setLoading(false);
    }
  };

  const resetAndRetry = () => {
    setCurrentStrategy('embed');
    setRetryCount(0);
    setError(false);
    setPdfBlob(null);
    loadPdf();
  };

  const downloadPdf = async () => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success('Téléchargement du PDF démarré');
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      toast.error('Erreur lors du téléchargement du PDF');
    }
  };

  const openInNewTab = () => {
    if (pdfBlob) {
      window.open(pdfBlob, '_blank');
    } else {
      window.open(embedUrl || pdfUrl, '_blank');
    }
  };

  // Cleanup de l'URL objet
  useEffect(() => {
    return () => {
      if (pdfBlob) {
        URL.revokeObjectURL(pdfBlob);
      }
    };
  }, [pdfBlob]);

  if (loading) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center">
          <IconLoader className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Chargement du PDF...
          </h3>
          <p className="text-gray-600 text-sm">
            Stratégie actuelle: {currentStrategy} {retryCount > 0 && `(Tentative ${retryCount})`}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-red-50 ${className}`}>
        <div className="text-center p-6">
          <IconAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Impossible de charger l'aperçu
          </h3>
          <p className="text-red-600 mb-4 text-sm">
            Le PDF ne peut pas être affiché dans cette fenêtre. Cela peut être dû aux paramètres de sécurité du navigateur ou à un problème de réseau.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={openInNewTab}
              variant="outline"
              icon={IconEye}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Ouvrir dans un nouvel onglet
            </Button>
            <Button
              onClick={downloadPdf}
              variant="outline"
              icon={IconDownload}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              Télécharger le PDF
            </Button>
            <Button
              onClick={resetAndRetry}
              variant="outline"
              icon={IconRefresh}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getPdfSource = () => {
    if (pdfBlob) return pdfBlob;
    if (currentStrategy === 'embed' && embedUrl) return embedUrl;
    return pdfUrl;
  };

  return (
    <div className={`w-full h-full ${className}`} style={{ height }}>
      {/* Contrôles optionnels */}
      {showControls && (
        <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
              📄 {fileName}
            </span>
            {retryCount > 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Mode: {currentStrategy}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={openInNewTab}
              variant="outline"
              size="sm"
              icon={IconEye}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Nouvel onglet
            </Button>

            <Button
              onClick={downloadPdf}
              variant="outline"
              size="sm"
              icon={IconDownload}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              Télécharger
            </Button>

            <Button
              onClick={resetAndRetry}
              variant="outline"
              size="sm"
              icon={IconRefresh}
              className="text-gray-600 border-gray-200 hover:bg-gray-50"
            >
              Actualiser
            </Button>
          </div>
        </div>
      )}

      {/* Zone de visualisation sans conteneur supplémentaire */}
      <div 
        className="w-full bg-gray-200 dark:bg-gray-900 overflow-hidden"
        style={{ 
          height: showControls ? 'calc(100% - 60px)' : '100%'
        }}
      >
        {/* Stratégie principale: embed */}
        {currentStrategy === 'embed' && (
          <embed
            src={`${getPdfSource()}#view=Fit&toolbar=1&navpanes=0&scrollbar=1&zoom=100`}
            type="application/pdf"
            width="100%"
            height="100%"
            className="border-0"
            onError={() => setError(true)}
          />
        )}

        {/* Stratégie fallback: iframe */}
        {currentStrategy === 'iframe' && (
          <iframe
            src={`${getPdfSource()}#view=Fit&toolbar=1&navpanes=0&scrollbar=1&zoom=100`}
            width="100%"
            height="100%"
            title={`Aperçu PDF - ${fileName}`}
            className="border-0"
            sandbox="allow-same-origin allow-scripts"
            allow="fullscreen"
            onError={() => setError(true)}
          />
        )}

        {/* Stratégie blob: utilise l'object URL */}
        {currentStrategy === 'blob' && pdfBlob && (
          <iframe
            src={`${pdfBlob}#view=Fit&toolbar=1&navpanes=0&scrollbar=1&zoom=100`}
            width="100%"
            height="100%"
            title={`Aperçu PDF - ${fileName}`}
            className="border-0"
            allow="fullscreen"
            onError={() => setError(true)}
          />
        )}
      </div>
    </div>
  );
} 