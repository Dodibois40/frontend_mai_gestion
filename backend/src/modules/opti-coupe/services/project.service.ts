import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { CreatePieceDto } from '../dto/create-piece.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    const { pieces, ...projectData } = createProjectDto;
    
    const project = await this.prisma.cuttingProject.create({
      data: {
        ...projectData,
        kerfWidth: projectData.kerfWidth || 3.2,
        peripheralCut: projectData.peripheralCut || 5.0,
        pieces: pieces ? {
          create: pieces.map(piece => ({
            ...piece,
            grainDirection: piece.grainDirection || 'NONE',
            quantity: piece.quantity || 1,
            priority: piece.priority || 0,
            edgeTop: piece.edgeTop || 0,
            edgeBottom: piece.edgeBottom || 0,
            edgeLeft: piece.edgeLeft || 0,
            edgeRight: piece.edgeRight || 0,
          }))
        } : undefined,
      },
      include: {
        pieces: true,
      },
    });
    
    return project;
  }

  async findAll() {
    return this.prisma.cuttingProject.findMany({
      include: {
        pieces: true,
        optimizations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.cuttingProject.findUnique({
      where: { id },
      include: {
        pieces: true,
        optimizations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${id} non trouvé`);
    }
    
    return project;
  }

  async update(id: string, updateProjectDto: Partial<CreateProjectDto>) {
    const existingProject = await this.findOne(id);
    
    const { pieces, ...projectData } = updateProjectDto;
    
    const updatedProject = await this.prisma.cuttingProject.update({
      where: { id },
      data: projectData,
      include: {
        pieces: true,
      },
    });
    
    return updatedProject;
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    
    await this.prisma.cuttingProject.delete({
      where: { id },
    });
    
    return { message: `Projet ${project.name} supprimé avec succès` };
  }

  async addPiece(projectId: string, createPieceDto: CreatePieceDto) {
    const project = await this.findOne(projectId);
    
    const piece = await this.prisma.piece.create({
      data: {
        ...createPieceDto,
        projectId,
        grainDirection: createPieceDto.grainDirection || 'NONE',
        quantity: createPieceDto.quantity || 1,
        priority: createPieceDto.priority || 0,
        edgeTop: createPieceDto.edgeTop || 0,
        edgeBottom: createPieceDto.edgeBottom || 0,
        edgeLeft: createPieceDto.edgeLeft || 0,
        edgeRight: createPieceDto.edgeRight || 0,
      },
    });
    
    return piece;
  }

  async updatePiece(projectId: string, pieceId: string, updatePieceDto: Partial<CreatePieceDto>) {
    const project = await this.findOne(projectId);
    
    const piece = await this.prisma.piece.findFirst({
      where: { id: pieceId, projectId },
    });
    
    if (!piece) {
      throw new NotFoundException(`Pièce avec l'ID ${pieceId} non trouvée dans le projet ${projectId}`);
    }
    
    const updatedPiece = await this.prisma.piece.update({
      where: { id: pieceId },
      data: updatePieceDto,
    });
    
    return updatedPiece;
  }

  async removePiece(projectId: string, pieceId: string) {
    const project = await this.findOne(projectId);
    
    const piece = await this.prisma.piece.findFirst({
      where: { id: pieceId, projectId },
    });
    
    if (!piece) {
      throw new NotFoundException(`Pièce avec l'ID ${pieceId} non trouvée dans le projet ${projectId}`);
    }
    
    await this.prisma.piece.delete({
      where: { id: pieceId },
    });
    
    return { message: `Pièce ${piece.name} supprimée avec succès` };
  }

  async getProjectSummary(id: string) {
    const project = await this.findOne(id);
    
    const totalPieces = project.pieces.reduce((sum, piece) => sum + piece.quantity, 0);
    const totalArea = project.pieces.reduce((sum, piece) => {
      return sum + (piece.width * piece.height * piece.quantity) / 1000000; // en m²
    }, 0);
    
    const materialGroups = project.pieces.reduce((groups, piece) => {
      const key = `${piece.material}-${piece.thickness}`;
      if (!groups[key]) {
        groups[key] = {
          material: piece.material,
          thickness: piece.thickness,
          pieces: 0,
          area: 0,
        };
      }
      groups[key].pieces += piece.quantity;
      groups[key].area += (piece.width * piece.height * piece.quantity) / 1000000;
      return groups;
    }, {} as Record<string, any>);
    
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      totalPieces,
      totalArea: Math.round(totalArea * 100) / 100, // Arrondi à 2 décimales
      materialGroups: Object.values(materialGroups),
      kerfWidth: project.kerfWidth,
      peripheralCut: project.peripheralCut,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      hasOptimizations: project.optimizations.length > 0,
      lastOptimization: project.optimizations[0] || null,
    };
  }

  async duplicateProject(id: string, newName?: string) {
    const originalProject = await this.findOne(id);
    
    const duplicatedProject = await this.prisma.cuttingProject.create({
      data: {
        name: newName || `${originalProject.name} (Copie)`,
        description: originalProject.description,
        kerfWidth: originalProject.kerfWidth,
        peripheralCut: originalProject.peripheralCut,
        affaireId: originalProject.affaireId,
        pieces: {
          create: originalProject.pieces.map(piece => ({
            reference: piece.reference,
            name: piece.name,
            width: piece.width,
            height: piece.height,
            thickness: piece.thickness,
            material: piece.material,
            grainDirection: piece.grainDirection,
            quantity: piece.quantity,
            priority: piece.priority,
            edgeTop: piece.edgeTop,
            edgeBottom: piece.edgeBottom,
            edgeLeft: piece.edgeLeft,
            edgeRight: piece.edgeRight,
          }))
        }
      },
      include: {
        pieces: true,
      },
    });
    
    return duplicatedProject;
  }
} 