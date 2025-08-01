import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  NotFoundException,
  UseGuards,
  InternalServerErrorException,
  Req,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { BdcService } from './bdc.service';
import { CreateBdcDto, DeleteBdcDto } from './dto/create-bdc.dto';
import { UpdateBdcDto } from './dto/update-bdc.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';
import { UploadService } from '../../common/services/upload.service';
import { Public } from '../auth/decorators/public.decorator';
import { IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';

// DTO pour la réception d'un BDC
class ReceptionBdcDto {
  @ApiProperty({
    description: 'Date de réception du bon de commande',
    example: '2024-03-15T10:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  dateReception: Date;
}

@ApiTags('bdc')
@Controller('bdc')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BdcController {
  constructor(
    private readonly bdcService: BdcService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Créer un nouveau bon de commande' })
  @ApiResponse({ status: 201, description: 'Bon de commande créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Conflit - numéro déjà existant' })
  create(@Body() createBdcDto: CreateBdcDto) {
    return this.bdcService.create(createBdcDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les bons de commande avec pagination et filtres' })
  @ApiQuery({ name: 'affaireId', required: false, description: 'Filtrer par ID d\'affaire' })
  @ApiQuery({ name: 'fournisseur', required: false, description: 'Filtrer par fournisseur' })
  @ApiQuery({ name: 'skip', required: false, description: 'Nombre d\'éléments à sauter (pagination)' })
  @ApiQuery({ name: 'take', required: false, description: 'Nombre d\'éléments à prendre (pagination)' })
  @ApiResponse({ status: 200, description: 'Liste des bons de commande récupérée avec succès' })
  findAll(
    @Query('affaireId') affaireId?: string,
    @Query('fournisseur') fournisseur?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take?: number,
  ) {
    return this.bdcService.findAll(affaireId, fournisseur, skip, take);
  }

  @Get('affaire/:affaireId/stats')
  @ApiOperation({ summary: 'Récupérer les statistiques d\'achat pour une affaire' })
  @ApiParam({ name: 'affaireId', description: 'ID de l\'affaire' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès' })
  @ApiResponse({ status: 404, description: 'Affaire non trouvée' })
  getStatsByAffaire(@Param('affaireId', ParseUUIDPipe) affaireId: string) {
    return this.bdcService.getStatsByAffaire(affaireId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un bon de commande par son ID' })
  @ApiParam({ name: 'id', description: 'ID du bon de commande' })
  @ApiResponse({ status: 200, description: 'Bon de commande récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Bon de commande non trouvé' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bdcService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Mettre à jour un bon de commande' })
  @ApiParam({ name: 'id', description: 'ID du bon de commande' })
  @ApiResponse({ status: 200, description: 'Bon de commande mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Bon de commande non trouvé' })
  @ApiResponse({ status: 409, description: 'Conflit - numéro déjà existant' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBdcDto: UpdateBdcDto,
  ) {
    return this.bdcService.update(id, updateBdcDto);
  }

  @Patch(':id/receptionner')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR)
  @ApiOperation({ summary: 'Réceptionner un bon de commande' })
  @ApiParam({ name: 'id', description: 'ID du bon de commande' })
  @ApiResponse({ status: 200, description: 'Bon de commande réceptionné avec succès' })
  @ApiResponse({ status: 404, description: 'Bon de commande non trouvé' })
  receptionner(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() receptionDto: ReceptionBdcDto,
  ) {
    return this.bdcService.receptionner(id, receptionDto.dateReception);
  }

  @Patch(':id/valider')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE, RoleEnum.ACHETEUR)
  @ApiOperation({ summary: 'Valider un bon de commande' })
  @ApiParam({ name: 'id', description: 'ID du bon de commande' })
  @ApiResponse({ status: 200, description: 'Bon de commande validé avec succès' })
  @ApiResponse({ status: 404, description: 'Bon de commande non trouvé' })
  valider(@Param('id', ParseUUIDPipe) id: string) {
    return this.bdcService.valider(id);
  }

  @Patch(':id/annuler')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE, RoleEnum.ACHETEUR)
  @ApiOperation({ summary: 'Annuler un bon de commande' })
  @ApiParam({ name: 'id', description: 'ID du bon de commande' })
  @ApiResponse({ status: 200, description: 'Bon de commande annulé avec succès' })
  @ApiResponse({ status: 404, description: 'Bon de commande non trouvé' })
  annuler(@Param('id', ParseUUIDPipe) id: string) {
    return this.bdcService.annuler(id);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE, RoleEnum.ACHETEUR)
  @ApiOperation({ summary: 'Supprimer un bon de commande' })
  @ApiParam({ name: 'id', description: 'ID du bon de commande' })
  @ApiBody({ 
    type: DeleteBdcDto, 
    required: false,
    description: 'Mot de passe requis pour supprimer un BDC validé' 
  })
  @ApiResponse({ status: 200, description: 'Bon de commande supprimé avec succès' })
  @ApiResponse({ status: 400, description: 'Mot de passe requis pour supprimer un BDC validé' })
  @ApiResponse({ status: 401, description: 'Mot de passe incorrect' })
  @ApiResponse({ status: 404, description: 'Bon de commande non trouvé' })
  remove(
    @Param('id') id: string,
    @Body() body?: any,
    @Req() req?: any
  ) {
    console.log('🎯 [BDC DELETE] Request received!', { 
      id, 
      hasBody: !!body,
      bodyKeys: body ? Object.keys(body) : [],
      passwordValue: body?.password,
      userRole: req?.user?.role,
      userEmail: req?.user?.email
    });
    
    // Extraire le mot de passe du body si il existe et n'est pas vide
    const password = body?.password && body.password.trim() !== '' ? body.password : undefined;
    
    console.log('🎯 [BDC DELETE] Extracted password:', { hasPassword: !!password });
    
    return this.bdcService.remove(id, password);
  }

  @Post(':id/upload-pdf')
  @ApiOperation({ summary: 'Uploader un fichier PDF pour un BDC' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Fichier uploadé avec succès' })
  @ApiResponse({ status: 400, description: 'Fichier invalide' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.bdcService.uploadPdf(id, file);
  }

  @Get(':id/download-pdf')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Télécharger le PDF d\'un bon de commande' })
  @ApiParam({ name: 'id', description: 'ID du bon de commande' })
  @ApiResponse({ status: 200, description: 'PDF du bon de commande' })
  @ApiResponse({ status: 404, description: 'Bon de commande non trouvé' })
  async downloadPdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const pdfPath = await this.bdcService.generatePdf(id);
    
    // Récupérer les informations du BDC pour le nom du fichier
    const bdc = await this.bdcService.findOne(id);
    const fileName = `${bdc.numero}.pdf`;

    // Configurer les headers de réponse
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    const file = createReadStream(pdfPath);
    return new StreamableFile(file);
  }

  @Get(':id/view-pdf')
  @Public() // Temporaire pour permettre l'accès direct aux PDFs
  @ApiOperation({ summary: 'Visualiser le fichier PDF d\'un BDC dans le navigateur' })
  @ApiResponse({ status: 200, description: 'Fichier affiché' })
  @ApiResponse({ status: 404, description: 'Fichier non trouvé' })
  async viewPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    try {
      const bdc = await this.bdcService.findOne(id);
      
      if (!bdc.fichierPdf) {
        throw new NotFoundException('Aucun fichier PDF associé à ce BDC');
      }

      // Chercher le fichier dans le dossier bdc-pdf
      const pdfDir = path.join(process.cwd(), 'uploads', 'bdc-pdf');
      const filePath = path.join(pdfDir, bdc.fichierPdf);
      
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('Fichier PDF non trouvé');
      }

      const file = fs.createReadStream(filePath);
      
      // Headers optimisés pour l'affichage PDF dans le navigateur
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${bdc.nomFichier || 'bdc.pdf'}"`,
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
  @Public() // Temporaire pour permettre l'accès direct aux PDFs
  @ApiOperation({ summary: 'Endpoint alternatif pour l\'embed PDF' })
  @ApiResponse({ status: 200, description: 'Fichier PDF pour embed' })
  @ApiResponse({ status: 404, description: 'Fichier non trouvé' })
  async pdfEmbed(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const bdc = await this.bdcService.findOne(id);
      
      if (!bdc.fichierPdf) {
        throw new NotFoundException('Aucun fichier PDF associé à ce BDC');
      }

      // Chercher le fichier dans le dossier bdc-pdf
      const pdfDir = path.join(process.cwd(), 'uploads', 'bdc-pdf');
      const filePath = path.join(pdfDir, bdc.fichierPdf);
      
      if (!fs.existsSync(filePath)) {
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
  @ApiOperation({ summary: 'Supprimer le fichier PDF d\'un BDC' })
  @ApiResponse({ status: 200, description: 'Fichier supprimé avec succès' })
  async deletePdf(@Param('id', ParseUUIDPipe) id: string) {
    return this.bdcService.deletePdf(id);
  }

  @Get(':id/pdf-proxy')
  @Public() // Temporaire pour permettre l'accès aux proxys PDF
  async proxyPdf(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    try {
      // Récupérer le BDC avec l'URL Firebase
      const bdc = await this.bdcService.findOne(id);
      if (!bdc || !bdc.firebaseDownloadUrl) {
        throw new NotFoundException('BDC ou fichier PDF non trouvé');
      }

      // Vérifier les permissions (optionnel - peut être simplifié)
      // ... logique de vérification des permissions ...

      // Proxy vers Firebase Storage
      const response = await fetch(bdc.firebaseDownloadUrl);
      if (!response.ok) {
        throw new Error(`Erreur Firebase Storage: ${response.status}`);
      }

      // Copier les en-têtes appropriés
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${bdc.nomFichier || 'document.pdf'}"`,
        'Access-Control-Allow-Origin': '*', // Résout le problème CORS
        'Cache-Control': 'public, max-age=3600'
      });

      // Streamer le contenu
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));

    } catch (error) {
      console.error('Erreur proxy PDF:', error);
      throw new InternalServerErrorException('Erreur lors du chargement du PDF');
    }
  }
} 