import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export enum GrainDirection {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
  NONE = 'NONE'
}

export class CreatePieceDto {
  @IsString()
  reference: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  width: number;

  @IsNumber()
  @Min(1)
  height: number;

  @IsNumber()
  @Min(1)
  thickness: number;

  @IsString()
  material: string;

  @IsEnum(GrainDirection)
  @IsOptional()
  grainDirection?: GrainDirection;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  priority?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  edgeTop?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  edgeBottom?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  edgeLeft?: number;

  @IsNumber()
  @Min(0)  
  @IsOptional()
  edgeRight?: number;
} 