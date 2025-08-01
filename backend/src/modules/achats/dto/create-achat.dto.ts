import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUUID, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAchatDto {
  // Le numéro de facture sera généré automatiquement par le backend
  // @ApiProperty({
  //   description: 'Numéro de facture du fournisseur (généré automatiquement)',
  //   example: 'FACT-2025-001',
  // })
  // @IsString()
  // @IsNotEmpty()
  // numeroFacture: string;

  @ApiProperty({
    description: 'Montant HT de la facture',
    example: 1250.50,
  })
  @IsNumber()
  @Min(0)
  montantHt: number;

  @ApiProperty({
    description: 'Montant TTC de la facture',
    example: 1500.60,
  })
  @IsNumber()
  @Min(0)
  montantTtc: number;

  @ApiProperty({
    description: 'Date de la facture',
    example: '2025-06-10',
  })
  @IsDate()
  @Type(() => Date)
  dateFacture: Date;

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
    example: 'Menuiseries Dupont SARL',
  })
  @IsString()
  @IsNotEmpty()
  fournisseur: string;

  @ApiPropertyOptional({
    description: 'ID du BDC associé (si l\'achat provient d\'une commande)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  bdcId?: string;

  @ApiPropertyOptional({
    description: 'Commentaire sur l\'achat',
    example: 'Facture reçue par email',
  })
  @IsString()
  @IsOptional()
  commentaire?: string;
} 