import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUUID, IsDate, Min, Matches, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLigneBdcDto {
  @ApiProperty({
    description: 'Désignation de l\'article',
    example: 'Panneau MDF plaqué chêne',
  })
  @IsString()
  @IsNotEmpty()
  designation: string;

  @ApiPropertyOptional({
    description: 'Référence de l\'article',
    example: '124',
  })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({
    description: 'Quantité (unitaire)',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  quantite: number;

  @ApiProperty({
    description: 'Prix unitaire (0 pour demandes sans prix)',
    example: 45.50,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  prixUnitaire: number;

  @ApiPropertyOptional({
    description: 'Ordre d\'affichage de la ligne',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  ordre?: number;
}

enum DirectionBdc {
  SORTANT = 'SORTANT',
  ENTRANT = 'ENTRANT'
}

export class CreateBdcDto {
  // Le numéro sera généré automatiquement par le backend, pas besoin de le passer
  // @ApiProperty({
  //   description: 'Numéro unique du bon de commande (généré automatiquement)',
  //   example: 'BDC 001 010',
  // })
  // numero?: string;

  @ApiProperty({
    description: 'Montant HT du bon de commande (0 si non renseigné)',
    example: 3200.5,
  })
  @IsNumber()
  @Min(0)
  montantHt: number;

  @ApiProperty({
    description: 'ID de l\'affaire associée',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  affaireId: string;

  @ApiProperty({
    description: 'ID de la catégorie d\'achat',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  categorieId: string;

  @ApiProperty({
    description: 'Nom du fournisseur',
    example: 'BoisPro SARL',
  })
  @IsString()
  @IsNotEmpty()
  fournisseur: string;

  @ApiProperty({
    description: 'Direction du BDC (SORTANT = notre demande, ENTRANT = reçu du fournisseur)',
    example: 'SORTANT',
    enum: DirectionBdc,
  })
  @IsEnum(DirectionBdc)
  direction: DirectionBdc;

  @ApiPropertyOptional({
    description: 'Lignes d\'articles du BDC',
    type: [CreateLigneBdcDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLigneBdcDto)
  @IsOptional()
  lignes?: CreateLigneBdcDto[];

  @ApiPropertyOptional({
    description: 'Date du bon de commande',
    example: '2024-03-15',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateBdc?: Date;

  @ApiPropertyOptional({
    description: 'Date de réception',
    example: '2024-03-30',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateReception?: Date;

  @ApiPropertyOptional({
    description: 'Date de livraison prévue',
    example: '2024-03-25',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateLivraison?: Date;

  @ApiPropertyOptional({
    description: 'Commentaire sur le bon de commande',
    example: 'Livraison urgente requise',
  })
  @IsString()
  @IsOptional()
  commentaire?: string;

  @ApiPropertyOptional({
    description: 'Lieu de livraison (ATELIER ou CHANTIER)',
    example: 'ATELIER',
    enum: ['ATELIER', 'CHANTIER'],
  })
  @IsString()
  @IsOptional()
  lieuLivraison?: string;

  @ApiPropertyOptional({
    description: 'Adresse de livraison personnalisée (obligatoire si lieuLivraison = CHANTIER)',
    example: '123 rue du Chantier, 64000 Pau',
  })
  @IsString()
  @IsOptional()
  adresseLivraison?: string;
}

export class DeleteBdcDto {
  @ApiProperty({
    description: 'Mot de passe de sécurité pour supprimer un BDC validé',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
} 