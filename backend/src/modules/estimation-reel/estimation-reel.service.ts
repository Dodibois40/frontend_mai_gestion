import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEstimationDto, UpdateEstimationDto } from './dto/create-estimation.dto';
import { CreateComparaisonDto } from './dto/create-comparaison.dto';

@Injectable()
export class EstimationReelService {
  constructor(private prisma: PrismaService) {}

  /**
   * Convertit une date string en format ISO DateTime pour Prisma
   */
  private convertToISODateTime(dateValue: any): Date | string | null {
    if (!dateValue) return null;
    
    // Si c'est déjà une Date, la retourner
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // Si c'est déjà au format ISO complet, le retourner
    if (typeof dateValue === 'string' && dateValue.includes('T')) {
      return dateValue;
    }
    
    // Si c'est une date au format YYYY-MM-DD, ajouter l'heure
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(dateValue + 'T00:00:00.000Z');
    }
    
    // Essayer de parser la date
    try {
      const parsedDate = new Date(dateValue);
      if (isNaN(parsedDate.getTime())) {
        return null;
      }
      return parsedDate;
    } catch (error) {
      console.warn('Impossible de parser la date:', dateValue);
      return null;
    }
  }

  /**
   * Mappage des champs frontend vers les champs Prisma
   */
  private mapEstimationData(data: any) {
    const mappedData: any = {};
    
    // Mapper les champs principaux
    if (data.montantDevis !== undefined) mappedData.montantTotalEstime = data.montantDevis;
    if (data.montantTotalEstime !== undefined) mappedData.montantTotalEstime = data.montantTotalEstime;
    
    if (data.totalDemiJournees !== undefined) mappedData.dureeTotaleEstimee = data.totalDemiJournees;
    if (data.dureeTotaleEstimee !== undefined) mappedData.dureeTotaleEstimee = data.dureeTotaleEstimee;
    
    if (data.montantMainOeuvre !== undefined) mappedData.coutMainOeuvreEstime = data.montantMainOeuvre;
    if (data.coutMainOeuvreEstime !== undefined) mappedData.coutMainOeuvreEstime = data.coutMainOeuvreEstime;
    
    if (data.montantAchats !== undefined) mappedData.coutAchatsEstime = data.montantAchats;
    if (data.coutAchatsEstime !== undefined) mappedData.coutAchatsEstime = data.coutAchatsEstime;
    
    if (data.montantFraisGeneraux !== undefined) mappedData.coutFraisGenerauxEstime = data.montantFraisGeneraux;
    if (data.coutFraisGenerauxEstime !== undefined) mappedData.coutFraisGenerauxEstime = data.coutFraisGenerauxEstime;
    
    if (data.montantMarge !== undefined) mappedData.margeEstimee = data.montantMarge;
    if (data.margeEstimee !== undefined) mappedData.margeEstimee = data.margeEstimee;
    
    if (data.demiJourneesFabrication !== undefined) mappedData.demiJourneesFabricationEstimees = data.demiJourneesFabrication;
    if (data.demiJourneesFabricationEstimees !== undefined) mappedData.demiJourneesFabricationEstimees = data.demiJourneesFabricationEstimees;
    
    if (data.demiJourneesPose !== undefined) mappedData.demiJourneesPoseEstimees = data.demiJourneesPose;
    if (data.demiJourneesPoseEstimees !== undefined) mappedData.demiJourneesPoseEstimees = data.demiJourneesPoseEstimees;
    
    if (data.nombrePersonnes !== undefined) mappedData.nombrePersonnesEstime = data.nombrePersonnes;
    if (data.nombrePersonnesEstime !== undefined) mappedData.nombrePersonnesEstime = data.nombrePersonnesEstime;
    
    if (data.tauxHoraire !== undefined) mappedData.tauxHoraireMoyenEstime = data.tauxHoraire;
    if (data.tauxHoraireMoyenEstime !== undefined) mappedData.tauxHoraireMoyenEstime = data.tauxHoraireMoyenEstime;
    
    // Mapper les dates - conversion en ISO DateTime
    if (data.dateDebut !== undefined) {
      const convertedDate = this.convertToISODateTime(data.dateDebut);
      if (convertedDate) mappedData.dateCommencementEstimee = convertedDate;
    }
    if (data.dateCommencement !== undefined) {
      const convertedDate = this.convertToISODateTime(data.dateCommencement);
      if (convertedDate) mappedData.dateCommencementEstimee = convertedDate;
    }
    if (data.dateCommencementEstimee !== undefined) {
      const convertedDate = this.convertToISODateTime(data.dateCommencementEstimee);
      if (convertedDate) mappedData.dateCommencementEstimee = convertedDate;
    }
    
    if (data.dateFin !== undefined) {
      const convertedDate = this.convertToISODateTime(data.dateFin);
      if (convertedDate) mappedData.dateReceptionEstimee = convertedDate;
    }
    if (data.dateReception !== undefined) {
      const convertedDate = this.convertToISODateTime(data.dateReception);
      if (convertedDate) mappedData.dateReceptionEstimee = convertedDate;
    }
    if (data.dateReceptionEstimee !== undefined) {
      const convertedDate = this.convertToISODateTime(data.dateReceptionEstimee);
      if (convertedDate) mappedData.dateReceptionEstimee = convertedDate;
    }
    
    // Mapper les autres champs standards
    if (data.version !== undefined) mappedData.version = data.version;
    if (data.statut !== undefined) mappedData.statut = data.statut;
    if (data.validePar !== undefined && data.validePar !== null) mappedData.validePar = data.validePar;
    if (data.commentaire !== undefined && data.commentaire !== null) mappedData.commentaire = data.commentaire;
    
    // 🔧 CORRECTION : Gérer les données étendues des blocs
    const donneesEtendues: any = {};
    
    // Propriétés spécifiques au BlocAchats
    if (data.categoriesAchats !== undefined) donneesEtendues.categoriesAchats = data.categoriesAchats;
    if (data.repartitionAchats !== undefined) donneesEtendues.repartitionAchats = data.repartitionAchats;
    
    // Propriétés spécifiques au BlocEquipe
    if (data.repartitionFabrication !== undefined) donneesEtendues.repartitionFabrication = data.repartitionFabrication;
    if (data.repartitionPose !== undefined) donneesEtendues.repartitionPose = data.repartitionPose;
    
    // Autres propriétés étendues
    if (data.couleurPastel !== undefined) donneesEtendues.couleurPastel = data.couleurPastel;
    if (data.couleurBordure !== undefined) donneesEtendues.couleurBordure = data.couleurBordure;
    if (data.affaireNumero !== undefined) donneesEtendues.affaireNumero = data.affaireNumero;
    if (data.affaireClient !== undefined) donneesEtendues.affaireClient = data.affaireClient;
    
    // Sérialiser les données étendues si elles existent
    if (Object.keys(donneesEtendues).length > 0) {
      mappedData.donneesEtendues = JSON.stringify(donneesEtendues);
    }
    
    // Nettoyer les valeurs undefined/null pour éviter les erreurs Prisma
    Object.keys(mappedData).forEach(key => {
      if (mappedData[key] === undefined || mappedData[key] === null) {
        delete mappedData[key];
      }
    });
    
    return mappedData;
  }

  /**
   * 🔧 CORRECTION : Désérialiser les données étendues d'une estimation
   */
  private deserializeEstimation(estimation: any) {
    if (!estimation) return estimation;

    // Créer une copie de l'estimation
    const estimationAvecDonneesEtendues = { ...estimation };

    // Désérialiser les données étendues si elles existent
    if (estimation.donneesEtendues) {
      try {
        const donneesEtendues = JSON.parse(estimation.donneesEtendues);
        
        // Ajouter les propriétés étendues à l'objet principal
        Object.keys(donneesEtendues).forEach(key => {
          estimationAvecDonneesEtendues[key] = donneesEtendues[key];
        });
        
        // Supprimer le champ JSON pour éviter la confusion
        delete estimationAvecDonneesEtendues.donneesEtendues;
      } catch (error) {
        console.warn('Erreur lors de la désérialisation des données étendues:', error);
      }
    }

    return estimationAvecDonneesEtendues;
  }

  /**
   * Créer une nouvelle estimation
   */
  async createEstimation(createEstimationDto: CreateEstimationDto) {
    const { affaireId, details, ...estimationData } = createEstimationDto;

    // Vérifier que l'affaire existe
    const affaire = await this.prisma.affaire.findUnique({
      where: { id: affaireId },
    });

    if (!affaire) {
      throw new NotFoundException(`Affaire avec ID ${affaireId} non trouvée`);
    }

    // Mapper les données d'estimation
    const mappedEstimationData = this.mapEstimationData(estimationData);

    // Créer l'estimation avec ses détails
    const estimation = await this.prisma.estimationAffaire.create({
      data: {
        ...mappedEstimationData,
        affaireId,
        details: {
          create: details || [],
        },
      },
      include: {
        details: {
          orderBy: { ordre: 'asc' },
        },
        affaire: {
          select: {
            numero: true,
            libelle: true,
            client: true,
          },
        },
      },
    });

    // 🔧 CORRECTION : Désérialiser les données étendues
    return this.deserializeEstimation(estimation);
  }

  /**
   * Récupérer toutes les estimations d'une affaire
   */
  async getEstimationsByAffaire(affaireId: string) {
    const estimations = await this.prisma.estimationAffaire.findMany({
      where: { affaireId },
      include: {
        details: {
          orderBy: { ordre: 'asc' },
        },
        validateur: {
          select: {
            nom: true,
            prenom: true,
          },
        },
      },
      orderBy: { version: 'desc' },
    });

    // 🔧 CORRECTION : Désérialiser les données étendues pour chaque estimation
    return estimations.map(estimation => this.deserializeEstimation(estimation));
  }

  /**
   * Récupérer une estimation par son ID
   */
  async getEstimationById(id: string) {
    const estimation = await this.prisma.estimationAffaire.findUnique({
      where: { id },
      include: {
        details: {
          orderBy: { ordre: 'asc' },
        },
        affaire: {
          select: {
            numero: true,
            libelle: true,
            client: true,
          },
        },
        validateur: {
          select: {
            nom: true,
            prenom: true,
          },
        },
      },
    });

    if (!estimation) {
      throw new NotFoundException(`Estimation avec ID ${id} non trouvée`);
    }

    // 🔧 CORRECTION : Désérialiser les données étendues
    return this.deserializeEstimation(estimation);
  }

  /**
   * Mettre à jour une estimation
   */
  async updateEstimation(id: string, updateEstimationDto: UpdateEstimationDto) {
    const { details, ...estimationData } = updateEstimationDto;

    // Vérifier que l'estimation existe
    const existingEstimation = await this.prisma.estimationAffaire.findUnique({
      where: { id },
    });

    if (!existingEstimation) {
      throw new NotFoundException(`Estimation avec ID ${id} non trouvée`);
    }

    // Mapper les données d'estimation
    const mappedEstimationData = this.mapEstimationData(estimationData);

    // Mise à jour dans une transaction
    const estimation = await this.prisma.$transaction(async (prisma) => {
      // Mettre à jour l'estimation
      const updatedEstimation = await prisma.estimationAffaire.update({
        where: { id },
        data: mappedEstimationData,
      });

      // Mettre à jour les détails si fournis
      if (details) {
        // Supprimer les anciens détails
        await prisma.estimationDetail.deleteMany({
          where: { estimationId: id },
        });

        // Créer les nouveaux détails
        await prisma.estimationDetail.createMany({
          data: details.map((detail) => ({
            ...detail,
            estimationId: id,
          })),
        });
      }

      return updatedEstimation;
    });

    return this.getEstimationById(id);
  }

  /**
   * Valider une estimation
   */
  async validerEstimation(id: string, validePar: string) {
    const estimation = await this.prisma.estimationAffaire.update({
      where: { id },
      data: {
        statut: 'VALIDEE',
        dateValidation: new Date(),
        validePar,
      },
    });

    return estimation;
  }

  // ===== GESTION DES COMPARAISONS =====

  /**
   * Créer une nouvelle comparaison estimation vs réel
   */
  async createComparaison(createComparaisonDto: CreateComparaisonDto) {
    const { affaireId, estimationId, calculePar } = createComparaisonDto;

    // Calculer les données réelles
    const donneesReelles = await this.calculerDonneesReelles(affaireId);

    // Récupérer l'estimation pour le calcul des écarts
    const estimation = await this.getEstimationById(estimationId);

    // Calculer les écarts
    const ecarts = this.calculerEcarts(estimation, donneesReelles);

    // Créer la comparaison
    const comparaison = await this.prisma.comparaisonEstimationReel.create({
      data: {
        affaireId,
        estimationId,
        calculePar,
        typeComparaison: createComparaisonDto.typeComparaison || 'SNAPSHOT',
        ...donneesReelles,
        ...ecarts,
        donneesCalcul: JSON.stringify({
          dateCalcul: new Date(),
          sourcesDonnees: {
            pointages: true,
            achats: true,
            fraisGeneraux: true,
            planning: true,
          },
        }),
      },
      include: {
        estimation: {
          select: {
            version: true,
            statut: true,
          },
        },
        affaire: {
          select: {
            numero: true,
            libelle: true,
            client: true,
          },
        },
      },
    });

    return comparaison;
  }

  /**
   * Calculer les données réelles d'une affaire
   */
  private async calculerDonneesReelles(affaireId: string) {
    // Récupérer les pointages
    const pointages = await this.prisma.pointage.findMany({
      where: { affaireId },
      include: {
        user: {
          select: {
            tarifHoraireCout: true,
            tarifHoraireVente: true,
          },
        },
      },
    });

    // Récupérer les achats
    const achats = await this.prisma.achat.findMany({
      where: { affaireId },
    });

    // Récupérer les affectations planning
    const affectations = await this.prisma.planningAffectation.findMany({
      where: { affaireId },
      include: {
        user: {
          select: {
            tarifHoraireCout: true,
            tarifHoraireVente: true,
          },
        },
      },
    });

    // Calculer les demi-journées par type
    const demiJourneesFab = affectations.filter(
      (a) => a.typeActivite === 'FABRICATION'
    ).length;
    const demiJourneesPose = affectations.filter(
      (a) => a.typeActivite === 'POSE'
    ).length;
    const dureeTotaleReelle = demiJourneesFab + demiJourneesPose;

    // Calculer les coûts
    const coutMainOeuvreReel = pointages.reduce(
      (total, pointage) => total + pointage.nbHeures * (pointage.user.tarifHoraireCout || 0),
      0
    );

    const coutAchatsReel = achats.reduce(
      (total, achat) => total + achat.montantHt,
      0
    );

    // Calculer les frais généraux (utiliser le service existant)
    const coutFraisGenerauxReel = await this.calculerFraisGenerauxReel(affaireId);

    // Calculer la marge
    const montantReelCalcule = coutMainOeuvreReel + coutAchatsReel + coutFraisGenerauxReel;
    const margeReelle = 0; // À calculer selon la logique métier

    // Calculer les moyennes
    const nombrePersonnesReel = new Set(affectations.map((a) => a.userId)).size;
    const tauxHoraireMoyenReel = nombrePersonnesReel > 0 
      ? affectations.reduce((total, a) => total + (a.user.tarifHoraireCout || 0), 0) / nombrePersonnesReel
      : 0;

    // Récupérer les dates réelles
    const dateCommencementReelle = affectations.length > 0 
      ? new Date(Math.min(...affectations.map((a) => a.dateAffectation.getTime())))
      : null;

    const dateReceptionReelle = affectations.length > 0
      ? new Date(Math.max(...affectations.map((a) => a.dateAffectation.getTime())))
      : null;

    return {
      montantReelCalcule,
      dureeTotaleReelle,
      coutMainOeuvreReel,
      coutAchatsReel,
      coutFraisGenerauxReel,
      margeReelle,
      demiJourneesFabricationReelles: demiJourneesFab,
      demiJourneesPoseReelles: demiJourneesPose,
      nombrePersonnesReel,
      tauxHoraireMoyenReel,
      dateCommencementReelle,
      dateReceptionReelle,
    };
  }

  /**
   * Calculer les frais généraux réels pour une affaire
   */
  private async calculerFraisGenerauxReel(affaireId: string): Promise<number> {
    // Utiliser la logique existante du service frais généraux
    const affectations = await this.prisma.planningAffectation.findMany({
      where: { affaireId },
    });

    const totalDemiJournees = affectations.length;
    const coutFixeParDemiJournee = 508.58; // Valeur configurée

    return totalDemiJournees * coutFixeParDemiJournee;
  }

  /**
   * Calculer les écarts entre estimation et réel
   */
  private calculerEcarts(estimation: any, donneesReelles: any) {
    const calculerEcartPourcentage = (estime: number, reel: number) => {
      if (estime === 0) return reel === 0 ? 0 : 100;
      return ((reel - estime) / estime) * 100;
    };

    return {
      ecartMontantPourcentage: calculerEcartPourcentage(
        estimation.montantTotalEstime,
        donneesReelles.montantReelCalcule
      ),
      ecartDureePourcentage: calculerEcartPourcentage(
        estimation.dureeTotaleEstimee,
        donneesReelles.dureeTotaleReelle
      ),
      ecartMainOeuvrePourcentage: calculerEcartPourcentage(
        estimation.coutMainOeuvreEstime,
        donneesReelles.coutMainOeuvreReel
      ),
      ecartAchatsPourcentage: calculerEcartPourcentage(
        estimation.coutAchatsEstime,
        donneesReelles.coutAchatsReel
      ),
      ecartFraisGenerauxPourcentage: calculerEcartPourcentage(
        estimation.coutFraisGenerauxEstime,
        donneesReelles.coutFraisGenerauxReel
      ),
      ecartMargePourcentage: calculerEcartPourcentage(
        estimation.margeEstimee,
        donneesReelles.margeReelle
      ),
    };
  }

  /**
   * Récupérer les comparaisons d'une affaire
   */
  async getComparaisonsByAffaire(affaireId: string) {
    return this.prisma.comparaisonEstimationReel.findMany({
      where: { affaireId },
      include: {
        estimation: {
          select: {
            version: true,
            statut: true,
          },
        },
        calculateur: {
          select: {
            nom: true,
            prenom: true,
          },
        },
      },
      orderBy: { dateComparaison: 'desc' },
    });
  }

  /**
   * Récupérer une comparaison par son ID
   */
  async getComparaisonById(id: string) {
    const comparaison = await this.prisma.comparaisonEstimationReel.findUnique({
      where: { id },
      include: {
        estimation: true,
        affaire: {
          select: {
            numero: true,
            libelle: true,
            client: true,
          },
        },
        calculateur: {
          select: {
            nom: true,
            prenom: true,
          },
        },
        ecartsDetail: {
          orderBy: { ordre: 'asc' },
        },
      },
    });

    if (!comparaison) {
      throw new NotFoundException(`Comparaison avec ID ${id} non trouvée`);
    }

    return comparaison;
  }

  /**
   * Supprimer une estimation
   */
  async deleteEstimation(id: string) {
    const estimation = await this.prisma.estimationAffaire.findUnique({
      where: { id },
    });

    if (!estimation) {
      throw new NotFoundException(`Estimation avec ID ${id} non trouvée`);
    }

    await this.prisma.estimationAffaire.delete({
      where: { id },
    });

    return { message: 'Estimation supprimée avec succès' };
  }
} 