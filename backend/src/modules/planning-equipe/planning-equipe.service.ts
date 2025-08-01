import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAffectationDto, UpdateAffectationDto, ModifierActiviteDto, PlanningHebdoDto } from './dto/affectation.dto';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Injectable()
export class PlanningEquipeService {
  constructor(private prisma: PrismaService) {}

  // 🚀 NOUVEAU: Récupérer TOUTES les affectations d'une affaire spécifique
  async getAllAffectationsAffaire(affaireId: string, inclureTerminees = false) {
    try {
      console.log(`🔄 [PlanningEquipe] Récupération TOUTES affectations pour affaire ${affaireId}`);
      
      // Récupérer toutes les affectations de l'affaire
      const affectations = await this.prisma.planningAffectation.findMany({
        where: {
          affaireId,
          ...(inclureTerminees ? {} : { statut: { not: 'TERMINEE' } })
        },
        include: {
          user: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              role: true,
              couleurPlanning: true,
              tarifHoraireCout: true,
              tarifHoraireVente: true
            }
          },
          affaire: {
            select: {
              id: true,
              numero: true,
              libelle: true,
              client: true
            }
          }
        },
        orderBy: [
          { dateAffectation: 'asc' },
          { periode: 'asc' }
        ]
      });

      console.log(`✅ [PlanningEquipe] ${affectations.length} affectations trouvées pour l'affaire ${affaireId}`);

      // Grouper par date pour faciliter l'affichage
      const affectationsParDate: { [key: string]: any[] } = {};
      const statsParMois: { [key: string]: any } = {};
      
      for (const affectation of affectations) {
        const dateStr = affectation.dateAffectation.toISOString().split('T')[0];
        const moisStr = dateStr.substring(0, 7); // YYYY-MM
        
        if (!affectationsParDate[dateStr]) {
          affectationsParDate[dateStr] = [];
        }
        affectationsParDate[dateStr].push(affectation);
        
        // Statistiques par mois
        if (!statsParMois[moisStr]) {
          statsParMois[moisStr] = {
            mois: moisStr,
            nbAffectations: 0,
            nbJours: new Set(),
            nbOuvriers: new Set()
          };
        }
        statsParMois[moisStr].nbAffectations++;
        statsParMois[moisStr].nbJours.add(dateStr);
        statsParMois[moisStr].nbOuvriers.add(affectation.userId);
      }

      // Convertir les Sets en nombres
      Object.values(statsParMois).forEach((stats: any) => {
        stats.nbJours = stats.nbJours.size;
        stats.nbOuvriers = stats.nbOuvriers.size;
      });

