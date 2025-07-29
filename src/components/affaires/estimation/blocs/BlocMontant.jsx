import React, { useState, useEffect } from 'react';
import { 
  IconCurrency, 
  IconWand, 
  IconChartBar,
  IconTarget
} from '@tabler/icons-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatEuros } from '@/utils/format';
// Imports de calcul et synchronisation supprimés - tout se passe dans le calendrier maintenant

/**
 * Bloc Montant - Saisie et stockage du montant
 * Saisie du montant → stockage SEULEMENT → planning obligatoire pour calculs
 */
const BlocMontant = ({ affaire, onEstimationChange, estimation = {} }) => {
  const [montant, setMontant] = useState(estimation.montantDevis || '');
  // Suppression de tous les états de calcul - aucun calcul automatique
  // Stockage montant uniquement - calculs après planification obligatoire
  
  // AUCUN calcul automatique - stockage montant uniquement
  const stockerMontantSeulement = () => {
    if (!montant || montant <= 0) return;
    
    const montantDevis = parseFloat(montant);
    
    // Stocker le montant AVEC une répartition par défaut
    const estimationPartielle = {
      montantDevis: montantDevis,
      affaireId: affaire.id,
      // Répartition par défaut pour affichage immédiat
      montantAchats: Math.round(montantDevis * 0.2),  // 20%
      montantMainOeuvre: Math.round(montantDevis * 0.35),  // 35%
      montantFraisGeneraux: Math.round(montantDevis * 0.3),  // 30%
      montantMarge: Math.round(montantDevis * 0.15),  // 15%
      totalDemiJournees: 0,
      dateDebut: '',
      dateFin: '',
      // Assurer la compatibilité avec les nouveaux champs
      montantMainOeuvreCout: Math.round(montantDevis * 0.35),
      montantMainOeuvreVente: Math.round(montantDevis * 0.35) * 3, // 3x le coût
      montantMainOeuvreGain: Math.round(montantDevis * 0.35) * 2  // Gain = vente - coût
    };
    
    // Notifier le parent avec la répartition par défaut
    if (onEstimationChange) {
      onEstimationChange(estimationPartielle);
    }
    
    // DEBUG
    console.log('🔍 BlocMontant - Validation montant:', {
      montant: montantDevis,
      estimation: estimationPartielle
    });
  };
  
  const handleMontantChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setMontant(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && montant && montant > 0) {
      e.preventDefault();
      stockerMontantSeulement();
    }
  };

  const handleValiderMontant = () => {
    if (montant && montant > 0) {
      stockerMontantSeulement();
    }
  };
  
  // Pas de recalcul forcé - tout se passe dans le calendrier maintenant

  // Gestionnaires de modal des dates supprimés - planification obligatoire dans le calendrier
  
  const hasMontantSaisi = estimation.montantDevis > 0;
  const hasCalculComplete = estimation.montantAchats > 0; // Vrai calcul effectué
  
  return (
    <Card className="bloc-montant bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-xl font-bold text-emerald-900 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                <IconCurrency className="w-6 h-6 text-white" />
              </div>
              Montant du Devis
            </CardTitle>
          </div>
          
          <p className="text-emerald-600 text-sm mb-6 flex items-center gap-2">
            <IconWand className="w-4 h-4" />
            Saisissez le montant puis remplissez obligatoirement le planning pour obtenir l'estimation
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 💰 Saisie du montant */}
        <div className="space-y-3">
          <Label htmlFor="montant" className="text-emerald-800 font-medium">
            Montant du devis (€)
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600">
              <IconCurrency className="w-5 h-5" />
            </div>
            <Input
              id="montant"
              type="text"
              value={montant}
              onChange={handleMontantChange}
              onKeyDown={handleKeyDown}
              placeholder="Ex: 10000"
              className="pl-12 pr-16 text-lg font-bold text-emerald-900 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 h-14"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 font-medium">
              €
            </div>
          </div>
          
          {/* Bouton de validation - seulement pour stocker le montant */}
          {montant && montant > 0 && !hasMontantSaisi && (
            <div className="flex flex-col items-center gap-3">
              <Button
                onClick={handleValiderMontant}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 text-lg font-bold shadow-lg hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <IconWand className="w-5 h-5 mr-2" />
                Valider le Montant
              </Button>
              <div className="text-center">
                <span className="text-2xl font-bold text-emerald-900 bg-emerald-100 px-4 py-2 rounded-lg">
                  {formatEuros(parseFloat(montant))}
                </span>
              </div>
            </div>
          )}

          {/* Montant validé - en attente de planning */}
          {hasMontantSaisi && !hasCalculComplete && (
            <div className="text-center space-y-3">
              <span className="text-2xl font-bold text-emerald-900 bg-emerald-100 px-4 py-2 rounded-lg">
                {formatEuros(estimation.montantDevis)}
              </span>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-orange-800 text-sm">
                <div className="font-medium">⏳ Montant validé</div>
                <div className="text-orange-700">
                  Remplissez maintenant le planning ci-dessous pour obtenir l'estimation complète
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* ✅ Estimation complète APRÈS planification */}
        {hasCalculComplete && (
          <div className="bg-emerald-100/50 border border-emerald-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-medium">
              <IconTarget className="w-5 h-5" />
              Estimation complète finalisée
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-emerald-600">Achats</span>
                  <span className="font-bold text-emerald-800">
                    {formatEuros(estimation.montantAchats)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-600">Coût MO</span>
                  <span className="font-bold text-emerald-800">
                    {formatEuros(estimation.montantMainOeuvreCout || estimation.montantMainOeuvre)}
                  </span>
                </div>
                {estimation.montantMainOeuvreVente && (
                  <div className="flex justify-between">
                    <span className="text-emerald-600">Vente MO</span>
                    <span className="font-bold text-green-700">
                      {formatEuros(estimation.montantMainOeuvreVente)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-emerald-600">Frais généraux</span>
                  <span className="font-bold text-emerald-800">
                    {formatEuros(estimation.montantFraisGeneraux)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-600">Marge</span>
                  <span className="font-bold text-emerald-800">
                    {formatEuros(estimation.montantMarge)}
                  </span>
                </div>
                {estimation.montantMainOeuvreGain > 0 && (
                  <div className="flex justify-between">
                    <span className="text-emerald-600">Gain MO</span>
                    <span className="font-bold text-green-700">
                      +{formatEuros(estimation.montantMainOeuvreGain)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-emerald-200 pt-3 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <IconChartBar className="w-4 h-4" />
                <span className="text-sm">
                  {estimation.totalDemiJournees} demi-journées • {estimation.nombrePersonnes} personnes
                </span>
              </div>
              
              {/* Affichage des dates */}
              {estimation.dateDebut && estimation.dateFin && (
                <div className="flex items-center gap-4 text-xs text-emerald-600">
                  <div className="flex items-center gap-1">
                    <span>🚀 Début:</span>
                    <span className="font-medium">
                      {new Date(estimation.dateDebut).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🏁 Fin:</span>
                    <span className="font-medium">
                      {new Date(estimation.dateFin).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-green-800 text-sm">
              ✅ <strong>Estimation finalisée</strong> - Calculée automatiquement après planification
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Modal des dates de planification supprimé - planification obligatoire dans le calendrier */}
      
      <style>{`
        .bloc-montant {
          transition: all 0.3s ease;
        }
        
        .bloc-montant:hover {
          transform: translateY(-2px);
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </Card>
  );
};

export default BlocMontant; 