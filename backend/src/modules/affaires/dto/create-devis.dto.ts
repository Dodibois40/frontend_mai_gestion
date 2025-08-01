import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDate, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDevisDto {
  @ApiPropertyOptional({
    description: 'Numéro unique du devis (généré automatiquement si non fourni)',
    example: 'DEV-24-001',
  })
  @IsOptional()
  @IsString()
  numero?: string;

  @ApiProperty({
    description: 'Libellé du devis',
    example: 'Devis rénovation fenêtres',
  })
  @IsString()
  @IsNotEmpty()
  libelle: string;

  @ApiProperty({
    description: 'Montant HT du devis',
    example: 15000,
  })
  @IsNumber()
  @Min(0)
  montantHt: number;

  @ApiProperty({
    description: 'Date de validité du devis',
    example: '2024-12-31',
  })
  @IsDate()
  @Type(() => Date)
  dateValidite: Date;

  @ApiPropertyOptional({
    description: 'Description détaillée du devis',
    example: 'Rénovation complète de 8 fenêtres en PVC',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Commentaire sur le devis',
    example: 'Devis établi suite à visite technique',
  })
  @IsString()
  @IsOptional()
  commentaire?: string;

  @ApiProperty({
    description: 'ID de l\'affaire associée',
    example: 'uuid-de-l-affaire',
  })
  @IsUUID()
  @IsNotEmpty()
  affaireId: string;
} 