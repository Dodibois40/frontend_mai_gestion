import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const jwtSecret = configService.get('JWT_SECRET') || 
                      process.env.JWT_SECRET || 
                      'xK9mP3nQ7rT5vY2bC4dF6gH8jL1aS0wE-temporary-fallback';
    
    console.log('🔍 JWT_SECRET DEBUG:', {
      fromConfig: !!configService.get('JWT_SECRET'),
      fromEnv: !!process.env.JWT_SECRET,
      finalExists: !!jwtSecret,
      length: jwtSecret?.length || 0,
      source: configService.get('JWT_SECRET') ? 'ConfigService' : 
              process.env.JWT_SECRET ? 'process.env' : 'fallback',
      allEnvKeys: Object.keys(process.env).length,
      railwayVars: Object.keys(process.env).filter(k => k.includes('RAILWAY')).length
    });
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: payload.sub,
        supprime: false,
        actif: true
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
    };
  }
} 