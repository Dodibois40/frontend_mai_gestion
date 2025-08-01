import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID, IsDate, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { StatutAchat } from '@prisma/client';

export class UpdateAchatDto {
  @ApiPropertyOptional({
    description: 'Numéro de facture du fournisseur',
    example: 'FACT-2025-1234',
  })
  @IsString()
  @IsOptional()
  numeroFacture?: string;

  @ApiPropertyOptional({
    description: 'Montant HT de la facture',
    example: 1250.50,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  montantHt?: number;

  @ApiPropertyOptional({
    description: 'Montant TTC de la facture',
    example: 1500.60,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  montantTtc?: number;

  @ApiPropertyOptional({
    description: 'Date de la facture',
    example: '2025-06-10',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dateFacture?: Date;

  @ApiPropertyOptional({
    description: 'Date de paiement',
    example: '2025-06-15',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  datePaiement?: Date;

  @ApiPropertyOptional({
    description: 'Statut de l\'achat',
    enum: StatutAchat,
    example: 'VALIDE',
  })
  @IsEnum(StatutAchat)
  @IsOptional()
  statut?: StatutAchat;

  @ApiPropertyOptional({
    description: 'ID de la catégorie d\'achat',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  categorieId?: string;

  @ApiPropertyOptional({
    description: 'Nom du fournisseur',
    example: 'Menuiseries Dupont SARL',
  })
  @IsString()
  @IsOptional()
  fournisseur?: string;

  @ApiPropertyOptional({
    description: 'Commentaire sur l\'achat',
    example: 'Facture validée par le responsable',
  })
  @IsString()
  @IsOptional()
  commentaire?: string;

  // Champs pour l'upload PDF Firebase
  @ApiPropertyOptional({
    description: 'Date d\'upload du PDF',
    example: '2025-06-10T10:30:00Z',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dateUpload?: Date;

  @ApiPropertyOptional({
    description: 'Chemin du fichier PDF (legacy)',
    example: 'uploads/factures/facture-123.pdf',
  })
  @IsString()
  @IsOptional()
  fichierPdf?: string;

  @ApiPropertyOptional({
    description: 'Nom du fichier PDF',
    example: 'facture-ABC-123.pdf',
  })
  @IsString()
  @IsOptional()
  nomFichier?: string;

  @ApiPropertyOptional({
    description: 'Taille du fichier en octets',
    example: 2048576,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  tailleFichier?: number;

  @ApiPropertyOptional({
    description: 'URL de téléchargement Firebase',
    example: 'https://firebasestorage.googleapis.com/v0/b/project/o/file?token=xxx',
  })
  @IsString()
  @IsOptional()
  firebaseDownloadUrl?: string;

  @ApiPropertyOptional({
    description: 'Chemin de stockage Firebase',
    example: 'achats/achat-123/facture.pdf',
  })
  @IsString()
  @IsOptional()
  firebaseStoragePath?: string;
}