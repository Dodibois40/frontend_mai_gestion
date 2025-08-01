import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EstimationReelService } from './estimation-reel.service';
import { CreateEstimationDto, UpdateEstimationDto, ValiderEstimationDto } from './dto/create-estimation.dto';
import { CreateComparaisonDto, TypeComparaison } from './dto/create-comparaison.dto';

@Controller('api/estimation-reel')
@UseGuards(JwtAuthGuard)
export class EstimationReelController {
  constructor(private readonly estimationReelService: EstimationReelService) {}

  // ===== ENDPOINTS ESTIMATIONS =====

  /**
   * Créer une nouvelle estimation
   * POST /api/estimation-reel/estimations
   */
  @Post('estimations')
  async createEstimation(@Body() createEstimationDto: CreateEstimationDto) {
    return this.estimationReelService.createEstimation(createEstimationDto);
  }

  /**
   * Récupérer toutes les estimations d'une affaire
   * GET /api/estimation-reel/estimations/affaire/:affaireId
   */
  @Get('estimations/affaire/:affaireId')
  async getEstimationsByAffaire(@Param('affaireId') affaireId: string) {
    return this.estimationReelService.getEstimationsByAffaire(affaireId);
  }

  /**
   * Récupérer une estimation par son ID
   * GET /api/estimation-reel/estimations/:id
   */
  @Get('estimations/:id')
  async getEstimationById(@Param('id') id: string) {
    return this.estimationReelService.getEstimationById(id);
  }

  /**
   * Mettre à jour une estimation
   * PUT /api/estimation-reel/estimations/:id
   */
  @Put('estimations/:id')
  async updateEstimation(
    @Param('id') id: string,
    @Body() updateEstimationDto: UpdateEstimationDto
  ) {
    return this.estimationReelService.updateEstimation(id, updateEstimationDto);
  }

  /**
   * Valider une estimation
   * POST /api/estimation-reel/estimations/:id/valider
   */
  @Post('estimations/:id/valider')
  async validerEstimation(
    @Param('id') id: string,
    @Body() validerEstimationDto: ValiderEstimationDto
  ) {
    return this.estimationReelService.validerEstimation(id, validerEstimationDto.validePar);
  }

  /**
   * Supprimer une estimation
   * DELETE /api/estimation-reel/estimations/:id
   */
  @Delete('estimations/:id')
  async deleteEstimation(@Param('id') id: string) {
    return this.estimationReelService.deleteEstimation(id);
  }

  // ===== ENDPOINTS COMPARAISONS =====

  /**
   * Créer une nouvelle comparaison estimation vs réel
   * POST /api/estimation-reel/comparaisons
   */
  @Post('comparaisons')
  async createComparaison(@Body() createComparaisonDto: CreateComparaisonDto, @Request() req: any) {
    // Ajouter l'ID de l'utilisateur connecté
    const comparaisonData = {
      ...createComparaisonDto,
      calculePar: req.user?.id || createComparaisonDto.calculePar,
    };
    
    return this.estimationReelService.createComparaison(comparaisonData);
  }

  /**
   * Récupérer toutes les comparaisons d'une affaire
   * GET /api/estimation-reel/comparaisons/affaire/:affaireId
   */
  @Get('comparaisons/affaire/:affaireId')
  async getComparaisonsByAffaire(@Param('affaireId') affaireId: string) {
    return this.estimationReelService.getComparaisonsByAffaire(affaireId);
  }

  /**
   * Récupérer une comparaison par son ID
   * GET /api/estimation-reel/comparaisons/:id
   */
  @Get('comparaisons/:id')
  async getComparaisonById(@Param('id') id: string) {
    return this.estimationReelService.getComparaisonById(id);
  }

  // ===== ENDPOINTS UTILITAIRES =====

  /**
   * Calculer les données réelles d'une affaire (sans sauvegarder)
   * GET /api/estimation-reel/donnees-reelles/:affaireId
   */
  @Get('donnees-reelles/:affaireId')
  async getDonneesReelles(@Param('affaireId') affaireId: string) {
    // Créer une comparaison temporaire pour récupérer les données
    const tempComparaison = await this.estimationReelService.createComparaison({
      affaireId,
      estimationId: 'temp', // Sera ignoré dans le calcul
      typeComparaison: TypeComparaison.SNAPSHOT,
    });

    // Retourner seulement les données réelles
    return {
      montantReelCalcule: tempComparaison.montantReelCalcule,
      dureeTotaleReelle: tempComparaison.dureeTotaleReelle,
      coutMainOeuvreReel: tempComparaison.coutMainOeuvreReel,
      coutAchatsReel: tempComparaison.coutAchatsReel,
      coutFraisGenerauxReel: tempComparaison.coutFraisGenerauxReel,
      margeReelle: tempComparaison.margeReelle,
      demiJourneesFabricationReelles: tempComparaison.demiJourneesFabricationReelles,
      demiJourneesPoseReelles: tempComparaison.demiJourneesPoseReelles,
      nombrePersonnesReel: tempComparaison.nombrePersonnesReel,
      tauxHoraireMoyenReel: tempComparaison.tauxHoraireMoyenReel,
      dateCommencementReelle: tempComparaison.dateCommencementReelle,
      dateReceptionReelle: tempComparaison.dateReceptionReelle,
    };
  }

  /**
   * Obtenir un résumé des écarts pour une affaire
   * GET /api/estimation-reel/resume-ecarts/:affaireId
   */
  @Get('resume-ecarts/:affaireId')
  async getResumeEcarts(@Param('affaireId') affaireId: string) {
    const comparaisons = await this.estimationReelService.getComparaisonsByAffaire(affaireId);
    
    if (comparaisons.length === 0) {
      return { message: 'Aucune comparaison trouvée pour cette affaire' };
    }

    // Prendre la comparaison la plus récente
    const dernièreComparaison = comparaisons[0];

    return {
      affaireId,
      dateComparaison: dernièreComparaison.dateComparaison,
      typeComparaison: dernièreComparaison.typeComparaison,
      statut: dernièreComparaison.statut,
      ecarts: {
        montant: {
          pourcentage: dernièreComparaison.ecartMontantPourcentage,
          statut: Math.abs(dernièreComparaison.ecartMontantPourcentage) <= 5 ? 'ACCEPTABLE' : 'ATTENTION',
        },
        duree: {
          pourcentage: dernièreComparaison.ecartDureePourcentage,
          statut: Math.abs(dernièreComparaison.ecartDureePourcentage) <= 10 ? 'ACCEPTABLE' : 'ATTENTION',
        },
        mainOeuvre: {
          pourcentage: dernièreComparaison.ecartMainOeuvrePourcentage,
          statut: Math.abs(dernièreComparaison.ecartMainOeuvrePourcentage) <= 10 ? 'ACCEPTABLE' : 'ATTENTION',
        },
        achats: {
          pourcentage: dernièreComparaison.ecartAchatsPourcentage,
          statut: Math.abs(dernièreComparaison.ecartAchatsPourcentage) <= 15 ? 'ACCEPTABLE' : 'ATTENTION',
        },
        fraisGeneraux: {
          pourcentage: dernièreComparaison.ecartFraisGenerauxPourcentage,
          statut: Math.abs(dernièreComparaison.ecartFraisGenerauxPourcentage) <= 5 ? 'ACCEPTABLE' : 'ATTENTION',
        },
        marge: {
          pourcentage: dernièreComparaison.ecartMargePourcentage,
          statut: dernièreComparaison.ecartMargePourcentage >= -10 ? 'ACCEPTABLE' : 'CRITIQUE',
        },
      },
    };
  }
} 