import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  designation: string;

  @IsString()
  @IsNotEmpty()
  unite: string;

  @IsNumber()
  @Min(0)
  prixUnitaire: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockActuel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockMinimum?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockMaximum?: number;

  @IsOptional()
  @IsString()
  emplacement?: string;

  @IsOptional()
  @IsString()
  fournisseur?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
} 