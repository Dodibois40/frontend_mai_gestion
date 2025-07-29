import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import optiCoupeService from '../../services/optiCoupeService';

export default function CutListOptimizer() {
  const navigate = useNavigate();
  
  // État pour les panneaux de stock
  const [stockPanels, setStockPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État pour les pièces à débiter
  const [pieces, setPieces] = useState([
    { id: 1, name: 'Côté A', width: 800, height: 600, thickness: 18, quantity: 2, material: 'Contreplaqué Bouleau' },
    { id: 2, name: 'Côté B', width: 800, height: 400, thickness: 18, quantity: 2, material: 'Contreplaqué Bouleau' },
    { id: 3, name: 'Fond', width: 784, height: 400, thickness: 18, quantity: 1, material: 'Contreplaqué Bouleau' },
    { id: 4, name: 'Tablette', width: 784, height: 350, thickness: 18, quantity: 2, material: 'Contreplaqué Bouleau' }
  ]);

  // État pour les paramètres d'optimisation
  const [optimization, setOptimization] = useState({
    kerfWidth: 3.2, // Épaisseur de lame de scie
    edgeBanding: 0.4, // Épaisseur du chant
    minOffcutSize: 100, // Taille minimale de chute récupérable
    strategy: 'EFFICIENCY_FIRST', // Utiliser les valeurs de l'enum backend
    allowRotation: true
  });

  // État pour les résultats d'optimisation
  const [optimizationResults, setOptimizationResults] = useState({
    totalPanelsUsed: 3,
    efficiency: 87.4,
    totalWaste: 0.89,
    totalCost: 267.45,
    cuttingLength: 24.8,
    offcuts: [
      { width: 280, height: 350, area: 0.098 },
      { width: 450, height: 220, area: 0.099 }
    ]
  });

  // État pour la visualisation du plan de débit
  const [cuttingPlan, setCuttingPlan] = useState([
    {
      panelId: 1,
      panelInfo: { width: 2800, height: 2070, material: 'Contreplaqué Bouleau' },
      pieces: [
        { id: 1, x: 10, y: 10, width: 800, height: 600, name: 'Côté A', rotation: false },
        { id: 2, x: 820, y: 10, width: 800, height: 600, name: 'Côté A', rotation: false },
        { id: 3, x: 1630, y: 10, width: 800, height: 400, name: 'Côté B', rotation: false },
        { id: 4, x: 10, y: 620, width: 800, height: 400, name: 'Côté B', rotation: false },
        { id: 5, x: 820, y: 620, width: 784, height: 400, name: 'Fond', rotation: false },
        { id: 6, x: 1614, y: 620, width: 784, height: 350, name: 'Tablette', rotation: false },
        { id: 7, x: 820, y: 1030, width: 784, height: 350, name: 'Tablette', rotation: false }
      ]
    }
  ]);

  // État pour l'optimisation en cours
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Charger les panneaux depuis le service au démarrage
  useEffect(() => {
    loadPanels();
  }, []);

  const loadPanels = async () => {
    try {
      setLoading(true);
      const panels = await optiCoupeService.getPanels();
      
      // Convertir le format du service vers le format attendu par l'interface
      const formattedPanels = panels.map(panel => ({
        id: panel.id,
        width: panel.width,
        height: panel.height,
        thickness: panel.thickness,
        material: panel.material,
        quantity: panel.stock,
        price: panel.pricePerM2
      }));
      
      setStockPanels(formattedPanels);
    } catch (err) {
      console.error('Erreur lors du chargement des panneaux:', err);
      setError('Impossible de charger les panneaux');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour optimiser le débit
  const optimizeCutting = async () => {
    try {
      setIsOptimizing(true);
      console.log('Optimisation du débit en cours...');
      
      // Pour l'instant, garder la simulation mais préparer l'intégration future
      // TODO: Intégrer l'API d'optimisation quand elle sera prête
      
      // Simulation d'optimisation avec variabilité
      setTimeout(() => {
        const newEfficiency = Math.random() * 10 + 85;
        const newWaste = Math.random() * 0.5 + 0.5;
        const newCuttingLength = Math.random() * 5 + 20;
        
        setOptimizationResults({
          ...optimizationResults,
          efficiency: parseFloat(newEfficiency.toFixed(1)),
          totalWaste: parseFloat(newWaste.toFixed(2)),
          cuttingLength: parseFloat(newCuttingLength.toFixed(1))
        });
        setIsOptimizing(false);
      }, 1500);
      
    } catch (err) {
      console.error('Erreur lors de l\'optimisation:', err);
      setError('Erreur lors de l\'optimisation');
      setIsOptimizing(false);
    }
  };

  // Fonction pour ajouter une pièce
  const addPiece = () => {
    const availableMaterials = [...new Set(stockPanels.map(p => p.material))];
    const defaultMaterial = availableMaterials.length > 0 ? availableMaterials[0] : 'Contreplaqué Bouleau';
    
    const newPiece = {
      id: pieces.length + 1,
      name: `Pièce ${pieces.length + 1}`,
      width: 400,
      height: 300,
      thickness: 18,
      quantity: 1,
      material: defaultMaterial
    };
    setPieces([...pieces, newPiece]);
  };

  // Fonction pour supprimer une pièce
  const removePiece = (pieceId) => {
    setPieces(pieces.filter(p => p.id !== pieceId));
  };

  // Fonction pour mettre à jour une pièce
  const updatePiece = (pieceId, updates) => {
    setPieces(pieces.map(p => 
      p.id === pieceId ? { ...p, ...updates } : p
    ));
  };

  // Rendu de la visualisation du plan de débit
  const renderCuttingPlan = () => {
    const scale = 0.15; // Échelle d'affichage
    
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 h-96 overflow-auto">
        <h3 className="text-lg font-semibold mb-4 text-center">Plan de Débit - Panneau 1</h3>
        <div className="relative mx-auto" style={{ width: 2800 * scale, height: 2070 * scale }}>
          {/* Panneau de fond */}
          <div 
            className="absolute border-2 border-gray-800 bg-yellow-100"
            style={{ 
              width: 2800 * scale, 
              height: 2070 * scale,
              top: 0,
              left: 0 
            }}
          >
            {/* Pièces découpées */}
            {cuttingPlan[0]?.pieces.map((piece, index) => (
              <div
                key={index}
                className="absolute border border-blue-600 bg-blue-200 flex items-center justify-center text-xs font-medium"
                style={{
                  left: piece.x * scale,
                  top: piece.y * scale,
                  width: piece.width * scale,
                  height: piece.height * scale,
                  fontSize: '8px'
                }}
                title={`${piece.name} - ${piece.width}×${piece.height}mm`}
              >
                {piece.name}
              </div>
            ))}
          </div>
          
          {/* Informations du panneau */}
          <div className="absolute -top-6 left-0 text-sm font-medium">
            2800×2070mm - Contreplaqué Bouleau
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Optimiseur de Débit</h1>
        <p className="text-gray-600">Optimisation automatique de découpe avec visualisation graphique</p>
      </div>

      {/* Layout principal en 3 colonnes */}
      <div className="grid grid-cols-12 gap-6 h-screen">
        
        {/* Colonne gauche - Stock de panneaux */}
        <div className="col-span-3 bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            📦 Stock Panneaux
          </h2>
          
          <div className="space-y-3 mb-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Chargement des panneaux...</div>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <div className="text-sm text-red-500">{error}</div>
                <button 
                  onClick={loadPanels}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Réessayer
                </button>
              </div>
            ) : stockPanels.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Aucun panneau disponible</div>
              </div>
            ) : (
              stockPanels.map(panel => (
                <div key={panel.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="font-medium text-sm">{panel.material}</div>
                  <div className="text-xs text-gray-600">{panel.width}×{panel.height}×{panel.thickness}mm</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      panel.quantity > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Stock: {panel.quantity}
                    </span>
                    <span className="text-xs font-medium">{panel.price}€/m²</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Paramètres d'optimisation */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">⚙️ Paramètres</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Épaisseur lame (mm)</label>
                <input 
                  type="number" 
                  value={optimization.kerfWidth}
                  onChange={(e) => setOptimization({...optimization, kerfWidth: parseFloat(e.target.value)})}
                  className="w-full px-2 py-1 border rounded text-sm"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1">Stratégie</label>
                                  <select 
                    value={optimization.strategy}
                    onChange={(e) => setOptimization({...optimization, strategy: e.target.value})}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="EFFICIENCY_FIRST">Efficacité maximale</option>
                    <option value="COST_MINIMIZE">Minimiser le coût</option>
                    <option value="CUT_MINIMIZE">Minimiser les coupes</option>
                    <option value="GRAIN_RESPECT">Respecter le fil du bois</option>
                    <option value="SPEED_OPTIMIZE">Optimiser la vitesse</option>
                  </select>
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={optimization.allowRotation}
                  onChange={(e) => setOptimization({...optimization, allowRotation: e.target.checked})}
                  className="rounded"
                />
                <label className="text-xs">Autoriser rotation</label>
              </div>
            </div>

            <button 
              onClick={optimizeCutting}
              disabled={isOptimizing || stockPanels.length === 0}
              className={`w-full mt-4 py-2 px-4 rounded-lg transition-colors ${
                isOptimizing || stockPanels.length === 0
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isOptimizing ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Optimisation...
                </span>
              ) : (
                '🚀 Optimiser'
              )}
            </button>
          </div>
        </div>

        {/* Colonne centrale - Plan de débit */}
        <div className="col-span-6 bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
            🎯 Plan de Débit
            <div className="flex space-x-2">
              <button className="text-sm bg-gray-200 px-3 py-1 rounded">Zoom +</button>
              <button className="text-sm bg-gray-200 px-3 py-1 rounded">Zoom -</button>
              <button className="text-sm bg-gray-200 px-3 py-1 rounded">Export PDF</button>
            </div>
          </h2>
          
          {renderCuttingPlan()}
          
          {/* Navigation entre panneaux */}
          <div className="flex justify-center mt-4 space-x-2">
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Panneau 1</button>
            <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm">Panneau 2</button>
            <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm">+ Nouveau</button>
          </div>
        </div>

        {/* Colonne droite - Statistiques et pièces */}
        <div className="col-span-3 space-y-4">
          
          {/* Statistiques */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4">📊 Résultats</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Panneaux utilisés:</span>
                <span className="font-bold">{optimizationResults.totalPanelsUsed}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Efficacité:</span>
                <span className="font-bold text-green-600">{optimizationResults.efficiency.toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Chutes totales:</span>
                <span className="font-bold text-orange-600">{optimizationResults.totalWaste.toFixed(2)} m²</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Coût total:</span>
                <span className="font-bold text-blue-600">{optimizationResults.totalCost.toFixed(2)}€</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Longueur coupe:</span>
                <span className="font-bold">{optimizationResults.cuttingLength.toFixed(1)} m</span>
              </div>
            </div>

            {/* Chutes récupérables */}
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold text-sm mb-2">♻️ Chutes récupérables</h3>
              {optimizationResults.offcuts.map((offcut, index) => (
                <div key={index} className="text-xs text-gray-600 mb-1">
                  {offcut.width}×{offcut.height}mm ({offcut.area.toFixed(3)} m²)
                </div>
              ))}
            </div>
          </div>

          {/* Liste des pièces */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">📋 Pièces à débiter</h2>
              <button 
                onClick={addPiece}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                + Ajouter
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pieces.map(piece => (
                <div key={piece.id} className="border rounded p-2 text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <input
                      type="text"
                      value={piece.name}
                      onChange={(e) => updatePiece(piece.id, { name: e.target.value })}
                      className="font-medium text-sm border-none p-0 bg-transparent flex-1 mr-2"
                    />
                    <button 
                      onClick={() => removePiece(piece.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1 text-xs mb-2">
                    <input
                      type="number"
                      value={piece.width}
                      onChange={(e) => updatePiece(piece.id, { width: parseInt(e.target.value) })}
                      className="border rounded px-1 py-0.5"
                      placeholder="L"
                    />
                    <input
                      type="number"
                      value={piece.height}
                      onChange={(e) => updatePiece(piece.id, { height: parseInt(e.target.value) })}
                      className="border rounded px-1 py-0.5"
                      placeholder="H"
                    />
                    <input
                      type="number"
                      value={piece.quantity}
                      onChange={(e) => updatePiece(piece.id, { quantity: parseInt(e.target.value) })}
                      className="border rounded px-1 py-0.5"
                      placeholder="Q"
                    />
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    {piece.width}×{piece.height}×{piece.thickness}mm
                  </div>
                  
                  <div className="mt-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Qté: {piece.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 