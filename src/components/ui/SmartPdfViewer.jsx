import React, { useState, useEffect } from 'react';
import { 
  IconDownload, 
  IconEye, 
  IconExternalLink,
  IconLoader,
  IconAlertCircle,
  IconDeviceDesktop,
  IconBrandGoogle,
  IconBrandWindows,
  IconRefresh
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import PdfViewerProfessional from './PdfViewerProfessional';
import PdfManagerAlternative from './PdfManagerAlternative';
import api from '@/services/api';

const SmartPdfViewer = ({ 
  devisId,
  fileName,
  onClose = null,
  height = 600,
  className = ''
}) => {
  const [pdfInfo, setPdfInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('smart');
  const [userAgent] = useState(navigator.userAgent);

  // Chargement des informations PDF
  useEffect(() => {
    if (devisId) {
      fetchPdfInfo();
    }
  }, [devisId]);

  const fetchPdfInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/api/devis-cloud/${devisId}/smart-preview`, {
        params: { userAgent }
      });
      
      const result = response.data;
      setPdfInfo(result.data);
      
      // Sélectionner automatiquement le meilleur onglet
      if (result.data.recommendedViewer === 'native') {
        setActiveTab('pdfjs');
      } else if (result.data.recommendedViewer === 'google-drive') {
        setActiveTab('google');
      } else if (result.data.recommendedViewer === 'microsoft-office') {
        setActiveTab('microsoft');
      } else {
        setActiveTab('download');
      }

    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    
    // Analytics/tracking pour comprendre les préférences utilisateur
    console.log(`PDF Viewer: Utilisateur a choisi ${value} pour ${fileName}`);
  };

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <IconLoader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Chargement des options d'affichage...</p>
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
            <Button onClick={fetchPdfInfo} variant="outline">
              <IconRefresh className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pdfInfo) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {pdfInfo.fileName}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline">
                  {pdfInfo.browserInfo.isChrome && 'Chrome'}
                  {pdfInfo.browserInfo.isFirefox && 'Firefox'}
                  {pdfInfo.browserInfo.isSafari && 'Safari'}
                  {pdfInfo.browserInfo.isEdge && 'Edge'}
                  {!pdfInfo.browserInfo.isChrome && !pdfInfo.browserInfo.isFirefox && 
                   !pdfInfo.browserInfo.isSafari && !pdfInfo.browserInfo.isEdge && 'Autre'}
                </Badge>
                <Badge variant="secondary">
                  Recommandé: {pdfInfo.recommendedViewer}
                </Badge>
              </div>
            </div>
            {onClose && (
              <Button onClick={onClose} variant="outline" size="sm">
                Fermer
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pdfjs" className="flex items-center space-x-1">
                <IconDeviceDesktop className="h-4 w-4" />
                <span className="hidden sm:inline">PDF.js</span>
              </TabsTrigger>
              <TabsTrigger value="google" className="flex items-center space-x-1">
                <IconBrandGoogle className="h-4 w-4" />
                <span className="hidden sm:inline">Google</span>
              </TabsTrigger>
              <TabsTrigger value="microsoft" className="flex items-center space-x-1">
                <IconBrandWindows className="h-4 w-4" />
                <span className="hidden sm:inline">Microsoft</span>
              </TabsTrigger>
              <TabsTrigger value="download" className="flex items-center space-x-1">
                <IconDownload className="h-4 w-4" />
                <span className="hidden sm:inline">Télécharger</span>
              </TabsTrigger>
            </TabsList>

            {/* Onglet PDF.js (Rendu local) */}
            <TabsContent value="pdfjs" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                  <IconDeviceDesktop className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-700">
                    Affichage local avec PDF.js - Meilleure performance
                  </span>
                </div>
                <PdfViewerProfessional 
                  pdfUrl={pdfInfo.viewers.download}
                  fileName={pdfInfo.fileName}
                  height={height}
                />
              </div>
            </TabsContent>

            {/* Onglet Google Drive */}
            <TabsContent value="google" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <IconBrandGoogle className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Affichage via Google Drive Viewer - Nécessite une connexion internet
                  </span>
                </div>
                <div 
                  className="w-full bg-gray-100 rounded-lg overflow-hidden"
                  style={{ height: `${height}px` }}
                >
                  <iframe
                    src={pdfInfo.viewers['google-drive']}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title={`Google Drive Preview - ${pdfInfo.fileName}`}
                    className="w-full h-full"
                    allow="fullscreen"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Onglet Microsoft Office */}
            <TabsContent value="microsoft" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <IconBrandWindows className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Affichage via Microsoft Office Online - Alternative fiable
                  </span>
                </div>
                <div 
                  className="w-full bg-gray-100 rounded-lg overflow-hidden"
                  style={{ height: `${height}px` }}
                >
                  <iframe
                    src={pdfInfo.viewers['microsoft-office']}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title={`Microsoft Office Preview - ${pdfInfo.fileName}`}
                    className="w-full h-full"
                    allow="fullscreen"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Onglet Téléchargement */}
            <TabsContent value="download" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                  <IconDownload className="h-5 w-5 text-orange-600" />
                  <span className="text-sm text-orange-700">
                    Téléchargement direct - Solution universelle
                  </span>
                </div>
                <PdfManagerAlternative 
                  pdfUrl={pdfInfo.viewers.download}
                  fileName={pdfInfo.fileName}
                  className="max-w-none"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions rapides */}
          <div className="mt-6 flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
            <Button
              onClick={() => window.open(pdfInfo.viewers.download, '_blank')}
              variant="outline"
              size="sm"
            >
              <IconExternalLink className="h-4 w-4 mr-2" />
              Ouvrir dans un nouvel onglet
            </Button>
            
            <Button
              onClick={() => {
                const link = document.createElement('a');
                link.href = pdfInfo.viewers.download;
                link.download = pdfInfo.fileName;
                link.click();
              }}
              variant="outline"
              size="sm"
            >
              <IconDownload className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartPdfViewer; 