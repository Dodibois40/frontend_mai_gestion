import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SecurityService } from './security.service';
import { TwoFactorService } from './two-factor.service';
import { TwoFactorController } from './two-factor.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CleanupTask } from './tasks/cleanup.task';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get('JWT_SECRET') || 
                      process.env.JWT_SECRET || 
                      'xK9mP3nQ7rT5vY2bC4dF6gH8jL1aS0wE-authmodule-fallback';
        
        console.log('🔧 AuthModule JWT Configuration:', {
          fromConfig: !!configService.get('JWT_SECRET'),
          fromProcessEnv: !!process.env.JWT_SECRET,
          finalSecret: !!secret,
          secretLength: secret?.length || 0,
          secretStart: secret?.substring(0, 15) || 'N/A',
          totalEnvVars: Object.keys(process.env).length,
          railwayVarsCount: Object.keys(process.env).filter(k => k.startsWith('RAILWAY')).length,
          jwtVarsFound: Object.keys(process.env).filter(k => k.includes('JWT')).join(', ') || 'None'
        });
        
        return {
          secret,
          signOptions: { 
            expiresIn: '24h',
            issuer: 'entreprise-organiser',
            audience: 'entreprise-organiser-users'
          },
        };
      },
    }),
  ],
  controllers: [AuthController, TwoFactorController],
  providers: [AuthService, SecurityService, TwoFactorService, JwtStrategy, JwtAuthGuard, CleanupTask],
  exports: [AuthService, SecurityService, TwoFactorService, JwtAuthGuard],
})
export class AuthModule {} 