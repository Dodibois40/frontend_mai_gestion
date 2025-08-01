import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
// Commentons temporairement les services manquants
// import { CuttingAlgorithmService } from './cutting-algorithm.service';
// import { GrainManagerService } from './grain-manager.service';
// import { OffcutService } from './offcut.service';
import { PanelService } from './panel.service';
import { ProjectService } from './project.service';
import { OptimizationParamsDto, OptimizationStrategy } from '../dto/optimization.dto';

@Injectable()
export class OptimizationService {
  constructor(
    private prisma: PrismaService,
    // private cuttingAlgorithm: CuttingAlgorithmService,
    // private grainManager: GrainManagerService,
    // private offcutService: OffcutService,
    private panelService: PanelService,
    private projectService: ProjectService,
  ) {}

  async optimizeProject(projectId: string, params: OptimizationParamsDto) {
    try {
      // 1. Charger le projet et ses pièces
      const project = await this.projectService.findOne(projectId);
      
      // 2. Obtenir les panneaux disponibles
      const availablePanels = await this.panelService.findAvailablePanels();
      
      if (availablePanels.length === 0) {
        throw new Error('Aucun panneau disponible en stock');
      }

      // Simulation temporaire d'optimisation
      const mockResult = {
        id: 'mock-id',
        projectId,
        strategy: params.strategy,
        totalPanelsUsed: 3,
        totalEfficiency: 87.5,
        totalWaste: 12.5,
        totalCost: 250.0,
        totalCutLength: 1200,
        algorithm: 'BOTTOM_LEFT_FILL',
        isOptimal: true,
        metrics: JSON.stringify({
          cuttingPlans: [],
          offcuts: [],
          materialBreakdown: {},
          timeEstimate: 45,
          warnings: [],
        }),
        createdAt: new Date(),
        cuttingPlans: [],
        offcuts: [],
        parsedMetrics: {
          cuttingPlans: [],
          offcuts: [],
          materialBreakdown: {},
          timeEstimate: 45,
          warnings: [],
        },
      };

      // TODO: Sauvegarder en base quand Prisma sera régénéré
      // const savedResult = await this.prisma.optimizationResult.create({...});

      return mockResult;
    } catch (error: any) {
      throw new Error(`Erreur lors de l'optimisation: ${error.message}`);
    }
  }

  async getOptimizationResults(projectId: string) {
    // TODO: Remplacer par la vraie requête Prisma
    // const results = await this.prisma.optimizationResult.findMany({...});
    
    return [
      {
        id: 'mock-1',
        projectId,
        strategy: OptimizationStrategy.EFFICIENCY_FIRST,
        totalPanelsUsed: 3,
        totalEfficiency: 87.5,
        totalWaste: 12.5,
        totalCost: 250.0,
        totalCutLength: 1200,
        algorithm: 'BOTTOM_LEFT_FILL',
        isOptimal: true,
        metrics: '{"cuttingPlans":[],"offcuts":[]}',
        createdAt: new Date(),
        cuttingPlans: [],
        offcuts: [],
        parsedMetrics: { cuttingPlans: [], offcuts: [] },
      }
    ];
  }

  async getOptimizationResult(resultId: string) {
    // TODO: Remplacer par la vraie requête Prisma
    return {
      id: resultId,
      projectId: 'mock-project',
      strategy: OptimizationStrategy.EFFICIENCY_FIRST,
      totalPanelsUsed: 3,
      totalEfficiency: 87.5,
      totalWaste: 12.5,
      totalCost: 250.0,
      totalCutLength: 1200,
      algorithm: 'BOTTOM_LEFT_FILL',
      isOptimal: true,
      metrics: '{"cuttingPlans":[],"offcuts":[]}',
      createdAt: new Date(),
      cuttingPlans: [],
      offcuts: [],
      parsedMetrics: { cuttingPlans: [], offcuts: [] },
      project: {
        id: 'mock-project',
        name: 'Projet test',
        pieces: []
      }
    };
  }

  async previewOptimization(projectId: string, params: OptimizationParamsDto) {
    // Version allégée pour prévisualisation sans sauvegarde
    const project = await this.projectService.findOne(projectId);
    const panels = await this.panelService.findAvailablePanels();

    // Simulation temporaire
    return {
      preview: true,
      totalPanelsEstimate: 3,
      wasteEstimate: 12.5,
      costEstimate: 250.0,
      efficiency: 87.5,
      feasible: true,
      warnings: [],
    };
  }

  async getAvailableStrategies() {
    return [
      {
        value: OptimizationStrategy.EFFICIENCY_FIRST,
        label: 'Maximiser l\'Efficacité',
        description: 'Optimise pour obtenir la meilleure efficacité matière',
        icon: '📊',
      },
      {
        value: OptimizationStrategy.COST_MINIMIZE,
        label: 'Minimiser les Coûts',
        description: 'Optimise pour réduire le coût total des matériaux',
        icon: '💰',
      },
      {
        value: OptimizationStrategy.GRAIN_RESPECT,
        label: 'Respect du Fil',
        description: 'Respecte absolument le sens du fil du bois',
        icon: '🪵',
      },
      {
        value: OptimizationStrategy.CUT_MINIMIZE,
        label: 'Minimiser les Coupes',
        description: 'Réduit le nombre total de coupes nécessaires',
        icon: '✂️',
      },
    ];
  }

  async compareStrategies(projectId: string, kerfWidth?: number) {
    const project = await this.projectService.findOne(projectId);
    const panels = await this.panelService.findAvailablePanels();

    const strategies = [
      OptimizationStrategy.EFFICIENCY_FIRST,
      OptimizationStrategy.COST_MINIMIZE,
      OptimizationStrategy.GRAIN_RESPECT,
      OptimizationStrategy.CUT_MINIMIZE,
    ];

    const comparisons = strategies.map(strategy => ({
      strategy,
      totalPanels: 3,
      totalWaste: 12.5,
      totalCost: 250.0,
      efficiency: 87.5,
      feasible: true,
      warnings: 0,
    }));

    return {
      projectId,
      comparisons,
      recommendation: comparisons[0],
      generatedAt: new Date(),
    };
  }

  async deleteOptimizationResult(resultId: string) {
    // TODO: Remplacer par la vraie requête Prisma
    // const result = await this.prisma.optimizationResult.findUnique({...});
    // await this.prisma.optimizationResult.delete({...});
    
    return { message: 'Résultat d\'optimisation supprimé avec succès' };
  }

  async getProjectStatistics(projectId: string) {
    // TODO: Implémenter avec les vraies requêtes Prisma
    return {
      totalOptimizations: 1,
      bestStrategy: OptimizationStrategy.EFFICIENCY_FIRST,
      bestEfficiency: 87.5,
      averageWaste: 12.5,
      averageCost: 250.0,
    };
  }
} 