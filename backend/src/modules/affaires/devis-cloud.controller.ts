import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  Res,
  ParseUUIDPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { DevisService } from './devis.service';

@ApiTags('devis-cloud')
@Controller('devis-cloud')
export class DevisCloudController {
  constructor(private readonly devisService: DevisService) {}

  @Get(':id/google-drive-preview')
  @ApiOperation({ summary: 'Obtenir le lien de prévisualisation Google Drive' })
  @ApiResponse({ status: 200, description: 'Lien de prévisualisation généré' })
  @ApiResponse({ status: 404, description: 'Devis non trouvé' })
  async getGoogleDrivePreview(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const devis = await this.devisService.findOne(id);
      
      if (!devis.fichierPdf) {
        throw new NotFoundException('Aucun fichier PDF associé à ce devis');
      }

      // Générer l'URL de prévisualisation Google Drive
      const baseUrl = process.env.API_URL || 'http://localhost:8000';
      const pdfUrl = `${baseUrl}/api/devis/${id}/download-pdf`;
      
      // URL Google Drive Viewer
      const googleViewerUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(pdfUrl)}`;
      
      return {
        success: true,
        data: {
          devisId: id,
          fileName: devis.nomFichier || `devis_${devis.numero}.pdf`,
          googleViewerUrl,
          directDownloadUrl: pdfUrl,
          previewType: 'google-drive'
        }
      };
      
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la génération du lien de prévisualisation: ${error.message}`);
    }
  }

  @Get(':id/pdf-info')
  @ApiOperation({ summary: 'Obtenir les informations détaillées du PDF' })
  @ApiResponse({ status: 200, description: 'Informations du PDF' })
  async getPdfInfo(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const devis = await this.devisService.findOne(id);
      
      if (!devis.fichierPdf) {
        throw new NotFoundException('Aucun fichier PDF associé à ce devis');
      }

      const baseUrl = process.env.API_URL || 'http://localhost:8000';
      
      return {
        success: true,
        data: {
          devisId: id,
          fileName: devis.nomFichier || `devis_${devis.numero}.pdf`,
          fileSize: devis.tailleFichier,
          uploadDate: devis.dateUpload,
          downloadUrl: `${baseUrl}/api/devis/${id}/download-pdf`,
          previewOptions: {
            googleDrive: `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(`${baseUrl}/api/devis/${id}/download-pdf`)}`,
            microsoftOffice: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(`${baseUrl}/api/devis/${id}/download-pdf`)}`,
            directView: `${baseUrl}/api/devis/${id}/view-pdf`
          }
        }
      };
      
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la récupération des informations: ${error.message}`);
    }
  }

  @Get(':id/microsoft-office-preview')
  @ApiOperation({ summary: 'Obtenir le lien de prévisualisation Microsoft Office Online' })
  @ApiResponse({ status: 200, description: 'Lien de prévisualisation Microsoft Office' })
  async getMicrosoftOfficePreview(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const devis = await this.devisService.findOne(id);
      
      if (!devis.fichierPdf) {
        throw new NotFoundException('Aucun fichier PDF associé à ce devis');
      }

      const baseUrl = process.env.API_URL || 'http://localhost:8000';
      const pdfUrl = `${baseUrl}/api/devis/${id}/download-pdf`;
      
      // URL Microsoft Office Online Viewer
      const microsoftViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pdfUrl)}`;
      
      return {
        success: true,
        data: {
          devisId: id,
          fileName: devis.nomFichier || `devis_${devis.numero}.pdf`,
          microsoftViewerUrl,
          directDownloadUrl: pdfUrl,
          previewType: 'microsoft-office'
        }
      };
      
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la génération du lien Microsoft Office: ${error.message}`);
    }
  }

  @Get(':id/smart-preview')
  @ApiOperation({ summary: 'Obtenir le meilleur lien de prévisualisation selon le navigateur' })
  @ApiResponse({ status: 200, description: 'Lien de prévisualisation adaptatif' })
  async getSmartPreview(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userAgent') userAgent?: string
  ) {
    try {
      const devis = await this.devisService.findOne(id);
      
      if (!devis.fichierPdf) {
        throw new NotFoundException('Aucun fichier PDF associé à ce devis');
      }

      const baseUrl = process.env.API_URL || 'http://localhost:8000';
      const pdfUrl = `${baseUrl}/api/devis/${id}/download-pdf`;
      
      // Détecter le navigateur et proposer la meilleure option
      const isChrome = userAgent?.includes('Chrome');
      const isFirefox = userAgent?.includes('Firefox');
      const isSafari = userAgent?.includes('Safari') && !userAgent?.includes('Chrome');
      const isEdge = userAgent?.includes('Edge');

      let recommendedViewer = 'google-drive'; // Par défaut
      
      if (isChrome || isEdge) {
        recommendedViewer = 'native'; // Chrome et Edge ont un bon support PDF natif
      } else if (isFirefox) {
        recommendedViewer = 'google-drive'; // Firefox peut avoir des problèmes
      } else if (isSafari) {
        recommendedViewer = 'microsoft-office'; // Safari peut préférer Microsoft
      }

      const viewers = {
        native: `${baseUrl}/api/devis/${id}/view-pdf`,
        'google-drive': `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(pdfUrl)}`,
        'microsoft-office': `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pdfUrl)}`,
        download: pdfUrl
      };

      return {
        success: true,
        data: {
          devisId: id,
          fileName: devis.nomFichier || `devis_${devis.numero}.pdf`,
          recommendedViewer,
          viewers,
          browserInfo: {
            userAgent: userAgent || 'Unknown',
            isChrome,
            isFirefox,
            isSafari,
            isEdge
          }
        }
      };
      
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la génération du lien adaptatif: ${error.message}`);
    }
  }
} 