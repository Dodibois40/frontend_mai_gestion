import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, IsOptional } from 'class-validator';

export enum TypeAmelioration {
  BUG = 'BUG',
  AMELIORATION = 'AMELIORATION'
}

export class CreateAmeliorationDto {
  @ApiProperty({ 
    description: 'Type d\'amélioration',
    enum: TypeAmelioration,
    example: TypeAmelioration.BUG
  })
  @IsEnum(TypeAmelioration)
  type: TypeAmelioration;

  @ApiProperty({ 
    description: 'Titre de l\'amélioration (max 200 caractères)',
    example: 'Erreur lors de la sauvegarde d\'une affaire'
  })
  @IsString()
  @MaxLength(200)
  titre: string;

  @ApiProperty({ 
    description: 'Description détaillée du problème ou de l\'amélioration',
    example: 'Quand je crée une nouvelle affaire et que je clique sur "Enregistrer", j\'ai une erreur 500.'
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'URL de l\'image (capture d\'écran)',
    required: false,
    example: 'https://example.com/capture.png'
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}