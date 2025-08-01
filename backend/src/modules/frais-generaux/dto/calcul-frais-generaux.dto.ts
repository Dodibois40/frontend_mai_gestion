import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculFraisGenerauxDto {
  @ApiProperty({
    description: 'Date de début de l\'affaire',
    example: '2024-01-15',
  })
  @IsDate()
  @Type(() => Date)
  dateDebut: Date;

  @ApiProperty({
    description: 'Date de fin de l\'affaire',
    example: '2024-02-15',
  })
  @IsDate()
  @Type(() => Date)
  dateFin: Date;

  @ApiProperty({
    description: 'Nombre d\'heures de travail par jour (optionnel, défaut: 7)',
    example: 7,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  heuresParJour?: number;

  @ApiProperty({
    description: 'Nombre de jours travaillés par semaine (optionnel, défaut: 5)',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  joursParSemaine?: number;
}

export class ResultatCalculFraisGenerauxDto {
  @ApiProperty({
    description: 'Nombre de jours ouvrés calculés',
    example: 22,
  })
  joursOuvres: number;

  @ApiProperty({
    description: 'Nombre d\'heures total calculées',
    example: 154,
  })
  heuresTotal: number;

  @ApiProperty({
    description: 'Montant total des frais généraux HT pour la période',
    example: 2657.96,
  })
  montantTotalHt: number;

  @ApiProperty({
    description: 'Montant total des frais généraux TTC pour la période',
    example: 3189.55,
  })
  montantTotalTtc: number;

  @ApiProperty({
    description: 'Frais généraux mensuels HT de référence',
    example: 10629.57,
  })
  fraisGenerauxMensuelHt: number;

  @ApiProperty({
    description: 'Détail du calcul par poste de frais généraux',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        libelle: { type: 'string', example: 'Crédit bail gerbeur 1' },
        montantMensuelHt: { type: 'number', example: 120.83 },
        montantPeriodeHt: { type: 'number', example: 30.21 },
        categorie: { type: 'string', example: 'MATERIEL' },
      },
    },
  })
  detailCalcul: Array<{
    libelle: string;
    montantMensuelHt: number;
    montantPeriodeHt: number;
    categorie: string;
  }>;
} 