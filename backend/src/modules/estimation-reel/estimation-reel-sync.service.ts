import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EstimationReelService } from './estimation-reel.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TypeComparaison } from './dto/create-comparaison.dto';

@Injectable()
export class EstimationReelSyncService {
  private readonly logger = new Logger(EstimationReelSyncService.name);

  constructor(
    private prisma: PrismaService,
    private estimationReelService: EstimationReelService
  ) {}

  /**
   * Synchronisation automatique des comparaisons (tous les jours à 6h)
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async synchroniserComparaisonsAutomatique() {
    this.logger.log('🔄 Début de la synchronisation automatique des comparaisons');
    
    try {
      // Récupérer toutes les affaires en cours
      const affairesEnCours = await this.prisma.affaire.findMany({
        where: {
          statut: {
            in: ['PLANIFIEE', 'EN_COURS'],
          },
        },
        include: {
          estimationsAffaire: {
            where: {
              statut: 'VALIDEE',
            },
            orderBy: {
              version: 'desc',
            },
            take: 1,
          },
        },
      });

      let compteurMisAJour = 0;
      let compteurErreurs = 0;

      for (const affaire of affairesEnCours) {
        try {
          // Vérifier s'il y a une estimation validée
          if (affaire.estimationsAffaire.length > 0) {
            const estimation = affaire.estimationsAffaire[0];
            
            // Vérifier s'il y a déjà une comparaison récente (moins de 24h)
            const comparaisonRecente = await this.prisma.comparaisonEstimationReel.findFirst({
              where: {
                affaireId: affaire.id,
                estimationId: estimation.id,
                dateComparaison: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h
                },
              },
            });

            if (!comparaisonRecente) {
              // Créer une nouvelle comparaison
              await this.estimationReelService.createComparaison({
                affaireId: affaire.id,
                estimationId: estimation.id,
                typeComparaison: TypeComparaison.TEMPS_REEL,
                calculePar: 'Système',
                commentaire: 'Synchronisation automatique quotidienne',
              });

              compteurMisAJour++;
              this.logger.log(`✅ Comparaison mise à jour pour l'affaire ${affaire.numero}`);
            }
          }
        } catch (error) {
          compteurErreurs++;
          this.logger.error(`❌ Erreur lors de la synchronisation de l'affaire ${affaire.numero}:`, error);
        }
      }

      this.logger.log(`✅ Synchronisation terminée: ${compteurMisAJour} comparaisons mises à jour, ${compteurErreurs} erreurs`);
    } catch (error) {
      this.logger.error('❌ Erreur lors de la synchronisation automatique:', error);
    }
  }

  /**
   * Synchroniser une affaire spécifique
   */
  async synchroniserAffaire(affaireId: string, userId?: string) {
    this.logger.log(`🔄 Synchronisation de l'affaire ${affaireId}`);

    try {
      // Récupérer l'affaire avec sa dernière estimation validée
      const affaire = await this.prisma.affaire.findUnique({
        where: { id: affaireId },
        include: {
          estimationsAffaire: {
            where: {
              statut: 'VALIDEE',
            },
            orderBy: {
              version: 'desc',
            },
            take: 1,
          },
        },
      });

      if (!affaire) {
        throw new Error(`Affaire ${affaireId} non trouvée`);
      }

      if (affaire.estimationsAffaire.length === 0) {
        throw new Error(`Aucune estimation validée pour l'affaire ${affaire.numero}`);
      }

      const estimation = affaire.estimationsAffaire[0];

      // Créer une nouvelle comparaison
      const comparaison = await this.estimationReelService.createComparaison({
        affaireId: affaire.id,
        estimationId: estimation.id,
        typeComparaison: TypeComparaison.SNAPSHOT,
        calculePar: userId || 'SYSTEM',
        commentaire: 'Synchronisation manuelle',
      });

      this.logger.log(`✅ Comparaison créée pour l'affaire ${affaire.numero}`);
      return comparaison;
    } catch (error) {
      this.logger.error(`❌ Erreur lors de la synchronisation de l'affaire ${affaireId}:`, error);
      throw error;
    }
  }

