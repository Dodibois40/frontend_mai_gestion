import React from 'react';
import { IconChevronLeft, IconChevronRight, IconCalendar, IconHome } from '@tabler/icons-react';

/**
 * Navigateur de semaines pour le planning équipe
 * Respecte exactement le design du template avec flèches et numéro de semaine
 */
const WeekNavigator = ({
  currentWeek,
  onWeekChange,
  onToday,
  semaine,
  className = ""
}) => {

  // ========== UTILITAIRES ==========

  /**
   * Obtenir le numéro de semaine
   */
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  /**
   * Formater la période de semaine
   */
  const formatWeekPeriod = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4); // Vendredi
    
    const startStr = weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const endStr = weekEnd.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    return `${startStr} au ${endStr}`;
  };

  /**
   * Naviguer vers la semaine précédente
   */
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    onWeekChange(newWeek);
  };

  /**
   * Naviguer vers la semaine suivante
   */
  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    onWeekChange(newWeek);
  };

  // ========== DONNÉES ==========
  
  const weekNumber = getWeekNumber(currentWeek);
  const weekPeriod = formatWeekPeriod(currentWeek);
  const isCurrentWeek = getWeekNumber(new Date()) === weekNumber;

  // ========== RENDU ==========

  return (
    <div className={`week-navigator ${className}`}>
      
      {/* Navigation principale */}
      <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
        
        {/* Flèche précédente */}
        <button
          onClick={goToPreviousWeek}
          className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
          title="Semaine précédente"
        >
          <IconChevronLeft className="w-5 h-5" />
        </button>

        {/* Informations semaine centrale */}
        <div className="flex-1 text-center px-4">
          {/* Numéro de semaine */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <IconCalendar className="w-5 h-5 text-gray-600" />
            <span className="text-lg font-bold text-gray-900">
              Semaine {weekNumber}
            </span>
            {isCurrentWeek && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                Actuelle
              </span>
            )}
          </div>
          
          {/* Période */}
          <div className="text-sm text-gray-600">
            {semaine?.libelle || weekPeriod}
          </div>
          
          {/* Année */}
          <div className="text-xs text-gray-500 mt-1">
            {currentWeek.getFullYear()}
          </div>
        </div>

        {/* Flèche suivante */}
        <button
          onClick={goToNextWeek}
          className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
          title="Semaine suivante"
        >
          <IconChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Actions rapides */}
      <div className="flex items-center justify-center gap-2 mt-3">
        
        {/* Bouton aujourd'hui */}
        <button
          onClick={onToday}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${isCurrentWeek 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }
          `}
          disabled={isCurrentWeek}
          title="Aller à la semaine actuelle"
        >
          <IconHome className="w-4 h-4" />
          <span>Aujourd'hui</span>
        </button>

        {/* Sélecteur de date rapide */}
        <input
          type="week"
          value={`${currentWeek.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`}
          onChange={(e) => {
            const [year, week] = e.target.value.split('-W');
            const newDate = new Date(year, 0, 1 + (week - 1) * 7);
            const day = newDate.getDay();
            const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // Lundi
            newDate.setDate(diff);
            onWeekChange(newDate);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          title="Sélectionner une semaine"
        />
      </div>

      {/* Raccourcis clavier */}
      <div className="mt-2 text-center">
        <div className="text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">←</kbd>
            <span>/</span>
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">→</kbd>
            <span className="ml-1">pour naviguer</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeekNavigator; 