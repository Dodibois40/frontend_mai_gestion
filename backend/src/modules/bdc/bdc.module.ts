import { Module } from '@nestjs/common';
import { BdcService } from './bdc.service';
import { BdcController } from './bdc.controller';
import { UploadService } from '../../common/services/upload.service';
import { ParametresModule } from '../parametres/parametres.module';

@Module({
  imports: [ParametresModule],
  controllers: [BdcController],
  providers: [BdcService, UploadService],
  exports: [BdcService],
})
export class BdcModule {} 