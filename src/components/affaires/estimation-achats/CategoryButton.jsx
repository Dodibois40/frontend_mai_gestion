import React from 'react';
import { useDrag } from 'react-dnd';

const ItemType = 'CATEGORY_BUTTON';

const CategoryButton = ({ categorie, isInChart, onRemove, onDelete, onUpdatePercentage, editingCategoryId, setEditingCategoryId, montantEstimationAchats }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { categorie },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isInChart, // Empêcher le drag si déjà dans le camembert
  }));

  console.log(`CategoryButton ${categorie.nom}: isInChart=${isInChart}, canDrag=${!isInChart}`);

  const isEditing = editingCategoryId === categorie.id;

  const handleCategoryClick = () => {
    if (isInChart) {
      // Si la catégorie est dans le camembert, on peut la sélectionner pour édition
      setEditingCategoryId(isEditing ? null : categorie.id);
    }
  };

  return (
    <div className="space-y-0">
      <div
        ref={!isInChart ? drag : null} // Appliquer la ref drag seulement si pas dans le camembert
        onClick={handleCategoryClick}
        className={`
          group relative inline-flex items-center px-6 py-4 m-2 rounded-xl transition-all duration-300 transform
          ${!isInChart ? 'cursor-move hover:scale-105 hover:shadow-lg' : 'cursor-pointer hover:scale-102 hover:shadow-md'}
          ${isDragging ? 'opacity-50 scale-95 rotate-3' : ''}
          ${isInChart 
            ? (isEditing 
                ? 'bg-blue-50 border-2 border-blue-400 text-blue-800 shadow-lg' 
                : 'bg-gray-50 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
              )
            : 'bg-white border-2 border-gray-200 text-gray-800 hover:border-gray-400 shadow-md hover:shadow-xl'
          }
          ${isEditing ? 'ring-2 ring-blue-500 border-blue-300' : ''}
        `}
        style={{
          borderLeftColor: categorie.couleur,
          borderLeftWidth: '6px',
        }}
        title={isInChart ? 'Cliquer pour modifier le pourcentage' : 'Glisser vers le camembert'}
      >
        {/* Indicateur de couleur */}
        <div 
          className="w-4 h-4 rounded-full mr-3 shadow-sm"
          style={{ backgroundColor: categorie.couleur }}
        ></div>
        
        {/* Nom de la catégorie */}
        <span className="font-semibold text-sm">
          {categorie.nom}
        </span>
        
        {/* Pourcentage */}
        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
          isEditing 
            ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {categorie.pourcentage}%
        </span>

        {/* Boutons d'action */}
        <div className="flex items-center gap-1 ml-3">
          {/* Bouton de suppression pour les catégories dans le camembert */}
          {isInChart && onRemove && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Clic sur suppression de:', categorie.nom);
                onRemove(categorie);
              }}
              className="w-7 h-7 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center text-red-600 hover:text-red-800 transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
              title="Retirer du camembert"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}
          
          {/* Bouton de suppression définitive pour les catégories personnalisées */}
          {!isInChart && categorie.isCustom && onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement la catégorie "${categorie.nom}" ?`)) {
                  onDelete(categorie.id);
                }
              }}
              className="w-6 h-6 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center text-gray-500 hover:text-red-600 transition-all duration-200 hover:scale-110"
              title="Supprimer définitivement cette catégorie personnalisée"
            >
              <svg 
                className="w-3 h-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                />
              </svg>
            </button>
          )}
        </div>
        
        {/* Effet de glissement */}
        {!isInChart && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl"></div>
        )}
      </div>
    </div>
  );
};

export { ItemType };
export default CategoryButton; 