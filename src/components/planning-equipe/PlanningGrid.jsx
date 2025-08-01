import React from 'react';
import { useDroppable } from '@dnd-kit/core';

/**
 * Grille principale du planning équipe
 * Respecte exactement le template : 5 jours × 2 périodes (matin/aprèm)
 */
const PlanningGrid = ({
  planningData,
  weekDays,
  onAffectationClick,
  onAffectationRightClick,
  isDataLoaded,
  loading,
  className = ""
}) => {

  // ========== DONNÉES ==========
  
  const affaires = planningData?.affaires || [];
  const semaine = planningData?.semaine;

  // ========== COMPOSANTS ==========

  /**
   * Cellule de drop pour une affaire/jour/période
   */
  const DropCell = ({ affaireId, affaire, date, periode, children }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: `${affaireId}-${date}-${periode}`,
      data: {
        type: 'planning-cell',
        affaireId,
        affaire,
        date,
        periode
      }
    });

    return (
      <div
        ref={setNodeRef}
        className={`
          relative p-4 border-r border-b border-gray-200
          transition-colors duration-200
          ${isOver ? 'bg-blue-50 border-blue-300' : 'bg-white'}
          hover:bg-gray-50
        `}
        style={{ minHeight: '120px' }}
      >
        {children}
      </div>
    );
  };

  /**
   * Chip d'affectation d'un ouvrier
   */
  const AffectationChip = ({ affectation }) => {
    const { ouvrier, typeActivite } = affectation;
    const couleur = affectation.couleurPersonne || ouvrier.couleurPlanning || '#3B82F6';
    
    return (
      <div
        className="inline-block m-1 cursor-pointer group relative"
        onClick={() => onAffectationClick?.(affectation)}
        onContextMenu={(e) => onAffectationRightClick?.(affectation, e)}
      >
        <div
          className="px-2 py-1 rounded text-xs font-medium text-white shadow-sm hover:shadow-md transition-shadow"
          style={{ backgroundColor: couleur }}
        >
          <div className="flex items-center gap-1">
            <span>{ouvrier.prenom}</span>
            {typeActivite === 'POSE' && (
              <span className="text-xs opacity-75">🔧</span>
            )}
            {typeActivite === 'FABRICATION' && (
              <span className="text-xs opacity-75">🏭</span>
            )}
          </div>
        </div>
        
        {/* Tooltip au hover */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block">
          <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {ouvrier.prenom} {ouvrier.nom} - {typeActivite.toLowerCase()}
            {affectation.commentaire && (
              <div className="text-gray-300">{affectation.commentaire}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * En-tête d'une affaire
   */
  const AffaireHeader = ({ affaire }) => (
    <div className="flex flex-col items-start px-4 py-3 min-w-64 bg-gray-50 border-r border-gray-200">
      <div className="font-semibold text-gray-900 text-sm mb-1">
        {affaire.numero}
      </div>
      <div className="text-xs text-gray-600 mb-1">
        {affaire.libelle}
      </div>
      <div className="text-xs text-gray-500">
        Livraison: {affaire.dateCloturePrevue 
          ? new Date(affaire.dateCloturePrevue).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
          : 'Non définie'
        }
      </div>
    </div>
  );

  // ========== RENDU ==========

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500">Chargement du planning...</div>
      </div>
    );
  }

  if (!isDataLoaded || !weekDays?.length) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500">Aucune donnée de planning disponible</div>
      </div>
    );
  }

  return (
    <div className={`planning-grid w-full overflow-auto ${className}`}>
      
      {/* En-tête avec navigation semaine */}
      <div className="bg-white border-b-2 border-gray-300 sticky top-0 z-10">
        <div className="grid grid-cols-[300px_repeat(5,_1fr)] gap-0">
          
          {/* Colonne titre */}
          <div className="flex flex-col justify-center px-4 py-6 bg-blue-50 border-r-2 border-gray-300">
            <h2 className="text-xl font-bold text-center text-gray-900">
              PLANNING DES AFFAIRES
            </h2>
            {semaine && (
              <div className="text-sm text-gray-600 text-center mt-1">
                {semaine.libelle}
              </div>
            )}
          </div>

          {/* Colonnes jours */}
          {weekDays.map((day) => (
            <div key={day.dateString} className="border-r border-gray-300 last:border-r-0">
              
              {/* Nom du jour */}
              <div className="bg-blue-100 px-3 py-2 text-center border-b border-gray-300">
                <div className="font-bold text-gray-900 uppercase text-sm">
                  {day.dayName}
                </div>
                <div className="text-lg font-bold text-blue-800">
                  {day.dayNumber}/{day.month}
                </div>
              </div>

              {/* Périodes matin/après-midi */}
              <div className="grid grid-cols-2 gap-0">
                <div className="bg-amber-50 px-2 py-4 text-center border-r border-gray-200">
                  <div className="font-medium text-xs text-gray-700">MATIN</div>
                </div>
                <div className="bg-orange-50 px-2 py-4 text-center">
                  <div className="font-medium text-xs text-gray-700">APRÈM</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Gestion Équipe */}
      <div className="bg-white">
        
        {/* Titre section */}
        <div className="grid grid-cols-[300px_repeat(5,_1fr)] gap-0 border-b border-gray-300">
          <div className="bg-green-100 px-4 py-3 font-bold text-green-900 border-r border-gray-300">
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>Gestion Équipe</span>
            </div>
          </div>
          {weekDays.map((day) => (
            <div key={`header-${day.dateString}`} className="bg-green-50 border-r border-gray-300 last:border-r-0">
              <div className="grid grid-cols-2 gap-0 h-full">
                <div className="border-r border-gray-200"></div>
                <div></div>
              </div>
            </div>
          ))}
        </div>

        {/* Lignes des affaires */}
        {affaires.length === 0 ? (
          <div className="grid grid-cols-[300px_repeat(5,_1fr)] gap-0 border-b border-gray-200">
            <div className="px-4 py-8 text-center text-gray-500 border-r border-gray-300">
              Aucune affaire active
            </div>
            {weekDays.map((day) => (
              <div key={`empty-${day.dateString}`} className="border-r border-gray-300 last:border-r-0">
                <div className="grid grid-cols-2 gap-0 h-full" style={{ minHeight: '120px' }}>
                  <div className="border-r border-gray-200 bg-gray-50"></div>
                  <div className="bg-gray-50"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          affaires.map((affaire) => (
            <div key={affaire.id} className="grid grid-cols-[300px_repeat(5,_1fr)] gap-0 border-b border-gray-200 hover:bg-gray-50">
              
              {/* En-tête affaire */}
              <AffaireHeader affaire={affaire} />

              {/* Colonnes planning pour chaque jour */}
              {weekDays.map((day) => (
                <div key={`${affaire.id}-${day.dateString}`} className="border-r border-gray-300 last:border-r-0">
                  <div className="grid grid-cols-2 gap-0">
                    
                    {/* Matin */}
                    <DropCell
                      affaireId={affaire.id}
                      affaire={affaire}
                      date={day.dateString}
                      periode="MATIN"
                    >
                      {affaire.affectations
                        ?.filter(aff => 
                          aff.dateAffectation === day.dateString && 
                          aff.periode === 'MATIN' &&
                          aff.statut === 'ACTIVE'
                        )
                        .map(affectation => (
                          <AffectationChip
                            key={affectation.id}
                            affectation={affectation}
                          />
                        ))
                      }
                    </DropCell>

                    {/* Après-midi */}
                    <DropCell
                      affaireId={affaire.id}
                      affaire={affaire}
                      date={day.dateString}
                      periode="APREM"
                    >
                      {affaire.affectations
                        ?.filter(aff => 
                          aff.dateAffectation === day.dateString && 
                          aff.periode === 'APREM' &&
                          aff.statut === 'ACTIVE'
                        )
                        .map(affectation => (
                          <AffectationChip
                            key={affectation.id}
                            affectation={affectation}
                          />
                        ))
                      }
                    </DropCell>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Section Sous-traitant */}
      <div className="bg-white border-t-2 border-gray-300">
        
        {/* Titre section */}
        <div className="grid grid-cols-[300px_repeat(5,_1fr)] gap-0 border-b border-gray-300">
          <div className="bg-purple-100 px-4 py-3 font-bold text-purple-900 border-r border-gray-300">
            <div className="flex items-center gap-2">
              <span>🔧</span>
              <span>Sous traitant</span>
            </div>
          </div>
          {weekDays.map((day) => (
            <div key={`sous-traitant-header-${day.dateString}`} className="bg-purple-50 border-r border-gray-300 last:border-r-0">
              <div className="grid grid-cols-2 gap-0 h-full">
                <div className="border-r border-gray-200"></div>
                <div></div>
              </div>
            </div>
          ))}
        </div>

        {/* Lignes sous-traitants (même structure que gestion équipe) */}
        {affaires.map((affaire) => (
          <div key={`st-${affaire.id}`} className="grid grid-cols-[300px_repeat(5,_1fr)] gap-0 border-b border-gray-200 hover:bg-gray-50">
            
            {/* En-tête affaire */}
            <AffaireHeader affaire={affaire} />

            {/* Colonnes planning pour chaque jour */}
            {weekDays.map((day) => (
              <div key={`st-${affaire.id}-${day.dateString}`} className="border-r border-gray-300 last:border-r-0">
                <div className="grid grid-cols-2 gap-0">
                  
                  {/* Matin */}
                  <DropCell
                    affaireId={affaire.id}
                    affaire={affaire}
                    date={day.dateString}
                    periode="MATIN"
                  >
                    {affaire.affectations
                      ?.filter(aff => 
                        aff.dateAffectation === day.dateString && 
                        aff.periode === 'MATIN' &&
                        aff.statut === 'ACTIVE' &&
                        aff.ouvrier.role === 'SOUS_TRAITANT'
                      )
                      .map(affectation => (
                        <AffectationChip
                          key={affectation.id}
                          affectation={affectation}
                        />
                      ))
                    }
                  </DropCell>

                  {/* Après-midi */}
                  <DropCell
                    affaireId={affaire.id}
                    affaire={affaire}
                    date={day.dateString}
                    periode="APREM"
                  >
                    {affaire.affectations
                      ?.filter(aff => 
                        aff.dateAffectation === day.dateString && 
                        aff.periode === 'APREM' &&
                        aff.statut === 'ACTIVE' &&
                        aff.ouvrier.role === 'SOUS_TRAITANT'
                      )
                      .map(affectation => (
                        <AffectationChip
                          key={affectation.id}
                          affectation={affectation}
                        />
                      ))
                    }
                  </DropCell>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Légende */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-300">
        <div className="flex items-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>🏭</span>
            <span>Fabrication</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔧</span>
            <span>Pose</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📱</span>
            <span>Clic droit pour changer le type</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👆</span>
            <span>Glisser-déposer pour affecter</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningGrid; 