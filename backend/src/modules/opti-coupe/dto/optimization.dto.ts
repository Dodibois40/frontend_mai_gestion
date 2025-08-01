import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

// Redéfinir l'enum selon le schéma Prisma
export enum OptimizationStrategy {
  EFFICIENCY_FIRST = 'EFFICIENCY_FIRST',    // Maximiser l'efficacité matière
  COST_MINIMIZE = 'COST_MINIMIZE',          // Minimiser le coût total
  CUT_MINIMIZE = 'CUT_MINIMIZE',            // Minimiser les coupes
  GRAIN_RESPECT = 'GRAIN_RESPECT',          // Respecter le fil du bois
  SPEED_OPTIMIZE = 'SPEED_OPTIMIZE'         // Optimiser pour la vitesse de coupe
}

export class OptimizationParamsDto {
  @IsEnum(OptimizationStrategy)
  strategy: OptimizationStrategy;

  @IsNumber()
  @Min(0.1)
  @IsOptional()
  kerfWidth?: number;

  @IsString()
  @IsOptional()
  projectId?: string;
}

export class OptimizationResultDto {
  id: string;
  projectId: string;
  strategy: OptimizationStrategy;
  totalPanelsUsed: number;
  totalEfficiency: number;
  totalWaste: number;
  totalCost: number;
  totalCutLength: number;
  metrics: string; // JSON string comme dans Prisma
  algorithm: string;
  isOptimal: boolean;
  createdAt: Date;
  
  // Propriétés calculées (pas dans la DB)
  cuttingPlans?: any[];
  offcuts?: any[];
} 