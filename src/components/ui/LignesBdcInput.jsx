import React from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { X, Plus, Package2, Hash, Euro, Info, AlertCircle, Check, CheckCircle } from 'lucide-react';

const LignesBdcInput = ({ lignes, onLignesChange, disabled = false, errors = {} }) => {
  const ajouterLigne = () => {
    const nouvelleLigne = {
      id: Date.now(),
      designation: '',
      reference: '',
      quantite: 1,
      prixUnitaire: 0,
      validee: false,
    };
    onLignesChange([...lignes, nouvelleLigne]);
  };

  const supprimerLigne = (index) => {
    const nouvellesLignes = lignes.filter((_, i) => i !== index);
    onLignesChange(nouvellesLignes);
  };

  const modifierLigne = (index, champ, valeur) => {
    const nouvellesLignes = [...lignes];
    nouvellesLignes[index] = {
      ...nouvellesLignes[index],
      [champ]: valeur,
      validee: champ === 'validee' ? valeur : false
    };
    onLignesChange(nouvellesLignes);
  };

  const validerLigne = (index) => {
    const ligne = lignes[index];
    if (ligne.designation?.trim() && ligne.quantite > 0) {
      modifierLigne(index, 'validee', true);
    }
  };

  const calculerMontantLigne = (quantite, prixUnitaire) => {
    if (prixUnitaire === 0) return "À définir";
    return (quantite * prixUnitaire).toFixed(2);
  };

  const calculerMontantTotal = () => {
    const total = lignes.reduce((total, ligne) => {
      if (ligne.prixUnitaire > 0) {
        return total + (ligne.quantite * ligne.prixUnitaire);
      }
      return total;
    }, 0);
    return total.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 rounded-full p-2">
            <Package2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Liste des articles</h3>
            <p className="text-sm text-gray-500">Ajoutez les articles à commander</p>
            <div className="flex items-center mt-1 text-xs text-amber-600">
              <Info className="h-3 w-3 mr-1" />
              Les lignes vides seront automatiquement ignorées
            </div>
            {lignes.length > 0 && (
              <div className="flex items-center mt-1 text-xs text-[#8B9B7A]">
                <CheckCircle className="h-3 w-3 mr-1" />
                {lignes.filter(ligne => ligne.validee).length} / {lignes.length} ligne(s) validée(s)
              </div>
            )}
          </div>
        </div>
        <Button
          type="button"
          onClick={ajouterLigne}
          disabled={disabled}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un article
        </Button>
      </div>

      {/* Liste des articles avec table responsive */}
      <div className="space-y-4">
        {lignes.map((ligne, index) => {
          const estValidee = ligne.validee || false;
          
          return (
            <div 
              key={ligne.id || index} 
              className={`bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
                estValidee 
                  ? 'border-[#8B9B7A] bg-[#8B9B7A]/5' 
                  : 'border-gray-200'
              }`}
            >
              {/* Badge de validation */}
              {estValidee && (
                <div className="flex items-center mb-4 text-[#8B9B7A]">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Ligne validée</span>
                </div>
              )}
              
              {/* Table responsive avec toutes les colonnes */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="text-sm font-medium text-gray-700 pb-2 w-1/3">
                        <div className="flex items-center">
                          <Package2 className="h-4 w-4 mr-2 text-blue-600" />
                          Désignation *
                        </div>
                      </th>
                      <th className="text-sm font-medium text-gray-700 pb-2 w-1/6">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 mr-2 text-gray-500" />
                          Référence
                        </div>
                      </th>
                      <th className="text-sm font-medium text-gray-700 pb-2 w-1/12">Quantité *</th>
                      <th className="text-sm font-medium text-gray-700 pb-2 w-1/6">
                        <div className="flex items-center">
                          <Euro className="h-4 w-4 mr-2 text-green-600" />
                          Prix unitaire (€)
                        </div>
                      </th>
                      <th className="text-sm font-medium text-gray-700 pb-2 w-1/12">Total (€)</th>
                      <th className="text-sm font-medium text-gray-700 pb-2 w-1/6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {/* Désignation */}
                      <td className="pr-4">
                        <Input
                          placeholder="Ex: Panneau MDF plaqué chêne"
                          value={ligne.designation}
                          onChange={(e) => modifierLigne(index, 'designation', e.target.value)}
                          disabled={disabled}
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg h-10 w-full"
                        />
                        {errors[`ligne_${index}_designation`] && (
                          <p className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors[`ligne_${index}_designation`]}
                          </p>
                        )}
                      </td>
                      
                      {/* Référence */}
                      <td className="pr-4">
                        <Input
                          placeholder="Ex: 124"
                          value={ligne.reference}
                          onChange={(e) => modifierLigne(index, 'reference', e.target.value)}
                          disabled={disabled}
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg h-10 w-full"
                        />
                      </td>
                      
                      {/* Quantité */}
                      <td className="pr-4">
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={ligne.quantite}
                          onChange={(e) => modifierLigne(index, 'quantite', parseInt(e.target.value) || 1)}
                          disabled={disabled}
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg h-10 w-full"
                        />
                        {errors[`ligne_${index}_quantite`] && (
                          <p className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors[`ligne_${index}_quantite`]}
                          </p>
                        )}
                      </td>
                      
                      {/* Prix unitaire */}
                      <td className="pr-4">
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={ligne.prixUnitaire === 0 ? '' : ligne.prixUnitaire}
                            onChange={(e) => modifierLigne(index, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                            disabled={disabled}
                            placeholder="Prix à définir..."
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg h-10 w-full"
                          />
                        </div>
                        {errors[`ligne_${index}_prix`] && (
                          <p className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors[`ligne_${index}_prix`]}
                          </p>
                        )}
                      </td>
                      
                      {/* Total */}
                      <td className="pr-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center h-10 flex items-center justify-center">
                          <span className="font-medium text-gray-700">
                            {calculerMontantLigne(ligne.quantite, ligne.prixUnitaire)}
                          </span>
                        </div>
                      </td>
                      
                      {/* Actions */}
                      <td className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Bouton Valider */}
                          {ligne.designation?.trim() && ligne.quantite > 0 && !ligne.validee ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => validerLigne(index)}
                              disabled={disabled}
                              className="bg-[#8B9B7A] hover:bg-[#7A8A69] text-white px-3 py-2 rounded-lg"
                              title="Valider cette ligne"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Valider
                            </Button>
                          ) : ligne.validee ? (
                            <div className="flex items-center text-[#8B9B7A] px-3 py-2 bg-[#8B9B7A]/10 rounded-lg">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">Validée</span>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 px-3 py-2">
                              À compléter
                            </div>
                          )}
                          
                          {/* Bouton Supprimer */}
                          {lignes.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => supprimerLigne(index)}
                              disabled={disabled}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2"
                              title="Supprimer cette ligne"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Résumé financier */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Euro className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              {lignes.some(ligne => ligne.prixUnitaire === 0) ? (
                <>
                  <h3 className="font-medium text-blue-900">
                    Montant partiel HT : {calculerMontantTotal()} €
                  </h3>
                  <p className="text-sm text-amber-700 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Certains prix sont à définir
                  </p>
                </>
              ) : (
                <h3 className="font-medium text-blue-900">
                  Montant total HT : {calculerMontantTotal()} €
                </h3>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {errors.lignes && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {errors.lignes}
          </p>
        </div>
      )}
    </div>
  );
};

export default LignesBdcInput; 