      return {
        affectations,
        affectationsParDate,
        statsParMois: Object.values(statsParMois),
        totaux: {
          nbAffectations: affectations.length,
          nbJours: Object.keys(affectationsParDate).length,
          nbOuvriers: new Set(affectations.map(a => a.userId)).size,
          dateDebut: affectations.length > 0 ? affectations[0].dateAffectation : null,
          dateFin: affectations.length > 0 ? affectations[affectations.length - 1].dateAffectation : null
        }
      };

    } catch (error) {
      console.error(`❌ [PlanningEquipe] Erreur récupération affectations affaire ${affaireId}:`, error);
      throw new BadRequestException(`Erreur lors de la récupération des affectations: ${error.message}`);
    }
  }

  // Récupérer le planning hebdomadaire
  async getPlanningHebdomadaire(planningHebdoDto: PlanningHebdoDto) {
    const { dateDebut, inclureTerminees = false } = planningHebdoDto;
    
    const startDate = startOfWeek(new Date(dateDebut), { weekStartsOn: 1 });
    const endDate = endOfWeek(new Date(dateDebut), { weekStartsOn: 1 });

    try {
      // Récupérer toutes les affectations pour la semaine
      const affectations = await this.prisma.planningAffectation.findMany({
        where: {
          dateAffectation: {
            gte: startDate,
            lte: endDate
          },
          statut: inclureTerminees ? undefined : 'ACTIVE'
        },
        include: {
          user: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              role: true,
              couleurPlanning: true,
              disponiblePlanning: true
            }
          },
          affaire: {
            select: {
              id: true,
              numero: true,
              libelle: true,
              client: true,
              statut: true,
              dateCommencement: true,
              dateCloturePrevue: true
            }
          }
        },
        orderBy: {
          ordreAffichage: 'asc'
        }
      });

      // Formater les données pour le frontend
      return affectations.map(affectation => ({
        id: affectation.id,
        dateAffectation: affectation.dateAffectation,
        periode: affectation.periode,
        typeActivite: affectation.typeActivite,
        statut: affectation.statut,
        commentaire: affectation.commentaire,
        couleurPersonne: affectation.couleurPersonne || affectation.user.couleurPlanning,
        ordreAffichage: affectation.ordreAffichage,
        user: {
          id: affectation.user.id,
          nom: affectation.user.nom,
          prenom: affectation.user.prenom,
          role: affectation.user.role,
          couleurPlanning: affectation.user.couleurPlanning,
          disponible: affectation.user.disponiblePlanning
        },
        affaire: {
          id: affectation.affaire.id,
          numero: affectation.affaire.numero,
          libelle: affectation.affaire.libelle,
          client: affectation.affaire.client,
          statut: affectation.affaire.statut,
          dateCommencement: affectation.affaire.dateCommencement,
          dateCloturePrevue: affectation.affaire.dateCloturePrevue
        }
      }));
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la récupération du planning: ${error.message}`);
    }
  }

  // Récupérer les ouvriers disponibles
  async getOuvriersDisponibles() {
    try {
      const ouvriers = await this.prisma.user.findMany({
        where: {
          actif: true,
          supprime: false,
          disponiblePlanning: true
        },
        select: {
          id: true,
          nom: true,
          prenom: true,
          role: true,
          statutContractuel: true,
          couleurPlanning: true,
          tarifHoraireBase: true,
          tarifHoraireCout: true,
          tarifHoraireVente: true,
          dateEmbauche: true,
          telephone: true,
          specialitePoseur: true,
          specialiteFabriquant: true,
          specialiteDessinateur: true,
          specialiteChargeAffaire: true
        },
        orderBy: [
          { role: 'asc' },
          { nom: 'asc' }
        ]
      });

      // Grouper par statut contractuel avec gestion des cas non définis
      const salaries = ouvriers.filter(o => {
        // Si statutContractuel n'est pas défini, considérer comme salarié par défaut
        // sauf si le rôle indique clairement un sous-traitant
        if (!o.statutContractuel) {
          return true; // Par défaut, considérer comme salarié
        }
        return o.statutContractuel === 'SALARIE';
      });

      const sousTraitants = ouvriers.filter(o => {
        // Seuls les utilisateurs explicitement marqués comme sous-traitants
        return o.statutContractuel === 'SOUS_TRAITANT';
      });

      return {
        salaries,
        sousTraitants,
        total: ouvriers.length
      };
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la récupération des ouvriers: ${error.message}`);
    }
  }

  // Récupérer les affaires actives pour affectation
  async getAffairesActives() {
    try {
      const affaires = await this.prisma.affaire.findMany({
        where: {
          statut: {
            in: ['PLANIFIEE', 'EN_COURS']
          }
        },
        select: {
          id: true,
          numero: true,
          libelle: true,
          client: true,
          statut: true,
          dateCommencement: true,
          dateCloturePrevue: true,
          adresse: true,
          ville: true
        },
        orderBy: {
          dateCreation: 'desc'
        }
      });

      return affaires;
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la récupération des affaires: ${error.message}`);
    }
  }

  // Affecter un ouvrier au planning
  async affecterOuvrier(createAffectationDto: CreateAffectationDto) {
    const { affaireId, userId, dateAffectation, periode, typeActivite, commentaire, couleurPersonne, ordreAffichage } = createAffectationDto;

    try {
      // Vérifier que l'affaire existe
      const affaire = await this.prisma.affaire.findUnique({
        where: { id: affaireId }
      });
      if (!affaire) {
        throw new NotFoundException('Affaire non trouvée');
      }

      // Vérifier que l'utilisateur existe et est disponible
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }
      if (!user.disponiblePlanning) {
        throw new BadRequestException('Cet utilisateur n\'est pas disponible pour le planning');
      }

      // Vérifier si l'affectation existe déjà (même affaire, même période)
      const affectationExistante = await this.prisma.planningAffectation.findFirst({
        where: {
          userId: userId,
          dateAffectation: new Date(dateAffectation),
          periode: periode,
          affaireId: affaireId,
          statut: 'ACTIVE'
        }
      });

      if (affectationExistante) {
        throw new ConflictException('Cet ouvrier est déjà affecté à cette affaire pour cette période');
      }

      // Vérifier les conflits (un ouvrier ne peut pas être sur 2 affaires différentes en même temps)
      const conflitAffectation = await this.prisma.planningAffectation.findFirst({
        where: {
          userId: userId,
          dateAffectation: new Date(dateAffectation),
          periode: periode,
          statut: 'ACTIVE',
          affaireId: {
            not: affaireId // Différente affaire
          }
        }
      });

      if (conflitAffectation) {
        throw new ConflictException('Cet ouvrier est déjà affecté à une autre affaire pour cette période');
      }

      // Créer l'affectation
      const affectation = await this.prisma.planningAffectation.create({
        data: {
          affaireId,
          userId,
          dateAffectation: new Date(dateAffectation),
          periode,
          typeActivite,
          commentaire,
          couleurPersonne,
          ordreAffichage: ordreAffichage || 1
        },
        include: {
          user: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              role: true,
              couleurPlanning: true
            }
          },
          affaire: {
            select: {
              id: true,
              numero: true,
              libelle: true,
              client: true
            }
          }
        }
      });

      return affectation;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Erreur lors de l'affectation: ${error.message}`);
    }
  }

  // Modifier le type d'activité d'une affectation
  async modifierTypeActivite(affectationId: string, modifierActiviteDto: ModifierActiviteDto) {
    const { typeActivite } = modifierActiviteDto;

    try {
      const affectation = await this.prisma.planningAffectation.findUnique({
        where: { id: affectationId }
      });

      if (!affectation) {
        throw new NotFoundException('Affectation non trouvée');
      }

      const affectationModifiee = await this.prisma.planningAffectation.update({
        where: { id: affectationId },
        data: {
          typeActivite,
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              role: true,
              couleurPlanning: true
            }
          },
          affaire: {
            select: {
              id: true,
              numero: true,
              libelle: true,
              client: true
            }
          }
        }
      });

      return affectationModifiee;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Erreur lors de la modification: ${error.message}`);
    }
  }

  // Désaffecter un ouvrier
  async desaffecterOuvrier(affectationId: string) {
    try {
      const affectation = await this.prisma.planningAffectation.findUnique({
        where: { id: affectationId }
      });

      if (!affectation) {
        throw new NotFoundException('Affectation non trouvée');
      }

      await this.prisma.planningAffectation.delete({
        where: { id: affectationId }
      });

      return { message: 'Affectation supprimée avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  // Mettre à jour une affectation
  async updateAffectation(affectationId: string, updateAffectationDto: UpdateAffectationDto) {
    try {
      const affectation = await this.prisma.planningAffectation.findUnique({
        where: { id: affectationId }
      });

      if (!affectation) {
        throw new NotFoundException('Affectation non trouvée');
      }

      const affectationModifiee = await this.prisma.planningAffectation.update({
        where: { id: affectationId },
        data: {
          ...updateAffectationDto,
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              role: true,
              couleurPlanning: true
            }
          },
          affaire: {
            select: {
              id: true,
              numero: true,
              libelle: true,
              client: true
            }
          }
        }
      });

      return affectationModifiee;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  // Obtenir les statistiques du planning
  async getStatistiquesPlanning(dateDebut: string) {
    const startDate = startOfWeek(new Date(dateDebut), { weekStartsOn: 1 });
    const endDate = endOfWeek(new Date(dateDebut), { weekStartsOn: 1 });

    try {
      const [totalAffectations, affectationsActives, affectationsTerminees, nombreOuvriers] = await Promise.all([
        this.prisma.planningAffectation.count({
          where: {
            dateAffectation: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        this.prisma.planningAffectation.count({
          where: {
            dateAffectation: {
              gte: startDate,
              lte: endDate
            },
            statut: 'ACTIVE'
          }
        }),
        this.prisma.planningAffectation.count({
          where: {
            dateAffectation: {
              gte: startDate,
              lte: endDate
            },
            statut: 'TERMINEE'
          }
        }),
        this.prisma.user.count({
          where: {
            role: {
              in: ['OUVRIER_CHANTIER', 'OUVRIER_ATELIER']
            },
            actif: true,
            supprime: false,
            disponiblePlanning: true
          }
        })
      ]);

      return {
        totalAffectations,
        affectationsActives,
        affectationsTerminees,
        nombreOuvriers,
        tauxOccupation: nombreOuvriers > 0 ? Math.round((affectationsActives / (nombreOuvriers * 10)) * 100) : 0 // 10 créneaux par semaine
      };
    } catch (error) {
      throw new BadRequestException(`Erreur lors du calcul des statistiques: ${error.message}`);
    }
  }

  // 🚨 NOUVELLE MÉTHODE : Supprimer TOUTES les affectations du planning
  async supprimerToutesLesAffectations() {
    try {
      console.log('🗑️ [DANGER] Suppression de TOUTES les affectations du planning...');
      
      // Compter les affectations avant suppression
      const totalAvant = await this.prisma.planningAffectation.count();
      console.log(`📊 Total d'affectations à supprimer: ${totalAvant}`);
      
      // Supprimer toutes les affectations
      const resultat = await this.prisma.planningAffectation.deleteMany({});
      
      console.log(`✅ ${resultat.count} affectations supprimées avec succès`);
      
      return {
        success: true,
        message: `Toutes les affectations ont été supprimées (${resultat.count} affectations)`,
        affectationsSupprimees: resultat.count
      };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression des affectations:', error);
      throw new BadRequestException(`Erreur lors de la suppression des affectations: ${error.message}`);
    }
  }

  // 🚨 NOUVELLE MÉTHODE : Supprimer les affectations d'une affaire spécifique
  async supprimerAffectationsAffaire(affaireId: string) {
    try {
      console.log(`🗑️ [DANGER] Suppression des affectations pour l'affaire ${affaireId}...`);
      
      // Compter les affectations avant suppression
      const totalAvant = await this.prisma.planningAffectation.count({
        where: { affaireId }
      });
      console.log(`📊 Total d'affectations à supprimer pour cette affaire: ${totalAvant}`);
      
      // Supprimer les affectations de cette affaire
      const resultat = await this.prisma.planningAffectation.deleteMany({
        where: { affaireId }
      });
      
      console.log(`✅ ${resultat.count} affectations supprimées avec succès pour l'affaire ${affaireId}`);
      
      return {
        success: true,
        message: `Affectations supprimées pour l'affaire (${resultat.count} affectations)`,
        affectationsSupprimees: resultat.count
      };
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression des affectations pour l'affaire ${affaireId}:`, error);
      throw new BadRequestException(`Erreur lors de la suppression des affectations: ${error.message}`);
    }
  }

  // Nouvelle méthode : Récupérer l'historique complet des affectations d'un ouvrier sur une affaire
  async getAffectationsHistoriqueOuvrierAffaire(userId: string, affaireId: string): Promise<{
    totalAffectations: number;
    totalHeures: number;
    totalCoutMainOeuvre: number;
    totalVenteMainOeuvre: number;
    totalFraisGeneraux: number;
    premiereAffectation: Date | null;
    derniereAffectation: Date | null;
    semaines: Array<{
      semaine: number;
      annee: number;
      nbAffectations: number;
      heures: number;
      cout: number;
      vente: number;
      fraisGeneraux: number;
    }>;
  }> {
    try {
      // Récupérer TOUTES les affectations de cet ouvrier sur cette affaire
      const affectations = await this.prisma.planningAffectation.findMany({
        where: {
          userId,
          affaireId,
          statut: 'ACTIVE'
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

      if (affectations.length === 0) {
        return {
          totalAffectations: 0,
          totalHeures: 0,
          totalCoutMainOeuvre: 0,
          totalVenteMainOeuvre: 0,
          totalFraisGeneraux: 0,
          premiereAffectation: null,
          derniereAffectation: null,
          semaines: []
        };
      }

      // Configuration des heures par période
      const HEURES_PAR_PERIODE = {
        MATIN: 4,
        APREM: 4
      };

      // Calculer les totaux
      let totalHeures = 0;
      let totalCoutMainOeuvre = 0;
      let totalVenteMainOeuvre = 0;
      let totalFraisGeneraux = 0;

      // Grouper par semaine pour calculs détaillés
      const affectationsParSemaine = new Map();

      for (const affectation of affectations) {
        const heures = HEURES_PAR_PERIODE[affectation.periode] || 4;
        const tarifCout = affectation.user.tarifHoraireCout || affectation.user.tarifHoraireBase || 0;
        const tarifVente = affectation.user.tarifHoraireVente || 0;
        const coutAffectation = heures * tarifCout;
        const venteAffectation = heures * tarifVente;

        // Calculer les frais généraux pour cette affectation spécifique
        const fraisGenerauxAffectation = await this.calculerFraisGenerauxAffectation(affectation);

        // Ajouter aux totaux globaux
        totalHeures += heures;
        totalCoutMainOeuvre += coutAffectation;
        totalVenteMainOeuvre += venteAffectation;
        totalFraisGeneraux += fraisGenerauxAffectation;

        // Grouper par semaine
        const dateSemaine = this.getDebutSemaine(affectation.dateAffectation);
        const cleSemaine = `${dateSemaine.getFullYear()}-${this.getWeekNumber(dateSemaine)}`;
        
        if (!affectationsParSemaine.has(cleSemaine)) {
          affectationsParSemaine.set(cleSemaine, {
            semaine: this.getWeekNumber(dateSemaine),
            annee: dateSemaine.getFullYear(),
            nbAffectations: 0,
            heures: 0,
            cout: 0,
            vente: 0,
            fraisGeneraux: 0
          });
        }

        const semaineData = affectationsParSemaine.get(cleSemaine);
        semaineData.nbAffectations += 1;
        semaineData.heures += heures;
        semaineData.cout += coutAffectation;
        semaineData.vente += venteAffectation;
        semaineData.fraisGeneraux += fraisGenerauxAffectation;
      }

      return {
        totalAffectations: affectations.length,
        totalHeures,
        totalCoutMainOeuvre,
        totalVenteMainOeuvre,
        totalFraisGeneraux,
        premiereAffectation: affectations[0].dateAffectation,
        derniereAffectation: affectations[affectations.length - 1].dateAffectation,
        semaines: Array.from(affectationsParSemaine.values()).sort((a, b) => {
          if (a.annee !== b.annee) return a.annee - b.annee;
          return a.semaine - b.semaine;
        })
      };

    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique ouvrier-affaire:', error);
      throw error;
    }
  }

  /**
   * Récupérer les totaux historiques complets pour une affaire
   * Inclut TOUS les ouvriers qui ont travaillé sur cette affaire
   */
  async getTotauxHistoriquesAffaire(affaireId: string) {
    try {
      console.log(`🔍 Récupération totaux historiques pour affaire ${affaireId}...`);
      
      // Récupérer TOUTES les affectations pour cette affaire (toutes semaines confondues)
      const toutesAffectations = await this.prisma.planningAffectation.findMany({
        where: { 
          affaireId
        },
        include: {
          affaire: true,
          user: true
        }
      });

      console.log(`📊 ${toutesAffectations.length} affectations trouvées pour affaire ${affaireId}`);

      // Obtenir tous les ouvriers uniques qui ont travaillé sur cette affaire
      const ouvriersUniques = [...new Set(toutesAffectations.map(a => a.userId))];
      console.log(`👥 ${ouvriersUniques.length} ouvriers uniques ont travaillé sur l'affaire ${affaireId}`);

      // Calculer les totaux pour chaque ouvrier et les additionner
      let totalAffectations = 0;
      let totalHeures = 0;
      let totalCoutMainOeuvre = 0;
      let totalVenteMainOeuvre = 0;
      let totalFraisGeneraux = 0;

      for (const userId of ouvriersUniques) {
        try {
          const historiqueOuvrier = await this.getAffectationsHistoriqueOuvrierAffaire(userId, affaireId);
          
          console.log(`👤 Ouvrier ${userId}:`, {
            totalAffectations: historiqueOuvrier.totalAffectations,
            totalHeures: historiqueOuvrier.totalHeures,
            totalCoutMainOeuvre: historiqueOuvrier.totalCoutMainOeuvre,
            totalVenteMainOeuvre: historiqueOuvrier.totalVenteMainOeuvre,
            totalFraisGeneraux: historiqueOuvrier.totalFraisGeneraux
          });

          totalAffectations += historiqueOuvrier.totalAffectations;
          totalHeures += historiqueOuvrier.totalHeures;
          totalCoutMainOeuvre += historiqueOuvrier.totalCoutMainOeuvre;
          totalVenteMainOeuvre += historiqueOuvrier.totalVenteMainOeuvre;
          totalFraisGeneraux += historiqueOuvrier.totalFraisGeneraux;
          
        } catch (error) {
          console.error(`❌ Erreur calcul historique ouvrier ${userId}:`, error);
        }
      }

      const totauxHistoriques = {
        affaireId,
        nombreOuvriersTotal: ouvriersUniques.length,
        totalAffectations,
        totalHeures,
        totalCoutMainOeuvre,
        totalVenteMainOeuvre,
        totalFraisGeneraux,
        totalCoutTotal: totalCoutMainOeuvre + totalFraisGeneraux,
        totalVenteTotal: totalVenteMainOeuvre + totalFraisGeneraux,
        detailsOuvriers: ouvriersUniques
      };

      console.log(`📊 Totaux historiques finaux pour affaire ${affaireId}:`, totauxHistoriques);
      return totauxHistoriques;

    } catch (error) {
      console.error(`❌ Erreur récupération totaux historiques affaire ${affaireId}:`, error);
      throw error;
    }
  }

  // Méthode utilitaire pour calculer les frais généraux d'une affectation spécifique
  // 🔄 STANDARDISÉ : Calcul PAR DEMI-JOURNÉE (même logique que calculateFraisGenerauxFromPlanning)
  private async calculerFraisGenerauxAffectation(affectation: any): Promise<number> {
    const COUT_FRAIS_GENERAUX_PAR_JOUR = 508.58; // Base jour (2 demi-journées)
    
    try {
      // Récupérer la date d'affectation
      const dateAffectation = new Date(affectation.dateAffectation);
      const jour = dateAffectation.toISOString().split('T')[0];

      console.log(`🔍 Calcul frais généraux pour affectation du ${jour}`);

      // Récupérer TOUTES les affectations de ce jour spécifique
      const dateDebut = new Date(jour + 'T00:00:00.000Z');
      const dateFin = new Date(jour + 'T23:59:59.999Z');
      
      const affectationsDuJour = await this.prisma.planningAffectation.findMany({
        where: {
          dateAffectation: {
            gte: dateDebut,
            lte: dateFin
          },
          statut: 'ACTIVE'
        }
      });

      const nbAffectationsTotalJour = affectationsDuJour.length;
      
      // 🔄 CALCUL SIMPLE : Chaque affectation = 254,29 € (sans mutualisation complexe)
      const COUT_PAR_DEMI_JOURNEE = COUT_FRAIS_GENERAUX_PAR_JOUR / 2; // 254,29 €
      const coutParAffectation = COUT_PAR_DEMI_JOURNEE; // Fixe : 254,29 € par affectation

      console.log(`📊 Affectation: 1 demi-journée`);
      console.log(`💰 Frais généraux FIXES par demi-journée: ${coutParAffectation.toFixed(2)}€`);
      console.log(`💡 Logique SIMPLE: 1 demi-journée = ${coutParAffectation.toFixed(2)}€ fixe (sans mutualisation)`);

      return coutParAffectation;

    } catch (error) {
      console.error('❌ Erreur calcul frais généraux affectation:', error);
      return 0;
    }
  }

  // Méthodes utilitaires pour la gestion des dates
  private getDebutSemaine(date: Date): Date {
    const debutSemaine = new Date(date);
    const jour = debutSemaine.getDay();
    const diff = jour === 0 ? -6 : 1 - jour; // Lundi = début de semaine
    debutSemaine.setDate(debutSemaine.getDate() + diff);
    debutSemaine.setHours(0, 0, 0, 0);
    return debutSemaine;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * 📊 NOUVEAU : Calculer les frais généraux restants à absorber pour une semaine
   * @param dateRef - Date de référence pour identifier la semaine
   * @returns Informations sur les frais généraux de la semaine
   */
  async getFraisGenerauxSemaine(dateRef: string): Promise<{
    semaine: number;
    annee: number;
    dateDebutSemaine: string;
    dateFinSemaine: string;
    fraisGenerauxTotalSemaine: number;
    fraisGenerauxAbsorbes: number;
    fraisGenerauxRestants: number;
    nombreAffectationsTotales: number;
    tauxAbsorption: number;
    detailsParJour: Array<{
      jour: string;
      fraisGenerauxJour: number;
      affectationsDuJour: number;
      fraisGenerauxAbsorbesJour: number;
      fraisGenerauxRestantsJour: number;
    }>;
  }> {
    try {
      const COUT_FRAIS_GENERAUX_PAR_JOUR = 508.58;
      const JOURS_TRAVAILLES_PAR_SEMAINE = 5; // Lundi au vendredi
      const FRAIS_GENERAUX_TOTAL_SEMAINE = COUT_FRAIS_GENERAUX_PAR_JOUR * JOURS_TRAVAILLES_PAR_SEMAINE;

      // Calculer le début et la fin de la semaine
      const dateReference = new Date(dateRef);
      const debutSemaine = this.getDebutSemaine(dateReference);
      const finSemaine = new Date(debutSemaine);
      finSemaine.setDate(finSemaine.getDate() + 6);
      finSemaine.setHours(23, 59, 59, 999);

      console.log(`📊 Calcul frais généraux semaine du ${debutSemaine.toISOString().split('T')[0]} au ${finSemaine.toISOString().split('T')[0]}`);

      // Récupérer toutes les affectations de la semaine
      const affectationsSemaine = await this.prisma.planningAffectation.findMany({
        where: {
          dateAffectation: {
            gte: debutSemaine,
            lte: finSemaine
          },
          statut: 'ACTIVE'
        },
        include: {
          affaire: {
            select: { id: true, numero: true, libelle: true }
          },
          user: {
            select: { id: true, nom: true, prenom: true }
          }
        },
        orderBy: {
          dateAffectation: 'asc'
        }
      });

      // Grouper les affectations par jour (lundi au vendredi uniquement)
      const joursOuvrables = [];
      const detailsParJour = [];
      let fraisGenerauxAbsorbesTotal = 0;

      for (let i = 0; i < JOURS_TRAVAILLES_PAR_SEMAINE; i++) {
        const jourCourant = new Date(debutSemaine);
        jourCourant.setDate(debutSemaine.getDate() + i);
        const jourStr = jourCourant.toISOString().split('T')[0];
        
        // Compter les affectations de ce jour
        const affectationsDuJour = affectationsSemaine.filter(a => 
          a.dateAffectation.toISOString().split('T')[0] === jourStr
        );

        const nbAffectationsDuJour = affectationsDuJour.length;
        
        // 🔄 CORRECTION : Calcul par demi-journée (affectation)
        // Chaque affectation = 1 demi-journée
        // 1 journée = 2 demi-journées max = 508,58€
        // 1 demi-journée = 254,29€
        const COUT_PAR_DEMI_JOURNEE = COUT_FRAIS_GENERAUX_PAR_JOUR / 2; // 254,29€
        const fraisGenerauxAbsorbesJour = nbAffectationsDuJour * COUT_PAR_DEMI_JOURNEE;
        const fraisGenerauxRestantsJour = COUT_FRAIS_GENERAUX_PAR_JOUR - fraisGenerauxAbsorbesJour;

        // 📊 DÉBOGAGE DÉTAILLÉ COMPLET
        console.log(`🔍 DÉBOGAGE ULTRA-DÉTAILLÉ ${jourStr}:`);
        console.log(`   - Affectations trouvées dans la DB: ${nbAffectationsDuJour}`);
        console.log(`   - Coût par demi-journée (fixe): ${COUT_PAR_DEMI_JOURNEE.toFixed(2)}€`);
        console.log(`   - Calcul absorbés: ${nbAffectationsDuJour} × ${COUT_PAR_DEMI_JOURNEE.toFixed(2)} = ${fraisGenerauxAbsorbesJour.toFixed(2)}€`);
        console.log(`   - Calcul restants: ${COUT_FRAIS_GENERAUX_PAR_JOUR.toFixed(2)} - ${fraisGenerauxAbsorbesJour.toFixed(2)} = ${fraisGenerauxRestantsJour.toFixed(2)}€`);
        
        if (affectationsDuJour.length > 0) {
          console.log(`   🎯 DÉTAIL EXACT DE CHAQUE AFFECTATION TROUVÉE:`);
          affectationsDuJour.forEach((aff, index: number) => {
            console.log(`     ${index + 1}. ID: ${aff.id}, Affaire: ${aff.affaire?.numero}, User: ${aff.user?.nom} ${aff.user?.prenom}, Période: ${aff.periode}, Date: ${aff.dateAffectation.toISOString()}, Statut: ${aff.statut}`);
          });
          console.log(`   ⚠️ PROBLÈME DÉTECTÉ : Si vous voyez ${nbAffectationsDuJour} affectations mais qu'il ne devrait y en avoir qu'1, c'est que :`);
          console.log(`      - Soit il y a des doublons en DB`);
          console.log(`      - Soit il y a matin ET après-midi pour la même personne`);
          console.log(`      - Soit il y a plusieurs personnes le même jour`);
        } else {
          console.log(`   ✅ Aucune affectation pour ${jourStr}`);
        }

        fraisGenerauxAbsorbesTotal += fraisGenerauxAbsorbesJour;

        detailsParJour.push({
          jour: jourStr,
          fraisGenerauxJour: COUT_FRAIS_GENERAUX_PAR_JOUR,
          affectationsDuJour: nbAffectationsDuJour,
          fraisGenerauxAbsorbesJour,
          fraisGenerauxRestantsJour
        });

        console.log(`📅 ${jourStr}: ${nbAffectationsDuJour} affectations (${nbAffectationsDuJour}×${COUT_PAR_DEMI_JOURNEE.toFixed(2)}€), ${fraisGenerauxAbsorbesJour.toFixed(2)}€ absorbés, ${fraisGenerauxRestantsJour.toFixed(2)}€ restants`);
      }

      const fraisGenerauxRestants = FRAIS_GENERAUX_TOTAL_SEMAINE - fraisGenerauxAbsorbesTotal;
      const tauxAbsorption = FRAIS_GENERAUX_TOTAL_SEMAINE > 0 ? (fraisGenerauxAbsorbesTotal / FRAIS_GENERAUX_TOTAL_SEMAINE) * 100 : 0;

      const resultat = {
        semaine: this.getWeekNumber(debutSemaine),
        annee: debutSemaine.getFullYear(),
        dateDebutSemaine: debutSemaine.toISOString().split('T')[0],
        dateFinSemaine: finSemaine.toISOString().split('T')[0],
        fraisGenerauxTotalSemaine: FRAIS_GENERAUX_TOTAL_SEMAINE,
        fraisGenerauxAbsorbes: fraisGenerauxAbsorbesTotal,
        fraisGenerauxRestants,
        nombreAffectationsTotales: affectationsSemaine.length,
        tauxAbsorption,
        detailsParJour
      };

      console.log(`💰 Résumé semaine: ${fraisGenerauxAbsorbesTotal.toFixed(2)}€ absorbés / ${FRAIS_GENERAUX_TOTAL_SEMAINE.toFixed(2)}€ (${tauxAbsorption.toFixed(1)}%)`);
      console.log(`⚠️ Frais généraux restants: ${fraisGenerauxRestants.toFixed(2)}€`);

      return resultat;

    } catch (error) {
      console.error('❌ Erreur calcul frais généraux semaine:', error);
      throw error;
    }
  }

  /**
   * 🔍 DÉBOGAGE : Retourner exactement ce que voit le backend pour les frais généraux
   */
  async debugFraisGeneraux(dateRef: string) {
    try {
      const COUT_FRAIS_GENERAUX_PAR_JOUR = 508.58;
      const COUT_PAR_DEMI_JOURNEE = COUT_FRAIS_GENERAUX_PAR_JOUR / 2; // 254,29€

      // Calculer le début et la fin de la semaine
      const dateReference = new Date(dateRef);
      const debutSemaine = this.getDebutSemaine(dateReference);
      const finSemaine = new Date(debutSemaine);
      finSemaine.setDate(finSemaine.getDate() + 6);
      finSemaine.setHours(23, 59, 59, 999);

      // Récupérer toutes les affectations de la semaine
      const affectationsSemaine = await this.prisma.planningAffectation.findMany({
        where: {
          dateAffectation: {
            gte: debutSemaine,
            lte: finSemaine
          },
          statut: 'ACTIVE'
        },
        include: {
          affaire: {
            select: { id: true, numero: true, libelle: true }
          },
          user: {
            select: { id: true, nom: true, prenom: true }
          }
        },
        orderBy: {
          dateAffectation: 'asc'
        }
      });

      // Analyser jour par jour
      const detailsParJour = [];
      for (let i = 0; i < 5; i++) { // Lundi au vendredi
        const jourCourant = new Date(debutSemaine);
        jourCourant.setDate(debutSemaine.getDate() + i);
        const jourStr = jourCourant.toISOString().split('T')[0];
        
        // Compter les affectations de ce jour
        const affectationsDuJour = affectationsSemaine.filter((a: any) => 
          a.dateAffectation.toISOString().split('T')[0] === jourStr
        );

        const nbAffectationsDuJour = affectationsDuJour.length;
        const fraisGenerauxAbsorbesJour = nbAffectationsDuJour * COUT_PAR_DEMI_JOURNEE;

        detailsParJour.push({
          jour: jourStr,
          jourNom: jourCourant.toLocaleDateString('fr-FR', { weekday: 'long' }),
          nbAffectations: nbAffectationsDuJour,
          fraisGenerauxAbsorbes: fraisGenerauxAbsorbesJour,
          affectationsDetail: affectationsDuJour.map((aff: any) => ({
            id: aff.id,
            affaire: aff.affaire?.numero || 'N/A',
            user: `${aff.user?.nom} ${aff.user?.prenom}`,
            periode: aff.periode,
            dateAffectation: aff.dateAffectation.toISOString(),
            statut: aff.statut
          }))
        });
      }

      return {
        dateReference: dateRef,
        debutSemaine: debutSemaine.toISOString().split('T')[0],
        finSemaine: finSemaine.toISOString().split('T')[0],
        coutParDemiJournee: COUT_PAR_DEMI_JOURNEE,
        totalAffectationsSemaine: affectationsSemaine.length,
        totalAbsorbe: detailsParJour.reduce((sum, jour) => sum + jour.fraisGenerauxAbsorbes, 0),
        detailsParJour
      };

    } catch (error) {
      return { error: error.message };
    }
  }
} 