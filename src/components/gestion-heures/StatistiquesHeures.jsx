import React, { useState, useEffect } from 'react';
import { 
  IconClock, 
  IconUsers, 
  IconTrendingUp,
  IconTrendingDown,
  IconCalendar,
  IconMapPin,
  IconAlertCircle,
  IconCheck
} from '@tabler/icons-react';
import pointageHeuresService from '../../services/pointageHeuresService';

const StatistiquesHeures = ({ 
  currentDate, 
  viewMode,
  selectedUserId,
  selectedLieu 
}) => {
  const [stats, setStats] = useState(null);
  const [statsEquipe, setStatsEquipe] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatistiques();
  }, [currentDate, viewMode, selectedUserId, selectedLieu]);

  const loadStatistiques = async () => {
    try {
      setLoading(true);
      
      let dateDebut, dateFin;
      if (viewMode === 'semaine') {
        dateDebut = pointageHeuresService.formatDate(pointageHeuresService.getWeekStart(currentDate));
        dateFin = pointageHeuresService.formatDate(pointageHeuresService.getWeekEnd(currentDate));
      } else {
        dateDebut = pointageHeuresService.formatDate(pointageHeuresService.getMonthStart(currentDate));
        dateFin = pointageHeuresService.formatDate(pointageHeuresService.getMonthEnd(currentDate));
      }

      if (selectedUserId) {
        // Statistiques pour un utilisateur spécifique
        const userStats = await pointageHeuresService.getStatistiquesUtilisateur(selectedUserId, dateDebut, dateFin);
        setStats(userStats);
        setStatsEquipe([]);
      } else {
        // Statistiques de l'équipe
        const equipeStats = await pointageHeuresService.getStatistiquesEquipe(dateDebut, dateFin);
        setStatsEquipe(equipeStats);
        
        // Calculer les stats globales
        const globalStats = {
          totalHeures: equipeStats.reduce((sum, s) => sum + s.totalHeures, 0),
          joursPresents: equipeStats.reduce((sum, s) => sum + s.joursPresents, 0),
          joursAbsents: equipeStats.reduce((sum, s) => sum + s.joursAbsents, 0),
          retards: equipeStats.reduce((sum, s) => sum + s.retards, 0),
          moyenneHeuresParJour: equipeStats.length > 0 
            ? equipeStats.reduce((sum, s) => sum + s.moyenneHeuresParJour, 0) / equipeStats.length 
            : 0,
        };
        setStats(globalStats);
      }
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPeriodTitle = () => {
    if (viewMode === 'semaine') {
      const start = pointageHeuresService.getWeekStart(currentDate);
      const end = pointageHeuresService.getWeekEnd(currentDate);
      return `Semaine du ${start.toLocaleDateString('fr-FR')} au ${end.toLocaleDateString('fr-FR')}`;
    } else {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
  };

  const getPresenceRate = (joursPresents, joursAbsents) => {
    const total = joursPresents + joursAbsents;
    return total > 0 ? (joursPresents / total) * 100 : 0;
  };

  const getStatColor = (value, type) => {
    switch (type) {
      case 'heures':
        if (value >= 35) return 'text-green-600 bg-green-100';
        if (value >= 25) return 'text-orange-600 bg-orange-100';
        return 'text-red-600 bg-red-100';
      case 'presence':
        if (value >= 95) return 'text-green-600 bg-green-100';
        if (value >= 80) return 'text-orange-600 bg-orange-100';
        return 'text-red-600 bg-red-100';
      case 'retards':
        if (value === 0) return 'text-green-600 bg-green-100';
        if (value <= 2) return 'text-orange-600 bg-orange-100';
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedUserId ? 'Statistiques individuelles' : 'Statistiques d\'équipe'}
            </h3>
            <p className="text-sm text-gray-600">{formatPeriodTitle()}</p>
          </div>
          <IconCalendar className="w-6 h-6 text-gray-400" />
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total heures */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total heures</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalHeures.toFixed(1)}h</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <IconClock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatColor(stats.totalHeures, 'heures')}`}>
                  {stats.moyenneHeuresParJour.toFixed(1)}h/jour
                </span>
              </div>
            </div>

            {/* Jours présents */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Jours présents</p>
                  <p className="text-2xl font-bold text-green-900">{stats.joursPresents}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <IconCheck className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatColor(getPresenceRate(stats.joursPresents, stats.joursAbsents), 'presence')}`}>
                  {getPresenceRate(stats.joursPresents, stats.joursAbsents).toFixed(1)}% présence
                </span>
              </div>
            </div>

            {/* Jours absents */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Jours absents</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.joursAbsents}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <IconAlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Retards */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Retards</p>
                  <p className="text-2xl font-bold text-red-900">{stats.retards}</p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <IconTrendingDown className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatColor(stats.retards, 'retards')}`}>
                  {stats.retards === 0 ? 'Excellent' : stats.retards <= 2 ? 'Correct' : 'À améliorer'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Détail par employé (si vue équipe) */}
      {!selectedUserId && statsEquipe.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Détail par employé</h4>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Employé</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Total heures</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Jours présents</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Jours absents</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Retards</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Moyenne/jour</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Présence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {statsEquipe.map((employeStats) => (
                  <tr key={employeStats.user.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-700">
                            {employeStats.user.prenom[0]}{employeStats.user.nom[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {employeStats.user.prenom} {employeStats.user.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employeStats.user.statutContractuel === 'SALARIE' ? 'Salarié' : 'Sous-traitant'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium text-gray-900">
                        {employeStats.totalHeures.toFixed(1)}h
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-green-600 font-medium">
                        {employeStats.joursPresents}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-orange-600 font-medium">
                        {employeStats.joursAbsents}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-red-600 font-medium">
                        {employeStats.retards}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-gray-900 font-medium">
                        {employeStats.moyenneHeuresParJour.toFixed(1)}h
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        getStatColor(getPresenceRate(employeStats.joursPresents, employeStats.joursAbsents), 'presence')
                      }`}>
                        {getPresenceRate(employeStats.joursPresents, employeStats.joursAbsents).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatistiquesHeures; 