import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Set default DATABASE_URL if not provided
    if (!process.env.DATABASE_URL) {
      console.log('⚠️ DATABASE_URL not found, using default SQLite database');
      process.env.DATABASE_URL = 'file:./dev.db';
    }
    
    console.log('🔧 PrismaService Configuration:', {
      databaseUrlExists: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      databaseUrlStart: process.env.DATABASE_URL?.substring(0, 20) || 'N/A',
      nodeEnv: process.env.NODE_ENV || 'N/A',
      allEnvVars: Object.keys(process.env).length,
      railwayVars: Object.keys(process.env).filter(k => k.startsWith('RAILWAY')).join(', ') || 'None'
    });
    
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      console.log('🔄 Attempting database connection...');
      await this.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      
      // Pour Railway, on ne tente pas de créer la base automatiquement
      // car cela peut causer des blocages. On logue l'erreur et on continue.
      if (process.env.NODE_ENV === 'production') {
        console.error('💀 PRODUCTION: Database connection failed. Please check DATABASE_URL configuration.');
        // Ne pas planter l'application en production, mais logger l'erreur
        console.error('💀 The application will continue but database operations will fail.');
        return;
      }
      
      // En développement, on peut tenter une reconnexion simple
      if (process.env.DATABASE_URL?.startsWith('file:')) {
        console.log('🔧 Development mode: Attempting simple reconnection...');
        try {
          // Simple retry connection without executing system commands
          await new Promise(resolve => setTimeout(resolve, 1000));
          await this.$connect();
          console.log('✅ Database connected after retry');
        } catch (retryError) {
          console.error('❌ Database retry failed:', retryError);
          console.error('💡 Please run: npx prisma db push');
          throw retryError;
        }
      } else {
        throw error;
      }
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Error disconnecting database:', error);
    }
  }
} 