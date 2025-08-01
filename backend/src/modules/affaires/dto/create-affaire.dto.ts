import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDate, Min, Matches, ValidateIf, IsDateString, IsLatitude, IsLongitude } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAffaireDto {
  @ApiPropertyOptional({
    description: 'Numéro unique de l\'affaire (généré automatiquement si non fourni)',
    example: '24-BOIS-003',
  })
  @IsString()
  @IsOptional()
  numero?: string;

  @ApiProperty({
    description: 'Libellé de l\'affaire',
    example: 'Rénovation fenêtres maison',
  })
  @IsString()
  @IsNotEmpty()
  libelle: string;

  @ApiProperty({
    description: 'Nom du client',
    example: 'M. Dupont',
  })
  @IsString()
  @IsNotEmpty()
  client: string;

  @ApiPropertyOptional({
    description: 'Adresse complète du chantier',
    example: '123 Rue des Érables, 75000 Paris',
  })
  @IsString()
  @IsOptional()
  adresse?: string;

  @ApiPropertyOptional({
    description: 'Rue (numéro et nom)',
    example: '123 Rue des Érables',
  })
  @IsString()
  @IsOptional()
  rue?: string;

  @ApiPropertyOptional({
    description: 'Code postal',
    example: '75000',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{5}$/, { message: 'Le code postal doit contenir exactement 5 chiffres' })
  codePostal?: string;

  @ApiPropertyOptional({
    description: 'Ville',
    example: 'Paris',
  })
  @IsString()
  @IsOptional()
  ville?: string;

  @ApiPropertyOptional({
    description: 'Pays',
    example: 'France',
  })
  @IsString()
  @IsOptional()
  pays?: string;

  @ApiPropertyOptional({
    description: 'Latitude GPS',
    example: 48.8566,
  })
  @IsNumber()
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude GPS',
    example: 2.3522,
  })
  @IsNumber()
  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Date de commencement prévue',
    example: '2024-03-01',
  })
  @IsDateString()
  @IsOptional()
  dateCommencement?: string;

  @ApiPropertyOptional({
    description: 'Date prévue de clôture',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  dateCloturePrevue?: string;

  @ApiPropertyOptional({
    description: 'Montant de base du devis (optionnel, sera défini dans le module d\'estimation intelligente)',
    example: 0,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  objectifCaHt?: number;

  @ApiPropertyOptional({
    description: 'Objectif d\'achat HT (optionnel, sera remplacé par l\'estimation intelligente)',
    example: 8000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  objectifAchatHt?: number;

  @ApiPropertyOptional({
    description: 'Objectif d\'heures de fabrication (optionnel, sera remplacé par l\'estimation intelligente)',
    example: 120,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  objectifHeuresFab?: number;

  @ApiPropertyOptional({
    description: 'Objectif d\'heures de service (optionnel, sera remplacé par l\'estimation intelligente)',
    example: 15,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  objectifHeuresSer?: number;

  @ApiPropertyOptional({
    description: 'Objectif de frais généraux (optionnel, sera remplacé par l\'estimation intelligente)',
    example: 3000,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  objectifFraisGeneraux?: number;

  @ApiPropertyOptional({
    description: 'Objectif d\'heures de pose (optionnel, sera remplacé par l\'estimation intelligente)',
    example: 25,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  objectifHeuresPose?: number;

  @IsString()
  @IsOptional()
  statut?: string;
} 