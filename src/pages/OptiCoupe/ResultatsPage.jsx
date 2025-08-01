import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResultatsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // Données simulées pour démonstration
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setResults([
        {
          id: 1,
          projectName: 'Cuisine moderne',
          strategy: 'WASTE_MINIMIZE',
          efficiency: 87.5,
          panelsUsed: 3,
          totalCost: 189.45,
          cuttingLength: 24.8,
          wastePercentage: 12.5,
          date: '2025-01-15T10:30:00',
          status: 'completed'
        },
        {
          id: 2,
          projectName: 'Placards bureau',
          strategy: 'LENGTH_FIRST',
          efficiency: 91.2,
          panelsUsed: 2,
          totalCost: 98.20,
          cuttingLength: 18.4,
          wastePercentage: 8.8,
          date: '2025-01-12T14:15:00',
          status: 'completed'
        },
        {
          id: 3,
          projectName: 'Bibliothèque salon',
          strategy: 'GRAIN_RESPECT',
          efficiency: 84.3,
          panelsUsed: 4,
          totalCost: 254.80,
          cuttingLength: 31.2,
          wastePercentage: 15.7,
          date: '2025-01-10T09:45:00',
          status: 'in_progress'
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const getStrategyLabel = (strategy) => {
    const strategies = {
      'LENGTH_FIRST': 'Priorité Longueur',
      'WIDTH_FIRST': 'Priorité Largeur',
      'GRAIN_RESPECT': 'Respect du Fil',
      'WASTE_MINIMIZE': 'Minimiser les Chutes'
    };
    return strategies[strategy] || strategy;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'failed': return 'Échec';
      default: return status;
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 80) return 'text-blue-600';
    if (efficiency >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              📊 Résultats d'Optimisation
            </h1>
            <p className="text-gray-600">
              Consultez et analysez vos résultats d'optimisation
            </p>
          </div>
          <button
            onClick={() => navigate('/opti-coupe')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Retour au tableau de bord
          </button>
        </div>
      </div>

      {/* Filtres et actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
            <option value="">Tous les projets</option>
            <option value="cuisine">Cuisine moderne</option>
            <option value="bureau">Placards bureau</option>
            <option value="salon">Bibliothèque salon</option>
          </select>
          
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
            <option value="">Toutes les stratégies</option>
            <option value="WASTE_MINIMIZE">Minimiser les chutes</option>
            <option value="LENGTH_FIRST">Priorité longueur</option>
            <option value="GRAIN_RESPECT">Respect du fil</option>
          </select>

          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            📈 Statistiques
          </button>
          
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            📋 Export Excel
          </button>
        </div>

        {/* Liste des résultats */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Chargement des résultats...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stratégie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficacité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coût
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.projectName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.panelsUsed} panneau{result.panelsUsed > 1 ? 'x' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getStrategyLabel(result.strategy)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getEfficiencyColor(result.efficiency)}`}>
                        {result.efficiency}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.wastePercentage}% chutes
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.totalCost.toFixed(2)} €
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.cuttingLength}m coupe
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(result.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(result.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                        {getStatusLabel(result.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => setSelectedResult(result)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Voir
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        PDF
                      </button>
                      <button className="text-purple-600 hover:text-purple-900">
                        Refaire
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Détails du résultat sélectionné */}
      {selectedResult && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Détails - {selectedResult.projectName}</h2>
            <button 
              onClick={() => setSelectedResult(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-800">
                {selectedResult.efficiency}%
              </div>
              <div className="text-sm text-green-600">Efficacité matière</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-800">
                {selectedResult.panelsUsed}
              </div>
              <div className="text-sm text-blue-600">Panneaux utilisés</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-800">
                {selectedResult.totalCost.toFixed(2)} €
              </div>
              <div className="text-sm text-purple-600">Coût total matière</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-800">
                {selectedResult.cuttingLength} m
              </div>
              <div className="text-sm text-orange-600">Longueur de coupe</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Informations techniques</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Stratégie utilisée :</span>
                <span className="ml-2 font-medium">{getStrategyLabel(selectedResult.strategy)}</span>
              </div>
              <div>
                <span className="text-gray-600">Pourcentage de chutes :</span>
                <span className="ml-2 font-medium">{selectedResult.wastePercentage}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              📄 Générer PDF complet
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              📊 Visualisation 3D
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              🔄 Réoptimiser avec autres paramètres
            </button>
          </div>
        </div>
      )}

      {/* Message d'information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-blue-900 font-medium mb-2">💡 Page en développement</h3>
        <p className="text-blue-800 text-sm">
          Cette page affiche actuellement des résultats simulés. L'intégration complète permettra 
          la visualisation graphique des découpes, l'export PDF détaillé et les comparaisons entre stratégies.
        </p>
      </div>
    </div>
  );
} 