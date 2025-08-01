import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
// import { RoleEnum } from '@prisma/client';

// Enum temporaire en attendant la génération complète de Prisma
enum RoleEnum {
  ADMIN_SYS = 'ADMIN_SYS',
  CHEF_ATELIER = 'CHEF_ATELIER',
  CHARGE_AFFAIRE = 'CHARGE_AFFAIRE',
  ACHETEUR = 'ACHETEUR',
  EMPLOYE = 'EMPLOYE'
}

@ApiTags('reporting')
@ApiBearerAuth()
@Controller('reporting')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Récupérer les données du dashboard' })
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE)
  async getDashboardData() {
    try {
      return await this.reportingService.getDashboardData();
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération des données du dashboard: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('affaires-performance')
  @ApiOperation({ summary: 'Récupérer les performances des affaires' })
  @ApiQuery({ name: 'dateDebut', required: false, type: Date })
  @ApiQuery({ name: 'dateFin', required: false, type: Date })
  @ApiQuery({ name: 'statut', required: false, type: String })
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE)
  async getAffairesPerformance(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('statut') statut?: string,
  ) {
    try {
      const params: any = {};
      
      if (dateDebut) {
        params.dateDebut = new Date(dateDebut);
      }
      
      if (dateFin) {
        params.dateFin = new Date(dateFin);
      }
      
      if (statut) {
        params.statut = statut;
      }

      return await this.reportingService.getAffairesPerformance(params);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération des performances des affaires: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('heures-stats')
  @ApiOperation({ summary: 'Récupérer les statistiques des heures' })
  @ApiQuery({ name: 'dateDebut', required: false, type: Date })
  @ApiQuery({ name: 'dateFin', required: false, type: Date })
  @ApiQuery({ name: 'affaireId', required: false, type: String })
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE, RoleEnum.CHEF_ATELIER)
  async getHeuresStats(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('affaireId') affaireId?: string,
  ) {
    try {
      const params: any = {};
      
      if (dateDebut) {
        params.dateDebut = new Date(dateDebut);
      }
      
      if (dateFin) {
        params.dateFin = new Date(dateFin);
      }
      
      if (affaireId) {
        params.affaireId = affaireId;
      }

      return await this.reportingService.getHeuresStats(params);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération des statistiques d'heures: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('achats-evolution')
  @ApiOperation({ summary: 'Récupérer l\'évolution des achats' })
  @ApiQuery({ name: 'dateDebut', required: false, type: Date })
  @ApiQuery({ name: 'dateFin', required: false, type: Date })
  @ApiQuery({ name: 'categorieId', required: false, type: String })
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE, RoleEnum.ACHETEUR)
  async getAchatsEvolution(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('categorieId') categorieId?: string,
  ) {
    try {
      const params: any = {};
      
      if (dateDebut) {
        params.dateDebut = new Date(dateDebut);
      }
      
      if (dateFin) {
        params.dateFin = new Date(dateFin);
      }
      
      if (categorieId) {
        params.categorieId = categorieId;
      }

      return await this.reportingService.getAchatsEvolution(params);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération de l'évolution des achats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('marges-affaires')
  @ApiOperation({ summary: 'Récupérer les marges par affaire' })
  @ApiQuery({ name: 'dateDebut', required: false, type: Date })
  @ApiQuery({ name: 'dateFin', required: false, type: Date })
  @ApiQuery({ name: 'seuilMarge', required: false, type: Number })
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE)
  async getMargesAffaires(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('seuilMarge') seuilMarge?: string,
  ) {
    try {
      const params: any = {};
      
      if (dateDebut) {
        params.dateDebut = new Date(dateDebut);
      }
      
      if (dateFin) {
        params.dateFin = new Date(dateFin);
      }
      
      if (seuilMarge) {
        params.seuilMarge = parseFloat(seuilMarge);
      }

      return await this.reportingService.getMargesAffaires(params);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération des marges par affaire: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('inventaire-stats')
  @ApiOperation({ summary: 'Récupérer les statistiques d\'inventaire' })
  @ApiQuery({ name: 'dateDebut', required: false, type: Date })
  @ApiQuery({ name: 'dateFin', required: false, type: Date })
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE)
  async getInventaireStats(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    try {
      const params: any = {};
      
      if (dateDebut) {
        params.dateDebut = new Date(dateDebut);
      }
      
      if (dateFin) {
        params.dateFin = new Date(dateFin);
      }

      return await this.reportingService.getInventaireStats(params);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération des statistiques d'inventaire: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('export/:reportType')
  @ApiOperation({ summary: 'Exporter des données en CSV ou PDF' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'pdf'] })
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE)
  async exportData(
    @Query('reportType') reportType: string,
    @Query('format') format: string = 'csv',
    @Query() params: any,
  ) {
    try {
      // TODO: Implémenter l'export en CSV/PDF
      // Pour l'instant, on retourne les données JSON
      
      let data;
      switch (reportType) {
        case 'dashboard':
          data = await this.reportingService.getDashboardData();
          break;
        case 'affaires-performance':
          data = await this.reportingService.getAffairesPerformance(params);
          break;
        case 'heures-stats':
          data = await this.reportingService.getHeuresStats(params);
          break;
        case 'achats-evolution':
          data = await this.reportingService.getAchatsEvolution(params);
          break;
        case 'marges-affaires':
          data = await this.reportingService.getMargesAffaires(params);
          break;
        case 'inventaire-stats':
          data = await this.reportingService.getInventaireStats(params);
          break;
        default:
          throw new HttpException(
            `Type de rapport non supporté: ${reportType}`,
            HttpStatus.BAD_REQUEST,
          );
      }

      return {
        message: `Export ${format.toUpperCase()} en cours de développement`,
        data,
        format,
        reportType,
      };
    } catch (error) {
      throw new HttpException(
        `Erreur lors de l'export des données: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 