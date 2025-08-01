import { IsString, IsUUID, IsDateString, IsEnum, IsOptional, IsInt, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PeriodePlanning {
  MATIN = 'MATIN',
  APREM = 'APREM',
}

export enum TypeActiviteEnum {
  FABRICATION = 'FABRICATION',
  POSE = 'POSE',
}

export enum StatutAffectation {
  ACTIVE = 'ACTIVE',
  ANNULEE = 'ANNULEE',
  TERMINEE = 'TERMINEE',
}

export class CreateAffectationDto {
  @ApiProperty({ description: 'ID de l\'affaire' })
  @IsUUID()
  affaireId: string;

  @ApiProperty({ description: 'ID de l\'utilisateur (ouvrier/sous-traitant)' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Date d\'affectation' })
  @IsDateString()
  dateAffectation: string;

  @ApiProperty({ description: 'Période de travail', enum: PeriodePlanning })
  @IsEnum(PeriodePlanning)
  periode: PeriodePlanning;

  @ApiProperty({ description: 'Type d\'activité', enum: TypeActiviteEnum })
  @IsEnum(TypeActiviteEnum)
  typeActivite: TypeActiviteEnum;

  @ApiProperty({ description: 'Commentaire optionnel', required: false })
  @IsOptional()
  @IsString()
  commentaire?: string;

  @ApiProperty({ description: 'Couleur personnalisée (hex)', required: false })
  @IsOptional()
  @IsString()
  couleurPersonne?: string;

  @ApiProperty({ description: 'Ordre d\'affichage', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  ordreAffichage?: number;
}

export class UpdateAffectationDto {
  @ApiProperty({ description: 'ID de l\'affaire', required: false })
  @IsOptional()
  @IsUUID()
  affaireId?: string;

  @ApiProperty({ description: 'Date d\'affectation', required: false })
  @IsOptional()
  @IsDateString()
  dateAffectation?: string;

  @ApiProperty({ description: 'Période de travail', enum: PeriodePlanning, required: false })
  @IsOptional()
  @IsEnum(PeriodePlanning)
  periode?: PeriodePlanning;

  @ApiProperty({ description: 'Type d\'activité', enum: TypeActiviteEnum, required: false })
  @IsOptional()
  @IsEnum(TypeActiviteEnum)
  typeActivite?: TypeActiviteEnum;

  @ApiProperty({ description: 'Statut de l\'affectation', enum: StatutAffectation, required: false })
  @IsOptional()
  @IsEnum(StatutAffectation)
  statut?: StatutAffectation;

  @ApiProperty({ description: 'Commentaire', required: false })
  @IsOptional()
  @IsString()
  commentaire?: string;

  @ApiProperty({ description: 'Couleur personnalisée (hex)', required: false })
  @IsOptional()
  @IsString()
  couleurPersonne?: string;

  @ApiProperty({ description: 'Ordre d\'affichage', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  ordreAffichage?: number;
}

export class ModifierActiviteDto {
  @ApiProperty({ description: 'Nouveau type d\'activité', enum: TypeActiviteEnum })
  @IsEnum(TypeActiviteEnum)
  typeActivite: TypeActiviteEnum;
}

export class PlanningHebdoDto {
  @ApiProperty({ description: 'Date de début de semaine (format ISO)' })
  @IsDateString()
  dateDebut: string;

  @ApiProperty({ description: 'Inclure les affectations terminées', required: false })
  @IsOptional()
  @IsBoolean()
  inclureTerminees?: boolean;
} 