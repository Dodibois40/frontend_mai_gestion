import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { affairesService } from '@/services/affairesService';
import { 
  IconRefresh,
  IconArrowLeft,
  IconFileExport,
  IconChartBar
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ResultatsAffaires = () => {
  const navigate = useNavigate();
  const [affaires, setAffaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour charger toutes les affaires avec leurs données financières
  const loadAffaires = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger toutes les affaires sans filtre - L'API retourne { affaires: [...], total: ... }
      const response = await affairesService.getAffaires({ take: 1000, skip: 0 }); // Charger jusqu'à 1000 affaires
      console.log('📊 Réponse API complète:', response);
      
      const affairesData = response.affaires || response || [];
      console.log('📊 Affaires extraites:', affairesData);
      console.log('📊 Nombre total d\'affaires:', affairesData.length);
      
      // Afficher les numéros et statuts de toutes les affaires
      affairesData.forEach(aff => {
        console.log(`- Affaire ${aff.numero}: statut=${aff.statut}, objectifCaHt=${aff.objectifCaHt}`);
      });
      
      // Pour chaque affaire, charger les données financières détaillées
      const affairesAvecDonnees = await Promise.all(
        affairesData.map(async (affaire) => {
          try {
            const financialSituation = await affairesService.getFinancialSituation(affaire.id);
            return {
              ...affaire,
              financial: financialSituation
            };
          } catch (err) {
            console.error(`Erreur chargement données financières pour ${affaire.numero}:`, err);
            return affaire;
          }
        })
      );
      
      console.log('📊 Affaires chargées:', affairesAvecDonnees.length);
      console.log('📊 Détail des affaires:', affairesAvecDonnees);
      setAffaires(affairesAvecDonnees);
    } catch (err) {
      console.error('Erreur lors du chargement des affaires:', err);
      setError('Erreur lors du chargement des données');
      toast.error('Erreur lors du chargement des affaires');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAffaires();
  }, [loadAffaires]);

  // Fonction pour formater les montants
  const formatMontant = (montant) => {
    if (montant === null || montant === undefined) return '0 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  // Fonction pour formater les heures
  const formatHeures = (heures) => {
    if (!heures) return '0 h';
    return `${Math.round(heures)} h`;
  };

  // Fonction pour formater les pourcentages
  const formatPourcentage = (value) => {
    if (!value && value !== 0) return '0%';
    return `${Math.round(value)}%`;
  };

  // Fonction pour calculer l'écart avec couleur
  const formatEcart = (objectif, reel) => {
    const ecart = reel - objectif;
    const isPositif = ecart >= 0;
    return (
      <span className={isPositif ? 'text-green-600' : 'text-red-600'}>
        {isPositif ? '+' : ''}{formatMontant(ecart)}
      </span>
    );
  };

  // Fonction pour calculer l'écart heures
  const formatEcartHeures = (objectif, reel) => {
    const ecart = reel - objectif;
    const isPositif = ecart >= 0;
    return (
      <span className={isPositif ? 'text-green-600' : 'text-red-600'}>
        {isPositif ? '+' : ''}{formatHeures(ecart)}
      </span>
    );
  };

  // Fonction pour calculer l'écart pourcentage
  const formatEcartPourcentage = (objectif, reel) => {
    const ecart = reel - objectif;
    const isPositif = ecart >= 0;
    return (
      <span className={isPositif ? 'text-green-600' : 'text-red-600'}>
        {isPositif ? '+' : ''}{formatPourcentage(ecart)}
      </span>
    );
  };

  // Fonction pour obtenir la couleur du statut
  const getStatutColor = (statut) => {
    const colors = {
      'PLANIFIEE': 'bg-blue-100 text-blue-800',
      'EN_COURS': 'bg-green-100 text-green-800',
      'TERMINEE': 'bg-gray-100 text-gray-800',
      'SUSPENDUE': 'bg-orange-100 text-orange-800',
      'ANNULEE': 'bg-red-100 text-red-800'
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-stone-50 min-h-screen">
      {/* En-tête */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/affaires')}
            className="text-stone-600 hover:text-stone-800"
          >
            <IconArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Résultats Affaires</h1>
            <p className="text-stone-600">Vue condensée des objectifs, réalisations et écarts</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadAffaires}
            variant="outline"
            className="bg-white"
          >
            <IconRefresh className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700"
          >
            <IconFileExport className="w-4 h-4 mr-2" />
            Exporter Excel
          </Button>
        </div>
      </div>

      {/* Tableau principal */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-stone-100 border-b-2 border-stone-300">
              <tr>
                <th colSpan="4" className="text-center py-2 px-1 border-r-2 border-stone-300 bg-stone-200">
                  AFFAIRE
                </th>
                <th colSpan="5" className="text-center py-2 px-1 border-r-2 border-stone-300 bg-pink-100">
                  OBJECTIFS & RÉSULTATS ACHATS
                </th>
                <th colSpan="4" className="text-center py-2 px-1 border-r-2 border-stone-300 bg-yellow-100">
                  OBJECTIFS & RÉSULTATS HEURES
                </th>
                <th colSpan="6" className="text-center py-2 px-1 bg-orange-100">
                  TAUX
                </th>
              </tr>
              <tr className="text-[10px]">
                {/* AFFAIRE */}
                <th className="py-2 px-1 border-r border-stone-200 font-medium">N°</th>
                <th className="py-2 px-1 border-r border-stone-200 font-medium">NOM AFFAIRE</th>
                <th className="py-2 px-1 border-r border-stone-200 font-medium">MONTANT HT</th>
                <th className="py-2 px-1 border-r-2 border-stone-300 font-medium">POSTE</th>
                
                {/* ACHATS */}
                <th className="py-2 px-1 border-r border-stone-200 font-medium">BOIS</th>
                <th className="py-2 px-1 border-r border-stone-200 font-medium">QUINC</th>
                <th className="py-2 px-1 border-r border-stone-200 font-medium">AUTRES</th>
                <th className="py-2 px-1 border-r border-stone-200 font-medium bg-pink-50">TOTAL ACHATS</th>
                <th className="py-2 px-1 border-r-2 border-stone-300 font-medium">%</th>
                
                {/* HEURES */}
                <th className="py-2 px-1 border-r border-stone-200 font-medium">FAB</th>
                <th className="py-2 px-1 border-r border-stone-200 font-medium">POSE</th>
                <th className="py-2 px-1 border-r border-stone-200 font-medium bg-yellow-50">TOTAL H</th>
                <th className="py-2 px-1 border-r-2 border-stone-300 font-medium">COÛT MO</th>
                
                {/* TAUX */}
                <th className="py-2 px-1 border-r border-stone-200 font-medium">FG %</th>
                <th className="py-2 px-1 border-r border-stone-200 font-medium">FG €</th>
                <th className="py-2 px-1 border-r border-stone-200 font-medium">MARGE €</th>
                <th className="py-2 px-1 border-r border-stone-200 font-medium">MARGE %</th>
                <th className="py-2 px-1 border-r border-stone-200 font-medium bg-orange-50">FG+MARGE €</th>
                <th className="py-2 px-1 font-medium">FG+MARGE %</th>
              </tr>
            </thead>
            <tbody>
              {affaires.length === 0 ? (
                <tr>
                  <td colSpan="19" className="text-center py-8 text-stone-500">
                    <div>
                      <IconChartBar className="w-12 h-12 mx-auto mb-2 text-stone-300" />
                      <p className="font-medium">Aucune affaire trouvée</p>
                      <p className="text-sm mt-1">Créez des affaires avec des montants et des estimations pour voir les résultats</p>
                    </div>
                  </td>
                </tr>
              ) : affaires.map((affaire, index) => {
                // Debug - Afficher TOUTES les propriétés de l'affaire
                console.log(`🔍 Affaire ${affaire.numero} - Propriétés complètes:`, affaire);
                
                // Garder toutes les affaires, même celles sans montant objectif
                // (suppression du filtre)
                
                // Utiliser les données financières détaillées si disponibles
                const financial = affaire.financial || {};
                console.log(`💰 Données financières pour ${affaire.numero}:`, financial);
                
                const objectifCA = affaire.objectifCaHt || affaire.objectif_ca_ht || affaire.montant_devis_ht || 0;
                const caReel = financial.devis?.totalValides || affaire.caReelHt || affaire.ca_reel_ht || 0;
                
                // Propriétés des achats - Utiliser les données détaillées
                const achatsObjectif = affaire.objectifAchatHt || affaire.objectif_achat_ht || 0;
                const achatsReel = (financial.achats?.totalValides || 0) + (financial.bdc?.totalReceptionnes || 0) || affaire.achatReelHt || affaire.achat_reel_ht || 0;
                
                const pourcentageAchatsObjectif = objectifCA > 0 ? (achatsObjectif / objectifCA) * 100 : 0;
                const pourcentageAchatsReel = caReel > 0 ? (achatsReel / caReel) * 100 : 0;
                
                // Propriétés des heures - Utiliser les données du planning si disponibles
                const heuresFabObjectif = affaire.objectifHeuresFab || affaire.objectif_heures_fab || 0;
                const heuresPoseObjectif = affaire.objectifHeuresPose || affaire.objectif_heures_pose || 0;
                const heuresFabReel = financial.planning?.heuresParType?.FAB || affaire.heuresReellesFab || affaire.heures_reelles_fab || 0;
                const heuresPoseReel = financial.planning?.heuresParType?.POSE || affaire.heuresReellesPose || affaire.heures_reelles_pose || 0;
                
                // Calcul des frais généraux et marges (30% objectif, dynamique pour réel)
                const pourcentageFGObjectif = 30;
                
                const fgObjectif = objectifCA * 0.3;
                const fgReel = financial.fraisGeneraux?.montantReel || (caReel * 0.12);
                const pourcentageFGReel = caReel > 0 ? (fgReel / caReel) * 100 : 0;
                
                // 🚀 NOUVEAU : Utiliser les vrais coûts du planning au lieu du calcul fixe
                const coutMainOeuvreObjectif = (heuresFabObjectif + heuresPoseObjectif) * 35; // 35€/h pour les objectifs
                const coutMainOeuvreReel = financial.planning?.coutTotalReel || ((heuresFabReel + heuresPoseReel) * 35);
                
                const margeObjectif = objectifCA - achatsObjectif - fgObjectif - coutMainOeuvreObjectif;
                const margeReelle = caReel - achatsReel - fgReel - coutMainOeuvreReel;
                
                const totalFGMargeObjectif = fgObjectif + margeObjectif;
                const totalFGMargeReel = fgReel + margeReelle;
                
                const pourcentageFGMargeObjectif = objectifCA > 0 ? (totalFGMargeObjectif / objectifCA) * 100 : 0;
                const pourcentageFGMargeReel = caReel > 0 ? (totalFGMargeReel / caReel) * 100 : 0;

                return (
                  <React.Fragment key={affaire.id}>
                    {/* Ligne OBJECTIF */}
                    <tr className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}`}>
                      <td rowSpan="3" className="py-1 px-1 border-r border-stone-200 text-center font-medium">
                        {affaire.numero}
                      </td>
                      <td rowSpan="3" className="py-1 px-1 border-r border-stone-200">
                        <div className="font-medium">{affaire.libelle}</div>
                        <div className="text-[10px] text-stone-500">{affaire.client}</div>
                      </td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatMontant(objectifCA)}</td>
                      <td className="py-1 px-1 border-r-2 border-stone-300 font-medium text-blue-600">OBJECTIF</td>
                      
                      {/* ACHATS - Répartition fictive en 3 catégories */}
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatMontant(achatsObjectif * 0.4)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatMontant(achatsObjectif * 0.3)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatMontant(achatsObjectif * 0.3)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right font-medium bg-pink-50">{formatMontant(achatsObjectif)}</td>
                      <td className="py-1 px-1 border-r-2 border-stone-300 text-center">{formatPourcentage(pourcentageAchatsObjectif)}</td>
                      
                      {/* HEURES */}
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatHeures(heuresFabObjectif)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatHeures(heuresPoseObjectif)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right font-medium bg-yellow-50">{formatHeures(heuresFabObjectif + heuresPoseObjectif)}</td>
                      <td className="py-1 px-1 border-r-2 border-stone-300 text-right">{formatMontant(coutMainOeuvreObjectif)}</td>
                      
                      {/* TAUX */}
                      <td className="py-1 px-1 border-r border-stone-200 text-center">{formatPourcentage(pourcentageFGObjectif)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatMontant(fgObjectif)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatMontant(margeObjectif)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-center">{formatPourcentage(objectifCA > 0 ? (margeObjectif / objectifCA) * 100 : 0)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right font-medium bg-orange-50">{formatMontant(totalFGMargeObjectif)}</td>
                      <td className="py-1 px-1 text-center">{formatPourcentage(pourcentageFGMargeObjectif)}</td>
                    </tr>

                    {/* Ligne REALISE */}
                    <tr className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}`}>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatMontant(caReel)}</td>
                      <td className="py-1 px-1 border-r-2 border-stone-300 font-medium text-green-600">REALISE</td>
                      
                      {/* ACHATS REELS - Répartition fictive en 3 catégories */}
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatMontant(achatsReel * 0.4)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatMontant(achatsReel * 0.3)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatMontant(achatsReel * 0.3)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right font-medium bg-pink-50">{formatMontant(achatsReel)}</td>
                      <td className="py-1 px-1 border-r-2 border-stone-300 text-center">{formatPourcentage(pourcentageAchatsReel)}</td>
                      
                      {/* HEURES REELLES */}
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatHeures(heuresFabReel)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatHeures(heuresPoseReel)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right font-medium bg-yellow-50">{formatHeures(heuresFabReel + heuresPoseReel)}</td>
                      <td className="py-1 px-1 border-r-2 border-stone-300 text-right">{formatMontant(coutMainOeuvreReel)}</td>
                      
                      {/* TAUX REELS */}
                      <td className="py-1 px-1 border-r border-stone-200 text-center">{formatPourcentage(pourcentageFGReel)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatMontant(fgReel)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatMontant(margeReelle)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-center">{formatPourcentage(caReel > 0 ? (margeReelle / caReel) * 100 : 0)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right font-medium bg-orange-50">{formatMontant(totalFGMargeReel)}</td>
                      <td className="py-1 px-1 text-center">{formatPourcentage(pourcentageFGMargeReel)}</td>
                    </tr>

                    {/* Ligne ECART */}
                    <tr className={`border-b-2 border-stone-300 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'}`}>
                      <td className="py-1 px-1 border-r border-stone-200 text-right font-medium">
                        {formatEcart(objectifCA, caReel)}
                      </td>
                      <td className="py-1 px-1 border-r-2 border-stone-300 font-medium text-gray-600">ECART</td>
                      
                      {/* ECARTS ACHATS */}
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatEcart(achatsObjectif * 0.4, achatsReel * 0.4)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatEcart(achatsObjectif * 0.3, achatsReel * 0.3)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatEcart(achatsObjectif * 0.3, achatsReel * 0.3)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right font-medium bg-pink-50">
                        {formatEcart(achatsObjectif, achatsReel)}
                      </td>
                      <td className="py-1 px-1 border-r-2 border-stone-300 text-center">
                        {formatEcartPourcentage(pourcentageAchatsObjectif, pourcentageAchatsReel)}
                      </td>
                      
                      {/* ECARTS HEURES */}
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatEcartHeures(heuresFabObjectif, heuresFabReel)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatEcartHeures(heuresPoseObjectif, heuresPoseReel)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right font-medium bg-yellow-50">
                        {formatEcartHeures(heuresFabObjectif + heuresPoseObjectif, heuresFabReel + heuresPoseReel)}
                      </td>
                      <td className="py-1 px-1 border-r-2 border-stone-300 text-right">
                        {formatEcart(coutMainOeuvreObjectif, coutMainOeuvreReel)}
                      </td>
                      
                      {/* ECARTS TAUX */}
                      <td className="py-1 px-1 border-r border-stone-200 text-center">
                        {formatEcartPourcentage(pourcentageFGObjectif, pourcentageFGReel)}
                      </td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatEcart(fgObjectif, fgReel)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right">{formatEcart(margeObjectif, margeReelle)}</td>
                      <td className="py-1 px-1 border-r border-stone-200 text-center">
                        {formatEcartPourcentage(objectifCA > 0 ? (margeObjectif / objectifCA) * 100 : 0, caReel > 0 ? (margeReelle / caReel) * 100 : 0)}
                      </td>
                      <td className="py-1 px-1 border-r border-stone-200 text-right font-medium bg-orange-50">
                        {formatEcart(totalFGMargeObjectif, totalFGMargeReel)}
                      </td>
                      <td className="py-1 px-1 text-center">
                        {formatEcartPourcentage(pourcentageFGMargeObjectif, pourcentageFGMargeReel)}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ResultatsAffaires; 