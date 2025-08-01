import { Injectable } from '@nestjs/common';

@Injectable()
export class GrainManagerService {
  
  /**
   * Vérifie si une pièce peut être placée sur un panneau selon les contraintes de fil
   */
  checkGrainCompatibility(piece: any, panel: any): boolean {
    // Si la pièce n'a pas de contrainte de fil, elle peut aller partout
    if (!piece.grainDirection || piece.grainDirection === 'NONE') {
      return true;
    }
    
    // Si le panneau n'a pas de direction de fil définie, on accepte
    if (!panel.grainDirection || panel.grainDirection === 'NONE') {
      return true;
    }
    
    // Vérification de compatibilité directe
    return piece.grainDirection === panel.grainDirection;
  }

  /**
   * Vérifie si une pièce peut être tournée tout en respectant le fil
   */
  canRotateWithGrainRespect(piece: any, panel: any): { canRotate: boolean; newGrainDirection?: string } {
    if (!piece.grainDirection || piece.grainDirection === 'NONE') {
      return { canRotate: true };
    }

    // Si rotation de 90°, le fil change de direction
    const rotatedGrainDirection = this.getRotatedGrainDirection(piece.grainDirection);
    
    if (!panel.grainDirection || panel.grainDirection === 'NONE') {
      return { canRotate: true, newGrainDirection: rotatedGrainDirection };
    }

    return {
      canRotate: rotatedGrainDirection === panel.grainDirection,
      newGrainDirection: rotatedGrainDirection
    };
  }

  /**
   * Retourne la direction du fil après rotation de 90°
   */
  private getRotatedGrainDirection(grainDirection: string): string {
    switch (grainDirection) {
      case 'HORIZONTAL':
        return 'VERTICAL';
      case 'VERTICAL':
        return 'HORIZONTAL';
      default:
        return 'NONE';
    }
  }

  /**
   * Trie les pièces par priorité de fil pour optimiser le placement
   */
  sortPiecesByGrainPriority(pieces: any[]): any[] {
    return pieces.sort((a, b) => {
      // Priorité 1: Pièces avec contraintes de fil strict
      const aHasGrain = a.grainDirection && a.grainDirection !== 'NONE';
      const bHasGrain = b.grainDirection && b.grainDirection !== 'NONE';
      
      if (aHasGrain && !bHasGrain) return -1;
      if (!aHasGrain && bHasGrain) return 1;
      
      // Priorité 2: Taille décroissante
      return (b.width * b.height) - (a.width * a.height);
    });
  }

  /**
   * Trie les panneaux par compatibilité avec les contraintes de fil
   */
  sortPanelsByGrainCompatibility(panels: any[], pieces: any[]): any[] {
    // Compter les pièces par direction de fil
    const grainStats = this.analyzeGrainRequirements(pieces);
    
    return panels.sort((a, b) => {
      const aScore = this.calculateGrainCompatibilityScore(a, grainStats);
      const bScore = this.calculateGrainCompatibilityScore(b, grainStats);
      
      return bScore - aScore; // Tri décroissant
    });
  }

  /**
   * Analyse les besoins en direction de fil des pièces
   */
  private analyzeGrainRequirements(pieces: any[]): Record<string, number> {
    const stats: Record<string, number> = {
      HORIZONTAL: 0,
      VERTICAL: 0,
      NONE: 0
    };

    pieces.forEach(piece => {
      const direction = piece.grainDirection || 'NONE';
      const area = piece.width * piece.height * piece.quantity;
      stats[direction] += area;
    });

    return stats;
  }

