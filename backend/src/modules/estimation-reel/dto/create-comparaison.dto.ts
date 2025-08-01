import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export enum TypeComparaison {
  SNAPSHOT = 'SNAPSHOT',
  TEMPS_REEL = 'TEMPS_REEL',
  FINAL = 'FINAL',
}

export class CreateComparaisonDto {
  @IsNotEmpty()
  @IsString()
  affaireId: string;

  @IsNotEmpty()
  @IsString()
  estimationId: string;

  @IsOptional()
  @IsEnum(TypeComparaison)
  typeComparaison?: TypeComparaison;

  @IsOptional()
  @IsString()
  calculePar?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;
} 