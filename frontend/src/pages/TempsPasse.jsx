import React, { useState, useEffect } from 'react';
import {
  IconClock,
  IconCalendar,
  IconChartBar,
  IconUser,
  IconBuilding,
  IconFilter,
  IconDownload,
  IconTrendingUp,
  IconTrendingDown,
  IconTarget,
  IconActivity,
  IconCalendarEvent,
  IconChartPie
} from '@tabler/icons-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const TempsPasse = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeData, setTimeData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedAffaire, setSelectedAffaire] = useState('');

  // Données d'exemple (à remplacer par l'API)
  const mockData = {
    timeEntries: [
      {
        id: 1,
        userId: 1,
        userName: 'Jean Martin',
        affaireId: 1,
        affaireName: 'Cuisine Dupont',
        date: '2024-01-15',
        heuresNormales: 8,
        heuresSupplementaires: 2,
        typeHeure: 'normale',
        description: 'Installation des meubles hauts',
        taux: 35
      },
      {
        id: 2,
        userId: 2,
        userName: 'Pierre Durand',
        affaireId: 1,
        affaireName: 'Cuisine Dupont',
        date: '2024-01-15',
        heuresNormales: 7,
        heuresSupplementaires: 0,
        typeHeure: 'normale',
        description: 'Préparation et découpe',
        taux: 28
      },
      {
        id: 3,
        userId: 1,
        userName: 'Jean Martin',
        affaireId: 2,
        affaireName: 'Dressing chambre',
        date: '2024-01-16',
        heuresNormales: 6,
        heuresSupplementaires: 0,
        typeHeure: 'normale',
        description: 'Prise de mesures et étude',
        taux: 35
      }
    ],
    users: [
      { id: 1, name: 'Jean Martin', role: 'Menuisier senior', tauxHoraire: 35 },
      { id: 2, name: 'Pierre Durand', role: 'Apprenti', tauxHoraire: 28 },
      { id: 3, name: 'Marie Petit', role: 'Chef d\'équipe', tauxHoraire: 42 }
    ],
    affaires: [
      { id: 1, name: 'Cuisine Dupont', budget: 15000 },
      { id: 2, name: 'Dressing chambre', budget: 8000 },
      { id: 3, name: 'Aménagement bureau', budget: 12000 }
    ]
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTimeData(mockData.timeEntries);
      calculateStats(mockData.timeEntries);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalHeures = data.reduce((total, entry) => total + entry.heuresNormales + entry.heuresSupplementaires, 0);
    const totalCout = data.reduce((total, entry) => total + (entry.heuresNormales + entry.heuresSupplementaires) * entry.taux, 0);
    const moyenneHeuresToday = data.filter(entry => entry.date === format(new Date(), 'yyyy-MM-dd'))
      .reduce((total, entry) => total + entry.heuresNormales + entry.heuresSupplementaires, 0);
    
    const groupedByUser = data.reduce((acc, entry) => {
      if (!acc[entry.userName]) {
        acc[entry.userName] = 0;
      }
      acc[entry.userName] += entry.heuresNormales + entry.heuresSupplementaires;
      return acc;
    }, {});

    const groupedByAffaire = data.reduce((acc, entry) => {
      if (!acc[entry.affaireName]) {
        acc[entry.affaireName] = 0;
      }
      acc[entry.affaireName] += entry.heuresNormales + entry.heuresSupplementaires;
      return acc;
    }, {});

    setStats({
      totalHeures,
      totalCout,
      moyenneHeuresToday,
      nombreCollaborateurs: Object.keys(groupedByUser).length,
      repartitionUtilisateurs: groupedByUser,
      repartitionAffaires: groupedByAffaire,
      tendance: totalHeures > 160 ? 'up' : 'down' // Simulation
    });
  };

  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h${m.toString().padStart(2, '0')}`;
  };

  // Configuration des graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, family: 'Inter' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 11 } }
      }
    }
  };

  // Données pour le graphique des heures par jour
  const hoursLineData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Heures travaillées',
        data: [48, 52, 45, 38, 42, 8, 0], // Simulation
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Données pour la répartition par utilisateur
  const usersData = stats ? {
    labels: Object.keys(stats.repartitionUtilisateurs),
    datasets: [
      {
        data: Object.values(stats.repartitionUtilisateurs),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  } : null;

  // Données pour la répartition par affaire
  const affairesBarData = stats ? {
    labels: Object.keys(stats.repartitionAffaires),
    datasets: [
      {
        label: 'Heures par affaire',
        data: Object.values(stats.repartitionAffaires),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    ]
  } : null;

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: IconChartBar },
    { id: 'users', label: 'Par utilisateur', icon: IconUser },
    { id: 'projects', label: 'Par affaire', icon: IconBuilding },
    { id: 'details', label: 'Détails', icon: IconActivity }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <IconClock className="text-blue-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suivi du Temps Passé</h1>
            <p className="text-gray-600">Analyse et rapports du temps de travail</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          
          <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            <IconDownload size={16} />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Statistiques principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total heures</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatTime(stats.totalHeures)}
                </p>
                <div className="flex items-center mt-2">
                  {stats.tendance === 'up' ? (
                    <IconTrendingUp className="text-green-500 mr-1" size={16} />
                  ) : (
                    <IconTrendingDown className="text-red-500 mr-1" size={16} />
                  )}
                  <span className={`text-sm ${stats.tendance === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.tendance === 'up' ? '+12%' : '-5%'} vs semaine précédente
                  </span>
                </div>
              </div>
              <IconClock className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coût total</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalCout.toLocaleString()}€
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Moy: {Math.round(stats.totalCout / stats.totalHeures)}€/h
                </p>
              </div>
              <IconTarget className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Collaborateurs actifs</p>
                <p className="text-2xl font-bold text-purple-600">{stats.nombreCollaborateurs}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Moy: {formatTime(stats.totalHeures / stats.nombreCollaborateurs)}/pers
                </p>
              </div>
              <IconUser className="text-purple-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Heures aujourd'hui</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatTime(stats.moyenneHeuresToday)}
                </p>
                <p className="text-sm text-gray-500 mt-2">En cours</p>
              </div>
              <IconCalendarEvent className="text-orange-500" size={40} />
            </div>
          </div>
        </div>
      )}

      {/* Navigation par onglets */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique évolution heures */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des heures</h3>
                <div className="h-64">
                  <Line data={hoursLineData} options={chartOptions} />
                </div>
              </div>

              {/* Répartition par utilisateur */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par utilisateur</h3>
                <div className="h-64">
                  {usersData && <Doughnut data={usersData} options={chartOptions} />}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Analyse par utilisateur</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockData.users.map(user => {
                  const userHours = stats?.repartitionUtilisateurs[user.name] || 0;
                  const userCost = userHours * user.tauxHoraire;
                  
                  return (
                    <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <IconUser className="text-blue-600" size={24} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.role}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Heures totales:</span>
                          <span className="font-semibold">{formatTime(userHours)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taux horaire:</span>
                          <span className="font-semibold">{user.tauxHoraire}€/h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Coût total:</span>
                          <span className="font-semibold text-green-600">{userCost.toLocaleString()}€</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Analyse par affaire</h3>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Heures par affaire</h4>
                <div className="h-64">
                  {affairesBarData && <Bar data={affairesBarData} options={chartOptions} />}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockData.affaires.map(affaire => {
                  const affaireHours = stats?.repartitionAffaires[affaire.name] || 0;
                  const progress = affaireHours > 0 ? Math.min((affaireHours * 35) / affaire.budget * 100, 100) : 0;
                  
                  return (
                    <div key={affaire.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <IconBuilding className="text-green-600" size={24} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{affaire.name}</h4>
                          <p className="text-sm text-gray-600">Budget: {affaire.budget.toLocaleString()}€</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Heures passées:</span>
                          <span className="font-semibold">{formatTime(affaireHours)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Coût estimé:</span>
                          <span className="font-semibold">{(affaireHours * 35).toLocaleString()}€</span>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progression:</span>
                            <span className="font-semibold">{progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Détails des entrées de temps</h3>
                <div className="flex space-x-3">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Tous les utilisateurs</option>
                    {mockData.users.map(user => (
                      <option key={user.id} value={user.name}>{user.name}</option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedAffaire}
                    onChange={(e) => setSelectedAffaire(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Toutes les affaires</option>
                    {mockData.affaires.map(affaire => (
                      <option key={affaire.id} value={affaire.name}>{affaire.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Affaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Heures
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coût
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {timeData
                      .filter(entry => !selectedUser || entry.userName === selectedUser)
                      .filter(entry => !selectedAffaire || entry.affaireName === selectedAffaire)
                      .map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(entry.date), 'dd/MM/yyyy', { locale: fr })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <IconUser className="text-blue-600" size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{entry.userName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.affaireName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(entry.heuresNormales + entry.heuresSupplementaires)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {((entry.heuresNormales + entry.heuresSupplementaires) * entry.taux).toLocaleString()}€
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {entry.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TempsPasse;
