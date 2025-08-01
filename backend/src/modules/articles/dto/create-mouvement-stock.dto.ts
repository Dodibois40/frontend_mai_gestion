import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { TypeMouvement } from '@prisma/client';

export class CreateMouvementStockDto {
  @IsEnum(TypeMouvement)
  type: TypeMouvement;

  @IsNumber()
  @Min(0.01)
  quantite: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prixUnitaire?: number;

  @IsOptional()
  @IsString()
  motif?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsString()
  @IsNotEmpty()
  articleId: string;
} 