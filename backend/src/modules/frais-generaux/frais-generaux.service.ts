import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFraisGeneralDto } from './dto/create-frais-general.dto';
import { UpdateFraisGeneralDto } from './dto/update-frais-general.dto';
import { CalculFraisGenerauxDto, ResultatCalculFraisGenerauxDto } from './dto/calcul-frais-generaux.dto';

@Injectable()
export class FraisGenerauxService {
  constructor(private prisma: PrismaService) {}

  // Créer un nouveau frais général
  async create(createFraisGeneralDto: CreateFraisGeneralDto) {
    try {
      // Préparer les données en convertissant les dates string en objets Date
      const data: any = { ...createFraisGeneralDto };
      
      if (createFraisGeneralDto.dateCommencement) {
        const date = new Date(createFraisGeneralDto.dateCommencement);
        if (isNaN(date.getTime())) {
          throw new BadRequestException('Date de commencement invalide');
        }
        data.dateCommencement = date;
      }
      
      if (createFraisGeneralDto.dateFin) {
        const date = new Date(createFraisGeneralDto.dateFin);
        if (isNaN(date.getTime())) {
          throw new BadRequestException('Date de fin invalide');
        }
        data.dateFin = date;
      }

      return await this.prisma.fraisGeneral.create({
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Un frais général avec ce libellé existe déjà');
      }
      throw new BadRequestException(`Erreur lors de la création du frais général: ${error.message}`);
    }
  }

  // Récupérer tous les frais généraux
  async findAll(includeInactifs = false) {
    const where = includeInactifs ? {} : { actif: true };
    
    return await this.prisma.fraisGeneral.findMany({
      where,
      orderBy: [
        { ordre: 'asc' },
        { libelle: 'asc' },
      ],
    });
  }

  // Récupérer un frais général par ID
  async findOne(id: string) {
    const fraisGeneral = await this.prisma.fraisGeneral.findUnique({
      where: { id },
    });

    if (!fraisGeneral) {
      throw new NotFoundException(`Frais général avec ID ${id} non trouvé`);
    }

    return fraisGeneral;
  }

  // Mettre à jour un frais général
  async update(id: string, updateFraisGeneralDto: UpdateFraisGeneralDto) {
    await this.findOne(id); // Vérifier que l'entité existe

    try {
      // Convertir les dates string en objets Date si nécessaire
      const data: any = { ...updateFraisGeneralDto };
      
      if (data.dateCommencement) {
        if (typeof data.dateCommencement === 'string') {
          const date = new Date(data.dateCommencement);
          if (isNaN(date.getTime())) {
            throw new BadRequestException('Date de commencement invalide');
          }
          data.dateCommencement = date;
        }
      }
      
      if (data.dateFin) {
        if (typeof data.dateFin === 'string') {
          const date = new Date(data.dateFin);
          if (isNaN(date.getTime())) {
            throw new BadRequestException('Date de fin invalide');
          }
          data.dateFin = date;
        }
      }

      return await this.prisma.fraisGeneral.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Un frais général avec ce libellé existe déjà');
      }
      throw error;
    }
  }

  // Supprimer un frais général (soft delete)
  async remove(id: string) {
    await this.findOne(id);

    return await this.prisma.fraisGeneral.update({
      where: { id },
      data: { actif: false },
    });
  }

  // Supprimer définitivement un frais général (hard delete)
  async permanentDelete(id: string) {
    await this.findOne(id);

    return await this.prisma.fraisGeneral.delete({
      where: { id },
    });
  }

  // Réactiver un frais général
  async reactivate(id: string) {
    await this.findOne(id);

    return await this.prisma.fraisGeneral.update({
      where: { id },
      data: { actif: true },
    });
  }

  // Nettoyer automatiquement tous les frais généraux expirés 
  async nettoyerFraisGenerauxExpires() {
    const aujourd_hui = new Date();
    
    const fraisExpires = await this.prisma.fraisGeneral.findMany({
      where: {
        dateFin: {
          lt: aujourd_hui,
        },
        actif: true,
      },
    });

    if (fraisExpires.length > 0) {
      await this.prisma.fraisGeneral.updateMany({
        where: {
          dateFin: {
            lt: aujourd_hui,
          },
          actif: true,
        },
        data: {
          actif: false,
        },
      });

      console.log(`${fraisExpires.length} frais généraux expiré(s) automatiquement désactivé(s)`);
    }

    return fraisExpires.length;
  }

