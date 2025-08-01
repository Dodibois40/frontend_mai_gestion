import React, { useState, useEffect } from 'react';
import {
  IconBell,
  IconAlertTriangle,
  IconExclamationMark,
  IconInfoCircle,
  IconPackage,
  IconCalendarEvent,
  IconClipboardList,
  IconClock,
  IconRefresh,
  IconFilter,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus
} from '@tabler/icons-react';
import { notificationsService } from '@/services/notificationsService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Charger les données
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [notifs, statsData] = await Promise.all([
        notificationsService.getNotifications(),
        notificationsService.getNotificationStats()
      ]);
      setNotifications(notifs);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrer les notifications
  const filteredNotifications = notifications.filter(notification => {
    const typeMatch = filterType === 'all' || notification.type === filterType;
    const priorityMatch = filterPriority === 'all' || notification.priority === filterPriority;
    return typeMatch && priorityMatch;
  });

  // Obtenir l'icône selon le type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'stock_faible':
        return <IconPackage size={20} className="text-orange-600" />;
      case 'echeance_affaire':
        return <IconCalendarEvent size={20} className="text-blue-600" />;
      case 'bdc_en_attente':
        return <IconClipboardList size={20} className="text-purple-600" />;
      case 'pointage_manquant':
        return <IconClock size={20} className="text-yellow-600" />;
      default:
        return <IconInfoCircle size={20} className="text-gray-600" />;
    }
  };

  // Obtenir la couleur selon la priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Obtenir l'icône de priorité
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <IconAlertTriangle size={16} className="text-red-600" />;
      case 'high':
        return <IconExclamationMark size={16} className="text-orange-600" />;
      case 'medium':
        return <IconInfoCircle size={16} className="text-yellow-600" />;
      case 'low':
        return <IconMinus size={16} className="text-blue-600" />;
      default:
        return <IconInfoCircle size={16} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <IconAlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <IconBell className="text-blue-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              {notifications.length} notification(s) active(s)
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <IconRefresh size={16} className={loading ? 'animate-spin' : ''} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <IconBell className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgentes</p>
                <p className="text-2xl font-bold text-red-600">{stats.byPriority.urgent || 0}</p>
              </div>
              <IconAlertTriangle className="text-red-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock faible</p>
                <p className="text-2xl font-bold text-orange-600">{stats.byType.stock_faible || 0}</p>
              </div>
              <IconPackage className="text-orange-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Échéances</p>
                <p className="text-2xl font-bold text-blue-600">{stats.byType.echeance_affaire || 0}</p>
              </div>
              <IconCalendarEvent className="text-blue-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <IconFilter className="text-gray-400" size={20} />
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Type :</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">Tous</option>
              <option value="stock_faible">Stock faible</option>
              <option value="echeance_affaire">Échéances</option>
              <option value="bdc_en_attente">BDC en attente</option>
              <option value="pointage_manquant">Pointages manquants</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Priorité :</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">Toutes</option>
              <option value="urgent">Urgente</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {filteredNotifications.length} résultat(s)
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <IconBell className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
            <p className="text-gray-600">
              {filterType !== 'all' || filterPriority !== 'all'
                ? 'Aucune notification correspond aux filtres sélectionnés.'
                : 'Aucune notification active pour le moment.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-l-4 hover:bg-gray-50 transition-colors ${getPriorityColor(notification.priority)}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(notification.priority)}
                        <span className="text-sm text-gray-500">
                          {notificationsService.formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {notificationsService.getTypeLabel(notification.type)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          Priorité {notification.priority === 'urgent' ? 'urgente' : 
                                   notification.priority === 'high' ? 'élevée' :
                                   notification.priority === 'medium' ? 'moyenne' : 'faible'}
                        </span>
                      </div>
                      {notification.data && (
                        <div className="text-sm text-gray-500">
                          {notification.type === 'stock_faible' && (
                            <span>Stock: {notification.data.stockActuel}</span>
                          )}
                          {notification.type === 'echeance_affaire' && (
                            <span>Dans {notification.data.joursRestants} jour(s)</span>
                          )}
                          {notification.type === 'bdc_en_attente' && (
                            <span>Depuis {notification.data.joursAttente} jour(s)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications; 