  /**
   * Calcule un score de compatibilité entre un panneau et les besoins en fil
   */
  private calculateGrainCompatibilityScore(panel: any, grainStats: Record<string, number>): number {
    const panelDirection = panel.grainDirection || 'NONE';
    
    // Score basé sur la surface de pièces compatibles
    let score = grainStats[panelDirection] || 0;
    
    // Bonus pour les panneaux sans contrainte (ils acceptent tout)
    if (panelDirection === 'NONE') {
      score += Object.values(grainStats).reduce((sum, val) => sum + val, 0) * 0.5;
    }
    
    // Malus pour les panneaux très petits
    const panelArea = panel.width * panel.height;
    if (panelArea < 500000) { // moins de 0.5 m²
      score *= 0.8;
    }
    
    return score;
  }

  /**
   * Suggère des optimisations pour respecter le fil
   */
  suggestGrainOptimizations(pieces: any[], panels: any[]): any[] {
    const suggestions = [];
    
    // Analyser les incompatibilités
    const incompatiblePieces = pieces.filter(piece => {
      if (!piece.grainDirection || piece.grainDirection === 'NONE') return false;
      
      return !panels.some(panel => 
        this.checkGrainCompatibility(piece, panel) || 
        this.canRotateWithGrainRespect(piece, panel).canRotate
      );
    });

    if (incompatiblePieces.length > 0) {
      suggestions.push({
        type: 'INCOMPATIBLE_PIECES',
        message: `${incompatiblePieces.length} pièce(s) incompatible(s) avec les panneaux disponibles`,
        pieces: incompatiblePieces.map(p => p.reference),
        recommendation: 'Ajouter des panneaux avec le bon sens de fil ou modifier les contraintes'
      });
    }

    // Suggérer des panneaux supplémentaires
    const grainStats = this.analyzeGrainRequirements(pieces);
    const availableGrains = new Set(panels.map(p => p.grainDirection));

    Object.entries(grainStats).forEach(([direction, area]) => {
      if (direction !== 'NONE' && area > 0 && !availableGrains.has(direction)) {
        suggestions.push({
          type: 'MISSING_GRAIN_DIRECTION',
          message: `Aucun panneau avec fil ${direction.toLowerCase()} disponible`,
          area: Math.round(area / 1000000 * 100) / 100, // en m²
          recommendation: `Ajouter des panneaux avec fil ${direction.toLowerCase()}`
        });
      }
    });

    return suggestions;
  }

  /**
   * Valide les contraintes de fil pour un plan de découpe
   */
  validateCuttingPlan(cuttingPlan: any): { isValid: boolean; violations: any[] } {
    const violations: any[] = [];

    cuttingPlan.placedPieces?.forEach((piece: any, index: number) => {
      const panel = cuttingPlan.panel;
      
      if (!this.checkGrainCompatibility(piece, panel)) {
        // Vérifier si la rotation est possible
        const rotationCheck = this.canRotateWithGrainRespect(piece, panel);
        
        if (!rotationCheck.canRotate || piece.rotation === undefined) {
          violations.push({
            pieceIndex: index,
            pieceReference: piece.reference,
            pieceGrain: piece.grainDirection,
            panelGrain: panel.grainDirection,
            issue: 'Incompatibilité de sens de fil',
            suggestion: 'Rotation possible' + (rotationCheck.canRotate ? ' vers ' + rotationCheck.newGrainDirection : ' impossible')
          });
        }
      }
    });

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  /**
   * Optimise l'orientation des pièces selon le fil
   */
  optimizePieceOrientations(pieces: any[], targetGrain: string): any[] {
    return pieces.map(piece => {
      if (!piece.grainDirection || piece.grainDirection === 'NONE') {
        return piece;
      }

      // Si la pièce peut être tournée pour correspondre au fil cible
      if (piece.grainDirection !== targetGrain) {
        const rotated = this.getRotatedGrainDirection(piece.grainDirection);
        if (rotated === targetGrain) {
          return {
            ...piece,
            width: piece.height,
            height: piece.width,
            grainDirection: rotated,
            rotation: 90,
            edgeTop: piece.edgeLeft,
            edgeBottom: piece.edgeRight,
            edgeLeft: piece.edgeBottom,
            edgeRight: piece.edgeTop,
          };
        }
      }

      return piece;
    });
  }
} 