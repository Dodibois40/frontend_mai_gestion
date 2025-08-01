import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Nom de l\'utilisateur', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nom?: string;

  @ApiProperty({ description: 'Prénom de l\'utilisateur', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  prenom?: string;

  @ApiProperty({ description: 'Email de l\'utilisateur', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Téléphone de l\'utilisateur', required: false })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty({ description: 'Adresse de l\'utilisateur', required: false })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiProperty({ description: 'Ville de l\'utilisateur', required: false })
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiProperty({ description: 'Code postal de l\'utilisateur', required: false })
  @IsOptional()
  @IsString()
  codePostal?: string;

  @ApiProperty({ description: 'Date de naissance de l\'utilisateur', required: false })
  @IsOptional()
  @IsString()
  dateNaissance?: string;

  @ApiProperty({ description: 'Poste de l\'utilisateur', required: false })
  @IsOptional()
  @IsString()
  poste?: string;

  @ApiProperty({ description: 'Biographie de l\'utilisateur', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({ description: 'Entreprise de l\'utilisateur', required: false })
  @IsOptional()
  @IsString()
  entreprise?: string;

  @ApiProperty({ description: 'Nouveau mot de passe', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
} 