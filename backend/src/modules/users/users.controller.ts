import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { UsersService, regenererCouleursPlanning } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  @Roles('ADMIN_SYS', 'CHARGE_AFFAIRE')
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('actif') actif?: string,
  ) {
    try {
      return await this.usersService.findAll({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        search,
        role,
        actif,
      });
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des utilisateurs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  @Roles('ADMIN_SYS', 'CHARGE_AFFAIRE')
  async getStats() {
    try {
      return await this.usersService.getStats();
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des statistiques',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('by-role/:role')
  @Roles('ADMIN_SYS', 'CHARGE_AFFAIRE')
  async findByRole(@Param('role') role: string) {
    try {
      return await this.usersService.findByRole(role);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des utilisateurs par rôle',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @Roles('ADMIN_SYS', 'CHARGE_AFFAIRE')
  async findOne(@Param('id') id: string) {
    try {
      return await this.usersService.findOne(id);
    } catch (error) {
      if (error.message === 'Utilisateur non trouvé') {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Erreur lors de la récupération de l\'utilisateur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @Roles('ADMIN_SYS', 'DIRIGEANT')
  async create(@Body() createUserDto: CreateUserDto) {
    console.log('🔄 [UsersController] Tentative de création utilisateur');
    console.log('📝 [UsersController] Données reçues:', JSON.stringify(createUserDto, null, 2));
    console.log('🔍 [UsersController] Types des données:', {
      email: typeof createUserDto.email,
      nom: typeof createUserDto.nom,
      prenom: typeof createUserDto.prenom,
      password: typeof createUserDto.password,
      role: typeof createUserDto.role,
      tarifHoraireBase: typeof createUserDto.tarifHoraireBase,
      telephone: typeof createUserDto.telephone,
      dateEmbauche: typeof createUserDto.dateEmbauche,
      actif: typeof createUserDto.actif,
      disponiblePlanning: typeof createUserDto.disponiblePlanning
    });
    
    try {
      const result = await this.usersService.create(createUserDto);
      console.log('✅ [UsersController] Utilisateur créé avec succès:', result.id);
      return result;
    } catch (error) {
      console.error('❌ [UsersController] Erreur lors de la création:', error.message);
      console.error('📋 [UsersController] Stack trace:', error.stack);
      console.error('🔍 [UsersController] Error details:', {
        name: error.name,
        code: error.code,
        response: error.response
      });
      
      if (error.code === 'P2002') {
        throw new HttpException('Cet email est déjà utilisé', HttpStatus.CONFLICT);
      }
      throw new HttpException(
        'Erreur lors de la création de l\'utilisateur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @Roles('ADMIN_SYS', 'DIRIGEANT')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    console.log('🔄 [UsersController] Tentative de mise à jour utilisateur:', id);
    console.log('📝 [UsersController] Données reçues:', JSON.stringify(updateUserDto, null, 2));
    
    try {
      const result = await this.usersService.update(id, updateUserDto);
      console.log('✅ [UsersController] Utilisateur mis à jour avec succès:', result.id);
      return result;
    } catch (error) {
      console.error('❌ [UsersController] Erreur lors de la mise à jour:', error.message);
      console.error('📋 [UsersController] Stack trace:', error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @Roles('ADMIN_SYS', 'DIRIGEANT')
  async remove(@Param('id') id: string) {
    try {
      return await this.usersService.remove(id);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Erreur lors de la suppression de l\'utilisateur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/reactivate')
  @Roles('ADMIN_SYS', 'DIRIGEANT')
  async reactivate(@Param('id') id: string) {
    try {
      return await this.usersService.reactivate(id);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Erreur lors de la réactivation de l\'utilisateur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/password')
  @Roles('ADMIN_SYS', 'DIRIGEANT')
  async changePassword(
    @Param('id') id: string,
    @Body() passwordData: { currentPassword: string; newPassword: string },
  ) {
    try {
      return await this.usersService.changePassword(id, passwordData);
    } catch (error) {
      if (error.message === 'Utilisateur non trouvé') {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }
      if (error.message === 'Mot de passe actuel incorrect') {
        throw new HttpException('Mot de passe actuel incorrect', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Erreur lors du changement de mot de passe',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('equipe-planning')
  @Roles('ADMIN_SYS', 'DIRIGEANT', 'CHARGE_AFFAIRE')
  async getEquipeForPlanning() {
    console.log('🔄 [UsersController] Récupération équipe pour planning');
    try {
      const result = await this.usersService.getEquipeForPlanning();
      console.log('✅ [UsersController] Équipe récupérée avec succès');
      return result;
    } catch (error) {
      console.error('❌ [UsersController] Erreur récupération équipe:', error.message);
      throw error;
    }
  }

  @Post('regenerer-couleurs')
  @Roles('ADMIN_SYS', 'DIRIGEANT')
  async regenererCouleursPlanning() {
    console.log('🎨 [UsersController] Régénération des couleurs planning');
    try {
      const nbUtilisateurs = await regenererCouleursPlanning(this.prisma);
      console.log(`✅ [UsersController] ${nbUtilisateurs} couleurs régénérées avec succès`);
      return { 
        message: 'Couleurs régénérées avec succès',
        nbUtilisateurs 
      };
    } catch (error) {
      console.error('❌ [UsersController] Erreur régénération couleurs:', error.message);
      throw new HttpException(
        'Erreur lors de la régénération des couleurs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 