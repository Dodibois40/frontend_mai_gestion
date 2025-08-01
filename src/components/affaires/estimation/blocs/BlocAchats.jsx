import React, { useState, useEffect } from 'react';
import { 
  IconTruckDelivery, 
  IconEdit, 
  IconDeviceFloppy,
  IconX,
  IconPlus,
  IconMinus,
  IconTrash,
  IconPackage,
  IconCurrencyEuro,
  IconAlertTriangle,
  IconCheck
} from '@tabler/icons-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Bloc Achats - Éditable avec modification du budget total
 * Gestion des fournitures et achats avec catégories personnalisables
 */
const BlocAchats = ({ estimation = {}, onEstimationChange, montantDevis = 0 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    montantTotal: estimation.montantAchats || 0,
    pourcentageDevis: montantDevis > 0 ? Math.round((estimation.montantAchats || 0) / montantDevis * 100) : 20,
    categories: [
      { nom: 'Bois', pourcentage: 40, montant: Math.round((estimation.montantAchats || 0) * 0.4), couleur: '#8B4513' },
      { nom: 'Panneaux', pourcentage: 30, montant: Math.round((estimation.montantAchats || 0) * 0.3), couleur: '#CD853F' },
      { nom: 'Quincaillerie', pourcentage: 20, montant: Math.round((estimation.montantAchats || 0) * 0.2), couleur: '#708090' },
      { nom: 'Autres', pourcentage: 10, montant: Math.round((estimation.montantAchats || 0) * 0.1), couleur: '#DAA520' }
    ]
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [newCategory, setNewCategory] = useState({ nom: '', montant: 0 });

  // Synchroniser avec l'estimation (version OPTIMISÉE)
  useEffect(() => {
    const hasNewMontant = estimation.montantAchats > 0;
    const hasCategoriesChange = estimation.categoriesAchats && 
                               JSON.stringify(estimation.categoriesAchats) !== JSON.stringify(editableData.categories);
    
    const hasSignificantChange = hasNewMontant && (
      Math.abs(estimation.montantAchats - editableData.montantTotal) > 100 // Seuil de différence significative
    );
    
    if (hasSignificantChange || hasCategoriesChange) {
      console.log('🛒 Synchronisation avec nouvel état:', {
        ancien: editableData.montantTotal,
        nouveau: estimation.montantAchats,
        changementCategories: hasCategoriesChange
      });
      
      const newData = { ...editableData };
      
      if (hasSignificantChange) {
        newData.montantTotal = estimation.montantAchats;
        newData.pourcentageDevis = montantDevis > 0 ? Math.round((estimation.montantAchats / montantDevis) * 100) : 20;
      }
      
      if (hasCategoriesChange && estimation.categoriesAchats) {
        newData.categories = estimation.categoriesAchats;
      } else if (hasSignificantChange) {
        // Recalculer les montants des catégories si le total a changé
        newData.categories = editableData.categories.map(cat => ({
          ...cat,
          montant: Math.round((newData.montantTotal * cat.pourcentage) / 100)
        }));
      }
      
      setEditableData(newData);
      setHasChanges(false);
    }
  }, [estimation.montantAchats, estimation.categoriesAchats, montantDevis]);

  // Calculer les montants par catégorie
  const calculerMontants = () => {
    return editableData.categories.map(cat => ({
      ...cat,
      montant: Math.round((editableData.montantTotal * cat.pourcentage) / 100)
    }));
  };

  // Gérer les changements du montant total (version CORRIGÉE pour React)
  const handleMontantTotalChange = (value) => {
    const newMontantTotal = parseInt(value) || 0;
    const newCategories = editableData.categories.map(cat => ({
      ...cat,
      montant: Math.round((newMontantTotal * cat.pourcentage) / 100)
    }));
    
    const finalData = {
      ...editableData,
      montantTotal: newMontantTotal,
      pourcentageDevis: montantDevis > 0 ? Math.round((newMontantTotal / montantDevis) * 100) : 20,
      categories: newCategories
    };
    
    setEditableData(finalData);
    setHasChanges(true);
    
    // 🔧 CORRECTION REACT : Préparer la remontée pour le prochain cycle
    const updatedEstimation = {
      ...estimation,
      montantAchats: finalData.montantTotal,
      categoriesAchats: finalData.categories,
      repartitionAchats: {
        bois: finalData.categories.find(c => c.nom === 'Bois')?.montant || 0,
        quincaillerie: finalData.categories.find(c => c.nom === 'Quincaillerie')?.montant || 0,
        autres: finalData.categories.filter(c => !['Bois', 'Quincaillerie'].includes(c.nom))
                                 .reduce((acc, c) => acc + c.montant, 0)
      }
    };
    onEstimationChange(updatedEstimation);
  };

  // 🆕 Gérer le changement de pourcentage par rapport au devis
  const handlePourcentageDevisChange = (value) => {
    const newPourcentage = parseInt(value) || 20;
    const newMontantTotal = Math.round((montantDevis * newPourcentage) / 100);
    const newCategories = editableData.categories.map(cat => ({
      ...cat,
      montant: Math.round((newMontantTotal * cat.pourcentage) / 100)
    }));
    
    const finalData = {
      ...editableData,
      montantTotal: newMontantTotal,
      pourcentageDevis: newPourcentage,
      categories: newCategories
    };
    
    setEditableData(finalData);
    setHasChanges(true);
    
    const updatedEstimation = {
      ...estimation,
      montantAchats: finalData.montantTotal,
      categoriesAchats: finalData.categories,
      repartitionAchats: {
        bois: finalData.categories.find(c => c.nom === 'Bois')?.montant || 0,
        quincaillerie: finalData.categories.find(c => c.nom === 'Quincaillerie')?.montant || 0,
        autres: finalData.categories.filter(c => !['Bois', 'Quincaillerie'].includes(c.nom))
                                 .reduce((acc, c) => acc + c.montant, 0)
      },
      recalculerRepartition: true // 🔥 Déclencher le recalcul global
    };
    onEstimationChange(updatedEstimation);
  };

  // Modifier une catégorie (version CORRIGÉE pour React)
  const handleCategorieChange = (index, field, value) => {
    const newCategories = [...editableData.categories];
    
    if (field === 'montant') {
      newCategories[index].montant = parseInt(value) || 0;
    } else if (field === 'pourcentage') {
      const newPourcentage = parseInt(value) || 0;
      newCategories[index].pourcentage = newPourcentage;
      newCategories[index].montant = Math.round((editableData.montantTotal * newPourcentage) / 100);
    }
    
    const finalData = {
      ...editableData,
      categories: newCategories
    };
    
    setEditableData(finalData);
    setHasChanges(true);
    
    // 🔧 CORRECTION REACT : Préparer la remontée pour le prochain cycle
    const updatedEstimation = {
      ...estimation,
      montantAchats: finalData.montantTotal,
      categoriesAchats: finalData.categories,
      repartitionAchats: {
        bois: finalData.categories.find(c => c.nom === 'Bois')?.montant || 0,
        quincaillerie: finalData.categories.find(c => c.nom === 'Quincaillerie')?.montant || 0,
        autres: finalData.categories.filter(c => !['Bois', 'Quincaillerie'].includes(c.nom))
                       .reduce((acc, c) => acc + c.montant, 0)
      }
    };
    onEstimationChange(updatedEstimation);
  };

  // Synchroniser le budget total avec les montants saisis (version CORRIGÉE pour React)
  const synchroniserBudgetTotal = () => {
    const totalMontantsSaisis = editableData.categories.reduce((acc, cat) => acc + cat.montant, 0);
    
    // Recalculer tous les pourcentages
    const newCategories = editableData.categories.map(cat => ({
      ...cat,
      pourcentage: totalMontantsSaisis > 0 ? Math.round((cat.montant / totalMontantsSaisis) * 100) : 0
    }));
    
    setEditableData(prev => ({
      ...prev,
      montantTotal: totalMontantsSaisis,
      categories: newCategories
    }));
    setHasChanges(true);
    
    // 🔧 CORRECTION REACT : Préparer la remontée pour le prochain cycle
    const updatedEstimation = {
      ...estimation,
      montantAchats: totalMontantsSaisis,
      categoriesAchats: newCategories,
      repartitionAchats: {
        bois: newCategories.find(c => c.nom === 'Bois')?.montant || 0,
        quincaillerie: newCategories.find(c => c.nom === 'Quincaillerie')?.montant || 0,
        autres: newCategories.filter(c => !['Bois', 'Quincaillerie'].includes(c.nom))
                           .reduce((acc, c) => acc + c.montant, 0)
      }
    };
    onEstimationChange(updatedEstimation);
  };

  // Ajouter une catégorie
  const handleAddCategory = () => {
    if (newCategory.nom) {
      const montantAjouter = newCategory.montant || 0; // Permet montant 0
      
      const newCategories = [...editableData.categories, {
        nom: newCategory.nom,
        montant: montantAjouter,
        pourcentage: 0, // Sera recalculé ci-dessous
        couleur: `#${Math.floor(Math.random()*16777215).toString(16)}`
      }];
      
      // Calculer le nouveau budget total
      const nouveauBudgetTotal = newCategories.reduce((acc, cat) => acc + cat.montant, 0);
      
      // Recalculer tous les pourcentages
      newCategories.forEach(cat => {
        if (nouveauBudgetTotal > 0) {
          cat.pourcentage = Math.round((cat.montant / nouveauBudgetTotal) * 100);
        } else {
          cat.pourcentage = 0;
        }
      });
      
      setEditableData(prev => ({
        ...prev,
        montantTotal: nouveauBudgetTotal,
        categories: newCategories
      }));
      setNewCategory({ nom: '', montant: 0 });
      setHasChanges(true);
    }
  };

  // Supprimer une catégorie
  const handleDeleteCategory = (index) => {
    const newCategories = editableData.categories.filter((_, i) => i !== index);
    
    // Calculer le nouveau budget total
    const nouveauBudgetTotal = newCategories.reduce((acc, cat) => acc + cat.montant, 0);
    
    // Recalculer tous les pourcentages
    newCategories.forEach(cat => {
      if (nouveauBudgetTotal > 0) {
        cat.pourcentage = Math.round((cat.montant / nouveauBudgetTotal) * 100);
      } else {
        cat.pourcentage = 0;
      }
    });
    
    setEditableData(prev => ({
      ...prev,
      montantTotal: nouveauBudgetTotal,
      categories: newCategories
    }));
    setHasChanges(true);
  };

  // Sauvegarder les modifications (version OPTIMISÉE)
  const handleSave = () => {
    const montants = editableData.categories;
    const updatedEstimation = {
      ...estimation,
      montantAchats: editableData.montantTotal,
      categoriesAchats: montants,
      repartitionAchats: {
        bois: montants.find(c => c.nom === 'Bois')?.montant || 0,
        quincaillerie: montants.find(c => c.nom === 'Quincaillerie')?.montant || 0,
        autres: montants.filter(c => !['Bois', 'Quincaillerie'].includes(c.nom))
                       .reduce((acc, c) => acc + c.montant, 0)
      }
    };
    
    onEstimationChange(updatedEstimation);
    setIsEditing(false);
    setHasChanges(false);
    
    console.log('🛒 Achats sauvegardés et modifiables à nouveau:', updatedEstimation);
  };

  // Annuler les modifications (version OPTIMISÉE)
  const handleCancel = () => {
    // 🔄 CORRECTION : Restauration intelligente - préserver les données récentes
    const baseMontant = estimation.montantAchats || 0;
    const baseCategories = estimation.categoriesAchats && estimation.categoriesAchats.length > 0 
      ? estimation.categoriesAchats 
      : [
          { nom: 'Bois', pourcentage: 40, montant: Math.round(baseMontant * 0.4), couleur: '#8B4513' },
          { nom: 'Panneaux', pourcentage: 30, montant: Math.round(baseMontant * 0.3), couleur: '#CD853F' },
          { nom: 'Quincaillerie', pourcentage: 20, montant: Math.round(baseMontant * 0.2), couleur: '#708090' },
          { nom: 'Autres', pourcentage: 10, montant: Math.round(baseMontant * 0.1), couleur: '#DAA520' }
        ];
    
    setEditableData({
      montantTotal: baseMontant,
      categories: baseCategories
    });
    setIsEditing(false);
    setHasChanges(false);
  };

  const totalMontants = editableData.categories.reduce((acc, cat) => acc + cat.montant, 0);
  const totalPourcentage = editableData.categories.reduce((acc, cat) => acc + cat.pourcentage, 0);
  const budgetBalance = totalMontants - editableData.montantTotal;
  const isOverBudget = budgetBalance > 0;
  const isUnderBudget = budgetBalance < 0;
  const isOnBudget = budgetBalance === 0;

  return (
    <Card className="bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-orange-900 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg shadow-lg">
              <IconTruckDelivery className="w-6 h-6 text-white" />
            </div>
            Achats & Fournitures
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <IconEdit className="w-4 h-4 mr-1" />
                Modifier
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <IconX className="w-4 h-4 mr-1" />
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={!hasChanges}
                >
                  <IconDeviceFloppy className="w-4 h-4 mr-1" />
                  Sauvegarder
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {estimation.montantAchats > 0 || isEditing ? (
          <div className="space-y-4">
            {/* Montant total - MODIFIABLE */}
            {(editableData.montantTotal > 0 || editableData.categories.length > 0 || isEditing) && (
              <div className="bg-orange-100/50 p-4 rounded-lg">
                <Label className="text-orange-800 font-medium mb-2 block">
                  Budget total alloué aux achats
                </Label>
                <div className="flex items-center justify-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editableData.montantTotal}
                        onChange={(e) => handleMontantTotalChange(e.target.value)}
                        min="0"
                        step="100"
                        className="text-center text-2xl font-bold border-orange-300 focus:border-orange-500 w-48"
                        placeholder="Budget €"
                      />
                      <span className="text-2xl font-bold text-orange-900">€</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-900">
                        {editableData.montantTotal.toLocaleString()}€
                      </div>
                      <div className="text-sm text-orange-600">
                        Budget alloué
                        {montantDevis > 0 && (
                          <span className="ml-2">
                            ({Math.round((editableData.montantTotal / montantDevis) * 100)}% du devis)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Validation du budget */}
            {isEditing && totalMontants !== editableData.montantTotal && editableData.categories.length > 0 && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                isOverBudget ? 'bg-red-100 text-red-800' : 
                isUnderBudget ? 'bg-blue-100 text-blue-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {isOverBudget ? (
                  <IconAlertTriangle className="w-5 h-5" />
                ) : (
                  <IconCheck className="w-5 h-5" />
                )}
                <div className="flex-1">
                  <div className="font-medium">
                    {isOverBudget ? 'Dépassement de budget' : 'Sous le budget'}
                  </div>
                  <div className="text-sm">
                    {totalMontants.toLocaleString()}€ saisi / {editableData.montantTotal.toLocaleString()}€ alloué
                    {budgetBalance !== 0 && (
                      <span className="ml-1">
                        ({budgetBalance > 0 ? '+' : ''}{budgetBalance.toLocaleString()}€)
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={synchroniserBudgetTotal}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  title="Ajuster le budget total pour qu'il corresponde aux montants saisis"
                >
                  <IconCurrencyEuro className="w-4 h-4 mr-1" />
                  Synchroniser
                </Button>
              </div>
            )}

            {/* Pourcentage du devis - MODIFIABLE */}
            {isEditing && (
              <div className="bg-orange-100/50 p-4 rounded-lg">
                <Label className="text-orange-800 font-medium mb-2 block">
                  Pourcentage du devis
                </Label>
                <div className="flex items-center justify-center gap-2">
                  <Input
                    type="number"
                    value={editableData.pourcentageDevis}
                    onChange={(e) => handlePourcentageDevisChange(e.target.value)}
                    min="0"
                    max="100"
                    step="1"
                    className="text-center text-2xl font-bold border-orange-300 focus:border-orange-500 w-48"
                    placeholder="Pourcentage %"
                  />
                  <span className="text-2xl font-bold text-orange-900">%</span>
                </div>
              </div>
            )}

            {/* Catégories d'achats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-orange-800 font-medium">
                  Répartition par catégorie
                </Label>
                {editableData.categories.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={isOnBudget ? "default" : isOverBudget ? "destructive" : "secondary"} 
                      className="text-xs"
                    >
                      {totalMontants.toLocaleString()}€ / {editableData.montantTotal.toLocaleString()}€
                    </Badge>
                    {totalPourcentage !== 100 && (
                      <Badge variant="outline" className="text-xs">
                        {totalPourcentage}%
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {editableData.categories.map((category, index) => (
                  <div key={index} className="bg-orange-100 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.couleur }}
                        />
                        {isEditing ? (
                          <Input
                            value={category.nom}
                            onChange={(e) => handleCategorieChange(index, 'nom', e.target.value)}
                            className="h-8 border-orange-300 focus:border-orange-500"
                            placeholder="Nom de la catégorie"
                          />
                        ) : (
                          <span className="font-medium text-orange-800">{category.nom}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={category.montant}
                              onChange={(e) => handleCategorieChange(index, 'montant', parseInt(e.target.value) || 0)}
                              min="0"
                              step="10"
                              className="w-24 h-8 text-center border-orange-300 focus:border-orange-500"
                              placeholder="€"
                            />
                            <span className="text-orange-700">€</span>
                            <span className="text-orange-600 text-sm w-12">({category.pourcentage}%)</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCategory(index)}
                              className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <IconTrash className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-orange-700">
                              {category.montant.toLocaleString()}€
                            </Badge>
                            <span className="text-orange-600 text-sm">({category.pourcentage}%)</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <IconPackage className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-600">
                          {category.nom}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-800">
                          {category.montant.toLocaleString()}€
                        </div>
                        <div className="text-xs text-orange-600">
                          {category.pourcentage}% du total
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Ajouter une catégorie */}
              {isEditing && (
                <div className="bg-white border-2 border-dashed border-orange-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-orange-700">
                    <IconPlus className="w-4 h-4" />
                    <span className="font-medium">Ajouter une nouvelle catégorie</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-orange-800 text-sm font-medium mb-1 block">
                        Nom de la catégorie *
                      </Label>
                      <Input
                        value={newCategory.nom}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Ex: Isolation, Peinture, Électricité..."
                        className="border-orange-300 focus:border-orange-500 focus:ring-orange-200"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-orange-800 text-sm font-medium mb-1 block">
                        Montant initial (optionnel)
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={newCategory.montant}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, montant: parseInt(e.target.value) || 0 }))}
                          min="0"
                          step="50"
                          placeholder="0"
                          className="w-32 text-center border-orange-300 focus:border-orange-500 focus:ring-orange-200"
                        />
                        <span className="text-orange-700 font-medium">€</span>
                        <span className="text-xs text-orange-600">
                          (modifiable après création)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleAddCategory}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={!newCategory.nom || newCategory.nom.trim() === ''}
                      >
                        <IconPlus className="w-4 h-4 mr-1" />
                        Ajouter la catégorie
                      </Button>
                      
                      {(newCategory.nom || newCategory.montant > 0) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNewCategory({ nom: '', montant: 0 })}
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          <IconX className="w-4 h-4 mr-1" />
                          Vider
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Résumé des achats - Conditionnel */}
            {editableData.categories.length > 0 ? (
              <div className="bg-orange-50 p-4 rounded-lg">
                <Label className="text-orange-800 font-medium mb-3 block">
                  Résumé estimation achats
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-900">
                      {editableData.categories.length}
                    </div>
                    <div className="text-sm text-orange-600">Catégories</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isOnBudget ? 'text-green-700' : 
                      isOverBudget ? 'text-red-700' : 
                      'text-orange-900'
                    }`}>
                      {totalMontants.toLocaleString()}€
                    </div>
                    <div className="text-sm text-orange-600">Total saisi</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isOnBudget ? 'text-green-700' : 
                      isOverBudget ? 'text-red-700' : 
                      'text-blue-700'
                    }`}>
                      {editableData.montantTotal > 0 ? 
                        Math.round((totalMontants / editableData.montantTotal) * 100) : 0
                      }%
                    </div>
                    <div className="text-sm text-orange-600">du budget</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-orange-50 p-6 rounded-lg text-center">
                <IconPackage className="w-12 h-12 mx-auto mb-3 text-orange-300" />
                <div className="text-orange-600 mb-2">Aucune catégorie définie</div>
                <div className="text-sm text-orange-500">
                  Ajoutez des catégories d'achats pour commencer votre estimation
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-orange-600 py-8">
            <IconTruckDelivery className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <div>En attente du calcul d'estimation</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlocAchats; 