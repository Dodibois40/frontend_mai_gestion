import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, IsOptional } from 'class-validator';
import { TypeAmelioration } from './create-amelioration.dto';

export enum StatutAmelioration {
  NOUVEAU = 'NOUVEAU',
  EN_COURS = 'EN_COURS', 
  TERMINE = 'TERMINE',
  ABANDONNE = 'ABANDONNE'
}

export class UpdateAmeliorationDto {
  @ApiProperty({ 
    description: 'Type d\'amélioration',
    enum: TypeAmelioration,
    required: false
  })
  @IsOptional()
  @IsEnum(TypeAmelioration)
  type?: TypeAmelioration;

  @ApiProperty({ 
    description: 'Titre de l\'amélioration (max 200 caractères)',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titre?: string;

  @ApiProperty({ 
    description: 'Description détaillée',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Statut de l\'amélioration',
    enum: StatutAmelioration,
    required: false
  })
  @IsOptional()
  @IsEnum(StatutAmelioration)
  statut?: StatutAmelioration;

  @ApiProperty({ 
    description: 'URL de l\'image (capture d\'écran)',
    required: false
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}