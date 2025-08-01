import { Module } from '@nestjs/common';
import { FraisGenerauxService } from './frais-generaux.service';
import { FraisGenerauxController } from './frais-generaux.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FraisGenerauxController],
  providers: [FraisGenerauxService],
  exports: [FraisGenerauxService],
})
export class FraisGenerauxModule {} 