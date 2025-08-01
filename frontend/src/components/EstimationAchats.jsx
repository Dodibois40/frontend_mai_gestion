import React, { useState, useEffect, useCallback } from 'react';
import { 
  IconDeviceFloppy, 
  IconRefresh,
  IconChartBar,
  IconTarget,
  IconCurrencyEuro,
  IconGripHorizontal,
  IconPercentage,
  IconCalculator,
  IconEdit
} from '@tabler/icons-react';
import { toast } from 'sonner';
import estimationAchatsService from '@/services/estimationAchatsService';

const EstimationAchats = ({ affaire, onSave }) => {
  // États de chargement
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Montant des devis validés (récupéré depuis l'affaire)
  const [montantDevisValides, setMontantDevisValides] = useState(affaire?.objectifCaHt || 83333);
  
  // Pourcentage des achats par rapport aux devis validés
  const [pourcentageAchats, setPourcentageAchats] = useState(30);
  
  // Montant total des achats calculé
  const montantTotal = Math.round(montantDevisValides * pourcentageAchats / 100);

  // Données des catégories avec pourcentages initiaux
  const [categories, setCategories] = useState([
    { id: 'bois-massif', nom: 'Bois massif', couleur: '#8B4513', pourcentage: 25, montantFixe: null, modeFixe: false },
    { id: 'panneau', nom: 'Panneau', couleur: '#D2691E', pourcentage: 20, montantFixe: null, modeFixe: false },
    { id: 'quincaillerie', nom: 'Quincaillerie', couleur: '#708090', pourcentage: 15, montantFixe: null, modeFixe: false },
    { id: 'colle', nom: 'Colle', couleur: '#FFD700', pourcentage: 10, montantFixe: null, modeFixe: false },
    { id: 'abrasifs', nom: 'Abrasifs', couleur: '#DEB887', pourcentage: 8, montantFixe: null, modeFixe: false },
    { id: 'divers', nom: 'Divers', couleur: '#9370DB', pourcentage: 12, montantFixe: null, modeFixe: false },
    { id: 'visserie', nom: 'Visserie', couleur: '#C0C0C0', pourcentage: 5, montantFixe: null, modeFixe: false },
    { id: 'vernis', nom: 'Vernis', couleur: '#FFA500', pourcentage: 5, montantFixe: null, modeFixe: false }
  ]);

  // Charger les données existantes au montage du composant
  useEffect(() => {
    const loadEstimationData = async () => {
      if (!affaire?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const estimationData = await estimationAchatsService.getEstimationAchats(affaire.id);
        
        if (estimationData) {
          // Charger les données sauvegardées
          setPourcentageAchats(estimationData.pourcentageAchats || 30);
          if (estimationData.categories && estimationData.categories.length > 0) {
            setCategories(estimationData.categories);
          }
          console.log('Données d\'estimation chargées:', estimationData);
        }
      } catch (error) {
        // Si pas d'estimation existante, utiliser les valeurs par défaut
        console.log('Aucune estimation existante, utilisation des valeurs par défaut');
      } finally {
        setLoading(false);
      }
    };

    loadEstimationData();
  }, [affaire?.id]);

  // Mettre à jour le montant des devis validés quand l'affaire change
  useEffect(() => {
    if (affaire?.objectifCaHt) {
      setMontantDevisValides(affaire.objectifCaHt);
    }
  }, [affaire]);

  // Fonction pour ajuster les pourcentages quand une catégorie change
  const handleCategoryChange = (changedIndex, newValue) => {
    const newPercentage = Math.max(0, Math.min(100, parseInt(newValue) || 0));
    
    setCategories(prevCategories => {
      const newCategories = [...prevCategories];
      newCategories[changedIndex].pourcentage = newPercentage;
      return newCategories;
    });
  };

  // Fonction pour ajuster le pourcentage global des achats
  const handlePourcentageAchatsChange = (newValue) => {
    setPourcentageAchats(parseInt(newValue));
  };

  // Fonction pour sauvegarder les données
  const handleSave = async () => {
    if (!affaire?.id) {
      toast.error('Impossible de sauvegarder : affaire non définie');
      return;
    }

    try {
      setSaving(true);
      
      const dataToSave = {
        affaireId: affaire.id,
        pourcentageAchats,
        montantDevisValides,
        montantTotalAchats: montantTotal,
        categories
      };
      
      // Sauvegarder via l'API
      await estimationAchatsService.sauvegarderEstimationAchats(affaire.id, dataToSave);
      
      // Callback pour le parent si fourni
      if (onSave) {
        onSave(dataToSave);
      }
      
      console.log('Sauvegarde des achats réels réussie:', dataToSave);
      toast.success('Estimation des achats sauvegardée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de l\'estimation');
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour réinitialiser
  const handleReset = () => {
    setPourcentageAchats(30);
    setCategories([
      { id: 'bois-massif', nom: 'Bois massif', couleur: '#8B4513', pourcentage: 25, montantFixe: null, modeFixe: false },
      { id: 'panneau', nom: 'Panneau', couleur: '#D2691E', pourcentage: 20, montantFixe: null, modeFixe: false },
      { id: 'quincaillerie', nom: 'Quincaillerie', couleur: '#708090', pourcentage: 15, montantFixe: null, modeFixe: false },
      { id: 'colle', nom: 'Colle', couleur: '#FFD700', pourcentage: 10, montantFixe: null, modeFixe: false },
      { id: 'abrasifs', nom: 'Abrasifs', couleur: '#DEB887', pourcentage: 8, montantFixe: null, modeFixe: false },
      { id: 'divers', nom: 'Divers', couleur: '#9370DB', pourcentage: 12, montantFixe: null, modeFixe: false },
      { id: 'visserie', nom: 'Visserie', couleur: '#C0C0C0', pourcentage: 5, montantFixe: null, modeFixe: false },
      { id: 'vernis', nom: 'Vernis', couleur: '#FFA500', pourcentage: 5, montantFixe: null, modeFixe: false }
    ]);
    toast.info('Données réinitialisées');
  };

  const totalPourcentage = categories.reduce((sum, cat) => sum + cat.pourcentage, 0);
  
  // Montant total des achats réels calculé selon les pourcentages définis
  const montantAchatsReels = Math.round(montantTotal * totalPourcentage / 100);

  // Fonction pour basculer entre mode pourcentage et montant fixe
  const toggleModeCategorie = useCallback((index) => {
    setCategories(prevCategories => {
      // Créer une nouvelle copie complète du tableau
      const newCategories = prevCategories.map((cat, idx) => {
        if (idx === index) {
          const updatedCategory = { ...cat };
          
          if (updatedCategory.modeFixe) {
            // Passer en mode pourcentage
            updatedCategory.modeFixe = false;
            updatedCategory.montantFixe = null;
          } else {
            // Passer en mode montant fixe
            updatedCategory.modeFixe = true;
            updatedCategory.montantFixe = Math.round(montantTotal * updatedCategory.pourcentage / 100);
          }
          
          return updatedCategory;
        }
        return { ...cat }; // Copie des autres catégories
      });
      
      return newCategories;
    });
  }, [montantTotal]);

  // Fonction pour ajuster les montants fixes
  const handleMontantFixeChange = useCallback((index, newMontant) => {
    const montant = Math.max(0, parseInt(newMontant) || 0);
    
    setCategories(prevCategories => {
      const newCategories = prevCategories.map((cat, idx) => {
        if (idx === index) {
          const updatedCategory = { ...cat };
          
          updatedCategory.montantFixe = montant;
          // Calculer le pourcentage équivalent
          updatedCategory.pourcentage = Math.round((montant / montantTotal) * 100 * 100) / 100;
          
          return updatedCategory;
        }
        return { ...cat };
      });
      
      return newCategories;
    });
  }, [montantTotal]);

  // Afficher un indicateur de chargement pendant le chargement initial
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement de l'estimation...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Estimation des Achats</h2>
          <p className="text-sm text-gray-600">Affaire {affaire?.numero} - Répartition interactive</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <IconRefresh className="w-4 h-4" />
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
              saving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <IconDeviceFloppy className="w-4 h-4" />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <IconCalculator className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Devis Validés</p>
              <p className="text-2xl font-bold text-gray-900">
                {montantDevisValides.toLocaleString()}€
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <IconPercentage className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">% Achats</p>
              <p className="text-2xl font-bold text-blue-600">
                {pourcentageAchats}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <IconCurrencyEuro className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Budget Achats</p>
              <p className="text-2xl font-bold text-gray-900">
                {montantTotal.toLocaleString()}€
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <IconChartBar className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Achats Réels</p>
              <p className={`text-2xl font-bold ${
                montantAchatsReels <= montantTotal ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {montantAchatsReels.toLocaleString()}€
              </p>
              <p className="text-xs text-gray-500">
                {montantAchatsReels <= montantTotal ? 
                  `${Math.round((montantTotal - montantAchatsReels) / montantTotal * 100)}% d'économie` : 
                  `${Math.round((montantAchatsReels - montantTotal) / montantTotal * 100)}% de dépassement`
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <IconTarget className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Planifié</p>
              <p className={`text-2xl font-bold ${
                totalPourcentage <= 100 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {totalPourcentage}%
              </p>
              <p className="text-xs text-gray-500">
                {totalPourcentage <= 100 ? 
                  `${100 - totalPourcentage}% non planifié` : 
                  `${totalPourcentage - 100}% de dépassement`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contrôle du pourcentage global des achats */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <IconPercentage className="w-5 h-5 text-blue-600" />
          Pourcentage Global des Achats
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Pourcentage des achats par rapport aux devis validés
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {pourcentageAchats}% de {montantDevisValides.toLocaleString()}€ = {montantTotal.toLocaleString()}€
              </p>
            </div>
          </div>
          
          {/* Slider pour le pourcentage global */}
          <div className="relative">
            {/* Barre de fond */}
            <div className="w-full h-10 bg-gray-100 rounded-lg overflow-hidden">
              {/* Barre de progression */}
              <div 
                className="h-full transition-all duration-300 ease-out rounded-lg shadow-sm bg-gradient-to-r from-blue-500 to-blue-600"
                style={{ 
                  width: `${(pourcentageAchats - 10) / 90 * 100}%`,
                  opacity: 0.8
                }}
              ></div>
            </div>
            
            {/* Slider invisible par-dessus */}
            <input
              type="range"
              min="10"
              max="100"
              value={pourcentageAchats}
              onChange={(e) => handlePourcentageAchatsChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ zIndex: 10 }}
            />
            
            {/* Indicateur de position */}
            <div 
              className="absolute top-0 h-10 w-2 bg-white shadow-lg rounded-full transition-all duration-300 ease-out hover:w-3 hover:shadow-xl border-2 border-blue-600"
              style={{ 
                left: `calc(${(pourcentageAchats - 10) / 90 * 100}% - 4px)`
              }}
            ></div>
          </div>
          
          {/* Graduations */}
          <div className="flex justify-between text-xs text-gray-400 px-1">
            <span>10%</span>
            <span>30%</span>
            <span>50%</span>
            <span>70%</span>
            <span>90%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <IconGripHorizontal className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900">Interface hybride : Pourcentages ET Montants fixes</h4>
            <div className="text-sm text-green-700 mt-1 space-y-1">
              <p>• <strong>Mode Pourcentage :</strong> Utilisez les curseurs pour ajuster les pourcentages (par défaut)</p>
              <p>• <strong>Mode Montant fixe :</strong> Cliquez sur le bouton <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 border border-gray-300 rounded-full"><IconPercentage className="w-3 h-3 mr-1" />%</span> pour saisir un montant précis (ex: 50€ de visserie)</p>
              <p>• <strong>Flexibilité totale :</strong> Mélangez les deux modes selon vos besoins</p>
              <p>• <strong>Calcul automatique :</strong> Les montants fixes sont convertis en pourcentages automatiquement</p>
              <p>• <strong>Pas de contrainte :</strong> Le total peut dépasser 100% si nécessaire</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique interactif avec sliders */}
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Répartition Interactive des Achats Réels
        </h3>
        
        <div className="space-y-6">
          {categories.map((category, index) => {
            const montant = category.modeFixe ? category.montantFixe : Math.round(montantTotal * category.pourcentage / 100);
            
            return (
              <div key={`category-${category.id}-${index}`} className="group">
                {/* En-tête de la catégorie */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: category.couleur }}
                    ></div>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">
                      {category.nom}
                    </span>
                    
                    {/* Bouton de basculement mode */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleModeCategorie(index);
                      }}
                      className={`px-2 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                        category.modeFixe 
                          ? 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200' 
                          : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                      }`}
                      title={category.modeFixe ? 'Passer en mode pourcentage' : 'Passer en mode montant fixe'}
                    >
                      {category.modeFixe ? (
                        <>
                          <IconEdit className="w-3 h-3 inline mr-1" />
                          €
                        </>
                      ) : (
                        <>
                          <IconPercentage className="w-3 h-3 inline mr-1" />
                          %
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    {category.modeFixe ? (
                      <>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={category.montantFixe || 0}
                            onChange={(e) => handleMontantFixeChange(index, e.target.value)}
                            className="w-20 px-2 py-1 text-right border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-600">€</span>
                        </div>
                        <span className="text-gray-500 min-w-[60px] text-right text-xs">
                          ({category.pourcentage.toFixed(1)}%)
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-gray-900 min-w-[60px] text-right">
                          {category.pourcentage}%
                        </span>
                        <span className="text-gray-600 min-w-[80px] text-right">
                          {montant.toLocaleString()}€
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Barre de progression avec slider (seulement en mode pourcentage) */}
                {!category.modeFixe && (
                  <div className="relative">
                    {/* Barre de fond */}
                    <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                      {/* Barre de progression */}
                      <div 
                        className="h-full transition-all duration-300 ease-out rounded-lg shadow-sm"
                        style={{ 
                          backgroundColor: category.couleur,
                          width: `${category.pourcentage}%`,
                          opacity: 0.8
                        }}
                      ></div>
                    </div>
                    
                    {/* Slider invisible par-dessus */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={category.pourcentage}
                      onChange={(e) => handleCategoryChange(index, e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      style={{ zIndex: 10 }}
                    />
                    
                    {/* Indicateur de position */}
                    <div 
                      className="absolute top-0 h-8 w-1 bg-white shadow-lg rounded-full transition-all duration-300 ease-out group-hover:w-2 group-hover:shadow-xl"
                      style={{ 
                        left: `calc(${category.pourcentage}% - 2px)`,
                        border: `2px solid ${category.couleur}`
                      }}
                    ></div>
                  </div>
                )}
                
                {/* Barre de visualisation simple en mode montant fixe */}
                {category.modeFixe && (
                  <div className="w-full h-4 bg-gray-100 rounded-lg overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300 ease-out rounded-lg shadow-sm"
                      style={{ 
                        backgroundColor: category.couleur,
                        width: `${Math.min(category.pourcentage, 100)}%`,
                        opacity: 0.6
                      }}
                    ></div>
                  </div>
                )}
                
                {/* Graduations */}
                <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tableau récapitulatif */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Catégorie</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Pourcentage</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Montant</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => {
                const montantCategorie = category.modeFixe ? category.montantFixe : Math.round(montantTotal * category.pourcentage / 100);
                return (
                  <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: category.couleur }}
                        ></div>
                        <span className="font-medium text-gray-900">{category.nom}</span>
                        {category.modeFixe && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Fixe
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-gray-900">
                      {category.pourcentage.toFixed(1)}%
                    </td>
                    <td className={`text-right py-3 px-4 font-semibold ${
                      category.modeFixe ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {montantCategorie.toLocaleString()}€
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-gray-300 font-bold">
                <td className="py-3 px-4 text-gray-900">Total Achats Réels</td>
                <td className={`text-right py-3 px-4 ${
                  totalPourcentage <= 100 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {totalPourcentage}%
                </td>
                <td className={`text-right py-3 px-4 font-bold ${
                  montantAchatsReels <= montantTotal ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {montantAchatsReels.toLocaleString()}€
                </td>
              </tr>
              <tr className="text-sm text-gray-600 border-b border-gray-100">
                <td className="py-2 px-4 italic">Budget Total</td>
                <td className="text-right py-2 px-4">100%</td>
                <td className="text-right py-2 px-4 font-medium">
                  {montantTotal.toLocaleString()}€
                </td>
              </tr>
              <tr className={`text-sm ${
                montantAchatsReels <= montantTotal ? 'text-green-600' : 'text-red-600'
              }`}>
                <td className="py-2 px-4 italic">
                  {montantAchatsReels <= montantTotal ? 'Économie' : 'Dépassement'}
                </td>
                <td className="text-right py-2 px-4">
                  {montantAchatsReels <= montantTotal ? 
                    `${Math.round((montantTotal - montantAchatsReels) / montantTotal * 100)}%` : 
                    `+${Math.round((montantAchatsReels - montantTotal) / montantTotal * 100)}%`
                  }
                </td>
                <td className="text-right py-2 px-4 font-medium">
                  {montantAchatsReels <= montantTotal ? 
                    `${(montantTotal - montantAchatsReels).toLocaleString()}€` : 
                    `+${(montantAchatsReels - montantTotal).toLocaleString()}€`
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EstimationAchats; 