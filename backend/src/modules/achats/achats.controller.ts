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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AchatsService } from './achats.service';
import { CreateAchatDto } from './dto/create-achat.dto';
import { UpdateAchatDto } from './dto/update-achat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';

@ApiTags('achats')
@Controller('achats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AchatsController {
  constructor(private readonly achatsService: AchatsService) {}

  @Post()
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE, RoleEnum.ACHETEUR)
  @ApiOperation({ summary: 'Créer un nouvel achat (facture)' })
  @ApiResponse({ status: 201, description: 'Achat créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() createAchatDto: CreateAchatDto) {
    return this.achatsService.create(createAchatDto);
  }

  @Get()
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE, RoleEnum.ACHETEUR, RoleEnum.DIRIGEANT)
  @ApiOperation({ summary: 'Récupérer tous les achats avec pagination' })
  @ApiQuery({ name: 'affaireId', required: false, description: 'Filtrer par affaire' })
  @ApiQuery({ name: 'statut', required: false, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page (défaut: 10)' })
  @ApiResponse({ status: 200, description: 'Liste des achats récupérée avec succès' })
  findAll(
    @Query('affaireId') affaireId?: string,
    @Query('statut') statut?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);
    const skip = (pageNum - 1) * limitNum;

    return this.achatsService.findAll(
      affaireId,
      statut as any,
      skip,
      limitNum,
    );
  }

  @Get('affaire/:affaireId/stats')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE, RoleEnum.ACHETEUR, RoleEnum.DIRIGEANT)
  @ApiOperation({ summary: 'Obtenir les statistiques d\'achats par affaire' })
  @ApiParam({ name: 'affaireId', description: 'ID de l\'affaire' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès' })
  @ApiResponse({ status: 404, description: 'Affaire non trouvée' })
  getStatsByAffaire(@Param('affaireId', ParseUUIDPipe) affaireId: string) {
    return this.achatsService.getStatsByAffaire(affaireId);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE, RoleEnum.ACHETEUR, RoleEnum.DIRIGEANT)
  @ApiOperation({ summary: 'Récupérer un achat par ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'achat' })
  @ApiResponse({ status: 200, description: 'Achat récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Achat non trouvé' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.achatsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE, RoleEnum.ACHETEUR)
  @ApiOperation({ summary: 'Mettre à jour un achat' })
  @ApiParam({ name: 'id', description: 'ID de l\'achat' })
  @ApiResponse({ status: 200, description: 'Achat mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Achat non trouvé' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAchatDto: UpdateAchatDto,
  ) {
    return this.achatsService.update(id, updateAchatDto);
  }

  @Patch(':id/valider')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Valider un achat' })
  @ApiParam({ name: 'id', description: 'ID de l\'achat' })
  @ApiResponse({ status: 200, description: 'Achat validé avec succès' })
  @ApiResponse({ status: 404, description: 'Achat non trouvé' })
  valider(@Param('id', ParseUUIDPipe) id: string) {
    return this.achatsService.valider(id);
  }

  @Patch(':id/payer')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Marquer un achat comme payé' })
  @ApiParam({ name: 'id', description: 'ID de l\'achat' })
  @ApiResponse({ status: 200, description: 'Achat marqué comme payé' })
  @ApiResponse({ status: 404, description: 'Achat non trouvé' })
  payer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { datePaiement: string },
  ) {
    return this.achatsService.payer(id, new Date(body.datePaiement));
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Supprimer un achat' })
  @ApiParam({ name: 'id', description: 'ID de l\'achat' })
  @ApiResponse({ status: 200, description: 'Achat supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Achat non trouvé' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.achatsService.remove(id);
  }
} 