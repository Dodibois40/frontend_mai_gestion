import { 
  Controller, 
  Get, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  Res, 
  UseGuards,
  Query,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';
import { MigrationService } from './migration.service';

@Controller('migration')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  // Exporter les affaires vers Excel
  @Get('export/affaires')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER)
  async exportAffaires(@Res() res: Response) {
    try {
      const buffer = await this.migrationService.exportAffaires();
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="affaires_${new Date().toISOString().split('T')[0]}.xlsx"`,
        'Content-Length': buffer.length.toString(),
      });

      res.send(buffer);
    } catch (error) {
      throw new BadRequestException(`Erreur lors de l'export des affaires: ${error.message}`);
    }
  }

  // Exporter les articles vers Excel
  @Get('export/articles')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER)
  async exportArticles(@Res() res: Response) {
    try {
      const buffer = await this.migrationService.exportArticles();
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="articles_${new Date().toISOString().split('T')[0]}.xlsx"`,
        'Content-Length': buffer.length.toString(),
      });

      res.send(buffer);
    } catch (error) {
      throw new BadRequestException(`Erreur lors de l'export des articles: ${error.message}`);
    }
  }

  // Exporter les BDC vers Excel
  @Get('export/bdc')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER)
  async exportBdc(@Res() res: Response) {
    try {
      const buffer = await this.migrationService.exportBdc();
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="bdc_${new Date().toISOString().split('T')[0]}.xlsx"`,
        'Content-Length': buffer.length.toString(),
      });

      res.send(buffer);
    } catch (error) {
      throw new BadRequestException(`Erreur lors de l'export des BDC: ${error.message}`);
    }
  }

  // Télécharger le modèle Excel pour les articles
  @Get('template/articles')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER)
  async downloadArticlesTemplate(@Res() res: Response) {
    try {
      const buffer = await this.migrationService.generateArticlesTemplate();
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="modele_articles.xlsx"',
        'Content-Length': buffer.length.toString(),
      });

      res.send(buffer);
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la génération du modèle: ${error.message}`);
    }
  }

  // Télécharger le modèle Excel pour les affaires
  @Get('template/affaires')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER)
  async downloadAffairesTemplate(@Res() res: Response) {
    try {
      const buffer = await this.migrationService.generateAffairesTemplate();
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="modele_affaires.xlsx"',
        'Content-Length': buffer.length.toString(),
      });

      res.send(buffer);
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la génération du modèle: ${error.message}`);
    }
  }

  // Importer des articles depuis Excel
  @Post('import/articles')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER)
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        cb(null, true);
      } else {
        cb(new BadRequestException('Seuls les fichiers Excel (.xlsx) sont acceptés'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
    },
  }))
  async importArticles(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    try {
      const results = await this.migrationService.importArticles(file.buffer);
      return {
        success: true,
        message: `Import terminé: ${results.created} articles créés, ${results.updated} articles mis à jour`,
        details: results,
      };
    } catch (error) {
      throw new BadRequestException(`Erreur lors de l'import: ${error.message}`);
    }
  }

  // Importer des affaires depuis Excel
  @Post('import/affaires')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER)
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        cb(null, true);
      } else {
        cb(new BadRequestException('Seuls les fichiers Excel (.xlsx) sont acceptés'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
    },
  }))
  async importAffaires(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    try {
      const results = await this.migrationService.importAffaires(file.buffer);
      return {
        success: true,
        message: `Import terminé: ${results.created} affaires créées, ${results.updated} affaires mises à jour`,
        details: results,
      };
    } catch (error) {
      throw new BadRequestException(`Erreur lors de l'import: ${error.message}`);
    }
  }
} 