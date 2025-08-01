import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsEnum, Min } from 'class-validator';

export enum TypePhase {
  FABRICATION = 'FABRICATION',
  POSE = 'POSE',
  SERVICE = 'SERVICE',
  LIVRAISON = 'LIVRAISON',
  SAV = 'SAV'
}

export class CreatePhaseDto {
  @ApiProperty({
    description: 'Nom de la phase',
    example: 'Fabrication cuisines',
  })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de la phase',
    example: 'Fabrication des meubles de cuisine en atelier',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type de phase',
    enum: TypePhase,
    example: TypePhase.FABRICATION,
  })
  @IsEnum(TypePhase)
  typePhase: TypePhase;

  @ApiProperty({
    description: 'ID de l\'affaire associée',
    example: 'uuid-affaire',
  })
  @IsString()
  @IsNotEmpty()
  affaireId: string;

  @ApiPropertyOptional({
    description: 'Date de début prévue (ISO 8601)',
    example: '2025-01-15T08:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dateDebutPrevue?: string;

  @ApiPropertyOptional({
    description: 'Date de fin prévue (ISO 8601)',
    example: '2025-01-20T17:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dateFinPrevue?: string;

  @ApiPropertyOptional({
    description: 'Temps estimé en heures',
    example: 40.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tempsEstimeH?: number;

  @ApiPropertyOptional({
    description: 'Taux horaire en euros par heure',
    example: 40.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tauxHoraire?: number;

  @ApiPropertyOptional({
    description: 'Coût estimé total de la main d\'œuvre en euros (calculé automatiquement)',
    example: 1600.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  coutEstime?: number;

  @ApiPropertyOptional({
    description: 'Temps réel en heures',
    example: 42.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tempsReelH?: number;

  @ApiPropertyOptional({
    description: 'Coût réel total de la main d\'œuvre en euros',
    example: 1700.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  coutReel?: number;

  @ApiPropertyOptional({
    description: 'Ordre d\'exécution de la phase',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  ordre?: number;
} 