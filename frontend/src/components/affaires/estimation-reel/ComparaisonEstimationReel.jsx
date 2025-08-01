import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  IconRefresh, 
  IconChart, 
  IconAlert, 
  IconTrendingUp, 
  IconTrendingDown,
  IconCalendar,
  IconTarget,
  IconCurrency,
  IconClock,
  IconUsers,
  IconShoppingCart,
  IconBuilding,
  IconTrendingDown as IconMarge
} from '@tabler/icons-react';
import { toast } from 'react-hot-toast';
import * as estimationReelService from '../../../services/estimationReelService';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import EcartsVisualization from './EcartsVisualization';
import HistoriqueComparaisons from './HistoriqueComparaisons';

const ComparaisonEstimationReel = ({ affaireId, affaire }) => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [comparaisons, setComparaisons] = useState([]);
  const [resumeEcarts, setResumeEcarts] = useState(null);
  const [donneesReelles, setDonneesReelles] = useState(null);
  const [activeTab, setActiveTab] = useState('resume');

  useEffect(() => {
    if (affaireId) {
      chargerDonnees();
    }
  }, [affaireId]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      
      // Charger les données en parallèle
      const [comparaisonsData, resumeData, reellesData] = await Promise.all([
        estimationReelService.getComparaisonsByAffaire(affaireId),
        estimationReelService.getResumeEcarts(affaireId).catch(() => null),
        estimationReelService.getDonneesReelles(affaireId).catch(() => null)
      ]);

      setComparaisons(comparaisonsData);
      setResumeEcarts(resumeData);
      setDonneesReelles(reellesData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des comparaisons');
    } finally {
      setLoading(false);
    }
  };

  const synchroniserDonnees = async () => {
    try {
      setSyncing(true);
      
      // Déclencher une nouvelle comparaison
      await estimationReelService.createComparaison({
        affaireId,
        estimationId: 'latest', // Le backend récupérera la dernière estimation validée
        typeComparaison: 'SNAPSHOT'
      });

      await chargerDonnees();
      toast.success('Synchronisation terminée avec succès');
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'ACCEPTABLE': return 'bg-green-100 text-green-800';
      case 'ATTENTION': return 'bg-yellow-100 text-yellow-800';
      case 'CRITIQUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEcartIcon = (pourcentage) => {
    if (pourcentage > 5) return <IconTrendingUp className="w-4 h-4 text-red-500" />;
    if (pourcentage < -5) return <IconTrendingDown className="w-4 h-4 text-green-500" />;
    return <IconTarget className="w-4 h-4 text-blue-500" />;
  };

  const formatPourcentage = (value) => {
    const absValue = Math.abs(value);
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Suivi Estimation vs Réel</h2>
          <p className="text-gray-600">
            {affaire?.numero} - {affaire?.libelle}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={synchroniserDonnees}
            disabled={syncing}
            className="flex items-center space-x-2"
          >
            <IconRefresh className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Synchronisation...' : 'Synchroniser'}</span>
          </Button>
        </div>
      </div>

      {/* Alertes d'écarts importants */}
      {resumeEcarts && (
        <div className="space-y-2">
          {Object.entries(resumeEcarts.ecarts).map(([categorie, ecart]) => (
            ecart.statut === 'CRITIQUE' && (
              <div key={categorie} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <IconAlert className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-red-800">
                    Écart critique détecté sur {categorie} : {formatPourcentage(ecart.pourcentage)}
                  </span>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resume">Résumé</TabsTrigger>
          <TabsTrigger value="graphiques">Graphiques</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>

        {/* Résumé des écarts */}
        <TabsContent value="resume" className="space-y-6">
          {resumeEcarts ? (
            <>
              {/* Indicateurs principaux */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
                    <IconCurrency className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {formatPourcentage(resumeEcarts.ecarts.montant.pourcentage)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          vs estimation
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getEcartIcon(resumeEcarts.ecarts.montant.pourcentage)}
                        <Badge className={getStatutColor(resumeEcarts.ecarts.montant.statut)}>
                          {resumeEcarts.ecarts.montant.statut}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Durée</CardTitle>
                    <IconClock className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {formatPourcentage(resumeEcarts.ecarts.duree.pourcentage)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          vs estimation
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getEcartIcon(resumeEcarts.ecarts.duree.pourcentage)}
                        <Badge className={getStatutColor(resumeEcarts.ecarts.duree.statut)}>
                          {resumeEcarts.ecarts.duree.statut}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Marge</CardTitle>
                    <IconMarge className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {formatPourcentage(resumeEcarts.ecarts.marge.pourcentage)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          vs estimation
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getEcartIcon(resumeEcarts.ecarts.marge.pourcentage)}
                        <Badge className={getStatutColor(resumeEcarts.ecarts.marge.statut)}>
                          {resumeEcarts.ecarts.marge.statut}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Écarts détaillés */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <IconUsers className="w-5 h-5" />
                      <span>Main d'œuvre</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-bold">
                          {formatPourcentage(resumeEcarts.ecarts.mainOeuvre.pourcentage)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Écart vs estimation
                        </p>
                      </div>
                      <Badge className={getStatutColor(resumeEcarts.ecarts.mainOeuvre.statut)}>
                        {resumeEcarts.ecarts.mainOeuvre.statut}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <IconShoppingCart className="w-5 h-5" />
                      <span>Achats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-bold">
                          {formatPourcentage(resumeEcarts.ecarts.achats.pourcentage)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Écart vs estimation
                        </p>
                      </div>
                      <Badge className={getStatutColor(resumeEcarts.ecarts.achats.statut)}>
                        {resumeEcarts.ecarts.achats.statut}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <IconBuilding className="w-5 h-5" />
                      <span>Frais généraux</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-bold">
                          {formatPourcentage(resumeEcarts.ecarts.fraisGeneraux.pourcentage)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Écart vs estimation
                        </p>
                      </div>
                      <Badge className={getStatutColor(resumeEcarts.ecarts.fraisGeneraux.statut)}>
                        {resumeEcarts.ecarts.fraisGeneraux.statut}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Informations de mise à jour */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <IconCalendar className="w-5 h-5" />
                    <span>Dernière mise à jour</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{formatDate(resumeEcarts.dateComparaison)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{resumeEcarts.typeComparaison}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <Badge variant={resumeEcarts.statut === 'TERMINEE' ? 'default' : 'secondary'}>
                        {resumeEcarts.statut}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8">
              <IconChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune comparaison disponible
              </h3>
              <p className="text-gray-600 mb-4">
                Cliquez sur "Synchroniser" pour créer votre première comparaison
              </p>
              <Button onClick={synchroniserDonnees} disabled={syncing}>
                {syncing ? 'Synchronisation...' : 'Créer la première comparaison'}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Graphiques */}
        <TabsContent value="graphiques">
          <EcartsVisualization 
            comparaisons={comparaisons}
            resumeEcarts={resumeEcarts}
            donneesReelles={donneesReelles}
          />
        </TabsContent>

        {/* Historique */}
        <TabsContent value="historique">
          <HistoriqueComparaisons 
            comparaisons={comparaisons}
            onRefresh={chargerDonnees}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComparaisonEstimationReel; 