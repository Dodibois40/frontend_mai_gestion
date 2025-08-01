import { PartialType } from '@nestjs/swagger';
import { CreateBdcDto } from './create-bdc.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, IsString, IsDate, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBdcDto extends PartialType(CreateBdcDto) {
  @ApiPropertyOptional({
    description: 'Montant des frais généraux calculés',
    example: 320,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  montantFg?: number;

  // Champs pour Firebase Storage PDF
  @ApiPropertyOptional({
    description: 'Nom du fichier PDF uploadé',
    example: 'bdc-2025-001.pdf',
  })
  @IsString()
  @IsOptional()
  nomFichier?: string;

  @ApiPropertyOptional({
    description: 'Taille du fichier PDF en octets',
    example: 1024576,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  tailleFichier?: number;

  @ApiPropertyOptional({
    description: 'Date d\'upload du fichier PDF',
    example: '2024-03-15T10:30:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateUpload?: Date;

  @ApiPropertyOptional({
    description: 'URL de téléchargement Firebase',
    example: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/file?alt=media&token=xxx',
  })
  @IsString()
  @IsOptional()
  firebaseDownloadUrl?: string;

  @ApiPropertyOptional({
    description: 'Chemin de stockage Firebase',
    example: 'bdc/40fad1d7-8b3c-457f-8501-c65c1cf9f6ce/bdc-2025-001.pdf',
  })
  @IsString()
  @IsOptional()
  firebaseStoragePath?: string;
} 