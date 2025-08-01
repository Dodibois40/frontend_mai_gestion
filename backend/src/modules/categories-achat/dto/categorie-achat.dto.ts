import { ApiProperty } from '@nestjs/swagger';

export class CategorieAchatDto {
  @ApiProperty({
    description: "L'identifiant unique de la catégorie d'achat",
    example: 'clq2p5zvh0000s97p7q3g3k8d',
  })
  id: string;

  @ApiProperty({
    description: "L'intitulé de la catégorie d'achat",
    example: 'Matières Premières',
  })
  intitule: string;

  @ApiProperty({
    description: "Le code interne de la catégorie d'achat (optionnel)",
    example: 'MP001',
    required: false,
  })
  code?: string;

  @ApiProperty({
    description: "Le pourcentage des frais généraux appliqué à cette catégorie",
    example: 5.5,
    type: 'number',
    format: 'float',
  })
  pourcentageFraisGeneraux: number;
} 