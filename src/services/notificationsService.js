import api from './api.js';

export const notificationsService = {
  // Récupérer toutes les notifications
  async getNotifications() {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  },

  // Récupérer le nombre de notifications non lues
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de notifications:', error);
      throw error;
    }
  },

  // Marquer une notification comme lue
  async markAsRead(id) {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      throw error;
    }
  },

  // Récupérer les statistiques des notifications
  async getNotificationStats() {
    try {
      const response = await api.get('/notifications/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  // Obtenir les notifications par type
  async getNotificationsByType(type) {
    try {
      const response = await api.get(`/notifications/by-type?type=${type}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des notifications ${type}:`, error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des notifications');
    }
  },

  // Obtenir les notifications de stock faible
  async getStockFaibleNotifications() {
    try {
      const response = await api.get('/notifications/stock-faible');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications de stock:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des notifications de stock');
    }
  },

  // Obtenir les notifications d'échéances
  async getEcheanceNotifications() {
    try {
      const response = await api.get('/notifications/echeances');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications d\'échéances:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des notifications d\'échéances');
    }
  },

  // Obtenir les notifications de BDC en attente
  async getBdcAttenteNotifications() {
    try {
      const response = await api.get('/notifications/bdc-attente');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications BDC:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des notifications BDC');
    }
  },

  // Obtenir les notifications de pointages manquants
  async getPointageManquantNotifications() {
    try {
      const response = await api.get('/notifications/pointages-manquants');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications de pointages:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des notifications de pointages');
    }
  },

  // Utilitaires pour l'interface
  getPriorityColor(priority) {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'blue';
      default:
        return 'gray';
    }
  },

  getPriorityIcon(priority) {
    switch (priority) {
      case 'urgent':
        return 'IconAlertTriangle';
      case 'high':
        return 'IconExclamationMark';
      case 'medium':
        return 'IconInfoCircle';
      case 'low':
        return 'IconBell';
      default:
        return 'IconBell';
    }
  },

  getTypeIcon(type) {
    switch (type) {
      case 'stock_faible':
        return 'IconPackage';
      case 'echeance_affaire':
        return 'IconCalendarEvent';
      case 'bdc_en_attente':
        return 'IconClipboardList';
      case 'pointage_manquant':
        return 'IconClock';
      case 'info':
        return 'IconInfoCircle';
      default:
        return 'IconBell';
    }
  },

  getTypeLabel(type) {
    switch (type) {
      case 'stock_faible':
        return 'Stock faible';
      case 'echeance_affaire':
        return 'Échéance proche';
      case 'bdc_en_attente':
        return 'BDC en attente';
      case 'pointage_manquant':
        return 'Pointage manquant';
      case 'info':
        return 'Information';
      default:
        return 'Notification';
    }
  },

  formatTimeAgo(date) {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return notificationDate.toLocaleDateString('fr-FR');
  }
}; 