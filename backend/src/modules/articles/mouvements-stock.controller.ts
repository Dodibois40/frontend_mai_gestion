import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MouvementsStockService } from './mouvements-stock.service';
import { CreateMouvementStockDto } from './dto/create-mouvement-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';

@ApiTags('mouvements-stock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mouvements-stock')
export class MouvementsStockController {
  constructor(private readonly mouvementsStockService: MouvementsStockService) {}

  @Post()
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR, RoleEnum.CHEF_ATELIER)
  @ApiOperation({ summary: 'Créer un nouveau mouvement de stock' })
  @ApiResponse({ status: 201, description: 'Mouvement créé avec succès.' })
  @ApiResponse({ status: 404, description: 'Article non trouvé.' })
  @ApiResponse({ status: 400, description: 'Stock insuffisant pour cette sortie.' })
  create(@Body() createMouvementStockDto: CreateMouvementStockDto, @Request() req: any) {
    return this.mouvementsStockService.create(createMouvementStockDto, req.user.sub);
  }

  @Get()
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Récupérer tous les mouvements de stock' })
  @ApiResponse({ status: 200, description: 'Liste des mouvements récupérée avec succès.' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Nombre d\'éléments à ignorer' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Nombre d\'éléments à récupérer' })
  @ApiQuery({ name: 'articleId', required: false, type: String, description: 'Filtrer par article' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filtrer par utilisateur' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filtrer par type de mouvement' })
  @ApiQuery({ name: 'dateDebut', required: false, type: String, description: 'Date de début (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateFin', required: false, type: String, description: 'Date de fin (YYYY-MM-DD)' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('articleId') articleId?: string,
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return this.mouvementsStockService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      articleId,
      userId,
      type,
      dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      dateFin: dateFin ? new Date(dateFin) : undefined,
    });
  }

  @Get('stats')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Récupérer les statistiques des mouvements' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès.' })
  @ApiQuery({ name: 'dateDebut', required: false, type: String, description: 'Date de début (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateFin', required: false, type: String, description: 'Date de fin (YYYY-MM-DD)' })
  getStats(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return this.mouvementsStockService.getStats({
      dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      dateFin: dateFin ? new Date(dateFin) : undefined,
    });
  }

  @Get('article/:articleId')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Récupérer l\'historique des mouvements d\'un article' })
  @ApiResponse({ status: 200, description: 'Historique récupéré avec succès.' })
  @ApiResponse({ status: 404, description: 'Article non trouvé.' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Nombre d\'éléments à ignorer' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Nombre d\'éléments à récupérer' })
  getHistoriqueArticle(
    @Param('articleId') articleId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.mouvementsStockService.getHistoriqueArticle(articleId, {
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
    });
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Récupérer un mouvement par son ID' })
  @ApiResponse({ status: 200, description: 'Mouvement trouvé.' })
  @ApiResponse({ status: 404, description: 'Mouvement non trouvé.' })
  findOne(@Param('id') id: string) {
    return this.mouvementsStockService.findOne(id);
  }
} 