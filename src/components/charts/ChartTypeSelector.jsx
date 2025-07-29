import React from 'react';
import {
  IconChartBar,
  IconChartPie,
  IconChartLine,
  IconChartArea
} from '@tabler/icons-react';

const ChartTypeSelector = ({ selectedType, onTypeChange, className = '' }) => {
  const chartTypes = [
    {
      type: 'bar',
      icon: IconChartBar,
      label: 'Barres',
      description: 'Comparaison claire'
    },
    {
      type: 'pie',
      icon: IconChartPie,
      label: 'Secteurs',
      description: 'Répartition'
    },
    {
      type: 'line',
      icon: IconChartLine,
      label: 'Lignes',
      description: 'Tendances'
    },
    {
      type: 'area',
      icon: IconChartArea,
      label: 'Aires',
      description: 'Volumes'
    }
  ];

  return (
    <div className={`flex gap-2 ${className}`}>
      {chartTypes.map(({ type, icon: Icon, label, description }) => (
        <button
          key={type}
          onClick={() => onTypeChange(type)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${selectedType === type
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-700'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
          title={description}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default ChartTypeSelector; 