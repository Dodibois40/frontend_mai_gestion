import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CategoriesAchatService } from './categories-achat.service';
import { CategoriesAchatController } from './categories-achat.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesAchatController],
  providers: [CategoriesAchatService],
  exports: [CategoriesAchatService], // Si d'autres modules ont besoin de ce service
})
export class CategoriesAchatModule {} 