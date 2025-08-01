import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';

@Injectable()
export class PhasesService {
  constructor(private prisma: PrismaService) {}

  // Créer une nouvelle phase
  async create(createPhaseDto: CreatePhaseDto) {
    // Vérifier que l'affaire existe
    const affaire = await this.prisma.affaire.findUnique({
      where: { id: createPhaseDto.affaireId },
    });

    if (!affaire) {
      throw new NotFoundException(`Affaire avec ID ${createPhaseDto.affaireId} non trouvée`);
    }

    // Calculer le coût total automatiquement
    const tempsEstime = createPhaseDto.tempsEstimeH || 0;
    const tauxHoraire = createPhaseDto.tauxHoraire || 0;
    const coutEstimeCalcule = tempsEstime * tauxHoraire;

    const dataToCreate: any = {
      nom: createPhaseDto.nom,
      description: createPhaseDto.description,
      typePhase: createPhaseDto.typePhase,
      affaire: { connect: { id: createPhaseDto.affaireId } },
      tempsEstimeH: tempsEstime,
      tauxHoraire: tauxHoraire,
      coutEstime: createPhaseDto.coutEstime || coutEstimeCalcule, // Utiliser le coût fourni ou calculé
      tempsReelH: createPhaseDto.tempsReelH || 0,
      coutReel: createPhaseDto.coutReel || 0,
      ordre: createPhaseDto.ordre || 1,
    };

    if (createPhaseDto.dateDebutPrevue) {
      dataToCreate.dateDebutPrevue = new Date(createPhaseDto.dateDebutPrevue);
    }

    if (createPhaseDto.dateFinPrevue) {
      dataToCreate.dateFinPrevue = new Date(createPhaseDto.dateFinPrevue);
    }

    return this.prisma.phaseChantier.create({
      data: dataToCreate,
      include: {
        affaire: { select: { id: true, numero: true, libelle: true } },
        taches: true,
      },
    });
  }

  // Récupérer toutes les phases avec filtres
  async findAll(
    affaireId?: string,
    typePhase?: string,
    statut?: string,
    skip = 0,
    take = 100,
  ) {
    const where: any = {};

    if (affaireId) where.affaireId = affaireId;
    if (typePhase) where.typePhase = typePhase;
    if (statut) where.statut = statut;

    const [phases, total] = await this.prisma.$transaction([
      this.prisma.phaseChantier.findMany({
        where,
        include: {
          affaire: { select: { id: true, numero: true, libelle: true } },
          taches: {
            include: {
              ouvrierAffecte: { select: { id: true, nom: true, prenom: true } },
            },
          },
        },
        orderBy: [{ affaireId: 'asc' }, { ordre: 'asc' }],
        skip,
        take,
      }),
      this.prisma.phaseChantier.count({ where }),
    ]);

    return { phases, total };
  }

  // Récupérer une phase par ID
  async findOne(id: string) {
    const phase = await this.prisma.phaseChantier.findUnique({
      where: { id },
      include: {
        affaire: { select: { id: true, numero: true, libelle: true } },
        taches: {
          include: {
            ouvrierAffecte: { select: { id: true, nom: true, prenom: true, tarifHoraireBase: true } },
            pointages: true,
          },
        },
      },
    });

    if (!phase) {
      throw new NotFoundException(`Phase avec ID ${id} non trouvée`);
    }

    return phase;
  }

