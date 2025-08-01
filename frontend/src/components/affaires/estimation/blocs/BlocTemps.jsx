import React, { useState, useEffect, useCallback } from 'react';
import { 
  IconCalendar, 
  IconClock, 
  IconCalendarEvent,
  IconUsers,
  IconSettings,
  IconCircleCheck,
  IconChevronLeft,
  IconChevronRight,
  IconAlertTriangle,
  IconX,
  IconCheck
} from '@tabler/icons-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Import supprimé - fonction calculerJoursOuvres remplacée par implémentation locale
import planningEquipeService from '../../../../services/planningEquipeService';
import CalendrierUnifie from './CalendrierUnifie';

/**
 * Bloc Temps - Gestion des dates et durée
 * Calendrier unifié + calcul automatique jours ouvrés
 */
const BlocTemps = ({ estimation = {}, onEstimationChange, affaire, resetTrigger = 0, onAffectationsChange, onDateSurvol }) => {
  // Utiliser les dates de l'estimation (provenant du modal) ou valeurs par défaut
  const [dateDebut, setDateDebut] = useState(estimation.dateCommencement || estimation.dateDebut || '');
  const [dateFin, setDateFin] = useState(estimation.dateReception || estimation.dateFin || '');
  const [joursOuvres, setJoursOuvres] = useState([]);
  const [statsTemps, setStatsTemps] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [affectationsDetectees, setAffectationsDetectees] = useState([]);
  
  // 🔥 NOUVEAU : Flag pour forcer le premier calcul
  const [hasCalculatedOnce, setHasCalculatedOnce] = useState(false);
  
  // 🔧 Déplacer la fonction calculerDureeOuvree ici avec useCallback
  const calculerDureeOuvree = useCallback((customDateDebut = null, customDateFin = null) => {
    const debut = customDateDebut || dateDebut;
    const fin = customDateFin || dateFin;
    
    if (!debut || !fin) return;
    
    console.log('🧮 Calcul des demi-journées entre:', debut, 'et', fin);
    setIsCalculating(true);

    try {
      // Convertir les dates en objets Date
      const dateDebutObj = new Date(debut + 'T00:00:00');
      const dateFinObj = new Date(fin + 'T00:00:00');
      
      // Calculer les jours ouvrés entre deux dates
      const jours = [];
      let currentDate = new Date(dateDebutObj);
      let totalJours = 0;
      
      while (currentDate <= dateFinObj) {
        const dayOfWeek = currentDate.getDay();
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Lundi = 1, Vendredi = 5 (ignorer sam/dim)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          jours.push({
            date: dateStr,
            jour: currentDate.toLocaleDateString('fr-FR', { weekday: 'long' }),
            numero: totalJours + 1,
            creneaux: ['matin', 'après-midi']
          });
          totalJours++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      const totalDemiJournees = totalJours * 2;
      
      setJoursOuvres(jours);
      setStatsTemps({
        joursOuvres: totalJours,
        totalDemiJournees: totalDemiJournees,
        dateDebut: debut,
        dateFin: fin,
        creneauxEstimes: estimation.totalDemiJournees || 0,
        surcharge: false,
        utilisationPourcentage: estimation.totalDemiJournees > 0 ? 100 : 0
      });
      
      // 🔥 IMPORTANT : Propager immédiatement le calcul au parent
      if (onEstimationChange) {
        console.log('📤 Envoi du calcul au parent:', { totalDemiJournees, dateDebut: debut, dateFin: fin });
        
        // 🚀 CALCUL AUTOMATIQUE DE LA RÉPARTITION FINANCIÈRE
        const montantDevis = estimation.montantDevis || 0;
        
        // Calcul automatique des demi-journées d'équipe
        const repartitionFabrication = estimation.repartitionFabrication || 60;
        const repartitionPose = estimation.repartitionPose || 40;
        const demiJourneesFabrication = Math.round((totalDemiJournees * repartitionFabrication) / 100);
        const demiJourneesPose = totalDemiJournees - demiJourneesFabrication;
        
        // 🆕 Calcul initial de la répartition financière si on a un montant de devis
        let updateData = {
          ...estimation,
          dateDebut: debut,
          dateFin: fin,
          totalDemiJournees: totalDemiJournees,
          // 🚀 CALCUL AUTOMATIQUE ÉQUIPE
          demiJourneesFabrication: demiJourneesFabrication,
          demiJourneesPose: demiJourneesPose,
          repartitionFabrication: repartitionFabrication,
          repartitionPose: repartitionPose,
          // 🚀 AJOUT : Dates pour synchronisation avec BlocEquipe
          dateCommencement: debut,
          dateReception: fin
        };
        
        // 🔥 Si on a un montant de devis ET qu'on n'a pas encore de répartition, la calculer
        if (montantDevis > 0) {
          console.log('💰 Calcul initial de la répartition financière');
          
          // Calcul simple avec pourcentages fixes si pas de personnes définies
          const nombrePersonnes = estimation.nombrePersonnes || 0;
          
          if (nombrePersonnes === 0 || !estimation.montantMainOeuvre) {
            // Calcul par défaut avec pourcentages fixes
            const montantAchats = Math.round(montantDevis * 0.2);  // 20%
            const montantFraisGeneraux = Math.round(montantDevis * 0.3);  // 30%
            const montantMainOeuvre = Math.round(montantDevis * 0.35);  // 35%
            const montantMarge = montantDevis - montantAchats - montantFraisGeneraux - montantMainOeuvre;  // Reste = 15%
            
            updateData = {
              ...updateData,
              montantMainOeuvre,
              montantAchats,
              montantFraisGeneraux,
              montantMarge,
              recalculerRepartition: false // Pas de recalcul car c'est le calcul initial
            };
          } else {
            // Calcul basé sur les heures si on a des personnes
            const tauxHoraireCout = estimation.tauxHoraireCout || 25;
            const montantMainOeuvre = nombrePersonnes * totalDemiJournees * tauxHoraireCout * 4;
            
            // Achats par défaut à 20% du devis
            const montantAchats = Math.round(montantDevis * 0.2);
            
            // Calculer le reste après main d'œuvre et achats
            const resteApresMainOeuvreEtAchats = montantDevis - montantMainOeuvre - montantAchats;
            
            let montantFraisGeneraux, montantMarge;
            
            if (resteApresMainOeuvreEtAchats > 0) {
              // Répartition du reste : 60% frais généraux, 40% marge
              montantFraisGeneraux = Math.round(resteApresMainOeuvreEtAchats * 0.6);
              montantMarge = montantDevis - montantMainOeuvre - montantAchats - montantFraisGeneraux;
            } else {
              // Ajuster si le budget est dépassé
              montantFraisGeneraux = 0;
              montantMarge = Math.max(0, montantDevis - montantMainOeuvre - montantAchats);
            }
            
            updateData = {
              ...updateData,
              montantMainOeuvre,
              montantAchats,
              montantFraisGeneraux,
              montantMarge,
              recalculerRepartition: true // Pour forcer le recalcul dans le parent si nécessaire
            };
          }
        }
        
        // Mise à jour complète de l'estimation
        onEstimationChange(updateData);
      }
      
    } catch (error) {
      console.error('Erreur calcul durée:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [dateDebut, dateFin, estimation, onEstimationChange]);
  
  // 🔄 CORRECTION FINALE : Forcer la synchronisation complète avec l'estimation
  useEffect(() => {
    // 🚨 CRITIQUE : Toujours synchroniser avec TOUTES les propriétés de date possibles
    const nouvelleDebut = estimation.dateCommencement || estimation.dateDebut || '';
    const nouvelleFin = estimation.dateReception || estimation.dateFin || '';
    
    console.log('🔄 Synchronisation des dates:', {
      nouvelleDebut,
      nouvelleFin,
      estimation
    });
    
    // 🔄 Si l'estimation est réinitialisée (montant = 0), FORCER la remise à zéro
    if (estimation.montantDevis === 0) {
      setDateDebut('');
      setDateFin('');
      setHasCalculatedOnce(false);
      return;
    }
    
    // 🔄 Mise à jour des états locaux si nécessaire
    if (nouvelleDebut && nouvelleDebut !== dateDebut) {
      console.log('📅 Mise à jour dateDebut:', nouvelleDebut);
      setDateDebut(nouvelleDebut);
    }
    if (nouvelleFin && nouvelleFin !== dateFin) {
      console.log('📅 Mise à jour dateFin:', nouvelleFin);
      setDateFin(nouvelleFin);
    }
    
    // 🔥 NOUVEAU : Forcer le calcul si on a des dates mais pas encore de résultat
    if (nouvelleDebut && nouvelleFin && estimation.totalDemiJournees === 0) {
      console.log('🚨 Forçage du calcul - totalDemiJournees est à 0');
      calculerDureeOuvree(nouvelleDebut, nouvelleFin);
    }
  }, [estimation.dateCommencement, estimation.dateDebut, estimation.dateReception, estimation.dateFin, estimation.montantDevis, resetTrigger, calculerDureeOuvree]);
  
  // 🔄 RESET TRIGGER : Forcer la réinitialisation complète sur trigger externe
  useEffect(() => {
    if (resetTrigger > 0) {
      console.log('🔄 RESET TRIGGER dans BlocTemps - Effacer TOUTES les dates');
      setDateDebut('');
      setDateFin('');
      setJoursOuvres([]);
      setStatsTemps({});
      setAffectationsDetectees([]);
      setHasCalculatedOnce(false); // Reset le flag de calcul
    }
  }, [resetTrigger]);
  
  // Calcul automatique des jours ouvrés
  useEffect(() => {
    // Utiliser les dates de l'estimation si le state local n'est pas encore défini
    const dateDebutEffective = dateDebut || estimation.dateDebut || estimation.dateCommencement;
    const dateFinEffective = dateFin || estimation.dateFin || estimation.dateReception;
    
    console.log('🗓️ Vérification des dates pour calcul:', {
      dateDebut,
      dateFin,
      dateDebutEffective,
      dateFinEffective,
      estimation,
      hasCalculatedOnce
    });
    
    // 🔥 FORCER le calcul si on a des dates et qu'on ne l'a jamais fait
    if (dateDebutEffective && dateFinEffective && (!hasCalculatedOnce || dateDebutEffective !== dateDebut || dateFinEffective !== dateFin)) {
      console.log('🚀 Déclenchement du calcul des demi-journées');
      calculerDureeOuvree(dateDebutEffective, dateFinEffective);
      setHasCalculatedOnce(true);
    }
  }, [dateDebut, dateFin, estimation.totalDemiJournees, estimation.dateDebut, estimation.dateFin, hasCalculatedOnce, calculerDureeOuvree]);
  
  // 🔄 Nouveau gestionnaire de dates du calendrier - SUPPRESSION DES DÉLAIS
  const handleDateRangeChange = (newDateDebut, newDateFin) => {
    
    // Mise à jour immédiate des états locaux
    setDateDebut(newDateDebut);
    setDateFin(newDateFin);
    
    // Propagation immédiate vers le parent
    if (onEstimationChange) {
      onEstimationChange({
        ...estimation,
        dateDebut: newDateDebut,
        dateFin: newDateFin,
        dateCommencement: newDateDebut,
        dateReception: newDateFin
      });
    }
    
    // Calcul immédiat sans délai
    if (newDateDebut && newDateFin) {
      calculerDureeOuvree(newDateDebut, newDateFin);
    }
  };

  const handleDateChange = (type, value) => {
    if (type === 'debut') {
      setDateDebut(value);
      // Auto-calculer la fin si on a une estimation
      if (estimation.totalDemiJournees && value) {
        const debut = new Date(value);
        const joursNecessaires = Math.ceil(estimation.totalDemiJournees / 2);
        const fin = new Date(debut);
        fin.setDate(debut.getDate() + joursNecessaires);
        const dateFinCalculee = fin.toISOString().split('T')[0];
        setDateFin(dateFinCalculee);
        
        // 🔄 Calcul immédiat sans délai
        calculerDureeOuvree(value, dateFinCalculee);
        
        // Propager les changements vers le parent
        if (onEstimationChange) {
          onEstimationChange({
            ...estimation,
            dateCommencement: value,
            dateReception: dateFinCalculee,
            dateDebut: value,
            dateFin: dateFinCalculee
          });
        }
      } else {
        // 🔄 Calcul immédiat sans délai
        if (value && dateFin) {
          calculerDureeOuvree(value, dateFin);
        }
        
        // Propager uniquement la date de début
        if (onEstimationChange) {
          onEstimationChange({
            ...estimation,
            dateCommencement: value,
            dateDebut: value
          });
        }
      }
    } else {
      setDateFin(value);
      
      // 🔄 Calcul immédiat sans délai
      if (dateDebut && value) {
        calculerDureeOuvree(dateDebut, value);
      }
      
      // Propager les changements vers le parent
      if (onEstimationChange) {
        onEstimationChange({
          ...estimation,
          dateReception: value,
          dateFin: value
        });
      }
    }
  };
  
  const hasDates = dateDebut && dateFin;
  
  return (
    <Card className="bloc-temps bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-lg"
          style={{ 
            transition: 'none',
            transform: 'none'
          }}>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
            <IconCalendar className="w-6 h-6 text-white" />
          </div>
          Temps & Planning
        </CardTitle>
        <p className="text-blue-600 text-sm flex items-center gap-2">
          <IconCalendarEvent className="w-4 h-4" />
          Définissez les dates pour synchroniser avec le planning équipe
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Calendrier Unifié */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
          <CalendrierUnifie
            dateDebut={dateDebut}
            dateFin={dateFin}
            onDateRangeChange={handleDateRangeChange}
            affaireId={affaire.id}
            estimation={estimation}
            resetTrigger={resetTrigger}
            onAffectationsChange={onAffectationsChange}
            onDateSurvol={onDateSurvol}
            affaire={affaire}
          />
        </div>
        
        {/* 📊 Statistiques de temps */}
        {hasDates && (
          <div className="bg-blue-100/50 border border-blue-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-blue-800 font-medium">
              <IconClock className="w-5 h-5" />
              Analyse temporelle
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {statsTemps.joursOuvres}
                  </div>
                  <div className="text-sm text-blue-600">Jours ouvrés</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {statsTemps.totalDemiJournees}
                  </div>
                  <div className="text-sm text-blue-600">Créneaux planifiés</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {statsTemps.creneauxEstimes}
                  </div>
                  <div className="text-sm text-blue-600">Créneaux estimés</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    statsTemps.surcharge ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {statsTemps.utilisationPourcentage}%
                  </div>
                  <div className="text-sm text-blue-600">Utilisation</div>
                </div>
              </div>
            </div>
            
            {/* Information sur la planification */}
            {statsTemps.creneauxEstimes > 0 && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-green-800 text-sm">
                ✅ <strong>Planification personnalisée</strong> Vous maîtrisez vos créneaux de travail sur la période.
              </div>
            )}
            
            {/* Détails supplémentaires */}
            <div className="border-t border-blue-200 pt-3 text-sm text-blue-700">
              <div className="flex justify-between">
                <span>Période totale</span>
                <span className="font-medium">{statsTemps.joursTotal} jours</span>
              </div>
              <div className="flex justify-between">
                <span>Weekends exclus</span>
                <span className="font-medium">{statsTemps.weekends} jours</span>
              </div>
              <div className="flex justify-between">
                <span>Mode planning</span>
                <span className="font-medium">
                  {statsTemps.creneauxEstimes > 0 ? 'Créneaux maîtrisés' : 'Période continue'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* 📋 Visualisation des jours ouvrés */}
        {joursOuvres.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-800 font-medium">
              <IconUsers className="w-5 h-5" />
              Jours ouvrés identifiés ({joursOuvres.length} jours)
            </div>
            
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {joursOuvres.slice(0, 15).map((jour, index) => (
                <div 
                  key={index}
                  className="bg-white border border-blue-200 rounded-lg p-3 text-center hover:bg-blue-50 transition-colors"
                >
                  <div className="text-sm font-medium text-blue-900 capitalize">
                    {jour.jour}
                  </div>
                  <div className="text-xs text-blue-600">
                    {new Date(jour.date).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
                  <div className="flex justify-center mt-2 gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {joursOuvres.length > 15 && (
              <div className="text-center">
                <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  +{joursOuvres.length - 15} jour{joursOuvres.length - 15 > 1 ? 's' : ''} supplémentaire{joursOuvres.length - 15 > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* ✅ Confirmation de synchronisation */}
        {hasDates && estimation.totalDemiJournees > 0 && (
          <div className="bg-green-100 border border-green-300 rounded-xl p-4 flex items-center gap-3">
            <IconCircleCheck className="w-6 h-6 text-green-600" />
            <div>
              <div className="font-medium text-green-800">
                Planning synchronisé avec succès
              </div>
              <div className="text-sm text-green-600">
                Les cases du planning équipe seront colorées automatiquement
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlocTemps; 