import React from 'react';
import { 
  IconCalculator, 
  IconSparkles, 
  IconTarget
} from '@tabler/icons-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Cartouche Principal - Design Apple avec effet brillance
 * Header élégant pour l'onglet estimation
 */
const EstimationCartouche = ({ affaire, alertes = [], onEstimationChange }) => {
  
  return (
    <Card className="estimation-cartouche bg-white border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="relative p-6">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            {/* 🚀 Section principale */}
            <div className="flex items-center gap-4">
              {/* Icône principale Apple style */}
              <div className="p-3 bg-blue-100 rounded-xl">
                <IconCalculator className="w-8 h-8 text-blue-600" />
              </div>
              
              {/* Textes principaux - Style Apple épuré */}
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900 mb-1">
                  Estimation Intelligente
                </CardTitle>
                <p className="text-gray-600 flex items-center gap-2">
                  <IconSparkles className="w-4 h-4" />
                  Pré-remplissage automatique avec liaison temps réel
                </p>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <IconTarget className="w-3 h-3" />
                    Synchronisé avec le planning équipe
                  </span>
                  <span>•</span>
                  <span>Calculs basés sur standards métier</span>
                </div>
              </div>
            </div>
            
            {/* 📊 Section droite - Badge affaire Apple style */}
            <div className="flex items-center gap-3">
              {/* Badge affaire épuré */}
              <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <div className="text-center">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Affaire</div>
                  <div className="text-lg font-semibold text-gray-900">{affaire.numero}</div>
                  <div className="text-xs text-gray-600">{affaire.client}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

    </Card>
  );
};

export default EstimationCartouche; 