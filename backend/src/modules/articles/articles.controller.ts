import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';

@ApiTags('articles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR)
  @ApiOperation({ summary: 'Créer un nouvel article' })
  @ApiResponse({ status: 201, description: 'Article créé avec succès.' })
  @ApiResponse({ status: 409, description: 'Conflit - Un article avec ce code existe déjà.' })
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  @Get()
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Récupérer tous les articles' })
  @ApiResponse({ status: 200, description: 'Liste des articles récupérée avec succès.' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Nombre d\'éléments à ignorer' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Nombre d\'éléments à récupérer' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Recherche par code, désignation ou fournisseur' })
  @ApiQuery({ name: 'actif', required: false, type: Boolean, description: 'Filtrer par statut actif' })
  @ApiQuery({ name: 'stockFaible', required: false, type: Boolean, description: 'Filtrer les articles avec stock faible' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('actif') actif?: string,
    @Query('stockFaible') stockFaible?: string,
  ) {
    return this.articlesService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      search,
      actif: actif ? actif === 'true' : undefined,
      stockFaible: stockFaible ? stockFaible === 'true' : undefined,
    });
  }

  @Get('stats')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Récupérer les statistiques des articles' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès.' })
  getStats() {
    return this.articlesService.getStats();
  }

  @Get('stock-faible')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Récupérer les articles avec stock faible' })
  @ApiResponse({ status: 200, description: 'Articles avec stock faible récupérés avec succès.' })
  getArticlesStockFaible() {
    return this.articlesService.getArticlesStockFaible();
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Récupérer un article par son ID' })
  @ApiResponse({ status: 200, description: 'Article trouvé.' })
  @ApiResponse({ status: 404, description: 'Article non trouvé.' })
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR)
  @ApiOperation({ summary: 'Mettre à jour un article' })
  @ApiResponse({ status: 200, description: 'Article mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Article non trouvé.' })
  @ApiResponse({ status: 409, description: 'Conflit - Un article avec ce code existe déjà.' })
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.ACHETEUR)
  @ApiOperation({ summary: 'Supprimer un article (désactivation)' })
  @ApiResponse({ status: 200, description: 'Article désactivé avec succès.' })
  @ApiResponse({ status: 404, description: 'Article non trouvé.' })
  remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }
} 