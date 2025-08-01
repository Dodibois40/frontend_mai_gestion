import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptimizationService } from '../services/optimization.service';
import { OptimizationParamsDto } from '../dto/optimization.dto';

@Controller('opti-coupe/optimization')
@UseGuards(JwtAuthGuard)
export class OptimizationController {
  constructor(private optimizationService: OptimizationService) {}

  @Post(':projectId')
  async optimize(
    @Param('projectId') projectId: string,
    @Body() params: OptimizationParamsDto
  ) {
    return this.optimizationService.optimizeProject(projectId, params);
  }

  @Get('results/:projectId')
  async getResults(@Param('projectId') projectId: string) {
    return this.optimizationService.getOptimizationResults(projectId);
  }

  @Get('results/:projectId/:resultId')
  async getSpecificResult(
    @Param('projectId') projectId: string,
    @Param('resultId') resultId: string
  ) {
    return this.optimizationService.getOptimizationResult(resultId);
  }

  @Post('preview/:projectId')
  async previewOptimization(
    @Param('projectId') projectId: string,
    @Body() params: OptimizationParamsDto
  ) {
    return this.optimizationService.previewOptimization(projectId, params);
  }

  @Get('strategies')
  async getStrategies() {
    return this.optimizationService.getAvailableStrategies();
  }
} 