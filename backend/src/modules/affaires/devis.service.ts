import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDevisDto } from './dto/create-devis.dto';
import { UpdateDevisDto } from './dto/update-devis.dto';
import { Devis, Prisma, StatutDevis } from '@prisma/client';
import { UploadService } from '../../common/services/upload.service';

@Injectable()
export class DevisService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async create(createDevisDto: CreateDevisDto): Promise<Devis> {
    try {
      // Générer automatiquement le numéro si non fourni
      const numero = createDevisDto.numero || await this.generateNumeroDevis();
      
      return await this.prisma.devis.create({
        data: {
          ...createDevisDto,
          numero,
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`Un devis avec le numéro ${createDevisDto.numero || 'généré'} existe déjà`);
        }
      }
      throw error;
    }
  }

  // Méthode pour générer automatiquement un numéro de devis
  private async generateNumeroDevis(): Promise<string> {
    const currentYear = new Date().getFullYear().toString().slice(-2); // 2024 -> 24
    const prefix = `DEV-${currentYear}`;
    
    // Trouver le dernier numéro pour cette année
    const lastDevis = await this.prisma.devis.findFirst({
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
    if (lastDevis) {
      // Extraire le numéro séquentiel du dernier numéro (ex: DEV-24-003 -> 3)
      const lastNumParts = lastDevis.numero.split('-');
      if (lastNumParts.length === 3) {
        const lastSeq = parseInt(lastNumParts[2], 10);
        if (!isNaN(lastSeq)) {
          nextNumber = lastSeq + 1;
        }
      }
    }

    // Formater avec des zéros en tête (ex: 001, 002, etc.)
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    
    return `${prefix}-${formattedNumber}`;
  }

  async findAll(
    affaireId?: string,
    statut?: StatutDevis,
    skip = 0,
    take = 10,
  ): Promise<{ devis: Devis[]; total: number }> {
    const where: Prisma.DevisWhereInput = {};

    if (affaireId) {
      where.affaireId = affaireId;
    }

    if (statut) {
      where.statut = statut;
    }

    const [devis, total] = await Promise.all([
      this.prisma.devis.findMany({
        where,
        skip,
        take,
        orderBy: { dateCreation: 'desc' },
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
      }),
      this.prisma.devis.count({ where }),
    ]);

    return { devis, total };
  }

  async findOne(id: string): Promise<Devis> {
    const devis = await this.prisma.devis.findUnique({
      where: { id },
      include: {
        affaire: {
          select: {
            id: true,
            numero: true,
            libelle: true,
            client: true,
            adresse: true,
          },
        },
      },
    });

    if (!devis) {
      throw new NotFoundException(`Devis avec ID ${id} non trouvé`);
    }

    return devis;
  }

  async update(id: string, updateDevisDto: UpdateDevisDto): Promise<Devis> {
    try {
      // Vérifier que le devis existe
      const existingDevis = await this.prisma.devis.findUnique({
        where: { id },
      });

      if (!existingDevis) {
        throw new NotFoundException(`Devis avec ID ${id} non trouvé`);
      }

      return await this.prisma.devis.update({
        where: { id },
        data: updateDevisDto,
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`Un devis avec le numéro ${updateDevisDto.numero} existe déjà`);
        }
      }
      throw error;
    }
  }

  async updateStatut(id: string, statut: StatutDevis): Promise<Devis> {
    const devis = await this.prisma.devis.findUnique({
      where: { id },
      include: { affaire: true },
    });

    if (!devis) {
      throw new NotFoundException(`Devis avec ID ${id} non trouvé`);
    }

    // Mettre à jour le statut du devis
    const updatedDevis = await this.prisma.devis.update({
      where: { id },
      data: { statut },
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

    // Recalculer l'avancement de l'affaire à chaque changement de statut
    // car cela peut affecter le calcul (VALIDE <-> REALISE, ou suppression d'un devis validé)
    await this.recalculateAvancement(devis.affaireId);

    return updatedDevis;
  }

  // Recalculer l'avancement d'une affaire basé sur les devis réalisés
  private async recalculateAvancement(affaireId: string): Promise<void> {
    // Récupérer tous les devis de l'affaire
    const devis = await this.prisma.devis.findMany({
      where: { affaireId },
    });

    // Calculer le montant total des devis validés + réalisés
    const montantTotalDevis = devis
      .filter(d => d.statut === 'VALIDE' || d.statut === 'REALISE')
      .reduce((sum, d) => sum + d.montantHt, 0);

    // Calculer le montant des devis réalisés
    const montantRealise = devis
      .filter(d => d.statut === 'REALISE')
      .reduce((sum, d) => sum + d.montantHt, 0);

    // Calculer le pourcentage d'avancement
    const avancementPourcentage = montantTotalDevis > 0 
      ? Math.round((montantRealise / montantTotalDevis) * 100)
      : 0;

    // Mettre à jour l'affaire
    await this.prisma.affaire.update({
      where: { id: affaireId },
      data: { avancementPourcentage },
    });
  }

  async remove(id: string): Promise<Devis> {
    const devis = await this.prisma.devis.findUnique({
      where: { id },
    });

    if (!devis) {
      throw new NotFoundException(`Devis avec ID ${id} non trouvé`);
    }

    return this.prisma.devis.delete({
      where: { id },
    });
  }

  // Obtenir les statistiques des devis
  async getStats(): Promise<{
    total: number;
    enAttenteValidation: number;
    valides: number;
    realises: number;
    refuses: number;
    expires: number;
    montantTotal: number;
    montantRealise: number;
  }> {
    const [
      total,
      enAttenteValidation,
      valides,
      realises,
      refuses,
      expires,
      montantStats,
      montantRealiseStats,
    ] = await Promise.all([
      this.prisma.devis.count(),
      this.prisma.devis.count({ where: { statut: 'EN_ATTENTE_VALIDATION' } }),
      this.prisma.devis.count({ where: { statut: 'VALIDE' } }),
      this.prisma.devis.count({ where: { statut: 'REALISE' } }),
      this.prisma.devis.count({ where: { statut: 'REFUSE' } }),
      this.prisma.devis.count({ where: { statut: 'EXPIRE' } }),
      this.prisma.devis.aggregate({
        _sum: { montantHt: true },
        where: { statut: 'VALIDE' },
      }),
      this.prisma.devis.aggregate({
        _sum: { montantHt: true },
        where: { statut: 'REALISE' },
      }),
    ]);

    return {
      total,
      enAttenteValidation,
      valides,
      realises,
      refuses,
      expires,
      montantTotal: montantStats._sum.montantHt || 0,
      montantRealise: montantRealiseStats._sum.montantHt || 0,
    };
  }

  // Obtenir les devis d'une affaire
  async findByAffaire(affaireId: string): Promise<Devis[]> {
    return this.prisma.devis.findMany({
      where: { affaireId },
      orderBy: { dateCreation: 'desc' },
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
  }

  // Upload d'un fichier PDF pour un devis
  async uploadPdf(id: string, file: Express.Multer.File): Promise<Devis> {
    const devis = await this.findOne(id);

    // Si un fichier existe déjà, le supprimer
    if (devis.fichierPdf) {
      try {
        await this.uploadService.deletePdf(devis.fichierPdf);
      } catch (error) {
        console.warn(`Impossible de supprimer l'ancien fichier: ${error.message}`);
      }
    }

    // Uploader le nouveau fichier
    const uploadResult = await this.uploadService.uploadPdf(file);

    // Mettre à jour le devis avec les informations du fichier
    return this.prisma.devis.update({
      where: { id },
      data: {
        fichierPdf: uploadResult.filename,
        nomFichier: uploadResult.originalName,
        tailleFichier: uploadResult.size,
        dateUpload: new Date(),
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
  }

  // Supprimer le fichier PDF d'un devis
  async deletePdf(id: string): Promise<Devis> {
    const devis = await this.findOne(id);

    if (!devis.fichierPdf) {
      throw new NotFoundException('Aucun fichier PDF associé à ce devis');
    }

    // Supprimer le fichier physique
    try {
      await this.uploadService.deletePdf(devis.fichierPdf);
    } catch (error) {
      console.warn(`Impossible de supprimer le fichier: ${error.message}`);
    }

    // Mettre à jour le devis pour supprimer les références au fichier
    return this.prisma.devis.update({
      where: { id },
      data: {
        fichierPdf: null,
        nomFichier: null,
        tailleFichier: null,
        dateUpload: null,
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
  }
} 