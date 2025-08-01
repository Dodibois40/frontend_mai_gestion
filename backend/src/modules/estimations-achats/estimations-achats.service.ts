import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EstimationAchats, Prisma } from '@prisma/client';

@Injectable()
export class EstimationsAchatsService {
  constructor(private prisma: PrismaService) {}

  // Créer ou mettre à jour une estimation d'achats
  async sauvegarderEstimation(affaireId: string, estimationData: {
    categoriesActives: any[];
    pourcentageBudgetAchats: number;
    montantEstimationAchats: number;
    totalPourcentage: number;
  }): Promise<EstimationAchats> {
    // Vérifier que l'affaire existe
    const affaire = await this.prisma.affaire.findUnique({
      where: { id: affaireId },
    });

    if (!affaire) {
      throw new NotFoundException(`Affaire avec ID ${affaireId} non trouvée`);
    }

    // Créer ou mettre à jour l'estimation
    const estimation = await this.prisma.estimationAchats.upsert({
      where: { affaireId },
      update: {
        pourcentageBudgetAchats: estimationData.pourcentageBudgetAchats,
        montantEstimationAchats: estimationData.montantEstimationAchats,
        totalPourcentage: estimationData.totalPourcentage,
        categoriesActives: estimationData.categoriesActives,
        dateModification: new Date(),
      },
      create: {
        affaireId,
        pourcentageBudgetAchats: estimationData.pourcentageBudgetAchats,
        montantEstimationAchats: estimationData.montantEstimationAchats,
        totalPourcentage: estimationData.totalPourcentage,
        categoriesActives: estimationData.categoriesActives,
      },
      include: {
        affaire: {
          select: {
            id: true,
            numero: true,
            libelle: true,
            client: true,
          },
        },
      },
    });

    return estimation;
  }

  // Récupérer une estimation d'achats par affaire
  async getEstimationParAffaire(affaireId: string): Promise<EstimationAchats | null> {
    const estimation = await this.prisma.estimationAchats.findUnique({
      where: { affaireId },
      include: {
        affaire: {
          select: {
            id: true,
            numero: true,
            libelle: true,
            client: true,
          },
        },
      },
    });

    return estimation;
  }

  // Récupérer toutes les estimations pour le dashboard
  async getEstimationsPourDashboard(params: {
    affaireId?: string;
    dateDebut?: Date;
    dateFin?: Date;
  } = {}): Promise<{
    estimations: EstimationAchats[];
    statistiques: {
      totalEstimations: number;
      budgetTotalEstime: number;
      pourcentageMoyenRepartition: number;
      estimationsCompletes: number;
    };
  }> {
    const where: Prisma.EstimationAchatsWhereInput = {};

    if (params.affaireId) {
      where.affaireId = params.affaireId;
    }

    if (params.dateDebut || params.dateFin) {
      where.dateCreation = {};
      if (params.dateDebut) {
        where.dateCreation.gte = params.dateDebut;
      }
      if (params.dateFin) {
        where.dateCreation.lte = params.dateFin;
      }
    }

    const estimations = await this.prisma.estimationAchats.findMany({
      where,
      include: {
        affaire: {
          select: {
            id: true,
            numero: true,
            libelle: true,
            client: true,
            statut: true,
          },
        },
      },
      orderBy: { dateModification: 'desc' },
    });

    // Calculer les statistiques
    const totalEstimations = estimations.length;
    const budgetTotalEstime = estimations.reduce(
      (sum, est) => sum + est.montantEstimationAchats,
      0
    );
    const pourcentageMoyenRepartition = totalEstimations > 0
      ? estimations.reduce((sum, est) => sum + est.totalPourcentage, 0) / totalEstimations
      : 0;
    const estimationsCompletes = estimations.filter(
      (est) => est.totalPourcentage === 100
    ).length;

    return {
      estimations,
      statistiques: {
        totalEstimations,
        budgetTotalEstime,
        pourcentageMoyenRepartition,
        estimationsCompletes,
      },
    };
  }

  // Supprimer une estimation d'achats
  async supprimerEstimation(affaireId: string): Promise<void> {
    const estimation = await this.prisma.estimationAchats.findUnique({
      where: { affaireId },
    });

    if (!estimation) {
      throw new NotFoundException(`Estimation pour l'affaire ${affaireId} non trouvée`);
    }

    await this.prisma.estimationAchats.delete({
      where: { affaireId },
    });
  }

  // Récupérer les statistiques globales des estimations
  async getStatistiquesGlobales(): Promise<{
    totalAffairesAvecEstimation: number;
    budgetTotalEstime: number;
    repartitionParStatutAffaire: Array<{
      statut: string;
      count: number;
      budgetTotal: number;
    }>;
    categoriesLesPlusUtilisees: Array<{
      nom: string;
      utilisations: number;
      pourcentageMoyen: number;
    }>;
  }> {
    const estimations = await this.prisma.estimationAchats.findMany({
      include: {
        affaire: {
          select: {
            statut: true,
          },
        },
      },
    });

    const totalAffairesAvecEstimation = estimations.length;
    const budgetTotalEstime = estimations.reduce(
      (sum, est) => sum + est.montantEstimationAchats,
      0
    );

    // Répartition par statut d'affaire
    const repartitionParStatut = estimations.reduce((acc, est) => {
      const statut = est.affaire.statut;
      if (!acc[statut]) {
        acc[statut] = { count: 0, budgetTotal: 0 };
      }
      acc[statut].count++;
      acc[statut].budgetTotal += est.montantEstimationAchats;
      return acc;
    }, {} as Record<string, { count: number; budgetTotal: number }>);

    const repartitionParStatutAffaire = Object.entries(repartitionParStatut).map(
      ([statut, data]) => ({
        statut,
        count: data.count,
        budgetTotal: data.budgetTotal,
      })
    );

    // Catégories les plus utilisées
    const categoriesUtilisation = new Map<string, { utilisations: number; totalPourcentage: number }>();

    estimations.forEach((est) => {
      const categories = est.categoriesActives as any[];
      categories.forEach((cat) => {
        const nom = cat.nom;
        if (!categoriesUtilisation.has(nom)) {
          categoriesUtilisation.set(nom, { utilisations: 0, totalPourcentage: 0 });
        }
        const current = categoriesUtilisation.get(nom)!;
        current.utilisations++;
        current.totalPourcentage += cat.pourcentage;
      });
    });

    const categoriesLesPlusUtilisees = Array.from(categoriesUtilisation.entries())
      .map(([nom, data]) => ({
        nom,
        utilisations: data.utilisations,
        pourcentageMoyen: data.totalPourcentage / data.utilisations,
      }))
      .sort((a, b) => b.utilisations - a.utilisations)
      .slice(0, 10); // Top 10

    return {
      totalAffairesAvecEstimation,
      budgetTotalEstime,
      repartitionParStatutAffaire,
      categoriesLesPlusUtilisees,
    };
  }
} 