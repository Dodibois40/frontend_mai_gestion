import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SecurityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Enregistre une tentative de connexion dans l'audit
   */
  async logLoginAttempt(
    email: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    userId?: string,
    failureReason?: string,
    locationInfo?: string,
    deviceInfo?: string,
  ) {
    // Enregistrer dans login_attempts
    await this.prisma.loginAttempt.create({
      data: {
        userId,
        email,
        ipAddress,
        success,
        failureReason,
        userAgent,
      },
    });

    // Si l'utilisateur existe, enregistrer aussi dans login_audits
    if (userId) {
      await this.prisma.loginAudit.create({
        data: {
          userId,
          ipAddress,
          userAgent,
          loginResult: success ? 'SUCCESS' : 'FAILED',
          failureReason,
          locationInfo,
          deviceInfo,
        },
      });
    }
  }

  /**
   * Vérifie si un utilisateur est bloqué
   */
  async isUserBlocked(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isBlocked: true, blockedUntil: true },
    });

    if (!user?.isBlocked) return false;

    // Vérifier si le blocage a expiré
    if (user.blockedUntil && user.blockedUntil < new Date()) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isBlocked: false,
          blockedUntil: null,
          failedLoginAttempts: 0,
        },
      });
      return false;
    }

    return user.isBlocked;
  }

  /**
   * Incrémente les tentatives de connexion échouées et bloque si nécessaire
   */
  async handleFailedLogin(userId: string): Promise<boolean> {
    const securitySettings = await this.getSecuritySettings();
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { failedLoginAttempts: true },
    });

    const newAttempts = (user?.failedLoginAttempts || 0) + 1;
    const shouldBlock = newAttempts >= securitySettings.maxFailedAttempts;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: newAttempts,
        ...(shouldBlock && {
          isBlocked: true,
          blockedUntil: new Date(
            Date.now() + securitySettings.lockoutDurationMinutes * 60 * 1000
          ),
        }),
      },
    });

    return shouldBlock;
  }

  /**
   * Réinitialise les tentatives de connexion échouées après une connexion réussie
   */
  async resetFailedAttempts(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        isBlocked: false,
        blockedUntil: null,
        lastLoginAt: new Date(),
      },
    });
  }

  /**
   * Valide la force d'un mot de passe selon les règles de sécurité
   */
  async validatePasswordStrength(password: string): Promise<{
    isValid: boolean;
    errors: string[];
    score: number;
  }> {
    const securitySettings = await this.getSecuritySettings();
    const errors: string[] = [];
    let score = 0;

    // Longueur minimale
    if (password.length < securitySettings.passwordMinLength) {
      errors.push(`Le mot de passe doit contenir au moins ${securitySettings.passwordMinLength} caractères`);
    } else {
      score += 20;
    }

    // Majuscules
    if (securitySettings.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    } else if (/[A-Z]/.test(password)) {
      score += 20;
    }

    // Minuscules
    if (securitySettings.passwordRequireLowercase && !/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    } else if (/[a-z]/.test(password)) {
      score += 20;
    }

    // Chiffres
    if (securitySettings.passwordRequireNumbers && !/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    } else if (/\d/.test(password)) {
      score += 20;
    }

    // Caractères spéciaux
    if (securitySettings.passwordRequireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 20;
    }

    // Bonus pour la longueur
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(score, 100),
    };
  }

  /**
   * Vérifie si un mot de passe doit être changé
   */
  async shouldChangePassword(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastPasswordChange: true, forcePasswordChange: true },
    });

    if (user?.forcePasswordChange) return true;

    const securitySettings = await this.getSecuritySettings();
    if (!user?.lastPasswordChange) return true;

    const daysSinceChange = Math.floor(
      (Date.now() - user.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceChange >= securitySettings.passwordMaxAge;
  }

  /**
   * Crée une nouvelle session utilisateur
   */
  async createUserSession(
    userId: string,
    sessionToken: string,
    ipAddress: string,
    userAgent: string,
    deviceName?: string,
  ) {
    const securitySettings = await this.getSecuritySettings();
    const expiresAt = new Date(
      Date.now() + securitySettings.sessionTimeoutMinutes * 60 * 1000
    );

    return this.prisma.userSession.create({
      data: {
        userId,
        sessionToken,
        ipAddress,
        userAgent,
        deviceName,
        expiresAt,
      },
    });
  }

  /**
   * Met à jour l'activité d'une session
   */
  async updateSessionActivity(sessionToken: string) {
    await this.prisma.userSession.updateMany({
      where: { sessionToken, isActive: true },
      data: { lastActivity: new Date() },
    });
  }

  /**
   * Termine une session
   */
  async terminateSession(sessionToken: string) {
    await this.prisma.userSession.updateMany({
      where: { sessionToken },
      data: { isActive: false },
    });
  }

  /**
   * Termine toutes les sessions d'un utilisateur
   */
  async terminateAllUserSessions(userId: string) {
    await this.prisma.userSession.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }

  /**
   * Nettoie les sessions expirées
   */
  async cleanupExpiredSessions() {
    await this.prisma.userSession.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true,
      },
      data: { isActive: false },
    });
  }

  /**
   * Récupère les paramètres de sécurité (crée des défauts si inexistants)
   */
  async getSecuritySettings() {
    let settings = await this.prisma.securitySettings.findFirst();
    
    if (!settings) {
      settings = await this.prisma.securitySettings.create({
        data: {},
      });
    }

    return settings;
  }

  /**
   * Met à jour les paramètres de sécurité
   */
  async updateSecuritySettings(data: any) {
    const existing = await this.prisma.securitySettings.findFirst();
    
    if (existing) {
      return this.prisma.securitySettings.update({
        where: { id: existing.id },
        data,
      });
    } else {
      return this.prisma.securitySettings.create({
        data,
      });
    }
  }

  /**
   * Récupère l'historique des connexions d'un utilisateur
   */
  async getUserLoginHistory(userId: string, limit = 50) {
    return this.prisma.loginAudit.findMany({
      where: { userId },
      orderBy: { loginTime: 'desc' },
      take: limit,
    });
  }

  /**
   * Récupère les sessions actives d'un utilisateur
   */
  async getUserActiveSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivity: 'desc' },
    });
  }
} 