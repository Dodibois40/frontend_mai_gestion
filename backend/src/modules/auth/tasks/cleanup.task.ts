import { Injectable, Logger } from '@nestjs/common';
import { SecurityService } from '../security.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CleanupTask {
  private readonly logger = new Logger(CleanupTask.name);

  constructor(
    private readonly securityService: SecurityService,
    private readonly prisma: PrismaService,
  ) {
    // Lancer le nettoyage immédiatement au démarrage
    this.startPeriodicCleanup();
  }

  private startPeriodicCleanup() {
    // Nettoyage des sessions expirées toutes les heures
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000); // 1 heure

    // Nettoyage quotidien à minuit (approximativement)
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    setTimeout(() => {
      this.cleanupOldData();
      // Répéter chaque jour
      setInterval(() => {
        this.cleanupOldData();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }

  async cleanupExpiredSessions() {
    this.logger.log('Nettoyage des sessions expirées...');
    
    try {
      await this.securityService.cleanupExpiredSessions();
      this.logger.log('Nettoyage des sessions terminé avec succès');
    } catch (error) {
      this.logger.error('Erreur lors du nettoyage des sessions:', error);
    }
  }

  async cleanupOldData() {
    await this.cleanupOldLoginAttempts();
    await this.cleanupOldLoginAudits();
    await this.cleanupInactiveSessions();
  }

  async cleanupOldLoginAttempts() {
    this.logger.log('Nettoyage des anciennes tentatives de connexion...');
    
    try {
      // Supprimer les tentatives de connexion de plus de 30 jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deleted = await this.prisma.loginAttempt.deleteMany({
        where: {
          attemptTime: {
            lt: thirtyDaysAgo,
          },
        },
      });

      this.logger.log(`${deleted.count} anciennes tentatives de connexion supprimées`);
    } catch (error) {
      this.logger.error('Erreur lors du nettoyage des tentatives de connexion:', error);
    }
  }

  async cleanupOldLoginAudits() {
    this.logger.log('Nettoyage des anciens audits de connexion...');
    
    try {
      // Supprimer les audits de plus de 90 jours
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const deleted = await this.prisma.loginAudit.deleteMany({
        where: {
          loginTime: {
            lt: ninetyDaysAgo,
          },
        },
      });

      this.logger.log(`${deleted.count} anciens audits de connexion supprimés`);
    } catch (error) {
      this.logger.error('Erreur lors du nettoyage des audits:', error);
    }
  }

  async cleanupInactiveSessions() {
    this.logger.log('Nettoyage des sessions inactives...');
    
    try {
      // Supprimer les sessions inactives de plus de 7 jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const deleted = await this.prisma.userSession.deleteMany({
        where: {
          OR: [
            { isActive: false },
            {
              lastActivity: {
                lt: sevenDaysAgo,
              },
            },
          ],
        },
      });

      this.logger.log(`${deleted.count} sessions inactives supprimées`);
    } catch (error) {
      this.logger.error('Erreur lors du nettoyage des sessions inactives:', error);
    }
  }

  // Méthode publique pour forcer le nettoyage
  async forceCleanup() {
    this.logger.log('Nettoyage forcé démarré...');
    await this.cleanupExpiredSessions();
    await this.cleanupOldData();
    this.logger.log('Nettoyage forcé terminé');
  }
} 