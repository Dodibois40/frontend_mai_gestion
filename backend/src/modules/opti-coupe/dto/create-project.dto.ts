import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { CreatePieceDto } from './create-piece.dto';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.1)
  @IsOptional()
  kerfWidth?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  peripheralCut?: number;

  @IsString()
  @IsOptional()
  affaireId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePieceDto)
  @IsOptional()
  pieces?: CreatePieceDto[];
} 