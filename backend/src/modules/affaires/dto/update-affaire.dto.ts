import { PartialType } from '@nestjs/swagger';
import { CreateAffaireDto } from './create-affaire.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { StatutAffaire } from '@prisma/client';

export class UpdateAffaireDto extends PartialType(CreateAffaireDto) {
  @ApiPropertyOptional({
    description: 'Statut de l\'affaire',
    enum: StatutAffaire,
    example: StatutAffaire.EN_COURS,
  })
  @IsEnum(StatutAffaire)
  @IsOptional()
  statut?: StatutAffaire;
} 