import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateTacheDto {
  @ApiProperty({
    description: 'Nom de la tâche',
    example: 'Montage meubles hauts',
  })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de la tâche',
    example: 'Montage et installation des meubles hauts de cuisine',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'ID de la phase associée',
    example: 'uuid-phase',
  })
  @IsString()
  @IsNotEmpty()
  phaseId: string;

  @ApiProperty({
    description: 'ID de l\'ouvrier affecté',
    example: 'uuid-ouvrier',
  })
  @IsString()
  @IsNotEmpty()
  ouvrierAffecteId: string;

  @ApiPropertyOptional({
    description: 'Date de début prévue (ISO 8601)',
    example: '2025-01-15T08:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dateDebutPrevue?: string;

  @ApiPropertyOptional({
    description: 'Date de fin prévue (ISO 8601)',
    example: '2025-01-16T17:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dateFinPrevue?: string;

  @ApiPropertyOptional({
    description: 'Temps estimé en heures',
    example: 8.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tempsEstimeH?: number;

  @ApiPropertyOptional({
    description: 'Coût estimé en euros (calculé automatiquement si non fourni)',
    example: 320.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  coutEstime?: number;
} 