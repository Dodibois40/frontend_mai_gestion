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
  IconX,
  IconRefresh
} from '@tabler/icons-react';
import { notificationsService } from '@/services/notificationsService';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);

  // Charger les notifications
  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const [notifs, count] = await Promise.all([
        notificationsService.getNotifications(),
        notificationsService.getUnreadCount()
      ]);
      setNotifications(notifs.slice(0, 10)); // Limite à 10 notifications dans le dropdown
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      setError('Erreur de chargement');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage et périodiquement
  useEffect(() => {
    loadNotifications();
    
    // Actualiser toutes les 60 secondes (réduit pour éviter trop de requêtes)
    const interval = setInterval(loadNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Obtenir l'icône selon le type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'stock_faible':
        return <IconPackage size={16} className="text-orange-600" />;
      case 'echeance_affaire':
        return <IconCalendarEvent size={16} className="text-blue-600" />;
      case 'bdc_en_attente':
        return <IconClipboardList size={16} className="text-purple-600" />;
      case 'pointage_manquant':
        return <IconClock size={16} className="text-yellow-600" />;
      default:
        return <IconInfoCircle size={16} className="text-gray-600" />;
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
        return <IconAlertTriangle size={12} className="text-red-600" />;
      case 'high':
        return <IconExclamationMark size={12} className="text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Bouton de notification */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        title={`${unreadCount} notification(s)`}
      >
        <IconBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown des notifications */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadNotifications}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Actualiser"
              >
                <IconRefresh size={16} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <IconX size={16} />
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="max-h-96 overflow-y-auto">
            {error && (
              <div className="p-4 text-center text-red-600 text-sm">
                {error}
                <button
                  onClick={loadNotifications}
                  className="block mx-auto mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Réessayer
                </button>
              </div>
            )}

            {loading && notifications.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm">Chargement...</p>
              </div>
            )}

            {!loading && notifications.length === 0 && !error && (
              <div className="p-4 text-center text-gray-500">
                <IconBell size={24} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucune notification</p>
              </div>
            )}

            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-l-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${getPriorityColor(notification.priority)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-1">
                        {getPriorityIcon(notification.priority)}
                        <span className="text-xs text-gray-500">
                          {notificationsService.formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {notificationsService.getTypeLabel(notification.type)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  // Navigation vers une page de notifications complète (à implémenter)
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay pour fermer le dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter; 