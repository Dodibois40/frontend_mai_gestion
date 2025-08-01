import React from 'react';
import { Group, Button, SegmentedControl, Text, ActionIcon } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconCalendar, IconList, IconLayoutGrid, IconTrendingUp, IconLayoutColumns } from '@tabler/icons-react';

const ViewSelector = ({ 
  currentView, 
  onViewChange, 
  currentDate, 
  onDateChange, 
  onNavigate, 
  periodTitle,
  isCompact = false,
  isFullWidth = false 
}) => {
  
  const views = [
    { key: 'day', label: 'Jour', icon: IconCalendar },
    { key: 'week', label: 'Semaine', icon: IconLayoutGrid },
    { key: 'month', label: 'Mois', icon: IconList },
    { key: 'timeline', label: 'Timeline', icon: IconTrendingUp },
    { key: 'kanban', label: 'Kanban', icon: IconLayoutColumns }
  ];

  // Fonction pour obtenir la plage de dates affichée
  const getDateRange = () => {
    if (!currentDate) return '';
    
    const date = new Date(currentDate);
    
    switch (currentView) {
      case 'day':
        return date.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'week':
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString('fr-FR')} - ${endOfWeek.toLocaleDateString('fr-FR')}`;
      case 'month':
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
      default:
        return date.toLocaleDateString('fr-FR');
    }
  };

  return (
    <div className={`${isFullWidth ? 'w-full' : ''} ${isCompact ? 'space-y-3' : 'space-y-6'}`}>
      {/* Sélecteur de vue */}
      <div className={`flex ${isFullWidth ? 'justify-center' : 'justify-start'} ${isCompact ? 'gap-2' : 'gap-4'}`}>
        {views.map((view) => {
          const IconComponent = view.icon;
          return (
            <Button
              key={view.key}
              variant={currentView === view.key ? "filled" : "outline"}
              onClick={() => onViewChange(view.key)}
              leftSection={<IconComponent size={isCompact ? 16 : isFullWidth ? 20 : 18} />}
              size={isCompact ? "sm" : isFullWidth ? "lg" : "md"}
              className={`
                ${currentView === view.key 
                  ? 'bg-emerald-600 text-white border-emerald-600' 
                  : 'border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                }
                ${isFullWidth ? 'px-8 py-3 text-lg font-medium' : isCompact ? 'px-3 py-2 text-sm' : 'px-6 py-2 text-base'}
                transition-all duration-200
              `}
            >
              {view.label}
            </Button>
          );
        })}
      </div>

      {/* Navigation de période */}
      <div className={`flex items-center ${isFullWidth ? 'justify-center' : 'justify-between'} ${isCompact ? 'gap-3' : 'gap-6'}`}>
        <Button
          variant="outline"
          onClick={() => onNavigate('prev')}
          size={isCompact ? "sm" : isFullWidth ? "lg" : "md"}
          className={`
            border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800
            ${isFullWidth ? 'px-6 py-3' : isCompact ? 'px-3 py-2' : 'px-4 py-2'}
          `}
          leftSection={<IconChevronLeft size={isCompact ? 16 : isFullWidth ? 20 : 18} />}
        >
        </Button>

        <div className={`text-center ${isFullWidth ? 'mx-8' : isCompact ? 'mx-4' : 'mx-6'}`}>
          <h3 className={`
            font-semibold text-gray-900 dark:text-white
            ${isFullWidth ? 'text-2xl' : isCompact ? 'text-lg' : 'text-xl'}
          `}>
            {periodTitle}
          </h3>
          {!isCompact && (
            <p className={`
              text-gray-500 dark:text-gray-400 mt-1
              ${isFullWidth ? 'text-lg' : 'text-base'}
            `}>
              {getDateRange()}
            </p>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => onNavigate('next')}
          size={isCompact ? "sm" : isFullWidth ? "lg" : "md"}
          className={`
            border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800
            ${isFullWidth ? 'px-6 py-3' : isCompact ? 'px-3 py-2' : 'px-4 py-2'}
          `}
          leftSection={<IconChevronRight size={isCompact ? 16 : isFullWidth ? 20 : 18} />}
        >
        </Button>
      </div>

      {/* Indicateur de vue actuelle - masqué en mode compact */}
      {!isCompact && (
        <div className={`text-center ${isFullWidth ? 'mt-4' : 'mt-2'}`}>
          <span className={`
            inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
            bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300
            ${isFullWidth ? 'text-base px-6 py-3' : ''}
          `}>
            <IconCalendar size={isFullWidth ? 18 : 16} className="mr-2" />
            Vue {currentView === 'day' ? 'journalière' : currentView === 'week' ? 'hebdomadaire' : 'mensuelle'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ViewSelector; 