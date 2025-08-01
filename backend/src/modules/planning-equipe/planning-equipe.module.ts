import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlanningEquipeController } from './planning-equipe.controller';
import { PlanningEquipeService } from './planning-equipe.service';

@Module({
  imports: [PrismaModule],
  controllers: [PlanningEquipeController],
  providers: [PlanningEquipeService],
  exports: [PlanningEquipeService],
})
export class PlanningEquipeModule {} 