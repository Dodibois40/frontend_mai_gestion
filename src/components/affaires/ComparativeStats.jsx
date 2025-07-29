import React, { useState, useEffect } from 'react';
import { 
  IconTrendingUp, 
  IconTrendingDown, 
  IconMinus,
  IconCurrencyEuro,
  IconClock,
  IconShoppingCart,
  IconRefresh,
  IconCalculator
} from '@tabler/icons-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { affairesService } from '@/services/affairesService';
import { toast } from 'sonner';

const ComparativeStats = ({ affaireId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (affaireId) {
      fetchStats();
    }
  }, [affaireId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await affairesService.getComparativeStats(affaireId);
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast.error('Erreur lors du chargement des statistiques comparatives');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateReal = async () => {
    try {
      setCalculating(true);
      await affairesService.calculateRealData(affaireId);
      toast.success('Données réelles calculées automatiquement');
      await fetchStats(); // Recharger les stats
    } catch (error) {
      console.error('Erreur lors du calcul:', error);
      toast.error('Erreur lors du calcul des données réelles');
    } finally {
      setCalculating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatHours = (hours) => {
    return `${(hours || 0).toFixed(1)}h`;
  };

  const getEcartIcon = (ecart) => {
    if (ecart > 0) return <IconTrendingUp className="w-4 h-4" />;
    if (ecart < 0) return <IconTrendingDown className="w-4 h-4" />;
    return <IconMinus className="w-4 h-4" />;
  };

  const getEcartColor = (ecart, isPositiveGood = false) => {
    if (ecart === 0) return 'text-gray-500';
    
    const isGood = isPositiveGood ? ecart > 0 : ecart < 0;
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const StatItem = ({ 
    icon: Icon, 
    label, 
    objectif, 
    reel, 
    ecart, 
    formatter = formatCurrency,
    isPositiveGood = false 
  }) => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-blue-600" />
        <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Objectif</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatter(objectif)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Réel</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatter(reel)}
          </span>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Écart</span>
          <div className={`flex items-center gap-1 font-medium ${getEcartColor(ecart, isPositiveGood)}`}>
            {getEcartIcon(ecart)}
            <span>{formatter(Math.abs(ecart))}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparatif Objectif vs Réel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparatif Objectif vs Réel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Impossible de charger les statistiques comparatives
            </p>
            <Button 
              onClick={fetchStats} 
              variant="outline" 
              className="mt-4"
              icon={IconRefresh}
            >
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { objectifs, reels, ecarts } = stats;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <IconTrendingUp className="w-5 h-5" />
            Comparatif Objectif vs Réel
          </CardTitle>
          <Button
            onClick={handleCalculateReal}
            variant="outline"
            size="sm"
            disabled={calculating}
            icon={calculating ? undefined : IconCalculator}
          >
            {calculating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Calcul...
              </div>
            ) : (
              'Calculer automatiquement'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatItem
            icon={IconCurrencyEuro}
            label="Chiffre d'Affaires"
            objectif={objectifs.ca}
            reel={reels.ca}
            ecart={ecarts.ca}
            isPositiveGood={true}
          />
          
          <StatItem
            icon={IconShoppingCart}
            label="Achats"
            objectif={objectifs.achat}
            reel={reels.achat}
            ecart={ecarts.achat}
            isPositiveGood={false}
          />
          
          <StatItem
            icon={IconClock}
            label="Heures Fabrication"
            objectif={objectifs.heuresFab}
            reel={reels.heuresFab}
            ecart={ecarts.heuresFab}
            formatter={formatHours}
            isPositiveGood={false}
          />
          
          <StatItem
            icon={IconClock}
            label="Heures Service"
            objectif={objectifs.heuresSer}
            reel={reels.heuresSer}
            ecart={ecarts.heuresSer}
            formatter={formatHours}
            isPositiveGood={false}
          />
          
          <StatItem
            icon={IconClock}
            label="Heures Pose"
            objectif={objectifs.heuresPose}
            reel={reels.heuresPose}
            ecart={ecarts.heuresPose}
            formatter={formatHours}
            isPositiveGood={false}
          />
        </div>

        {/* Résumé global */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Résumé de Performance
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-300">Marge prévue:</span>
              <span className="ml-2 font-medium">
                {formatCurrency(objectifs.ca - objectifs.achat)}
              </span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Marge réelle:</span>
              <span className="ml-2 font-medium">
                {formatCurrency(reels.ca - reels.achat)}
              </span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Écart marge:</span>
              <span className={`ml-2 font-medium ${getEcartColor(ecarts.ca - ecarts.achat, true)}`}>
                {formatCurrency(Math.abs(ecarts.ca - ecarts.achat))}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparativeStats; 