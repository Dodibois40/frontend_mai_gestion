import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  // Créer un nouvel article
  async create(createArticleDto: CreateArticleDto) {
    try {
      return await this.prisma.article.create({
        data: createArticleDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Un article avec le code "${createArticleDto.code}" existe déjà`);
      }
      throw error;
    }
  }

  // Récupérer tous les articles avec filtres et pagination
  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
    actif?: boolean;
    stockFaible?: boolean;
  } = {}) {
    const { skip = 0, take = 50, search, actif, stockFaible } = params;

    const where: any = {};

    if (actif !== undefined) {
      where.actif = actif;
    }

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { designation: { contains: search } },
        { fournisseur: { contains: search } },
      ];
    }

    if (stockFaible) {
      where.stockActuel = { lte: { stockMinimum: true } };
    }

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take,
        orderBy: { designation: 'asc' },
        include: {
          _count: {
            select: { mouvements: true },
          },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return { articles, total };
  }

  // Récupérer un article par son ID
  async findOne(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        mouvements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { nom: true, prenom: true },
            },
          },
        },
        _count: {
          select: { mouvements: true },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article avec l'ID ${id} non trouvé`);
    }

    return article;
  }

  // Mettre à jour un article
  async update(id: string, updateArticleDto: UpdateArticleDto) {
    const article = await this.findOne(id);

    try {
      return await this.prisma.article.update({
        where: { id },
        data: updateArticleDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Un article avec le code "${updateArticleDto.code}" existe déjà`);
      }
      throw error;
    }
  }

  // Supprimer un article (soft delete)
  async remove(id: string) {
    const article = await this.findOne(id);

    return this.prisma.article.update({
      where: { id },
      data: { actif: false },
    });
  }

  // Récupérer les articles avec stock faible
  async getArticlesStockFaible() {
    return this.prisma.article.findMany({
      where: {
        actif: true,
        stockActuel: {
          lte: this.prisma.article.fields.stockMinimum,
        },
      },
      orderBy: { designation: 'asc' },
    });
  }

  // Récupérer les statistiques des articles
  async getStats() {
    const [
      totalArticles,
      articlesActifs,
      articlesStockFaible,
      valeurTotaleStock,
    ] = await Promise.all([
      this.prisma.article.count(),
      this.prisma.article.count({ where: { actif: true } }),
      this.prisma.article.count({
        where: {
          actif: true,
          stockActuel: {
            lte: this.prisma.article.fields.stockMinimum,
          },
        },
      }),
      this.prisma.article.aggregate({
        where: { actif: true },
        _sum: {
          stockActuel: true,
        },
      }),
    ]);

    return {
      totalArticles,
      articlesActifs,
      articlesInactifs: totalArticles - articlesActifs,
      articlesStockFaible,
      valeurTotaleStock: valeurTotaleStock._sum.stockActuel || 0,
    };
  }
} 