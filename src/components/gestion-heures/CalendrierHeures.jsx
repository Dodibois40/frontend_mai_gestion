import React, { useState, useEffect } from 'react';
import { 
  IconChevronLeft, 
  IconChevronRight, 
  IconPlus,
  IconEdit,
  IconClock,
  IconMapPin
} from '@tabler/icons-react';
import pointageHeuresService from '../../services/pointageHeuresService';

const CalendrierHeures = ({ 
  currentDate, 
  viewMode, 
  pointages, 
  users, 
  onDateChange, 
  onNavigate,
  onEditPointage,
  onNewPointage 
}) => {
  const [hoveredDate, setHoveredDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Générer les dates pour la vue
  const generateDates = () => {
    if (viewMode === 'semaine') {
      return generateWeekDates();
    } else {
      return generateMonthDates();
    }
  };

  const generateWeekDates = () => {
    const start = pointageHeuresService.getWeekStart(currentDate);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const generateMonthDates = () => {
    const start = pointageHeuresService.getMonthStart(currentDate);
    const end = pointageHeuresService.getMonthEnd(currentDate);
    const dates = [];
    
    // Commencer au lundi de la première semaine
    const firstMonday = new Date(start);
    const day = firstMonday.getDay();
    const diff = firstMonday.getDate() - day + (day === 0 ? -6 : 1);
    firstMonday.setDate(diff);
    
    // Générer 6 semaines pour couvrir tout le mois
    for (let week = 0; week < 6; week++) {
      const weekDates = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(firstMonday);
        date.setDate(firstMonday.getDate() + (week * 7) + day);
        weekDates.push(date);
      }
      dates.push(weekDates);
    }
    return dates;
  };

  const getPointagesForDate = (date) => {
    const dateStr = pointageHeuresService.formatDate(date);
    return pointages.filter(p => 
      pointageHeuresService.formatDate(p.datePointage) === dateStr
    );
  };

  const getUserColor = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.couleurPlanning || '#3B82F6';
  };

  const getTotalHeuresForDate = (date) => {
    const dayPointages = getPointagesForDate(date);
    return dayPointages.reduce((sum, p) => sum + p.heuresTravaillees, 0);
  };

  const getTypePresenceColor = (type) => {
    const colors = {
      PRESENT: 'bg-green-500',
      ABSENT: 'bg-red-500',
      RETARD: 'bg-orange-500',
      CONGE: 'bg-blue-500',
      MALADIE: 'bg-purple-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getLieuTravailIcon = (lieu) => {
    const icons = {
      ATELIER_CAME: '🏭',
      ATELIER_HOSSEGOR: '🏢',
      CHANTIER: '🚧'
    };
    return icons[lieu] || '📍';
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    onDateChange && onDateChange(date);
  };

  const handleNewPointageClick = (date) => {
    onNewPointage && onNewPointage({
      datePointage: pointageHeuresService.formatDate(date)
    });
  };

  if (viewMode === 'semaine') {
    const weekDates = generateDates();
    
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* En-tête de la semaine */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((dayName, index) => (
            <div key={dayName} className="text-center">
              <div className="text-sm font-medium text-gray-500 mb-1">{dayName}</div>
              <div className={`text-2xl font-bold ${isToday(weekDates[index]) ? 'text-blue-600' : 'text-gray-900'}`}>
                {weekDates[index].getDate()}
              </div>
              <div className="text-xs text-gray-400">
                {weekDates[index].toLocaleDateString('fr-FR', { month: 'short' })}
              </div>
            </div>
          ))}
        </div>

        {/* Grille des pointages */}
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const dayPointages = getPointagesForDate(date);
            const totalHeures = getTotalHeuresForDate(date);
            
            return (
              <div
                key={index}
                className={`min-h-[200px] border-2 rounded-xl p-3 transition-all cursor-pointer ${
                  isToday(date) 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onMouseEnter={() => setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
                onClick={() => handleDateClick(date)}
              >
                {/* Résumé du jour */}
                {totalHeures > 0 && (
                  <div className="mb-2 p-2 bg-green-100 rounded-lg">
                    <div className="flex items-center text-green-700 text-sm font-medium">
                      <IconClock className="w-4 h-4 mr-1" />
                      {totalHeures}h
                    </div>
                    <div className="text-xs text-green-600">
                      {dayPointages.length} pointage{dayPointages.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {/* Liste des pointages */}
                <div className="space-y-2">
                  {dayPointages.slice(0, 3).map((pointage) => {
                    const user = users.find(u => u.id === pointage.userId);
                    return (
                      <div
                        key={pointage.id}
                        className="p-2 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPointage && onEditPointage(pointage);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getUserColor(pointage.userId) }}
                            />
                            <span className="text-xs font-medium text-gray-900 truncate">
                              {user?.prenom} {user?.nom}
                            </span>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${getTypePresenceColor(pointage.typePresence)}`} />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-600">
                            {pointage.heuresTravaillees}h
                          </span>
                          <span className="text-xs">
                            {getLieuTravailIcon(pointage.lieuTravail)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {dayPointages.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{dayPointages.length - 3} autre{dayPointages.length - 3 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Bouton d'ajout */}
                {hoveredDate && hoveredDate.toDateString() === date.toDateString() && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNewPointageClick(date);
                    }}
                    className="mt-2 w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center"
                  >
                    <IconPlus className="w-4 h-4 mr-1" />
                    <span className="text-xs">Ajouter</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vue mensuelle
  const monthDates = generateDates();
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* En-tête des jours de la semaine */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((dayName) => (
          <div key={dayName} className="text-center text-sm font-medium text-gray-500 py-2">
            {dayName}
          </div>
        ))}
      </div>

      {/* Grille du mois */}
      <div className="space-y-2">
        {monthDates.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week.map((date, dayIndex) => {
              const dayPointages = getPointagesForDate(date);
              const totalHeures = getTotalHeuresForDate(date);
              const isCurrentMonthDate = isCurrentMonth(date);
              
              return (
                <div
                  key={dayIndex}
                  className={`min-h-[120px] border rounded-lg p-2 transition-all cursor-pointer ${
                    isToday(date)
                      ? 'border-blue-300 bg-blue-50'
                      : isCurrentMonthDate
                        ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        : 'border-gray-100 bg-gray-50 text-gray-400'
                  }`}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onClick={() => handleDateClick(date)}
                >
                  {/* Numéro du jour */}
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(date) ? 'text-blue-600' : isCurrentMonthDate ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {date.getDate()}
                  </div>

                  {/* Indicateurs de pointages */}
                  {isCurrentMonthDate && totalHeures > 0 && (
                    <div className="mb-1">
                      <div className="text-xs text-green-600 font-medium mb-1">
                        {totalHeures}h
                      </div>
                      <div className="space-y-1">
                        {dayPointages.slice(0, 3).map((pointage) => {
                          const user = users.find(u => u.id === pointage.userId);
                          return (
                            <div
                              key={pointage.id}
                              className="flex items-center gap-1"
                              title={`${user?.prenom} ${user?.nom} - ${pointage.heuresTravaillees}h - ${pointage.lieuTravail}`}
                            >
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getTypePresenceColor(pointage.typePresence)}`} />
                              <span className="text-xs text-gray-700 truncate">
                                {user?.prenom} {user?.nom} {pointage.heuresTravaillees}h - {pointage.lieuTravail === 'ATELIER_CAME' ? 'Came' : pointage.lieuTravail === 'ATELIER_HOSSEGOR' ? 'Hossegor' : 'Chantier'}
                              </span>
                            </div>
                          );
                        })}
                        {dayPointages.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayPointages.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bouton d'ajout rapide */}
                  {isCurrentMonthDate && hoveredDate && hoveredDate.toDateString() === date.toDateString() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNewPointageClick(date);
                      }}
                      className="w-full p-1 border border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center"
                    >
                      <IconPlus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendrierHeures; 