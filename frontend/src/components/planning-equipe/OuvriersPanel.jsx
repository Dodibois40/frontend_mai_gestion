import React, { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { IconSearch, IconUsers, IconSettings, IconFilter } from '@tabler/icons-react';

/**
 * Panel des ouvriers disponibles
 * Support modes vertical ET horizontal selon la capture fournie
 */
const OuvriersPanel = ({
  ouvriers,
  loading,
  onOuvrierClick,
  horizontal = false,
  className = ""
}) => {

  // ========== ÉTAT LOCAL ==========
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('tous'); // tous, salaries, soustraitants, disponibles
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ========== DONNÉES FILTRÉES ==========
  
  const { gestionEquipe, sousTraitants } = useMemo(() => {
    if (!ouvriers) return { gestionEquipe: [], sousTraitants: [] };

    let filteredGestionEquipe = ouvriers.gestionEquipe || [];
    let filteredSousTraitants = ouvriers.sousTraitants || [];

    // Filtre par recherche
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filteredGestionEquipe = filteredGestionEquipe.filter(o => 
        o.nom.toLowerCase().includes(search) || 
        o.prenom.toLowerCase().includes(search) ||
        o.role.toLowerCase().includes(search)
      );
      filteredSousTraitants = filteredSousTraitants.filter(o => 
        o.nom.toLowerCase().includes(search) || 
        o.prenom.toLowerCase().includes(search)
      );
    }

    // Filtre par catégorie
    switch (activeFilter) {
      case 'salaries':
        filteredSousTraitants = [];
        break;
      case 'soustraitants':
        filteredGestionEquipe = [];
        break;
      case 'disponibles':
        filteredGestionEquipe = filteredGestionEquipe.filter(o => o.disponible !== false);
        filteredSousTraitants = filteredSousTraitants.filter(o => o.disponible !== false);
        break;
    }

    return { gestionEquipe: filteredGestionEquipe, sousTraitants: filteredSousTraitants };
  }, [ouvriers, searchTerm, activeFilter]);

  // ========== COMPOSANTS ==========

  /**
   * Carte d'ouvrier draggable (format adapté au mode)
   */
  const OuvrierCard = ({ ouvrier, compact = false }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useDraggable({
      id: `ouvrier-${ouvrier.id}`,
      data: {
        type: 'ouvrier',
        ouvrier,
        sourceType: 'panel'
      }
    });

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    if (compact) {
      // Mode compact pour horizontal (comme dans la capture)
      return (
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className={`
            inline-block m-1 cursor-grab active:cursor-grabbing
            ${isDragging ? 'opacity-50 scale-105 z-50' : 'opacity-100'}
            transition-all duration-200
          `}
          onClick={() => onOuvrierClick?.(ouvrier)}
        >
          <div
            className="px-3 py-2 rounded-full text-white text-sm font-medium shadow-sm hover:shadow-md transition-all"
            style={{ backgroundColor: ouvrier.couleurPlanning || '#3B82F6' }}
          >
            {ouvrier.prenom}
          </div>
        </div>
      );
    }

    // Mode normal pour vertical
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          ${isDragging ? 'opacity-50 scale-105 z-50' : 'opacity-100'}
          cursor-grab active:cursor-grabbing
          transition-all duration-200
        `}
        onClick={() => onOuvrierClick?.(ouvrier)}
      >
        <div
          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
          style={{ borderLeftColor: ouvrier.couleurPlanning, borderLeftWidth: '4px' }}
        >
          {/* Avatar avec initiales */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
            style={{ backgroundColor: ouvrier.couleurPlanning }}
          >
            {ouvrier.prenom[0]}{ouvrier.nom[0]}
          </div>

          {/* Informations */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 text-sm truncate">
              {ouvrier.prenom} {ouvrier.nom}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {ouvrier.role.replace('_', ' ').replace('OUVRIER ', '')}
            </div>
            {ouvrier.tarifHoraireBase > 0 && (
              <div className="text-xs text-green-600">
                {ouvrier.tarifHoraireBase}€/h
              </div>
            )}
          </div>

          {/* Indicateur disponibilité */}
          <div className={`w-2 h-2 rounded-full ${
            ouvrier.disponible !== false ? 'bg-green-400' : 'bg-red-400'
          }`} />
        </div>
      </div>
    );
  };

  /**
   * Section avec titre et liste d'ouvriers
   */
  const OuvriersSection = ({ title, ouvriers: sectionOuvriers, icon, bgColor, textColor }) => (
    <div className="mb-6">
      {/* Titre section */}
      <div className={`flex items-center gap-2 px-3 py-2 ${bgColor} ${textColor} rounded-t-lg font-medium text-sm`}>
        <span>{icon}</span>
        <span>{title}</span>
        <span className="bg-white bg-opacity-25 text-xs px-2 py-1 rounded-full">
          {sectionOuvriers.length}
        </span>
      </div>

      {/* Liste ouvriers */}
      <div className="space-y-2 p-3 bg-gray-50 rounded-b-lg">
        {sectionOuvriers.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Aucun ouvrier disponible
          </div>
        ) : (
          sectionOuvriers.map(ouvrier => (
            <OuvrierCard key={ouvrier.id} ouvrier={ouvrier} />
          ))
        )}
      </div>
    </div>
  );

  // ========== RENDU HORIZONTAL (comme dans la capture) ==========
  
  if (horizontal) {
    if (loading) {
      return (
        <div className={`${className} bg-white p-4 flex items-center justify-center`}>
          <div className="text-gray-500">Chargement des ouvriers...</div>
        </div>
      );
    }

    return (
      <div className={`${className} bg-gray-50 p-4`}>
        <div className="flex items-center gap-8">
          
          {/* Section Gestion Équipe */}
          <div className="flex items-center gap-3">
            <div className="font-semibold text-gray-700 text-sm whitespace-nowrap">
              Gestion Équipe
            </div>
            <div className="flex items-center gap-1 bg-white rounded-lg px-3 py-2 border">
              <span className="text-xs text-gray-500 mr-2">Salarié</span>
              {gestionEquipe.length === 0 ? (
                <span className="text-xs text-gray-400">Aucun ouvrier</span>
              ) : (
                gestionEquipe.map(ouvrier => (
                  <OuvrierCard key={ouvrier.id} ouvrier={ouvrier} compact={true} />
                ))
              )}
            </div>
          </div>

          {/* Section Sous-traitants */}
          <div className="flex items-center gap-3">
            <div className="font-semibold text-gray-700 text-sm whitespace-nowrap">
              Sous traitant
            </div>
            <div className="flex items-center gap-1 bg-white rounded-lg px-3 py-2 border">
              {sousTraitants.length === 0 ? (
                <span className="text-xs text-gray-400">Aucun sous-traitant</span>
              ) : (
                sousTraitants.map(ouvrier => (
                  <OuvrierCard key={ouvrier.id} ouvrier={ouvrier} compact={true} />
                ))
              )}
            </div>
          </div>

          {/* Boutons d'ajout */}
          <div className="flex items-center gap-2 ml-auto">
            {Array.from({ length: 15 }, (_, i) => (
              <button
                key={i}
                className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                title="Ajouter un ouvrier"
              >
                <span className="text-lg">+</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ========== RENDU VERTICAL (mode original) ==========
  
  if (loading) {
    return (
      <div className={`ouvriers-panel ${className} w-80 bg-white border-r border-gray-200 flex items-center justify-center`}>
        <div className="text-gray-500">Chargement des ouvriers...</div>
      </div>
    );
  }

  return (
    <div className={`ouvriers-panel ${className} w-80 bg-gray-100 border-r border-gray-200 flex flex-col`}>
      
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">👥</span>
          <h3 className="font-medium text-gray-900">Équipe</h3>
        </div>
      </div>

      {/* Liste des ouvriers */}
      <div className="flex-1 overflow-y-auto p-4">
        
        {/* Section Gestion Équipe */}
        <div className="mb-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-t-lg font-medium text-sm">
            <span>👥</span>
            <span>Gestion Équipe</span>
            <span className="bg-white bg-opacity-25 text-xs px-2 py-1 rounded-full">
              {gestionEquipe.length}
            </span>
          </div>
          <div className="space-y-2 p-3 bg-gray-50 rounded-b-lg">
            {gestionEquipe.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                Aucun ouvrier disponible
              </div>
            ) : (
              gestionEquipe.map(ouvrier => (
                <OuvrierCard key={ouvrier.id} ouvrier={ouvrier} />
              ))
            )}
          </div>
        </div>

        {/* Section Sous-traitants */}
        <div className="mb-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-800 rounded-t-lg font-medium text-sm">
            <span>🔧</span>
            <span>Sous traitant</span>
            <span className="bg-white bg-opacity-25 text-xs px-2 py-1 rounded-full">
              {sousTraitants.length}
            </span>
          </div>
          <div className="space-y-2 p-3 bg-gray-50 rounded-b-lg">
            {sousTraitants.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                Aucun sous-traitant disponible
              </div>
            ) : (
              sousTraitants.map(ouvrier => (
                <OuvrierCard key={ouvrier.id} ouvrier={ouvrier} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pied de page avec instructions */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-2">
            <span>👆</span>
            <span>Glisser vers le planning</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🖱️</span>
            <span>Clic droit sur affectation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OuvriersPanel; 