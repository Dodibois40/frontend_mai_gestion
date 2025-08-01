import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AmeliorationsService } from './ameliorations.service';
import { AmeliorationsController } from './ameliorations.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AmeliorationsController],
  providers: [AmeliorationsService],
  exports: [AmeliorationsService],
})
export class AmeliorationsModule {}