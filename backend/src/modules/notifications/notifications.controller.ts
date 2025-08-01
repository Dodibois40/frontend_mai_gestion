import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';
import { NotificationsService, Notification } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Obtenir toutes les notifications actives
  @Get()
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  async getNotifications(): Promise<Notification[]> {
    return this.notificationsService.getActiveNotifications();
  }

  // Obtenir le nombre de notifications non lues
  @Get('unread-count')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  async getUnreadCount(): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount();
    return { count };
  }

  // Obtenir les notifications par type
  @Get('by-type')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  async getNotificationsByType(
    @Query('type') type: Notification['type']
  ): Promise<Notification[]> {
    return this.notificationsService.getNotificationsByType(type);
  }

  // Obtenir les statistiques des notifications
  @Get('stats')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER)
  async getNotificationStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    return this.notificationsService.getNotificationStats();
  }

  // Obtenir uniquement les notifications de stock faible
  @Get('stock-faible')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  async getStockFaibleNotifications(): Promise<Notification[]> {
    return this.notificationsService.getNotificationsByType('stock_faible');
  }

  // Obtenir uniquement les notifications d'échéances
  @Get('echeances')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  async getEcheanceNotifications(): Promise<Notification[]> {
    return this.notificationsService.getNotificationsByType('echeance_affaire');
  }

  // Obtenir uniquement les notifications de BDC en attente
  @Get('bdc-attente')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER)
  async getBdcAttenteNotifications(): Promise<Notification[]> {
    return this.notificationsService.getNotificationsByType('bdc_en_attente');
  }

  // Obtenir uniquement les notifications de pointages manquants
  @Get('pointages-manquants')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER)
  async getPointageManquantNotifications(): Promise<Notification[]> {
    return this.notificationsService.getNotificationsByType('pointage_manquant');
  }
} 