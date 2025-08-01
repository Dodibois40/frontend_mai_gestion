import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PanelController } from './controllers/panel.controller';
import { ProjectController } from './controllers/project.controller';
import { OptimizationController } from './controllers/optimization.controller';
import { PanelService } from './services/panel.service';
import { ProjectService } from './services/project.service';
import { OptimizationService } from './services/optimization.service';
import { CuttingAlgorithmService } from './services/cutting-algorithm.service';
import { GrainManagerService } from './services/grain-manager.service';
import { OffcutService } from './services/offcut.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    PanelController,
    ProjectController,
    OptimizationController,
  ],
  providers: [
    PanelService,
    ProjectService,
    OptimizationService,
    CuttingAlgorithmService,
    GrainManagerService,
    OffcutService,
  ],
  exports: [
    PanelService,
    OptimizationService,
  ],
})
export class OptiCoupeModule {} 