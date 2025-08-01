import { Module } from '@nestjs/common';
import { DocumentationsController } from './documentations.controller';
import { DocumentationsService } from './documentations.service';
import { ThumbnailService } from './services/thumbnail.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

// Créer le dossier uploads/documentations s'il n'existe pas
const uploadPath = 'uploads/documentations';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: uploadPath,
        filename: (req, file, cb) => {
          // Générer un nom unique pour éviter les conflits
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max
      },
      fileFilter: (req, file, cb) => {
        // Validation basique du type MIME
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/bmp',
          'image/svg+xml',
          'application/zip',
          'application/x-zip-compressed',
          'application/acad',
          'application/x-autocad',
          'image/vnd.dwg',
          'image/x-dwg',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
        }
      },
    }),
  ],
  controllers: [DocumentationsController],
  providers: [DocumentationsService, ThumbnailService],
  exports: [DocumentationsService],
})
export class DocumentationsModule {} 