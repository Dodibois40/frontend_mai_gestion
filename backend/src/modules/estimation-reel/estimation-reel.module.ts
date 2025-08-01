import { Module } from '@nestjs/common';
import { EstimationReelController } from './estimation-reel.controller';
import { EstimationReelService } from './estimation-reel.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EstimationReelController],
  providers: [EstimationReelService],
  exports: [EstimationReelService],
})
export class EstimationReelModule {} 