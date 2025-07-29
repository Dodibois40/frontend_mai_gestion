import React, { useState, useEffect } from 'react';
import {
  IconClock,
  IconCalendar,
  IconChartBar,
  IconChecks,
  IconPlus,
  IconUsers,
  IconTrendingUp,
  IconAlertCircle
} from '@tabler/icons-react';
import PointageForm from './pointage/PointageForm';
import PointageCalendarView from './pointage/PointageCalendarView';
import PointageStats from './pointage/PointageStats';
import PointageValidation from './pointage/PointageValidation';
import pointageService from '@/services/pointageService';

const Pointages = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Charger les statistiques globales
  const loadStats = async () => {
    try {
      const statsData = await pointageService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Onglets disponibles
  const tabs = [
    {
      id: 'calendar',
      label: 'Calendrier',
      icon: <IconCalendar size={20} />,
      component: <PointageCalendarView />
    },
    {
      id: 'validation',
      label: 'Validation',
      icon: <IconChecks size={20} />,
      component: <PointageValidation />
    },
    {
      id: 'stats',
      label: 'Statistiques',
      icon: <IconChartBar size={20} />,
      component: <PointageStats />
    }
  ];

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <IconClock className="text-blue-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Pointages</h1>
            <p className="text-gray-600">Suivi du temps de travail et des heures</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <IconPlus size={16} />
          <span>Nouveau pointage</span>
        </button>
      </div>

      {/* Statistiques rapides */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Heures totales (semaine)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(stats.totalWeek || 0)}
                </p>
              </div>
              <IconClock className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Heures totales (mois)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(stats.totalMonth || 0)}
                </p>
              </div>
              <IconTrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Collaborateurs actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers || 0}</p>
              </div>
              <IconUsers className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente validation</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingValidation || 0}</p>
              </div>
              <IconAlertCircle className="text-orange-500" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Navigation par onglets */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu de l'onglet actif */}
        <div className="p-6">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>

      {/* Modal de formulaire de pointage */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Nouveau pointage</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <PointageForm
                onSuccess={() => {
                  setShowForm(false);
                  loadStats(); // Recharger les stats
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pointages; 