import React, { useState } from 'react';
import FirebaseTest from '../../components/test/FirebaseTest';
import PdfUploadFirebase from '../../components/ui/PdfUploadFirebase';
import AffaireBdcSectionFirebase from '../../components/affaires/AffaireBdcSectionFirebase';

const FirebaseTestPage = () => {
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: '🔥 Test Firebase Basic', component: FirebaseTest },
    { id: 'upload', label: '📤 Upload Component', component: () => (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Test Composant Upload PDF</h2>
        <PdfUploadFirebase
          onUploadSuccess={(url, metadata) => {
            console.log('Upload réussi:', { url, metadata });
            alert(`Upload réussi ! URL: ${url}`);
          }}
          onUploadError={(error) => {
            console.error('Erreur upload:', error);
            alert(`Erreur: ${error.message}`);
          }}
        />
      </div>
    )},
    { id: 'bdc', label: '📋 Section BDC Firebase', component: () => (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Test Section BDC Firebase</h2>
        <AffaireBdcSectionFirebase 
          affaireId="test-affaire-123"
          onBdcUpdate={(bdcData) => {
            console.log('BDC mis à jour:', bdcData);
          }}
        />
      </div>
    )}
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || FirebaseTest;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔥 Firebase Storage - Tests & Intégration
          </h1>
          <p className="text-gray-600">
            Tests complets de l'intégration Firebase pour les PDFs des BDC
          </p>
        </div>

        {/* Onglets */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 justify-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu de l'onglet actif */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <ActiveComponent />
        </div>

        {/* Instructions globales */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            📋 Instructions de configuration Firebase
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">1. Console Firebase</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Aller sur console.firebase.google.com</li>
                <li>• Sélectionner le projet "entreprise-organiser"</li>
                <li>• Activer le plan Blaze (pay-as-you-go)</li>
                <li>• Aller dans Storage → Commencer</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">2. Configuration Storage</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Choisir la région europe-west1</li>
                <li>• Configurer les règles en mode test</li>
                <li>• Tester l'upload avec les composants</li>
                <li>• Vérifier les URLs et prévisualisations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Statut de configuration */}
        <div className="mt-6 bg-yellow-50 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">⚠️ Statut actuel</h4>
          <p className="text-sm text-yellow-700">
            Configuration Firebase en cours. Assurez-vous d'avoir configuré Firebase Storage 
            et activé le plan Blaze avant de tester les uploads.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTestPage; 