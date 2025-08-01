import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAmeliorationDto } from './dto/create-amelioration.dto';
import { UpdateAmeliorationDto } from './dto/update-amelioration.dto';

@Injectable()
export class AmeliorationsService {
  constructor(private prisma: PrismaService) {}

  // Créer une nouvelle amélioration
  async create(createAmeliorationDto: CreateAmeliorationDto, createurId: string) {
    return this.prisma.amelioration.create({
      data: {
        ...createAmeliorationDto,
        createurId,
      },
      include: {
        createur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });
  }

  // Récupérer toutes les améliorations avec filtres
  async findAll(
    type?: string,
    statut?: string,
    search?: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (type && type !== 'ALL') {
      where.type = type;
    }
    
    if (statut && statut !== 'ALL') {
      where.statut = statut;
    }
    
    if (search) {
      where.OR = [
        { titre: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [ameliorations, total] = await Promise.all([
      this.prisma.amelioration.findMany({
        where,
        include: {
          createur: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.amelioration.count({ where }),
    ]);

    return {
      ameliorations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Récupérer une amélioration par ID
  async findOne(id: string) {
    const amelioration = await this.prisma.amelioration.findUnique({
      where: { id },
      include: {
        createur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });

    if (!amelioration) {
      throw new NotFoundException('Amélioration non trouvée');
    }

    return amelioration;
  }

  // Mettre à jour une amélioration
  async update(id: string, updateAmeliorationDto: UpdateAmeliorationDto) {
    const existingAmelioration = await this.findOne(id);
    
    return this.prisma.amelioration.update({
      where: { id },
      data: updateAmeliorationDto,
      include: {
        createur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });
  }

  // Supprimer une amélioration
  async remove(id: string) {
    const existingAmelioration = await this.findOne(id);
    
    return this.prisma.amelioration.delete({
      where: { id },
    });
  }

  // Récupérer les statistiques simples
  async getStats() {
    const [total, bugs, ameliorations, nouveau, enCours, termine] = await Promise.all([
      this.prisma.amelioration.count(),
      this.prisma.amelioration.count({ where: { type: 'BUG' } }),
      this.prisma.amelioration.count({ where: { type: 'AMELIORATION' } }),
      this.prisma.amelioration.count({ where: { statut: 'NOUVEAU' } }),
      this.prisma.amelioration.count({ where: { statut: 'EN_COURS' } }),
      this.prisma.amelioration.count({ where: { statut: 'TERMINE' } }),
    ]);

    return {
      total,
      parType: {
        bugs,
        ameliorations,
      },
      parStatut: {
        nouveau,
        enCours,
        termine,
      },
    };
  }
}