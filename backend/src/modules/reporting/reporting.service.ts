import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  // Récupérer les données globales pour le dashboard
  async getDashboardData() {
    const [
      totalAffaires,
      affairesEnCours,
      totalBdc,
      montantTotalBdc,
      totalHeuresPointees,
      totalArticles,
      articlesStockFaible,
      utilisateursActifs,
    ] = await Promise.all([
      // Total des affaires
      this.prisma.affaire.count(),
      
      // Affaires en cours
      this.prisma.affaire.count({
        where: { statut: { in: ['PLANIFIEE', 'EN_COURS'] } }
      }),
      
      // Total des BDC
      this.prisma.bdc.count(),
      
      // Montant total des BDC
      this.prisma.bdc.aggregate({
        _sum: { montantHt: true }
      }),
      
      // Total des heures pointées
      this.prisma.pointage.aggregate({
        _sum: { nbHeures: true }
      }),
      
      // Total des articles actifs
      this.prisma.article.count({
        where: { actif: true }
      }),
      
      // Articles avec stock faible (requête raw pour comparer les champs)
      this.prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*) as count
        FROM "articles"
        WHERE "actif" = true AND "stockActuel" <= "stockMinimum"
      `,
      
      // Utilisateurs actifs
      this.prisma.user.count({
        where: { actif: true }
      }),
    ]);

    return {
      kpi: {
        totalAffaires,
        affairesEnCours,
        affairesTerminees: totalAffaires - affairesEnCours,
        totalBdc,
        montantTotalBdc: montantTotalBdc._sum.montantHt || 0,
        totalHeuresPointees: totalHeuresPointees._sum.nbHeures || 0,
        totalArticles,
        articlesStockFaible: articlesStockFaible[0]?.count || 0,
        utilisateursActifs,
      },
      tendances: {
        // TODO: Ajouter les calculs de tendances (croissance mensuelle, etc.)
      }
    };
  }

  // Récupérer les performances des affaires
  async getAffairesPerformance(params: {
    dateDebut?: Date;
    dateFin?: Date;
    statut?: string;
  } = {}) {
    const { dateDebut, dateFin, statut } = params;
    
    const where: any = {};
    
    if (dateDebut || dateFin) {
      where.dateCreation = {};
      if (dateDebut) where.dateCreation.gte = dateDebut;
      if (dateFin) where.dateCreation.lte = dateFin;
    }
    
    if (statut) {
      where.statut = statut;
    }

    const affaires = await this.prisma.affaire.findMany({
      where,
      include: {
        bdc: {
          select: {
            montantHt: true,
            montantFg: true,
          }
        },
        pointages: {
          select: {
            nbHeures: true,
            typeHeure: true,
          }
        },
        _count: {
          select: {
            bdc: true,
            pointages: true,
          }
        }
      },
      orderBy: { dateCreation: 'desc' }
    });

    return affaires.map((affaire: any) => {
      const totalAchats = affaire.bdc.reduce((sum: number, bdc: any) => sum + bdc.montantHt, 0);
      const totalFraisGeneraux = affaire.bdc.reduce((sum: number, bdc: any) => sum + bdc.montantFg, 0);
      const totalHeures = affaire.pointages.reduce((sum: number, pointage: any) => sum + pointage.nbHeures, 0);
      
      const margeRealiseeBrute = affaire.objectifCaHt - totalAchats;
      const margeRealiseeNette = margeRealiseeBrute - totalFraisGeneraux;
      const tauxMarge = affaire.objectifCaHt > 0 ? (margeRealiseeNette / affaire.objectifCaHt) * 100 : 0;
      
      return {
        ...affaire,
        performance: {
          totalAchats,
          totalFraisGeneraux,
          totalHeures,
          margeRealiseeBrute,
          margeRealiseeNette,
          tauxMarge,
          ecartObjectifAchats: affaire.objectifAchatHt - totalAchats,
          ecartObjectifHeures: affaire.objectifHeuresFab - totalHeures,
        }
      };
    });
  }

  // Récupérer les statistiques d'heures
  async getHeuresStats(params: {
    dateDebut?: Date;
    dateFin?: Date;
    affaireId?: string;
  } = {}) {
    const { dateDebut, dateFin, affaireId } = params;
    
    const where: any = {};
    
    if (dateDebut || dateFin) {
      where.datePointage = {};
      if (dateDebut) where.datePointage.gte = dateDebut;
      if (dateFin) where.datePointage.lte = dateFin;
    }
    
    if (affaireId) {
      where.affaireId = affaireId;
    }

    const [
      heuresParType,
      heuresParAffaire,
      heuresParUtilisateur,
      evolutionHeures
    ] = await Promise.all([
      // Heures par type
      this.prisma.pointage.groupBy({
        by: ['typeHeure'],
        where,
        _sum: { nbHeures: true },
        _count: { id: true }
      }),
      
      // Heures par affaire
      this.prisma.pointage.groupBy({
        by: ['affaireId'],
        where,
        _sum: { nbHeures: true },
        _count: { id: true }
      }),
      
      // Heures par utilisateur
      this.prisma.pointage.groupBy({
        by: ['userId'],
        where,
        _sum: { nbHeures: true },
        _count: { id: true }
      }),
      
      // Évolution par jour (30 derniers jours)
      this.prisma.pointage.groupBy({
        by: ['datePointage'],
        where: {
          ...where,
          datePointage: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        _sum: { nbHeures: true }
      })
    ]);

    return {
      heuresParType,
      heuresParAffaire,
      heuresParUtilisateur,
      evolutionHeures: evolutionHeures.sort((a: any, b: any) => 
        new Date(a.datePointage).getTime() - new Date(b.datePointage).getTime()
      )
    };
  }

  // Récupérer l'évolution des achats
  async getAchatsEvolution(params: {
    dateDebut?: Date;
    dateFin?: Date;
    categorieId?: string;
  } = {}) {
    const { dateDebut, dateFin, categorieId } = params;
    
    const where: any = {};
    
    if (dateDebut || dateFin) {
      where.dateBdc = {};
      if (dateDebut) where.dateBdc.gte = dateDebut;
      if (dateFin) where.dateBdc.lte = dateFin;
    }
    
    if (categorieId) {
      where.categorieId = categorieId;
    }

    const [
      achatsParMois,
      achatsParCategorie,
      achatsParFournisseur,
      tendanceAchats
    ] = await Promise.all([
      // Achats par mois
      this.prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "dateBdc") as mois,
          SUM("montantHt") as montant_total,
          COUNT(*) as nombre_bdc
        FROM "bdc" 
        WHERE ("dateBdc" >= ${dateDebut || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)})
        GROUP BY DATE_TRUNC('month', "dateBdc")
        ORDER BY mois
      `,
      
      // Achats par catégorie
      this.prisma.bdc.groupBy({
        by: ['categorieId'],
        where,
        _sum: { montantHt: true },
        _count: { id: true }
      }),
      
      // Achats par fournisseur
      this.prisma.bdc.groupBy({
        by: ['fournisseur'],
        where,
        _sum: { montantHt: true },
        _count: { id: true }
      }),
      
      // Tendance des 7 derniers jours
      this.prisma.bdc.groupBy({
        by: ['dateBdc'],
        where: {
          ...where,
          dateBdc: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        _sum: { montantHt: true }
      })
    ]);

    return {
      achatsParMois,
      achatsParCategorie,
      achatsParFournisseur,
      tendanceAchats: tendanceAchats.sort((a: any, b: any) => 
        new Date(a.dateBdc).getTime() - new Date(b.dateBdc).getTime()
      )
    };
  }

  // Récupérer les marges par affaire
  async getMargesAffaires(params: {
    dateDebut?: Date;
    dateFin?: Date;
    seuilMarge?: number;
  } = {}) {
    const { dateDebut, dateFin, seuilMarge } = params;
    
    const where: any = {};
    
    if (dateDebut || dateFin) {
      where.dateCreation = {};
      if (dateDebut) where.dateCreation.gte = dateDebut;
      if (dateFin) where.dateCreation.lte = dateFin;
    }

    const affaires = await this.prisma.affaire.findMany({
      where,
      include: {
        bdc: true,
        pointages: true,
      }
    });

    const margesCalculees = affaires.map((affaire: any) => {
      const totalAchats = affaire.bdc.reduce((sum: number, bdc: any) => sum + bdc.montantHt, 0);
      const totalFg = affaire.bdc.reduce((sum: number, bdc: any) => sum + bdc.montantFg, 0);
      const totalHeures = affaire.pointages.reduce((sum: number, pointage: any) => sum + pointage.nbHeures, 0);
      
      const margeRealiseeBrute = affaire.objectifCaHt - totalAchats;
      const margeRealiseeNette = margeRealiseeBrute - totalFg;
      const tauxMarge = affaire.objectifCaHt > 0 ? (margeRealiseeNette / affaire.objectifCaHt) * 100 : 0;
      
      return {
        affaireId: affaire.id,
        numero: affaire.numero,
        libelle: affaire.libelle,
        client: affaire.client,
        objectifCaHt: affaire.objectifCaHt,
        objectifAchatHt: affaire.objectifAchatHt,
        totalAchats,
        totalFg,
        totalHeures,
        margeRealiseeBrute,
        margeRealiseeNette,
        tauxMarge,
        statut: affaire.statut,
        alerteMarge: seuilMarge ? tauxMarge < seuilMarge : false
      };
    });

    return {
      marges: margesCalculees,
      resumeMarges: {
        margeMinimale: Math.min(...margesCalculees.map((m: any) => m.tauxMarge)),
        margeMaximale: Math.max(...margesCalculees.map((m: any) => m.tauxMarge)),
        margeMoyenne: margesCalculees.reduce((sum: number, m: any) => sum + m.tauxMarge, 0) / margesCalculees.length,
        nombreAffairesPositives: margesCalculees.filter((m: any) => m.tauxMarge > 0).length,
        nombreAffairesNegatives: margesCalculees.filter((m: any) => m.tauxMarge < 0).length,
      }
    };
  }

  // Récupérer les statistiques d'inventaire
  async getInventaireStats(params: {
    dateDebut?: Date;
    dateFin?: Date;
  } = {}) {
    const { dateDebut, dateFin } = params;
    
    const whereMovements: any = {};
    
    if (dateDebut || dateFin) {
      whereMovements.createdAt = {};
      if (dateDebut) whereMovements.createdAt.gte = dateDebut;
      if (dateFin) whereMovements.createdAt.lte = dateFin;
    }

    const [
      articlesStats,
      mouvementsParType,
      valeurStock,
      alertesStock
    ] = await Promise.all([
      // Stats articles
      this.prisma.article.aggregate({
        where: { actif: true },
        _count: { id: true },
        _sum: { stockActuel: true, prixUnitaire: true }
      }),
      
      // Mouvements par type
      this.prisma.mouvementStock.groupBy({
        by: ['type'],
        where: whereMovements,
        _sum: { quantite: true },
        _count: { id: true }
      }),
      
      // Valeur du stock
      this.prisma.$queryRaw<{ valeur_totale: number }[]>`
        SELECT SUM("stockActuel" * "prixUnitaire") as valeur_totale
        FROM "articles"
        WHERE "actif" = true
      `,
      
      // Articles en alerte de stock
      this.prisma.$queryRaw<{
        id: string;
        code: string;
        designation: string;
        stockActuel: number;
        stockMinimum: number;
      }[]>`
        SELECT id, code, designation, "stockActuel", "stockMinimum"
        FROM "articles"
        WHERE "actif" = true AND "stockActuel" <= "stockMinimum"
      `
    ]);

    return {
      articlesStats,
      mouvementsParType,
      valeurStock: valeurStock[0]?.valeur_totale || 0,
      alertesStock
    };
  }
} 