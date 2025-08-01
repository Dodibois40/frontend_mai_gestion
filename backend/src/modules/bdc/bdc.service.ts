import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBdcDto } from './dto/create-bdc.dto';
import { UpdateBdcDto } from './dto/update-bdc.dto';
import { Bdc, Prisma } from '@prisma/client';
import { UploadService } from '../../common/services/upload.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ParametresService } from '../parametres/parametres.service';
const PDFDocument = require('pdfkit');
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BdcService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private parametresService: ParametresService,
  ) {}

  /**
   * Génère automatiquement un numéro de BDC au format "BDC-YYYY-XXX"
   * YYYY = année courante
   * XXX = numéro séquentiel du BDC pour l'année (001, 002, etc.)
   */
  private async generateBdcNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `BDC-${currentYear}-`;
    
    // Trouver le dernier numéro de BDC pour cette année
    const lastBdc = await this.prisma.bdc.findFirst({
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
    if (lastBdc) {
      // Extraire le numéro séquentiel du dernier numéro (ex: BDC-2025-003 -> 3)
      const lastNumParts = lastBdc.numero.split('-');
      if (lastNumParts.length === 3) {
        const lastSeq = parseInt(lastNumParts[2], 10);
        if (!isNaN(lastSeq)) {
          nextNumber = lastSeq + 1;
        }
      }
    }

    // Formater avec des zéros en tête (ex: 001, 002, etc.)
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    
    return `${prefix}${formattedNumber}`;
  }

  async create(createBdcDto: CreateBdcDto): Promise<Bdc> {
    try {
      // Générer automatiquement le numéro de BDC
      const numeroBdc = await this.generateBdcNumber();
      
      // Vérifier que l'affaire existe
      const affaire = await this.prisma.affaire.findUnique({
        where: { id: createBdcDto.affaireId },
      });
      
      if (!affaire) {
        throw new NotFoundException(`Affaire avec ID ${createBdcDto.affaireId} non trouvée`);
      }
      
      // Vérifier que la catégorie existe
      const categorie = await this.prisma.categorieAchat.findUnique({
        where: { id: createBdcDto.categorieId },
      });
      
      if (!categorie) {
        throw new NotFoundException(`Catégorie avec ID ${createBdcDto.categorieId} non trouvée`);
      }

      // Calculer le montant total des lignes si elles existent (seulement les prix renseignés)
      let montantCalcule = createBdcDto.montantHt;
      if (createBdcDto.lignes && createBdcDto.lignes.length > 0) {
        montantCalcule = createBdcDto.lignes.reduce((total, ligne) => {
          if (ligne.prixUnitaire > 0) {
            return total + (ligne.quantite * ligne.prixUnitaire);
          }
          return total;
        }, 0);
      }
      
      // Calculer le montant des frais généraux
      const montantFg = (montantCalcule * categorie.pourcentageFg) / 100;

      // Préparer les données des lignes avec montant calculé
      const lignesData = createBdcDto.lignes?.map((ligne, index) => ({
        designation: ligne.designation,
        reference: ligne.reference,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire, // Obligatoire maintenant
        montantLigne: ligne.quantite * ligne.prixUnitaire,
        ordre: ligne.ordre || index + 1,
      })) || [];
      
      // Créer le BDC avec les lignes en une seule transaction
      return await this.prisma.bdc.create({
        data: {
          numero: numeroBdc,
          montantHt: montantCalcule,
          affaireId: createBdcDto.affaireId,
          categorieId: createBdcDto.categorieId,
          fournisseur: createBdcDto.fournisseur,
          direction: createBdcDto.direction,
          dateBdc: createBdcDto.dateBdc,
          dateReception: createBdcDto.dateReception,
          dateLivraison: createBdcDto.dateLivraison,
          commentaire: createBdcDto.commentaire,
          lieuLivraison: createBdcDto.lieuLivraison,
          adresseLivraison: createBdcDto.adresseLivraison,
          montantFg,
          lignes: {
            create: lignesData,
          },
        },
        include: {
          lignes: true,
          affaire: true,
          categorie: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`Un bon de commande avec ce numéro existe déjà`);
        }
      }
      throw error;
    }
  }

  async findAll(
    affaireId?: string,
    fournisseur?: string,
    skip = 0,
    take = 10,
  ): Promise<{ bdc: Bdc[]; total: number }> {
    const where: Prisma.BdcWhereInput = {};

    if (affaireId) {
      where.affaireId = affaireId;
    }

    if (fournisseur) {
      where.fournisseur = { contains: fournisseur };
    }

    const [bdc, total] = await Promise.all([
      this.prisma.bdc.findMany({
        where,
        skip,
        take,
        orderBy: { dateBdc: 'desc' },
        include: {
          lignes: {
            orderBy: {
              ordre: 'asc',
            },
          },
          affaire: {
            select: {
              numero: true,
              libelle: true,
            },
          },
          categorie: {
            select: {
              code: true,
              intitule: true,
              pourcentageFg: true,
            },
          },
        },
      }),
      this.prisma.bdc.count({ where }),
    ]);

    return { bdc, total };
  }

  async findOne(id: string): Promise<Bdc> {
    const bdc = await this.prisma.bdc.findUnique({
      where: { id },
      include: {
        affaire: {
          select: {
            id: true,
            numero: true,
            libelle: true,
            client: true,
          },
        },
        categorie: {
          select: {
            id: true,
            code: true,
            intitule: true,
            pourcentageFg: true,
          },
        },
      },
    });

    if (!bdc) {
      throw new NotFoundException(`Bon de commande avec ID ${id} non trouvé`);
    }

    return bdc;
  }

  async update(id: string, updateBdcDto: UpdateBdcDto): Promise<Bdc> {
    try {
      // Vérifier que le BDC existe
      const bdcExistant = await this.prisma.bdc.findUnique({
        where: { id },
        include: {
          categorie: true,
        },
      });

      if (!bdcExistant) {
        throw new NotFoundException(`Bon de commande avec ID ${id} non trouvé`);
      }

      // Si on modifie la catégorie ou le montant, recalculer les frais généraux
      let montantFg = bdcExistant.montantFg;
      
      if (updateBdcDto.categorieId || updateBdcDto.montantHt !== undefined) {
        // Récupérer la catégorie (existante ou nouvelle)
        const categorieId = updateBdcDto.categorieId || bdcExistant.categorieId;
        const categorie = await this.prisma.categorieAchat.findUnique({
          where: { id: categorieId },
        });
        
        if (!categorie) {
          throw new NotFoundException(`Catégorie avec ID ${categorieId} non trouvée`);
        }
        
        // Utiliser le montant HT mis à jour ou existant
        const montantHt = updateBdcDto.montantHt !== undefined 
          ? updateBdcDto.montantHt 
          : bdcExistant.montantHt;
        
        // Recalculer les frais généraux
        montantFg = (montantHt * categorie.pourcentageFg) / 100;
      }
      
      // Extraire les champs qui ne vont pas directement dans la table bdc
      const { lignes, ...bdcData } = updateBdcDto;
      
      // Si des lignes sont fournies, gérer leur mise à jour
      if (lignes && lignes.length > 0) {
        // Supprimer les anciennes lignes et créer les nouvelles
        await this.prisma.ligneBdc.deleteMany({
          where: { bdcId: id }
        });
        
        // Recalculer le montant à partir des lignes (seulement les prix > 0)
        const montantCalcule = lignes.reduce((total, ligne) => {
          if (ligne.prixUnitaire > 0) {
            return total + (ligne.quantite * ligne.prixUnitaire);
          }
          return total;
        }, 0);
        
        bdcData.montantHt = montantCalcule;
        
        // Recalculer les frais généraux avec le nouveau montant
        if (bdcData.categorieId || montantCalcule !== bdcExistant.montantHt) {
          const categorieId = bdcData.categorieId || bdcExistant.categorieId;
          const categorie = await this.prisma.categorieAchat.findUnique({
            where: { id: categorieId },
          });
          if (categorie) {
            montantFg = (montantCalcule * categorie.pourcentageFg) / 100;
          }
        }
      }
      
      // Mise à jour du BDC (séparément des lignes)
      const updatedBdc = await this.prisma.bdc.update({
        where: { id },
        data: {
          ...bdcData,
          montantFg,
        },
        include: {
          affaire: {
            select: {
              numero: true,
              libelle: true,
            },
          },
          categorie: {
            select: {
              code: true,
              intitule: true,
            },
          },
          lignes: {
            orderBy: {
              ordre: 'asc'
            }
          },
        },
      });

      // Créer les nouvelles lignes si fournies
      if (lignes && lignes.length > 0) {
        await this.prisma.ligneBdc.createMany({
          data: lignes.map((ligne, index) => ({
            bdcId: id,
            designation: ligne.designation,
            reference: ligne.reference || null,
            quantite: ligne.quantite,
            prixUnitaire: ligne.prixUnitaire,
            montantLigne: ligne.quantite * ligne.prixUnitaire,
            ordre: index + 1,
          }))
        });
      }

      // Retourner le BDC mis à jour avec les lignes
      const finalBdc = await this.prisma.bdc.findUnique({
        where: { id },
        include: {
          affaire: {
            select: {
              numero: true,
              libelle: true,
            },
          },
          categorie: {
            select: {
              code: true,
              intitule: true,
            },
          },
          lignes: {
            orderBy: {
              ordre: 'asc'
            }
          },
        },
      });

      if (!finalBdc) {
        throw new NotFoundException(`Bon de commande avec ID ${id} non trouvé après mise à jour`);
      }

      return finalBdc;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`Erreur de contrainte d'unicité lors de la mise à jour du bon de commande`);
        }
      }
      throw error;
    }
  }

  async receptionner(id: string, dateReception: Date): Promise<Bdc> {
    const bdc = await this.prisma.bdc.findUnique({
      where: { id },
    });

    if (!bdc) {
      throw new NotFoundException(`Bon de commande avec ID ${id} non trouvé`);
    }

    return this.prisma.bdc.update({
      where: { id },
      data: { 
        dateReception,
        statut: 'RECEPTIONNE' // Mettre à jour le statut lors de la réception
      },
    });
  }

  // Valider un bon de commande (changer le statut vers VALIDE)
  async valider(id: string): Promise<Bdc> {
    const bdc = await this.prisma.bdc.findUnique({
      where: { id },
    });

    if (!bdc) {
      throw new NotFoundException(`Bon de commande avec ID ${id} non trouvé`);
    }

    return this.prisma.bdc.update({
      where: { id },
      data: { 
        statut: 'VALIDE'
      },
      include: {
        affaire: {
          select: {
            numero: true,
            libelle: true,
          },
        },
        categorie: {
          select: {
            code: true,
            intitule: true,
          },
        },
      },
    });
  }

  // Annuler un bon de commande (changer le statut vers ANNULE)
  async annuler(id: string): Promise<Bdc> {
    const bdc = await this.prisma.bdc.findUnique({
      where: { id },
    });

    if (!bdc) {
      throw new NotFoundException(`Bon de commande avec ID ${id} non trouvé`);
    }

    return this.prisma.bdc.update({
      where: { id },
      data: { 
        statut: 'ANNULE'
      },
      include: {
        affaire: {
          select: {
            numero: true,
            libelle: true,
          },
        },
        categorie: {
          select: {
            code: true,
            intitule: true,
          },
        },
      },
    });
  }

  async remove(id: string, password?: string): Promise<Bdc> {
    try {
      const bdc = await this.prisma.bdc.findUnique({
        where: { id },
      });

      if (!bdc) {
        throw new NotFoundException(`Bon de commande avec ID ${id} non trouvé`);
      }

      // Si le BDC est validé, un mot de passe est requis
      if (bdc.statut === 'VALIDE') {
        if (!password) {
          throw new BadRequestException('Un mot de passe est requis pour supprimer un bon de commande validé');
        }
        
        // Vérifier le mot de passe (mot de passe par défaut : "1234")
        const ADMIN_PASSWORD = process.env.BDC_DELETE_PASSWORD || '1234';
        if (password !== ADMIN_PASSWORD) {
          throw new UnauthorizedException('Mot de passe incorrect');
        }
      }

      return await this.prisma.bdc.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  // Méthode pour obtenir les statistiques d'achat par catégorie pour une affaire
  async getStatsByAffaire(affaireId: string) {
    // Vérifier que l'affaire existe
    const affaire = await this.prisma.affaire.findUnique({
      where: { id: affaireId },
    });

    if (!affaire) {
      throw new NotFoundException(`Affaire avec ID ${affaireId} non trouvée`);
    }

    // Récupérer la liste complète des BDC de l'affaire
    const bdcs = await this.prisma.bdc.findMany({
      where: { affaireId },
      include: {
        categorie: {
          select: {
            code: true,
            intitule: true,
          },
        },
      },
      orderBy: { dateBdc: 'desc' },
    });

    // Récupérer les statistiques d'achat par catégorie
    const statsByCategorie = await this.prisma.bdc.groupBy({
      by: ['categorieId'],
      where: {
        affaireId,
      },
      _sum: {
        montantHt: true,
        montantFg: true,
      },
      orderBy: {
        _sum: {
          montantHt: 'desc',
        },
      },
    });

    // Enrichir avec les informations de catégorie
    const statsWithCategories = await Promise.all(
      statsByCategorie.map(async (stat) => {
        const categorie = await this.prisma.categorieAchat.findUnique({
          where: { id: stat.categorieId },
        });

        return {
          categorieId: stat.categorieId,
          code: categorie?.code,
          intitule: categorie?.intitule,
          montantHt: stat._sum.montantHt || 0,
          montantFg: stat._sum.montantFg || 0,
        };
      })
    );

    // Calcul des totaux
    const totalMontantHt = statsWithCategories.reduce((sum, stat) => sum + stat.montantHt, 0);
    const totalMontantFg = statsWithCategories.reduce((sum, stat) => sum + stat.montantFg, 0);

    // Comparer avec les objectifs de l'affaire
    const ecartObjectif = (affaire.objectifAchatHt > 0)
      ? ((totalMontantHt / affaire.objectifAchatHt) * 100) - 100
      : 0;

    return {
      affaireId,
      numeroAffaire: affaire.numero,
      libelleAffaire: affaire.libelle,
      objectifAchatHt: affaire.objectifAchatHt,
      totalMontantHt,
      totalMontantFg,
      ecartObjectif,
      detailsCategories: statsWithCategories,
      bdcs, // Ajouter la liste des BDC
    };
  }

  // Upload d'un fichier PDF pour un BDC
  async uploadPdf(id: string, file: Express.Multer.File): Promise<Bdc> {
    const bdc = await this.findOne(id);

    // Si un fichier existe déjà, le supprimer
    if (bdc.fichierPdf) {
      try {
        await this.uploadService.deletePdf(bdc.fichierPdf);
      } catch (error) {
        console.warn(`Impossible de supprimer l'ancien fichier: ${error.message}`);
      }
    }

    // Validation du fichier
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Seuls les fichiers PDF sont autorisés');
    }

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      throw new BadRequestException('Le fichier est trop volumineux (maximum 10MB)');
    }

    // Créer le dossier pour les PDF BDC s'il n'existe pas
    const pdfDir = path.join(process.cwd(), 'uploads', 'bdc-pdf');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Utiliser le numéro de BDC comme nom de fichier
    const fileName = `${bdc.numero}.pdf`;
    const filePath = path.join(pdfDir, fileName);

    // Sauvegarder le fichier avec le bon nom
    fs.writeFileSync(filePath, file.buffer);

    // Mettre à jour le BDC avec les informations du fichier
    return this.prisma.bdc.update({
      where: { id },
      data: {
        fichierPdf: fileName,
        nomFichier: fileName,
        tailleFichier: file.size,
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
        categorie: {
          select: {
            code: true,
            intitule: true,
          },
        },
      },
    });
  }

  // Supprimer le fichier PDF d'un BDC
  async deletePdf(id: string): Promise<Bdc> {
    const bdc = await this.findOne(id);

    if (!bdc.fichierPdf) {
      throw new NotFoundException('Aucun fichier PDF associé à ce BDC');
    }

    // Supprimer le fichier physique
    try {
      await this.uploadService.deletePdf(bdc.fichierPdf);
    } catch (error) {
      console.warn(`Impossible de supprimer le fichier: ${error.message}`);
    }

    // Mettre à jour le BDC pour supprimer les références au fichier
    return this.prisma.bdc.update({
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
        categorie: {
          select: {
            code: true,
            intitule: true,
          },
        },
      },
    });
  }

  async generatePdf(id: string): Promise<string> {
    const bdc = await this.prisma.bdc.findUnique({
      where: { id },
      include: {
        affaire: {
          select: {
            numero: true,
            libelle: true,
            client: true,
            adresse: true,
          },
        },
        categorie: {
          select: {
            intitule: true,
            pourcentageFg: true,
          },
        },
        lignes: {
          orderBy: {
            ordre: 'asc'
          },
          select: {
            designation: true,
            reference: true,
            quantite: true,
            prixUnitaire: true,
            montantLigne: true,
          },
        },
      },
    });

    if (!bdc) {
      throw new NotFoundException('Bon de commande non trouvé');
    }

    // Rechercher les informations du fournisseur dans la table fournisseurs
    let fournisseurCodeClient = '';
    let fournisseurEnCompte = false;
    try {
      const fournisseurInfo = await this.prisma.fournisseur.findFirst({
        where: { nom: bdc.fournisseur },
        select: { 
          codeClient: true,
          enCompte: true 
        }
      });
      fournisseurCodeClient = fournisseurInfo?.codeClient || '';
      fournisseurEnCompte = fournisseurInfo?.enCompte || false;
    } catch (error) {
      // Si le fournisseur n'est pas trouvé dans la table, continuer sans code client
    }

    // Récupérer les informations d'entreprise depuis les paramètres
    let entrepriseNom = 'MAI GESTION';
    let entrepriseAdresse = '';
    let entrepriseTel = '';
    let entrepriseEmail = '';
    let entrepriseSiret = '';

    try {
      const nomParam = await this.parametresService.findByKey('ENTREPRISE_NOM');
      entrepriseNom = nomParam.valeur || 'MAI GESTION';
    } catch (error) {
      // Utiliser la valeur par défaut si paramètre non trouvé
    }

    try {
      const adresseParam = await this.parametresService.findByKey('ENTREPRISE_ADRESSE');
      entrepriseAdresse = adresseParam.valeur || '';
    } catch (error) {
      // Utiliser la valeur par défaut si paramètre non trouvé
    }

    try {
      const telParam = await this.parametresService.findByKey('ENTREPRISE_TEL');
      entrepriseTel = telParam.valeur || '';
    } catch (error) {
      // Utiliser la valeur par défaut si paramètre non trouvé
    }

    try {
      const emailParam = await this.parametresService.findByKey('ENTREPRISE_EMAIL');
      entrepriseEmail = emailParam.valeur || '';
    } catch (error) {
      // Utiliser la valeur par défaut si paramètre non trouvé
    }

    try {
      const siretParam = await this.parametresService.findByKey('ENTREPRISE_SIRET');
      entrepriseSiret = siretParam.valeur || '';
    } catch (error) {
      // Utiliser la valeur par défaut si paramètre non trouvé
    }

    // Créer le dossier pour les PDF BDC s'il n'existe pas
    const pdfDir = path.join(process.cwd(), 'uploads', 'bdc-pdf');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfPath = path.join(pdfDir, `${bdc.numero}.pdf`);
    
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 50,
          size: 'A4'
        });
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        // Couleurs standardisées - Thème terre, bois, vert olive, soleil
        const colors = {
          primary: '#8B9B7A',      // Vert olive principal
          secondary: '#5D4E37',    // Brun terre/bois
          accent: '#A67C52',       // Terre douce/bois clair
          text: '#4A4A4A',         // Gris charbon naturel
          light: '#F5F5DC',        // Beige clair naturel
          border: '#D2B48C',       // Tan/sable
          soleil: '#FFD700',       // Jaune doré pour le total
          jaune: '#F0C814'         // Jaune plus vif
        };

        // === EN-TÊTE PRINCIPAL (MOINS IMPOSANT) ===
        // Fond coloré pour l'en-tête - réduit de 120px à 80px
        doc.rect(0, 0, 595, 80)
           .fill(colors.primary);

        // Titre principal en blanc
        doc.fontSize(20)
           .fillColor('#ffffff')
           .font('Helvetica-Bold')
           .text('BON DE COMMANDE', 50, 20, { align: 'center' });

        // Numéro de BDC en gras noir et date centrés
        doc.fontSize(13)
           .fillColor('#000000')
           .font('Helvetica-Bold')
           .text(`N° BDC: ${bdc.numero}`, 50, 45, { align: 'center' });
           
        doc.fontSize(11)
           .fillColor('#ffffff')
           .font('Helvetica')
           .text(`Date: ${new Date(bdc.dateBdc).toLocaleDateString('fr-FR')}`, 50, 65, { align: 'center' });

        // === INFORMATIONS ENTREPRISE ===
        let yPos = 100; // Ajusté pour le bandeau plus petit
        
        // Informations entreprise (sans titre "EXPÉDITEUR")
        doc.fontSize(12)
           .fillColor(colors.secondary)
           .font('Helvetica-Bold')
           .text(entrepriseNom, 50, yPos);

        yPos += 18;

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor(colors.text);

        if (entrepriseAdresse && entrepriseAdresse !== '') {
          doc.text(entrepriseAdresse, 50, yPos);
          yPos += 12;
        }
        
        // Ajout du code postal et ville
        doc.text('64520 Came', 50, yPos);
        yPos += 12;
        
        if (entrepriseTel && entrepriseTel !== '') {
          doc.text(`Tél: ${entrepriseTel}`, 50, yPos);
          yPos += 12;
        }
        
        if (entrepriseEmail && entrepriseEmail !== '') {
          doc.text(`Email: ${entrepriseEmail}`, 50, yPos);
          yPos += 12;
        }
        
        if (entrepriseSiret && entrepriseSiret !== '') {
          doc.text(`SIRET: ${entrepriseSiret}`, 50, yPos);
          yPos += 12;
        }

        // === INFORMATIONS FOURNISSEUR ===
        let yPosFournisseur = 100; // Ajusté pour le bandeau plus petit

        // Titre section fournisseur (changé de DESTINATAIRE à FOURNISSEUR)
        doc.fontSize(14)
           .fillColor(colors.secondary)
           .font('Helvetica-Bold')
           .text('FOURNISSEUR', 300, yPosFournisseur);

        yPosFournisseur += 25;

        // Encadré pour le fournisseur
        doc.rect(300, yPosFournisseur - 5, 245, 80)
           .fillColor(colors.light)
           .fill()
           .rect(300, yPosFournisseur - 5, 245, 80)
           .strokeColor(colors.border)
           .stroke();

        doc.fontSize(12)
           .fillColor(colors.primary)
           .font('Helvetica-Bold')
           .text(bdc.fournisseur, 310, yPosFournisseur + 5);

        let yPosFournisseurInfo = yPosFournisseur + 25;
        
        if (fournisseurCodeClient && fournisseurCodeClient !== '') {
          doc.fontSize(10)
             .fillColor(colors.text)
             .font('Helvetica')
             .text(`Code client: ${fournisseurCodeClient}`, 310, yPosFournisseurInfo);
          yPosFournisseurInfo += 15;
        }
        
        // Affichage du règlement
        const reglement = fournisseurEnCompte ? 'EN COMPTE' : 'PAIEMENT FACTURE';
        const couleurPaiement = fournisseurEnCompte ? colors.accent : colors.secondary;
        
        doc.fontSize(9)
           .fillColor(couleurPaiement)
           .font('Helvetica-Bold')
           .text(`Règlement: ${reglement}`, 310, yPosFournisseurInfo);

        // === INFORMATIONS AFFAIRE ===
        yPos = Math.max(yPos + 30, 210); // Ajusté pour le bandeau plus petit

        // Ligne de séparation
        doc.moveTo(50, yPos)
           .lineTo(545, yPos)
           .strokeColor(colors.border)
           .lineWidth(2)
           .stroke();

        yPos += 20;

        // Section affaire avec fond coloré
        doc.rect(50, yPos - 5, 495, 60)
           .fillColor('#f1f5f9')
           .fill();

        doc.fontSize(14)
           .fillColor(colors.secondary)
           .font('Helvetica-Bold')
           .text('AFFAIRE', 60, yPos + 5);

        doc.fontSize(12)
           .fillColor(colors.primary)
           .font('Helvetica-Bold')
           .text(`${bdc.affaire.numero} - ${bdc.affaire.libelle}`, 60, yPos + 25);

        doc.fontSize(10)
           .fillColor(colors.text)
           .font('Helvetica')
           .text(`Client: ${bdc.affaire.client}`, 60, yPos + 40);

        if (bdc.affaire.adresse) {
          doc.text(`Adresse: ${bdc.affaire.adresse}`, 300, yPos + 40);
        }

        yPos += 80;

        // === INFORMATIONS DE LIVRAISON (CORRIGÉ) ===
        if (bdc.lieuLivraison) {
          doc.fontSize(12)
             .fillColor(colors.accent)
             .font('Helvetica-Bold')
             .text('LIVRAISON:', 60, yPos);
          
          yPos += 20;

          if (bdc.lieuLivraison === 'ATELIER') {
            doc.fontSize(10)
               .fillColor(colors.text)
               .font('Helvetica')
               .text('Atelier - La Manufacture de l\'agencement', 60, yPos)
               .text('2273 avenue des Pyrénées, 64520 Came', 60, yPos + 15);
            yPos += 35;
          } else if (bdc.lieuLivraison === 'CHANTIER' && bdc.adresseLivraison) {
            doc.fontSize(10)
               .fillColor(colors.text)
               .font('Helvetica')
               .text('Chantier:', 60, yPos)
               .text(bdc.adresseLivraison, 60, yPos + 15, { width: 450 });
            yPos += 35;
          }
        }

        // === TABLEAU DES ARTICLES ===
        yPos += 20;

        if (bdc.lignes && bdc.lignes.length > 0) {
          // Titre section articles
          doc.fontSize(16)
             .fillColor(colors.secondary)
             .font('Helvetica-Bold')
             .text('ARTICLES COMMANDÉS', 50, yPos);
          
          yPos += 35;

          // En-tête du tableau avec fond coloré
          const tableHeaderY = yPos;
          doc.rect(50, tableHeaderY - 5, 495, 25)
             .fillColor(colors.primary)
             .fill();

          // Textes des en-têtes en blanc
          doc.fontSize(11)
             .fillColor('#ffffff')
             .font('Helvetica-Bold')
             .text('DÉSIGNATION', 60, tableHeaderY + 5)
             .text('RÉFÉRENCE', 250, tableHeaderY + 5)
             .text('QTÉ', 350, tableHeaderY + 5)
             .text('P.U. HT', 400, tableHeaderY + 5)
             .text('MONTANT HT', 470, tableHeaderY + 5);

          yPos = tableHeaderY + 30;

          // Lignes des articles avec alternance de couleurs
          bdc.lignes.forEach((ligne, index) => {
            const lineY = yPos + (index * 28);
            
            // Fond alterné pour les lignes
            if (index % 2 === 0) {
              doc.rect(50, lineY - 3, 495, 26)
                 .fillColor('#f8fafc')
                 .fill();
            }

            // Bordure pour chaque ligne
            doc.rect(50, lineY - 3, 495, 26)
               .strokeColor(colors.border)
               .lineWidth(0.5)
               .stroke();
            
            doc.fontSize(10)
               .fillColor(colors.text)
               .font('Helvetica');

            // Désignation en gras
            doc.font('Helvetica-Bold')
               .text(ligne.designation, 60, lineY + 5, { width: 180 });

            doc.font('Helvetica')
               .text(ligne.reference || '-', 250, lineY + 5)
               .text(ligne.quantite.toString(), 350, lineY + 5, { align: 'center', width: 40 })
               .text(ligne.prixUnitaire > 0 ? 
                 `${ligne.prixUnitaire.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}` : 
                 'À définir', 400, lineY + 5, { width: 60 })
               .text(ligne.prixUnitaire > 0 ? 
                 `${ligne.montantLigne.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}` : 
                 'À définir', 470, lineY + 5, { width: 70 });
          });

          yPos += (bdc.lignes.length * 28) + 20;
        } else {
          // Si pas d'articles, afficher la catégorie
          doc.fontSize(16)
             .fillColor(colors.secondary)
             .font('Helvetica-Bold')
             .text('CATÉGORIE', 50, yPos);
          
          yPos += 30;

          doc.rect(50, yPos - 5, 495, 40)
             .fillColor(colors.light)
             .fill()
             .strokeColor(colors.border)
             .stroke();

          doc.fontSize(12)
             .fillColor(colors.text)
             .font('Helvetica')
             .text(bdc.categorie.intitule, 60, yPos + 5)
             .font('Helvetica-Bold')
             .text(`${bdc.montantHt.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`, 400, yPos + 5);

          yPos += 50;
        }

        // === TOTAL (COULEUR JAUNE) ===
        // Encadré pour le total
        doc.rect(350, yPos, 195, 35)
           .fillColor(colors.jaune)
           .fill();

        doc.fontSize(14)
           .fillColor('#000000')
           .font('Helvetica-Bold')
           .text('TOTAL HT:', 360, yPos + 10)
           .fontSize(16)
           .text(`${bdc.montantHt.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`, 450, yPos + 8);

        yPos += 60;

        // === MENTION NUMÉRO DE COMMANDE ===
        doc.fontSize(11)
           .fillColor(colors.secondary)
           .font('Helvetica-Bold')
           .text(`Mentionner ce numéro de bon de commande : ${bdc.numero}`, 50, yPos);

        yPos += 30;

        // === COMMENTAIRE ===
        if (bdc.commentaire) {
          doc.fontSize(12)
             .fillColor(colors.secondary)
             .font('Helvetica-Bold')
             .text('COMMENTAIRE:', 50, yPos);
          
          yPos += 25;

          doc.rect(50, yPos - 5, 495, 40)
             .fillColor('#FDF5E6')
             .fill()
             .strokeColor(colors.soleil)
             .stroke();

          doc.fontSize(10)
             .fillColor(colors.text)
             .font('Helvetica')
             .text(bdc.commentaire, 60, yPos + 5, { width: 475 });

          yPos += 50;
        }

        // === PIED DE PAGE ===
        // Ligne de séparation
        doc.moveTo(50, 750)
           .lineTo(545, 750)
           .strokeColor(colors.border)
           .lineWidth(1)
           .stroke();

        doc.fontSize(8)
           .fillColor('#9ca3af')
           .font('Helvetica')
           .text('Document généré automatiquement par MAI GESTION', 50, 760, { align: 'center' })
           .text(`${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 50, 770, { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve(pdfPath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
} 