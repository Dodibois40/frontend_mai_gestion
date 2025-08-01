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
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FournisseursService } from './fournisseurs.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Fournisseur } from '@prisma/client';

@ApiTags('fournisseurs')
@Controller('fournisseurs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FournisseursController {
  constructor(private readonly fournisseursService: FournisseursService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau fournisseur' })
  @ApiResponse({ status: 201, description: 'Fournisseur créé avec succès' })
  @ApiResponse({ status: 409, description: 'Un fournisseur avec ce nom existe déjà' })
  create(@Body() createFournisseurDto: CreateFournisseurDto): Promise<Fournisseur> {
    return this.fournisseursService.create(createFournisseurDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les fournisseurs avec pagination et filtres' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page (défaut: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Recherche par nom, contact ou email' })
  @ApiQuery({ name: 'actif', required: false, description: 'Filtrer par statut actif' })
  @ApiQuery({ name: 'enCompte', required: false, description: 'Filtrer par fournisseurs en compte' })
  @ApiQuery({ name: 'categorie', required: false, description: 'Filtrer par catégorie de fournisseur' })
  @ApiResponse({ status: 200, description: 'Liste des fournisseurs récupérée avec succès' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('actif', new DefaultValuePipe(undefined)) actif?: string,
    @Query('enCompte', new DefaultValuePipe(undefined)) enCompte?: string,
    @Query('categorie') categorie?: string,
  ) {
    const actifBool = actif === 'true' ? true : actif === 'false' ? false : undefined;
    const enCompteBool = enCompte === 'true' ? true : enCompte === 'false' ? false : undefined;
    
    return this.fournisseursService.findAll(page, limit, search, actifBool, enCompteBool, categorie);
  }

  @Get('active')
  @Public() // ✅ Endpoint public pour les formulaires
  @ApiOperation({ summary: 'Récupérer tous les fournisseurs actifs (pour les listes déroulantes)' })
  @ApiResponse({ status: 200, description: 'Liste des fournisseurs actifs récupérée avec succès' })
  findAllActive(): Promise<Fournisseur[]> {
    return this.fournisseursService.findAllActive();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Récupérer les statistiques des fournisseurs' })
  @ApiResponse({ status: 200, description: 'Statistiques des fournisseurs récupérées avec succès' })
  getStats() {
    return this.fournisseursService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un fournisseur par ID' })
  @ApiParam({ name: 'id', description: 'ID du fournisseur' })
  @ApiResponse({ status: 200, description: 'Fournisseur récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Fournisseur non trouvé' })
  findOne(@Param('id') id: string): Promise<Fournisseur> {
    return this.fournisseursService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un fournisseur' })
  @ApiParam({ name: 'id', description: 'ID du fournisseur' })
  @ApiResponse({ status: 200, description: 'Fournisseur mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Fournisseur non trouvé' })
  @ApiResponse({ status: 409, description: 'Un fournisseur avec ce nom existe déjà' })
  update(
    @Param('id') id: string,
    @Body() updateFournisseurDto: UpdateFournisseurDto,
  ): Promise<Fournisseur> {
    return this.fournisseursService.update(id, updateFournisseurDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactiver un fournisseur (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID du fournisseur' })
  @ApiResponse({ status: 200, description: 'Fournisseur désactivé avec succès' })
  @ApiResponse({ status: 404, description: 'Fournisseur non trouvé' })
  remove(@Param('id') id: string): Promise<Fournisseur> {
    return this.fournisseursService.remove(id);
  }

  @Patch(':id/reactivate')
  @ApiOperation({ summary: 'Réactiver un fournisseur' })
  @ApiParam({ name: 'id', description: 'ID du fournisseur' })
  @ApiResponse({ status: 200, description: 'Fournisseur réactivé avec succès' })
  @ApiResponse({ status: 404, description: 'Fournisseur non trouvé' })
  reactivate(@Param('id') id: string): Promise<Fournisseur> {
    return this.fournisseursService.reactivate(id);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Supprimer définitivement un fournisseur (hard delete)' })
  @ApiParam({ name: 'id', description: 'ID du fournisseur' })
  @ApiResponse({ status: 200, description: 'Fournisseur supprimé définitivement avec succès' })
  @ApiResponse({ status: 404, description: 'Fournisseur non trouvé' })
  deletePermanent(@Param('id') id: string): Promise<void> {
    return this.fournisseursService.delete(id);
  }
} 