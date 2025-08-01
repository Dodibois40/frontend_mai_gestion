import { IsEmail, IsString, IsOptional, IsBoolean, IsEnum, IsNumber, IsDateString, MinLength } from 'class-validator';
// import { RoleEnum } from '@prisma/client';

// Enum temporaire en attendant la génération complète de Prisma
enum RoleEnum {
  ADMIN_SYS = 'ADMIN_SYS',
  CHEF_ATELIER = 'CHEF_ATELIER',
  CHARGE_AFFAIRE = 'CHARGE_AFFAIRE',
  ACHETEUR = 'ACHETEUR',
  EMPLOYE = 'EMPLOYE'
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(RoleEnum)
  role: RoleEnum;

  @IsOptional()
  @IsNumber()
  tarifHoraireBase?: number;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsDateString()
  dateEmbauche?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(RoleEnum)
  role?: RoleEnum;

  @IsOptional()
  @IsNumber()
  tarifHoraireBase?: number;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsDateString()
  dateEmbauche?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class UserFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(RoleEnum)
  role?: RoleEnum;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
} 