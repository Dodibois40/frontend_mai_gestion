import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IconArrowLeft,
  IconPencil,
  IconBriefcase,
  IconUser,
  IconMapPin,
  IconCalendarEvent,
  IconBuilding,
  IconRefresh,
  IconPhone,
  IconMail,
  IconWorld,
  IconTrendingUp,
  IconCurrencyEuro,
  IconShoppingCart,
  IconBuildingFactory,
  IconTarget,
  IconChartLine,
  IconAlertTriangle,
  IconCheck,
  IconClock
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAffaireData } from '@/hooks/useAffaireData';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useAchatsData } from '@/hooks/useAchatsData';

import AffaireTabs from '@/components/affaires/AffaireTabs';
import AddressLink from '@/components/common/AddressLink';
import { formatCurrency, formatDate } from '@/utils/affaires';
import { StatusBadge, StatusDropdown } from '@/components/affaires/ui';
import AffairePdfExport from '@/components/affaires/AffairePdfExport';

const AffaireDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('synthese');

  // Hooks personnalisés pour la gestion des données
  const { 
    affaire, 
    loading: affaireLoading, 
    error: affaireError, 
    updateAffaire, 
    refreshAffaire 
  } = useAffaireData(id);

  const { 
    financialData, 
    loading: financialLoading, 
    error: financialError, 
    refreshFinancialData,
    getMarginAlerts 
  } = useFinancialData(id, affaire);

  const { 
    achatsParCategorie, 
    loading: achatsLoading, 
    error: achatsError, 
    refreshAchatsData 
  } = useAchatsData(id);

  // État de chargement global
  const loading = affaireLoading || financialLoading;

  // Gestion des erreurs
  useEffect(() => {
    if (affaireError) {
      toast.error('Erreur lors du chargement de l\'affaire');
      navigate('/affaires');
    }
  }, [affaireError, navigate]);

  // Fonction de rafraîchissement global
  const handleRefreshData = async () => {
    try {
      await Promise.all([
        refreshAffaire(),
        refreshFinancialData(),
        refreshAchatsData()
      ]);
      toast.success('Données mises à jour');
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };



  // Alertes de marge
  const marginAlerts = financialData ? getMarginAlerts() : {};

  // Fonction pour changer le statut de l'affaire
  const handleStatusChange = async (nouveauStatut) => {
    try {
      await updateAffaire({ statut: nouveauStatut });
      await refreshAffaire();
    } catch (error) {
      throw error; // Le StatusDropdown gérera l'affichage de l'erreur
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!affaire) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <IconBriefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Affaire non trouvée</h2>
          <p className="text-gray-600 mb-6">L'affaire demandée n'existe pas ou n'est plus accessible.</p>
          <Button 
            onClick={() => navigate('/affaires')} 
            className="w-full"
          >
            <IconArrowLeft className="w-4 h-4 mr-2" />
            Retour aux affaires
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 bg-stone-50 min-h-screen">
      <div className="w-full">
        {/* En-tête avec bouton retour */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/affaires')}
            className="text-stone-600 hover:text-stone-800 hover:bg-stone-200/60 px-3 py-1.5 rounded-lg transition-colors"
          >
            <IconArrowLeft className="w-4 h-4 mr-2" />
            Retour aux affaires
          </Button>
        </div>
        
        {/* Informations principales de l'affaire */}
        <div 
          className="p-6 rounded-2xl shadow-lg mb-8 text-white relative overflow-hidden"
          style={{
            backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/site-web-commande-panneaux.firebasestorage.app/o/Divers%20belles%20images%2FCapture%20d%E2%80%99%C3%A9cran%20du%202025-06-24%2016-55-23.png?alt=media&token=2c074298-e573-40fc-9430-adf76c0dac3b')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Section Info (8-9 colonnes) */}
            <div className="lg:col-span-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <IconBriefcase className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1 [text-shadow:0_2px_6px_rgba(0,0,0,0.8)]">{affaire.numero} - {affaire.libelle}</h1>
                  <StatusDropdown 
                    statutActuel={affaire.statut} 
                    onStatusChange={handleStatusChange}
                    size="md"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm">
                <div className="p-3 bg-black/20 rounded-lg backdrop-blur-sm">
                  <div className="font-semibold mb-1 text-lime-700 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">Client</div>
                  <div className="flex items-center gap-2">
                    <IconUser className="w-4 h-4 text-white/90" />
                    <span className="font-medium text-white">{affaire.client}</span>
                  </div>
                </div>
                <div className="p-3 bg-black/20 rounded-lg backdrop-blur-sm">
                  <div className="font-semibold mb-1 text-lime-700 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">Adresse</div>
                  {(affaire.adresse || affaire.ville) && (
                    <div className="flex items-start gap-2">
                      <IconMapPin className="w-4 h-4 text-white/90 mt-1 flex-shrink-0" />
                      <AddressLink 
                        addressData={affaire}
                        variant="compact"
                        className="text-white"
                        showIcon={false}
                      />
                    </div>
                  )}
                </div>
                <div className="p-3 bg-black/20 rounded-lg backdrop-blur-sm">
                  <div className="font-semibold mb-1 text-lime-700 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">Création</div>
                  <div className="flex items-center gap-2">
                    <IconCalendarEvent className="w-4 h-4 text-white/90" />
                    <span className="font-medium text-white">{formatDate(affaire.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Actions (4-3 colonnes) */}
            <div className="lg:col-span-4 flex lg:flex-col lg:items-end gap-3">
              <Button
                onClick={handleRefreshData}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-md w-full lg:w-auto"
              >
                <IconRefresh className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <Button
                onClick={() => navigate(`/affaires/${affaire.id}/modifier`)}
                className="bg-olive-700/80 hover:bg-olive-600/90 text-white font-bold shadow-lg backdrop-blur-sm w-full lg:w-auto"
              >
                <IconPencil className="w-4 h-4 mr-2" />
                Modifier l'affaire
              </Button>
            </div>
          </div>
        </div>
        
        {/* Conteneur principal pour le reste de la page */}
        <div className="w-full">
          {/* Potentielle alerte de marge */}
          {marginAlerts.isCritical && (
            <Card className="mb-6 bg-red-100/50 border-l-4 border-red-500 shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <IconAlertTriangle className="w-6 h-6 text-red-600" />
                <CardTitle className="text-red-800">Alerte Marge Critique</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700">
                  {marginAlerts.message} La marge réelle est de <span className="font-bold">{financialData.margeReelle.toFixed(2)}%</span>.
                </p>
              </CardContent>
            </Card>
          )}

          {/* ... Reste du contenu (onglets, etc.) ... */}
          <AffaireTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            affaire={affaire}
            financialData={financialData}
            marginAlerts={marginAlerts}
            achatsParCategorie={achatsParCategorie}
            onRefreshData={handleRefreshData}
            loading={{ financial: financialLoading, achats: achatsLoading }}
          />
        </div>
      </div>
    </div>
  );
};

export default AffaireDetails; 