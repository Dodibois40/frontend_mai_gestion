import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

@Injectable()
export class ThumbnailService {
  private readonly logger = new Logger(ThumbnailService.name);
  private readonly thumbnailDir = path.join(process.cwd(), 'uploads', 'thumbnails');
  private readonly thumbnailSize = { width: 400, height: 300 }; // Ratio 4:3 pour meilleur affichage

  constructor() {
    // Créer le dossier thumbnails s'il n'existe pas
    if (!fs.existsSync(this.thumbnailDir)) {
      fs.mkdirSync(this.thumbnailDir, { recursive: true });
      this.logger.log('📁 Dossier thumbnails créé');
    }
  }

  /**
   * Génère une miniature pour un document
   */
  async generateThumbnail(filePath: string, documentId: string): Promise<string | null> {
    try {
      const fileExtension = path.extname(filePath).toLowerCase();
      const thumbnailFileName = `${documentId}.jpg`;
      const thumbnailPath = path.join(this.thumbnailDir, thumbnailFileName);

      this.logger.log(`🖼️ Génération miniature pour: ${filePath}`);

      switch (fileExtension) {
        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.gif':
        case '.webp':
          await this.generateImageThumbnail(filePath, thumbnailPath);
          break;
        
        case '.pdf':
          await this.generatePdfThumbnail(filePath, thumbnailPath);
          break;
        
        default:
          this.logger.warn(`⚠️ Type de fichier non supporté pour miniature: ${fileExtension}`);
          return null;
      }

      this.logger.log(`✅ Miniature générée: ${thumbnailFileName}`);
      return thumbnailFileName;

    } catch (error) {
      this.logger.error(`❌ Erreur génération miniature: ${error.message}`);
      return null;
    }
  }

  /**
   * Génère une miniature pour une image
   */
  private async generateImageThumbnail(imagePath: string, thumbnailPath: string): Promise<void> {
    await sharp(imagePath)
      .resize(this.thumbnailSize.width, this.thumbnailSize.height, {
        fit: 'inside', // Préserve le ratio original sans rogner
        withoutEnlargement: false,
        background: { r: 248, g: 250, b: 252, alpha: 1 } // Fond blanc cassé
      })
      .sharpen() // Améliore la netteté
      .jpeg({ 
        quality: 90, // Qualité supérieure pour plus de détails
        progressive: true, // Chargement progressif
        mozjpeg: true // Compression optimisée
      })
      .toFile(thumbnailPath);
  }

  /**
   * Génère une miniature pour un PDF (première page)
   */
  private async generatePdfThumbnail(pdfPath: string, thumbnailPath: string): Promise<void> {
    try {
      // Vérifier si pdftoppm est disponible
      const tempImagePath = thumbnailPath.replace('.jpg', '_temp.ppm');
      
      // Convertir première page PDF en image avec pdftoppm
      const command = `pdftoppm -f 1 -l 1 -scale-to ${this.thumbnailSize.width} "${pdfPath}" "${tempImagePath.replace('_temp.ppm', '')}"`;
      
      await execAsync(command);
      
      // Convertir PPM en JPEG avec Sharp
      const ppmFile = `${tempImagePath.replace('_temp.ppm', '')}-1.ppm`;
      if (fs.existsSync(ppmFile)) {
        await sharp(ppmFile)
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);
        
        // Nettoyer le fichier temporaire
        fs.unlinkSync(ppmFile);
      } else {
        throw new Error('Fichier PPM temporaire non trouvé');
      }

    } catch (error) {
      this.logger.warn(`⚠️ pdftoppm non disponible, fallback avec icône: ${error.message}`);
      // Fallback : créer une miniature générique pour PDF
      await this.generateGenericThumbnail('PDF', thumbnailPath);
    }
  }

  /**
   * Génère une miniature générique avec texte
   */
  private async generateGenericThumbnail(text: string, thumbnailPath: string): Promise<void> {
    // Créer une image SVG moderne avec gradient et icône
    const svg = `
      <svg width="${this.thumbnailSize.width}" height="${this.thumbnailSize.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <rect x="20" y="20" width="${this.thumbnailSize.width - 40}" height="${this.thumbnailSize.height - 40}" 
              fill="url(#card)" stroke="#cbd5e1" stroke-width="1" rx="12" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"/>
        <circle cx="50%" cy="40%" r="25" fill="#3b82f6" opacity="0.1"/>
        <text x="50%" y="40%" text-anchor="middle" dominant-baseline="middle" 
              font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#3b82f6">
          📄
        </text>
        <text x="50%" y="70%" text-anchor="middle" dominant-baseline="middle" 
              font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#475569">
          ${text}
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .jpeg({ 
        quality: 90,
        progressive: true
      })
      .toFile(thumbnailPath);
  }

  /**
   * Récupère le chemin de la miniature
   */
  getThumbnailPath(fileName: string): string {
    return path.join(this.thumbnailDir, fileName);
  }

  /**
   * Vérifie si une miniature existe
   */
  thumbnailExists(fileName: string): boolean {
    return fs.existsSync(this.getThumbnailPath(fileName));
  }

  /**
   * Supprime une miniature
   */
  deleteThumbnail(fileName: string): void {
    const thumbnailPath = this.getThumbnailPath(fileName);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
      this.logger.log(`🗑️ Miniature supprimée: ${fileName}`);
    }
  }
} 