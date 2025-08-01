import { Module } from '@nestjs/common';
import { EstimationsAchatsService } from './estimations-achats.service';
import { EstimationsAchatsController, AffairesEstimationsController } from './estimations-achats.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EstimationsAchatsController, AffairesEstimationsController],
  providers: [EstimationsAchatsService],
  exports: [EstimationsAchatsService],
})
export class EstimationsAchatsModule {}
 