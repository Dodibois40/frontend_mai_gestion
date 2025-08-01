import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min } from 'class-validator';

export enum GrainDirection {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
  NONE = 'NONE'
}

export class CreatePanelDto {
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
  grainDirection: GrainDirection;

  @IsNumber()
  @Min(0)
  pricePerM2: number;

  @IsNumber()
  @Min(1)
  stock: number;

  @IsBoolean()
  @IsOptional()
  isOffcut?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  depreciation?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minOffcutWidth?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minOffcutHeight?: number;
} 