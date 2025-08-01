import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PanelService } from '../services/panel.service';
import { CreatePanelDto } from '../dto/create-panel.dto';

@Controller('opti-coupe/panels')
@UseGuards(JwtAuthGuard)
export class PanelController {
  constructor(private readonly panelService: PanelService) {}

  @Post()
  async create(@Body(ValidationPipe) createPanelDto: CreatePanelDto) {
    return this.panelService.create(createPanelDto);
  }

  @Get()
  async findAll() {
    return this.panelService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.panelService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePanelDto: Partial<CreatePanelDto>
  ) {
    return this.panelService.update(id, updatePanelDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.panelService.remove(id);
  }

  @Post(':id/stock')
  async updateStock(
    @Param('id') id: string,
    @Body() stockUpdate: { quantity: number; operation: 'add' | 'set' | 'subtract' }
  ) {
    return this.panelService.updateStock(id, stockUpdate.quantity, stockUpdate.operation);
  }

  @Get('materials/list')
  async getMaterials() {
    return this.panelService.getMaterials();
  }
} 