import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class MockController {
  @Get('notifications')
  getNotifications() {
    return [];
  }

  @Get('notifications/unread-count')
  getUnreadCount() {
    return { count: 0 };
  }

  @Get('notifications/stats')
  getNotificationStats() {
    return {
      total: 0,
      byType: {},
      byPriority: {}
    };
  }

  @Get('reporting/dashboard')
  getDashboardData() {
    return {
      totalAffaires: 0,
      affairesEnCours: 0,
      affairesTerminees: 0,
      chiffreAffairesMois: 0,
      evolutionCA: 0,
      pointagesEnAttente: 0,
      bdcEnAttente: 0,
      articlesStockFaible: 0
    };
  }

  @Get('mock/affaires')
  getAffaires() {
    return {
      affaires: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    };
  }

  @Get('mock/affaires/stats')
  getAffairesStats() {
    return {
      total: 0,
      planifiees: 0,
      enCours: 0,
      terminees: 0,
      annulees: 0
    };
  }

  @Get('pointages')
  getPointages() {
    return [];
  }
} 