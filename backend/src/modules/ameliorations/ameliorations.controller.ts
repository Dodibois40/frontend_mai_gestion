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
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AmeliorationsService } from './ameliorations.service';
import { CreateAmeliorationDto } from './dto/create-amelioration.dto';
import { UpdateAmeliorationDto } from './dto/update-amelioration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('ameliorations')
@Controller('ameliorations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AmeliorationsController {
  constructor(private readonly ameliorationsService: AmeliorationsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle amélioration' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Amélioration créée avec succès' 
  })
  create(
    @Body() createAmeliorationDto: CreateAmeliorationDto,
    @CurrentUser() user: any
  ) {
    return this.ameliorationsService.create(createAmeliorationDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les améliorations' })
  @ApiQuery({ name: 'type', required: false, description: 'Filtrer par type (BUG, AMELIORATION, ALL)' })
  @ApiQuery({ name: 'statut', required: false, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'search', required: false, description: 'Recherche dans titre et description' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page (défaut: 20)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Liste des améliorations récupérée' 
  })
  findAll(
    @Query('type') type?: string,
    @Query('statut') statut?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ameliorationsService.findAll(
      type,
      statut,
      search,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Récupérer les statistiques des améliorations' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Statistiques récupérées' 
  })
  getStats() {
    return this.ameliorationsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une amélioration par ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Amélioration trouvée' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Amélioration non trouvée' 
  })
  findOne(@Param('id') id: string) {
    return this.ameliorationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une amélioration' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Amélioration mise à jour' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Amélioration non trouvée' 
  })
  update(
    @Param('id') id: string,
    @Body() updateAmeliorationDto: UpdateAmeliorationDto,
  ) {
    return this.ameliorationsService.update(id, updateAmeliorationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une amélioration' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Amélioration supprimée' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Amélioration non trouvée' 
  })
  remove(@Param('id') id: string) {
    return this.ameliorationsService.remove(id);
  }
}