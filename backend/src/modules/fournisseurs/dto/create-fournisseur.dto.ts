import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEmail, IsEnum } from 'class-validator';

export enum CategorieFournisseur {
  QUINCAILLERIE = 'QUINCAILLERIE',
  BOIS = 'BOIS',
  VITRAGE = 'VITRAGE',
  MENUISERIE = 'MENUISERIE',
  AGENCEMENT = 'AGENCEMENT',
  FERRONNERIE = 'FERRONNERIE',
  PEINTURE = 'PEINTURE',
  ELECTRICITE = 'ELECTRICITE',
  PLOMBERIE = 'PLOMBERIE',
  ISOLATION = 'ISOLATION',
  OUTILLAGE = 'OUTILLAGE',
  AUTRE = 'AUTRE',
}

export class CreateFournisseurDto {
  @ApiProperty({
    description: 'Nom du fournisseur',
    example: 'Menuiseries Dupont SARL',
  })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiPropertyOptional({
    description: 'Code client chez le fournisseur',
    example: 'CLI-001234',
  })
  @IsString()
  @IsOptional()
  codeClient?: string;

  @ApiPropertyOptional({
    description: 'Indique si on est en compte avec ce fournisseur',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  enCompte?: boolean;

  @ApiPropertyOptional({
    description: 'Catégorie d\'activité du fournisseur',
    enum: CategorieFournisseur,
    example: CategorieFournisseur.MENUISERIE,
  })
  @IsEnum(CategorieFournisseur)
  @IsOptional()
  categorie?: CategorieFournisseur;

  @ApiPropertyOptional({
    description: 'Adresse du fournisseur',
    example: '123 Rue des Artisans, 75001 Paris',
  })
  @IsString()
  @IsOptional()
  adresse?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone',
    example: '01.23.45.67.89',
  })
  @IsString()
  @IsOptional()
  telephone?: string;

  @ApiPropertyOptional({
    description: 'Adresse email',
    example: 'contact@menuiseries-dupont.fr',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Nom de la personne de contact',
    example: 'Jean Dupont',
  })
  @IsString()
  @IsOptional()
  contact?: string;

  @ApiPropertyOptional({
    description: 'Commentaire sur le fournisseur',
    example: 'Fournisseur principal pour les menuiseries',
  })
  @IsString()
  @IsOptional()
  commentaire?: string;

  @ApiPropertyOptional({
    description: 'Indique si le fournisseur est actif',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  actif?: boolean;
} 