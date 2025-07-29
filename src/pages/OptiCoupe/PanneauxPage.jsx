import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import optiCoupeService from '../../services/optiCoupeService';

export default function PanneauxPage() {
  const navigate = useNavigate();
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger les panneaux depuis l'API
  useEffect(() => {
    loadPanels();
  }, []);

  const loadPanels = async () => {
    setLoading(true);
    setError('');
    try {
      const panelsData = await optiCoupeService.getPanels();
      setPanels(panelsData);
    } catch (error) {
      console.error('Erreur lors du chargement des panneaux:', error);
      setError('Erreur lors du chargement des panneaux');
      // Fallback avec données simulées si l'API n'est pas disponible
      setPanels([
        {
          id: 1,
          name: 'Mélaminé Blanc 16mm',
          width: 2800,
          height: 2070,
          thickness: 16,
          material: 'Mélaminé',
          pricePerM2: 35.50,
          stock: 8,
          grainDirection: 'HORIZONTAL'
        },
        {
          id: 2,
          name: 'MDF 18mm',
          width: 2500,
          height: 1250,
          thickness: 18,
          material: 'MDF',
          pricePerM2: 28.00,
          stock: 5,
          grainDirection: 'NONE'
        }
      ]);
    }
    setLoading(false);
  };

  const handleAddPanel = () => {
    const name = prompt('Nom du panneau:');
    if (!name) return;
    
    const width = parseInt(prompt('Largeur (mm):') || '0');
    const height = parseInt(prompt('Hauteur (mm):') || '0');
    const thickness = parseInt(prompt('Épaisseur (mm):') || '0');
    const pricePerM2 = parseFloat(prompt('Prix par m² (€):') || '0');
    const stock = parseInt(prompt('Quantité en stock:') || '0');
    
    if (width && height && thickness && pricePerM2 && stock) {
      const newPanel = {
        name,
        width,
        height, 
        thickness,
        material: 'Standard',
        pricePerM2,
        stock,
        grainDirection: 'NONE'
      };
      
      optiCoupeService.createPanel(newPanel)
        .then(created => {
          setPanels([created, ...panels]);
          alert('Panneau ajouté avec succès !');
        })
        .catch(() => {
          setPanels([{...newPanel, id: Date.now()}, ...panels]);
          alert('Panneau ajouté (mode démo)');
        });
    }
  };

  const handleUpdateStock = (panelId, currentStock) => {
    const newStock = parseInt(prompt(`Nouveau stock (actuel: ${currentStock}):`) || '0');
    if (newStock >= 0) {
      optiCoupeService.updatePanelStock(panelId, newStock - currentStock, 'adjust')
        .then(() => {
          setPanels(panels.map(p => p.id === panelId ? {...p, stock: newStock} : p));
          alert('Stock mis à jour !');
        })
        .catch(() => {
          setPanels(panels.map(p => p.id === panelId ? {...p, stock: newStock} : p));
          alert('Stock mis à jour (mode démo)');
        });
    }
  };

  const handleDeletePanel = (panelId) => {
    if (confirm('Supprimer ce panneau ?')) {
      optiCoupeService.deletePanel(panelId)
        .then(() => {
          setPanels(panels.filter(p => p.id !== panelId));
          alert('Panneau supprimé !');
        })
        .catch(() => {
          setPanels(panels.filter(p => p.id !== panelId));
          alert('Panneau supprimé (mode démo)');
        });
    }
  };

  const handleExportInventory = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nom,Matériau,Largeur,Hauteur,Épaisseur,Prix/m²,Stock\n"
      + panels.map(p => 
          `"${p.name}","${p.material}",${p.width},${p.height},${p.thickness},${p.pricePerM2},${p.stock}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventaire_panneaux.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              📦 Gestion des Panneaux
            </h1>
            <p className="text-gray-600">
              Gérez votre stock de panneaux et matériaux
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

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex gap-4 mb-6">
          <button 
            onClick={handleAddPanel}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Ajouter un panneau
          </button>
          <button 
            onClick={() => alert(`Stock total: ${panels.reduce((sum, p) => sum + p.stock, 0)} panneaux`)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            📊 Statistiques stock
          </button>
          <button 
            onClick={handleExportInventory}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            📋 Export inventaire
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">⚠️ {error}</p>
            <button 
              onClick={loadPanels}
              className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Liste des panneaux */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Chargement des panneaux...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Panneau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dimensions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix/m²
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {panels.map((panel) => (
                  <tr key={panel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {panel.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {panel.material}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {panel.width} × {panel.height} × {panel.thickness} mm
                      </div>
                      <div className="text-sm text-gray-500">
                        {((panel.width * panel.height) / 1000000).toFixed(2)} m²
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {panel.pricePerM2.toFixed(2)} €
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        panel.stock > 5 ? 'bg-green-100 text-green-800' : 
                        panel.stock > 2 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {panel.stock} panneau{panel.stock > 1 ? 'x' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => alert('Modification panneau (à implémenter)')}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleUpdateStock(panel.id, panel.stock)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Stock
                      </button>
                      <button 
                        onClick={() => handleDeletePanel(panel.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {panels.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Aucun panneau en stock</p>
            <button 
              onClick={handleAddPanel}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Ajouter votre premier panneau
            </button>
          </div>
        )}
      </div>

      {/* Message d'information */}
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-green-900 font-medium mb-2">✅ Fonctionnalités actives</h3>
        <p className="text-green-800 text-sm">
          Les boutons sont maintenant fonctionnels ! Vous pouvez ajouter, modifier le stock et supprimer des panneaux. 
          Si l'API backend n'est pas disponible, le mode démonstration est utilisé.
        </p>
      </div>
    </div>
  );
} 