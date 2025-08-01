import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePanelDto } from '../dto/create-panel.dto';

@Injectable()
export class PanelService {
  constructor(private prisma: PrismaService) {}

  async create(createPanelDto: CreatePanelDto) {
    const panel = await this.prisma.panel.create({
      data: {
        ...createPanelDto,
        depreciation: createPanelDto.depreciation || 1.0,
        minOffcutWidth: createPanelDto.minOffcutWidth || 100,
        minOffcutHeight: createPanelDto.minOffcutHeight || 100,
      },
    });
    return panel;
  }

  async findAll() {
    return this.prisma.panel.findMany({
      orderBy: [
        { isOffcut: 'asc' },
        { material: 'asc' },
        { name: 'asc' }
      ],
    });
  }

  async findOne(id: string) {
    const panel = await this.prisma.panel.findUnique({
      where: { id },
    });
    if (!panel) {
      throw new NotFoundException(`Panneau avec l'ID ${id} non trouvé`);
    }
    return panel;
  }

  async update(id: string, updatePanelDto: Partial<CreatePanelDto>) {
    const existingPanel = await this.findOne(id);
    
    const updatedPanel = await this.prisma.panel.update({
      where: { id },
      data: updatePanelDto,
    });
    return updatedPanel;
  }

  async remove(id: string) {
    const panel = await this.findOne(id);
    await this.prisma.panel.delete({
      where: { id },
    });
    return { message: `Panneau ${panel.name} supprimé avec succès` };
  }

  async updateStock(id: string, quantity: number, operation: 'add' | 'set' | 'subtract') {
    const panel = await this.findOne(id);
    
    let newStock: number;
    switch (operation) {
      case 'add':
        newStock = panel.stock + quantity;
        break;
      case 'subtract':
        newStock = Math.max(0, panel.stock - quantity);
        break;
      case 'set':
        newStock = Math.max(0, quantity);
        break;
      default:
        throw new Error('Opération de stock invalide');
    }

    const updatedPanel = await this.prisma.panel.update({
      where: { id },
      data: { stock: newStock },
    });

    return updatedPanel;
  }

  async getMaterials() {
    const materials = await this.prisma.panel.findMany({
      select: { material: true },
      distinct: ['material'],
      orderBy: { material: 'asc' },
    });
    return materials.map(m => m.material);
  }

  async findAvailablePanels() {
    return this.prisma.panel.findMany({
      where: { stock: { gt: 0 } },
      orderBy: [
        { isOffcut: 'asc' },
        { material: 'asc' },
        { width: 'desc' },
        { height: 'desc' }
      ],
    });
  }

  async findByMaterialAndThickness(material: string, thickness: number) {
    return this.prisma.panel.findMany({
      where: {
        material,
        thickness,
        stock: { gt: 0 }
      },
      orderBy: [
        { isOffcut: 'asc' },
        { width: 'desc' },
        { height: 'desc' }
      ],
    });
  }

  async reservePanel(id: string, quantity: number = 1) {
    const panel = await this.findOne(id);
    
    if (panel.stock < quantity) {
      throw new Error(`Stock insuffisant pour le panneau ${panel.name}. Stock disponible: ${panel.stock}`);
    }

    return this.updateStock(id, quantity, 'subtract');
  }

  async releasePanel(id: string, quantity: number = 1) {
    return this.updateStock(id, quantity, 'add');
  }
} 