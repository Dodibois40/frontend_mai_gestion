import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EstimationsAchatsService } from './estimations-achats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';

@ApiTags('estimations-achats')
@Controller('estimations-achats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstimationsAchatsController {
  constructor(private readonly estimationsAchatsService: EstimationsAchatsService) {}

  @Get('dashboard')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE, RoleEnum.DIRIGEANT)
  @ApiOperation({ summary: 'Récupérer les estimations pour le dashboard' })
  @ApiResponse({ status: 200, description: 'Estimations récupérées avec succès' })
  async getEstimationsPourDashboard(
    @Query('affaireId') affaireId?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    const params: any = {};
    
    if (affaireId) {
      params.affaireId = affaireId;
    }
    
    if (dateDebut) {
      params.dateDebut = new Date(dateDebut);
    }
    
    if (dateFin) {
      params.dateFin = new Date(dateFin);
    }

    return this.estimationsAchatsService.getEstimationsPourDashboard(params);
  }

  @Get('statistiques')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.DIRIGEANT)
  @ApiOperation({ summary: 'Récupérer les statistiques globales des estimations' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès' })
  async getStatistiquesGlobales() {
    return this.estimationsAchatsService.getStatistiquesGlobales();
  }
}

// Contrôleur pour les routes liées aux affaires
@ApiTags('affaires')
@Controller('affaires')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AffairesEstimationsController {
  constructor(private readonly estimationsAchatsService: EstimationsAchatsService) {}

  @Post(':id/estimation-achats')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Sauvegarder une estimation d\'achats pour une affaire' })
  @ApiResponse({ status: 201, description: 'Estimation sauvegardée avec succès' })
  async sauvegarderEstimation(
    @Param('id') affaireId: string,
    @Body() estimationData: {
      categoriesActives: any[];
      pourcentageBudgetAchats: number;
      montantEstimationAchats: number;
      totalPourcentage: number;
    },
  ) {
    return this.estimationsAchatsService.sauvegarderEstimation(affaireId, estimationData);
  }

  @Get(':id/estimation-achats')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE, RoleEnum.DIRIGEANT)
  @ApiOperation({ summary: 'Récupérer l\'estimation d\'achats d\'une affaire' })
  @ApiResponse({ status: 200, description: 'Estimation récupérée avec succès' })
  async getEstimationParAffaire(@Param('id') affaireId: string) {
    return this.estimationsAchatsService.getEstimationParAffaire(affaireId);
  }

  @Put(':id/estimation-achats')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Mettre à jour une estimation d\'achats' })
  @ApiResponse({ status: 200, description: 'Estimation mise à jour avec succès' })
  async mettreAJourEstimation(
    @Param('id') affaireId: string,
    @Body() estimationData: {
      categoriesActives: any[];
      pourcentageBudgetAchats: number;
      montantEstimationAchats: number;
      totalPourcentage: number;
    },
  ) {
    return this.estimationsAchatsService.sauvegarderEstimation(affaireId, estimationData);
  }

  @Delete(':id/estimation-achats')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Supprimer une estimation d\'achats' })
  @ApiResponse({ status: 200, description: 'Estimation supprimée avec succès' })
  async supprimerEstimation(@Param('id') affaireId: string) {
    await this.estimationsAchatsService.supprimerEstimation(affaireId);
    return { message: 'Estimation supprimée avec succès' };
  }
} 