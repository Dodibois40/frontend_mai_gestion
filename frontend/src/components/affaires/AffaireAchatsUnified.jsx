import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  IconChevronDown,
  IconChevronUp,
  IconCalculator,
  IconChartBar,
  IconReceipt
} from '@tabler/icons-react';
import { FileText } from 'lucide-react';
import { getCategoriesAchat } from '@/services/categorieAchatService';
import { getBdcs, getAchats } from '@/services/achatService';
import { formatCurrency } from '@/utils/affaires';
import AffaireBdcSectionReal from './AffaireBdcSectionReal';
// import BdcSection from '../modules/bdc/BdcSection';
import { FactureAchatSection } from '../modules/factures-achats';
import {
  EstimationAchatsSection,
  SyntheseAchatsSection,
  ComparaisonChartSection
} from './achats';

const AffaireAchatsUnified = ({ affaire, onDataChanged }) => {
  // États pour la gestion des sections
  const [isEstimationCollapsed, setIsEstimationCollapsed] = useState(false);
  const [isAchatsRealisesCollapsed, setIsAchatsRealisesCollapsed] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [chartType, setChartType] = useState('bar');
  
  // États pour les données
  const [categoriesAchat, setCategoriesAchat] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [achatsRealises, setAchatsRealises] = useState([]);
  const [bdcReceptionnes, setBdcReceptionnes] = useState([]);
  const [loadingSynthese, setLoadingSynthese] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Données d'estimation (maintenant gérées par EstimationAchatsSection)
  const [estimationData, setEstimationData] = useState({
    montantDevisValides: affaire?.objectifCaHt || 0,
    pourcentageAchats: 30,
    categoriesEstimation: [
      { id: 'bois-massif', nom: 'Bois massif', couleur: '#8B4513', pourcentage: 25 },
      { id: 'panneau', nom: 'Panneau', couleur: '#D2691E', pourcentage: 20 },
      { id: 'quincaillerie', nom: 'Quincaillerie', couleur: '#708090', pourcentage: 15 },
      { id: 'colle', nom: 'Colle', couleur: '#FFD700', pourcentage: 10 },
      { id: 'abrasifs', nom: 'Abrasifs', couleur: '#DEB887', pourcentage: 8 },
      { id: 'divers', nom: 'Divers', couleur: '#9370DB', pourcentage: 12 },
      { id: 'visserie', nom: 'Visserie', couleur: '#C0C0C0', pourcentage: 5 },
      { id: 'vernis', nom: 'Vernis', couleur: '#FFA500', pourcentage: 5 }
    ]
  });

  // Chargement des catégories d'achat
  const loadCategoriesAchat = async () => {
    try {
      setLoadingCategories(true);
      const response = await getCategoriesAchat();
      if (response && Array.isArray(response)) {
        setCategoriesAchat(response);
      } else {
        setCategoriesAchat([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      setCategoriesAchat([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Chargement de la synthèse des achats réalisés
  const loadSyntheseAchatsRealises = async () => {
    try {
      setLoadingSynthese(true);
      const [bdcResponse, achatsResponse] = await Promise.all([
        getBdcs({ affaireId: affaire.id }),
        getAchats({ affaireId: affaire.id })
      ]);
      
      let bdcsList = [];
      if (bdcResponse?.bdc) {
        bdcsList = bdcResponse.bdc;
      } else if (bdcResponse?.bdcs) {
        bdcsList = bdcResponse.bdcs;
      } else if (Array.isArray(bdcResponse)) {
        bdcsList = bdcResponse;
      }
      
      const bdcReceptionnesList = bdcsList.filter(bdc => 
        bdc && (bdc.dateReception || bdc.statut === 'RECEPTIONNE')
      );
      
      let facturesList = [];
      if (Array.isArray(achatsResponse)) {
        facturesList = achatsResponse;
      } else if (achatsResponse && Array.isArray(achatsResponse.achats)) {
        facturesList = achatsResponse.achats;
      }
      
      setBdcReceptionnes(bdcReceptionnesList);
      setAchatsRealises(facturesList);
      
    } catch (error) {
      console.error('Erreur lors du chargement de la synthèse:', error);
      setBdcReceptionnes([]);
      setAchatsRealises([]);
    } finally {
      setLoadingSynthese(false);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    if (affaire?.id) {
      Promise.all([
        loadCategoriesAchat(),
        loadSyntheseAchatsRealises()
      ]);
    }
  }, [affaire?.id]);

  // Rechargement lors des changements
  useEffect(() => {
    if (affaire?.id && refreshKey > 0) {
      loadSyntheseAchatsRealises();
    }
  }, [refreshKey]);

  // Gestionnaire pour les changements de données des composants enfants
  const handleChildDataChanged = () => {
    setRefreshKey(prev => prev + 1);
    if (onDataChanged) {
      onDataChanged();
    }
  };

  // Calcul du montant total estimé
  const montantTotalEstime = useMemo(() => {
    return Math.round(estimationData.montantDevisValides * estimationData.pourcentageAchats / 100);
  }, [estimationData.montantDevisValides, estimationData.pourcentageAchats]);

  // Synthèse des achats réalisés par catégorie pour la comparaison
  const syntheseAchatsRealises = useMemo(() => {
    if (!categoriesAchat || categoriesAchat.length === 0) return [];
    
    return categoriesAchat.map(categorie => {
      const totalBdc = bdcReceptionnes
        .filter(bdc => bdc.categorieId === categorie.id)
        .reduce((sum, bdc) => sum + (bdc.montantHt || 0), 0);
      
      const totalFactures = achatsRealises
        .filter(achat => achat.categorieId === categorie.id)
        .reduce((sum, achat) => sum + (achat.montantHt || 0), 0);
      
      const totalReel = totalBdc + totalFactures;
      
      const categorieEstim = estimationData.categoriesEstimation.find(c => 
        c.nom.toLowerCase().includes(categorie.intitule.toLowerCase()) ||
        categorie.intitule.toLowerCase().includes(c.nom.toLowerCase())
      );
      
      const montantEstime = categorieEstim ? 
        Math.round(montantTotalEstime * categorieEstim.pourcentage / 100) : 0;
      
      return {
        id: categorie.id,
        nom: categorie.intitule,
        code: categorie.code,
        totalBdc,
        totalFactures,
        totalReel,
        montantEstime,
        ecart: totalReel - montantEstime,
        pourcentageRealisation: montantEstime > 0 ? Math.round((totalReel / montantEstime) * 100) : 0
      };
    }).filter(cat => cat.totalReel > 0 || cat.montantEstime > 0);
  }, [categoriesAchat, bdcReceptionnes, achatsRealises, estimationData, montantTotalEstime]);

  return (
    <div className="space-y-6">
      {/* Section Gestion des BDC et Factures - REMONTÉE EN PREMIER */}
      <div className="relative w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section Bons de Commande */}
          <div className="relative">
            <AffaireBdcSectionReal 
              affaireId={affaire?.id} 
              categoriesAchat={categoriesAchat}
              onUpdate={handleChildDataChanged} 
            />
          </div>
          
          {/* Section Factures d'Achats */}
          <div className="relative">
            <FactureAchatSection 
              affaireId={affaire?.id} 
              categoriesAchat={categoriesAchat} 
              onUpdate={handleChildDataChanged} 
            />
          </div>
        </div>
      </div>

      {/* Layout en grille pour les sections d'analyse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section Estimation des Achats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div 
            className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            onClick={() => setIsEstimationCollapsed(!isEstimationCollapsed)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <IconCalculator className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Estimation des Achats</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Prévisionnel</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full">
                PRÉVISIONNEL
              </span>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                {isEstimationCollapsed ? (
                  <IconChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <IconChevronUp className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          <EstimationAchatsSection
            affaire={affaire}
            onDataUpdate={handleChildDataChanged}
            isCollapsed={isEstimationCollapsed}
            onToggleCollapse={setIsEstimationCollapsed}
          />
        </div>
        
        {/* Section Synthèse des Achats Réalisés */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div 
            className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            onClick={() => setIsAchatsRealisesCollapsed(!isAchatsRealisesCollapsed)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <IconReceipt className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Achats Réalisés</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Réel</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                RÉALISÉ
              </span>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                {isAchatsRealisesCollapsed ? (
                  <IconChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <IconChevronUp className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {!isAchatsRealisesCollapsed && (
            <div className="p-6">
              <SyntheseAchatsSection
                affaire={affaire}
                onDataUpdate={handleChildDataChanged}
              />
            </div>
          )}
        </div>
      </div>

      {/* Section Graphiques de Comparaison */}
      <ComparaisonChartSection
        montantTotalEstime={montantTotalEstime}
        categoriesEstimation={estimationData.categoriesEstimation}
        syntheseAchatsRealises={syntheseAchatsRealises}
        chartType={chartType}
        onChartTypeChange={setChartType}
        showChart={showChart}
        onToggleChart={setShowChart}
      />
    </div>
  );
};

export default AffaireAchatsUnified; 