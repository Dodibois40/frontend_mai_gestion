import React, { useState } from 'react';
import {
  IconFileText,
  IconShoppingCart,
  IconChartLine,
  IconCalculator,
  IconFolder
} from '@tabler/icons-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AffaireAchatsUnified from './AffaireAchatsUnified';
import AffaireDevis from './AffaireDevis';
import AffaireDashboard from './AffaireDashboard';
import AffaireFinancialSummary from './AffaireFinancialSummary';
import AffairePdfExport from './AffairePdfExport';
import AffaireEstimation from './estimation/AffaireEstimation';
import AffaireDocumentations from './documentations/AffaireDocumentations';
import * as estimationService from '../../services/estimationReelService';
import { affairesService } from '../../services/affairesService';

const AffaireTabs = ({ 
  affaire, 
  financialData, 
  achatsParCategorie, 
  onRefreshData,
  activeTab,
  onTabChange,
  marginAlerts,
  showOnlyTabs = false,
  showOnlyContent = false
}) => {
  
  // Fonction de sauvegarde de l'estimation
  const handleEstimationSave = async (estimation) => {
    try {
      console.log('🔥 DÉBUT SAUVEGARDE ESTIMATION INTELLIGENTE:', estimation);
      
      // Fonction utilitaire pour convertir les dates françaises en format ISO
      function convertirDateFrancaiseVersISO(dateFr) {
        if (!dateFr) return undefined;
        
        // Si c'est déjà une date ISO, la retourner telle quelle
        if (dateFr.includes('T') || dateFr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateFr.split('T')[0];
        }
        
        // Si c'est au format français DD/MM/YYYY
        if (dateFr.includes('/')) {
          const [jour, mois, annee] = dateFr.split('/');
          return `${annee}-${mois.padStart(2, '0')}-${jour.padStart(2, '0')}`;
        }
        
        return dateFr;
      }

      // Préparer les données pour l'API estimation-reel
      const estimationData = {
        affaireId: affaire.id,
        montantTotalEstime: estimation.montantDevis || 0,
        dureeTotaleEstimee: estimation.totalDemiJournees || 0,
        coutMainOeuvreEstime: estimation.montantMainOeuvreCout || estimation.montantMainOeuvre || 0,
        coutAchatsEstime: estimation.montantAchats || 0,
        coutFraisGenerauxEstime: estimation.montantFraisGeneraux || 0,
        margeEstimee: estimation.montantMarge || 0,
        demiJourneesFabricationEstimees: estimation.demiJourneesFabrication || 0,
        demiJourneesPoseEstimees: estimation.demiJourneesPose || 0,
        nombrePersonnesEstime: estimation.nombrePersonnes || 2,
        tauxHoraireMoyenEstime: estimation.tauxHoraireCout || estimation.tauxHoraire || 25,
        tauxHoraireVente: estimation.tauxHoraireVente || 75,
        dateCommencementEstimee: estimation.dateCommencementEstimee ? 
          convertirDateFrancaiseVersISO(estimation.dateCommencementEstimee) : 
          (estimation.dateDebut ? convertirDateFrancaiseVersISO(estimation.dateDebut) : undefined),
        dateReceptionEstimee: estimation.dateReceptionEstimee ? 
          convertirDateFrancaiseVersISO(estimation.dateReceptionEstimee) : 
          (estimation.dateFin ? convertirDateFrancaiseVersISO(estimation.dateFin) : undefined),
        commentaire: 'Estimation intelligente générée',
        // Sérialiser les données étendues en JSON
        donneesEtendues: JSON.stringify({
          categoriesAchats: estimation.categoriesAchats || [],
          repartitionAchats: estimation.repartitionAchats || {},
          repartitionFabrication: estimation.repartitionFabrication || 60,
          repartitionPose: estimation.repartitionPose || 40,
          montantMainOeuvreVente: estimation.montantMainOeuvreVente || 0,
          montantMainOeuvreGain: estimation.montantMainOeuvreGain || 0,
          couleurPastel: estimation.couleurPastel,
          couleurBordure: estimation.couleurBordure,
          affaireNumero: estimation.affaireNumero,
          affaireClient: estimation.affaireClient,
          version: estimation.version || '1.0'
        })
      };

      console.log('📊 DONNÉES ESTIMATION PRÉPARÉES:', estimationData);

      // Vérifier s'il existe déjà une estimation pour cette affaire
      const estimationsExistantes = await estimationService.getEstimationsByAffaire(affaire.id);
      
      let result;
      if (estimationsExistantes && estimationsExistantes.length > 0) {
        // Mettre à jour l'estimation existante
        const estimationExistante = estimationsExistantes[0];
        result = await estimationService.updateEstimation(estimationExistante.id, estimationData);
        console.log('✅ Estimation mise à jour avec succès');
      } else {
        // Créer une nouvelle estimation
        result = await estimationService.createEstimation(estimationData);
        console.log('✅ Nouvelle estimation créée avec succès');
      }

      // Mettre à jour aussi les objectifs de l'affaire
      const objectifsData = {
        objectifCaHt: estimation.montantDevis || 0,
        objectifAchatHt: estimation.montantAchats || 0,
        objectifHeuresFab: Math.round((estimation.demiJourneesFabrication || 0) * 4), // Convertir demi-journées en heures
        objectifHeuresPose: Math.round((estimation.demiJourneesPose || 0) * 4),
        objectifFraisGeneraux: estimation.montantFraisGeneraux || 0,
        dateCommencement: estimationData.dateCommencementEstimee,
        dateCloturePrevue: estimationData.dateReceptionEstimee
      };

      await affairesService.updateAffaire(affaire.id, objectifsData);
      console.log('✅ Objectifs affaire mis à jour');

      // Rafraîchir les données
      if (onRefreshData) {
        onRefreshData();
      }
      
      console.log('🎉 SAUVEGARDE TERMINÉE AVEC SUCCÈS');
      
    } catch (error) {
      console.error('❌ ERREUR SAUVEGARDE ESTIMATION:', error);
      throw error; // Propager l'erreur pour que le composant puisse l'afficher
    }
  };
  
  // Configuration des onglets
  const tabs = [
    {
      id: 'synthese',
      label: 'Synthèse',
      icon: IconChartLine,
      description: 'Vue d\'ensemble de l\'affaire'
    },
    {
      id: 'devis',
      label: 'Devis',
      icon: IconFileText,
      description: 'Gestion des devis et factures',
      badge: financialData.nbDevis || 0
    },
    {
      id: 'achats',
      label: 'Achats',
      icon: IconShoppingCart,
      description: 'Suivi des achats et BDC',
      badge: (financialData.nbAchats || 0) + (financialData.nbBdc || 0)
    },
    {
      id: 'documentations',
      label: 'Documentations',
      icon: IconFolder,
      description: 'Documents et fichiers de l\'affaire'
    },
    {
      id: 'estimation',
      label: 'Estimation',
      icon: IconCalculator,
      description: 'Estimation intelligente avec pré-remplissage automatique'
    }
  ];

  // Si on veut seulement les onglets
  if (showOnlyTabs) {
    return (
      <div className="w-full py-2">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="flex w-full bg-stone-200/80 backdrop-blur-xl border border-stone-300/50 shadow-lg rounded-xl p-1.5 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const iconColors = {
                'synthese': 'text-amber-600',
                'devis': 'text-orange-600', 
                'achats': 'text-lime-600',
                'documentations': 'text-indigo-600',
                'estimation': 'text-emerald-600'
              };
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 
                    bg-transparent hover:bg-stone-100/80 
                    data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md
                    border border-transparent hover:border-stone-300/60
                    text-stone-600 hover:text-stone-800 data-[state=active]:text-white"
                >
                  <Icon className={`w-4 h-4 ${iconColors[tab.id] || 'text-stone-500'} data-[state=active]:text-white transition-colors`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs bg-amber-100 text-amber-700 border-0 data-[state=active]:bg-white/20 data-[state=active]:text-white font-medium">
                      {tab.badge}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
    );
  }

  // Si on veut seulement le contenu
  if (showOnlyContent) {
    return (
      <div className="w-full">
        {/* Contenu des onglets seulement */}
        
        {activeTab === 'synthese' && (
          <div className="space-y-4">
            {/* Bouton d'export PDF */}
            <AffairePdfExport 
              affaire={affaire}
              financialData={financialData}
              marginAlerts={marginAlerts}
            />

            {/* Dashboard des métriques */}
            <AffaireDashboard 
              affaire={affaire}
              financialData={financialData}
              marginAlerts={marginAlerts}
            />

            {/* Résumé financier avec camemberts */}
            <AffaireFinancialSummary 
              affaire={affaire}
              financialData={financialData}
            />
          </div>
        )}

        {activeTab === 'devis' && (
          <AffaireDevis 
            affaireId={affaire.id}
            onDevisValidated={onRefreshData}
            onDevisChanged={onRefreshData}
          />
        )}

        {activeTab === 'achats' && (
          <AffaireAchatsUnified 
            affaire={affaire}
            achatsParCategorie={achatsParCategorie}
            onRefresh={onRefreshData}
          />
        )}

        {activeTab === 'documentations' && (
          <AffaireDocumentations 
            affaire={affaire}
            onRefreshData={onRefreshData}
          />
        )}

        {activeTab === 'estimation' && (
          <AffaireEstimation 
            affaire={affaire}
            onEstimationSave={handleEstimationSave}
            onEstimationReset={onRefreshData}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        {/* Liste des onglets */}
        <TabsList className="flex w-full mb-6 bg-stone-200/80 backdrop-blur-xl border border-stone-300/50 shadow-lg rounded-xl p-1.5 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            // Couleurs des icônes comme dans la sidebar
            const iconColors = {
                'synthese': 'text-amber-600',
                'devis': 'text-orange-600', 
                'achats': 'text-lime-600',
                'documentations': 'text-indigo-600',
                'estimation': 'text-emerald-600'
            };
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 
                  bg-transparent hover:bg-stone-100/80 
                  data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md
                  border border-transparent hover:border-stone-300/60
                  text-stone-600 hover:text-stone-800 data-[state=active]:text-white"
              >
                <Icon className={`w-4 h-4 ${iconColors[tab.id] || 'text-stone-500'} data-[state=active]:text-white transition-colors`} />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs bg-amber-100 text-amber-700 border-0 data-[state=active]:bg-white/20 data-[state=active]:text-white font-medium">
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Contenu des onglets */}
        
        {/* Onglet Synthèse */}
        <TabsContent value="synthese" className="space-y-6">
          {/* Bouton d'export PDF */}
          <AffairePdfExport 
            affaire={affaire}
            financialData={financialData}
            marginAlerts={marginAlerts}
          />

          {/* Dashboard des métriques */}
          <AffaireDashboard 
            affaire={affaire}
            financialData={financialData}
            marginAlerts={marginAlerts}
          />

          {/* Résumé financier avec camemberts */}
          <AffaireFinancialSummary 
            affaire={affaire}
            financialData={financialData}
          />
        </TabsContent>

        {/* Onglet Devis */}
        <TabsContent value="devis" className="space-y-6">
          <AffaireDevis 
            affaireId={affaire.id}
            onDevisValidated={onRefreshData}
            onDevisChanged={onRefreshData}
          />
        </TabsContent>

        {/* Onglet Achats */}
        <TabsContent value="achats" className="space-y-6">
          <AffaireAchatsUnified 
            affaire={affaire}
            achatsParCategorie={achatsParCategorie}
            onRefresh={onRefreshData}
          />
        </TabsContent>

        {/* Onglet Documentations */}
        <TabsContent value="documentations" className="space-y-6">
          <AffaireDocumentations 
            affaire={affaire}
            onRefreshData={onRefreshData}
          />
        </TabsContent>

        {/* Onglet Estimation */}
        <TabsContent value="estimation" className="space-y-6">
          <AffaireEstimation 
            affaire={affaire}
            onEstimationSave={handleEstimationSave}
            onEstimationReset={onRefreshData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffaireTabs; 