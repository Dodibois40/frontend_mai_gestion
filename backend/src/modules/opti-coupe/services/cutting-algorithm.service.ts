import { Injectable } from '@nestjs/common';

interface OptimizationParams {
  pieces: any[];
  panels: any[];
  strategy: string;
  kerfWidth: number;
  grainRespect: boolean;
  peripheralCut?: number;
  previewMode?: boolean;
}

interface OptimizationResult {
  cuttingPlans: any[];
  totalPanelsUsed: number;
  totalWaste: number;
  totalCost: number;
  efficiency: number;
  totalCutLength: number;
  offcuts: any[];
  feasible: boolean;
  warnings?: string[];
  materialBreakdown?: any;
  timeEstimate?: number;
}

@Injectable()
export class CuttingAlgorithmService {
  
  async optimize(params: OptimizationParams): Promise<OptimizationResult> {
    const { pieces, panels, strategy, kerfWidth, grainRespect, previewMode } = params;
    
    // Algorithme de bin packing 2D avec contraintes
    const cuttingPlans = [];
    let totalCost = 0;
    let totalWaste = 0;
    let totalCutLength = 0;
    let warnings = [];
    
    // Tri des pièces selon la stratégie
    const sortedPieces = this.sortPiecesByStrategy([...pieces], strategy);
    
    // Copie des pièces pour manipulation
    const remainingPieces = [...sortedPieces];
    
    // Placement des pièces sur les panneaux
    for (const panel of panels) {
      if (remainingPieces.length === 0) break;
      
      const panelResult = this.packPiecesOnPanel(
        remainingPieces, 
        panel, 
        kerfWidth,
        grainRespect
      );
      
      if (panelResult.placedPieces.length > 0) {
        cuttingPlans.push(panelResult);
        totalCost += panel.pricePerM2 * (panel.width * panel.height) / 1000000;
        totalWaste += panelResult.wastePercentage;
        totalCutLength += panelResult.totalCutLength;
        
        // Retirer les pièces placées
        panelResult.placedPieces.forEach(placedPiece => {
          const index = remainingPieces.findIndex(p => 
            p.id === placedPiece.id && p.reference === placedPiece.reference
          );
          if (index !== -1) {
            if (remainingPieces[index].quantity > 1) {
              remainingPieces[index].quantity--;
            } else {
              remainingPieces.splice(index, 1);
            }
          }
        });
      }
    }
    
    // Calcul des métriques finales
    const averageWaste = cuttingPlans.length > 0 ? totalWaste / cuttingPlans.length : 0;
    const efficiency = Math.max(0, 100 - averageWaste);
    
    // Vérification de faisabilité
    const feasible = remainingPieces.length === 0;
    
    if (!feasible) {
      warnings.push(`${remainingPieces.length} pièce(s) non placée(s)`);
    }
    
    return {
      cuttingPlans,
      totalPanelsUsed: cuttingPlans.length,
      totalWaste: averageWaste,
      totalCost: Math.round(totalCost * 100) / 100,
      efficiency: Math.round(efficiency * 100) / 100,
      totalCutLength: Math.round(totalCutLength),
      offcuts: this.calculateOffcuts(cuttingPlans),
      feasible,
      warnings,
      materialBreakdown: this.calculateMaterialBreakdown(cuttingPlans),
      timeEstimate: this.estimateCuttingTime(totalCutLength, cuttingPlans.length),
    };
  }

  private sortPiecesByStrategy(pieces: any[], strategy: string): any[] {
    switch (strategy) {
      case 'LENGTH_FIRST':
        return pieces.sort((a, b) => b.width - a.width);
      case 'WIDTH_FIRST':
        return pieces.sort((a, b) => b.height - a.height);
      case 'GRAIN_RESPECT':
        return pieces.sort((a, b) => {
          // Priorité aux pièces avec contraintes de fil
          if (a.grainDirection === 'NONE' && b.grainDirection !== 'NONE') return 1;
          if (a.grainDirection !== 'NONE' && b.grainDirection === 'NONE') return -1;
          return (b.width * b.height) - (a.width * a.height);
        });
      case 'WASTE_MINIMIZE':
        return pieces.sort((a, b) => (b.width * b.height) - (a.width * a.height));
      default:
        return pieces.sort((a, b) => (b.width * b.height) - (a.width * a.height));
    }
  }

  private packPiecesOnPanel(pieces: any[], panel: any, kerfWidth: number, grainRespect: boolean) {
    const placedPieces = [];
    const usedAreas = [];
    let totalCutLength = 0;
    
    for (const piece of pieces) {
      // Calcul des dimensions avec chants
      const adjustedWidth = piece.width + (piece.edgeLeft || 0) + (piece.edgeRight || 0);
      const adjustedHeight = piece.height + (piece.edgeTop || 0) + (piece.edgeBottom || 0);
      
      // Vérification des contraintes de fil
      if (grainRespect && !this.checkGrainConstraints(piece, panel)) {
        continue;
      }
      
      // Recherche de position
      const position = this.findBestPosition(
        { width: adjustedWidth, height: adjustedHeight },
        panel,
        usedAreas,
        kerfWidth
      );
      
      if (position) {
        const placedPiece = {
          ...piece,
          x: position.x,
          y: position.y,
          adjustedWidth,
          adjustedHeight,
          rotation: position.rotation || 0,
        };
        
        placedPieces.push(placedPiece);
        
        // Ajout de la zone utilisée
        usedAreas.push({
          x: position.x,
          y: position.y,
          width: adjustedWidth + kerfWidth,
          height: adjustedHeight + kerfWidth
        });
        
        // Calcul longueur de coupe
        totalCutLength += (adjustedWidth + adjustedHeight) * 2;
        
        // Arrêt si on a placé assez de pièces de ce type
        if (placedPieces.filter(p => p.id === piece.id).length >= piece.quantity) {
          break;
        }
      }
    }
    
    return {
      panel,
      placedPieces,
      usedAreas,
      totalCutLength,
      usedArea: this.calculateUsedArea(usedAreas),
      wastePercentage: this.calculateWaste(panel, usedAreas),
      efficiency: this.calculateEfficiency(panel, usedAreas),
    };
  }

