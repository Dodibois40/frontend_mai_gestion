import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Achat, StatutAchat, Prisma } from '@prisma/client';

@Injectable()
export class AchatsService {
  constructor(private prisma: PrismaService) {}

  // Créer un nouvel achat
  async create(data: {
    montantHt: number;
    montantTtc: number;
    dateFacture: Date;
    affaireId: string;
    categorieId: string;
    fournisseur: string;
    bdcId?: string;
    commentaire?: string;
  }): Promise<Achat> {
    // Générer le numéro automatique interne
    const numero = await this.generateNumero();
    
    // Générer le numéro de facture automatique
    const numeroFacture = await this.generateNumeroFacture();
    
    // Calculer les frais généraux
    const categorie = await this.prisma.categorieAchat.findUnique({
      where: { id: data.categorieId },
    });
    
    const montantFg = data.montantHt * (categorie?.pourcentageFg || 0) / 100;

    return this.prisma.achat.create({
      data: {
        numero,
        numeroFacture,
        montantHt: data.montantHt,
        montantTtc: data.montantTtc,
        dateFacture: data.dateFacture,
        affaireId: data.affaireId,
        categorieId: data.categorieId,
        fournisseur: data.fournisseur,
        bdcId: data.bdcId,
        commentaire: data.commentaire,
        montantFg,
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
        categorie: true,
        bdc: true,
      },
    });
  }

  // Générer un numéro automatique
  private async generateNumero(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `ACH-${currentYear}-`;
    
    // Trouver le dernier numéro de l'année
    const lastAchat = await this.prisma.achat.findFirst({
      where: {
        numero: {
          startsWith: prefix,
        },
      },
      orderBy: {
        numero: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastAchat) {
      const lastNumber = parseInt(lastAchat.numero.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  // Générer un numéro de facture automatique au format "FACT-YYYY-XXX"
  private async generateNumeroFacture(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `FACT-${currentYear}-`;
    
    // Trouver le dernier numéro de facture de l'année
    const lastAchat = await this.prisma.achat.findFirst({
      where: {
        numeroFacture: {
          startsWith: prefix,
        },
      },
      orderBy: {
        numeroFacture: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastAchat) {
      const lastNumber = parseInt(lastAchat.numeroFacture.split('-')[2]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  // Récupérer tous les achats avec pagination
  async findAll(
    affaireId?: string,
    statut?: StatutAchat,
    skip = 0,
    take = 10,
  ): Promise<{ achats: Achat[]; total: number }> {
    const where: Prisma.AchatWhereInput = {};

    if (affaireId) {
      where.affaireId = affaireId;
    }

    if (statut) {
      where.statut = statut;
    }

    const [achats, total] = await Promise.all([
      this.prisma.achat.findMany({
        where,
        skip,
        take,
        orderBy: { dateFacture: 'desc' },
        include: {
          affaire: {
            select: {
              id: true,
              numero: true,
              libelle: true,
              client: true,
            },
          },
          categorie: true,
          bdc: true,
        },
      }),
      this.prisma.achat.count({ where }),
    ]);

    return { achats, total };
  }

  // Récupérer un achat par ID
  async findOne(id: string): Promise<Achat> {
    const achat = await this.prisma.achat.findUnique({
      where: { id },
      include: {
        affaire: {
          select: {
            id: true,
            numero: true,
            libelle: true,
            client: true,
          },
        },
        categorie: true,
        bdc: true,
      },
    });

    if (!achat) {
      throw new NotFoundException(`Achat avec ID ${id} non trouvé`);
    }

    return achat;
  }

  // Mettre à jour un achat
  async update(id: string, updateData: Partial<{
    numeroFacture: string;
    montantHt: number;
    montantTtc: number;
    dateFacture: Date;
    datePaiement: Date;
    statut: StatutAchat;
    commentaire: string;
    categorieId: string;
    fournisseur: string;
    // Champs pour l'upload PDF Firebase
    dateUpload: Date;
    fichierPdf: string;
    nomFichier: string;
    tailleFichier: number;
    firebaseDownloadUrl: string;
    firebaseStoragePath: string;
  }>): Promise<Achat> {
    const achat = await this.prisma.achat.findUnique({
      where: { id },
    });

    if (!achat) {
      throw new NotFoundException(`Achat avec ID ${id} non trouvé`);
    }

    // Recalculer les frais généraux si la catégorie ou le montant change
    let montantFg = achat.montantFg;
    if (updateData.categorieId || updateData.montantHt) {
      const categorieId = updateData.categorieId || achat.categorieId;
      const montantHt = updateData.montantHt || achat.montantHt;
      
      const categorie = await this.prisma.categorieAchat.findUnique({
        where: { id: categorieId },
      });
      
      montantFg = montantHt * (categorie?.pourcentageFg || 0) / 100;
    }

    return this.prisma.achat.update({
      where: { id },
      data: {
        ...updateData,
        montantFg,
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
        categorie: true,
        bdc: true,
      },
    });
  }

  // Valider un achat (changer le statut vers VALIDE)
  async valider(id: string): Promise<Achat> {
    return this.update(id, { statut: 'VALIDE' });
  }

  // Marquer un achat comme payé
  async payer(id: string, datePaiement: Date): Promise<Achat> {
    return this.update(id, { 
      statut: 'PAYE',
      datePaiement 
    });
  }

  // Supprimer un achat
  async remove(id: string): Promise<void> {
    const achat = await this.prisma.achat.findUnique({
      where: { id },
    });

    if (!achat) {
      throw new NotFoundException(`Achat avec ID ${id} non trouvé`);
    }

    await this.prisma.achat.delete({
      where: { id },
    });
  }

  // Obtenir les statistiques d'achats par affaire
  async getStatsByAffaire(affaireId: string) {
    // Vérifier que l'affaire existe
    const affaire = await this.prisma.affaire.findUnique({
      where: { id: affaireId },
    });

    if (!affaire) {
      throw new NotFoundException(`Affaire avec ID ${affaireId} non trouvée`);
    }

    // Récupérer les statistiques d'achat par catégorie
    const statsByCategorie = await this.prisma.achat.groupBy({
      by: ['categorieId'],
      where: {
        affaireId,
      },
      _sum: {
        montantHt: true,
        montantFg: true,
      },
      orderBy: {
        _sum: {
          montantHt: 'desc',
        },
      },
    });

    // Enrichir avec les informations de catégorie
    const statsWithCategories = await Promise.all(
      statsByCategorie.map(async (stat) => {
        const categorie = await this.prisma.categorieAchat.findUnique({
          where: { id: stat.categorieId },
        });

        return {
          categorieId: stat.categorieId,
          categorie: categorie ? {
            code: categorie.code,
            intitule: categorie.intitule,
            pourcentageFg: categorie.pourcentageFg,
          } : null,
          totalMontantHt: stat._sum.montantHt || 0,
          totalMontantFg: stat._sum.montantFg || 0,
        };
      })
    );

    // Récupérer aussi la liste complète des achats
    const achats = await this.prisma.achat.findMany({
      where: { affaireId },
      orderBy: { dateFacture: 'desc' },
      include: {
        categorie: true,
        bdc: {
          select: {
            id: true,
            numero: true,
            statut: true,
          },
        },
      },
    });

    return {
      statistiques: statsWithCategories,
      achats,
      totalMontantHt: statsWithCategories.reduce((sum, stat) => sum + stat.totalMontantHt, 0),
      totalMontantFg: statsWithCategories.reduce((sum, stat) => sum + stat.totalMontantFg, 0),
    };
  }
} 