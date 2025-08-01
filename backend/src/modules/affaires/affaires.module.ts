import { Module } from '@nestjs/common';
import { AffairesService } from './affaires.service';
import { AffairesController } from './affaires.controller';
import { DevisService } from './devis.service';
import { DevisController } from './devis.controller';
import { DevisCloudController } from './devis-cloud.controller';
import { CommonModule } from '../../common/common.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [CommonModule, PrismaModule],
  controllers: [AffairesController, DevisController, DevisCloudController],
  providers: [AffairesService, DevisService],
  exports: [AffairesService, DevisService],
})
export class AffairesModule {} 