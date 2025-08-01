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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FraisGenerauxService } from './frais-generaux.service';
import { CreateFraisGeneralDto } from './dto/create-frais-general.dto';
import { UpdateFraisGeneralDto } from './dto/update-frais-general.dto';
import { CalculFraisGenerauxDto, ResultatCalculFraisGenerauxDto } from './dto/calcul-frais-generaux.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';

@ApiTags('frais-generaux')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('frais-generaux')
export class FraisGenerauxController {
  constructor(private readonly fraisGenerauxService: FraisGenerauxService) {}

  @Post()
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Créer un nouveau frais général' })
  @ApiResponse({ status: 201, description: 'Frais général créé avec succès.' })
  @ApiResponse({ status: 409, description: 'Un frais général avec ce libellé existe déjà.' })
  async create(@Body() createFraisGeneralDto: CreateFraisGeneralDto) {
    try {
      return await this.fraisGenerauxService.create(createFraisGeneralDto);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la création du frais général: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE, RoleEnum.ACHETEUR)
  @ApiOperation({ summary: 'Récupérer tous les frais généraux' })
  @ApiQuery({ name: 'includeInactifs', required: false, type: Boolean, description: 'Inclure les frais généraux inactifs' })
  @ApiResponse({ status: 200, description: 'Liste des frais généraux récupérée avec succès.' })
  async findAll(@Query('includeInactifs') includeInactifs?: string) {
    try {
      const includeInactifsBoolean = includeInactifs === 'true';
      return await this.fraisGenerauxService.findAll(includeInactifsBoolean);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération des frais généraux: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Récupérer les statistiques des frais généraux' })
  @ApiResponse({ status: 200, description: 'Statistiques des frais généraux récupérées avec succès.' })
  async getStats() {
    try {
      return await this.fraisGenerauxService.getStats();
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération des statistiques: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('calculer')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Calculer les frais généraux pour une période donnée' })
  @ApiResponse({ 
    status: 200, 
    description: 'Calcul des frais généraux effectué avec succès.',
    type: ResultatCalculFraisGenerauxDto,
  })
  async calculerFraisGeneraux(@Body() calculDto: CalculFraisGenerauxDto): Promise<ResultatCalculFraisGenerauxDto> {
    try {
      return await this.fraisGenerauxService.calculerFraisGenerauxPeriode(calculDto);
    } catch (error) {
      throw new HttpException(
        `Erreur lors du calcul des frais généraux: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('initialiser')
  @Roles(RoleEnum.ADMIN_SYS)
  @ApiOperation({ summary: 'Initialiser les frais généraux par défaut' })
  @ApiResponse({ status: 200, description: 'Frais généraux par défaut initialisés avec succès.' })
  async initialiserDefaut() {
    try {
      return await this.fraisGenerauxService.initialiserFraisGenerauxDefaut();
    } catch (error) {
      throw new HttpException(
        `Erreur lors de l'initialisation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE, RoleEnum.ACHETEUR)
  @ApiOperation({ summary: 'Récupérer un frais général par son ID' })
  @ApiParam({ name: 'id', description: 'ID du frais général' })
  @ApiResponse({ status: 200, description: 'Frais général récupéré avec succès.' })
  @ApiResponse({ status: 404, description: 'Frais général non trouvé.' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.fraisGenerauxService.findOne(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER, RoleEnum.CHARGE_AFFAIRE)
  @ApiOperation({ summary: 'Mettre à jour un frais général' })
  @ApiParam({ name: 'id', description: 'ID du frais général' })
  @ApiResponse({ status: 200, description: 'Frais général mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Frais général non trouvé.' })
  async update(@Param('id') id: string, @Body() updateFraisGeneralDto: UpdateFraisGeneralDto) {
    try {
      return await this.fraisGenerauxService.update(id, updateFraisGeneralDto);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER)
  @ApiOperation({ summary: 'Désactiver un frais général (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID du frais général' })
  @ApiResponse({ status: 200, description: 'Frais général désactivé avec succès.' })
  @ApiResponse({ status: 404, description: 'Frais général non trouvé.' })
  async remove(@Param('id') id: string) {
    try {
      return await this.fraisGenerauxService.remove(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id/permanent')
  @Roles(RoleEnum.ADMIN_SYS)
  @ApiOperation({ summary: 'Supprimer définitivement un frais général (hard delete)' })
  @ApiParam({ name: 'id', description: 'ID du frais général' })
  @ApiResponse({ status: 200, description: 'Frais général supprimé définitivement avec succès.' })
  @ApiResponse({ status: 404, description: 'Frais général non trouvé.' })
  async permanentDelete(@Param('id') id: string) {
    try {
      return await this.fraisGenerauxService.permanentDelete(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/reactivate')
  @Roles(RoleEnum.ADMIN_SYS, RoleEnum.CHEF_ATELIER)
  @ApiOperation({ summary: 'Réactiver un frais général' })
  @ApiParam({ name: 'id', description: 'ID du frais général' })
  @ApiResponse({ status: 200, description: 'Frais général réactivé avec succès.' })
  @ApiResponse({ status: 404, description: 'Frais général non trouvé.' })
  async reactivate(@Param('id') id: string) {
    try {
      return await this.fraisGenerauxService.reactivate(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 