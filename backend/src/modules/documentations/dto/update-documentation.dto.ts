import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentationDto } from './create-documentation.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateDocumentationDto extends PartialType(CreateDocumentationDto) {
  @IsString()
  @IsOptional()
  nom?: string;

  @IsString()
  @IsOptional()
  categorie?: string;

  @IsString()
  @IsOptional()
  sousCategorie?: string;

  @IsString()
  @IsOptional()
  description?: string;
} 