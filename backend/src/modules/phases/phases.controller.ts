import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PhasesService } from './phases.service';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';

@ApiTags('Phases')
@Controller('phases')
export class PhasesController {
  constructor(private readonly phasesService: PhasesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle phase de chantier' })
  @ApiResponse({ status: 201, description: 'Phase créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Affaire non trouvée' })
  create(@Body(ValidationPipe) createPhaseDto: CreatePhaseDto) {
    return this.phasesService.create(createPhaseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les phases avec filtres' })
  @ApiQuery({ name: 'affaireId', required: false, description: 'ID de l\'affaire' })
  @ApiQuery({ name: 'typePhase', required: false, description: 'Type de phase' })
  @ApiQuery({ name: 'statut', required: false, description: 'Statut de la phase' })
  @ApiQuery({ name: 'skip', required: false, description: 'Nombre d\'éléments à ignorer' })
  @ApiQuery({ name: 'take', required: false, description: 'Nombre d\'éléments à récupérer' })
  @ApiResponse({ status: 200, description: 'Liste des phases récupérée avec succès' })
  findAll(
    @Query('affaireId') affaireId?: string,
    @Query('typePhase') typePhase?: string,
    @Query('statut') statut?: string,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
  ) {
    return this.phasesService.findAll(affaireId, typePhase, statut, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une phase par ID' })
  @ApiResponse({ status: 200, description: 'Phase trouvée' })
  @ApiResponse({ status: 404, description: 'Phase non trouvée' })
  findOne(@Param('id') id: string) {
    return this.phasesService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Récupérer les statistiques d\'une phase' })
  @ApiResponse({ status: 200, description: 'Statistiques de la phase' })
  @ApiResponse({ status: 404, description: 'Phase non trouvée' })
  getStats(@Param('id') id: string) {
    return this.phasesService.getStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une phase' })
  @ApiResponse({ status: 200, description: 'Phase mise à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Phase non trouvée' })
  update(@Param('id') id: string, @Body(ValidationPipe) updatePhaseDto: UpdatePhaseDto) {
    return this.phasesService.update(id, updatePhaseDto);
  }

  @Patch(':id/calculate')
  @ApiOperation({ summary: 'Recalculer les données réelles d\'une phase' })
  @ApiResponse({ status: 200, description: 'Données recalculées avec succès' })
  @ApiResponse({ status: 404, description: 'Phase non trouvée' })
  calculateRealData(@Param('id') id: string) {
    return this.phasesService.calculateRealData(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une phase' })
  @ApiResponse({ status: 200, description: 'Phase supprimée avec succès' })
  @ApiResponse({ status: 400, description: 'Impossible de supprimer : des tâches sont associées' })
  @ApiResponse({ status: 404, description: 'Phase non trouvée' })
  remove(@Param('id') id: string) {
    return this.phasesService.remove(id);
  }
} 