import { Injectable } from '@nestjs/common';

@Injectable()
export class OffcutService {

  /**
   * Traite les chutes générées par une optimisation
   */
  async processOffcuts(offcuts: any[], originalPanels: any[]): Promise<any[]> {
    const processedOffcuts = [];

    for (const offcutGroup of offcuts) {
      const originalPanel = originalPanels.find(p => p.id === offcutGroup.panelId);
      
      if (!originalPanel) continue;

      for (const offcut of offcutGroup.offcuts) {
        // Vérifier si la chute est assez grande pour être récupérable
        if (this.isOffcutRecoverable(offcut, originalPanel)) {
          const processedOffcut = {
            ...offcut,
            id: `offcut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sourcePanel: originalPanel.id,
            sourcePanelName: originalPanel.name,
            pricePerM2: originalPanel.pricePerM2 * (originalPanel.depreciation || 0.7), // Dépréciation
            isOffcut: true,
            stock: 1,
            createdAt: new Date(),
            quality: this.assessOffcutQuality(offcut, originalPanel),
            usageRecommendations: this.generateUsageRecommendations(offcut),
          };
          
          processedOffcuts.push(processedOffcut);
        }
      }
    }

    return this.optimizeOffcuts(processedOffcuts);
  }

  /**
   * Vérifie si une chute est assez grande pour être récupérable
   */
  private isOffcutRecoverable(offcut: any, originalPanel: any): boolean {
    const minWidth = originalPanel.minOffcutWidth || 100;
    const minHeight = originalPanel.minOffcutHeight || 100;
    const minArea = minWidth * minHeight;

    return offcut.width >= minWidth && 
           offcut.height >= minHeight && 
           offcut.area >= minArea;
  }

  /**
   * Évalue la qualité d'une chute
   */
  private assessOffcutQuality(offcut: any, originalPanel: any): string {
    const area = offcut.area;
    const panelArea = originalPanel.width * originalPanel.height;
    const ratio = area / panelArea;

    if (ratio > 0.5) return 'EXCELLENTE';
    if (ratio > 0.3) return 'BONNE';
    if (ratio > 0.1) return 'CORRECTE';
    return 'FAIBLE';
  }

  /**
   * Génère des recommandations d'usage pour une chute
   */
  private generateUsageRecommendations(offcut: any): string[] {
    const recommendations: string[] = [];
    const area = offcut.area / 1000000; // en m²

    // Recommandations basées sur la taille
    if (offcut.width >= 500 && offcut.height >= 500) {
      recommendations.push('Idéal pour façades de tiroirs');
      recommendations.push('Peut servir pour étagères');
    }

    if (offcut.width >= 300 && offcut.height >= 100) {
      recommendations.push('Parfait pour plinthes');
      recommendations.push('Utilisable pour traverses');
    }

    if (area >= 0.1) {
      recommendations.push('Suffisant pour petites pièces');
    } else {
      recommendations.push('Utilisable pour gabarits ou prototypes');
    }

    // Recommandations basées sur le matériau
    if (offcut.material === 'Mélaminé') {
      recommendations.push('Idéal pour intérieurs de meubles');
    } else if (offcut.material === 'MDF') {
      recommendations.push('Parfait pour pièces à peindre');
    }

    return recommendations;
  }

  /**
   * Optimise les chutes en éliminant les doublons et en consolidant
   */
  private optimizeOffcuts(offcuts: any[]): any[] {
    // Grouper par matériau et épaisseur
    const grouped = this.groupOffcutsByMaterial(offcuts);
    
    // Consolider les chutes similaires
    const consolidated = this.consolidateSimilarOffcuts(grouped);
    
    // Trier par utilité décroissante
    return this.sortOffcutsByUtility(consolidated);
  }

  /**
   * Groupe les chutes par matériau et épaisseur
   */
  private groupOffcutsByMaterial(offcuts: any[]): Record<string, any[]> {
    return offcuts.reduce((groups, offcut) => {
      const key = `${offcut.material}-${offcut.thickness}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(offcut);
      return groups;
    }, {} as Record<string, any[]>);
  }

  /**
   * Consolide les chutes similaires en taille
   */
  private consolidateSimilarOffcuts(groupedOffcuts: Record<string, any[]>): any[] {
    const consolidated: any[] = [];
    const tolerance = 50; // tolérance en mm

    Object.values(groupedOffcuts).forEach(group => {
      const processed = new Set();

      group.forEach((offcut, index) => {
        if (processed.has(index)) return;

        const similar = group.filter((other, otherIndex) => {
          if (processed.has(otherIndex) || index === otherIndex) return false;
          
          return Math.abs(other.width - offcut.width) <= tolerance &&
                 Math.abs(other.height - offcut.height) <= tolerance;
        });

        if (similar.length > 0) {
          // Créer une chute consolidée
          const consolidatedOffcut = {
            ...offcut,
            id: `consolidated_${offcut.id}`,
            stock: similar.length + 1,
            consolidatedFrom: [offcut.id, ...similar.map(s => s.id)],
            averageWidth: Math.round((offcut.width + similar.reduce((sum, s) => sum + s.width, 0)) / (similar.length + 1)),
            averageHeight: Math.round((offcut.height + similar.reduce((sum, s) => sum + s.height, 0)) / (similar.length + 1)),
          };

          consolidated.push(consolidatedOffcut);
          
          // Marquer comme traités
          processed.add(index);
          similar.forEach((_, i) => {
            const originalIndex = group.findIndex(o => o.id === similar[i].id);
            processed.add(originalIndex);
          });
        } else {
          consolidated.push(offcut);
          processed.add(index);
        }
      });
    });

    return consolidated;
  }

  /**
   * Trie les chutes par utilité (surface utilisable, qualité, etc.)
   */
  private sortOffcutsByUtility(offcuts: any[]): any[] {
    return offcuts.sort((a, b) => {
      // Score composite basé sur plusieurs critères
      const scoreA = this.calculateUtilityScore(a);
      const scoreB = this.calculateUtilityScore(b);
      
      return scoreB - scoreA; // Tri décroissant
    });
  }

  /**
   * Calcule un score d'utilité pour une chute
   */
  private calculateUtilityScore(offcut: any): number {
    let score = 0;

    // Score basé sur la surface
    score += offcut.area / 1000; // Plus c'est grand, mieux c'est

    // Bonus pour les formes pratiques (ratio proche de 1:1 ou 2:1)
    const ratio = Math.max(offcut.width, offcut.height) / Math.min(offcut.width, offcut.height);
    if (ratio <= 2) score += 1000; // Bonus pour forme pratique
    if (ratio <= 1.5) score += 500; // Bonus supplémentaire pour forme carrée

    // Bonus pour qualité
    switch (offcut.quality) {
      case 'EXCELLENTE': score += 2000; break;
      case 'BONNE': score += 1000; break;
      case 'CORRECTE': score += 500; break;
      default: break;
    }

    // Bonus pour stock multiple
    if (offcut.stock > 1) {
      score += offcut.stock * 100;
    }

    // Malus pour les très petites pièces
    if (offcut.area < 50000) { // moins de 0.05 m²
      score *= 0.5;
    }

    return Math.round(score);
  }

  /**
   * Trouve les chutes utilisables pour des nouvelles pièces
   */
  findSuitableOffcuts(pieces: any[], availableOffcuts: any[]): any[] {
    const suitableMatches: any[] = [];

    pieces.forEach(piece => {
      const requiredWidth = piece.width + (piece.edgeLeft || 0) + (piece.edgeRight || 0);
      const requiredHeight = piece.height + (piece.edgeTop || 0) + (piece.edgeBottom || 0);

      const compatibleOffcuts = availableOffcuts.filter(offcut => {
        // Vérifications de base
        const sizeOk = offcut.width >= requiredWidth && offcut.height >= requiredHeight;
        const materialOk = offcut.material === piece.material;
        const thicknessOk = Math.abs(offcut.thickness - piece.thickness) <= 1; // Tolérance 1mm

        // Vérification du fil si nécessaire
        let grainOk = true;
        if (piece.grainDirection && piece.grainDirection !== 'NONE') {
          grainOk = !offcut.grainDirection || 
                   offcut.grainDirection === 'NONE' || 
                   offcut.grainDirection === piece.grainDirection;
        }

        return sizeOk && materialOk && thicknessOk && grainOk;
      });

      if (compatibleOffcuts.length > 0) {
        // Choisir la chute la plus appropriée (plus petite mais suffisante)
        const bestOffcut = compatibleOffcuts.reduce((best, current) => {
          const bestWaste = (best.width * best.height) - (requiredWidth * requiredHeight);
          const currentWaste = (current.width * current.height) - (requiredWidth * requiredHeight);
          return currentWaste < bestWaste ? current : best;
        });

        suitableMatches.push({
          piece: piece,
          offcut: bestOffcut,
          wasteArea: (bestOffcut.width * bestOffcut.height) - (requiredWidth * requiredHeight),
          efficiency: ((requiredWidth * requiredHeight) / (bestOffcut.width * bestOffcut.height)) * 100,
          savings: this.calculateSavings(piece, bestOffcut),
        });
      }
    });

    return suitableMatches.sort((a, b) => b.efficiency - a.efficiency);
  }

  /**
   * Calcule les économies réalisées en utilisant une chute
   */
  private calculateSavings(piece: any, offcut: any): number {
    const pieceArea = piece.width * piece.height / 1000000; // m²
    
    // Prix d'un panneau neuf équivalent (approximation)
    const newPanelPrice = 50; // €/m² par défaut
    const newPanelCost = pieceArea * newPanelPrice;
    
    // Prix de la chute
    const offcutCost = pieceArea * (offcut.pricePerM2 || newPanelPrice * 0.7);
    
    return Math.round((newPanelCost - offcutCost) * 100) / 100;
  }

  /**
   * Génère un rapport sur les chutes
   */
  generateOffcutsReport(offcuts: any[]): any {
    if (offcuts.length === 0) {
      return {
        message: 'Aucune chute récupérable générée',
        summary: {
          totalOffcuts: 0,
          totalArea: 0,
          estimatedValue: 0,
        }
      };
    }

    const totalArea = offcuts.reduce((sum, offcut) => sum + (offcut.area / 1000000), 0);
    const estimatedValue = offcuts.reduce((sum, offcut) => {
      const area = offcut.area / 1000000;
      return sum + (area * (offcut.pricePerM2 || 0));
    }, 0);

    const qualityBreakdown = offcuts.reduce((breakdown, offcut) => {
      breakdown[offcut.quality] = (breakdown[offcut.quality] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);

    const materialBreakdown = offcuts.reduce((breakdown, offcut) => {
      const key = `${offcut.material} ${offcut.thickness}mm`;
      breakdown[key] = (breakdown[key] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);

    return {
      summary: {
        totalOffcuts: offcuts.length,
        totalArea: Math.round(totalArea * 100) / 100,
        estimatedValue: Math.round(estimatedValue * 100) / 100,
        averageSize: Math.round((totalArea / offcuts.length) * 10000) / 10000, // m²
      },
      qualityBreakdown,
      materialBreakdown,
      recommendations: this.generateOffcutRecommendations(offcuts),
      topOffcuts: offcuts.slice(0, 5), // Les 5 meilleures chutes
    };
  }

  /**
   * Génère des recommandations générales sur les chutes
   */
  private generateOffcutRecommendations(offcuts: any[]): string[] {
    const recommendations: string[] = [];
    
    const excellentOffcuts = offcuts.filter(o => o.quality === 'EXCELLENTE').length;
    const totalArea = offcuts.reduce((sum, o) => sum + (o.area / 1000000), 0);

    if (excellentOffcuts > 0) {
      recommendations.push(`${excellentOffcuts} chute(s) de excellente qualité à prioriser pour les prochains projets`);
    }

    if (totalArea > 1) {
      recommendations.push(`${Math.round(totalArea * 100) / 100} m² de matière récupérable représentant une valeur significative`);
    }

    if (offcuts.length > 10) {
      recommendations.push('Considérer un projet dédié aux petites pièces pour valoriser les chutes');
    }

    const consolidatedOffcuts = offcuts.filter(o => o.consolidatedFrom).length;
    if (consolidatedOffcuts > 0) {
      recommendations.push(`${consolidatedOffcuts} lot(s) de chutes similaires consolidés pour faciliter la gestion`);
    }

    return recommendations;
  }
} 