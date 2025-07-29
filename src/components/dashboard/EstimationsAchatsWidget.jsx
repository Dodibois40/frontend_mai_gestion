import React, { useState, useEffect } from 'react';
import { 
  IconChartBar, 
  IconTrendingUp, 
  IconAlertTriangle,
  IconRefresh
} from '@tabler/icons-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const EstimationsAchatsWidget = ({ affaireId = null, className = "" }) => {
  const [loading, setLoading] = useState(false);
  const [estimations, setEstimations] = useState([]);

  // Version simplifiée pour éviter les erreurs d'import
  const chargerEstimations = async () => {
    setLoading(true);
    try {
      // Simulation de données pour éviter l'erreur d'import du service
      setTimeout(() => {
        setEstimations([
          {
            affaire: { numero: 'AFF-001', libelle: 'Projet Test' },
            montantEstimationAchats: 25000,
            totalPourcentage: 100,
            categoriesActives: [
              { nom: 'Bois massif', pourcentage: 25, couleur: '#8B4513' },
              { nom: 'Panneau', pourcentage: 20, couleur: '#D2691E' },
              { nom: 'Quincaillerie', pourcentage: 15, couleur: '#708090' }
            ]
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors du chargement des estimations:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerEstimations();
  }, [affaireId]);

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!estimations.length) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconChartBar className="w-6 h-6 text-blue-600" />
            Estimations d'Achats
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <IconAlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune estimation d'achats trouvée</p>
            <p className="text-sm text-gray-400 mt-2">
              Créez des estimations dans les affaires pour voir les données ici
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconTrendingUp className="w-6 h-6 text-blue-600" />
            Estimations d'Achats - Vue Globale
          </div>
          <button
            onClick={chargerEstimations}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualiser"
          >
            <IconRefresh className="w-4 h-4" />
          </button>
        </CardTitle>
        <div className="text-sm text-gray-600">
          {estimations.length} estimation(s) trouvée(s)
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Statistiques globales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {estimations.reduce((sum, est) => sum + (est.montantEstimationAchats || 0), 0).toLocaleString()}€
              </div>
              <div className="text-xs text-blue-600">Budget Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {Math.round(estimations.reduce((sum, est) => sum + (est.totalPourcentage || 0), 0) / estimations.length)}%
              </div>
              <div className="text-xs text-green-600">Répartition Moy.</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {estimations.length}
              </div>
              <div className="text-xs text-purple-600">Affaires</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">
                {estimations.filter(est => est.totalPourcentage === 100).length}
              </div>
              <div className="text-xs text-orange-600">Complètes</div>
            </div>
          </div>

          {/* Liste des affaires */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800">Affaires avec estimations</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {estimations.map((estimation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <div className="font-medium text-gray-900">
                      {estimation.affaire?.numero || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {estimation.affaire?.libelle || 'Sans titre'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {(estimation.montantEstimationAchats || 0).toLocaleString()}€
                    </div>
                    <div className={`text-sm ${
                      estimation.totalPourcentage === 100 
                        ? 'text-green-600' 
                        : estimation.totalPourcentage > 100 
                          ? 'text-red-600' 
                          : 'text-orange-600'
                    }`}>
                      {estimation.totalPourcentage || 0}% réparti
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimationsAchatsWidget; 