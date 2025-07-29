import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OptimisationPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [strategy, setStrategy] = useState('WASTE_MINIMIZE');
  const [kerfWidth, setKerfWidth] = useState(3.2);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState(null);

  // Données simulées pour démonstration
  useEffect(() => {
    setProjects([
      { id: 1, name: 'Cuisine moderne', pieces: 15 },
      { id: 2, name: 'Bibliothèque salon', pieces: 8 },
      { id: 3, name: 'Placards bureau', pieces: 6 }
    ]);
  }, []);

  const strategies = [
    {
      value: 'LENGTH_FIRST',
      label: 'Priorité Longueur',
      description: 'Optimise en donnant la priorité aux coupes en longueur',
      icon: '↔️',
    },
    {
      value: 'WIDTH_FIRST',
      label: 'Priorité Largeur',
      description: 'Optimise en donnant la priorité aux coupes en largeur',
      icon: '↕️',
    },
    {
      value: 'GRAIN_RESPECT',
      label: 'Respect du Fil',
      description: 'Respecte absolument le sens du fil du bois',
      icon: '🪵',
    },
    {
      value: 'WASTE_MINIMIZE',
      label: 'Minimiser les Chutes',
      description: 'Minimise au maximum les pertes de matière',
      icon: '♻️',
    },
  ];

  const handleOptimize = () => {
    if (!selectedProject) return;
    
    setIsOptimizing(true);
    
    // Simulation d'optimisation
    setTimeout(() => {
      setResult({
        efficiency: 87.5,
        panelsUsed: 3,
        totalCost: 189.45,
        cuttingLength: 24.8,
        wastePercentage: 12.5,
        executionTime: 1.2
      });
      setIsOptimizing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ⚡ Optimisation de Découpe
            </h1>
            <p className="text-gray-600">
              Lancez une optimisation avec nos algorithmes avancés
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paramètres d'optimisation */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">🎯 Paramètres d'optimisation</h2>
          
          {/* Sélection du projet */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Projet à optimiser
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionnez un projet</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.pieces} pièces)
                </option>
              ))}
            </select>
          </div>

          {/* Stratégie d'optimisation */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Stratégie d'optimisation
            </label>
            <div className="space-y-3">
              {strategies.map((strategyOption) => (
                <div key={strategyOption.value} className="flex items-start">
                  <input
                    type="radio"
                    id={strategyOption.value}
                    name="strategy"
                    value={strategyOption.value}
                    checked={strategy === strategyOption.value}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor={strategyOption.value} className="ml-3 cursor-pointer">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{strategyOption.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {strategyOption.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {strategyOption.description}
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Épaisseur de lame */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Épaisseur de lame (mm)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="10"
              value={kerfWidth}
              onChange={(e) => setKerfWidth(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Épaisseur de coupe de votre scie (généralement 3,2mm)
            </p>
          </div>

          {/* Bouton d'optimisation */}
          <button
            onClick={handleOptimize}
            disabled={!selectedProject || isOptimizing}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
              !selectedProject || isOptimizing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isOptimizing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Optimisation en cours...
              </div>
            ) : (
              '🚀 Lancer l\'optimisation'
            )}
          </button>
        </div>

        {/* Résultats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">📊 Résultats</h2>
          
          {!result ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚡</div>
              <p className="text-gray-500">
                Sélectionnez un projet et lancez l'optimisation pour voir les résultats
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-lg font-bold text-green-800">
                    {result.efficiency}%
                  </div>
                  <div className="text-sm text-green-600">Efficacité</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-lg font-bold text-blue-800">
                    {result.panelsUsed}
                  </div>
                  <div className="text-sm text-blue-600">Panneaux utilisés</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-lg font-bold text-purple-800">
                    {result.totalCost} €
                  </div>
                  <div className="text-sm text-purple-600">Coût total</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-lg font-bold text-orange-800">
                    {result.cuttingLength} m
                  </div>
                  <div className="text-sm text-orange-600">Longueur de coupe</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chutes :</span>
                    <span className="font-medium">{result.wastePercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temps d'exécution :</span>
                    <span className="font-medium">{result.executionTime}s</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  ✅ Valider résultat
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  📄 Export PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message d'information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-blue-900 font-medium mb-2">💡 Page en développement</h3>
        <p className="text-blue-800 text-sm">
          Cette page simule actuellement le processus d'optimisation. L'intégration complète avec 
          l'algorithme OptiCoupe permettra des optimisations réelles avec visualisation graphique.
        </p>
      </div>
    </div>
  );
} 