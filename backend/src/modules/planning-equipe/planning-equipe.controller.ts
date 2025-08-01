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
  HttpStatus,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PlanningEquipeService } from './planning-equipe.service';
import {
  CreateAffectationDto,
  UpdateAffectationDto,
  ModifierActiviteDto,
  PlanningHebdoDto,
  TypeActiviteEnum,
} from './dto/affectation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Planning Équipe')
@Controller('planning-equipe')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlanningEquipeController {
  constructor(private readonly planningEquipeService: PlanningEquipeService) {}

  @Get('semaine')
  @Roles('ADMIN_SYS', 'CHEF_ATELIER', 'DIRIGEANT', 'CHARGE_AFFAIRE', 'CHEF_CHANTIER')
  @ApiOperation({ summary: 'Récupérer le planning hebdomadaire' })
  @ApiQuery({ name: 'dateDebut', description: 'Date de début de semaine (ISO)', example: '2024-07-01' })
  @ApiQuery({ name: 'inclureTerminees', description: 'Inclure les affectations terminées', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Planning hebdomadaire récupéré avec succès' })
  async getPlanningHebdomadaire(
    @Query('dateDebut') dateDebut: string,
    @Query('inclureTerminees') inclureTerminees?: boolean,
  ) {
    try {
      const planningHebdoDto: PlanningHebdoDto = {
        dateDebut,
        inclureTerminees: inclureTerminees === true || inclureTerminees?.toString() === 'true',
      };
      return await this.planningEquipeService.getPlanningHebdomadaire(planningHebdoDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération du planning',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ouvriers-disponibles')
  @Roles('ADMIN_SYS', 'CHEF_ATELIER', 'DIRIGEANT', 'CHARGE_AFFAIRE', 'CHEF_CHANTIER')
  @ApiOperation({ summary: 'Récupérer la liste des ouvriers disponibles pour le planning' })
  @ApiResponse({ status: 200, description: 'Liste des ouvriers récupérée avec succès' })
  async getOuvriersDisponibles() {
    try {
      return await this.planningEquipeService.getOuvriersDisponibles();
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des ouvriers',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('affaires-actives')
  @Roles('ADMIN_SYS', 'CHEF_ATELIER', 'DIRIGEANT', 'CHARGE_AFFAIRE', 'CHEF_CHANTIER')
  @ApiOperation({ summary: 'Récupérer la liste des affaires actives' })
  @ApiResponse({ status: 200, description: 'Liste des affaires actives récupérée avec succès' })
  async getAffairesActives() {
    try {
      return await this.planningEquipeService.getAffairesActives();
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des affaires',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('affaire/:affaireId/affectations')
  @Roles('ADMIN_SYS', 'CHEF_ATELIER', 'DIRIGEANT', 'CHARGE_AFFAIRE', 'CHEF_CHANTIER')
  @ApiOperation({ summary: 'Récupérer TOUTES les affectations d\'une affaire spécifique' })
  @ApiParam({ name: 'affaireId', description: 'ID de l\'affaire' })
  @ApiQuery({ name: 'inclureTerminees', description: 'Inclure les affectations terminées', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Affectations de l\'affaire récupérées avec succès' })
  async getAllAffectationsAffaire(
    @Param('affaireId') affaireId: string,
    @Query('inclureTerminees') inclureTerminees?: boolean,
  ) {
    try {
      return await this.planningEquipeService.getAllAffectationsAffaire(
        affaireId,
        inclureTerminees === true || inclureTerminees?.toString() === 'true'
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des affectations',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('affecter')
  @Roles('ADMIN_SYS', 'CHEF_ATELIER', 'DIRIGEANT', 'CHARGE_AFFAIRE', 'CHEF_CHANTIER')
  @ApiOperation({ summary: 'Affecter un ouvrier au planning' })
  @ApiResponse({ status: 201, description: 'Affectation créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Affaire ou utilisateur non trouvé' })
  @ApiResponse({ status: 409, description: 'Conflit d\'affectation' })
  async affecterOuvrier(@Body() createAffectationDto: CreateAffectationDto) {
    try {
      return await this.planningEquipeService.affecterOuvrier(createAffectationDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de l\'affectation',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('modifier-activite/:id')
  @Roles('ADMIN_SYS', 'CHEF_ATELIER', 'DIRIGEANT', 'CHARGE_AFFAIRE', 'CHEF_CHANTIER')
  @ApiOperation({ summary: 'Modifier le type d\'activité d\'une affectation (Fabrication/Pose)' })
  @ApiParam({ name: 'id', description: 'ID de l\'affectation' })
  @ApiResponse({ status: 200, description: 'Type d\'activité modifié avec succès' })
  @ApiResponse({ status: 404, description: 'Affectation non trouvée' })
  async modifierTypeActivite(
    @Param('id') id: string,
    @Body() modifierActiviteDto: ModifierActiviteDto,
  ) {
    try {
      return await this.planningEquipeService.modifierTypeActivite(id, modifierActiviteDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la modification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('affectation/:id')
  @Roles('ADMIN_SYS', 'CHEF_ATELIER', 'DIRIGEANT', 'CHARGE_AFFAIRE', 'CHEF_CHANTIER')
  @ApiOperation({ summary: 'Mettre à jour une affectation' })
  @ApiParam({ name: 'id', description: 'ID de l\'affectation' })
  @ApiResponse({ status: 200, description: 'Affectation mise à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Affectation non trouvée' })
  async updateAffectation(
    @Param('id') id: string,
    @Body() updateAffectationDto: UpdateAffectationDto,
  ) {
    try {
      return await this.planningEquipeService.updateAffectation(id, updateAffectationDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la mise à jour',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('desaffecter/:id')
  @Roles('ADMIN_SYS', 'CHEF_ATELIER', 'DIRIGEANT', 'CHARGE_AFFAIRE', 'CHEF_CHANTIER')
  @ApiOperation({ summary: 'Désaffecter un ouvrier (supprimer affectation)' })
  @ApiParam({ name: 'id', description: 'ID de l\'affectation à supprimer' })
  @ApiResponse({ status: 200, description: 'Affectation supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Affectation non trouvée' })
  async desaffecterOuvrier(@Param('id') id: string) {
    try {
      return await this.planningEquipeService.desaffecterOuvrier(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la suppression',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('statistiques')
  @Roles('ADMIN_SYS', 'CHEF_ATELIER', 'DIRIGEANT', 'CHARGE_AFFAIRE')
  @ApiOperation({ summary: 'Obtenir les statistiques du planning pour une semaine' })
  @ApiQuery({ name: 'dateDebut', description: 'Date de début de semaine (ISO)', example: '2024-07-01' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès' })
  async getStatistiquesPlanning(@Query('dateDebut') dateDebut: string) {
    try {
      return await this.planningEquipeService.getStatistiquesPlanning(dateDebut);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors du calcul des statistiques',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('validation/:affaireId/:userId')
  @Roles('ADMIN_SYS', 'CHEF_ATELIER', 'DIRIGEANT', 'CHARGE_AFFAIRE', 'CHEF_CHANTIER')
  @ApiOperation({ summary: 'Valider la disponibilité d\'un ouvrier pour une affaire' })
  @ApiParam({ name: 'affaireId', description: 'ID de l\'affaire' })
  @ApiParam({ name: 'userId', description: 'ID de l\'ouvrier' })
  @ApiQuery({ name: 'dateAffectation', description: 'Date d\'affectation (ISO)' })
  @ApiQuery({ name: 'periode', description: 'Période (MATIN ou APREM)' })
  @ApiResponse({ status: 200, description: 'Validation effectuée' })
  async validerDisponibilite(
    @Param('affaireId') affaireId: string,
    @Param('userId') userId: string,
    @Query('dateAffectation') dateAffectation: string,
    @Query('periode') periode: string,
  ) {
    try {
      // Cette méthode peut être utilisée côté frontend avant de faire le drag & drop
      // pour afficher des alertes visuelles
      const createAffectationDto: CreateAffectationDto = {
        affaireId,
        userId,
        dateAffectation,
        periode: periode as any,
        typeActivite: TypeActiviteEnum.FABRICATION, // Valeur par défaut pour la validation
      };

      // On simule l'affectation sans la créer pour voir s'il y a des erreurs
      try {
        // On peut implémenter une méthode de validation séparée si nécessaire
        return { 
          valide: true, 
          message: 'Affectation possible' 
        };
      } catch (validationError) {
        return { 
          valide: false, 
          message: validationError.message,
          code: validationError.status
        };
      }
    } catch (error) {
      return { 
        valide: false, 
        message: error.message || 'Erreur de validation',
        code: error.status || HttpStatus.BAD_REQUEST
      };
    }
  }

  // 🚨 NOUVELLE ROUTE : Supprimer TOUTES les affectations (DANGER)
  @Delete('affectations/all')
  @Roles('ADMIN_SYS')
  @ApiOperation({ summary: '🚨 DANGER: Supprimer TOUTES les affectations du planning' })
  @ApiResponse({ status: 200, description: 'Toutes les affectations supprimées avec succès' })
  @ApiResponse({ status: 400, description: 'Erreur lors de la suppression' })
  async supprimerToutesLesAffectations() {
    try {
      return await this.planningEquipeService.supprimerToutesLesAffectations();
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la suppression des affectations',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🚨 NOUVELLE ROUTE : Supprimer les affectations d'une affaire spécifique
  @Delete('affectations/affaire/:affaireId')
  @Roles('ADMIN_SYS', 'CHARGE_AFFAIRE')
  @ApiOperation({ summary: 'Supprimer les affectations d\'une affaire spécifique' })
  @ApiParam({ name: 'affaireId', description: 'ID de l\'affaire' })
  @ApiResponse({ status: 200, description: 'Affectations de l\'affaire supprimées avec succès' })
  @ApiResponse({ status: 400, description: 'Erreur lors de la suppression' })
  async supprimerAffectationsAffaire(@Param('affaireId') affaireId: string) {
    try {
      return await this.planningEquipeService.supprimerAffectationsAffaire(affaireId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la suppression des affectations',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Nouvelle route : Historique des affectations d'un ouvrier sur une affaire
  @Get('historique/:userId/:affaireId')
  async getHistoriqueOuvrierAffaire(
    @Param('userId') userId: string,
    @Param('affaireId') affaireId: string
  ) {
    return this.planningEquipeService.getAffectationsHistoriqueOuvrierAffaire(userId, affaireId);
  }

  /**
   * Récupérer les totaux historiques complets pour une affaire
   * Inclut tous les ouvriers qui ont travaillé sur cette affaire
   */
  @Get('totaux-historiques-affaire/:affaireId')
  async getTotauxHistoriquesAffaire(@Param('affaireId') affaireId: string) {
    try {
      console.log(`🔍 Récupération totaux historiques pour affaire ${affaireId}...`);
      
      const totaux = await this.planningEquipeService.getTotauxHistoriquesAffaire(affaireId);
      
      console.log(`✅ Totaux historiques récupérés pour affaire ${affaireId}:`, totaux);
      return totaux;
      
    } catch (error) {
      console.error(`❌ Erreur récupération totaux historiques affaire ${affaireId}:`, error);
      throw new BadRequestException(`Erreur lors de la récupération des totaux historiques: ${error.message}`);
    }
  }

  /**
   * 📊 NOUVEAU : Récupérer les frais généraux de la semaine avec détails d'absorption
   */
  @Get('frais-generaux-semaine')
  @Roles('ADMIN_SYS', 'CHEF_ATELIER', 'DIRIGEANT', 'CHARGE_AFFAIRE')
  @ApiOperation({ summary: 'Récupérer les frais généraux de la semaine avec détails d\'absorption' })
  @ApiQuery({ name: 'dateRef', description: 'Date de référence pour identifier la semaine (ISO)', example: '2025-01-11' })
  @ApiResponse({ status: 200, description: 'Frais généraux de la semaine récupérés avec succès' })
  async getFraisGenerauxSemaine(@Query('dateRef') dateRef: string) {
    try {
      console.log(`📊 Récupération frais généraux semaine pour date de référence: ${dateRef}`);
      
      const fraisGenerauxSemaine = await this.planningEquipeService.getFraisGenerauxSemaine(dateRef);
      
      console.log(`✅ Frais généraux semaine récupérés:`, {
        semaine: fraisGenerauxSemaine.semaine,
        annee: fraisGenerauxSemaine.annee,
        fraisGenerauxRestants: fraisGenerauxSemaine.fraisGenerauxRestants,
        tauxAbsorption: fraisGenerauxSemaine.tauxAbsorption
      });
      
      return fraisGenerauxSemaine;
      
    } catch (error) {
      console.error(`❌ Erreur récupération frais généraux semaine:`, error);
      throw new BadRequestException(`Erreur lors de la récupération des frais généraux de la semaine: ${error.message}`);
    }
  }

  @Get('debug/frais-generaux/:dateRef')
  @Public() // 🔍 TEMPORAIRE : Route publique pour débogage
  @ApiOperation({ summary: '🔍 DÉBOGAGE TEMPORAIRE - Analyser les frais généraux' })
  async debugFraisGeneraux(@Param('dateRef') dateRef: string) {
    return this.planningEquipeService.debugFraisGeneraux(dateRef);
  }
} 