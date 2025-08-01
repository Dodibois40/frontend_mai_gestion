import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface Notification {
  id: string;
  type: 'stock_faible' | 'echeance_affaire' | 'bdc_en_attente' | 'pointage_manquant' | 'info';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: Date;
  data?: any;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Générer toutes les notifications actives
  async getActiveNotifications(): Promise<Notification[]> {
    const notifications: Notification[] = [];

    // 1. Notifications de stock faible
    const stockNotifications = await this.getStockFaibleNotifications();
    notifications.push(...stockNotifications);

    // 2. Notifications d'échéances d'affaires
    const echeanceNotifications = await this.getEcheanceAffairesNotifications();
    notifications.push(...echeanceNotifications);

    // 3. Notifications de BDC en attente
    const bdcNotifications = await this.getBdcEnAttenteNotifications();
    notifications.push(...bdcNotifications);

    // 4. Notifications de pointages manquants
    const pointageNotifications = await this.getPointageManquantNotifications();
    notifications.push(...pointageNotifications);

    // Trier par priorité et date
    return notifications.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  // Notifications de stock faible
  private async getStockFaibleNotifications(): Promise<Notification[]> {
    // Récupérer tous les articles actifs et filtrer côté application
    const articles = await this.prisma.article.findMany({
      where: { actif: true },
      select: {
        code: true,
        designation: true,
        stockActuel: true,
        stockMinimum: true,
        unite: true
      }
    });

    const articlesStockFaible = articles.filter(article => 
      article.stockActuel <= article.stockMinimum || article.stockActuel === 0
    );

    return articlesStockFaible.map(article => ({
      id: `stock_${article.code}`,
      type: 'stock_faible' as const,
      title: 'Stock faible',
      message: `${article.designation} (${article.code}) : ${article.stockActuel} ${article.unite} restant(s)`,
      priority: article.stockActuel === 0 ? 'urgent' as const : 'high' as const,
      read: false,
      createdAt: new Date(),
      data: {
        articleCode: article.code,
        stockActuel: article.stockActuel,
        stockMinimum: article.stockMinimum
      }
    }));
  }

  // Notifications d'échéances d'affaires
  private async getEcheanceAffairesNotifications(): Promise<Notification[]> {
    const now = new Date();
    const dans7Jours = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dans30Jours = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const affairesEcheance = await this.prisma.affaire.findMany({
      where: {
        statut: { in: ['PLANIFIEE', 'EN_COURS'] },
        dateCloturePrevue: {
          lte: dans30Jours,
          gte: now
        }
      },
      select: {
        numero: true,
        libelle: true,
        client: true,
        dateCloturePrevue: true,
        statut: true
      }
    });

    return affairesEcheance.map(affaire => {
      const joursRestants = Math.ceil(
        (affaire.dateCloturePrevue!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );

      let priority: 'low' | 'medium' | 'high' | 'urgent';
      if (joursRestants <= 3) priority = 'urgent';
      else if (joursRestants <= 7) priority = 'high';
      else if (joursRestants <= 14) priority = 'medium';
      else priority = 'low';

      return {
        id: `echeance_${affaire.numero}`,
        type: 'echeance_affaire' as const,
        title: 'Échéance proche',
        message: `Affaire ${affaire.numero} (${affaire.client}) - Clôture prévue dans ${joursRestants} jour(s)`,
        priority,
        read: false,
        createdAt: new Date(),
        data: {
          affaireNumero: affaire.numero,
          dateCloturePrevue: affaire.dateCloturePrevue,
          joursRestants
        }
      };
    });
  }

  // Notifications de BDC en attente de réception
  private async getBdcEnAttenteNotifications(): Promise<Notification[]> {
    const now = new Date();
    const il7JoursAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const bdcEnAttente = await this.prisma.bdc.findMany({
      where: {
        dateReception: null,
        dateBdc: { lte: il7JoursAgo }
      },
      include: {
        affaire: { select: { numero: true } }
      }
    });

    return bdcEnAttente.map(bdc => {
      const joursAttente = Math.ceil(
        (now.getTime() - bdc.dateBdc.getTime()) / (24 * 60 * 60 * 1000)
      );

      return {
        id: `bdc_${bdc.numero}`,
        type: 'bdc_en_attente' as const,
        title: 'BDC en attente',
        message: `BDC ${bdc.numero} (${bdc.fournisseur}) en attente de réception depuis ${joursAttente} jour(s)`,
        priority: joursAttente > 14 ? 'high' as const : 'medium' as const,
        read: false,
        createdAt: new Date(),
        data: {
          bdcNumero: bdc.numero,
          fournisseur: bdc.fournisseur,
          joursAttente,
          affaireNumero: bdc.affaire.numero
        }
      };
    });
  }

  // Notifications de pointages manquants
  private async getPointageManquantNotifications(): Promise<Notification[]> {
    const now = new Date();
    const hier = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const debutSemaine = new Date(now);
    debutSemaine.setDate(now.getDate() - now.getDay() + 1); // Lundi

    // Vérifier les pointages manquants de la semaine
    const utilisateursActifs = await this.prisma.user.findMany({
      where: { role: { in: ['CHEF_ATELIER', 'CHARGE_AFFAIRE'] } },
      select: { id: true, nom: true, prenom: true }
    });

    const notifications: Notification[] = [];

    for (const user of utilisateursActifs) {
      const pointagesRecents = await this.prisma.pointage.count({
        where: {
          userId: user.id,
          datePointage: { gte: debutSemaine }
        }
      });

      // Si aucun pointage cette semaine
      if (pointagesRecents === 0) {
        notifications.push({
          id: `pointage_${user.id}`,
          type: 'pointage_manquant' as const,
          title: 'Pointage manquant',
          message: `${user.prenom} ${user.nom} n'a pas de pointage cette semaine`,
          priority: 'medium' as const,
          read: false,
          createdAt: new Date(),
          data: {
            userId: user.id,
            userName: `${user.prenom} ${user.nom}`
          }
        });
      }
    }

    return notifications;
  }

  // Obtenir le nombre de notifications non lues
  async getUnreadCount(): Promise<number> {
    const notifications = await this.getActiveNotifications();
    return notifications.filter(n => !n.read).length;
  }

  // Obtenir les notifications par type
  async getNotificationsByType(type: Notification['type']): Promise<Notification[]> {
    const allNotifications = await this.getActiveNotifications();
    return allNotifications.filter(n => n.type === type);
  }

  // Obtenir les statistiques des notifications
  async getNotificationStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const notifications = await this.getActiveNotifications();
    
    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: notifications.length,
      byType,
      byPriority
    };
  }

  // Créer une notification personnalisée
  async createCustomNotification(
    type: Notification['type'],
    title: string,
    message: string,
    priority: Notification['priority'] = 'medium',
    data?: any
  ): Promise<Notification> {
    return {
      id: `custom_${Date.now()}`,
      type,
      title,
      message,
      priority,
      read: false,
      createdAt: new Date(),
      data
    };
  }
} 