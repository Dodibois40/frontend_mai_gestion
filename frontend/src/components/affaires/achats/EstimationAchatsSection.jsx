import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  IconDeviceFloppy,
  IconCalculator
} from '@tabler/icons-react';
import estimationAchatsService from '@/services/estimationAchatsService';
import { formatCurrency } from '@/utils/affaires';

export const EstimationAchatsSection = ({ affaire, onDataUpdate, isCollapsed, onToggleCollapse }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // TEMPORAIRE: Forcer à 35000€ pour tester
  const [montantDevisValides, setMontantDevisValides] = useState(35000);
  const [pourcentageAchats, setPourcentageAchats] = useState(30);
  const [categoriesEstimation, setCategoriesEstimation] = useState([
    { id: 'bois-massif', nom: 'Bois massif', couleur: '#8B4513', pourcentage: 25 },
    { id: 'panneau', nom: 'Panneau', couleur: '#D2691E', pourcentage: 20 },
    { id: 'quincaillerie', nom: 'Quincaillerie', couleur: '#708090', pourcentage: 15 },
    { id: 'colle', nom: 'Colle', couleur: '#FFD700', pourcentage: 10 },
    { id: 'abrasifs', nom: 'Abrasifs', couleur: '#DEB887', pourcentage: 8 },
    { id: 'divers', nom: 'Divers', couleur: '#9370DB', pourcentage: 12 },
    { id: 'visserie', nom: 'Visserie', couleur: '#C0C0C0', pourcentage: 5 },
    { id: 'vernis', nom: 'Vernis', couleur: '#FFA500', pourcentage: 5 }
  ]);

  useEffect(() => {
    const loadData = async () => {
      if (!affaire?.id) return;
      
      try {
        setLoading(true);
        console.log('🔄 EstimationAchatsSection - Chargement pour affaire ID:', affaire.id);
        const response = await estimationAchatsService.getEstimationAchats(affaire.id);
        
        console.log('📊 EstimationAchatsSection - Réponse API:', response);
        console.log('💰 EstimationAchatsSection - Montant devis dans réponse:', response?.montantDevis);
        console.log('💰 EstimationAchatsSection - ObjectifCaHt affaire:', affaire?.objectifCaHt);
        
        if (response) {
          const montantCalcule = response.montantDevis || affaire?.objectifCaHt || 35000;
          console.log('✅ EstimationAchatsSection - Montant final calculé:', montantCalcule);
          setMontantDevisValides(montantCalcule);
          setPourcentageAchats(response.pourcentageAchats || 30);
          if (response.categories && response.categories.length > 0) {
            setCategoriesEstimation(response.categories);
          }
        }
      } catch (error) {
        console.error('❌ EstimationAchatsSection - Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [affaire?.id]);

  const montantEstimationAchats = (montantDevisValides * pourcentageAchats) / 100;
  const totalPourcentage = categoriesEstimation.reduce((sum, cat) => sum + (cat.pourcentage || 0), 0);

  const handleCategoryChange = (index, newValue) => {
    const newCategories = [...categoriesEstimation];
    newCategories[index].pourcentage = Math.max(0, Math.min(100, newValue || 0));
    setCategoriesEstimation(newCategories);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await estimationAchatsService.saveEstimationAchats(affaire.id, {
        montantDevis: montantDevisValides,
        pourcentageAchats,
        categories: categoriesEstimation
      });
      toast.success('Estimation sauvegardée');
      onDataUpdate?.();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="h-full max-h-[800px] overflow-hidden flex flex-col">
      {!isCollapsed && (
        <CardContent className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Configuration de base */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Configuration</h4>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Montant Devis Validés
                  </label>
                  <input
                    type="number"
                    value={montantDevisValides}
                    onChange={(e) => setMontantDevisValides(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Pourcentage Achats ({pourcentageAchats}%)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={pourcentageAchats}
                    onChange={(e) => setPourcentageAchats(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                <div className="text-sm text-gray-600 dark:text-gray-400">Budget Estimation Achats</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(montantEstimationAchats)}
                </div>
              </div>
            </div>

            {/* Répartition par catégories */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Répartition par Catégories</h4>
                <div className={`text-sm px-2 py-1 rounded ${
                  Math.abs(totalPourcentage - 100) <= 1 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  Total: {totalPourcentage.toFixed(1)}%
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {categoriesEstimation.map((categorie, index) => (
                  <div key={categorie.id} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-700 rounded border">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: categorie.couleur }}
                    ></div>
                    <div className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {categorie.nom}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={categorie.pourcentage}
                        onChange={(e) => handleCategoryChange(index, parseFloat(e.target.value))}
                        className="w-16 px-2 py-1 text-xs border rounded text-center"
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 w-20 text-right">
                      {formatCurrency(montantEstimationAchats * categorie.pourcentage / 100)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
                icon={IconDeviceFloppy}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </div>
  );
}; 