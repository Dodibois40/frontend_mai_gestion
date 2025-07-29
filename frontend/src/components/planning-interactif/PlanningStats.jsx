import React from 'react';
import { Text, Progress, Card, Group, Badge } from '@mantine/core';
import { IconTrendingUp, IconUsers, IconCalendarCheck, IconClock, IconCurrencyEuro, IconTarget, IconChartBar } from '@tabler/icons-react';

const PlanningStats = ({ 
  stats,
  isLoading = false,
  isCompact = false,
  isSidebar = false
}) => {
  
  // Extraire les valeurs des stats
  const {
    totalAffaires = 0,
    affairesEnCours = 0,
    affairesTerminees = 0,
    chargeEquipe = 0,
    budgetTotal = 0,
    budgetUtilise = 0,
    tempsEstime = 0,
    tempsRealise = 0,
    membresActifs = 0
  } = stats || {};

  // Calculer les pourcentages
  const tauxRealisation = totalAffaires > 0 ? (affairesTerminees / totalAffaires) * 100 : 0;
  const tauxBudget = budgetTotal > 0 ? (budgetUtilise / budgetTotal) * 100 : 0;
  const tauxTemps = tempsEstime > 0 ? (tempsRealise / tempsEstime) * 100 : 0;

  // Formatter les montants
  const formatMontant = (montant) => {
    if (montant >= 1000000) return `${(montant / 1000000).toFixed(1)}M€`;
    if (montant >= 1000) return `${(montant / 1000).toFixed(0)}k€`;
    return `${montant}€`;
  };

  // Composant statistique individuelle
  const StatCard = ({ icon: Icon, title, value, subValue, color, progress, bgColor, borderColor }) => (
    <Card
      shadow="sm"
      radius={isCompact ? "md" : "lg"}
      className={`${isCompact ? 'p-2' : 'p-4'} transition-all duration-200 hover:shadow-md`}
      style={{ 
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`
      }}
    >
      <div className={isCompact ? "space-y-1" : "space-y-3"}>
        {/* Header */}
        <Group justify="space-between" align="center">
          <div className="flex items-center space-x-2">
            <Icon size={isCompact ? 16 : 20} style={{ color }} />
            <Text size={isCompact ? "xs" : "sm"} fw={500} className="text-[#333333]">
              {title}
            </Text>
          </div>
          {progress !== undefined && !isCompact && (
            <Badge 
              size="xs" 
              variant="light" 
              style={{ 
                backgroundColor: `${color}20`,
                color: color 
              }}
            >
              {progress.toFixed(0)}%
            </Badge>
          )}
        </Group>

        {/* Valeur principale */}
        <div>
          <Text size={isCompact ? "lg" : "xl"} fw={700} className="text-[#000000]">
            {isLoading ? '...' : value}
          </Text>
          {subValue && !isCompact && (
            <Text size="xs" className="text-[#333333] mt-1">
              {subValue}
            </Text>
          )}
        </div>

        {/* Barre de progression */}
        {progress !== undefined && (
          <Progress
            value={isLoading ? 0 : progress}
            size={isCompact ? "xs" : "sm"}
            radius="xl"
            color={color}
            className={isCompact ? "mt-1" : "mt-2"}
          />
        )}
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className={`
        ${isSidebar ? 'space-y-4' : isCompact ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-4 gap-6'}
      `}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`
            animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl
            ${isSidebar ? 'h-24' : isCompact ? 'h-20' : 'h-32'}
          `} />
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: 'Affaires Actives',
      value: stats.affairesActives || 0,
      IconComponent: IconCalendarCheck,
      iconColor: '#6b7c3d',
      bgColor: '#f0f4e8',
      borderColor: '#d9e2c4',
      trend: '+12%'
    },
    {
      title: 'Heures Planifiées',
      value: stats.heuresPlanifiees || 0,
      IconComponent: IconClock,
      iconColor: '#8b6914',
      bgColor: '#faf6f0',
      borderColor: '#f0e6d2',
      trend: '+5%'
    },
    {
      title: 'Équipe Disponible',
      value: stats.equipeDisponible || 0,
      IconComponent: IconUsers,
      iconColor: '#6b7c3d',
      bgColor: '#f5f0e8',
      borderColor: '#e8dcc0',
      trend: '0%'
    },
    {
      title: 'Charge de Travail',
      value: `${stats.chargeTravail || 0}%`,
      IconComponent: IconChartBar,
      iconColor: stats.chargeTravail > 80 ? '#dc2626' : '#6b7c3d',
      bgColor: stats.chargeTravail > 80 ? '#fef2f2' : '#f0f4e8',
      borderColor: stats.chargeTravail > 80 ? '#fecaca' : '#d9e2c4',
      trend: '+8%'
    }
  ];

  return (
    <div className={`
      ${isSidebar ? 'space-y-6' : isCompact ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-4 gap-6'}
    `}>
      {statItems.map((item, index) => (
        <div
          key={index}
          className={`
            rounded-xl border transition-all duration-200 hover:shadow-lg hover:border-[#6b7c3d]
            ${isSidebar ? 'p-6' : isCompact ? 'p-4' : 'p-6'}
          `}
          style={{
            backgroundColor: item.bgColor,
            borderColor: item.borderColor
          }}
        >
          <div className={`flex items-center ${isSidebar ? 'justify-between mb-4' : isCompact ? 'justify-between mb-3' : 'justify-between mb-4'}`}>
            <div className={`
              rounded-lg p-3 bg-white/60 backdrop-blur-sm
              ${isSidebar ? 'p-4' : ''}
            `}>
              <item.IconComponent 
                className={`${isSidebar ? 'h-8 w-8' : isCompact ? 'h-5 w-5' : 'h-6 w-6'}`}
                style={{ color: item.iconColor }}
              />
            </div>
            
            {isSidebar && (
              <div className="text-right">
                <div className={`
                  text-sm font-medium
                  ${item.trend.startsWith('+') ? 'text-green-600' : item.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'}
                `}>
                  {item.trend}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">vs semaine dernière</div>
              </div>
            )}
          </div>

          <div className={`
            font-bold text-[#000000] mb-2
            ${isSidebar ? 'text-3xl' : isCompact ? 'text-xl' : 'text-2xl'}
          `}>
            {item.value}
          </div>

          <div className={`
            text-[#333333] font-medium
            ${isSidebar ? 'text-lg' : isCompact ? 'text-sm' : 'text-base'}
          `}>
            {item.title}
          </div>

          {!isSidebar && !isCompact && (
            <div className="mt-3 flex items-center text-sm">
              <span className={`
                ${item.trend.startsWith('+') ? 'text-green-600' : item.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'}
                font-medium
              `}>
                {item.trend}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">vs période précédente</span>
            </div>
          )}

          {/* Barre de progression pour la charge de travail */}
          {item.title === 'Charge de Travail' && isSidebar && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`
                    h-3 rounded-full transition-all duration-500
                    ${stats.chargeTravail > 80 ? 'bg-red-500' : stats.chargeTravail > 60 ? 'bg-yellow-500' : 'bg-green-500'}
                  `}
                  style={{ width: `${Math.min(stats.chargeTravail || 0, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlanningStats; 