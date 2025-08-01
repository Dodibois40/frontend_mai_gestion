import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { MouvementsStockController } from './mouvements-stock.controller';
import { MouvementsStockService } from './mouvements-stock.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ArticlesController, MouvementsStockController],
  providers: [ArticlesService, MouvementsStockService],
  exports: [ArticlesService, MouvementsStockService],
})
export class ArticlesModule {} 