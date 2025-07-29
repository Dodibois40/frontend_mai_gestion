import React, { useState, useEffect, useMemo } from 'react';
import { fraisGenerauxService } from '../../services/fraisGenerauxService';
import { planningEquipeService } from '../../services/planningEquipeService';
import { calculerTotauxHistoriquesAffaire } from '../../utils/affairesHistorique';

/**
 * Composant simplifié pour calculer et afficher les coûts de main d'œuvre par affaire avec frais généraux
 */
const CoutMainOeuvreSimple = ({ 
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
  const [fraisGeneraux, setFraisGeneraux] = useState([]);
  const [loadingFraisGeneraux, setLoadingFraisGeneraux] = useState(false);
  const [historiquesOuvriers, setHistoriquesOuvriers] = useState({});
  // 📊 NOUVEAU : État pour les frais généraux de la semaine
  const [fraisGenerauxSemaine, setFraisGenerauxSemaine] = useState(null);
  const [loadingFraisGenerauxSemaine, setLoadingFraisGenerauxSemaine] = useState(false);

  // Configuration par défaut pour les heures par période
  const HEURES_PAR_PERIODE = {
    MATIN: 4,
    APREM: 4
  };

  /**
   * 🧮 NOUVELLE LOGIQUE : Mutualisation dynamique des frais généraux
   * Base FIXE de 2125,92€ par semaine divisée par le nombre total d'affectations
   */
  const calculerMutualisationDynamique = (affectationsData, fraisGenerauxData) => {
    console.log('🧮 Calcul SIMPLE des frais généraux...');
    
    // SYSTÈME SIMPLE : 254,29 € FIXE par affectation (1 affectation = 1 demi-journée)
    const COUT_FIXE_PAR_AFFECTATION = 254.29;
    
    // 1. Détermination de la période d'analyse
    const { dateDebut, dateFin } = determinerPeriode(affectationsData);
    const nombreDemiJourneesPeriode = calculerNombreDemiJournees(dateDebut, dateFin);
    
    // 2. Comptage des affectations totales personne-demi-journée
    const totalAffectations = compterAffectationsPersonneDemiJournee(affectationsData);
    
    // 3. CALCUL SIMPLE : Chaque affectation = 254,29 € FIXE
    const fraisGenerauxParPersonne = COUT_FIXE_PAR_AFFECTATION;
    const totalFraisGenerauxPeriode = totalAffectations * COUT_FIXE_PAR_AFFECTATION;
    
    console.log('📊 Période analysée:', { dateDebut, dateFin, nombreDemiJourneesPeriode });
    console.log('💰 SYSTÈME SIMPLE: 254,29 € FIXE par affectation');
    console.log('👥 Total affectations:', totalAffectations);
    console.log('💼 Coût par affectation:', fraisGenerauxParPersonne, '€ (FIXE)');
    console.log('💡 Calcul total:', totalAffectations, '× 254,29 € =', totalFraisGenerauxPeriode.toFixed(2), '€');
    console.log('✅ Calcul simple terminé');
    
    return {
      fraisGenerauxParPersonne,
      totalFraisGenerauxPeriode,
      totalAffectations,
      detailsPeriode: { dateDebut, dateFin, nombreDemiJourneesPeriode },
      fraisGenerauxParDemiJournee: COUT_FIXE_PAR_AFFECTATION, // Nouveau calcul simple
      baseFixes: totalFraisGenerauxPeriode // Total calculé
    };
  };

  /**
   * Déterminer la période d'analyse (du premier au dernier jour d'affectation)
   */
  const determinerPeriode = (affectationsData) => {
    const toutesAffectations = Object.values(affectationsData).flat();
    if (toutesAffectations.length === 0) {
      const aujourd = new Date();
      return { dateDebut: aujourd, dateFin: aujourd };
    }
    
    const dates = toutesAffectations.map(a => new Date(a.dateAffectation));
    return {
      dateDebut: new Date(Math.min(...dates)),
      dateFin: new Date(Math.max(...dates))
    };
  };

  /**
   * Calculer le nombre de demi-journées ouvrées dans une période
   */
  const calculerNombreDemiJournees = (dateDebut, dateFin) => {
    const joursOuvres = calculerJoursOuvres(dateDebut, dateFin);
    return joursOuvres * 2; // 2 demi-journées par jour
  };

  /**
   * Calculer le nombre de jours ouvrés (Lundi-Vendredi uniquement)
   */
  const calculerJoursOuvres = (dateDebut, dateFin) => {
    let joursOuvres = 0;
    const dateActuelle = new Date(dateDebut);
    
    while (dateActuelle <= dateFin) {
      const jourSemaine = dateActuelle.getDay(); // 0=Dimanche, 1=Lundi, ..., 6=Samedi
      if (jourSemaine >= 1 && jourSemaine <= 5) { // Lundi à Vendredi
        joursOuvres++;
      }
      dateActuelle.setDate(dateActuelle.getDate() + 1);
    }
    
    return joursOuvres;
  };

  /**
   * Compter le nombre total d'affectations personne-demi-journée
   */
  const compterAffectationsPersonneDemiJournee = (affectationsData) => {
    return Object.values(affectationsData).reduce((total, affectations) => {
      return total + affectations.length; // Chaque affectation = 1 personne-demi-journée
    }, 0);
  };

  // Récupérer les frais généraux actifs
  useEffect(() => {
    const fetchFraisGeneraux = async () => {
      try {
        setLoadingFraisGeneraux(true);
        const data = await fraisGenerauxService.getAll(false);
        setFraisGeneraux(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des frais généraux:', error);
      } finally {
        setLoadingFraisGeneraux(false);
      }
    };

    fetchFraisGeneraux();
  }, []);

  // 📊 NOUVEAU : Fonction pour récupérer les frais généraux de la semaine
  const fetchFraisGenerauxSemaine = async () => {
    if (!weekDays || weekDays.length === 0) {
      console.log('📊 Pas de jours de semaine disponibles pour récupérer les frais généraux');
      return;
    }

    setLoadingFraisGenerauxSemaine(true);
    
    try {
      // Utiliser le premier jour de la semaine comme date de référence
      const dateRef = weekDays[0];
      console.log(`📊 Récupération des frais généraux pour la semaine du ${dateRef}... (${new Date().toISOString()})`);
      console.log(`📊 weekDays complets:`, weekDays);
      
      const response = await planningEquipeService.getFraisGenerauxSemaine(dateRef);
      
      setFraisGenerauxSemaine(response);
      console.log('📊 Frais généraux semaine récupérés:', response);
      console.log('📊 Détails par jour reçus:', response?.detailsParJour);
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des frais généraux de la semaine:', error);
      setFraisGenerauxSemaine(null);
    } finally {
      setLoadingFraisGenerauxSemaine(false);
    }
  };

  // Récupérer l'historique des affectations pour chaque ouvrier sur chaque affaire
  // 🚀 NOUVELLE LOGIQUE SIMPLIFIÉE : Récupérer directement les totaux par affaire
  const [totauxHistoriquesAffaires, setTotauxHistoriquesAffaires] = useState({});

  const fetchTotauxHistoriquesAffaires = async () => {
    if (!affaires) return;

    const nouveauxTotaux = {};
    console.log('🔄 Début récupération totaux historiques par affaire...');

    try {
      for (const affaire of affaires) {
        try {
          console.log(`📊 Récupération totaux historiques pour affaire ${affaire.numero}...`);
          
          const totaux = await planningEquipeService.getTotauxHistoriquesAffaire(affaire.id);
          nouveauxTotaux[affaire.id] = totaux;
          
          console.log(`✅ Totaux récupérés pour affaire ${affaire.numero}:`, {
            totalAffectations: totaux.totalAffectations,
            totalHeures: totaux.totalHeures,
            nombreOuvriersTotal: totaux.nombreOuvriersTotal
          });
          
        } catch (error) {
          console.error(`❌ Erreur totaux affaire ${affaire.id}:`, error);
          nouveauxTotaux[affaire.id] = null;
        }
      }

      console.log('📊 Tous les totaux historiques récupérés:', nouveauxTotaux);
      setTotauxHistoriquesAffaires(nouveauxTotaux);
      return nouveauxTotaux;
      
    } catch (error) {
      console.error('❌ Erreur globale récupération totaux historiques:', error);
      return {};
    }
  };

  const fetchHistoriquesOuvriers = async () => {
    // Garder la méthode pour compatibilité, mais simplifiée
    if (!planningData || !affaires) return;

    const nouveauxHistoriques = {};
    console.log('🔄 Début récupération historiques ouvriers...');

    try {
      for (const affaire of affaires) {
        const affectationsAffaire = planningData[affaire.id] || [];
        const ouvriersUniques = [...new Set(affectationsAffaire.map(a => a.userId))];
        
        for (const userId of ouvriersUniques) {
          const cle = `${userId}-${affaire.id}`;
          
          try {
            const historique = await planningEquipeService.getHistoriqueOuvrierAffaire(userId, affaire.id);
            nouveauxHistoriques[cle] = historique;
          } catch (error) {
            console.error(`❌ Erreur historique ${userId}-${affaire.id}:`, error);
            nouveauxHistoriques[cle] = null;
          }
        }
      }
      
      setHistoriquesOuvriers(nouveauxHistoriques);
      return nouveauxHistoriques;
    } catch (error) {
      console.error('❌ Erreur globale récupération historiques:', error);
      return {};
    }
  };

  // Récupérer les historiques quand les données changent
  useEffect(() => {
    if (planningData && affaires && affaires.length > 0) {
      console.log('🔄 Déclenchement fetchHistoriquesOuvriers...');
      fetchHistoriquesOuvriers();
    }
  }, [planningData, affaires]);

  // 🚀 NOUVEAU : Récupérer les totaux historiques des affaires
  useEffect(() => {
    if (affaires && affaires.length > 0) {
      console.log('🔄 Déclenchement fetchTotauxHistoriquesAffaires...');
      fetchTotauxHistoriquesAffaires();
    }
  }, [affaires]);

  // 📊 NOUVEAU : Récupérer les frais généraux de la semaine
  useEffect(() => {
    if (weekDays && weekDays.length > 0) {
      console.log('🔄 Déclenchement fetchFraisGenerauxSemaine...');
      fetchFraisGenerauxSemaine();
    }
  }, [weekDays]);

  // 🚀 NOUVEAU : Force la récupération des historiques avant l'affichage
  const [historiquesCharges, setHistoriquesCharges] = useState(false);
  
  useEffect(() => {
    const verifierHistoriques = async () => {
      if (planningData && affaires && affaires.length > 0) {
        console.log('🔄 Vérification état historiques...');
        await fetchHistoriquesOuvriers();
        await fetchTotauxHistoriquesAffaires();
        setHistoriquesCharges(true);
      }
    };
    
    verifierHistoriques();
  }, [planningData, affaires]);

  /**
   * Calculer les coûts de main d'œuvre avec frais généraux
   */
  const calculerCouts = useMemo(() => {
    if (!planningData || !ouvriers || !affaires) {
      return { coutsParAffaire: {}, totaux: {} };
    }

    console.log('🧮 Calcul des coûts de main d\'œuvre avec frais généraux...');

    // Récupérer tous les ouvriers avec leurs taux horaires
    const tousOuvriers = [
      ...(ouvriers.salaries || []),
      ...(ouvriers.sousTraitants || [])
    ];

    // 🚀 NOUVELLE LOGIQUE : Calculer la mutualisation dynamique
    const mutualisationResult = calculerMutualisationDynamique(planningData, fraisGeneraux);
    
    // Calculer les frais généraux par demi-journée (pour comparaison)
    const totalFraisGenerauxMensuel = fraisGeneraux.reduce((sum, fg) => sum + fg.montantHt, 0);
    const JOURS_OUVRES_PAR_MOIS = 20; // 20 jours ouvrés par mois
    const fraisGenerauxParJour = totalFraisGenerauxMensuel / JOURS_OUVRES_PAR_MOIS;
    const fraisGenerauxParDemiJournee = fraisGenerauxParJour / 2;

    const coutsParAffaire = {};
    let totalHeures = 0;
    let totalCoutMainOeuvre = 0;
    let totalVenteMainOeuvre = 0;
    let totalCoutFraisGeneraux = 0;
    let totalPeriodes = 0;

    // Parcourir toutes les affectations
    Object.entries(planningData).forEach(([affaireId, affectations]) => {
      if (!affectations || affectations.length === 0) return;

      const affaire = affaires.find(a => a.id === affaireId);
      if (!affaire) return;

      const coutAffaire = {
        affaire,
        ouvriers: {},
        totalHeures: 0,
        totalCoutMainOeuvre: 0,
        totalVenteMainOeuvre: 0,
        totalCoutFraisGeneraux: 0,
        totalPeriodes: 0,
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
            totalCoutMainOeuvre: 0,
            totalVenteMainOeuvre: 0,
            totalCoutFraisGeneraux: 0,
            totalPeriodes: 0,
            details: []
          };
        }

        // Calculer les heures et coûts pour cette affectation
        const heures = HEURES_PAR_PERIODE[affectation.periode] || 4;
        
        // 🚀 NOUVEAU : Calculer COÛT et VENTE séparément
        const tarifCout = ouvrier.tarifHoraireCout || ouvrier.tarifHoraireBase || 0;
        const tarifVente = ouvrier.tarifHoraireVente || ouvrier.tarifHoraireBase || 0;
        
        const coutMainOeuvreAffectation = heures * tarifCout;
        const venteMainOeuvreAffectation = heures * tarifVente;
        
        // Log informatif sur les tarifs utilisés
        console.log(`👤 ${ouvrier.nom} ${ouvrier.prenom}:`, {
          tarifCout: `${tarifCout}€/h`,
          tarifVente: `${tarifVente}€/h`,
          heures: `${heures}h`,
          coutTotal: `${coutMainOeuvreAffectation}€`,
          venteTotal: `${venteMainOeuvreAffectation}€`
        });
        // 🚀 NOUVELLE LOGIQUE : Utiliser la mutualisation dynamique au lieu du montant fixe
        const coutFraisGenerauxAffectation = mutualisationResult.fraisGenerauxParPersonne;

        // Ajouter aux totaux de l'ouvrier
        coutAffaire.ouvriers[ouvrierKey].totalHeures += heures;
        coutAffaire.ouvriers[ouvrierKey].totalCoutMainOeuvre += coutMainOeuvreAffectation;
        coutAffaire.ouvriers[ouvrierKey].totalVenteMainOeuvre += venteMainOeuvreAffectation;
        coutAffaire.ouvriers[ouvrierKey].totalCoutFraisGeneraux += coutFraisGenerauxAffectation;
        coutAffaire.ouvriers[ouvrierKey].totalPeriodes += 1;
        coutAffaire.ouvriers[ouvrierKey].details.push({
          date: affectation.dateAffectation,
          periode: affectation.periode,
          typeActivite: affectation.typeActivite,
          heures,
          tarifCout,
          tarifVente,
          coutMainOeuvreAffectation,
          venteMainOeuvreAffectation,
          coutFraisGenerauxAffectation
        });

        // Ajouter aux totaux de l'affaire
        coutAffaire.totalHeures += heures;
        coutAffaire.totalCoutMainOeuvre += coutMainOeuvreAffectation;
        coutAffaire.totalVenteMainOeuvre += venteMainOeuvreAffectation;
        coutAffaire.totalCoutFraisGeneraux += coutFraisGenerauxAffectation;
        coutAffaire.totalPeriodes += 1;
      });

      // Ajouter les totaux pour cette affaire
      coutAffaire.totalCoutTotal = coutAffaire.totalCoutMainOeuvre + coutAffaire.totalCoutFraisGeneraux;
      coutAffaire.totalVenteTotal = coutAffaire.totalVenteMainOeuvre + coutAffaire.totalCoutFraisGeneraux;

      // Convertir les ouvriers en tableau et trier par nom
      coutAffaire.details = Object.values(coutAffaire.ouvriers).sort((a, b) => 
        `${a.ouvrier.nom} ${a.ouvrier.prenom}`.localeCompare(`${b.ouvrier.nom} ${b.ouvrier.prenom}`)
      );

      coutsParAffaire[affaireId] = coutAffaire;
      totalHeures += coutAffaire.totalHeures;
      totalCoutMainOeuvre += coutAffaire.totalCoutMainOeuvre;
      totalVenteMainOeuvre += coutAffaire.totalVenteMainOeuvre;
      totalCoutFraisGeneraux += coutAffaire.totalCoutFraisGeneraux;
      totalPeriodes += coutAffaire.totalPeriodes;
    });

    // 🚀 NOUVEAU : Calculer les tarifs moyens vente et coût
    const tarifsVenteMoyens = [];
    const tarifsCoutMoyens = [];
    let totalHeuresVente = 0;
    let totalHeuresCout = 0;
    
    Object.values(coutsParAffaire).forEach(affaire => {
      Object.values(affaire.ouvriers).forEach(ouvrierDetail => {
        const ouvrier = ouvrierDetail.ouvrier;
        const heures = ouvrierDetail.totalHeures;
        
        if (ouvrier.tarifHoraireVente > 0) {
          tarifsVenteMoyens.push({ tarif: ouvrier.tarifHoraireVente, heures });
          totalHeuresVente += heures;
        }
        if (ouvrier.tarifHoraireCout > 0) {
          tarifsCoutMoyens.push({ tarif: ouvrier.tarifHoraireCout, heures });
          totalHeuresCout += heures;
        }
      });
    });
    
    // Calcul des moyennes pondérées
    const tarifVenteMoyenPondere = totalHeuresVente > 0 ? 
      tarifsVenteMoyens.reduce((sum, t) => sum + (t.tarif * t.heures), 0) / totalHeuresVente : 0;
    const tarifCoutMoyenPondere = totalHeuresCout > 0 ? 
      tarifsCoutMoyens.reduce((sum, t) => sum + (t.tarif * t.heures), 0) / totalHeuresCout : 0;

    const totaux = {
      nombreAffaires: Object.keys(coutsParAffaire).length,
      totalHeures,
      totalCoutMainOeuvre,
      totalVenteMainOeuvre,
      totalCoutFraisGeneraux,
      totalCoutTotal: totalCoutMainOeuvre + totalCoutFraisGeneraux,
      totalVenteTotal: totalVenteMainOeuvre + totalCoutFraisGeneraux,
      totalPeriodes,
      fraisGenerauxParJour,
      fraisGenerauxParDemiJournee,
      coutMoyenHeure: totalHeures > 0 ? totalCoutMainOeuvre / totalHeures : 0,
      venteMoyenneHeure: totalHeures > 0 ? totalVenteMainOeuvre / totalHeures : 0,
      coutMoyenAffaire: Object.keys(coutsParAffaire).length > 0 ? (totalCoutMainOeuvre + totalCoutFraisGeneraux) / Object.keys(coutsParAffaire).length : 0,
      venteMoyenneAffaire: Object.keys(coutsParAffaire).length > 0 ? (totalVenteMainOeuvre + totalCoutFraisGeneraux) / Object.keys(coutsParAffaire).length : 0,
      // 🚀 NOUVEAU : Tarifs moyens vente et coût
      tarifVenteMoyenPondere,
      tarifCoutMoyenPondere,
      // 🚀 AJOUT : Informations de mutualisation dynamique
      mutualisation: mutualisationResult
    };

    console.log('✅ Coûts calculés avec frais généraux:', { coutsParAffaire, totaux });

    return { coutsParAffaire, totaux };
  }, [planningData, ouvriers, affaires, fraisGeneraux]);

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
        return 'bg-blue-500 text-white px-2 py-1 rounded text-xs';
      case 'POSE':
        return 'bg-green-500 text-white px-2 py-1 rounded text-xs';
      default:
        return 'bg-gray-500 text-white px-2 py-1 rounded text-xs';
    }
  };

  if (loading || loadingFraisGeneraux) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🧮</span>
          <h3 className="text-xl font-semibold">Coûts de Main d'Œuvre avec Frais Généraux</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Calcul des coûts en cours...</span>
        </div>
      </div>
    );
  }

  const affairesAvecCouts = Object.values(coutsCalcules).sort((a, b) => 
    a.affaire.numero.localeCompare(b.affaire.numero)
  );

  return (
    <div className={`bg-white rounded-3xl shadow-lg border border-gray-200 p-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧮</span>
          <h3 className="text-2xl font-semibold text-gray-900">Coûts de Main d'Œuvre avec Frais Généraux - Semaine</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-all duration-300"
        >
          {expanded ? 'Réduire' : 'Développer'}
        </button>
      </div>
      
      {/* Résumé global - COÛT vs VENTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 text-gray-600 mb-3">
            <span className="text-xl">💰</span>
            <span className="font-medium">Coût M.O.</span>
          </div>
          <div className="text-3xl font-light text-gray-900">{formatEuros(totaux.totalCoutMainOeuvre)}</div>
          <div className="text-sm text-gray-500 mt-2">Interne / Semaine</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 text-gray-600 mb-3">
            <span className="text-xl">💸</span>
            <span className="font-medium">Vente M.O.</span>
          </div>
          <div className="text-3xl font-light text-green-600">{formatEuros(totaux.totalVenteMainOeuvre)}</div>
          <div className="text-sm text-gray-500 mt-2">Facturation / Semaine</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 text-gray-600 mb-3">
            <span className="text-xl">🏢</span>
            <span className="font-medium">Frais généraux</span>
          </div>
          <div className="text-3xl font-light text-gray-900">{formatEuros(totaux.totalCoutFraisGeneraux)}</div>
          <div className="text-sm text-gray-500 mt-2">/ Semaine</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 text-gray-600 mb-3">
            <span className="text-xl">💼</span>
            <span className="font-medium">Total Vente</span>
          </div>
          <div className="text-3xl font-light text-green-600">{formatEuros(totaux.totalVenteTotal)}</div>
          <div className="text-sm text-gray-500 mt-2">Client / Semaine</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 text-gray-600 mb-3">
            <span className="text-xl">⏱️</span>
            <span className="font-medium">Heures</span>
          </div>
          <div className="text-3xl font-light text-gray-900">{formatHeures(totaux.totalHeures)}</div>
          <div className="text-sm text-gray-500 mt-2">/ Semaine</div>
        </div>
      </div>

      {/* Informations frais généraux - NOUVELLE LOGIQUE DE MUTUALISATION */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 mb-8 shadow-lg">
        <h4 className="font-semibold text-gray-900 mb-6 flex items-center gap-3 text-xl">
          <span className="text-2xl">🚀</span>
          Mutualisation Dynamique des Frais Généraux
        </h4>
        
        {/* Stats de mutualisation */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
           <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all duration-300">
             <div className="text-sm text-gray-600 mb-3 font-medium">🎯 Base fixe semaine</div>
             <div className="font-light text-2xl text-gray-900">
               {formatEuros(totaux.mutualisation?.baseFixes || 0)}
             </div>
           </div>
           <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all duration-300">
             <div className="text-sm text-gray-600 mb-3 font-medium">👥 Total affectations / Semaine</div>
             <div className="font-light text-2xl text-gray-900">
               {totaux.mutualisation?.totalAffectations || 0} affectations
             </div>
           </div>
           <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all duration-300">
                           <div className="text-sm text-gray-600 mb-3 font-medium">📊 Calcul mutualisation / Semaine</div>
              <div className="font-light text-lg text-gray-900">
                {formatEuros(totaux.mutualisation?.baseFixes || 0)} ÷ {totaux.mutualisation?.totalAffectations || 0} affectations
              </div>
           </div>
           <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all duration-300">
             <div className="text-sm text-gray-600 mb-3 font-medium">💰 Coût par affectation / Semaine</div>
             <div className="font-light text-2xl text-green-600">
               {formatEuros(totaux.mutualisation?.fraisGenerauxParPersonne || 0)}
             </div>
           </div>
         </div>

        {/* Comparaison ancien vs nouveau */}
                 <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
           <div className="text-base text-gray-800 mb-4 font-medium">📊 Logique de Mutualisation :</div>
           <div className="text-sm space-y-4">
             <div className="flex items-center justify-between">
               <span className="text-gray-700 font-medium">🎯 Base fixe semaine :</span>
               <span className="font-light text-gray-900 text-lg">{formatEuros(totaux.mutualisation?.baseFixes || 0)}</span>
             </div>
                           <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">👥 Nombre d'affectations / Semaine :</span>
                <span className="font-light text-gray-900 text-lg">{totaux.mutualisation?.totalAffectations || 0} affectations</span>
              </div>
                           <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="text-gray-700 font-medium">💰 Coût par affectation / Semaine :</span>
                <span className="font-light text-green-600 text-lg">{formatEuros(totaux.mutualisation?.fraisGenerauxParPersonne || 0)}</span>
              </div>
              <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-xl">
                💡 Plus il y a d'affectations dans la semaine, moins chaque affectation coûte !
              </div>
           </div>
         </div>

        {/* 📊 NOUVEAU : Frais Généraux Restants à Absorber */}
        {fraisGenerauxSemaine && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200 mt-6">
            <div className="text-base text-orange-800 mb-4 font-medium flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              Frais Généraux Restants à Absorber - Semaine {fraisGenerauxSemaine.semaine} ({fraisGenerauxSemaine.annee})
              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">254,29€ fixe par demi-journée</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white p-4 rounded-xl border border-orange-200">
                <div className="text-sm text-orange-700 font-medium mb-2">💰 Total Semaine</div>
                <div className="text-2xl font-bold text-orange-900">{formatEuros(fraisGenerauxSemaine.fraisGenerauxTotalSemaine)}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-green-200">
                <div className="text-sm text-green-700 font-medium mb-2">✅ Absorbés</div>
                <div className="text-2xl font-bold text-green-600">{formatEuros(fraisGenerauxSemaine.fraisGenerauxAbsorbes)}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-red-200">
                <div className="text-sm text-red-700 font-medium mb-2">❌ Restants</div>
                <div className="text-2xl font-bold text-red-600">{formatEuros(fraisGenerauxSemaine.fraisGenerauxRestants)}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-200">
                <div className="text-sm text-blue-700 font-medium mb-2">📊 Taux</div>
                <div className="text-2xl font-bold text-blue-600">{fraisGenerauxSemaine.tauxAbsorption.toFixed(1)}%</div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-orange-200">
              <div className="text-sm text-orange-800 font-medium mb-2">📅 Détails par Jour</div>
              <div className="grid grid-cols-5 gap-2 text-xs mb-3">
                {fraisGenerauxSemaine.detailsParJour.map((jour) => (
                  <div key={jour.jour} className={`p-2 rounded-lg border ${
                    jour.affectationsDuJour > 0 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="font-medium">{new Date(jour.jour).toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                    <div className="text-xs text-gray-600">{jour.affectationsDuJour} demi-journées</div>
                    <div className={`text-xs font-bold ${
                      jour.affectationsDuJour > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {jour.affectationsDuJour > 0 ? '✅' : '❌'} {formatEuros(jour.affectationsDuJour > 0 ? jour.fraisGenerauxAbsorbesJour : jour.fraisGenerauxRestantsJour)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-orange-700 bg-orange-50 p-2 rounded-lg">
                💡 <strong>Logique SIMPLE :</strong> 1 affectation = 1 demi-journée = 254,29€ FIXE. 
                2 demi-journées/jour = 2 × 254,29€ = 508,58€. Calcul direct sans mutualisation.
              </div>
            </div>
          </div>
        )}

        {/* 📊 NOUVEAU : État de chargement des frais généraux */}
        {loadingFraisGenerauxSemaine && (
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-blue-800 font-medium">Chargement des frais généraux de la semaine...</p>
                <p className="text-blue-600 text-sm">Calcul des montants restants à absorber...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Détails par affaire */}
      {expanded && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 mb-3">
            📋 Détails par Affaire ({affairesAvecCouts.length} affaires)
          </h4>
          
          {affairesAvecCouts.map((affaire) => (
            <div key={affaire.affaire.id} className="border border-gray-200 rounded-3xl p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Header de l'affaire */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📁</span>
                  <h5 className="font-semibold text-gray-900 text-lg">
                    {affaire.affaire.numero} - {affaire.affaire.libelle}
                  </h5>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
                  {formatHeures(affaire.totalHeures)} | {formatEuros(affaire.totalCoutTotal)} / Semaine
                </div>
              </div>

              {/* Coûts et ventes de l'affaire - SEMAINE */}
              <div className="mb-4">
                <h6 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="text-blue-600">📅</span>
                  Coûts Hebdomadaires
                </h6>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="bg-blue-50 p-4 rounded-2xl hover:bg-blue-100 transition-all duration-300 border border-blue-200">
                    <span className="text-blue-700 font-medium">💰 M.O. Coût / Semaine :</span>
                    <span className="font-light ml-2 text-blue-900 text-lg">{formatEuros(affaire.totalCoutMainOeuvre)}</span>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl hover:bg-blue-100 transition-all duration-300 border border-blue-200">
                    <span className="text-blue-700 font-medium">💸 M.O. Vente / Semaine :</span>
                    <span className="font-light ml-2 text-green-600 text-lg">{formatEuros(affaire.totalVenteMainOeuvre)}</span>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl hover:bg-blue-100 transition-all duration-300 border border-blue-200">
                    <span className="text-blue-700 font-medium">🏢 Frais gén. / Semaine :</span>
                    <span className="font-light ml-2 text-blue-900 text-lg">{formatEuros(affaire.totalCoutFraisGeneraux)}</span>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl hover:bg-blue-100 transition-all duration-300 border border-blue-200">
                    <span className="text-blue-700 font-medium">💼 Total Vente / Semaine :</span>
                    <span className="font-light ml-2 text-green-600 text-lg">{formatEuros(affaire.totalVenteTotal)}</span>
                  </div>
                </div>
              </div>

              {/* NOUVEAU : Total RÉEL accumulé pour l'affaire */}
              {(() => {
                // 🚀 NOUVELLE LOGIQUE SIMPLIFIÉE : Utiliser les totaux historiques de la nouvelle API
                const totauxAffaire = totauxHistoriquesAffaires[affaire.affaire.id];
                
                console.log(`🔍 Totaux historiques pour affaire ${affaire.affaire.numero}:`, {
                  affaireId: affaire.affaire.id,
                  totauxDisponibles: !!totauxAffaire,
                  totaux: totauxAffaire
                });
                
                // 🔄 Si les données historiques ne sont pas encore disponibles, afficher un indicateur de chargement
                if (!totauxAffaire) {
                  return (
                    <div className="mb-6">
                      <h6 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-blue-600 animate-spin">⏳</span>
                        Récupération Totaux Historiques en cours...
                      </h6>
                      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <div>
                            <p className="text-blue-800 font-medium">Chargement des totaux historiques...</p>
                            <p className="text-blue-600 text-sm">Récupération depuis toutes les semaines...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // ✅ Utiliser directement les totaux calculés par le backend
                const totalAffectationsAffaire = totauxAffaire.totalAffectations;
                const totalHeuresAffaire = totauxAffaire.totalHeures;
                const totalCoutMainOeuvreAffaire = totauxAffaire.totalCoutMainOeuvre;
                const totalVenteMainOeuvreAffaire = totauxAffaire.totalVenteMainOeuvre;
                const totalFraisGenerauxAffaire = totauxAffaire.totalFraisGeneraux;
                const nombreOuvriersTotal = totauxAffaire.nombreOuvriersTotal;
                
                return (
                  <div className="mb-6">
                    <h6 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="text-purple-600">📊</span>
                      Total RÉEL Accumulé pour l'Affaire
                    </h6>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                      <div className="bg-purple-50 p-4 rounded-2xl hover:bg-purple-100 transition-all duration-300 border border-purple-200">
                        <span className="text-purple-700 font-medium">👥 Total Affectations :</span>
                        <span className="font-bold ml-2 text-purple-900 text-lg">{totalAffectationsAffaire}</span>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-2xl hover:bg-purple-100 transition-all duration-300 border border-purple-200">
                        <span className="text-purple-700 font-medium">⏱️ Total Heures :</span>
                        <span className="font-bold ml-2 text-purple-900 text-lg">{formatHeures(totalHeuresAffaire)}</span>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-2xl hover:bg-purple-100 transition-all duration-300 border border-purple-200">
                        <span className="text-purple-700 font-medium">💰 M.O. Coût TOTAL :</span>
                        <span className="font-bold ml-2 text-purple-900 text-lg">{formatEuros(totalCoutMainOeuvreAffaire)}</span>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-2xl hover:bg-purple-100 transition-all duration-300 border border-purple-200">
                        <span className="text-purple-700 font-medium">🏢 Frais Gén. TOTAL :</span>
                        <span className="font-bold ml-2 text-purple-900 text-lg">{formatEuros(totalFraisGenerauxAffaire)}</span>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-2xl hover:bg-purple-100 transition-all duration-300 border border-purple-200">
                        <span className="text-purple-700 font-medium">💼 Vente TOTALE :</span>
                        <span className="font-bold ml-2 text-green-600 text-xl">{formatEuros(totalVenteMainOeuvreAffaire)}</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-600 bg-purple-50 p-3 rounded-xl border border-purple-200">
                      <span className="font-medium">📊 Info :</span> Totaux accumulés depuis le début de l'affaire 
                      <span className="font-bold text-green-600">
                        (✅ Données historiques complètes - {nombreOuvriersTotal} ouvriers TOTAL analysés)
                      </span>
                      <br />
                      <span className="text-purple-600 font-medium">
                        🔄 Ces totaux restent identiques quelle que soit la semaine affichée
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Détails par ouvrier - NOUVELLE MISE EN PAGE AMÉLIORÉE */}
              <div className="space-y-3">
                {affaire.details.map((ouvrierDetail) => (
                  <div key={ouvrierDetail.ouvrier.id} className="bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm">
                    
                    {/* Header ouvrier avec couleur et informations principales */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div 
                          className="px-5 py-3 rounded-full font-bold text-white text-lg shadow-lg"
                          style={{
                            backgroundColor: ouvrierDetail.ouvrier.couleurPlanning || '#9CA3AF',
                            color: '#ffffff'
                          }}
                        >
                          {ouvrierDetail.ouvrier.prenom || ouvrierDetail.ouvrier.nom}
                        </div>
                        <div>
                          <div className="text-gray-600 text-base font-medium">
                            {ouvrierDetail.ouvrier.nom} {ouvrierDetail.ouvrier.prenom}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {ouvrierDetail.totalPeriodes} affectation(s) • {formatHeures(ouvrierDetail.totalHeures)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {formatEuros(ouvrierDetail.totalCoutMainOeuvre + ouvrierDetail.totalCoutFraisGeneraux)}
                        </div>
                        <div className="text-sm text-gray-500">Coût total / Semaine</div>
                      </div>
                    </div>

                    {/* Détails des affectations avec TYPE clairement visible */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">📅 Affectations :</div>
                      <div className="flex flex-wrap gap-2">
                        {ouvrierDetail.details.map((detail, index) => {
                          // Compter le nombre de chaque type
                          const typeCounts = ouvrierDetail.details.reduce((acc, d) => {
                            acc[d.typeActivite] = (acc[d.typeActivite] || 0) + 1;
                            return acc;
                          }, {});
                          
                          // Afficher un badge par type unique
                          return index === ouvrierDetail.details.findIndex(d => d.typeActivite === detail.typeActivite) ? (
                            <div key={detail.typeActivite} className="flex items-center gap-2">
                              <span className={`px-3 py-2 rounded-lg font-bold text-sm shadow-sm ${
                                detail.typeActivite === 'POSE' 
                                  ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                                  : 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                              }`}>
                                {detail.typeActivite === 'POSE' ? '🏗️ POSE' : '🔨 FABRICATION'}
                              </span>
                              <span className="text-base font-semibold text-gray-700">
                                {typeCounts[detail.typeActivite]} période(s)
                              </span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                    
                                         {/* Informations financières compactes et lisibles */}
                     {/* LIGNE 1 : Données de la SEMAINE */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                       <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                         <div className="text-orange-700 font-semibold text-sm">💰 M.O. Coût / Semaine</div>
                         <div className="text-orange-900 font-bold text-base">{formatEuros(ouvrierDetail.totalCoutMainOeuvre)}</div>
                       </div>
                       <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                         <div className="text-green-700 font-semibold text-sm">💸 M.O. Vente / Semaine</div>
                         <div className="text-green-900 font-bold text-base">{formatEuros(ouvrierDetail.totalVenteMainOeuvre)}</div>
                       </div>
                       <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                         <div className="text-purple-700 font-semibold text-sm">🏢 Frais Gén. / Semaine</div>
                         <div className="text-purple-900 font-bold text-base">{formatEuros(ouvrierDetail.totalCoutFraisGeneraux)}</div>
                       </div>
                       <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                         <div className="text-blue-700 font-semibold text-sm">📊 Mutualisation / Semaine</div>
                         <div className="text-blue-900 font-bold text-base">
                           {formatEuros(totaux.mutualisation?.fraisGenerauxParPersonne || 0)} × {ouvrierDetail.totalPeriodes}
                         </div>
                       </div>
                     </div>

                     {/* LIGNE 2 : TOTALITÉ DE L'AFFAIRE - VRAIES DONNÉES HISTORIQUES */}
                     {(() => {
                       // Récupérer les données historiques réelles pour cet ouvrier sur cette affaire
                       const cle = `${ouvrierDetail.ouvrier.id}-${affaire.affaire.id}`;
                       const historique = historiquesOuvriers[cle];
                       
                       // Si on n'a pas encore les données historiques, afficher un placeholder
                       if (!historique) {
                         return (
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-gray-200 pt-3">
                             <div className="bg-gray-100 p-3 rounded-lg border-2 border-gray-300 animate-pulse">
                               <div className="text-gray-600 font-bold text-sm">💰 M.O. Coût TOTAL Affaire</div>
                               <div className="text-gray-700 font-bold text-lg">Chargement...</div>
                               <div className="text-gray-500 text-xs">Récupération historique</div>
                             </div>
                             <div className="bg-gray-100 p-3 rounded-lg border-2 border-gray-300 animate-pulse">
                               <div className="text-gray-600 font-bold text-sm">💸 M.O. Vente TOTALE Affaire</div>
                               <div className="text-gray-700 font-bold text-lg">Chargement...</div>
                               <div className="text-gray-500 text-xs">Récupération historique</div>
                             </div>
                             <div className="bg-gray-100 p-3 rounded-lg border-2 border-gray-300 animate-pulse">
                               <div className="text-gray-600 font-bold text-sm">🏢 Frais Gén. TOTAL Affaire</div>
                               <div className="text-gray-700 font-bold text-lg">Chargement...</div>
                               <div className="text-gray-500 text-xs">Récupération historique</div>
                             </div>
                             <div className="bg-gray-100 p-3 rounded-lg border-2 border-gray-300 animate-pulse">
                               <div className="text-gray-600 font-bold text-sm">⏱️ Heures TOTALES Affaire</div>
                               <div className="text-gray-700 font-bold text-lg">Chargement...</div>
                               <div className="text-gray-500 text-xs">Récupération historique</div>
                             </div>
                           </div>
                         );
                       }
                       
                       return (
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-gray-200 pt-3">
                           <div className="bg-orange-100 p-3 rounded-lg border-2 border-orange-300">
                             <div className="text-orange-800 font-bold text-sm">💰 M.O. Coût TOTAL Affaire</div>
                             <div className="text-orange-950 font-bold text-lg">{formatEuros(historique.totalCoutMainOeuvre)}</div>
                             <div className="text-orange-600 text-xs">{historique.totalAffectations} affectations totales</div>
                           </div>
                           <div className="bg-green-100 p-3 rounded-lg border-2 border-green-300">
                             <div className="text-green-800 font-bold text-sm">💸 M.O. Vente TOTALE Affaire</div>
                             <div className="text-green-950 font-bold text-lg">{formatEuros(historique.totalVenteMainOeuvre)}</div>
                             <div className="text-green-600 text-xs">
                               {historique.semaines.length} semaine(s) travaillée(s)
                             </div>
                           </div>
                           <div className="bg-purple-100 p-3 rounded-lg border-2 border-purple-300">
                             <div className="text-purple-800 font-bold text-sm">🏢 Frais Gén. TOTAL Affaire</div>
                             <div className="text-purple-950 font-bold text-lg">{formatEuros(historique.totalFraisGeneraux)}</div>
                             <div className="text-purple-600 text-xs">Frais généraux absorbés</div>
                           </div>
                           <div className="bg-blue-100 p-3 rounded-lg border-2 border-blue-300">
                             <div className="text-blue-800 font-bold text-sm">⏱️ Heures TOTALES Affaire</div>
                             <div className="text-blue-950 font-bold text-lg">{formatHeures(historique.totalHeures)}</div>
                             <div className="text-blue-600 text-xs">
                               Du {historique.premiereAffectation ? new Date(historique.premiereAffectation).toLocaleDateString('fr-FR') : 'N/A'} au {historique.derniereAffectation ? new Date(historique.derniereAffectation).toLocaleDateString('fr-FR') : 'N/A'}
                             </div>
                           </div>
                         </div>
                       );
                     })()}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Résumé final */}
      <div className="mt-8 p-8 bg-white rounded-3xl border border-gray-200 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">✅</span>
          <h4 className="font-semibold text-gray-900 text-xl">Résumé Final</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div className="bg-gray-50 p-4 rounded-2xl hover:bg-gray-100 transition-all duration-300">
            <span className="text-gray-700 font-medium">Affaires :</span>
            <span className="font-light ml-2 text-gray-900 text-2xl">{totaux.nombreAffaires}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl hover:bg-gray-100 transition-all duration-300">
            <span className="text-gray-700 font-medium">Heures totales / Semaine :</span>
            <span className="font-light ml-2 text-gray-900 text-2xl">{formatHeures(totaux.totalHeures)}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl hover:bg-gray-100 transition-all duration-300">
            <span className="text-gray-700 font-medium">Tarif moyen/heure / Semaine :</span>
            <div className="ml-2 space-y-1">
              {totaux.tarifVenteMoyenPondere > 0 ? (
                <div className="font-light text-green-600">
                  💸 {formatEuros(totaux.tarifVenteMoyenPondere)} <span className="text-xs text-gray-500">(vente)</span>
                </div>
              ) : null}
              {totaux.tarifCoutMoyenPondere > 0 ? (
                <div className="text-sm text-gray-700 font-light">
                  💰 {formatEuros(totaux.tarifCoutMoyenPondere)} <span className="text-xs text-gray-500">(coût)</span>
                </div>
              ) : null}
              {totaux.tarifVenteMoyenPondere === 0 && totaux.tarifCoutMoyenPondere === 0 ? (
                <div className="font-light text-gray-600">
                  {formatEuros(totaux.coutMoyenHeure)} <span className="text-xs text-gray-500">(ancien)</span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl hover:bg-gray-100 transition-all duration-300">
            <span className="text-gray-700 font-medium">Coût moyen/affaire / Semaine :</span>
            <span className="font-light ml-2 text-gray-900 text-2xl">{formatEuros(totaux.coutMoyenAffaire)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoutMainOeuvreSimple; 