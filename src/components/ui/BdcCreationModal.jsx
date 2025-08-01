import React from 'react';
import { X, FileText, Send } from 'lucide-react';

const BdcCreationModal = ({ isOpen, onClose, onCreateDemande }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Créer un bon de commande
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Explication du processus */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">
            🔄 Processus MAI GESTION
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>1.</strong> Créer une demande avec articles détaillés</p>
            <p><strong>2.</strong> Générer et envoyer le BDC au fournisseur</p>
            <p><strong>3.</strong> Recevoir le retour avec prix et référence fournisseur</p>
            <p><strong>4.</strong> Pointer sur les factures reçues</p>
          </div>
        </div>

        {/* Bouton principal */}
        <div className="space-y-4">
          <button
            onClick={onCreateDemande}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-6 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-4"
          >
            <div className="bg-white/20 p-2 rounded-full">
              <Send size={24} />
            </div>
            <div className="text-left">
              <div className="text-lg">Créer une demande de BDC</div>
              <div className="text-sm opacity-90">pour le fournisseur</div>
            </div>
          </button>

          {/* Info complémentaire */}
          <div className="text-center text-gray-500 text-sm">
            💡 Le numéro BDC sera généré automatiquement<br/>
            Format : BDC-2025-XXX
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default BdcCreationModal; 