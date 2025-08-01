import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { SecurityService } from './security.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private securityService: SecurityService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email, supprime: false, actif: true },
    });

    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string) {
    const { email, password } = loginDto;
    
    // Rechercher l'utilisateur par email
    const user = await this.prisma.user.findUnique({
      where: { email, supprime: false, actif: true },
    });

    // Vérifier si l'utilisateur existe
    if (!user) {
      await this.securityService.logLoginAttempt(
        email,
        ipAddress,
        userAgent,
        false,
        undefined,
        'Utilisateur non trouvé'
      );
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Vérifier si l'utilisateur est bloqué
    const isBlocked = await this.securityService.isUserBlocked(user.id);
    if (isBlocked) {
      await this.securityService.logLoginAttempt(
        email,
        ipAddress,
        userAgent,
        false,
        user.id,
        'Compte bloqué'
      );
      throw new UnauthorizedException('Compte temporairement bloqué. Veuillez réessayer plus tard.');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Gérer l'échec de connexion
      const wasBlocked = await this.securityService.handleFailedLogin(user.id);
      
      await this.securityService.logLoginAttempt(
        email,
        ipAddress,
        userAgent,
        false,
        user.id,
        'Mot de passe incorrect'
      );

      if (wasBlocked) {
        throw new UnauthorizedException('Trop de tentatives de connexion échouées. Compte temporairement bloqué.');
      }
      
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Vérifier si le mot de passe doit être changé
    const shouldChangePassword = await this.securityService.shouldChangePassword(user.id);

    // Réinitialiser les tentatives échouées
    await this.securityService.resetFailedAttempts(user.id);

    // Créer le token JWT
    const payload: JwtPayload = { 
      sub: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom
    };

    const accessToken = this.jwtService.sign(payload);

    // Créer une session utilisateur
    await this.securityService.createUserSession(
      user.id,
      accessToken,
      ipAddress,
      userAgent,
      this.extractDeviceName(userAgent)
    );

    // Enregistrer la connexion réussie
    await this.securityService.logLoginAttempt(
      email,
      ipAddress,
      userAgent,
      true,
      user.id,
      undefined,
      undefined,
      this.extractDeviceInfo(userAgent)
    );

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        avatar: user.avatar,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      security: {
        shouldChangePassword,
        lastLoginAt: user.lastLoginAt,
        twoFactorRequired: user.twoFactorEnabled,
      },
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    // Valider la force du nouveau mot de passe
    const passwordValidation = await this.securityService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Le mot de passe ne respecte pas les exigences de sécurité',
        errors: passwordValidation.errors,
        score: passwordValidation.score,
      });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour le mot de passe
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        lastPasswordChange: new Date(),
        forcePasswordChange: false,
      },
    });

    // Terminer toutes les autres sessions
    await this.securityService.terminateAllUserSessions(userId);

    return { message: 'Mot de passe changé avec succès' };
  }

  async logout(sessionToken: string) {
    await this.securityService.terminateSession(sessionToken);
    return { message: 'Déconnexion réussie' };
  }

  async logoutAllSessions(userId: string) {
    await this.securityService.terminateAllUserSessions(userId);
    return { message: 'Toutes les sessions ont été fermées' };
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, supprime: false, actif: true },
      include: {
        userPreferences: true,
        profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    
    // Vérifier si le mot de passe doit être changé
    const shouldChangePassword = await this.securityService.shouldChangePassword(userId);
    
    // Récupérer les sessions actives
    const activeSessions = await this.securityService.getUserActiveSessions(userId);
    
    return {
      user: userWithoutPassword,
      security: {
        shouldChangePassword,
        activeSessionsCount: activeSessions.length,
      },
    };
  }

  async updateProfile(userId: string, updateData: any) {
    const { poste, bio, adresse, ville, codePostal, dateNaissance, ...otherData } = updateData;

    // Mise à jour des champs du modèle User (nom, prenom, telephone)
    // On ne garde que les champs qui existent vraiment dans le modèle User
    const userDataToUpdate: any = {};
    if (otherData.nom) userDataToUpdate.nom = otherData.nom;
    if (otherData.prenom) userDataToUpdate.prenom = otherData.prenom;
    if (otherData.telephone !== undefined) userDataToUpdate.telephone = otherData.telephone;
    // Note: l'email n'est pas modifiable ici pour plus de simplicité
    
    if (Object.keys(userDataToUpdate).length > 0) {
      userDataToUpdate.updatedAt = new Date();
      await this.prisma.user.update({
        where: { id: userId },
        data: userDataToUpdate,
      });
    }

    // Mise à jour ou création du UserProfile pour tous les champs de profil
    const hasProfileData = poste !== undefined || bio !== undefined || 
                          adresse !== undefined || ville !== undefined || 
                          codePostal !== undefined || dateNaissance !== undefined;

    if (hasProfileData) {
      const profileUpdate: any = {};
      if (poste !== undefined) profileUpdate.poste = poste;
      if (bio !== undefined) profileUpdate.bio = bio;
      if (adresse !== undefined) profileUpdate.adresse = adresse;
      if (ville !== undefined) profileUpdate.ville = ville;
      if (codePostal !== undefined) profileUpdate.codePostal = codePostal;
      if (dateNaissance !== undefined) {
        // Convertir la date string en objet Date si nécessaire
        profileUpdate.dateNaissance = dateNaissance ? new Date(dateNaissance) : null;
      }

      await this.prisma.userProfile.upsert({
        where: { userId },
        update: profileUpdate,
        create: {
          userId,
          ...profileUpdate,
        },
      });
    }
    
    // Logique pour le changement de mot de passe (si existant dans otherData)
    if (otherData.password && otherData.password.trim().length > 0) {
      const password = otherData.password.trim();
      const passwordValidation = await this.securityService.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new BadRequestException('Le mot de passe ne respecte pas les exigences de sécurité');
      }
      const passwordHash = await bcrypt.hash(password, 12);
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash, lastPasswordChange: new Date(), forcePasswordChange: false },
      });
    }

    // Retourner l'utilisateur mis à jour avec son profil
    const updatedUserWithProfile = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        actif: true,
        createdAt: true,
        updatedAt: true,
        dateEmbauche: true,
        tarifHoraireBase: true,
        telephone: true,
        lastLoginAt: true,
        lastPasswordChange: true,
        forcePasswordChange: true,
        twoFactorEnabled: true,
        avatar: true,
        profile: {
          select: {
            id: true,
            poste: true,
            bio: true,
            adresse: true,
            ville: true,
            codePostal: true,
            dateNaissance: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!updatedUserWithProfile) {
      throw new Error('Impossible de retrouver l\'utilisateur après la mise à jour.');
    }

    return {
      user: updatedUserWithProfile,
      message: 'Profil mis à jour avec succès',
    };
  }

  async getUserFromToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub, supprime: false, actif: true },
      });

      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      // Vérifier si l'utilisateur est bloqué
      const isBlocked = await this.securityService.isUserBlocked(user.id);
      if (isBlocked) {
        throw new UnauthorizedException('Compte bloqué');
      }

      // Mettre à jour l'activité de la session
      await this.securityService.updateSessionActivity(token);

      const { passwordHash, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Token invalide');
    }
  }

  private extractDeviceName(userAgent: string): string {
    // Extraction simplifiée du nom de périphérique
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablette';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux PC';
    return 'Périphérique inconnu';
  }

  private extractDeviceInfo(userAgent: string): string {
    // Extraction simplifiée des informations de périphérique
    const info = [];
    
    if (userAgent.includes('Chrome')) info.push('Chrome');
    else if (userAgent.includes('Firefox')) info.push('Firefox');
    else if (userAgent.includes('Safari')) info.push('Safari');
    else if (userAgent.includes('Edge')) info.push('Edge');
    
    if (userAgent.includes('Windows')) info.push('Windows');
    else if (userAgent.includes('Mac')) info.push('macOS');
    else if (userAgent.includes('Linux')) info.push('Linux');
    else if (userAgent.includes('Android')) info.push('Android');
    else if (userAgent.includes('iOS')) info.push('iOS');
    
    return info.join(' - ') || 'Navigateur inconnu';
  }
} 