  /**
   * Détection automatique des écarts importants
   */
  async detecterEcartsImportants() {
    this.logger.log('🔍 Détection des écarts importants');

    try {
      // Récupérer les comparaisons récentes avec des écarts importants
      const comparaisonsProblematiques = await this.prisma.comparaisonEstimationReel.findMany({
        where: {
          dateComparaison: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours
          },
          OR: [
            { ecartMontantPourcentage: { gt: 20 } },
            { ecartMontantPourcentage: { lt: -20 } },
            { ecartDureePourcentage: { gt: 25 } },
            { ecartDureePourcentage: { lt: -25 } },
            { ecartMargePourcentage: { lt: -30 } },
          ],
        },
        include: {
          affaire: {
            select: {
              numero: true,
              libelle: true,
              client: true,
            },
          },
          estimation: {
            select: {
              version: true,
            },
          },
        },
        orderBy: {
          dateComparaison: 'desc',
        },
      });

      if (comparaisonsProblematiques.length > 0) {
        this.logger.warn(`⚠️ ${comparaisonsProblematiques.length} affaires avec des écarts importants détectées`);
        
        // Créer des alertes pour chaque affaire problématique
        for (const comparaison of comparaisonsProblematiques) {
          await this.creerAlerteEcart(comparaison);
        }
      }

      return comparaisonsProblematiques;
    } catch (error) {
      this.logger.error('❌ Erreur lors de la détection des écarts:', error);
      throw error;
    }
  }

  /**
   * Créer une alerte pour un écart important
   */
  private async creerAlerteEcart(comparaison: any) {
    const alerteData = {
      affaireId: comparaison.affaireId,
      type: 'ECART_ESTIMATION_IMPORTANT',
      titre: `Écart important détecté - ${comparaison.affaire.numero}`,
      message: this.genererMessageEcart(comparaison),
      severite: this.determinerSeverite(comparaison),
      metadonnees: {
        comparaisonId: comparaison.id,
        ecarts: {
          montant: comparaison.ecartMontantPourcentage,
          duree: comparaison.ecartDureePourcentage,
          marge: comparaison.ecartMargePourcentage,
        },
      },
    };

    // Ici vous pouvez intégrer avec votre système de notifications
    this.logger.warn(`🚨 ${alerteData.titre}: ${alerteData.message}`);
  }

  /**
   * Générer un message d'alerte basé sur les écarts
   */
  private genererMessageEcart(comparaison: any): string {
    const ecarts = [];

    if (Math.abs(comparaison.ecartMontantPourcentage) > 20) {
      ecarts.push(`Montant: ${comparaison.ecartMontantPourcentage.toFixed(1)}%`);
    }
    if (Math.abs(comparaison.ecartDureePourcentage) > 25) {
      ecarts.push(`Durée: ${comparaison.ecartDureePourcentage.toFixed(1)}%`);
    }
    if (comparaison.ecartMargePourcentage < -30) {
      ecarts.push(`Marge: ${comparaison.ecartMargePourcentage.toFixed(1)}%`);
    }

    return `Écarts détectés sur ${comparaison.affaire.numero} - ${comparaison.affaire.libelle}: ${ecarts.join(', ')}`;
  }

  /**
   * Déterminer la sévérité d'une alerte
   */
  private determinerSeverite(comparaison: any): string {
    if (comparaison.ecartMargePourcentage < -50 || Math.abs(comparaison.ecartMontantPourcentage) > 50) {
      return 'CRITIQUE';
    } else if (comparaison.ecartMargePourcentage < -30 || Math.abs(comparaison.ecartMontantPourcentage) > 30) {
      return 'ELEVEE';
    } else {
      return 'MOYENNE';
    }
  }

  /**
   * Calculer les métriques de performance des estimations
   */
  async calculerMetriquesPerformance() {
    this.logger.log('📊 Calcul des métriques de performance des estimations');

    try {
      // Récupérer toutes les comparaisons des 3 derniers mois
      const comparaisons = await this.prisma.comparaisonEstimationReel.findMany({
        where: {
          dateComparaison: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 jours
          },
          statut: 'TERMINEE',
        },
        include: {
          affaire: {
            select: {
              numero: true,
              libelle: true,
              statut: true,
            },
          },
        },
      });

      if (comparaisons.length === 0) {
        return {
          message: 'Aucune donnée disponible pour le calcul des métriques',
          periode: '90 derniers jours',
          nombreComparaisons: 0,
        };
      }

      // Calculer les métriques
      const metriques = {
        periode: '90 derniers jours',
        nombreComparaisons: comparaisons.length,
        precisionMoyenne: {
          montant: this.calculerPrecisionMoyenne(comparaisons.map(c => c.ecartMontantPourcentage)),
          duree: this.calculerPrecisionMoyenne(comparaisons.map(c => c.ecartDureePourcentage)),
          mainOeuvre: this.calculerPrecisionMoyenne(comparaisons.map(c => c.ecartMainOeuvrePourcentage)),
          achats: this.calculerPrecisionMoyenne(comparaisons.map(c => c.ecartAchatsPourcentage)),
          fraisGeneraux: this.calculerPrecisionMoyenne(comparaisons.map(c => c.ecartFraisGenerauxPourcentage)),
        },
        distribution: {
          excellente: comparaisons.filter(c => Math.abs(c.ecartMontantPourcentage) <= 5).length,
          bonne: comparaisons.filter(c => Math.abs(c.ecartMontantPourcentage) > 5 && Math.abs(c.ecartMontantPourcentage) <= 15).length,
          moyenne: comparaisons.filter(c => Math.abs(c.ecartMontantPourcentage) > 15 && Math.abs(c.ecartMontantPourcentage) <= 30).length,
          faible: comparaisons.filter(c => Math.abs(c.ecartMontantPourcentage) > 30).length,
        },
      };

      this.logger.log(`📊 Métriques calculées: ${metriques.precisionMoyenne.montant}% de précision moyenne sur le montant`);
      return metriques;
    } catch (error) {
      this.logger.error('❌ Erreur lors du calcul des métriques:', error);
      throw error;
    }
  }

  /**
   * Calculer la précision moyenne (inverse de l'écart absolu moyen)
   */
  private calculerPrecisionMoyenne(ecarts: number[]): number {
    if (ecarts.length === 0) return 0;
    
    const ecartAbsoluMoyen = ecarts.reduce((sum, ecart) => sum + Math.abs(ecart), 0) / ecarts.length;
    return Math.max(0, 100 - ecartAbsoluMoyen);
  }

  /**
   * Exporter les données de comparaison pour analyse
   */
  async exporterDonneesComparaison(affaireId?: string, dateDebut?: Date, dateFin?: Date) {
    this.logger.log('📤 Export des données de comparaison');

    try {
      const whereClause: any = {};

      if (affaireId) {
        whereClause.affaireId = affaireId;
      }

      if (dateDebut || dateFin) {
        whereClause.dateComparaison = {};
        if (dateDebut) whereClause.dateComparaison.gte = dateDebut;
        if (dateFin) whereClause.dateComparaison.lte = dateFin;
      }

      const comparaisons = await this.prisma.comparaisonEstimationReel.findMany({
        where: whereClause,
        include: {
          affaire: {
            select: {
              numero: true,
              libelle: true,
              client: true,
              statut: true,
            },
          },
          estimation: {
            select: {
              version: true,
              statut: true,
              montantTotalEstime: true,
              dureeTotaleEstimee: true,
            },
          },
          calculateur: {
            select: {
              nom: true,
              prenom: true,
            },
          },
        },
        orderBy: {
          dateComparaison: 'desc',
        },
      });

      // Formater les données pour l'export
      const donneesExport = comparaisons.map(comparaison => ({
        affaireNumero: comparaison.affaire.numero,
        affaireLibelle: comparaison.affaire.libelle,
        client: comparaison.affaire.client,
        statutAffaire: comparaison.affaire.statut,
        dateComparaison: comparaison.dateComparaison,
        typeComparaison: comparaison.typeComparaison,
        versionEstimation: comparaison.estimation.version,
        
        // Données estimées
        montantEstime: comparaison.estimation.montantTotalEstime,
        dureeEstimee: comparaison.estimation.dureeTotaleEstimee,
        
        // Données réelles
        montantReel: comparaison.montantReelCalcule,
        dureeReelle: comparaison.dureeTotaleReelle,
        
        // Écarts
        ecartMontantPourcentage: comparaison.ecartMontantPourcentage,
        ecartDureePourcentage: comparaison.ecartDureePourcentage,
        ecartMainOeuvrePourcentage: comparaison.ecartMainOeuvrePourcentage,
        ecartAchatsPourcentage: comparaison.ecartAchatsPourcentage,
        ecartFraisGenerauxPourcentage: comparaison.ecartFraisGenerauxPourcentage,
        ecartMargePourcentage: comparaison.ecartMargePourcentage,
        
        // Métadonnées
        calculateur: comparaison.calculateur ? `${comparaison.calculateur.prenom} ${comparaison.calculateur.nom}` : 'SYSTEM',
        commentaire: comparaison.commentaire,
      }));

      this.logger.log(`📤 Export terminé: ${donneesExport.length} comparaisons exportées`);
      return donneesExport;
    } catch (error) {
      this.logger.error('❌ Erreur lors de l\'export:', error);
      throw error;
    }
  }
} 