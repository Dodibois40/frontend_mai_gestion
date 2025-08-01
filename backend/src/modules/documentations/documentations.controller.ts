import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  StreamableFile,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocumentationsService } from './documentations.service';
import { ThumbnailService } from './services/thumbnail.service';
import { CreateDocumentationDto } from './dto/create-documentation.dto';
import { UpdateDocumentationDto } from './dto/update-documentation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { createReadStream } from 'fs';
import * as path from 'path';
import { JwtService } from '@nestjs/jwt';

@Controller('documentations')
export class DocumentationsController {
  constructor(
    private readonly documentationsService: DocumentationsService,
    private readonly thumbnailService: ThumbnailService,
    private readonly jwtService: JwtService,
  ) {}



  // Méthode utilitaire pour valider le token depuis la query
  private async validateTokenFromQuery(token: string) {
    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch {
      throw new UnauthorizedException('Token invalide');
    }
  }



  @Post('affaire/:affaireId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('affaireId') affaireId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @CurrentUser() user: any,
  ) {
    console.log('📄 Upload request received:');
    console.log('- affaireId:', affaireId);
    console.log('- file:', file ? file.originalname : 'NO FILE');
    console.log('- body:', body);
    console.log('- user:', user?.id);

    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Créer le DTO à partir des données reçues
    const createDocumentationDto: CreateDocumentationDto = {
      nom: body.nom,
      categorie: body.categorie,
      sousCategorie: body.sousCategorie || null,
      description: body.description || null,
      affaireId: affaireId,
    };

    console.log('📄 DTO créé:', createDocumentationDto);

    try {
      const result = await this.documentationsService.create(
        createDocumentationDto,
        file,
        user.id,
      );
      console.log('📄 Upload réussi:', result.id);
      return result;
    } catch (error) {
      console.error('📄 Erreur upload:', error);
      throw error;
    }
  }

  @Public()
  @Get(':id/thumbnail')
  async getThumbnail(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    console.log('🖼️ Demande de miniature pour document:', id);

    try {
      // Récupérer les infos du document
      const document = await this.documentationsService.findOne(id);
      if (!document) {
        console.error('❌ Document non trouvé:', id);
        throw new BadRequestException('Document non trouvé');
      }

      const thumbnailFileName = `${id}.jpg`;
      
      // Vérifier si la miniature existe
      if (!this.thumbnailService.thumbnailExists(thumbnailFileName)) {
        console.log('🔧 Miniature manquante, génération...');
        
        // Générer la miniature si elle n'existe pas
        const originalFilePath = document.chemin;
        await this.thumbnailService.generateThumbnail(originalFilePath, id);
      }

      const thumbnailPath = this.thumbnailService.getThumbnailPath(thumbnailFileName);
      
      if (!this.thumbnailService.thumbnailExists(thumbnailFileName)) {
        console.error('❌ Impossible de générer/trouver la miniature');
        throw new BadRequestException('Miniature non disponible');
      }

      console.log('✅ Miniature servie:', thumbnailFileName);

      // Configurer les headers de réponse
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `inline; filename="${thumbnailFileName}"`,
        'Cache-Control': 'public, max-age=3600', // Cache 1 heure
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      });

      const file = createReadStream(thumbnailPath);
      return new StreamableFile(file);

    } catch (error) {
      console.error('❌ Erreur récupération miniature:', error.message);
      throw error;
    }
  }

  @Get('affaire/:affaireId')
  @UseGuards(JwtAuthGuard)
  async findAllByAffaire(@Param('affaireId') affaireId: string) {
    return this.documentationsService.findAllByAffaire(affaireId);
  }

  @Get('affaire/:affaireId/stats')
  @UseGuards(JwtAuthGuard)
  async getStatsByAffaire(@Param('affaireId') affaireId: string) {
    return this.documentationsService.getStatsByAffaire(affaireId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.documentationsService.findOne(id);
  }

  @Public()
  @Get(':id/download')
  async downloadDocument(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
    @Query('token') token?: string,
  ): Promise<StreamableFile> {
    // Valider le token si fourni dans la query (pour les liens directs)
    if (token) {
      await this.validateTokenFromQuery(token);
    }

    const documentation = await this.documentationsService.findOne(id);
    const filePath = await this.documentationsService.getFilePath(id);

    // Définir les headers pour le téléchargement
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${documentation.nomOriginal}"`,
    });

    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }

  @Public()
  @Get(':id/preview')
  async previewDocument(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
    @Query('token') token?: string,
  ): Promise<StreamableFile> {
    console.log('🔍 Preview request:', { id, tokenPresent: !!token });
    
    // Validation obligatoire du token (soit via headers, soit via query)
    if (token) {
      console.log('🔑 Validation du token depuis query...');
      try {
        const tokenPayload = await this.validateTokenFromQuery(token);
        console.log('✅ Token validé avec succès:', tokenPayload.sub);
      } catch (error) {
        console.error('❌ Erreur validation token query:', error.message);
        throw new UnauthorizedException('Token invalide: ' + error.message);
      }
    } else {
      console.warn('⚠️ Aucun token fourni pour la prévisualisation');
      throw new UnauthorizedException('Token requis pour la prévisualisation');
    }

    const documentation = await this.documentationsService.findOne(id);
    const filePath = await this.documentationsService.getFilePath(id);

    // Déterminer le content-type basé sur l'extension
    const ext = path.extname(documentation.nomOriginal).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Définir les headers pour la prévisualisation
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${documentation.nomOriginal}"`,
    });

    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDocumentationDto: UpdateDocumentationDto,
  ) {
    return this.documentationsService.update(id, updateDocumentationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.documentationsService.remove(id);
  }
} 