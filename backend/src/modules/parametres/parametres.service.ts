import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateParametreDto } from './dto/create-parametre.dto';
import { UpdateParametreDto } from './dto/update-parametre.dto';

@Injectable()
export class ParametresService {
  constructor(private prisma: PrismaService) {}

  // Créer un nouveau paramètre
  async create(createParametreDto: CreateParametreDto) {
    try {
      return await this.prisma.parametreGlobal.create({
        data: createParametreDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Un paramètre avec la clé "${createParametreDto.cle}" existe déjà`);
      }
      throw error;
    }
  }

  // Récupérer tous les paramètres
  async findAll() {
    return this.prisma.parametreGlobal.findMany({
      orderBy: { cle: 'asc' },
    });
  }

  // Récupérer un paramètre par sa clé
  async findByKey(cle: string) {
    const parametre = await this.prisma.parametreGlobal.findUnique({
      where: { cle },
    });

    if (!parametre) {
      throw new NotFoundException(`Paramètre avec la clé "${cle}" non trouvé`);
    }

    return parametre;
  }

  // Récupérer un paramètre par son ID
  async findOne(id: string) {
    const parametre = await this.prisma.parametreGlobal.findUnique({
      where: { id },
    });

    if (!parametre) {
      throw new NotFoundException(`Paramètre avec l'ID ${id} non trouvé`);
    }

    return parametre;
  }

  // Mettre à jour un paramètre
  async update(id: string, updateParametreDto: UpdateParametreDto) {
    const parametre = await this.findOne(id);
    
    try {
      return await this.prisma.parametreGlobal.update({
        where: { id },
        data: updateParametreDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Un paramètre avec la clé "${updateParametreDto.cle}" existe déjà`);
      }
      throw error;
    }
  }

  // Supprimer un paramètre
  async remove(id: string) {
    const parametre = await this.findOne(id);
    
    return this.prisma.parametreGlobal.delete({
      where: { id },
    });
  }

  // Méthodes utilitaires pour récupérer des valeurs spécifiques
  async getTauxHoraire(): Promise<number> {
    const parametre = await this.findByKey('TAUX_HORAIRE_DEFAUT');
    return parseFloat(parametre.valeur);
  }

  async getTauxFraisGeneraux(): Promise<number> {
    const parametre = await this.findByKey('TAUX_FRAIS_GENERAUX');
    return parseFloat(parametre.valeur);
  }

  async getTauxTVA(): Promise<number> {
    const parametre = await this.findByKey('TAUX_TVA');
    return parseFloat(parametre.valeur);
  }

  // Méthode pour initialiser les paramètres par défaut
  async initializeDefaultParameters() {
    const defaultParams = [
      { cle: 'TAUX_HORAIRE_DEFAUT', valeur: '45.00', description: 'Taux horaire par défaut en euros' },
      { cle: 'TAUX_FRAIS_GENERAUX', valeur: '0.15', description: 'Taux des frais généraux (15%)' },
      { cle: 'TAUX_TVA', valeur: '0.20', description: 'Taux de TVA (20%)' },
      { cle: 'DEVISE', valeur: 'EUR', description: 'Devise utilisée' },
      { cle: 'ENTREPRISE_NOM', valeur: 'Menuiserie Artisanale', description: 'Nom de l\'entreprise' },
      { cle: 'ENTREPRISE_ADRESSE', valeur: '', description: 'Adresse de l\'entreprise' },
      { cle: 'ENTREPRISE_TEL', valeur: '', description: 'Téléphone de l\'entreprise' },
      { cle: 'ENTREPRISE_EMAIL', valeur: '', description: 'Email de l\'entreprise' },
    ];

    for (const param of defaultParams) {
      const existing = await this.prisma.parametreGlobal.findUnique({
        where: { cle: param.cle },
      });

      if (!existing) {
        await this.prisma.parametreGlobal.create({
          data: param,
        });
      }
    }
  }
} 