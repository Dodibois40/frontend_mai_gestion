import { IsEmail, IsString, IsOptional, IsBoolean, IsNumber, IsDateString, MinLength } from 'class-validator';

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

  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  statutContractuel?: string;

  // Spécialités multiples
  @IsOptional()
  @IsBoolean()
  specialitePoseur?: boolean;

  @IsOptional()
  @IsBoolean()
  specialiteFabriquant?: boolean;

  @IsOptional()
  @IsBoolean()
  specialiteDessinateur?: boolean;

  @IsOptional()
  @IsBoolean()
  specialiteChargeAffaire?: boolean;

  @IsOptional()
  @IsNumber()
  tarifHoraireBase?: number;

  @IsOptional()
  @IsNumber()
  tarifHoraireCout?: number;

  @IsOptional()
  @IsNumber()
  tarifHoraireVente?: number;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsDateString()
  dateEmbauche?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @IsOptional()
  @IsBoolean()
  disponiblePlanning?: boolean;
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
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  statutContractuel?: string;

  // Spécialités multiples
  @IsOptional()
  @IsBoolean()
  specialitePoseur?: boolean;

  @IsOptional()
  @IsBoolean()
  specialiteFabriquant?: boolean;

  @IsOptional()
  @IsBoolean()
  specialiteDessinateur?: boolean;

  @IsOptional()
  @IsBoolean()
  specialiteChargeAffaire?: boolean;

  @IsOptional()
  @IsNumber()
  tarifHoraireBase?: number;

  @IsOptional()
  @IsNumber()
  tarifHoraireCout?: number;

  @IsOptional()
  @IsNumber()
  tarifHoraireVente?: number;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsDateString()
  dateEmbauche?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @IsOptional()
  @IsBoolean()
  disponiblePlanning?: boolean;
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
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  actif?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
} 