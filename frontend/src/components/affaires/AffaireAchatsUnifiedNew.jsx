import React from 'react';
import { FileText, Receipt } from 'lucide-react';
import BdcSection from '../modules/bdc';
import FactureAchatSection from '../modules/factures-achats';

/**
 * Composant unifié modernisé utilisant les nouveaux modules
 * Exemple d'intégration des modules BDC et Factures d'achats
 * 
 * ⚠️ IMPORTANT : Ce fichier est un EXEMPLE pour montrer l'utilisation des modules.
 * Les fichiers existants (AffaireAchatsUnified.jsx) continuent de fonctionner !
 */
const AffaireAchatsUnifiedNew = ({ affaire, onUpdate }) => {
  const handleChildDataChanged = () => {
    console.log('🔄 Données mises à jour depuis un module enfant');
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête de section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Gestion des Achats
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez vos bons de commande et factures d'achats pour l'affaire <strong>{affaire?.numero}</strong>
        </p>
      </div>

      {/* Section Gestion des BDC et Factures - Nouvelle structure modulaire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section Bons de Commande - Module réutilisable */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <BdcSection 
            affaireId={affaire?.id} 
            onUpdate={handleChildDataChanged}
            title="Bons de Commande"
            subtitle="Commandes aux fournisseurs"
            showHeader={true}
            collapsible={false}
          />
        </div>
        
        {/* Section Factures d'Achats - Module réutilisable */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <FactureAchatSection 
            affaireId={affaire?.id} 
            onUpdate={handleChildDataChanged}
            title="Factures d'Achats"
            subtitle="Factures fournisseurs"
            showHeader={true}
            collapsible={false}
          />
        </div>
      </div>

      {/* Section d'information sur l'architecture */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📦 Architecture Modulaire
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p>
                ✅ <strong>Modules réutilisables</strong> : BDC et Factures d'achats utilisent la même structure
              </p>
              <p>
                ✅ <strong>Code existant préservé</strong> : Vos composants actuels continuent de fonctionner
              </p>
              <p>
                ✅ <strong>Design identique</strong> : Même UX/UI pour une expérience cohérente
              </p>
              <p>
                ✅ <strong>Maintenance simplifiée</strong> : Modifications dans un seul endroit
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Exemples d'utilisation avec props personnalisées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BDC en mode compact */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <BdcSection 
            affaireId={affaire?.id} 
            onUpdate={handleChildDataChanged}
            title="BDC Compacts"
            subtitle="Version condensée"
            showHeader={true}
            collapsible={true}
            className="max-h-96"
          />
        </div>

        {/* Factures en mode compact */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <FactureAchatSection 
            affaireId={affaire?.id} 
            onUpdate={handleChildDataChanged}
            title="Factures Compactes"
            subtitle="Version condensée"
            showHeader={true}
            collapsible={true}
            className="max-h-96"
          />
        </div>
      </div>

      {/* Guide d'intégration pour les développeurs */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          🚀 Guide d'Intégration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          
          {/* Import des modules */}
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Import des modules :</h4>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-xs">
              <code className="text-gray-700 dark:text-gray-300">
                {`import BdcSection from '@/components/modules/bdc';
import FactureAchatSection from '@/components/modules/factures-achats';`}
              </code>
            </div>
          </div>

          {/* Utilisation */}
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Utilisation :</h4>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-xs">
              <code className="text-gray-700 dark:text-gray-300">
                {`<BdcSection 
  affaireId={123} 
  onUpdate={handleUpdate}
  title="Mes BDC"
  collapsible={true}
/>`}
              </code>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            💡 <strong>Migration progressive :</strong> Vous pouvez migrer composant par composant vers les nouveaux modules, 
            sans casser l'existant. Les anciens composants restent fonctionnels.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AffaireAchatsUnifiedNew; 