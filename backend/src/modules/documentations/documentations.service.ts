import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ThumbnailService } from './services/thumbnail.service';
import { CreateDocumentationDto } from './dto/create-documentation.dto';
import { UpdateDocumentationDto } from './dto/update-documentation.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class DocumentationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly thumbnailService: ThumbnailService,
  ) {}

  async create(
    createDocumentationDto: CreateDocumentationDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    try {
      const documentation = await this.prisma.documentation.create({
        data: {
          nom: createDocumentationDto.nom,
          nomOriginal: file.originalname,
          chemin: file.path,
          taille: file.size,
          type: path.extname(file.originalname).slice(1).toLowerCase(),
          mimeType: file.mimetype,
          categorie: createDocumentationDto.categorie,
          sousCategorie: createDocumentationDto.sousCategorie || null,
          description: createDocumentationDto.description || null,
          affaireId: createDocumentationDto.affaireId,
          uploadeParId: userId,
          uploadePar: 'User', // Temporaire, sera remplacé par le nom réel
        },
        include: {
          uploadeur: {
            select: {
              id: true,
              nom: true,
              prenom: true,
            },
          },
        },
      });

      // Générer la miniature en arrière-plan (sans bloquer la réponse)
      this.thumbnailService.generateThumbnail(file.path, documentation.id.toString())
        .then((thumbnailFile) => {
          if (thumbnailFile) {
            console.log(`✅ Miniature générée: ${thumbnailFile} pour document ${documentation.id}`);
          } else {
            console.log(`⚠️ Miniature non générée pour document ${documentation.id} (type non supporté)`);
          }
        })
        .catch((error) => {
          console.error(`❌ Erreur génération miniature pour document ${documentation.id}:`, error.message);
        });

      return documentation;
    } catch (error) {
      // En cas d'erreur, supprimer le fichier uploadé
      if (file?.path) {
        await fs.unlink(file.path).catch(() => {});
      }
      throw error;
    }
  }

  async findAllByAffaire(affaireId: string) {
    const documentations = await this.prisma.documentation.findMany({
      where: {
        affaireId: affaireId,
      },
      include: {
        uploadeur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
      orderBy: {
        dateUpload: 'desc',
      },
    });

    // Formater les données pour le frontend
    return documentations.map((doc: any) => ({
      id: doc.id,
      nom: doc.nom,
      nomOriginal: doc.nomOriginal,
      categorie: doc.categorie,
      sousCategorie: doc.sousCategorie,
      taille: this.formatFileSize(Number(doc.taille)),
      type: doc.type,
      description: doc.description,
      dateUpload: doc.dateUpload.toISOString(),
      uploadePar: `${doc.uploadeur.prenom} ${doc.uploadeur.nom}`,
    }));
  }

  async findOne(id: string) {
    const documentation = await this.prisma.documentation.findUnique({
      where: { id: parseInt(id) },
      include: {
        uploadeur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
        affaire: {
          select: {
            id: true,
            libelle: true,
          },
        },
      },
    });

    if (!documentation) {
      throw new NotFoundException('Document non trouvé');
    }

    return documentation;
  }

  async getFilePath(id: string): Promise<string> {
    const documentation = await this.prisma.documentation.findUnique({
      where: { id: parseInt(id) },
      select: {
        chemin: true,
        nomOriginal: true,
      },
    });

    if (!documentation) {
      throw new NotFoundException('Document non trouvé');
    }

    // Vérifier que le fichier existe
    try {
      await fs.access(documentation.chemin);
      return documentation.chemin;
    } catch {
      throw new NotFoundException('Fichier non trouvé sur le serveur');
    }
  }

  async update(id: string, updateDocumentationDto: UpdateDocumentationDto) {
    const documentation = await this.prisma.documentation.update({
      where: { id: parseInt(id) },
      data: {
        nom: updateDocumentationDto.nom,
        categorie: updateDocumentationDto.categorie,
        sousCategorie: updateDocumentationDto.sousCategorie,
        description: updateDocumentationDto.description,
      },
      include: {
        uploadeur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    return documentation;
  }

  async remove(id: string) {
    const documentation = await this.prisma.documentation.findUnique({
      where: { id: parseInt(id) },
    });

    if (!documentation) {
      throw new NotFoundException('Document non trouvé');
    }

    // Supprimer le fichier physique
    try {
      await fs.unlink(documentation.chemin);
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      // Continuer même si le fichier n'existe pas
    }

    // Supprimer l'entrée en base
    await this.prisma.documentation.delete({
      where: { id: parseInt(id) },
    });

    return { message: 'Document supprimé avec succès' };
  }

  async getStatsByAffaire(affaireId: string) {
    const documentations = await this.prisma.documentation.findMany({
      where: { affaireId },
      select: {
        categorie: true,
        taille: true,
      },
    });

    const stats = {
      total: documentations.length,
      totalSize: documentations.reduce((sum: number, doc: any) => sum + Number(doc.taille), 0),
      byCategory: {} as Record<string, number>,
    };

    documentations.forEach((doc: any) => {
      if (!stats.byCategory[doc.categorie]) {
        stats.byCategory[doc.categorie] = 0;
      }
      stats.byCategory[doc.categorie]++;
    });

    return {
      ...stats,
      totalSizeFormatted: this.formatFileSize(stats.totalSize),
    };
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 