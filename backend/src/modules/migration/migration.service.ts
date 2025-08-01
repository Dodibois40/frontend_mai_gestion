import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class MigrationService {
  constructor(private prisma: PrismaService) {}

  // Exporter les affaires vers Excel
  async exportAffaires(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Affaires');

    // Définir les colonnes
    worksheet.columns = [
      { header: 'Numéro', key: 'numero', width: 15 },
      { header: 'Libellé', key: 'libelle', width: 30 },
      { header: 'Client', key: 'client', width: 25 },
      { header: 'Adresse', key: 'adresse', width: 40 },
      { header: 'Date Création', key: 'dateCreation', width: 15 },
      { header: 'Date Clôture Prévue', key: 'dateCloturePrevue', width: 20 },
      { header: 'Objectif CA HT (€)', key: 'objectifCaHt', width: 18 },
      { header: 'Objectif Achat HT (€)', key: 'objectifAchatHt', width: 20 },
      { header: 'Objectif Heures Fab', key: 'objectifHeuresFab', width: 20 },
      { header: 'SER', key: 'ser', width: 10 },
      { header: 'POSE', key: 'pose', width: 10 },
      { header: 'Statut', key: 'statut', width: 15 },
    ];

    // Récupérer les données
    const affaires = await this.prisma.affaire.findMany({
      orderBy: { dateCreation: 'desc' }
    });

    // Ajouter les données
    affaires.forEach(affaire => {
      worksheet.addRow({
        numero: affaire.numero,
        libelle: affaire.libelle,
        client: affaire.client,
        adresse: affaire.adresse,
        dateCreation: affaire.dateCreation,
        dateCloturePrevue: affaire.dateCloturePrevue,
        objectifCaHt: affaire.objectifCaHt,
        objectifAchatHt: affaire.objectifAchatHt,
        objectifHeuresFab: affaire.objectifHeuresFab,
        objectifHeuresSer: affaire.objectifHeuresSer,
        objectifHeuresPose: affaire.objectifHeuresPose,
        statut: affaire.statut,
      });
    });

    // Style des en-têtes
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Retourner le buffer
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  // Exporter les articles vers Excel
  async exportArticles(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Articles');

    worksheet.columns = [
      { header: 'Code', key: 'code', width: 15 },
      { header: 'Désignation', key: 'designation', width: 40 },
      { header: 'Unité', key: 'unite', width: 10 },
      { header: 'Prix Unitaire (€)', key: 'prixUnitaire', width: 18 },
      { header: 'Stock Actuel', key: 'stockActuel', width: 15 },
      { header: 'Stock Minimum', key: 'stockMinimum', width: 15 },
      { header: 'Stock Maximum', key: 'stockMaximum', width: 15 },
      { header: 'Emplacement', key: 'emplacement', width: 20 },
      { header: 'Fournisseur', key: 'fournisseur', width: 25 },
      { header: 'Actif', key: 'actif', width: 10 },
    ];

    const articles = await this.prisma.article.findMany({
      orderBy: { code: 'asc' }
    });

    articles.forEach(article => {
      worksheet.addRow({
        code: article.code,
        designation: article.designation,
        unite: article.unite,
        prixUnitaire: article.prixUnitaire,
        stockActuel: article.stockActuel,
        stockMinimum: article.stockMinimum,
        stockMaximum: article.stockMaximum,
        emplacement: article.emplacement,
        fournisseur: article.fournisseur,
        actif: article.actif ? 'Oui' : 'Non',
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  // Exporter les BDC vers Excel
  async exportBdc(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bons de Commande');

    worksheet.columns = [
      { header: 'Numéro BDC', key: 'numero', width: 15 },
      { header: 'Affaire', key: 'affaire', width: 20 },
      { header: 'Catégorie', key: 'categorie', width: 20 },
      { header: 'Fournisseur', key: 'fournisseur', width: 25 },
      { header: 'Montant HT (€)', key: 'montantHt', width: 15 },
      { header: 'Montant FG (€)', key: 'montantFg', width: 15 },
      { header: 'Date BDC', key: 'dateBdc', width: 15 },
      { header: 'Date Réception', key: 'dateReception', width: 18 },
      { header: 'Commentaire', key: 'commentaire', width: 30 },
    ];

    const bdcs = await this.prisma.bdc.findMany({
      include: {
        affaire: { select: { numero: true } },
        categorie: { select: { intitule: true } }
      },
      orderBy: { dateBdc: 'desc' }
    });

    bdcs.forEach(bdc => {
      worksheet.addRow({
        numero: bdc.numero,
        affaire: bdc.affaire.numero,
        categorie: bdc.categorie.intitule,
        fournisseur: bdc.fournisseur,
        montantHt: bdc.montantHt,
        montantFg: bdc.montantFg,
        dateBdc: bdc.dateBdc,
        dateReception: bdc.dateReception,
        commentaire: bdc.commentaire,
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  // Générer un modèle Excel pour les articles
  async generateArticlesTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Modèle Articles');

    worksheet.columns = [
      { header: 'Code *', key: 'code', width: 15 },
      { header: 'Désignation *', key: 'designation', width: 40 },
      { header: 'Unité *', key: 'unite', width: 10 },
      { header: 'Prix Unitaire (€) *', key: 'prixUnitaire', width: 18 },
      { header: 'Stock Actuel', key: 'stockActuel', width: 15 },
      { header: 'Stock Minimum', key: 'stockMinimum', width: 15 },
      { header: 'Stock Maximum', key: 'stockMaximum', width: 15 },
      { header: 'Emplacement', key: 'emplacement', width: 20 },
      { header: 'Fournisseur', key: 'fournisseur', width: 25 },
      { header: 'Actif', key: 'actif', width: 10 },
    ];

    // Ajouter quelques exemples
    worksheet.addRow({
      code: 'BOI-001',
      designation: 'Planche de chêne 20x200x2000',
      unite: 'pièce',
      prixUnitaire: 25.50,
      stockActuel: 100,
      stockMinimum: 20,
      stockMaximum: 200,
      emplacement: 'Hangar A - Étagère 1',
      fournisseur: 'Scierie Martin',
      actif: 'Oui'
    });

    worksheet.addRow({
      code: 'VIS-001',
      designation: 'Vis bois 4x40mm',
      unite: 'boîte',
      prixUnitaire: 8.90,
      stockActuel: 50,
      stockMinimum: 10,
      stockMaximum: 100,
      emplacement: 'Atelier - Tiroir 3',
      fournisseur: 'Visserie Pro',
      actif: 'Oui'
    });

    // Style des en-têtes
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  // Générer un modèle Excel pour les affaires
  async generateAffairesTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Modèle Affaires');

    worksheet.columns = [
      { header: 'Numéro *', key: 'numero', width: 15 },
      { header: 'Libellé *', key: 'libelle', width: 30 },
      { header: 'Client *', key: 'client', width: 25 },
      { header: 'Adresse', key: 'adresse', width: 40 },
      { header: 'Objectif CA HT (€) *', key: 'objectifCaHt', width: 18 },
      { header: 'Objectif Achat HT (€) *', key: 'objectifAchatHt', width: 20 },
      { header: 'Objectif Heures Fab', key: 'objectifHeuresFab', width: 20 },
      { header: 'SER', key: 'ser', width: 10 },
      { header: 'POSE', key: 'pose', width: 10 },
      { header: 'Statut', key: 'statut', width: 15 },
      { header: 'Date Clôture Prévue', key: 'dateCloturePrevue', width: 20 },
    ];

    // Ajouter un exemple
    worksheet.addRow({
      numero: '24-BOIS-001',
      libelle: 'Cuisine sur mesure - Maison Dupont',
      client: 'Famille Dupont',
      adresse: '123 Rue des Érables, 75001 Paris',
      objectifCaHt: 15000,
      objectifAchatHt: 8000,
      objectifHeuresFab: 120,
      ser: 2000,
      pose: 1500,
      statut: 'PLANIFIEE',
      dateCloturePrevue: new Date('2024-06-30')
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  // Import basique (à étendre selon les besoins)
  async importArticles(buffer: Buffer): Promise<{ created: number; updated: number; errors: string[] }> {
    // Pour l'instant, retourner un résultat factice
    // L'implémentation complète nécessiterait plus de travail sur les types ExcelJS
    return {
      created: 0,
      updated: 0,
      errors: ['Fonction d\'import à implémenter selon les besoins spécifiques']
    };
  }

  async importAffaires(buffer: Buffer): Promise<{ created: number; updated: number; errors: string[] }> {
    // Pour l'instant, retourner un résultat factice
    return {
      created: 0,
      updated: 0,
      errors: ['Fonction d\'import à implémenter selon les besoins spécifiques']
    };
  }
} 