import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Text, Badge } from '@mantine/core';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, startOfMonth, endOfMonth, eachWeekOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import AffaireCard from './AffaireCard';
import { IconCalendar } from '@tabler/icons-react';

const PlanningGrid = ({ 
  affaires, 
  currentView, 
  currentDate, 
  onAffaireSelect, 
  isFullPage = false,
  isFullWidth = false,
  isLoading = false
}) => {

  // Calculer les dates selon la vue
  const dates = useMemo(() => {
    if (!currentDate) return [new Date()];
    
    const safeDate = new Date(currentDate);
    if (isNaN(safeDate.getTime())) return [new Date()];
    
    switch (currentView) {
      case 'day':
        return [safeDate];
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(safeDate, { locale: fr }),
          end: endOfWeek(safeDate, { locale: fr })
        });
      case 'month':
        return eachDayOfInterval({
          start: startOfMonth(safeDate),
          end: endOfMonth(safeDate)
        });
      default:
        return [safeDate];
    }
  }, [currentView, currentDate]);

  // Filtrer les affaires par date
  const getAffairesForDate = (date) => {
    if (!affaires || !Array.isArray(affaires)) return [];
    
    return affaires.filter(affaire => {
      if (!affaire.dateDebut || !affaire.dateFin) return false;
      
      const dateDebut = new Date(affaire.dateDebut);
      const dateFin = new Date(affaire.dateFin);
      
      // Vérifier que les dates sont valides
      if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) return false;
      
      return date >= dateDebut && date <= dateFin;
    });
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (statut) => {
    switch (statut) {
      case 'EN_COURS':
        return 'bg-green-100 text-green-800';
      case 'PLANIFIEE':
        return 'bg-blue-100 text-blue-800';
      case 'TERMINEE':
        return 'bg-gray-100 text-gray-800';
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ANNULEE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Composant zone de drop
  const DropZone = ({ date, children }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: `drop-${format(date, 'yyyy-MM-dd')}`,
      data: {
        date: date,
        type: 'day-slot'
      }
    });

    return (
      <div
        ref={setNodeRef}
        className={`
          ${isFullPage ? 'min-h-[200px]' : 'min-h-[150px]'} p-2 rounded-lg border-2 border-dashed transition-all duration-200
          ${isOver 
            ? 'border-[#6b7c3d] bg-[#f0f4e8] shadow-lg' 
            : 'border-[#d9e2c4] bg-white'
          }
        `}
        style={{
          touchAction: 'manipulation',
          WebkitTouchCallout: 'none'
        }}
      >
        {children}
      </div>
    );
  };

  // Vue jour
  if (currentView === 'day') {
    const dayDate = dates[0];
    const affairesJour = getAffairesForDate(dayDate);
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <Text size="lg" fw={600} className="text-[#000000]">
            {format(dayDate, 'EEEE dd MMMM yyyy', { locale: fr })}
          </Text>
          <Text size="sm" className="text-[#333333]">
            {affairesJour.length} affaire{affairesJour.length > 1 ? 's' : ''} planifiée{affairesJour.length > 1 ? 's' : ''}
          </Text>
        </div>

        <DropZone date={dayDate}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6b7c3d]"></div>
            </div>
          ) : affairesJour.length > 0 ? (
            <div className="space-y-3">
              {affairesJour.map(affaire => (
                <AffaireCard
                  key={affaire.id}
                  affaire={affaire}
                  onClick={() => onAffaireSelect?.(affaire)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-[#6b7c3d] text-center">
              <div>
                <Text size="sm" fw={500}>Aucune affaire planifiée</Text>
                <Text size="xs" className="text-[#333333] mt-1">
                  Glissez une affaire ici pour la planifier
                </Text>
              </div>
            </div>
          )}
        </DropZone>
      </div>
    );
  }

  // Vue semaine
  if (currentView === 'week') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <Text size="lg" fw={600} className="text-[#000000]">
            Semaine du {format(dates[0], 'dd MMMM', { locale: fr })} au {format(dates[6], 'dd MMMM yyyy', { locale: fr })}
          </Text>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {dates.map(date => {
            const affairesJour = getAffairesForDate(date);
            const isAujourdhui = isToday(date);
            
            return (
              <div key={date.toISOString()} className="space-y-2">
                {/* Header du jour */}
                <div className={`
                  text-center p-2 rounded-lg
                  ${isAujourdhui 
                    ? 'bg-[#6b7c3d] text-white' 
                    : 'bg-[#f0f4e8] text-[#6b7c3d]'
                  }
                `}>
                  <Text size="xs" fw={600}>
                    {format(date, 'EEE', { locale: fr }).toUpperCase()}
                  </Text>
                  <Text size="lg" fw={700}>
                    {format(date, 'dd')}
                  </Text>
                </div>

                {/* Zone de drop pour le jour */}
                <DropZone date={date}>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-16">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6b7c3d]"></div>
                    </div>
                  ) : affairesJour.length > 0 ? (
                    <div className="space-y-2">
                      {affairesJour.slice(0, 3).map(affaire => (
                        <AffaireCard
                          key={affaire.id}
                          affaire={affaire}
                          isCompact={true}
                          onClick={() => onAffaireSelect?.(affaire)}
                        />
                      ))}
                      {affairesJour.length > 3 && (
                        <div className="text-center">
                          <Badge size="xs" color="gray">
                            +{affairesJour.length - 3} autres
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-16 text-[#6b7c3d] opacity-50">
                      <Text size="xs">Libre</Text>
                    </div>
                  )}
                </DropZone>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vue mois
  if (currentView === 'month') {
    const weeks = eachWeekOfInterval(
      { start: startOfMonth(currentDate), end: endOfMonth(currentDate) },
      { locale: fr }
    );

    return (
      <div className="space-y-8">
        {/* En-têtes des jours */}
        <div className={`grid gap-4 ${
          isFullWidth 
            ? 'grid-cols-7 w-full' 
            : isFullPage 
              ? 'grid-cols-7 max-w-6xl mx-auto' 
              : 'grid-cols-7'
        }`}>
          {dates.map((date) => (
            <div key={date.toISOString()} className="text-center">
              <div className={`
                font-medium text-gray-600 dark:text-gray-400
                ${isFullWidth ? 'text-lg mb-2' : 'text-sm mb-1'}
              `}>
                {format(date, 'EEEE', { locale: fr })}
              </div>
              <div className={`
                font-bold text-gray-900 dark:text-white
                ${isFullWidth ? 'text-2xl mb-1' : 'text-lg'}
              `}>
                {format(date, 'd')}
              </div>
              <div className={`
                text-gray-500 dark:text-gray-500
                ${isFullWidth ? 'text-base' : 'text-xs'}
              `}>
                {format(date, 'MMM', { locale: fr })}
              </div>
            </div>
          ))}
        </div>

        {/* Grille des zones de drop */}
        <div className={`grid gap-4 ${
          isFullWidth 
            ? 'grid-cols-7 w-full min-h-[600px]' 
            : isFullPage 
              ? 'grid-cols-7 max-w-6xl mx-auto min-h-[500px]' 
              : 'grid-cols-7 min-h-[400px]'
        }`}>
          {dates.map((date) => {
            const dayAffaires = getAffairesForDate(date);
            const isToday = isSameDay(date, new Date());
            
            return (
              <div
                key={date.toISOString()}
                className={`
                  relative border-2 border-dashed rounded-xl p-4 transition-all duration-200
                  ${isToday 
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                  }
                  ${isFullWidth ? 'min-h-[250px] p-6' : isFullPage ? 'min-h-[200px] p-4' : 'min-h-[150px] p-3'}
                `}
              >
                {/* Indicateur jour actuel */}
                {isToday && (
                  <div className={`
                    absolute top-2 right-2 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-200 rounded-full
                    ${isFullWidth ? 'px-3 py-2 text-sm' : ''}
                  `}>
                    Aujourd'hui
                  </div>
                )}

                {/* Affaires du jour */}
                <div className="space-y-3">
                  {dayAffaires.map((affaire, index) => (
                    <div
                      key={`${affaire.id}-${index}`}
                      onClick={() => onAffaireSelect?.(affaire)}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all duration-200
                        bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
                        hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600
                        hover:bg-emerald-50 dark:hover:bg-emerald-900/20
                        ${isFullWidth ? 'p-4' : ''}
                      `}
                    >
                      <div className={`
                        font-semibold text-gray-900 dark:text-white mb-1
                        ${isFullWidth ? 'text-base' : 'text-sm'}
                      `}>
                        {affaire.numero}
                      </div>
                      <div className={`
                        text-gray-600 dark:text-gray-400 mb-2
                        ${isFullWidth ? 'text-sm' : 'text-xs'}
                      `}>
                        {affaire.libelle}
                      </div>
                      <div className={`
                        text-gray-500 dark:text-gray-500
                        ${isFullWidth ? 'text-sm' : 'text-xs'}
                      `}>
                        {affaire.client}
                      </div>
                      
                      {/* Badge statut */}
                      <div className={`
                        inline-block px-2 py-1 mt-2 text-xs font-medium rounded-full
                        ${getStatusColor(affaire.statut)}
                        ${isFullWidth ? 'px-3 py-1 text-sm' : ''}
                      `}>
                        {affaire.statut}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Zone de drop vide */}
                {dayAffaires.length === 0 && (
                  <div className={`
                    flex items-center justify-center h-full text-gray-400 dark:text-gray-600 text-center
                    ${isFullWidth ? 'text-lg' : 'text-sm'}
                  `}>
                    <div>
                      <IconCalendar className={`
                        mx-auto mb-2 text-gray-300 dark:text-gray-700
                        ${isFullWidth ? 'h-8 w-8' : 'h-6 w-6'}
                      `} />
                      <div>Aucune affaire</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vues timeline et kanban (placeholder pour plus tard)
  return (
    <div className="flex items-center justify-center h-64 text-[#6b7c3d]">
      <div className="text-center">
        <Text size="lg" fw={600}>Vue {currentView}</Text>
        <Text size="sm" className="text-[#333333] mt-2">
          Cette vue sera implémentée dans le prochain sprint
        </Text>
      </div>
    </div>
  );
};

export default PlanningGrid; 