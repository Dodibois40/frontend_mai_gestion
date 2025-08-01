import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ParametresService } from './parametres.service';
import { CreateParametreDto } from './dto/create-parametre.dto';
import { UpdateParametreDto } from './dto/update-parametre.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';

@ApiTags('parametres')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('parametres')
export class ParametresController {
  constructor(private readonly parametresService: ParametresService) {}

  @Post()
  @Roles(RoleEnum.ADMIN_SYS)
  @ApiOperation({ summary: 'Créer un nouveau paramètre global' })
  @ApiResponse({ status: 201, description: 'Paramètre créé avec succès.' })
  @ApiResponse({ status: 409, description: 'Conflit - Un paramètre avec cette clé existe déjà.' })
  create(@Body() createParametreDto: CreateParametreDto) {
    return this.parametresService.create(createParametreDto);
  }

  @Get()
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Récupérer tous les paramètres globaux' })
  @ApiResponse({ status: 200, description: 'Liste des paramètres récupérée avec succès.' })
  findAll() {
    return this.parametresService.findAll();
  }

  @Get('key/:cle')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Récupérer un paramètre par sa clé' })
  @ApiResponse({ status: 200, description: 'Paramètre trouvé.' })
  @ApiResponse({ status: 404, description: 'Paramètre non trouvé.' })
  findByKey(@Param('cle') cle: string) {
    return this.parametresService.findByKey(cle);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Récupérer un paramètre par son ID' })
  @ApiResponse({ status: 200, description: 'Paramètre trouvé.' })
  @ApiResponse({ status: 404, description: 'Paramètre non trouvé.' })
  findOne(@Param('id') id: string) {
    return this.parametresService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN_SYS)
  @ApiOperation({ summary: 'Mettre à jour un paramètre' })
  @ApiResponse({ status: 200, description: 'Paramètre mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Paramètre non trouvé.' })
  @ApiResponse({ status: 409, description: 'Conflit - Un paramètre avec cette clé existe déjà.' })
  update(@Param('id') id: string, @Body() updateParametreDto: UpdateParametreDto) {
    return this.parametresService.update(id, updateParametreDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN_SYS)
  @ApiOperation({ summary: 'Supprimer un paramètre' })
  @ApiResponse({ status: 200, description: 'Paramètre supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Paramètre non trouvé.' })
  remove(@Param('id') id: string) {
    return this.parametresService.remove(id);
  }

  @Post('initialize')
  @Roles(RoleEnum.ADMIN_SYS)
  @ApiOperation({ summary: 'Initialiser les paramètres par défaut' })
  @ApiResponse({ status: 201, description: 'Paramètres par défaut initialisés avec succès.' })
  initializeDefault() {
    return this.parametresService.initializeDefaultParameters();
  }

  @Get('values/taux-horaire')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Récupérer le taux horaire par défaut' })
  @ApiResponse({ status: 200, description: 'Taux horaire récupéré.' })
  getTauxHoraire() {
    return this.parametresService.getTauxHoraire();
  }

  @Get('values/taux-frais-generaux')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Récupérer le taux de frais généraux' })
  @ApiResponse({ status: 200, description: 'Taux frais généraux récupéré.' })
  getTauxFraisGeneraux() {
    return this.parametresService.getTauxFraisGeneraux();
  }

  @Get('values/taux-tva')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Récupérer le taux de TVA' })
  @ApiResponse({ status: 200, description: 'Taux TVA récupéré.' })
  getTauxTVA() {
    return this.parametresService.getTauxTVA();
  }
} 