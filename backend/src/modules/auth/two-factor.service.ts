import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class TwoFactorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Génère un secret pour la 2FA et crée le QR code
   */
  async setupTwoFactorAuth(userId: string, userEmail: string) {
    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier si la 2FA est déjà configurée
    const existingTwoFactor = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (existingTwoFactor && existingTwoFactor.isEnabled) {
      throw new BadRequestException('La 2FA est déjà activée pour cet utilisateur');
    }

    // Générer un secret
    const secret = speakeasy.generateSecret({
      name: `${user.prenom} ${user.nom}`,
      issuer: 'Mai Gestion',
      length: 32,
    });

    // Générer des codes de récupération
    const backupCodes = this.generateBackupCodes();

    // Sauvegarder ou mettre à jour la configuration 2FA
    const twoFactorAuth = await this.prisma.twoFactorAuth.upsert({
      where: { userId },
      update: {
        secret: secret.base32,
        backupCodes: backupCodes,
        isEnabled: false, // Pas encore activé jusqu'à vérification
      },
      create: {
        userId,
        secret: secret.base32,
        backupCodes: backupCodes,
        isEnabled: false,
      },
    });

    // Générer le QR code
    if (!secret.otpauth_url) {
      throw new Error('URL TOTP non générée');
    }
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: backupCodes,
      manualEntryKey: secret.base32,
    };
  }

  /**
   * Vérifie le code TOTP et active la 2FA
   */
  async verifyAndEnableTwoFactorAuth(userId: string, token: string) {
    const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactorAuth) {
      throw new NotFoundException('Configuration 2FA non trouvée');
    }

    // Vérifier le token
    const isValid = speakeasy.totp.verify({
      secret: twoFactorAuth.secret,
      encoding: 'base32',
      token: token,
      window: 2, // Accepter les tokens dans une fenêtre de 2 étapes (±60 secondes)
    });

    if (!isValid) {
      throw new UnauthorizedException('Code de vérification invalide');
    }

    // Activer la 2FA
    await this.prisma.twoFactorAuth.update({
      where: { userId },
      data: {
        isEnabled: true,
        lastUsed: new Date(),
      },
    });

    return { success: true, message: 'Authentification à deux facteurs activée avec succès' };
  }

  /**
   * Vérifie un code TOTP lors de la connexion
   */
  async verifyTwoFactorToken(userId: string, token: string) {
    const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
      throw new NotFoundException('2FA non configurée pour cet utilisateur');
    }

    // Vérifier d'abord si c'est un code de récupération
    if (await this.verifyBackupCode(userId, token)) {
      return { success: true, usedBackupCode: true };
    }

    // Vérifier le token TOTP
    const isValid = speakeasy.totp.verify({
      secret: twoFactorAuth.secret,
      encoding: 'base32',
      token: token,
      window: 2,
    });

    if (!isValid) {
      throw new UnauthorizedException('Code de vérification invalide');
    }

    // Mettre à jour la dernière utilisation
    await this.prisma.twoFactorAuth.update({
      where: { userId },
      data: { lastUsed: new Date() },
    });

    return { success: true, usedBackupCode: false };
  }

  /**
   * Vérifie un code de récupération
   */
  private async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactorAuth) {
      return false;
    }

    const backupCodes = twoFactorAuth.backupCodes as string[];
    const codeIndex = backupCodes.indexOf(code);

    if (codeIndex === -1) {
      return false;
    }

    // Supprimer le code utilisé
    backupCodes.splice(codeIndex, 1);

    await this.prisma.twoFactorAuth.update({
      where: { userId },
      data: { backupCodes: backupCodes },
    });

    return true;
  }

  /**
   * Désactive la 2FA pour un utilisateur
   */
  async disableTwoFactorAuth(userId: string) {
    const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactorAuth) {
      throw new NotFoundException('2FA non configurée pour cet utilisateur');
    }

    await this.prisma.twoFactorAuth.delete({
      where: { userId },
    });

    return { success: true, message: 'Authentification à deux facteurs désactivée' };
  }

  /**
   * Génère de nouveaux codes de récupération
   */
  async regenerateBackupCodes(userId: string) {
    const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactorAuth) {
      throw new NotFoundException('2FA non configurée pour cet utilisateur');
    }

    const newBackupCodes = this.generateBackupCodes();

    await this.prisma.twoFactorAuth.update({
      where: { userId },
      data: { backupCodes: newBackupCodes },
    });

    return { backupCodes: newBackupCodes };
  }

  /**
   * Vérifie si la 2FA est activée pour un utilisateur
   */
  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    return twoFactorAuth?.isEnabled || false;
  }

  /**
   * Récupère le statut de la 2FA pour un utilisateur
   */
  async getTwoFactorStatus(userId: string) {
    const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactorAuth) {
      return {
        isEnabled: false,
        isConfigured: false,
        lastUsed: null,
        backupCodesCount: 0,
      };
    }

    const backupCodes = twoFactorAuth.backupCodes as string[];

    return {
      isEnabled: twoFactorAuth.isEnabled,
      isConfigured: true,
      lastUsed: twoFactorAuth.lastUsed,
      backupCodesCount: backupCodes?.length || 0,
    };
  }

  /**
   * Génère des codes de récupération aléatoires
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Générer des codes de 8 caractères alphanumériques
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }
} 