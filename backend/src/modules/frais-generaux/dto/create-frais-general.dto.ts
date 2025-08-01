import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, Min } from 'class-validator';

export class CreateFraisGeneralDto {
  @ApiProperty({
    description: 'Libellé du frais général',
    example: 'Crédit bail gerbeur 1',
  })
  @IsString()
  libelle: string;

  @ApiProperty({
    description: 'Montant TTC mensuel',
    example: 270.00,
  })
  @IsNumber()
  @Min(0)
  montantTtc: number;

  @ApiProperty({
    description: 'Montant HT mensuel',
    example: 225.00,
  })
  @IsNumber()
  @Min(0)
  montantHt: number;

  @ApiProperty({
    description: 'Ordre d\'affichage',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ordre?: number;

  @ApiProperty({
    description: 'Catégorie du frais général',
    example: 'MATERIEL',
    enum: ['MATERIEL', 'VEHICULE', 'LOCATION', 'CHARGES', 'ASSURANCE', 'BANQUE', 'LOGICIEL', 'SERVICE', 'COMMUNICATION', 'CREDIT_CLASSIQUE', 'CREDIT_BAIL', 'AUTRE'],
    required: false,
  })
  @IsOptional()
  @IsString()
  categorie?: string;

  @ApiProperty({
    description: 'Date de commencement du frais général',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateCommencement?: string;

  @ApiProperty({
    description: 'Date de fin du frais général (pour tous types de frais)',
    example: '2025-12-31T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiProperty({
    description: 'Commentaire additionnel',
    example: 'Matériel de production',
    required: false,
  })
  @IsOptional()
  @IsString()
  commentaire?: string;

  @ApiProperty({
    description: 'Statut actif/inactif',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
} 