  // Calculer les statistiques des frais généraux (avec nettoyage automatique)
  async getStats() {
    // Nettoyer d'abord les frais généraux expirés
    await this.nettoyerFraisGenerauxExpires();

    const [total, actifs, montantTotalHt, montantTotalTtc] = await Promise.all([
      this.prisma.fraisGeneral.count(),
      this.prisma.fraisGeneral.count({ where: { actif: true } }),
      this.prisma.fraisGeneral.aggregate({
        where: { actif: true },
        _sum: { montantHt: true },
      }),
      this.prisma.fraisGeneral.aggregate({
        where: { actif: true },
        _sum: { montantTtc: true },
      }),
    ]);

    return {
      total,
      actifs,
      inactifs: total - actifs,
      montantMensuelHt: montantTotalHt._sum.montantHt || 0,
      montantMensuelTtc: montantTotalTtc._sum.montantTtc || 0,
    };
  }

  // Calculer les jours ouvrés entre deux dates (exclut weekends)
  private calculerJoursOuvres(dateDebut: Date, dateFin: Date, joursParSemaine = 5): number {
    let joursOuvres = 0;
    const currentDate = new Date(dateDebut);
    const finDate = new Date(dateFin);

    // Assurer que nous incluons la date de fin
    finDate.setHours(23, 59, 59, 999);

    while (currentDate <= finDate) {
      const dayOfWeek = currentDate.getDay();
      
      // 0 = Dimanche, 6 = Samedi
      // On compte les jours ouvrés selon le paramètre joursParSemaine
      if (joursParSemaine === 5) {
        // Lundi à Vendredi
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          joursOuvres++;
        }
      } else if (joursParSemaine === 6) {
        // Lundi à Samedi
        if (dayOfWeek >= 1 && dayOfWeek <= 6) {
          joursOuvres++;
        }
      } else if (joursParSemaine === 7) {
        // Tous les jours
        joursOuvres++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return joursOuvres;
  }

  // Calculer les frais généraux pour une période donnée
  async calculerFraisGenerauxPeriode(calculDto: CalculFraisGenerauxDto): Promise<ResultatCalculFraisGenerauxDto> {
    const { dateDebut, dateFin, heuresParJour = 7, joursParSemaine = 5 } = calculDto;

    // Récupérer tous les frais généraux actifs
    const fraisGeneraux = await this.findAll(false);

    // Calculer les jours ouvrés
    const joursOuvres = this.calculerJoursOuvres(dateDebut, dateFin, joursParSemaine);

    // Calculer les heures totales
    const heuresTotal = joursOuvres * heuresParJour;

    // Constantes basées sur votre logique métier
    const JOURS_OUVRES_PAR_MOIS = 20; // 4 semaines × 5 jours
    const HEURES_PAR_MOIS = JOURS_OUVRES_PAR_MOIS * heuresParJour; // 140h par mois

    // Calculer les totaux mensuels
    const fraisGenerauxMensuelHt = fraisGeneraux.reduce((sum, fg) => sum + fg.montantHt, 0);
    const fraisGenerauxMensuelTtc = fraisGeneraux.reduce((sum, fg) => sum + fg.montantTtc, 0);

    // Calculer le ratio de la période par rapport au mois de référence
    const ratioJours = joursOuvres / JOURS_OUVRES_PAR_MOIS;

    // Calculer les montants pour la période
    const montantTotalHt = fraisGenerauxMensuelHt * ratioJours;
    const montantTotalTtc = fraisGenerauxMensuelTtc * ratioJours;

    // Détail du calcul par poste
    const detailCalcul = fraisGeneraux.map((fg) => ({
      libelle: fg.libelle,
      montantMensuelHt: fg.montantHt,
      montantPeriodeHt: fg.montantHt * ratioJours,
      categorie: fg.categorie,
    }));

    return {
      joursOuvres,
      heuresTotal,
      montantTotalHt: Math.round(montantTotalHt * 100) / 100, // Arrondir à 2 décimales
      montantTotalTtc: Math.round(montantTotalTtc * 100) / 100,
      fraisGenerauxMensuelHt: Math.round(fraisGenerauxMensuelHt * 100) / 100,
      detailCalcul: detailCalcul.map(item => ({
        ...item,
        montantPeriodeHt: Math.round(item.montantPeriodeHt * 100) / 100,
      })),
    };
  }

  // Initialiser les frais généraux par défaut avec vos données
  async initialiserFraisGenerauxDefaut() {
    const fraisGenerauxDefaut = [
      { libelle: 'Toupie', montantTtc: 270.00, montantHt: 225.00, categorie: 'MATERIEL', ordre: 1 },
      { libelle: 'Crédit bail gerbeur 1', montantTtc: 228.00, montantHt: 190.00, categorie: 'CREDIT_BAIL', ordre: 2, dateFin: new Date('2025-12-31') },
      { libelle: 'Crédit bail gerbeur 2', montantTtc: 145.00, montantHt: 120.83, categorie: 'CREDIT_BAIL', ordre: 3, dateFin: new Date('2026-06-30') },
      { libelle: 'crédit bail kangoo 2', montantTtc: 504.00, montantHt: 420.00, categorie: 'CREDIT_BAIL', ordre: 4, dateFin: new Date('2025-03-15') },
      { libelle: 'crédit bail Benne', montantTtc: 600.00, montantHt: 500.00, categorie: 'CREDIT_BAIL', ordre: 5, dateFin: new Date('2026-01-31') },
      { libelle: 'Crédit Classique BOXER', montantTtc: 600.00, montantHt: 500.00, categorie: 'CREDIT_CLASSIQUE', ordre: 6 },
      { libelle: 'loyer Atelier Hossegor', montantTtc: 2160.00, montantHt: 1800.00, categorie: 'LOCATION', ordre: 7 },
      { libelle: 'Loyer Atelier Came', montantTtc: 2100.00, montantHt: 1750.00, categorie: 'LOCATION', ordre: 8 },
      { libelle: 'Atelier charges + edf', montantTtc: 600.00, montantHt: 500.00, categorie: 'CHARGES', ordre: 9 },
      { libelle: 'Assurance Atelier', montantTtc: 320.00, montantHt: 266.67, categorie: 'ASSURANCE', ordre: 10 },
      { libelle: 'Crédit banque CIC', montantTtc: 850.00, montantHt: 850.00, categorie: 'BANQUE', ordre: 11 },
      { libelle: 'Banque pouyanne', montantTtc: 1600.00, montantHt: 1600.00, categorie: 'BANQUE', ordre: 12 },
      { libelle: 'faux frais', montantTtc: 300.00, montantHt: 250.00, categorie: 'AUTRE', ordre: 13 },
      { libelle: 'Evoliz logiciel compta', montantTtc: 45.00, montantHt: 37.50, categorie: 'LOGICIEL', ordre: 14 },
      { libelle: 'Comptable Exco', montantTtc: 440.00, montantHt: 366.67, categorie: 'SERVICE', ordre: 15 },
      { libelle: 'Téléphone', montantTtc: 102.00, montantHt: 85.00, categorie: 'COMMUNICATION', ordre: 16 },
      { libelle: 'Internet', montantTtc: 52.96, montantHt: 44.13, categorie: 'COMMUNICATION', ordre: 17 },
      { libelle: 'Eau', montantTtc: 50.00, montantHt: 41.67, categorie: 'CHARGES', ordre: 18 },
      { libelle: 'Assurance Boxer', montantTtc: 96.00, montantHt: 80.00, categorie: 'ASSURANCE', ordre: 19 },
      { libelle: 'Assurance Kangoo', montantTtc: 45.00, montantHt: 37.50, categorie: 'ASSURANCE', ordre: 20 },
      { libelle: 'Assurance Benne', montantTtc: 110.00, montantHt: 91.67, categorie: 'ASSURANCE', ordre: 21 },
      { libelle: 'Assurance Kangoo Van', montantTtc: 90.00, montantHt: 75.00, categorie: 'ASSURANCE', ordre: 22 },
      { libelle: 'Carburant', montantTtc: 450.00, montantHt: 375.00, categorie: 'VEHICULE', ordre: 23 },
      { libelle: 'Péage', montantTtc: 125.00, montantHt: 104.17, categorie: 'VEHICULE', ordre: 24 },
      { libelle: 'Banque CIC', montantTtc: 60.00, montantHt: 50.00, categorie: 'BANQUE', ordre: 25 },
      { libelle: 'Assurance Décennale', montantTtc: 187.55, montantHt: 156.29, categorie: 'ASSURANCE', ordre: 26 },
      { libelle: 'Mutuel', montantTtc: 27.85, montantHt: 23.21, categorie: 'ASSURANCE', ordre: 27 },
      { libelle: 'Assurance multirisque', montantTtc: 43.58, montantHt: 36.32, categorie: 'ASSURANCE', ordre: 28 },
      { libelle: 'Banque Plan Prev', montantTtc: 17.94, montantHt: 14.95, categorie: 'BANQUE', ordre: 29 },
    ];

    for (const fraisGeneral of fraisGenerauxDefaut) {
      const existing = await this.prisma.fraisGeneral.findFirst({
        where: { libelle: fraisGeneral.libelle },
      });

      if (!existing) {
        await this.prisma.fraisGeneral.create({
          data: fraisGeneral,
        });
      }
    }

    return { message: 'Frais généraux par défaut initialisés' };
  }
} 