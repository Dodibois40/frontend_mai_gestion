import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesAchatService } from './categories-achat.service';
import { CategorieAchatDto } from './dto/categorie-achat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategorieAchat } from '@prisma/client';

@ApiTags('categories-achat')
@Controller('categories-achat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CategoriesAchatController {
  constructor(private readonly categoriesAchatService: CategoriesAchatService) {}

  @Get()
  @ApiOperation({ summary: "Récupérer toutes les catégories d'achat" })
  @ApiResponse({ 
    status: 200, 
    description: "Liste des catégories d'achat récupérée avec succès",
    type: CategorieAchatDto,
    isArray: true,
  })
  async findAll(): Promise<CategorieAchat[]> {
    console.log('🔍 [API] Endpoint /api/categories-achat appelé');
    try {
      const result = await this.categoriesAchatService.findAll();
      console.log('✅ [API] Catégories trouvées depuis la DB:', result.length);
      return result;
    } catch (error) {
      console.error('❌ [API] Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  }

  @Get('test')
  @ApiOperation({ summary: "Test endpoint" })
  async test() {
    return { 
      message: 'Endpoint categories-achat fonctionne !', 
      timestamp: new Date(),
      test: 'OK' 
    };
  }
} 