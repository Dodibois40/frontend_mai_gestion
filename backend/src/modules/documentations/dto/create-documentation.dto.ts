import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDocumentationDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['financier', 'plans', 'photos', 'autres'])
  categorie: string;

  @IsString()
  @IsOptional()
  sousCategorie?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  affaireId: string;
} 