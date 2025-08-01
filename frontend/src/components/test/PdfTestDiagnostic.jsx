import React, { useState } from 'react';
import { AlertCircle, CheckCircle, ExternalLink, Download, RefreshCw } from 'lucide-react';

const PdfTestDiagnostic = () => {
  const [testUrl, setTestUrl] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  // URLs de test prédéfinies
  const predefinedTests = [
    {
      name: 'PDF Test public W3C',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: 'Test avec un PDF public simple'
    },
    {
      name: 'PDF Test simple Mozilla',  
      url: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
      description: 'Test avec PDF.js de Mozilla'
    }
  ];

  // Tester une URL
  const testPdfUrl = async (name, url, description = '') => {
    const startTime = Date.now();
    const result = {
      name,
      url,
      description,
      timestamp: new Date().toLocaleTimeString(),
      status: 'testing',
      details: [],
      duration: 0
    };

    try {
      // Test 1: Accessibilité de l'URL
      result.details.push('🔍 Test d\'accessibilité de l\'URL...');
      
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors'
      });
      
      result.details.push(`✅ URL accessible (${response.status})`);
      result.details.push(`📄 Content-Type: ${response.headers.get('content-type') || 'Non spécifié'}`);
      result.details.push(`📏 Content-Length: ${response.headers.get('content-length') || 'Non spécifié'}`);
      
      // Test 2: CORS
      const corsHeaders = response.headers.get('access-control-allow-origin');
      if (corsHeaders) {
        result.details.push(`🌐 CORS autorisé: ${corsHeaders}`);
      } else {
        result.details.push(`⚠️ Pas d'en-têtes CORS détectés`);
      }
      
      // Test 3: Type de contenu
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/pdf')) {
        result.details.push(`✅ Type PDF confirmé`);
      } else {
        result.details.push(`⚠️ Type PDF non confirmé: ${contentType}`);
      }
      
      result.status = 'success';
      result.details.push(`🎉 Test réussi!`);
      
    } catch (error) {
      result.status = 'error';
      result.details.push(`❌ Erreur: ${error.message}`);
      
      if (error.message.includes('CORS')) {
        result.details.push(`🔒 Problème CORS détecté`);
      }
      if (error.message.includes('Failed to fetch')) {
        result.details.push(`🌐 Problème de réseau ou d'accessibilité`);
      }
    }
    
    result.duration = Date.now() - startTime;
    return result;
  };

  // Lancer les tests prédéfinis
  const runPredefinedTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    for (const test of predefinedTests) {
      const result = await testPdfUrl(test.name, test.url, test.description);
      setTestResults(prev => [...prev, result]);
    }
    
    setTesting(false);
  };

  // Tester une URL personnalisée
  const testCustomUrl = async () => {
    if (!testUrl.trim()) return;
    
    setTesting(true);
    const result = await testPdfUrl('Test personnalisé', testUrl.trim());
    setTestResults(prev => [...prev, result]);
    setTesting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          🔬 Diagnostic PDF - Test d'URL
        </h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">🎯 Objectif</h3>
          <p className="text-blue-700 text-sm">
            Ce composant teste l'accessibilité des URLs PDF et diagnostique les problèmes d'affichage.
            Il vérifie la connectivité, les en-têtes CORS, le type de contenu, etc.
          </p>
        </div>

        {/* Section de test personnalisé */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">🧪 Test d'URL personnalisée</h3>
          <div className="flex gap-2">
            <input
              type="url"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://example.com/mon-pdf.pdf"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={testCustomUrl}
              disabled={testing || !testUrl.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {testing ? '⏳' : '🧪'} Tester
            </button>
          </div>
        </div>

        {/* Section de tests prédéfinis */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">🎲 Tests prédéfinis</h3>
          <button
            onClick={runPredefinedTests}
            disabled={testing}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {testing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Tests en cours...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Lancer les tests prédéfinis
              </>
            )}
          </button>
        </div>

        {/* Résultats des tests */}
        {testResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">📋 Résultats des tests</h3>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : result.status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {result.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                      {result.status === 'testing' && <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />}
                      
                      <h4 className="font-semibold text-gray-800">{result.name}</h4>
                      <span className="text-xs text-gray-500">
                        {result.timestamp} • {result.duration}ms
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(result.url, '_blank')}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Ouvrir dans un nouvel onglet"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {result.description && (
                    <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                  )}
                  
                  <div className="text-sm font-mono text-gray-700 bg-white rounded p-2 border">
                    <div className="font-semibold mb-1">URL: {result.url}</div>
                    {result.details.map((detail, i) => (
                      <div key={i} className="py-0.5">{detail}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">💡 Instructions d'utilisation</h4>
          <ol className="text-sm text-gray-700 space-y-1">
            <li>1. 🧪 Testez d'abord les URLs prédéfinies pour vérifier le fonctionnement</li>
            <li>2. 🔗 Copiez l'URL Firebase de votre PDF problématique</li>
            <li>3. 📋 Collez-la dans le champ de test personnalisé</li>
            <li>4. 🔍 Analysez les résultats pour identifier le problème</li>
            <li>5. 🛠️ Utilisez les informations pour corriger le problème</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PdfTestDiagnostic; 