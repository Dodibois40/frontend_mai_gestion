import { Controller, Get, Post, Res } from '@nestjs/common';
import { Public } from './modules/auth/decorators/public.decorator';
import { Response } from 'express';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  getHello(): string {
    console.log('🔍 Route racine "/" appelée');
    console.log('✅ Route racine "/" - retour simple');
    return 'Backend API OK';
  }

  @Public()
  @Get('health')
  getHealth(): string {
    console.log('🔍 Route /health appelée - début');
    console.log('✅ Route /health - retour simple');
    return 'OK';
  }

  @Public()
  @Get('favicon.ico')
  getFavicon(@Res() res: Response): void {
    console.log('🔍 Route /favicon.ico appelée');
    res.status(204).end();
  }

  @Public()
  @Get('debug-db')
  debugDatabase() {
    return {
      databaseUrl: process.env.DATABASE_URL?.substring(0, 30) + '...',
      databaseUrlLength: process.env.DATABASE_URL?.length,
      isPostgres: process.env.DATABASE_URL?.startsWith('postgresql://') || process.env.DATABASE_URL?.startsWith('postgres://'),
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('DATABASE')),
      nodeEnv: process.env.NODE_ENV
    };
  }

  @Public()
  @Get('setup-admin')
  async setupAdmin() {
    console.log('🚀 Création utilisateur admin pour Railway...');
    
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.prisma.user.findUnique({
        where: { email: 'admin@lamanufacturedubois.com' }
      });
      
      if (existingUser) {
        return {
          success: true,
          message: 'Utilisateur admin déjà existant',
          email: 'admin@lamanufacturedubois.com',
          password: 'admin123'
        };
      }
      
      // Créer le hash du mot de passe
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      // Créer l'utilisateur admin
      const user = await this.prisma.user.create({
        data: {
          email: 'admin@lamanufacturedubois.com',
          nom: 'Admin',
          prenom: 'Principal',
          passwordHash,
          role: 'ADMIN_SYS',
          actif: true,
          dateEmbauche: new Date(),
          tarifHoraireBase: 50.0
        }
      });
      
      console.log('🎉 Utilisateur admin créé !');
      
      return {
        success: true,
        message: 'Utilisateur admin créé avec succès !',
        email: 'admin@lamanufacturedubois.com',
        password: 'admin123',
        role: user.role
      };
      
    } catch (error) {
      console.error('❌ Erreur création admin:', error);
      
      return {
        success: false,
        message: 'Erreur lors de la création',
        error: error.message
      };
    }
  }

  @Public()
  @Get('simple')
  getSimple(): string {
    console.log('🔍 Route /simple appelée');
    return 'SIMPLE';
  }
} 
