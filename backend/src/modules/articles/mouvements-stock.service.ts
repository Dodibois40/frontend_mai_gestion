import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMouvementStockDto } from './dto/create-mouvement-stock.dto';

@Injectable()
export class MouvementsStockService {
  constructor(private prisma: PrismaService) {}

  // Créer un nouveau mouvement de stock
  async create(createMouvementStockDto: CreateMouvementStockDto, userId: string) {
    const { articleId, type, quantite, ...rest } = createMouvementStockDto;

    // Vérifier que l'article existe
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException(`Article avec l'ID ${articleId} non trouvé`);
    }

    // Calculer le nouveau stock
    let nouveauStock = article.stockActuel;
    if (type === 'ENTREE' || type === 'AJUSTEMENT') {
      nouveauStock += quantite;
    } else if (type === 'SORTIE') {
      nouveauStock -= quantite;
      if (nouveauStock < 0) {
        throw new BadRequestException('Stock insuffisant pour cette sortie');
      }
    } else if (type === 'INVENTAIRE') {
      nouveauStock = quantite; // Pour l'inventaire, on remplace le stock
    }

    // Créer le mouvement et mettre à jour le stock dans une transaction
    return this.prisma.$transaction(async (prisma) => {
      const mouvement = await prisma.mouvementStock.create({
        data: {
          ...rest,
          type,
          quantite,
          articleId,
          userId,
        },
        include: {
          article: {
            select: { code: true, designation: true },
          },
          user: {
            select: { nom: true, prenom: true },
          },
        },
      });

      await prisma.article.update({
        where: { id: articleId },
        data: { stockActuel: nouveauStock },
      });

      return mouvement;
    });
  }

  // Récupérer tous les mouvements avec filtres et pagination
  async findAll(params: {
    skip?: number;
    take?: number;
    articleId?: string;
    userId?: string;
    type?: string;
    dateDebut?: Date;
    dateFin?: Date;
  } = {}) {
    const { skip = 0, take = 50, articleId, userId, type, dateDebut, dateFin } = params;

    const where: any = {};

    if (articleId) {
      where.articleId = articleId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (type) {
      where.type = type;
    }

    if (dateDebut || dateFin) {
      where.createdAt = {};
      if (dateDebut) {
        where.createdAt.gte = dateDebut;
      }
      if (dateFin) {
        where.createdAt.lte = dateFin;
      }
    }

    const [mouvements, total] = await Promise.all([
      this.prisma.mouvementStock.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          article: {
            select: { code: true, designation: true, unite: true },
          },
          user: {
            select: { nom: true, prenom: true },
          },
        },
      }),
      this.prisma.mouvementStock.count({ where }),
    ]);

    return { mouvements, total };
  }

  // Récupérer un mouvement par son ID
  async findOne(id: string) {
    const mouvement = await this.prisma.mouvementStock.findUnique({
      where: { id },
      include: {
        article: {
          select: { code: true, designation: true, unite: true, stockActuel: true },
        },
        user: {
          select: { nom: true, prenom: true },
        },
      },
    });

    if (!mouvement) {
      throw new NotFoundException(`Mouvement avec l'ID ${id} non trouvé`);
    }

    return mouvement;
  }

  // Récupérer l'historique des mouvements d'un article
  async getHistoriqueArticle(articleId: string, params: { skip?: number; take?: number } = {}) {
    const { skip = 0, take = 50 } = params;

    // Vérifier que l'article existe
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException(`Article avec l'ID ${articleId} non trouvé`);
    }

    const [mouvements, total] = await Promise.all([
      this.prisma.mouvementStock.findMany({
        where: { articleId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { nom: true, prenom: true },
          },
        },
      }),
      this.prisma.mouvementStock.count({ where: { articleId } }),
    ]);

    return { mouvements, total, article };
  }

  // Récupérer les statistiques des mouvements
  async getStats(params: { dateDebut?: Date; dateFin?: Date } = {}) {
    const { dateDebut, dateFin } = params;

    const where: any = {};
    if (dateDebut || dateFin) {
      where.createdAt = {};
      if (dateDebut) {
        where.createdAt.gte = dateDebut;
      }
      if (dateFin) {
        where.createdAt.lte = dateFin;
      }
    }

    const [
      totalMouvements,
      mouvementsParType,
      valeurTotaleMouvements,
    ] = await Promise.all([
      this.prisma.mouvementStock.count({ where }),
      this.prisma.mouvementStock.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
        _sum: { quantite: true },
      }),
      this.prisma.mouvementStock.aggregate({
        where: {
          ...where,
          prixUnitaire: { not: null },
        },
        _sum: {
          quantite: true,
        },
      }),
    ]);

    return {
      totalMouvements,
      mouvementsParType,
      valeurTotaleMouvements: valeurTotaleMouvements._sum.quantite || 0,
    };
  }
} 