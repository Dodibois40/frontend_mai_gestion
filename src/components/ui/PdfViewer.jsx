import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Composant de visualisation PDF avec plusieurs options d'affichage
 */
const PdfViewer = ({ url, filename, onClose }) => {
  const [viewMode, setViewMode] = useState('iframe'); // 'iframe', 'embed', 'external', 'error'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [proxyUrl, setProxyUrl] = useState(null);

  // Pour Firebase Storage, on évite le test HEAD (CORS) et on affiche directement
  useEffect(() => {
    if (url) {
      console.log('🔗 URL PDF reçue:', url);
      
      // Détecter les URLs Firebase Storage et les remplacer par le proxy
      if (url.includes('firebasestorage.googleapis.com')) {
        console.log('🔥 URL Firebase détectée, REMPLACEMENT par le proxy...');
        
        // Extraire l'ID du BDC depuis l'URL Firebase ou utiliser une approche alternative
        // URL Firebase: .../bdc%2F[ID]%2F...
        const bdcIdMatch = url.match(/bdc%2F([a-f0-9-]+)%2F/);
        if (bdcIdMatch) {
          const bdcId = bdcIdMatch[1];
          console.log('🔍 ID BDC extrait:', bdcId);
          // Utiliser l'URL de base dynamique
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          const proxyUrl = `${baseUrl}/api/bdc/${bdcId}/pdf-proxy`;
          console.log('🔄 URL proxy générée:', proxyUrl);
          setProxyUrl(proxyUrl);
        } else {
          console.warn('⚠️ Impossible d\'extraire l\'ID BDC depuis l\'URL Firebase');
        }
        
        setLoading(false);
        setError(null);
      } else {
        // Pour les autres URLs, on peut tester
        testUrl();
      }
    }
  }, [url, retryCount]);

  // Tester l'accessibilité de l'URL (seulement pour non-Firebase)
  const testUrl = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer le token d'authentification
      const token = localStorage.getItem('auth_token');
      
      // Test simple de l'URL avec authentification
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/pdf'
        }
        // Retirer credentials: 'include' pour éviter le conflit CORS
      });
      
      if (!response.ok) {
        throw new Error(`URL non accessible (${response.status})`);
      }
      
      console.log('✅ URL PDF accessible:', url);
      setLoading(false);
    } catch (err) {
      console.error('❌ Erreur URL PDF:', err);
      setError(`URL non accessible: ${err.message}`);
      setViewMode('error');
      setLoading(false);
    }
  };

  // Gestion des erreurs d'iframe
  const handleIframeError = () => {
    console.error('❌ Erreur iframe PDF');
    if (viewMode === 'iframe') {
      console.log('🔄 Basculement vers embed...');
      setViewMode('embed');
    } else if (viewMode === 'embed') {
      console.log('❌ Échec embed, affichage erreur');
    setError('Impossible d\'afficher le PDF dans cette fenêtre');
      setViewMode('error');
    }
  };

  // Gestion du rechargement iframe
  const handleIframeLoad = (e) => {
    console.log('✅ Iframe chargée');
    setLoading(false);
    
    // Vérifier si l'iframe a pu charger le contenu
    try {
      const iframe = e.target;
      // Test basique pour voir si l'iframe a du contenu
      setTimeout(() => {
        try {
          if (iframe.contentDocument === null && iframe.contentWindow === null) {
            console.warn('⚠️ Iframe sans contenu détecté');
            handleIframeError();
          }
        } catch (err) {
          // Erreur normale due aux restrictions CORS
          console.log('🔒 CORS restriction détectée (normal)');
        }
      }, 2000);
    } catch (err) {
      console.warn('⚠️ Erreur test iframe:', err);
    }
  };

  // Ouvrir dans un nouvel onglet
  const openExternal = () => {
    window.open(url, '_blank');
  };

  // Télécharger le fichier
  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = proxyUrl || url;
    link.download = filename || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Réessayer
  const retry = () => {
    setRetryCount(prev => prev + 1);
    setViewMode('iframe');
    setError(null);
    setLoading(true);
  };

  // Rendu du contenu en fonction du mode
  const renderPdfContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement du PDF...</p>
          <p className="text-sm text-gray-500">Mode: {viewMode}</p>
        </div>
      );
    }

    if (viewMode === 'error' || error) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <AlertCircle className="w-16 h-16 text-yellow-500" />
          <div className="text-center">
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Aperçu non disponible
            </h4>
            <p className="text-gray-600 mb-4">
              {error || 'Le PDF ne peut pas être affiché dans cette fenêtre'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={retry}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </button>
              <button
                onClick={openExternal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ouvrir dans un nouvel onglet
              </button>
              <button
                onClick={downloadFile}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger le PDF
              </button>
            </div>
          </div>
        </div>
      );
    }

    // URL avec paramètres optimisés pour l'affichage
    // Utiliser l'URL proxy si disponible, sinon l'URL originale
    const effectiveUrl = proxyUrl || url;
    const pdfUrl = proxyUrl ? proxyUrl : `${url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH&zoom=100`;

    if (viewMode === 'embed') {
      return (
        <div className="h-full bg-gray-100">
          <embed
            src={pdfUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            className="border-0"
            onError={handleIframeError}
            onLoad={() => {
              console.log('✅ Embed chargé');
              setLoading(false);
            }}
          />
        </div>
      );
    }

    // Mode iframe par défaut
    return (
      <div className="h-full">
        <iframe
          src={pdfUrl}
          className="w-full h-full border rounded"
          title="Aperçu PDF"
          allow="fullscreen"
          onError={handleIframeError}
          onLoad={handleIframeLoad}
          style={{ 
            minHeight: '500px',
            backgroundColor: '#f5f5f5'
          }}
        />
        
        {/* Message d'aide en bas */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          Si l'aperçu ne s'affiche pas, utilisez les boutons ci-dessus pour ouvrir ou télécharger le PDF
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 h-5/6 flex flex-col max-w-6xl">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
          <h3 className="text-lg font-medium">Aperçu PDF</h3>
            {filename && (
              <span className="text-sm text-gray-500 truncate max-w-xs">
                {filename}
              </span>
            )}
            {retryCount > 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Tentative {retryCount + 1}
              </span>
            )}
            {url && url.includes('firebasestorage.googleapis.com') && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                🔥 Firebase
              </span>
            )}
            {proxyUrl && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                🔄 Proxy
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadFile}
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
              title="Télécharger"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={openExternal}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            <button
              onClick={retry}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Réessayer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 p-4">
          {renderPdfContent()}
        </div>
      </div>
    </div>
  );
};

export default PdfViewer; 