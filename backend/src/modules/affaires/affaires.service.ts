import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAffaireDto } from './dto/create-affaire.dto';
import { UpdateAffaireDto } from './dto/update-affaire.dto';
import { UpdateAffaireReelDto } from './dto/update-affaire-reel.dto';
import { Affaire, Prisma, StatutAffaire } from '@prisma/client';

@Injectable()
export class AffairesService {
  constructor(private prisma: PrismaService) {}

  async create(createAffaireDto: CreateAffaireDto): Promise<Affaire> {
    try {
      // Générer automatiquement le numéro si non fourni
      const numero = createAffaireDto.numero || await this.generateNumeroAffaire();
      
      const data: Prisma.AffaireCreateInput = {
        ...createAffaireDto,
        numero,
        objectifCaHt: createAffaireDto.objectifCaHt ?? 0, // Valeur par défaut pour le montant de base
        objectifAchatHt: createAffaireDto.objectifAchatHt ?? 0,
        objectifHeuresFab: createAffaireDto.objectifHeuresFab ?? 0,
        objectifHeuresSer: createAffaireDto.objectifHeuresSer ?? 0,
        objectifHeuresPose: createAffaireDto.objectifHeuresPose ?? 0,
        objectifFraisGeneraux: createAffaireDto.objectifFraisGeneraux ?? 0,
        statut: (createAffaireDto.statut as StatutAffaire) ?? 'PLANIFIEE',
        // Convertir les dates string en DateTime si fournies
        dateCommencement: createAffaireDto.dateCommencement ? 
          new Date(`${createAffaireDto.dateCommencement}T00:00:00.000Z`) : undefined,
        dateCloturePrevue: createAffaireDto.dateCloturePrevue ? 
          new Date(`${createAffaireDto.dateCloturePrevue}T23:59:59.999Z`) : undefined,
      };

      return await this.prisma.affaire.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`Une affaire avec le numéro ${createAffaireDto.numero || 'généré'} existe déjà`);
        }
      }
      throw error;
    }
  }

  // Méthode pour générer automatiquement un numéro d'affaire
  private async generateNumeroAffaire(): Promise<string> {
    const currentYear = new Date().getFullYear().toString().slice(-2); // 2024 -> 24
    const prefix = `${currentYear}-BOIS`;
    
    // Trouver le dernier numéro pour cette année
    const lastAffaire = await this.prisma.affaire.findFirst({
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
    if (lastAffaire) {
      // Extraire le numéro séquentiel du dernier numéro (ex: 24-BOIS-003 -> 3)
      const lastNumParts = lastAffaire.numero.split('-');
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
    search?: string,
    statut?: StatutAffaire,
    skip = 0,
    take = 10,
  ): Promise<{ affaires: Affaire[]; total: number }> {
    const where: any = {};

    if (statut) {
      where.statut = statut;
    }

    if (search) {
      where.OR = [
        { numero: { contains: search } },
        { libelle: { contains: search } },
        { client: { contains: search } },
      ];
    }

    const [affaires, total] = await Promise.all([
      this.prisma.affaire.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              bdc: true,
              pointages: true,
              phases: true,
              devis: true,
              achats: true,
            },
          },
          // Inclure les devis validés pour calculer le CA réel
          devis: {
            where: { statut: { in: ['VALIDE', 'REALISE'] } },
            select: { montantHt: true },
          },
          // Inclure les achats validés pour calculer les achats réels
          achats: {
            where: { statut: { in: ['VALIDE', 'PAYE'] } },
            select: { montantHt: true },
          },
          // Inclure les BDC réceptionnés pour calculer les achats réels
          bdc: {
            where: { statut: { in: ['RECEPTIONNE', 'VALIDE'] } },
            select: { montantHt: true },
          },
        },
      }),
      this.prisma.affaire.count({ where }),
    ]);

    // Calculer le CA réel et les achats réels pour chaque affaire
    const affairesWithCalculatedData = affaires.map(affaire => {
      // Calculer le CA réel depuis les devis validés
      const caReelHt = affaire.devis.reduce((sum, devis) => sum + devis.montantHt, 0);
      
      // Calculer les achats réels depuis les achats validés et BDC réceptionnés
      const achatsValides = affaire.achats.reduce((sum, achat) => sum + achat.montantHt, 0);
      const bdcReceptionnes = affaire.bdc.reduce((sum, bdc) => sum + bdc.montantHt, 0);
      const achatReelHt = achatsValides + bdcReceptionnes;

      // Supprimer les relations incluses pour ne pas surcharger la réponse
      const { devis, achats, bdc, ...affaireData } = affaire;

      return {
        ...affaireData,
        // Ajouter les données calculées
        caReelHt,
        achatReelHt,
        // Garder les données existantes si elles existent
        objectifCaHt: affaire.objectifCaHt || 0,
        objectifAchatHt: affaire.objectifAchatHt || 0,
        canDelete: affaire._count.bdc === 0 && affaire._count.pointages === 0 && affaire._count.phases === 0 && affaire._count.devis === 0 && affaire._count.achats === 0,
        deleteReasons: [
          ...(affaire._count.bdc > 0 ? [`${affaire._count.bdc} bon(s) de commande`] : []),
          ...(affaire._count.pointages > 0 ? [`${affaire._count.pointages} pointage(s)`] : []),
          ...(affaire._count.phases > 0 ? [`${affaire._count.phases} phase(s)`] : []),
          ...(affaire._count.devis > 0 ? [`${affaire._count.devis} devis`] : []),
          ...(affaire._count.achats > 0 ? [`${affaire._count.achats} achat(s)`] : []),
        ],
      };
    });

    return { affaires: affairesWithCalculatedData, total };
  }

  async findOne(id: string): Promise<Affaire> {
    const affaire = await this.prisma.affaire.findUnique({
      where: { id },
      include: {
        bdc: {
          include: {
            categorie: true,
          },
        },
        pointages: {
          include: {
            user: {
              select: {
                id: true,
                nom: true,
                prenom: true,
              },
            },
          },
        },
      },
    });

    if (!affaire) {
      throw new NotFoundException(`Affaire avec ID ${id} non trouvée`);
    }

    return affaire;
  }

  async update(id: string, updateAffaireDto: UpdateAffaireDto): Promise<Affaire> {
    try {
      // Vérifier que l'affaire existe
      const existingAffaire = await this.prisma.affaire.findUnique({
        where: { id },
      });

      if (!existingAffaire) {
        throw new NotFoundException(`Affaire avec ID ${id} non trouvée`);
      }

      const data: Prisma.AffaireUpdateInput = {
        ...updateAffaireDto,
        objectifAchatHt: updateAffaireDto.objectifAchatHt ?? 0,
        objectifHeuresFab: updateAffaireDto.objectifHeuresFab ?? 0,
        objectifHeuresSer: updateAffaireDto.objectifHeuresSer ?? 0,
        objectifHeuresPose: updateAffaireDto.objectifHeuresPose ?? 0,
        objectifFraisGeneraux: updateAffaireDto.objectifFraisGeneraux ?? 0,
        statut: (updateAffaireDto.statut as StatutAffaire) ?? undefined,
        // Convertir les dates string en DateTime si fournies
        dateCommencement: updateAffaireDto.dateCommencement ? 
          new Date(`${updateAffaireDto.dateCommencement}T00:00:00.000Z`) : undefined,
        dateCloturePrevue: updateAffaireDto.dateCloturePrevue ? 
          new Date(`${updateAffaireDto.dateCloturePrevue}T23:59:59.999Z`) : undefined,
      };

      return await this.prisma.affaire.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`Une affaire avec le numéro ${updateAffaireDto.numero} existe déjà`);
        }
      }
      throw error;
    }
  }

  async updateStatut(id: string, statut: StatutAffaire): Promise<Affaire> {
    const affaire = await this.prisma.affaire.findUnique({
      where: { id },
    });

    if (!affaire) {
      throw new NotFoundException(`Affaire avec ID ${id} non trouvée`);
    }

    return this.prisma.affaire.update({
      where: { id },
      data: { statut },
    });
  }

  // Cette méthode vérifie si une affaire peut être supprimée (absence de BDC et pointages)
  async canDelete(id: string): Promise<{ canDelete: boolean; message?: string }> {
    const affaire = await this.prisma.affaire.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bdc: true,
            pointages: true,
            phases: true,
            devis: true,
            achats: true,
          },
        },
      },
    });

    if (!affaire) {
      throw new NotFoundException(`Affaire avec ID ${id} non trouvée`);
    }

    if (affaire._count.bdc > 0) {
      return {
        canDelete: false,
        message: `Impossible de supprimer l'affaire: ${affaire._count.bdc} bon(s) de commande associé(s)`,
      };
    }

    if (affaire._count.pointages > 0) {
      return {
        canDelete: false,
        message: `Impossible de supprimer l'affaire: ${affaire._count.pointages} pointage(s) associé(s)`,
      };
    }

    if (affaire._count.phases > 0) {
      return {
        canDelete: false,
        message: `Impossible de supprimer l'affaire: ${affaire._count.phases} phase(s) de chantier associée(s)`,
      };
    }

    if (affaire._count.devis > 0) {
      return {
        canDelete: false,
        message: `Impossible de supprimer l'affaire: ${affaire._count.devis} devis associé(s)`,
      };
    }

    if (affaire._count.achats > 0) {
      return {
        canDelete: false,
        message: `Impossible de supprimer l'affaire: ${affaire._count.achats} achat(s) associé(s)`,
      };
    }

    return { canDelete: true };
  }

  async remove(id: string): Promise<Affaire> {
    const { canDelete, message } = await this.canDelete(id);

    if (!canDelete) {
      throw new ConflictException(message);
    }

    return this.prisma.affaire.delete({
      where: { id },
    });
  }

  // Méthode pour supprimer une affaire et toutes ses dépendances (suppression en cascade)
  async removeWithDependencies(id: string): Promise<{ success: boolean; message: string }> {
    const affaire = await this.prisma.affaire.findUnique({
      where: { id },
      include: {
        phases: {
          include: {
            taches: {
              include: {
                pointages: true
              }
            }
          }
        },
        devis: true,
        bdc: true,
        achats: true,
        pointages: true,
      },
    });

    if (!affaire) {
      throw new NotFoundException(`Affaire avec ID ${id} non trouvée`);
    }

    try {
      // Utiliser une transaction pour la suppression en cascade
      await this.prisma.$transaction(async (prisma) => {
        // 1. Supprimer tous les pointages associés aux tâches des phases
        for (const phase of affaire.phases) {
          for (const tache of phase.taches) {
            await prisma.pointage.deleteMany({
              where: { tacheId: tache.id }
            });
          }
        }

        // 2. Supprimer toutes les tâches des phases
        for (const phase of affaire.phases) {
          await prisma.tacheAffectation.deleteMany({
            where: { phaseId: phase.id }
          });
        }

        // 3. Supprimer toutes les phases
        await prisma.phaseChantier.deleteMany({
          where: { affaireId: id }
        });

        // 4. Supprimer tous les pointages directs de l'affaire
        await prisma.pointage.deleteMany({
          where: { affaireId: id }
        });

        // 5. Supprimer tous les devis
        await prisma.devis.deleteMany({
          where: { affaireId: id }
        });

        // 6. Supprimer tous les achats
        await prisma.achat.deleteMany({
          where: { affaireId: id }
        });

        // 7. Supprimer tous les BDC
        await prisma.bdc.deleteMany({
          where: { affaireId: id }
        });

        // 8. Enfin, supprimer l'affaire
        await prisma.affaire.delete({
          where: { id }
        });
      });

      return {
        success: true,
        message: `Affaire ${affaire.numero} et toutes ses dépendances ont été supprimées avec succès`
      };
    } catch (error) {
      throw new ConflictException(
        `Erreur lors de la suppression de l'affaire: ${error.message}`
      );
    }
  }

  // Méthode pour calculer les indicateurs globaux des affaires
  async getGlobalStats() {
    try {
      // Calculer les stats globales avec des requêtes Prisma sûres
      const [
        totalAffaires,
        affairesEnCours,
        affairesPlanifiees,
        affairesTerminees,
        totauxObjectifs,
        totauxReels,
        totalBdc,
        totalPointages,
      ] = await Promise.all([
        this.prisma.affaire.count(),
        this.prisma.affaire.count({ where: { statut: 'EN_COURS' } }),
        this.prisma.affaire.count({ where: { statut: 'PLANIFIEE' } }),
        this.prisma.affaire.count({ where: { statut: 'TERMINEE' } }),
        this.prisma.affaire.aggregate({
          _sum: {
            objectifCaHt: true,
            objectifAchatHt: true,
            objectifHeuresFab: true,
            objectifHeuresPose: true,
            objectifFraisGeneraux: true,
          },
        }),
        this.prisma.affaire.aggregate({
          _sum: {
            caReelHt: true,
            achatReelHt: true,
            heuresReellesFab: true,
            heuresReellesPose: true,
          },
        }),
        this.prisma.bdc.aggregate({
          _sum: {
            montantHt: true,
          },
        }),
        this.prisma.pointage.aggregate({
          _sum: {
            nbHeures: true,
          },
        }),
      ]);

      // Calculer les marges approximatives - conversion explicite des BigInt en Number
      const objectifCaTotal = Number(totauxObjectifs._sum.objectifCaHt || 0);
      const objectifAchatTotal = Number(totauxObjectifs._sum.objectifAchatHt || 0);
      const caReelTotal = Number(totauxReels._sum.caReelHt || 0);
      const achatReelTotal = Number(totauxReels._sum.achatReelHt || 0);
      const totalBdcMontant = Number(totalBdc._sum.montantHt || 0);
      const totalHeures = Number(totalPointages._sum.nbHeures || 0);

      // Marge objectif estimée
      const margeObjectifEstimee = objectifCaTotal - objectifAchatTotal;
      const pourcentageMargeObjectif = objectifCaTotal > 0 ? (margeObjectifEstimee / objectifCaTotal) * 100 : 0;

      // Marge réelle approximative (basée sur les données disponibles)
      const margeReelleApprox = caReelTotal - achatReelTotal;
      const pourcentageMargeReelle = caReelTotal > 0 ? (margeReelleApprox / caReelTotal) * 100 : 0;

      return {
        totalAffaires,
        enCours: affairesEnCours,  // Changé de affairesEnCours à enCours
        planifiees: affairesPlanifiees,  // Changé de affairesPlanifiees à planifiees
        terminees: affairesTerminees,  // Changé de affairesTerminees à terminees
        caTotal: objectifCaTotal,  // Ajout du CA total
        objectifs: {
          caHt: objectifCaTotal,
          achatHt: objectifAchatTotal,
          heuresFab: Number(totauxObjectifs._sum.objectifHeuresFab || 0),
          heuresPose: Number(totauxObjectifs._sum.objectifHeuresPose || 0),
          fraisGeneraux: Number(totauxObjectifs._sum.objectifFraisGeneraux || 0),
        },
        reels: {
          caHt: caReelTotal,
          achatHt: achatReelTotal,
          heuresFab: Number(totauxReels._sum.heuresReellesFab || 0),
          heuresPose: Number(totauxReels._sum.heuresReellesPose || 0),
        },
        totaux: {
          montantBdc: totalBdcMontant,
          totalHeures: totalHeures,
        },
        marges: {
          objectif: margeObjectifEstimee,
          reelle: margeReelleApprox,
          pourcentageObjectif: pourcentageMargeObjectif,
          pourcentageReelle: pourcentageMargeReelle,
        },
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques globales:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        totalAffaires: 0,
        enCours: 0,  // Changé de affairesEnCours à enCours
        planifiees: 0,  // Changé de affairesPlanifiees à planifiees
        terminees: 0,  // Changé de affairesTerminees à terminees
        caTotal: 0,  // Ajout du CA total
        objectifs: {
          caHt: 0,
          achatHt: 0,
          heuresFab: 0,
          heuresPose: 0,
          fraisGeneraux: 0,
        },
        reels: {
          caHt: 0,
          achatHt: 0,
          heuresFab: 0,
          heuresPose: 0,
        },
        totaux: {
          montantBdc: 0,
          totalHeures: 0,
        },
        marges: {
          objectif: 0,
          reelle: 0,
          pourcentageObjectif: 0,
          pourcentageReelle: 0,
        },
      };
    }
  }

  // Nouvelle méthode pour mettre à jour les données réelles d'une affaire
  async updateReel(id: string, updateAffaireReelDto: UpdateAffaireReelDto): Promise<Affaire> {
    const affaire = await this.prisma.affaire.findUnique({
      where: { id },
    });

    if (!affaire) {
      throw new NotFoundException(`Affaire avec ID ${id} non trouvée`);
    }

    return this.prisma.affaire.update({
      where: { id },
      data: updateAffaireReelDto,
    });
  }

  // Méthode pour calculer automatiquement les données réelles à partir des devis validés, BDC réceptionnés et pointages
  // 🚀 NOUVEAU : Calculer les données réelles à partir du planning équipe
  async calculateRealFromPlanning(affaireId: string): Promise<Affaire> {
    const affaire = await this.prisma.affaire.findUnique({
      where: { id: affaireId },
      include: {
        devis: {
          where: { statut: { in: ['VALIDE', 'REALISE'] } }, // Devis validés ET réalisés
        },
        bdc: {
          where: { statut: 'RECEPTIONNE' }, // Seulement les BDC réceptionnés
        },
      },
    });

    if (!affaire) {
      throw new NotFoundException(`Affaire avec ID ${affaireId} non trouvée`);
    }

    // Calculer le CA réel à partir des devis validés ET réalisés
    const caReelHt = affaire.devis.reduce((sum, devis) => sum + devis.montantHt, 0);

    // Calculer l'achat réel à partir des BDC réceptionnés ET validés
    const achatReelHt = affaire.bdc
      .filter(bdc => bdc.statut === 'RECEPTIONNE' || bdc.statut === 'VALIDE')
      .reduce((sum, bdc) => sum + bdc.montantHt, 0);

    // 🚀 NOUVEAU : Calculer les heures réelles à partir du planning équipe
    const planningData = await this.calculatePlanningHours(affaireId);

    // Mettre à jour l'affaire avec les données calculées
    return this.prisma.affaire.update({
      where: { id: affaireId },
      data: {
        caReelHt, // CA réel à partir des devis validés ET réalisés
        achatReelHt, // Achats réels à partir des BDC réceptionnés
        // 🚀 NOUVEAU : Utiliser les heures du planning équipe
        heuresReellesFab: planningData.heuresParType.FAB,
        heuresReellesPose: planningData.heuresParType.POSE,
      },
    });
  }

  // ANCIENNE MÉTHODE : Calculer les données réelles à partir des pointages (DEPRECATED)
  async calculateRealFromData(affaireId: string): Promise<Affaire> {
    const affaire = await this.prisma.affaire.findUnique({
      where: { id: affaireId },
      include: {
        devis: {
          where: { statut: { in: ['VALIDE', 'REALISE'] } }, // Devis validés ET réalisés
        },
        bdc: {
          where: { statut: 'RECEPTIONNE' }, // Seulement les BDC réceptionnés
        },
        pointages: true,
      },
    });

    if (!affaire) {
      throw new NotFoundException(`Affaire avec ID ${affaireId} non trouvée`);
    }

    // Calculer le CA réel à partir des devis validés ET réalisés
    const caReelHt = affaire.devis.reduce((sum, devis) => sum + devis.montantHt, 0);

    // Calculer l'achat réel à partir des BDC réceptionnés ET validés
    const achatReelHt = affaire.bdc
      .filter(bdc => bdc.statut === 'RECEPTIONNE' || bdc.statut === 'VALIDE')
      .reduce((sum, bdc) => sum + bdc.montantHt, 0);

    // Calculer les heures réelles par type
    const heuresReelles = affaire.pointages.reduce(
      (acc, pointage) => {
        switch (pointage.typeHeure) {
          case 'FAB':
            acc.fab += pointage.nbHeures;
            break;
          case 'SER':
            acc.ser += pointage.nbHeures;
            break;
          case 'POSE':
            acc.pose += pointage.nbHeures;
            break;
        }
        return acc;
      },
      { fab: 0, ser: 0, pose: 0 }
    );

    // Mettre à jour l'affaire avec les données calculées
    return this.prisma.affaire.update({
      where: { id: affaireId },
      data: {
        caReelHt, // CA réel à partir des devis validés ET réalisés
        achatReelHt, // Achats réels à partir des BDC réceptionnés
        heuresReellesFab: heuresReelles.fab,
        heuresReellesPose: heuresReelles.pose,
      },
    });
  }

  // Obtenir les statistiques comparatives (Objectif vs Réel) d'une affaire
  async getComparativeStats(affaireId: string): Promise<{
    objectifs: {
      ca: number;
      achat: number;
      heuresFab: number;
      heuresPose: number;
    };
    reels: {
      ca: number;
      achat: number;
      heuresFab: number;
      heuresPose: number;
    };
    ecarts: {
      ca: number;
      achat: number;
      heuresFab: number;
      heuresPose: number;
    };
  }> {
    const affaire = await this.prisma.affaire.findUnique({
      where: { id: affaireId },
    });

    if (!affaire) {
      throw new NotFoundException(`Affaire avec ID ${affaireId} non trouvée`);
    }

    const objectifs = {
      ca: affaire.objectifCaHt,
      achat: affaire.objectifAchatHt,
      heuresFab: affaire.objectifHeuresFab,
      heuresPose: affaire.objectifHeuresPose,
    };

    const reels = {
      ca: affaire.caReelHt,
      achat: affaire.achatReelHt,
      heuresFab: affaire.heuresReellesFab,
      heuresPose: affaire.heuresReellesPose,
    };

    const ecarts = {
      ca: reels.ca - objectifs.ca,
      achat: reels.achat - objectifs.achat,
      heuresFab: reels.heuresFab - objectifs.heuresFab,
      heuresPose: reels.heuresPose - objectifs.heuresPose,
    };

    return {
      objectifs,
      reels,
      ecarts,
    };
  }

  // 🚀 NOUVELLE MÉTHODE : Calculer les heures réelles à partir des affectations du planning
  // 🚀 NOUVEAU : Calculer les frais généraux basés sur les affectations réelles du planning
  // 🔄 CALCUL PAR DEMI-JOURNÉE : Chaque affectation = 1 demi-journée, mutualisation par jour
  async calculateFraisGenerauxFromPlanning(affaireId: string): Promise<number> {
    try {
      // Constantes pour le calcul des frais généraux
      const COUT_FRAIS_GENERAUX_PAR_JOUR = 508.58; // Base jour (2 demi-journées max)
      
      // Récupérer toutes les affectations pour cette affaire
      const affectations = await this.prisma.planningAffectation.findMany({
        where: {
          affaireId,
          statut: 'ACTIVE'
        },
        include: {
          user: {
            select: { id: true, nom: true, prenom: true }
          },
          affaire: {
            select: { id: true, numero: true, libelle: true }
          }
        }
      });

      if (affectations.length === 0) {
        console.log(`⚠️ Aucune affectation trouvée pour l'affaire ${affaireId}`);
        return 0;
      }

             // Grouper les affectations par jour
       const affectationsParJour: { [key: string]: any[] } = {};
       
       for (const affectation of affectations) {
         const jour = affectation.dateAffectation.toISOString().split('T')[0];
         if (!affectationsParJour[jour]) {
           affectationsParJour[jour] = [];
         }
         affectationsParJour[jour].push(affectation);
       }

       // Calculer les frais généraux pour chaque jour
       let totalFraisGeneraux = 0;
       
              for (const [jour, affectationsDuJour] of Object.entries(affectationsParJour)) {
         // Récupérer TOUTES les affectations du jour (toutes affaires confondues)
         const dateDebut = new Date(jour + 'T00:00:00.000Z');
         const dateFin = new Date(jour + 'T23:59:59.999Z');
         
         const toutesAffectationsDuJour = await this.prisma.planningAffectation.findMany({
           where: {
             dateAffectation: {
               gte: dateDebut,
               lte: dateFin
             },
             statut: 'ACTIVE'
           }
         });

        const nbAffectationsTotalDuJour = toutesAffectationsDuJour.length;
                 const nbAffectationsAffaire = affectationsDuJour.length;
        
        if (nbAffectationsTotalDuJour > 0) {
          // 🔄 CALCUL SIMPLE : Chaque demi-journée = 254,29 € fixe (sans mutualisation complexe)
          const COUT_PAR_DEMI_JOURNEE = COUT_FRAIS_GENERAUX_PAR_JOUR / 2; // 254,29 €
          const fraisGenerauxJour = COUT_PAR_DEMI_JOURNEE * nbAffectationsAffaire;
          
          totalFraisGeneraux += fraisGenerauxJour;
          
          console.log(`📅 ${jour} - Demi-journées affaire: ${nbAffectationsAffaire}, Coût fixe: ${COUT_PAR_DEMI_JOURNEE.toFixed(2)}€/demi-journée, Total affaire: ${fraisGenerauxJour.toFixed(2)}€`);
        }
      }

      console.log(`💰 Frais généraux calculés pour l'affaire ${affaireId}: ${totalFraisGeneraux.toFixed(2)}€`);
      return totalFraisGeneraux;
      
    } catch (error) {
      console.error(`❌ Erreur lors du calcul des frais généraux pour l'affaire ${affaireId}:`, error);
      // En cas d'erreur, retourner 0 pour éviter de casser l'application
      return 0;
    }
  }

  async calculatePlanningHours(affaireId: string): Promise<{
    tempsTotalReel: number;
    coutTotalReel: number;
    nbAffectations: number;
    heuresParType: {
      FAB: number;
      POSE: number;
      SER: number;
      AUTRE: number;
    };
    coutParType: {
      FAB: number;
      POSE: number;
      SER: number;
      AUTRE: number;
    };
    detailsOuvriers: Array<{
      ouvrier: { id: string; nom: string; prenom: string; };
      heures: number;
      cout: number;
      typeActivite: string;
    }>;
  }> {
    // Récupérer toutes les affectations du planning pour cette affaire
    const affectations = await this.prisma.planningAffectation.findMany({
      where: { 
        affaireId,
        statut: 'ACTIVE' // Seulement les affectations actives
      },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            tarifHoraireBase: true,
            tarifHoraireCout: true,
            tarifHoraireVente: true
          }
        }
      },
      orderBy: {
        dateAffectation: 'asc'
      }
    });

    // Configuration des heures par période
    const HEURES_PAR_PERIODE = {
      MATIN: 4,
      APREM: 4
    };

    // Initialiser les compteurs
    let tempsTotalReel = 0;
    let coutTotalReel = 0;
    const heuresParType = { FAB: 0, POSE: 0, SER: 0, AUTRE: 0 };
    const coutParType = { FAB: 0, POSE: 0, SER: 0, AUTRE: 0 };
    const detailsOuvriers = [];

    // Traiter chaque affectation
    for (const affectation of affectations) {
      const heures = HEURES_PAR_PERIODE[affectation.periode] || 4;
      const tarifHoraire = affectation.user.tarifHoraireCout || affectation.user.tarifHoraireBase || 0;
      const coutAffectation = heures * tarifHoraire;

      // Ajouter aux totaux
      tempsTotalReel += heures;
      coutTotalReel += coutAffectation;

             // Mapper les types d'activité du planning vers nos catégories
       const typeActiviteOriginal = affectation.typeActivite;
       let typeActiviteMappe: 'FAB' | 'POSE' | 'SER' | 'AUTRE' = 'AUTRE';
       
       // Conversion sécurisée des types d'activité
       if (typeActiviteOriginal) {
         const typeStr = String(typeActiviteOriginal);
         switch (typeStr) {
           case 'FABRICATION':
           case 'FAB':
             typeActiviteMappe = 'FAB';
             break;
           case 'POSE':
             typeActiviteMappe = 'POSE';
             break;
           case 'SERVICE':
           case 'SER':
             typeActiviteMappe = 'SER';
             break;
           default:
             typeActiviteMappe = 'AUTRE';
         }
       }

       // Ajouter aux compteurs par type
       heuresParType[typeActiviteMappe] += heures;
       coutParType[typeActiviteMappe] += coutAffectation;

       // Ajouter aux détails ouvriers
       detailsOuvriers.push({
         ouvrier: {
           id: affectation.user.id,
           nom: affectation.user.nom,
           prenom: affectation.user.prenom
         },
         heures,
         cout: coutAffectation,
         typeActivite: typeActiviteMappe
       });
    }

    return {
      tempsTotalReel,
      coutTotalReel,
      nbAffectations: affectations.length,
      heuresParType,
      coutParType,
      detailsOuvriers
    };
  }

  // Calculer les coûts totaux des phases d'une affaire
  async calculatePhasesTotalCosts(affaireId: string): Promise<{
    coutTotalEstime: number;
    coutTotalReel: number;
    tempsTotalEstime: number;
    tempsTotalReel: number;
    nbPhases: number;
  }> {
    const phases = await this.prisma.phaseChantier.findMany({
      where: { affaireId },
    });

    const coutTotalEstime = phases.reduce((sum, phase) => sum + (phase.coutEstime || 0), 0);
    const coutTotalReel = phases.reduce((sum, phase) => sum + (phase.coutReel || 0), 0);
    const tempsTotalEstime = phases.reduce((sum, phase) => sum + (phase.tempsEstimeH || 0), 0);
    const tempsTotalReel = phases.reduce((sum, phase) => sum + (phase.tempsReelH || 0), 0);

    return {
      coutTotalEstime,
      coutTotalReel,
      tempsTotalEstime,
      tempsTotalReel,
      nbPhases: phases.length,
    };
  }

  // Obtenir la situation financière complète d'une affaire (incluant les phases)
  async getFinancialSituation(affaireId: string): Promise<{
    affaire: Affaire;
    phases: {
      coutTotalEstime: number;
      coutTotalReel: number;
      tempsTotalEstime: number;
      tempsTotalReel: number;
      nbPhases: number;
    };
    // 🚀 NOUVEAU : Données du planning équipe
    planning: {
      tempsTotalReel: number;
      coutTotalReel: number;
      nbAffectations: number;
      heuresParType: {
        FAB: number;
        POSE: number;
        SER: number;
        AUTRE: number;
      };
      coutParType: {
        FAB: number;
        POSE: number;
        SER: number;
        AUTRE: number;
      };
    };
    devis: {
      totalValides: number;
      nbDevisValides: number;
    };
    achats: {
      totalValides: number;
      nbAchatsValides: number;
    };
    bdc: {
      totalReceptionnes: number;
      nbBdcReceptionnes: number;
    };
    fraisGeneraux: {
      montantReel: number;
      montantObjectif: number;
      pourcentage: number;
    };
    marges: {
      margeObjectif: number;
      margeReelle: number;
      pourcentageMargeObjectif: number;
      pourcentageMargeReelle: number;
    };
  }> {
    const affaire = await this.findOne(affaireId);
    const phases = await this.calculatePhasesTotalCosts(affaireId);
    // 🚀 NOUVEAU : Calculer aussi les données du planning
    const planning = await this.calculatePlanningHours(affaireId);

    // Calculer les totaux des devis validés ET réalisés (pour le CA réel)
    const devisValides = await this.prisma.devis.findMany({
      where: { 
        affaireId, 
        statut: { in: ['VALIDE', 'REALISE'] }
      },
    });
    const totalDevisValides = devisValides.reduce((sum, devis) => sum + devis.montantHt, 0);

    // Calculer les totaux des achats validés ET payés
    const achatsValides = await this.prisma.achat.findMany({
      where: { 
        affaireId, 
        statut: { in: ['VALIDE', 'PAYE'] }
      },
    });
    const totalAchatsValides = achatsValides.reduce((sum, achat) => sum + achat.montantHt, 0);

    // Calculer les totaux des BDC réceptionnés ET validés
    const bdcValides = await this.prisma.bdc.findMany({
      where: { 
        affaireId, 
        statut: { in: ['RECEPTIONNE', 'VALIDE'] }
      },
    });
    const totalBdcReceptionnes = bdcValides.reduce((sum, bdc) => sum + bdc.montantHt, 0);

    // 🚀 NOUVEAU : Calculer les frais généraux dynamiquement basés sur les affectations réelles
    const fraisGenerauxReels = await this.calculateFraisGenerauxFromPlanning(affaireId);
    const pourcentageFraisGeneraux = 30; // Gardé pour les objectifs
    const fraisGenerauxObjectifs = affaire.objectifCaHt * (pourcentageFraisGeneraux / 100);

    // 🚀 NOUVEAU : Calculer les marges avec les données du planning équipe au lieu des phases
    // CORRECTION : Les achats réels ne doivent PAS inclure la main d'œuvre
    const totalAchatsReels = totalAchatsValides + totalBdcReceptionnes;
    const totalAchatsObjectifs = affaire.objectifAchatHt; // Objectifs achats sans main d'œuvre

    // Calculer les marges en déduisant les frais généraux, achats ET main d'œuvre du CA
    const margeObjectif = affaire.objectifCaHt - fraisGenerauxObjectifs - totalAchatsObjectifs - 0; // TODO: ajouter objectif main d'œuvre
    const margeReelle = totalDevisValides - fraisGenerauxReels - totalAchatsReels - planning.coutTotalReel;
    const pourcentageMargeObjectif = affaire.objectifCaHt > 0 ? (margeObjectif / affaire.objectifCaHt) * 100 : 0;
    const pourcentageMargeReelle = totalDevisValides > 0 ? (margeReelle / totalDevisValides) * 100 : 0;

    return {
      affaire,
      phases,
      // 🚀 NOUVEAU : Données du planning équipe
      planning: {
        tempsTotalReel: planning.tempsTotalReel,
        coutTotalReel: planning.coutTotalReel,
        nbAffectations: planning.nbAffectations,
        heuresParType: planning.heuresParType,
        coutParType: planning.coutParType,
      },
      devis: {
        totalValides: totalDevisValides,
        nbDevisValides: devisValides.length,
      },
      achats: {
        totalValides: totalAchatsValides,
        nbAchatsValides: achatsValides.length,
      },
      bdc: {
        totalReceptionnes: totalBdcReceptionnes,
        nbBdcReceptionnes: bdcValides.length,
      },
      fraisGeneraux: {
        montantReel: fraisGenerauxReels,
        montantObjectif: fraisGenerauxObjectifs,
        pourcentage: pourcentageFraisGeneraux,
      },
      marges: {
        margeObjectif,
        margeReelle,
        pourcentageMargeObjectif,
        pourcentageMargeReelle,
      },
    };
  }

  // Nouvelle méthode : Comparatif achats estimés vs réels par catégorie
  /*
  async getAchatsParCategorie(affaireId: string) {
    // Vérifier que l'affaire existe
    const affaire = await this.prisma.affaire.findUnique({
      where: { id: affaireId },
    });

    if (!affaire) {
      throw new NotFoundException(`Affaire avec ID ${affaireId} non trouvée`);
    }

    // Récupérer toutes les catégories d'achat
    const categories = await this.prisma.categorieAchat.findMany({
      orderBy: { intitule: 'asc' },
    });

    // Récupérer les estimations par catégorie pour cette affaire
    const estimations = await this.prisma.estimationAchatCategorie.findMany({
      where: { affaireId },
      include: {
        categorie: true,
      },
    });

    // Récupérer les achats réels par catégorie (statut VALIDE)
    const achatsReels = await this.prisma.achat.groupBy({
      by: ['categorieId'],
      where: {
        affaireId,
        statut: 'VALIDE',
        categorieId: { 
          not: null 
        },
      },
      _sum: {
        montantHt: true,
        montantFg: true,
      },
      _count: {
        _all: true,
      },
    });

    // Récupérer les achats réels non affectés (sans catégorie)
    const achatsNonAffectes = await this.prisma.achat.findMany({
      where: {
        affaireId,
        categorieId: { equals: null },
        statut: 'VALIDE',
      },
      orderBy: { dateFacture: 'desc' },
    });

    // Construire le résultat final
    const comparatifParCategorie = categories.map(categorie => {
      // Trouver l'estimation pour cette catégorie
      const estimation = estimations.find((est: any) => est.categorieId === categorie.id);
      const montantEstime = estimation?.montantEstime || 0;

      // Trouver les achats réels pour cette catégorie
      const achatReel = achatsReels.find(achat => achat.categorieId === categorie.id);
      const montantReel = achatReel?._sum?.montantHt || 0;
      const montantFgReel = achatReel?._sum?.montantFg || 0;
      const nombreAchats = achatReel?._count?._all || 0;

      // Calculer l'écart
      const ecart = montantReel - montantEstime;
      const pourcentageRealise = montantEstime > 0 ? (montantReel / montantEstime) * 100 : 0;

      return {
        categorie: {
          id: categorie.id,
          code: categorie.code,
          intitule: categorie.intitule,
          pourcentageFg: categorie.pourcentageFg,
        },
        montantEstime,
        montantReel,
        montantFgReel,
        nombreAchats,
        ecart,
        pourcentageRealise,
      };
    });

    // Calculer les totaux
    const totalEstime = comparatifParCategorie.reduce((sum, item) => sum + item.montantEstime, 0);
    const totalReel = comparatifParCategorie.reduce((sum, item) => sum + item.montantReel, 0);
    const totalFgReel = comparatifParCategorie.reduce((sum, item) => sum + item.montantFgReel, 0);
    const totalNonAffecte = achatsNonAffectes.reduce((sum, achat) => sum + achat.montantHt, 0);

    return {
      affaire: {
        id: affaire.id,
        numero: affaire.numero,
        libelle: affaire.libelle,
        objectifAchatHt: affaire.objectifAchatHt,
      },
      comparatifParCategorie,
      achatsNonAffectes,
      totaux: {
        totalEstime,
        totalReel,
        totalFgReel,
        totalNonAffecte,
        ecartGlobal: totalReel - totalEstime,
        pourcentageGlobalRealise: totalEstime > 0 ? (totalReel / totalEstime) * 100 : 0,
      },
    };
  }

  // Méthode pour mettre à jour les estimations d'achats par catégorie
  async updateEstimationsAchatCategorie(
    affaireId: string,
    estimations: Array<{ categorieId: string; montantEstime: number }>
  ) {
    // Vérifier que l'affaire existe
    const affaire = await this.prisma.affaire.findUnique({
      where: { id: affaireId },
    });

    if (!affaire) {
      throw new NotFoundException(`Affaire avec ID ${affaireId} non trouvée`);
    }

    // Utiliser une transaction pour mettre à jour toutes les estimations
    await this.prisma.$transaction(async (prisma) => {
      for (const estimation of estimations) {
        await prisma.estimationAchatCategorie.upsert({
          where: {
            affaireId_categorieId: {
              affaireId,
              categorieId: estimation.categorieId,
            },
          },
          update: {
            montantEstime: estimation.montantEstime,
          },
          create: {
            affaireId,
            categorieId: estimation.categorieId,
            montantEstime: estimation.montantEstime,
          },
        });
      }
    });

    // Retourner les données mises à jour
    return this.getAchatsParCategorie(affaireId);
  }
  */

  async duplicate(id: string): Promise<Affaire> {
    // Récupérer l'affaire à dupliquer
    const originalAffaire = await this.prisma.affaire.findUnique({
      where: { id },
    });

    if (!originalAffaire) {
      throw new NotFoundException(`Affaire avec ID ${id} non trouvée`);
    }

    try {
      // Générer un nouveau numéro pour l'affaire dupliquée
      const nouveauNumero = await this.generateNumeroAffaire();

      // Créer une copie de l'affaire avec les données de base
      const affaireDupliquee = await this.prisma.affaire.create({
        data: {
          numero: nouveauNumero,
          libelle: `${originalAffaire.libelle} (Copie)`,
          client: originalAffaire.client,
          adresse: originalAffaire.adresse,
          rue: originalAffaire.rue,
          codePostal: originalAffaire.codePostal,
          ville: originalAffaire.ville,
          pays: originalAffaire.pays,
          latitude: originalAffaire.latitude,
          longitude: originalAffaire.longitude,
          dateCommencement: originalAffaire.dateCommencement,
          dateCloturePrevue: originalAffaire.dateCloturePrevue,
          objectifCaHt: originalAffaire.objectifCaHt,
          objectifAchatHt: originalAffaire.objectifAchatHt,
          objectifHeuresFab: originalAffaire.objectifHeuresFab,
          objectifHeuresSer: originalAffaire.objectifHeuresSer,
          objectifHeuresPose: originalAffaire.objectifHeuresPose,
          objectifFraisGeneraux: originalAffaire.objectifFraisGeneraux,
          statut: 'PLANIFIEE', // Nouvelle affaire commence toujours en statut PLANIFIEE
          // Les champs calculés ne sont pas copiés (caReelHt, heuresReellesFab, etc.)
        },
      });

      return affaireDupliquee;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Erreur lors de la génération du numéro d\'affaire');
        }
      }
      throw error;
    }
  }
} 