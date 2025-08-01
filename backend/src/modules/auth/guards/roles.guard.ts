import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Vérifier que l'utilisateur existe et a un rôle
    if (!user || !user.role) {
      return false;
    }

    // Gérer les cas où user.role est une chaîne (un seul rôle) ou un tableau (plusieurs rôles)
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    
    return requiredRoles.some((role) => userRoles.includes(role));
  }
} 