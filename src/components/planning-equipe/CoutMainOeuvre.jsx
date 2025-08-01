import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Calculator, Euro, Clock, Users, TrendingUp } from 'lucide-react';

/**
 * Composant pour calculer et afficher les coûts de main d'œuvre par affaire
 */
const CoutMainOeuvre = ({ 
  planningData, 
  ouvriers, 
  affaires, 
  weekDays, 
  loading = false,
  className = ""
}) => {
  const [coutsCalcules, setCoutsCalcules] = useState({});
  const [totaux, setTotaux] = useState({});
  const [expanded, setExpanded] = useState(true);

  // Configuration par défaut pour les heures par période
  const HEURES_PAR_PERIODE = {
    MATIN: 4,
    APREM: 4
  };

  /**
   * Calculer les coûts de main d'œuvre
   */
  const calculerCouts = useMemo(() => {
    if (!planningData || !ouvriers || !affaires) {
      return { coutsParAffaire: {}, totaux: {} };
    }

    console.log('🧮 Calcul des coûts de main d\'œuvre...');

    // Récupérer tous les ouvriers avec leurs taux horaires
    const tousOuvriers = [
      ...(ouvriers.salaries || []),
      ...(ouvriers.sousTraitants || [])
    ];

    const coutsParAffaire = {};
    let totalHeures = 0;
    let totalCout = 0;

    // Parcourir toutes les affectations
    Object.entries(planningData).forEach(([affaireId, affectations]) => {
      if (!affectations || affectations.length === 0) return;

      const affaire = affaires.find(a => a.id === affaireId);
      if (!affaire) return;

      const coutAffaire = {
        affaire,
        ouvriers: {},
        totalHeures: 0,
        totalCout: 0,
        details: []
      };

      // Parcourir les affectations pour cette affaire
      affectations.forEach(affectation => {
        const ouvrier = tousOuvriers.find(o => o.id === affectation.userId);
        if (!ouvrier) return;

        const ouvrierKey = `${ouvrier.id}`;
        
        // Initialiser les données de l'ouvrier s'il n'existe pas
        if (!coutAffaire.ouvriers[ouvrierKey]) {
          coutAffaire.ouvriers[ouvrierKey] = {
            ouvrier,
            totalHeures: 0,
            totalCout: 0,
            details: []
          };
        }

        // Calculer les heures pour cette affectation
        const heures = HEURES_PAR_PERIODE[affectation.periode] || 4;
        const coutHoraire = ouvrier.tarifHoraireBase || 0;
        const coutAffectation = heures * coutHoraire;

        // Ajouter aux totaux de l'ouvrier
        coutAffaire.ouvriers[ouvrierKey].totalHeures += heures;
        coutAffaire.ouvriers[ouvrierKey].totalCout += coutAffectation;
        coutAffaire.ouvriers[ouvrierKey].details.push({
          date: affectation.dateAffectation,
          periode: affectation.periode,
          typeActivite: affectation.typeActivite,
          heures,
          coutHoraire,
          coutAffectation
        });

        // Ajouter aux totaux de l'affaire
        coutAffaire.totalHeures += heures;
        coutAffaire.totalCout += coutAffectation;
      });

      // Convertir les ouvriers en tableau et trier par nom
      coutAffaire.details = Object.values(coutAffaire.ouvriers).sort((a, b) => 
        `${a.ouvrier.nom} ${a.ouvrier.prenom}`.localeCompare(`${b.ouvrier.nom} ${b.ouvrier.prenom}`)
      );

      coutsParAffaire[affaireId] = coutAffaire;
      totalHeures += coutAffaire.totalHeures;
      totalCout += coutAffaire.totalCout;
    });

    const totaux = {
      nombreAffaires: Object.keys(coutsParAffaire).length,
      totalHeures,
      totalCout,
      coutMoyenHeure: totalHeures > 0 ? totalCout / totalHeures : 0,
      coutMoyenAffaire: Object.keys(coutsParAffaire).length > 0 ? totalCout / Object.keys(coutsParAffaire).length : 0
    };

    console.log('✅ Coûts calculés:', { coutsParAffaire, totaux });

    return { coutsParAffaire, totaux };
  }, [planningData, ouvriers, affaires]);

  // Mettre à jour les états quand les calculs changent
  useEffect(() => {
    setCoutsCalcules(calculerCouts.coutsParAffaire);
    setTotaux(calculerCouts.totaux);
  }, [calculerCouts]);

  /**
   * Formater un montant en euros
   */
  const formatEuros = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(montant || 0);
  };

  /**
   * Formater les heures
   */
  const formatHeures = (heures) => {
    return `${heures || 0}h`;
  };

  /**
   * Obtenir la couleur du badge selon le type d'activité
   */
  const getBadgeColor = (typeActivite) => {
    switch (typeActivite) {
      case 'FABRICATION':
        return 'bg-blue-500 text-white';
      case 'POSE':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Coûts de Main d'Œuvre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Calcul des coûts en cours...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const affairesAvecCouts = Object.values(coutsCalcules).sort((a, b) => 
    a.affaire.numero.localeCompare(b.affaire.numero)
  );

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Coûts de Main d'Œuvre - Semaine
          </CardTitle>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {expanded ? 'Réduire' : 'Développer'}
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Résumé global */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Euro className="w-4 h-4" />
              <span className="text-sm font-medium">Total Coût</span>
            </div>
            <div className="text-lg font-bold text-blue-800">
              {formatEuros(totaux.totalCout)}
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Total Heures</span>
            </div>
            <div className="text-lg font-bold text-green-800">
              {formatHeures(totaux.totalHeures)}
            </div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Affaires</span>
            </div>
            <div className="text-lg font-bold text-purple-800">
              {totaux.nombreAffaires}
            </div>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Coût/Heure</span>
            </div>
            <div className="text-lg font-bold text-orange-800">
              {formatEuros(totaux.coutMoyenHeure)}
            </div>
          </div>
        </div>

        {expanded && (
          <>
            <Separator className="mb-4" />
            
            {/* Détail par affaire */}
            {affairesAvecCouts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune affectation trouvée pour cette semaine</p>
              </div>
            ) : (
              <div className="space-y-4">
                {affairesAvecCouts.map((coutAffaire) => (
                  <div key={coutAffaire.affaire.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {coutAffaire.affaire.numero}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {coutAffaire.affaire.libelle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {coutAffaire.affaire.client}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {formatEuros(coutAffaire.totalCout)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatHeures(coutAffaire.totalHeures)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Détail par ouvrier */}
                    <div className="space-y-2">
                      {coutAffaire.details.map((ouvrierCout) => (
                        <div key={ouvrierCout.ouvrier.id} className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">
                              {ouvrierCout.ouvrier.prenom} {ouvrierCout.ouvrier.nom}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-blue-600">
                                {formatEuros(ouvrierCout.totalCout)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatHeures(ouvrierCout.totalHeures)} × {formatEuros(ouvrierCout.ouvrier.tarifHoraireBase)}/h
                              </div>
                            </div>
                          </div>
                          
                          {/* Détail des affectations */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {ouvrierCout.details.map((detail, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span>{new Date(detail.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                  <span className="text-xs text-gray-500">{detail.periode}</span>
                                  <Badge className={`text-xs ${getBadgeColor(detail.typeActivite)}`}>
                                    {detail.typeActivite}
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <span className="font-medium">{formatEuros(detail.coutAffectation)}</span>
                                  <span className="text-xs text-gray-500 ml-1">({formatHeures(detail.heures)})</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CoutMainOeuvre; 