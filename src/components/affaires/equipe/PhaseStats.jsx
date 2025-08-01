import React from 'react';
import { 
  IconClock, 
  IconCurrencyEuro, 
  IconUsers, 
  IconTrendingUp 
} from '@tabler/icons-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency, formatHours } from '@/utils/affaires';

export const PhaseStats = ({ phases = [], loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calcul des statistiques
  const totalPhases = phases.length;
  const phasesTerminees = phases.filter(p => p.statut === 'TERMINEE').length;
  const phasesEnCours = phases.filter(p => p.statut === 'EN_COURS').length;
  
  const totalTempsEstime = phases.reduce((sum, phase) => sum + (phase.tempsEstimeH || 0), 0);
  const totalTempsReel = phases.reduce((sum, phase) => sum + (phase.tempsReelH || 0), 0);
  const totalCoutEstime = phases.reduce((sum, phase) => sum + (phase.coutEstime || 0), 0);
  const totalCoutReel = phases.reduce((sum, phase) => sum + (phase.coutReel || 0), 0);

  const avancementPourcentage = totalPhases > 0 ? Math.round((phasesTerminees / totalPhases) * 100) : 0;

  const stats = [
    {
      title: 'Phases totales',
      value: totalPhases,
      subtitle: `${phasesTerminees} terminées, ${phasesEnCours} en cours`,
      icon: IconUsers,
      color: 'blue'
    },
    {
      title: 'Avancement',
      value: `${avancementPourcentage}%`,
      subtitle: `${phasesTerminees}/${totalPhases} phases`,
      icon: IconTrendingUp,
      color: 'green'
    },
    {
      title: 'Temps de travail',
      value: formatHours(totalTempsReel),
      subtitle: `Estimé: ${formatHours(totalTempsEstime)}`,
      icon: IconClock,
      color: 'orange'
    },
    {
      title: 'Coût réel',
      value: formatCurrency(totalCoutReel),
      subtitle: `Estimé: ${formatCurrency(totalCoutEstime)}`,
      icon: IconCurrencyEuro,
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                  stat.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  'bg-purple-100 dark:bg-purple-900/30'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    stat.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    'text-purple-600 dark:text-purple-400'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PhaseStats; 