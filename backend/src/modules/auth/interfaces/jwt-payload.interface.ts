import { RoleEnum } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: RoleEnum;
  nom: string;
  prenom: string;
  iat?: number;
  exp?: number;
} 