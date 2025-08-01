import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { DevisService } from './devis.service';
import { CreateDevisDto } from './dto/create-devis.dto';
import { UpdateDevisDto } from './dto/update-devis.dto';
import { StatutDevis } from '@prisma/client';
import { UploadService } from '../../common/services/upload.service';
import { Public } from '../auth/decorators/public.decorator';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('devis')
@Controller('devis')
@Public() // Temporaire pour les tests
export class DevisController {
  constructor(
    private readonly devisService: DevisService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau devis' })
  @ApiResponse({ status: 201, description: 'Devis créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body(ValidationPipe) createDevisDto: CreateDevisDto) {
    return this.devisService.create(createDevisDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les devis' })
  @ApiQuery({ name: 'affaireId', required: false, description: 'Filtrer par affaire' })
  @ApiQuery({ name: 'statut', required: false, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'skip', required: false, description: 'Nombre d\'éléments à ignorer' })
  @ApiQuery({ name: 'take', required: false, description: 'Nombre d\'éléments à récupérer' })
  async findAll(
    @Query('affaireId') affaireId?: string,
    @Query('statut') statut?: StatutDevis,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.devisService.findAll(
      affaireId,
      statut,
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 10,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Récupérer les statistiques des devis' })
  async getStats() {
    return this.devisService.getStats();
  }

  @Get('affaire/:affaireId')
  @ApiOperation({ summary: 'Récupérer les devis d\'une affaire' })
  async findByAffaire(@Param('affaireId', ParseUUIDPipe) affaireId: string) {
    return this.devisService.findByAffaire(affaireId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un devis par ID' })
  @ApiResponse({ status: 200, description: 'Devis trouvé' })
  @ApiResponse({ status: 404, description: 'Devis non trouvé' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.devisService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un devis' })
  @ApiResponse({ status: 200, description: 'Devis mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Devis non trouvé' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDevisDto: UpdateDevisDto,
  ) {
    return this.devisService.update(id, updateDevisDto);
  }

  @Patch(':id/statut')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un devis' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès' })
  async updateStatut(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('statut') statut: StatutDevis,
  ) {
    return this.devisService.updateStatut(id, statut);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un devis' })
  @ApiResponse({ status: 200, description: 'Devis supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Devis non trouvé' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.devisService.remove(id);
  }

  @Post(':id/upload-pdf')
  @ApiOperation({ summary: 'Uploader un fichier PDF pour un devis' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Fichier uploadé avec succès' })
  @ApiResponse({ status: 400, description: 'Fichier invalide' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.devisService.uploadPdf(id, file);
  }

  @Get(':id/download-pdf')
  @ApiOperation({ summary: 'Télécharger le fichier PDF d\'un devis' })
  @ApiResponse({ status: 200, description: 'Fichier téléchargé' })
  @ApiResponse({ status: 404, description: 'Fichier non trouvé' })
  async downloadPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    try {
      const devis = await this.devisService.findOne(id);
      
      if (!devis.fichierPdf) {
        throw new NotFoundException('Aucun fichier PDF associé à ce devis');
      }

      const filePath = this.uploadService.getFilePath(devis.fichierPdf);
      
      if (!this.uploadService.fileExists(devis.fichierPdf)) {
        throw new NotFoundException('Fichier PDF non trouvé');
      }

      const file = fs.createReadStream(filePath);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${devis.nomFichier || 'devis.pdf'}"`,
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      });

      return new StreamableFile(file);
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      throw error;  
    }
  }

  @Get(':id/view-pdf')
  @ApiOperation({ summary: 'Visualiser le fichier PDF d\'un devis dans le navigateur' })
  @ApiResponse({ status: 200, description: 'Fichier affiché' })
  @ApiResponse({ status: 404, description: 'Fichier non trouvé' })
  async viewPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    try {
      const devis = await this.devisService.findOne(id);
      
      if (!devis.fichierPdf) {
        throw new NotFoundException('Aucun fichier PDF associé à ce devis');
      }

      const filePath = this.uploadService.getFilePath(devis.fichierPdf);
      
      if (!this.uploadService.fileExists(devis.fichierPdf)) {
        throw new NotFoundException('Fichier PDF non trouvé');
      }

      const file = fs.createReadStream(filePath);
      
      // Headers optimisés pour l'affichage PDF dans le navigateur
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${devis.nomFichier || 'devis.pdf'}"`,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=3600', // Cache 1 heure
        'Pragma': 'public',
      });

      return new StreamableFile(file);
    } catch (error) {
      console.error('Erreur lors de la visualisation du PDF:', error);
      throw error;
    }
  }

  @Get(':id/pdf-embed')
  @ApiOperation({ summary: 'Endpoint alternatif pour l\'embed PDF' })
  @ApiResponse({ status: 200, description: 'Fichier PDF pour embed' })
  @ApiResponse({ status: 404, description: 'Fichier non trouvé' })
  async pdfEmbed(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const devis = await this.devisService.findOne(id);
      
      if (!devis.fichierPdf) {
        throw new NotFoundException('Aucun fichier PDF associé à ce devis');
      }

      const filePath = this.uploadService.getFilePath(devis.fichierPdf);
      
      if (!this.uploadService.fileExists(devis.fichierPdf)) {
        throw new NotFoundException('Fichier PDF non trouvé');
      }

      // Configuration spéciale pour les embeds
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Frame-Options', 'ALLOWALL');

      // Envoyer le fichier directement
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      console.error('Erreur lors de l\'embed du PDF:', error);
      res.status(error.status || 500).json({
        message: error.message || 'Erreur serveur',
        statusCode: error.status || 500,
      });
    }
  }

  @Delete(':id/pdf')
  @ApiOperation({ summary: 'Supprimer le fichier PDF d\'un devis' })
  @ApiResponse({ status: 200, description: 'Fichier supprimé avec succès' })
  async deletePdf(@Param('id', ParseUUIDPipe) id: string) {
    return this.devisService.deletePdf(id);
  }
} 