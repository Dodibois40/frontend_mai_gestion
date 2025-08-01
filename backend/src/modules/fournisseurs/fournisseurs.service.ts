import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';
import { Fournisseur, Prisma } from '@prisma/client';

@Injectable()
export class FournisseursService {
  constructor(private prisma: PrismaService) {}

  // Créer un nouveau fournisseur
  async create(createFournisseurDto: CreateFournisseurDto): Promise<Fournisseur> {
    try {
      return await this.prisma.fournisseur.create({
        data: createFournisseurDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Un fournisseur avec ce nom existe déjà');
        }
      }
      throw error;
    }
  }

  // Récupérer tous les fournisseurs avec pagination et filtres
  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    actif?: boolean,
    enCompte?: boolean,
    categorie?: string,
  ): Promise<{ fournisseurs: Fournisseur[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    const where: Prisma.FournisseurWhereInput = {};
    
    if (search) {
      where.OR = [
        { nom: { contains: search } },
        { contact: { contains: search } },
        { email: { contains: search } },
      ];
    }
    
    if (actif !== undefined) {
      where.actif = actif;
    }
    
    if (enCompte !== undefined) {
      where.enCompte = enCompte;
    }
    
    if (categorie) {
      where.categorie = categorie as any;
    }

    const [fournisseurs, total] = await Promise.all([
      this.prisma.fournisseur.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nom: 'asc' },
      }),
      this.prisma.fournisseur.count({ where }),
    ]);

    return {
      fournisseurs,
      total,
      page,
      limit,
    };
  }

  // Récupérer tous les fournisseurs actifs (pour les listes déroulantes)
  async findAllActive(): Promise<Fournisseur[]> {
    return this.prisma.fournisseur.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' },
    });
  }

  // Récupérer un fournisseur par ID
  async findOne(id: string): Promise<Fournisseur> {
    const fournisseur = await this.prisma.fournisseur.findUnique({
      where: { id },
    });

    if (!fournisseur) {
      throw new NotFoundException(`Fournisseur avec l'ID ${id} non trouvé`);
    }

    return fournisseur;
  }

  // Récupérer un fournisseur par nom
  async findByNom(nom: string): Promise<Fournisseur | null> {
    return this.prisma.fournisseur.findUnique({
      where: { nom },
    });
  }

  // Mettre à jour un fournisseur
  async update(id: string, updateFournisseurDto: UpdateFournisseurDto): Promise<Fournisseur> {
    const fournisseur = await this.findOne(id);

    try {
      return await this.prisma.fournisseur.update({
        where: { id },
        data: updateFournisseurDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Un fournisseur avec ce nom existe déjà');
        }
      }
      throw error;
    }
  }

  // Supprimer un fournisseur (soft delete)
  async remove(id: string): Promise<Fournisseur> {
    const fournisseur = await this.findOne(id);

    return this.prisma.fournisseur.update({
      where: { id },
      data: { actif: false },
    });
  }

  // Supprimer définitivement un fournisseur (hard delete)
  async delete(id: string): Promise<void> {
    const fournisseur = await this.findOne(id);

    await this.prisma.fournisseur.delete({
      where: { id },
    });
  }

  // Réactiver un fournisseur
  async reactivate(id: string): Promise<Fournisseur> {
    const fournisseur = await this.findOne(id);

    return this.prisma.fournisseur.update({
      where: { id },
      data: { actif: true },
    });
  }

  // Statistiques des fournisseurs
  async getStats(): Promise<{
    total: number;
    actifs: number;
    inactifs: number;
    enCompte: number;
  }> {
    const [total, actifs, enCompte] = await Promise.all([
      this.prisma.fournisseur.count(),
      this.prisma.fournisseur.count({ where: { actif: true } }),
      this.prisma.fournisseur.count({ where: { enCompte: true } }),
    ]);

    return {
      total,
      actifs,
      inactifs: total - actifs,
      enCompte,
    };
  }
} 