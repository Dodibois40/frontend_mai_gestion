import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateAffaireReelDto {
  @ApiPropertyOptional({
    description: 'CA réel HT',
    example: 16500,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  caReelHt?: number;

  @ApiPropertyOptional({
    description: 'Achat réel HT',
    example: 8500,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  achatReelHt?: number;

  @ApiPropertyOptional({
    description: 'Heures réelles de fabrication',
    example: 125,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  heuresReellesFab?: number;

  @ApiPropertyOptional({
    description: 'Heures réelles de service',
    example: 12,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  heuresReellesSer?: number;

  @ApiPropertyOptional({
    description: 'Heures réelles de pose',
    example: 28,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  heuresReellesPose?: number;
} 