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
import { ProjectService } from '../services/project.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { CreatePieceDto } from '../dto/create-piece.dto';

@Controller('opti-coupe/projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Body(ValidationPipe) createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  async findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateProjectDto: Partial<CreateProjectDto>
  ) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }

  @Post(':id/pieces')
  async addPiece(
    @Param('id') id: string,
    @Body(ValidationPipe) createPieceDto: CreatePieceDto
  ) {
    return this.projectService.addPiece(id, createPieceDto);
  }

  @Patch(':projectId/pieces/:pieceId')
  async updatePiece(
    @Param('projectId') projectId: string,
    @Param('pieceId') pieceId: string,
    @Body(ValidationPipe) updatePieceDto: Partial<CreatePieceDto>
  ) {
    return this.projectService.updatePiece(projectId, pieceId, updatePieceDto);
  }

  @Delete(':projectId/pieces/:pieceId')
  async removePiece(
    @Param('projectId') projectId: string,
    @Param('pieceId') pieceId: string
  ) {
    return this.projectService.removePiece(projectId, pieceId);
  }

  @Get(':id/summary')
  async getProjectSummary(@Param('id') id: string) {
    return this.projectService.getProjectSummary(id);
  }
} 