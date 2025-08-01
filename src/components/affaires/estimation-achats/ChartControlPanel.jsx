import React, { useState, useEffect } from 'react';

// Styles CSS pour le slider personnalisé
const sliderStyles = `
  .slider-custom::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .slider-custom::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

// Injecter les styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = sliderStyles;
  document.head.appendChild(styleSheet);
}

const ChartControlPanel = ({ categorieSelectionnee, onUpdate, onDeselect, montantEstimationAchats, totalPourcentage }) => {
  const [tempPourcentage, setTempPourcentage] = useState(categorieSelectionnee?.pourcentage || 0);

  console.log('Catégorie sélectionnée:', categorieSelectionnee);
  console.log('Montant estimation achats:', montantEstimationAchats);
  console.log('Total pourcentage:', totalPourcentage);

  useEffect(() => {
    console.log('Catégorie sélectionnée dans effect:', categorieSelectionnee);
    if (categorieSelectionnee) {
      console.log('Définition tempPourcentage à:', categorieSelectionnee.pourcentage);
      setTempPourcentage(categorieSelectionnee.pourcentage);
    }
  }, [categorieSelectionnee]);

  if (!categorieSelectionnee) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
        <div className="text-gray-500 mb-2">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.121 2.122" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium">Cliquez sur une catégorie dans le camembert</p>
        <p className="text-gray-500 text-sm">pour ajuster son pourcentage</p>
      </div>
    );
  }

  const handleSliderChange = (newValue) => {
    setTempPourcentage(newValue);
    onUpdate(categorieSelectionnee.id, parseInt(newValue));
  };

  const montantEstime = (tempPourcentage / 100) * montantEstimationAchats;
  const pourcentageRestant = 100 - (totalPourcentage - categorieSelectionnee.pourcentage + parseInt(tempPourcentage));

  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-6 h-6 rounded-full shadow-sm"
            style={{ backgroundColor: categorieSelectionnee.couleur }}
          />
          <div>
            <h3 className="font-bold text-lg text-gray-800">{categorieSelectionnee.nom}</h3>
            <p className="text-sm text-gray-600">Ajustement du pourcentage</p>
          </div>
        </div>
        <button
          onClick={onDeselect}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Fermer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Slider principal */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Pourcentage</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={tempPourcentage}
                onChange={(e) => handleSliderChange(e.target.value)}
                className="w-20 px-3 py-1 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-sm text-gray-600 font-medium">%</span>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="1"
              max="100"
              value={tempPourcentage}
              onChange={(e) => handleSliderChange(e.target.value)}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-custom"
              style={{
                background: `linear-gradient(to right, ${categorieSelectionnee.couleur} 0%, ${categorieSelectionnee.couleur} ${tempPourcentage}%, #e5e7eb ${tempPourcentage}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Informations en temps réel */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {montantEstime.toFixed(0)}€
            </div>
            <div className="text-xs text-gray-600">Montant estimé</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${pourcentageRestant >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {pourcentageRestant.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">Restant</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {(totalPourcentage - categorieSelectionnee.pourcentage + parseInt(tempPourcentage)).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>

        {/* Alertes */}
        {pourcentageRestant < 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm font-medium">Dépassement de 100%</span>
            </div>
          </div>
        )}

        {pourcentageRestant === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Répartition complète !</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartControlPanel; 