  private findBestPosition(piece: any, panel: any, usedAreas: any[], kerfWidth: number) {
    // Algorithme Bottom-Left Fill
    const step = 10; // Précision de placement en mm
    
    for (let y = 0; y <= panel.height - piece.height; y += step) {
      for (let x = 0; x <= panel.width - piece.width; x += step) {
        if (this.canPlacePiece(piece, { x, y }, usedAreas, kerfWidth)) {
          return { x, y };
        }
      }
    }
    
    // Tentative avec rotation si la pièce n'entre pas
    if (piece.width <= panel.height && piece.height <= panel.width) {
      const rotatedPiece = {
        width: piece.height,
        height: piece.width
      };
      
      for (let y = 0; y <= panel.height - rotatedPiece.height; y += step) {
        for (let x = 0; x <= panel.width - rotatedPiece.width; x += step) {
          if (this.canPlacePiece(rotatedPiece, { x, y }, usedAreas, kerfWidth)) {
            return { x, y, rotation: 90 };
          }
        }
      }
    }
    
    return null;
  }

  private canPlacePiece(piece: any, position: any, usedAreas: any[], kerfWidth: number): boolean {
    const pieceRect = {
      x: position.x,
      y: position.y,
      width: piece.width + kerfWidth,
      height: piece.height + kerfWidth
    };
    
    return !usedAreas.some(used => this.rectanglesOverlap(pieceRect, used));
  }

  private rectanglesOverlap(rect1: any, rect2: any): boolean {
    return !(rect1.x + rect1.width <= rect2.x || 
             rect2.x + rect2.width <= rect1.x || 
             rect1.y + rect1.height <= rect2.y || 
             rect2.y + rect2.height <= rect1.y);
  }

  private checkGrainConstraints(piece: any, panel: any): boolean {
    if (!piece.grainDirection || piece.grainDirection === 'NONE') {
      return true;
    }
    
    return piece.grainDirection === panel.grainDirection;
  }

  private calculateOffcuts(cuttingPlans: any[]): any[] {
    return cuttingPlans.map(plan => ({
      panelId: plan.panel.id,
      offcuts: this.extractOffcuts(plan)
    }));
  }

  private extractOffcuts(plan: any): any[] {
    const offcuts = [];
    const panel = plan.panel;
    const usedAreas = plan.usedAreas;
    
    // Calcul simplifié des chutes récupérables
    const totalUsedArea = this.calculateUsedArea(usedAreas);
    const panelArea = panel.width * panel.height;
    const wasteArea = panelArea - totalUsedArea;
    
    if (wasteArea > (panel.minOffcutWidth || 100) * (panel.minOffcutHeight || 100)) {
      offcuts.push({
        width: Math.sqrt(wasteArea * 0.8), // Approximation
        height: Math.sqrt(wasteArea * 0.8),
        area: wasteArea,
        material: panel.material,
        thickness: panel.thickness,
      });
    }
    
    return offcuts;
  }

  private calculateUsedArea(usedAreas: any[]): number {
    return usedAreas.reduce((total, area) => total + (area.width * area.height), 0);
  }

  private calculateWaste(panel: any, usedAreas: any[]): number {
    const totalArea = panel.width * panel.height;
    const used = this.calculateUsedArea(usedAreas);
    return ((totalArea - used) / totalArea) * 100;
  }

  private calculateEfficiency(panel: any, usedAreas: any[]): number {
    return Math.max(0, 100 - this.calculateWaste(panel, usedAreas));
  }

  private calculateMaterialBreakdown(cuttingPlans: any[]): any {
    const breakdown: Record<string, any> = {};
    
    cuttingPlans.forEach(plan => {
      const key = `${plan.panel.material}-${plan.panel.thickness}`;
      if (!breakdown[key]) {
        breakdown[key] = {
          material: plan.panel.material,
          thickness: plan.panel.thickness,
          panels: 0,
          area: 0,
          cost: 0,
        };
      }
      breakdown[key].panels++;
      breakdown[key].area += (plan.panel.width * plan.panel.height) / 1000000;
      breakdown[key].cost += plan.panel.pricePerM2 * (plan.panel.width * plan.panel.height) / 1000000;
    });
    
    return Object.values(breakdown);
  }

  private estimateCuttingTime(totalCutLength: number, panelCount: number): number {
    // Estimation basée sur :
    // - 2 mètres/minute de vitesse de coupe
    // - 3 minutes de setup par panneau
    const cuttingTimeMinutes = totalCutLength / 2000; // mm -> mètres -> minutes
    const setupTimeMinutes = panelCount * 3;
    
    return Math.round(cuttingTimeMinutes + setupTimeMinutes);
  }
} 