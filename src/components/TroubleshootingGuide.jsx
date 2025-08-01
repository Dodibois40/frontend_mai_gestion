import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, RefreshCw, Download } from 'lucide-react';
import BrowserCompat from '../utils/browserCompat.js';
import DebugHelper from '../utils/debugHelper.js';

const TroubleshootingGuide = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('problems');
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);

  const runDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const results = await DebugHelper.runFullDiagnostic();
      setDiagnosticResults(results);
    } catch (error) {
      console.error('Erreur diagnostic:', error);
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const commonProblems = [
    {
      title: "L'application ne fonctionne que sur Firefox, pas sur Chrome",
      symptoms: [
        "Erreurs de connexion sur Chrome",
        "Problèmes d'authentification",
        "Requêtes bloquées par CORS"
      ],
      solutions: [
        "Vider le cache et les cookies de Chrome",
        "Désactiver les extensions qui bloquent les requêtes",
        "Vérifier que les cookies sont activés",
        "Utiliser le mode navigation privée pour tester",
        "Mettre à jour Chrome vers la dernière version"
      ]
    },
    {
      title: "Impossible d'enregistrer des données",
      symptoms: [
        "Erreur 409 lors de la création d'utilisateurs",
        "Formulaires qui ne se soumettent pas",
        "Messages d'erreur 'Email déjà utilisé'"
      ],
      solutions: [
        "Vérifier que l'email n'existe pas déjà",
        "Contrôler la connexion internet",
        "Rafraîchir la page et réessayer",
        "Vider le cache du navigateur",
        "Vérifier les logs de la console (F12)"
      ]
    },
    {
      title: "Problèmes d'authentification",
      symptoms: [
        "Déconnexion automatique",
        "Token expiré",
        "Erreurs 401 Unauthorized"
      ],
      solutions: [
        "Se reconnecter",
        "Vider les données de l'application",
        "Vérifier que les cookies sont activés",
        "Contrôler la date/heure du système",
        "Utiliser un autre navigateur"
      ]
    },
    {
      title: "Interface qui ne se met pas à jour",
      symptoms: [
        "Données obsolètes affichées",
        "Besoin de rafraîchir manuellement",
        "Listes qui ne se mettent pas à jour"
      ],
      solutions: [
        "Rafraîchir la page (F5)",
        "Vider le cache du navigateur",
        "Fermer et rouvrir l'onglet",
        "Redémarrer le navigateur",
        "Vérifier la connexion réseau"
      ]
    }
  ];

  const quickFixes = [
    {
      title: "Vider le cache navigateur",
      description: "Supprime les données temporaires qui peuvent causer des conflits",
      action: () => {
        if (confirm('Cela va supprimer toutes les données de l\'application. Continuer ?')) {
          BrowserCompat.removeAuthToken();
          BrowserCompat.removeSecureStorage('user_data');
          localStorage.clear();
          sessionStorage.clear();
          location.reload();
        }
      }
    },
    {
      title: "Redémarrer la session",
      description: "Déconnecte et reconnecte l'utilisateur",
      action: () => {
        BrowserCompat.removeAuthToken();
        BrowserCompat.removeSecureStorage('user_data');
        window.location.href = '/auth/login';
      }
    },
    {
      title: "Télécharger les données de debug",
      description: "Exporte les informations techniques pour le support",
      action: () => {
        DebugHelper.exportDebugData();
      }
    },
    {
      title: "Nettoyer les erreurs stockées",
      description: "Supprime l'historique des erreurs",
      action: () => {
        DebugHelper.clearStoredErrors();
        alert('Erreurs supprimées');
      }
    }
  ];

  const browserSpecificTips = {
    chrome: [
      "Désactiver les extensions qui bloquent les requêtes",
      "Vérifier les paramètres de confidentialité",
      "Autoriser les cookies tiers si nécessaire",
      "Utiliser le mode navigation privée pour tester"
    ],
    firefox: [
      "Vérifier les paramètres de protection contre le pistage",
      "Autoriser les cookies pour le site",
      "Désactiver temporairement les bloqueurs de contenu",
      "Vider le cache et les cookies"
    ],
    other: [
      "Utiliser Chrome ou Firefox pour une meilleure compatibilité",
      "Mettre à jour le navigateur",
      "Vérifier que JavaScript est activé",
      "Autoriser les cookies et le stockage local"
    ]
  };

  const getBrowserTips = () => {
    if (BrowserCompat.isChrome()) return browserSpecificTips.chrome;
    if (BrowserCompat.isFirefox()) return browserSpecificTips.firefox;
    return browserSpecificTips.other;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Guide de Résolution des Problèmes</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('problems')}
            className={`pb-2 px-1 ${activeTab === 'problems' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500'}`}
          >
            Problèmes Courants
          </button>
          <button
            onClick={() => setActiveTab('fixes')}
            className={`pb-2 px-1 ${activeTab === 'fixes' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500'}`}
          >
            Solutions Rapides
          </button>
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`pb-2 px-1 ${activeTab === 'diagnostic' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500'}`}
          >
            Diagnostic
          </button>
          <button
            onClick={() => setActiveTab('browser')}
            className={`pb-2 px-1 ${activeTab === 'browser' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500'}`}
          >
            Conseils Navigateur
          </button>
        </div>

        {/* Content */}
        {activeTab === 'problems' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Problèmes Fréquents et Solutions</h3>
            {commonProblems.map((problem, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold text-red-600 mb-2">{problem.title}</h4>
                
                <div className="mb-3">
                  <h5 className="font-medium text-gray-700 mb-1">Symptômes :</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {problem.symptoms.map((symptom, i) => (
                      <li key={i}>{symptom}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-1">Solutions :</h5>
                  <ol className="list-decimal list-inside text-sm text-gray-600">
                    {problem.solutions.map((solution, i) => (
                      <li key={i}>{solution}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'fixes' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Solutions Rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickFixes.map((fix, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{fix.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{fix.description}</p>
                  <button
                    onClick={fix.action}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Appliquer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'diagnostic' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Diagnostic Technique</h3>
              <button
                onClick={runDiagnostic}
                disabled={isRunningDiagnostic}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRunningDiagnostic ? 'animate-spin' : ''}`} />
                <span>Lancer Diagnostic</span>
              </button>
            </div>

            {diagnosticResults && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Informations Navigateur</h4>
                  <p><strong>Type:</strong> {
                    diagnosticResults.browser.isChrome ? 'Chrome' :
                    diagnosticResults.browser.isFirefox ? 'Firefox' : 'Autre'
                  }</p>
                  <p><strong>Cookies:</strong> {diagnosticResults.browser.cookiesEnabled ? '✅ Activés' : '❌ Désactivés'}</p>
                  <p><strong>LocalStorage:</strong> {diagnosticResults.browser.supportsLocalStorage ? '✅ Supporté' : '❌ Non supporté'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Tests de Connectivité</h4>
                  {diagnosticResults.connectivity.map((test, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-1">
                      {test.status === 'success' ? 
                        <CheckCircle className="w-4 h-4 text-green-500" /> :
                        test.status === 'warning' ?
                        <AlertTriangle className="w-4 h-4 text-yellow-500" /> :
                        <XCircle className="w-4 h-4 text-red-500" />
                      }
                      <span className="text-sm">{test.name}: {test.details}</span>
                    </div>
                  ))}
                </div>

                {diagnosticResults.errors.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-red-800">Erreurs Récentes ({diagnosticResults.errors.length})</h4>
                    <div className="max-h-32 overflow-y-auto">
                      {diagnosticResults.errors.slice(-5).map((error, index) => (
                        <div key={index} className="text-sm text-red-700 mb-1">
                          <strong>{error.context}:</strong> {error.error.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'browser' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Conseils pour {BrowserCompat.isChrome() ? 'Chrome' : BrowserCompat.isFirefox() ? 'Firefox' : 'votre navigateur'}
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="space-y-2">
                {getBrowserTips().map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {!BrowserCompat.isChrome() && !BrowserCompat.isFirefox() && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Navigateur non optimisé</h4>
                <p className="text-sm text-yellow-700">
                  Pour une meilleure expérience, nous recommandons d'utiliser Chrome ou Firefox.
                  Votre navigateur actuel peut présenter des incompatibilités.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t flex justify-between">
          <button
            onClick={() => DebugHelper.exportDebugData()}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            <span>Exporter Debug</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TroubleshootingGuide; 