import React, { useState, useEffect } from 'react';
import { IconPalette, IconRefresh, IconCheck, IconX } from '@tabler/icons-react';

const TestCouleurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState('');

  // Charger les utilisateurs
  const chargerUtilisateurs = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Erreur de chargement');
      
      const data = await response.json();
      setUtilisateurs(data.users || []);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setMessage('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  // Régénérer les couleurs
  const regenererCouleurs = async () => {
    setRegenerating(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/users/regenerer-couleurs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Erreur de régénération');
      
      const data = await response.json();
      setMessage(`✅ ${data.nbUtilisateurs} couleurs régénérées avec succès!`);
      
      // Recharger les utilisateurs
      await chargerUtilisateurs();
    } catch (error) {
      console.error('Erreur régénération:', error);
      setMessage('❌ Erreur lors de la régénération des couleurs');
    } finally {
      setRegenerating(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    chargerUtilisateurs();
  }, []);

  // Palette de couleurs de référence
  const PALETTE_REFERENCE = [
    // Tons terre
    '#8B4513', '#A0522D', '#CD853F', '#D2691E',
    // Tons bois
    '#DEB887', '#BC8F8F', '#F4A460', '#DAA520',
    // Tons olive
    '#556B2F', '#6B8E23', '#808000', '#9ACD32',
    // Tons soleil
    '#FF8C00', '#FFB347', '#FFA500', '#F0E68C',
    // Couleurs complémentaires
    '#B22222', '#CD5C5C', '#D2B48C', '#F5DEB3'
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <IconPalette className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Test des Couleurs Utilisateurs
            </h1>
            <p className="text-gray-600 text-sm">
              Palette thématique : terre, bois, olive, soleil
            </p>
          </div>
        </div>
        
        <button
          onClick={regenererCouleurs}
          disabled={regenerating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <IconRefresh className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
          {regenerating ? 'Régénération...' : 'Régénérer les couleurs'}
        </button>
      </div>

      {/* Message de statut */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Palette de référence */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Palette de Couleurs de Référence
        </h2>
        <div className="grid grid-cols-8 gap-3">
          {PALETTE_REFERENCE.map((couleur, index) => (
            <div key={index} className="text-center">
              <div
                className="w-16 h-16 rounded-lg shadow-md border-2 border-gray-200 mx-auto mb-2"
                style={{ backgroundColor: couleur }}
              />
              <span className="text-xs text-gray-600 font-mono">{couleur}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des utilisateurs */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Utilisateurs avec leurs couleurs ({utilisateurs.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {utilisateurs.map((user) => (
              <div key={user.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                
                {/* Header avec couleur et nom */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                    style={{ backgroundColor: user.couleurPlanning || '#9CA3AF' }}
                  >
                    {user.prenom[0]}{user.nom[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user.prenom} {user.nom}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {user.role.replace('_', ' ').toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* Informations couleur */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Couleur:</span>
                    <span className="font-mono text-sm">{user.couleurPlanning || 'Non définie'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Statut:</span>
                    <span className="text-sm">
                      {user.actif ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <IconCheck className="w-3 h-3" /> Actif
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <IconX className="w-3 h-3" /> Inactif
                        </span>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Planning:</span>
                    <span className="text-sm">
                      {user.disponiblePlanning ? (
                        <span className="text-green-600">Disponible</span>
                      ) : (
                        <span className="text-red-600">Indisponible</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Exemple de chip planning */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Aperçu planning:</p>
                  <div
                    className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium shadow-sm"
                    style={{ backgroundColor: user.couleurPlanning || '#9CA3AF' }}
                  >
                    {user.prenom}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCouleurs; 