import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CategorieAchat } from '@prisma/client';

@Injectable()
export class CategoriesAchatService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<CategorieAchat[]> {
    return this.prisma.categorieAchat.findMany({
      orderBy: { intitule: 'asc' }, // Correction: trier par intitule
    });
  }

  // On pourrait ajouter ici d'autres méthodes si nécessaire (findById, create, update, delete)
  // Pour l'instant, findAll est suffisant pour le formulaire BDC.
} 