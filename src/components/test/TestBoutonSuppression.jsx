import React from 'react';
import { toast } from 'sonner';
import BoutonSuppressionAffectations from '../planning-equipe/BoutonSuppressionAffectations';

const TestBoutonSuppression = () => {
  const handleAffectationsDeleted = () => {
    toast.success('Test: Callback appelé après suppression');
    console.log('🧪 [TEST] Callback de suppression appelé');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test du Bouton de Suppression</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Bouton de Suppression des Affectations</h2>
          <p className="text-gray-600 mb-4">
            Ce bouton permet de supprimer toutes les affectations du planning équipe et du planning affaire.
          </p>
          
          <div className="flex justify-center py-4">
            <BoutonSuppressionAffectations onAffectationsDeleted={handleAffectationsDeleted} />
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Instructions de test :</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>1. Cliquez sur le bouton rouge</li>
              <li>2. Tapez exactement "SUPPRIMER TOUT" dans le champ</li>
              <li>3. Cliquez sur "Supprimer définitivement"</li>
              <li>4. Vérifiez les toasts et la console</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestBoutonSuppression; 