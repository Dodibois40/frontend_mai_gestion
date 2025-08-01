import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateParametreDto {
  @IsString()
  @IsNotEmpty()
  cle: string;

  @IsString()
  @IsNotEmpty()
  valeur: string;

  @IsOptional()
  @IsString()
  description?: string;
} 