  // Mettre à jour une phase
  async update(id: string, updatePhaseDto: UpdatePhaseDto) {
    const existingPhase = await this.prisma.phaseChantier.findUnique({
      where: { id },
    });

    if (!existingPhase) {
      throw new NotFoundException(`Phase avec ID ${id} non trouvée`);
    }

    const dataToUpdate: any = { ...updatePhaseDto };

    // Calculer le coût total automatiquement si temps ou taux horaire sont modifiés
    const tempsEstime = updatePhaseDto.tempsEstimeH !== undefined ? updatePhaseDto.tempsEstimeH : existingPhase.tempsEstimeH;
    const tauxHoraire = updatePhaseDto.tauxHoraire !== undefined ? updatePhaseDto.tauxHoraire : existingPhase.tauxHoraire;
    
    // Si le coût n'est pas explicitement fourni, le calculer automatiquement
    if (updatePhaseDto.coutEstime === undefined && (updatePhaseDto.tempsEstimeH !== undefined || updatePhaseDto.tauxHoraire !== undefined)) {
      dataToUpdate.coutEstime = tempsEstime * tauxHoraire;
    }

    // Convertir les dates string en Date
    if (updatePhaseDto.dateDebutPrevue) {
      dataToUpdate.dateDebutPrevue = new Date(updatePhaseDto.dateDebutPrevue);
    }
    if (updatePhaseDto.dateFinPrevue) {
      dataToUpdate.dateFinPrevue = new Date(updatePhaseDto.dateFinPrevue);
    }
    if (updatePhaseDto.dateDebutReelle) {
      dataToUpdate.dateDebutReelle = new Date(updatePhaseDto.dateDebutReelle);
    }
    if (updatePhaseDto.dateFinReelle) {
      dataToUpdate.dateFinReelle = new Date(updatePhaseDto.dateFinReelle);
    }

    return this.prisma.phaseChantier.update({
      where: { id },
      data: dataToUpdate,
      include: {
        affaire: { select: { id: true, numero: true, libelle: true } },
        taches: {
          include: {
            ouvrierAffecte: { select: { id: true, nom: true, prenom: true } },
          },
        },
      },
    });
  }

  // Supprimer une phase
  async remove(id: string) {
    const existingPhase = await this.prisma.phaseChantier.findUnique({
      where: { id },
      include: { taches: true },
    });

    if (!existingPhase) {
      throw new NotFoundException(`Phase avec ID ${id} non trouvée`);
    }

    // Vérifier qu'il n'y a pas de tâches associées
    if (existingPhase.taches.length > 0) {
      throw new BadRequestException(
        'Impossible de supprimer la phase : des tâches y sont associées'
      );
    }

    return this.prisma.phaseChantier.delete({
      where: { id },
    });
  }

  // Calculer les données réelles à partir des pointages
  async calculateRealData(phaseId: string) {
    const phase = await this.findOne(phaseId);

    let tempsReelTotal = 0;
    let coutReelTotal = 0;

    // Calculer les totaux à partir des tâches
    for (const tache of phase.taches) {
      tempsReelTotal += tache.tempsReelH || 0;
      coutReelTotal += tache.coutReel || 0;
    }

    // Mettre à jour la phase
    return this.prisma.phaseChantier.update({
      where: { id: phaseId },
      data: {
        tempsReelH: tempsReelTotal,
        coutReel: coutReelTotal,
      },
      include: {
        affaire: { select: { id: true, numero: true, libelle: true } },
        taches: {
          include: {
            ouvrierAffecte: { select: { id: true, nom: true, prenom: true } },
          },
        },
      },
    });
  }

  // Récupérer les statistiques d'une phase
  async getStats(phaseId: string) {
    const phase = await this.findOne(phaseId);

    const tempsEstime = phase.tempsEstimeH || 0;
    const tempsReel = phase.tempsReelH || 0;
    const coutEstime = phase.coutEstime || 0;
    const coutReel = phase.coutReel || 0;

    const ecartTemps = tempsReel - tempsEstime;
    const ecartCout = coutReel - coutEstime;
    const pourcentageAvancementTemps = tempsEstime > 0 ? (tempsReel / tempsEstime) * 100 : 0;
    const pourcentageAvancementCout = coutEstime > 0 ? (coutReel / coutEstime) * 100 : 0;

    return {
      phase: {
        id: phase.id,
        nom: phase.nom,
        typePhase: phase.typePhase,
        statut: phase.statut,
      },
      estimations: {
        tempsEstimeH: tempsEstime,
        coutEstime: coutEstime,
      },
      realise: {
        tempsReelH: tempsReel,
        coutReel: coutReel,
      },
      ecarts: {
        tempsH: ecartTemps,
        cout: ecartCout,
        pourcentageTemps: pourcentageAvancementTemps,
        pourcentageCout: pourcentageAvancementCout,
      },
      nbTaches: phase.taches.length,
      nbOuvriersAffectes: [...new Set(phase.taches.map((t: any) => t.ouvrierAffecteId))].length,
    };
  }
} 