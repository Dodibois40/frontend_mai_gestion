import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsArray, IsEnum, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum StatutEstimation {
  DRAFT = 'DRAFT',
  VALIDEE = 'VALIDEE',
  ARCHIVEE = 'ARCHIVEE',
}

export enum CategorieEstimation {
  MAIN_OEUVRE = 'MAIN_OEUVRE',
  ACHATS = 'ACHATS',
  FRAIS_GENERAUX = 'FRAIS_GENERAUX',
  MARGE = 'MARGE',
}

export class CreateEstimationDetailDto {
  @IsEnum(CategorieEstimation)
  categorie: CategorieEstimation;

  @IsOptional()
  @IsString()
  sousCategorie?: string;

  @IsNotEmpty()
  @IsString()
  libelle: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantiteEstimee?: number;

  @IsOptional()
  @IsString()
  uniteQuantite?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prixUnitaireEstime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  montantEstime?: number;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  ordre?: number;
}

export class CreateEstimationDto {
  @IsNotEmpty()
  @IsString()
  affaireId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;

  @IsOptional()
  @IsEnum(StatutEstimation)
  statut?: StatutEstimation;

  @IsOptional()
  @IsString()
  validePar?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  // Données d'estimation globales
  @IsOptional()
  @IsNumber()
  @Min(0)
  montantTotalEstime?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  dureeTotaleEstimee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  coutMainOeuvreEstime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  coutAchatsEstime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  coutFraisGenerauxEstime?: number;

  @IsOptional()
  @IsNumber()
  margeEstimee?: number;

  // Répartition temporelle estimée
  @IsOptional()
  @IsInt()
  @Min(0)
  demiJourneesFabricationEstimees?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  demiJourneesPoseEstimees?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  nombrePersonnesEstime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tauxHoraireMoyenEstime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tauxHoraireVente?: number;

  // Dates estimées
  @IsOptional()
  @IsDateString()
  dateCommencementEstimee?: string;

  @IsOptional()
  @IsDateString()
  dateReceptionEstimee?: string;

  // Données étendues en JSON
  @IsOptional()
  @IsString()
  donneesEtendues?: string;

  // Détails d'estimation
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEstimationDetailDto)
  details?: CreateEstimationDetailDto[];
}

export class UpdateEstimationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;

  @IsOptional()
  @IsEnum(StatutEstimation)
  statut?: StatutEstimation;

  @IsOptional()
  @IsString()
  validePar?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  // Données d'estimation globales
  @IsOptional()
  @IsNumber()
  @Min(0)
  montantTotalEstime?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  dureeTotaleEstimee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  coutMainOeuvreEstime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  coutAchatsEstime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  coutFraisGenerauxEstime?: number;

  @IsOptional()
  @IsNumber()
  margeEstimee?: number;

  // Répartition temporelle estimée
  @IsOptional()
  @IsInt()
  @Min(0)
  demiJourneesFabricationEstimees?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  demiJourneesPoseEstimees?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  nombrePersonnesEstime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tauxHoraireMoyenEstime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tauxHoraireVente?: number;

  // Dates estimées
  @IsOptional()
  @IsDateString()
  dateCommencementEstimee?: string;

  @IsOptional()
  @IsDateString()
  dateReceptionEstimee?: string;

  // Données étendues en JSON
  @IsOptional()
  @IsString()
  donneesEtendues?: string;

  // Détails d'estimation
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEstimationDetailDto)
  details?: CreateEstimationDetailDto[];
}

export class ValiderEstimationDto {
  @IsNotEmpty()
  @IsString()
  validePar: string;

  @IsOptional()
  @IsString()
  commentaire?: string;
} 