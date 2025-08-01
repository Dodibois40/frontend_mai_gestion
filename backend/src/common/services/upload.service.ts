import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadDir: string;
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = ['application/pdf'];

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadPdf(file: Express.Multer.File): Promise<{
    filename: string;
    originalName: string;
    size: number;
    path: string;
  }> {
    // Validation du fichier
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Seuls les fichiers PDF sont autorisés');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('Le fichier est trop volumineux (maximum 10MB)');
    }

    // Génération d'un nom unique pour le fichier
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, uniqueFilename);

    // Sauvegarde du fichier
    fs.writeFileSync(filePath, file.buffer);

    return {
      filename: uniqueFilename,
      originalName: file.originalname,
      size: file.size,
      path: filePath,
    };
  }

  async deletePdf(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getFilePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }

  fileExists(filename: string): boolean {
    return fs.existsSync(path.join(this.uploadDir, filename));
  }
} 