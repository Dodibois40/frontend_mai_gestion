import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import BrowserCompat from '../utils/browserCompat.js';

const BrowserDiagnostic = ({ onClose }) => {
  const [diagnostics, setDiagnostics] = useState(null);
  const [apiTest, setApiTest] = useState({ status: 'pending', message: '' });

  useEffect(() => {
    // Récupérer les informations navigateur
    const browserInfo = BrowserCompat.getBrowserInfo();
    setDiagnostics(browserInfo);

    // Test de l'API
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setApiTest({ 
          status: 'success', 
          message: 'Connexion API réussie' 
        });
      } else {
        setApiTest({ 
          status: 'error', 
          message: `Erreur API: ${response.status} ${response.statusText}` 
        });
      }
    } catch (error) {
      setApiTest({ 
        status: 'error', 
        message: `Erreur de connexion: ${error.message}` 
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getCompatibilityStatus = () => {
    if (!diagnostics) return [];

    const checks = [
      {
        name: 'Navigateur supporté',
        status: diagnostics.isChrome || diagnostics.isFirefox ? 'success' : 'warning',
        message: diagnostics.isChrome ? 'Chrome détecté' : 
                diagnostics.isFirefox ? 'Firefox détecté' : 
                'Navigateur non optimisé'
      },
      {
        name: 'Cookies activés',
        status: diagnostics.cookiesEnabled ? 'success' : 'error',
        message: diagnostics.cookiesEnabled ? 'Cookies activés' : 'Cookies désactivés'
      },
      {
        name: 'LocalStorage disponible',
        status: diagnostics.supportsLocalStorage ? 'success' : 'error',
        message: diagnostics.supportsLocalStorage ? 'LocalStorage disponible' : 'LocalStorage non disponible'
      },
      {
        name: 'Fetch API disponible',
        status: diagnostics.supportsFetch ? 'success' : 'warning',
        message: diagnostics.supportsFetch ? 'Fetch API disponible' : 'Fetch API non disponible'
      },
      {
        name: 'Credentials supportés',
        status: diagnostics.supportsCredentials ? 'success' : 'error',
        message: diagnostics.supportsCredentials ? 'Credentials supportés' : 'Credentials non supportés'
      }
    ];

    return checks;
  };

  const clearAllData = () => {
    // Nettoyer toutes les données stockées
    BrowserCompat.removeAuthToken();
    BrowserCompat.removeSecureStorage('user_data');
    localStorage.clear();
    sessionStorage.clear();
    
    // Nettoyer les cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });

    alert('Toutes les données ont été supprimées. Rechargez la page.');
  };

  if (!diagnostics) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Diagnostic en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Diagnostic Navigateur</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Informations navigateur */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Informations Navigateur</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>User Agent:</strong> {diagnostics.userAgent}</p>
            <p><strong>Vendor:</strong> {diagnostics.vendor}</p>
            <p><strong>Type:</strong> {
              diagnostics.isChrome ? 'Chrome' :
              diagnostics.isFirefox ? 'Firefox' :
              diagnostics.isSafari ? 'Safari' : 'Autre'
            }</p>
          </div>
        </div>

        {/* Tests de compatibilité */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Tests de Compatibilité</h3>
          <div className="space-y-3">
            {getCompatibilityStatus().map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{check.name}</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(check.status)}
                  <span className={`text-sm ${
                    check.status === 'success' ? 'text-green-600' :
                    check.status === 'error' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {check.message}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test API */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Test de Connexion API</h3>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Connexion Backend</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(apiTest.status)}
              <span className={`text-sm ${
                apiTest.status === 'success' ? 'text-green-600' :
                apiTest.status === 'error' ? 'text-red-600' :
                'text-blue-600'
              }`}>
                {apiTest.message || 'Test en cours...'}
              </span>
            </div>
          </div>
        </div>

        {/* Recommandations */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Recommandations</h3>
          <div className="space-y-2 text-sm">
            {!diagnostics.cookiesEnabled && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">⚠️ Activez les cookies dans votre navigateur</p>
              </div>
            )}
            {!diagnostics.supportsLocalStorage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">⚠️ LocalStorage non disponible - mode privé ?</p>
              </div>
            )}
            {diagnostics.isChrome && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">💡 Chrome détecté - Configuration optimisée activée</p>
              </div>
            )}
            {diagnostics.isFirefox && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800">🦊 Firefox détecté - Configuration optimisée activée</p>
              </div>
            )}
            {!diagnostics.isChrome && !diagnostics.isFirefox && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">⚠️ Navigateur non optimisé - Utilisez Chrome ou Firefox pour une meilleure expérience</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={testApiConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retester API
          </button>
          <button
            onClick={clearAllData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Nettoyer Données
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrowserDiagnostic; 