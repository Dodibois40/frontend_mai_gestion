import React, { useState, useEffect } from 'react';
import planningEquipeService from '../../services/planningEquipeService.js';

const TestCouleursPlanningEquipe = () => {
  const [ouvriers, setOuvriers] = useState([]);
  const [planning, setPlanning] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tester la récupération des ouvriers et de leurs couleurs
  const testOuvriers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🧪 Test récupération ouvriers avec couleurs...');
      const response = await planningEquipeService.getOuvriersDisponibles();
      
      const todayString = new Date().toISOString().split('T')[0];
      const planningResponse = await planningEquipeService.getPlanningHebdomadaire(todayString);
      
      const tousOuvriers = [...response.salaries, ...response.sousTraitants];
      setOuvriers(tousOuvriers);
      setPlanning(planningResponse);
      
      console.log('✅ Test terminé:', {
        ouvriersLoaded: tousOuvriers.length > 0,
        couleursPresentes: tousOuvriers.every(ouvrier => 
          ouvrier.couleurPlanning && ouvrier.couleurPlanning.startsWith('#')
        )
      });
      
    } catch (err) {
      console.error('❌ Erreur test:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtenir la couleur de contraste pour le texte
  const getContrastColor = (backgroundColor) => {
    if (!backgroundColor) return '#000000';
    
    // Convertir hex en RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculer la luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Retourner blanc si sombre, noir si clair
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  useEffect(() => {
    testOuvriers();
  }, []);

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Test Couleurs Planning Équipe
        </h1>
        <p className="text-gray-600">
          Validation de l'intégration des couleurs des utilisateurs dans le planning
        </p>
      </div>

      {/* Bouton de test */}
      <div className="text-center">
        <button 
          onClick={testOuvriers}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Chargement...' : 'Relancer les tests'}
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <span className="font-medium">Erreur:</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900">Ouvriers chargés</h3>
          <p className="text-2xl font-bold text-blue-600">{ouvriers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900">Avec couleurs</h3>
          <p className="text-2xl font-bold text-green-600">
            {ouvriers.filter(o => o.couleurPlanning).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900">Affectations</h3>
          <p className="text-2xl font-bold text-purple-600">{planning.length}</p>
        </div>
      </div>

      {/* Liste des ouvriers avec leurs couleurs */}
      {ouvriers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ouvriers et leurs couleurs ({ouvriers.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ouvriers.map(ouvrier => (
              <div key={ouvrier.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3 mb-3">
                  {/* Avatar avec couleur */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      backgroundColor: ouvrier.couleurPlanning || '#9CA3AF',
                      color: getContrastColor(ouvrier.couleurPlanning || '#9CA3AF')
                    }}
                  >
                    {ouvrier.prenom[0]}{ouvrier.nom[0]}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {ouvrier.prenom} {ouvrier.nom}
                    </div>
                    <div className="text-sm text-gray-600">
                      {ouvrier.role.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                
                {/* Informations couleur */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Couleur:</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: ouvrier.couleurPlanning || '#9CA3AF' }}
                      />
                      <span className="font-mono text-xs">{ouvrier.couleurPlanning || 'Non définie'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aperçu du planning */}
      {planning.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Aperçu Planning ({planning.length} affectations)
          </h2>
          <div className="space-y-3">
            {planning.slice(0, 10).map(affectation => (
              <div key={affectation.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {/* Avatar ouvrier */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-xs"
                  style={{ backgroundColor: affectation.user.couleurPlanning || '#9CA3AF' }}
                >
                  {affectation.user.prenom[0]}{affectation.user.nom[0]}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {affectation.user.prenom} {affectation.user.nom}
                  </div>
                  <div className="text-xs text-gray-600">
                    {affectation.affaire.numero} - {affectation.periode} - {affectation.typeActivite}
                  </div>
                </div>
                
                {/* Indicateur couleur */}
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded border border-gray-300"
                    style={{ backgroundColor: affectation.user.couleurPlanning || '#9CA3AF' }}
                  />
                  <span className="font-mono text-xs">{affectation.user.couleurPlanning || 'Non définie'}</span>
                </div>
              </div>
            ))}
            
            {planning.length > 10 && (
              <div className="text-center text-sm text-gray-500">
                ... et {planning.length - 10} autres affectations
              </div>
            )}
          </div>
        </div>
      )}

      {/* Palette de couleurs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Palette de couleurs MAI-GESTION
        </h2>
        <div className="space-y-4">
          {/* Couleurs utilisées */}
          <div>
            <h4 className="font-medium text-sm mb-2">Couleurs en utilisation:</h4>
            <div className="flex flex-wrap gap-2">
              {[...new Set(ouvriers.map(o => o.couleurPlanning).filter(Boolean))].map(couleur => (
                <div key={couleur} className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
                  <div 
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: couleur }}
                  />
                  <span className="font-mono text-xs">{couleur}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Palette complète */}
          <div>
            <h4 className="font-medium text-sm mb-2">Palette complète (terre, bois, olive, soleil):</h4>
            <div className="grid grid-cols-4 gap-2">
              {[
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
              ].map(couleur => (
                <div key={couleur} className="flex flex-col items-center gap-1 p-2 bg-white border rounded">
                  <div 
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: couleur }}
                  />
                  <span className="font-mono text-xs">{couleur}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCouleursPlanningEquipe; 