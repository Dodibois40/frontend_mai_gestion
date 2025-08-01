import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Shield, 
  Activity, 
  Bell, 
  Settings, 
  Calendar, 
  Users, 
  Briefcase, 
  TrendingUp,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    projectsActive: 0,
    tasksCompleted: 0,
    hoursWorked: 0,
    teamMembers: 0
  });

  useEffect(() => {
    // Simuler le chargement des données utilisateur
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // Simulation de données - à remplacer par des appels API réels
    setStats({
      projectsActive: 3,
      tasksCompleted: 24,
      hoursWorked: 156,
      teamMembers: 8
    });

    setNotifications([
      {
        id: 1,
        type: 'security',
        title: 'Nouvelle connexion détectée',
        message: 'Connexion depuis Paris, France',
        time: '2 min',
        unread: true
      },
      {
        id: 2,
        type: 'task',
        title: 'Tâche assignée',
        message: 'Révision du projet Maison Dupont',
        time: '1h',
        unread: true
      },
      {
        id: 3,
        type: 'system',
        title: 'Sauvegarde terminée',
        message: 'Vos données ont été sauvegardées',
        time: '3h',
        unread: false
      }
    ]);

    setRecentActivity([
      {
        id: 1,
        action: 'Connexion',
        details: 'Connexion depuis Chrome sur Windows',
        time: '9:45',
        icon: 'login'
      },
      {
        id: 2,
        action: 'Mise à jour profil',
        details: 'Photo de profil modifiée',
        time: 'Hier',
        icon: 'profile'
      },
      {
        id: 3,
        action: 'Tâche terminée',
        details: 'Estimation matériaux - Chantier Nord',
        time: 'Hier',
        icon: 'task'
      }
    ]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'task': return <Briefcase className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return <Activity className="w-4 h-4" />;
      case 'profile': return <User className="w-4 h-4" />;
      case 'task': return <Briefcase className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête de bienvenue */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Bonjour, {user?.prenom || 'Utilisateur'} ! 👋
                </h1>
                <p className="text-amber-100 text-lg">
                  Bienvenue sur votre tableau de bord personnel
                </p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-amber-100">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>Bureau Principal</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{new Date().toLocaleDateString('fr-FR', { weekday: 'long' })}</div>
              <div className="text-amber-100">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-amber-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Projets actifs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.projectsActive}</p>
                <p className="text-sm text-green-600 mt-1">+2 ce mois</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Tâches terminées</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.tasksCompleted}</p>
                <p className="text-sm text-green-600 mt-1">+8 cette semaine</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Heures travaillées</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.hoursWorked}h</p>
                <p className="text-sm text-blue-600 mt-1">Ce mois-ci</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Équipe</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.teamMembers}</p>
                <p className="text-sm text-purple-600 mt-1">Collaborateurs</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications récentes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-amber-600" />
                  Notifications récentes
                </h2>
                <button 
                  onClick={() => navigate('/notifications')}
                  className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center"
                >
                  Voir tout <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      notification.unread 
                        ? 'bg-amber-50 border-amber-400' 
                        : 'bg-gray-50 border-gray-300'
                    } hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'security' ? 'bg-red-100 text-red-600' :
                          notification.type === 'task' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{notification.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-600" />
                  Activité récente
                </h2>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                      {getActivityIcon(activity.icon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{activity.action}</h3>
                      <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Accès rapides */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Accès rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => navigate('/profile')}
              className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <User className="w-8 h-8 mb-3" />
              <h3 className="font-bold text-lg mb-2">Mon Profil</h3>
              <p className="text-sm opacity-90">Gérer mes informations personnelles</p>
            </button>

            <button
              onClick={() => navigate('/security')}
              className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Shield className="w-8 h-8 mb-3" />
              <h3 className="font-bold text-lg mb-2">Sécurité</h3>
              <p className="text-sm opacity-90">2FA et paramètres de sécurité</p>
            </button>

            <button
              onClick={() => navigate('/preferences')}
              className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Settings className="w-8 h-8 mb-3" />
              <h3 className="font-bold text-lg mb-2">Préférences</h3>
              <p className="text-sm opacity-90">Thème et notifications</p>
            </button>

            <button
              onClick={() => navigate('/activity')}
              className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Activity className="w-8 h-8 mb-3" />
              <h3 className="font-bold text-lg mb-2">Activité</h3>
              <p className="text-sm opacity-90">Historique des connexions</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 