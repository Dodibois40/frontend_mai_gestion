/**
 * ⚠️ WARNING: CE FICHIER CONTIENT BEAUCOUP DE CODE NON UTILISÉ
 * 
 * Date: 15/07/2025
 * Statut: À OPTIMISER
 * 
 * Fonctions UTILISÉES (à conserver) :
 * - formatEuros() ✅ (utilisée dans BlocMontant uniquement)
 * 
 * Fonctions NON UTILISÉES (à supprimer) :
 * - calculerRepartitionPersonnes() ❌
 * - calculerEstimationAutomatique() ❌
 * - recalculerAvecPersonnes() ❌
 * - calculerJoursOuvres() ❌
 * - validerEstimation() ❌
 * - formatHeures() ❌
 * - calculerRentabilite() ❌
 * 
 * Action: Déplacer formatEuros() dans un fichier utilitaire commun
 */

// frontend/src/components/affaires/estimation/utils/calculEstimation.js

/**
 * Moteur de Calcul Automatique - Estimation Affaires
 * Calcul intelligent basé sur le montant du devis
 */

/**
 * Calculer la répartition des demi-journées par personne
 */
export const calculerRepartitionPersonnes = (totalDemiJournees, nombrePersonnes) => {
  const demiJourneesParPersonne = Math.round(totalDemiJournees / nombrePersonnes);
  const resteARepartir = totalDemiJournees - (demiJourneesParPersonne * nombrePersonnes);
  
  return {
    demiJourneesParPersonne,
    totalDemiJournees,
    nombrePersonnes,
    resteARepartir, // Si il y a un reste à répartir manuellement
    exemple: `${nombrePersonnes} personne${nombrePersonnes > 1 ? 's' : ''} × ${demiJourneesParPersonne} demi-journées = ${demiJourneesParPersonne * nombrePersonnes} demi-journées${resteARepartir > 0 ? ` (+ ${resteARepartir} à répartir)` : ''}`
  };
};

export const calculerEstimationAutomatique = (montantDevis, nombrePersonnes = 2) => {
  // Pourcentages standards du métier
  const pourcentages = {
    achats: 20,        // 20% fournitures
    mainOeuvre: 35,    // 35% main d'œuvre
    fraisGeneraux: 30, // 30% frais généraux
    marge: 15          // 15% marge
  };
  
  // Calcul des montants par poste
  const montantAchats = montantDevis * (pourcentages.achats / 100);
  const montantMainOeuvre = montantDevis * (pourcentages.mainOeuvre / 100);
  const montantFraisGeneraux = montantDevis * (pourcentages.fraisGeneraux / 100);
  const montantMarge = montantDevis * (pourcentages.marge / 100);
  
  // Paramètres main d'œuvre - CALCUL CORRIGÉ
  const tauxHoraire = 85; // €/heure
  const heuresParDemiJournee = 4; // 4h par demi-journée
  const coutDemiJournee = tauxHoraire * heuresParDemiJournee; // 85€ × 4h = 340€ par demi-journée
  
  // CALCUL CORRECT : montant main d'œuvre ÷ coût d'une demi-journée
  const totalDemiJournees = Math.round(montantMainOeuvre / coutDemiJournee);
  const totalHeures = totalDemiJournees * heuresParDemiJournee; // Recalculer les heures
  
  // Répartition fabrication/pose (60/40)
  const demiJourneesFabrication = Math.round(totalDemiJournees * 0.6);
  const demiJourneesPose = Math.round(totalDemiJournees * 0.4);
  
  // Calcul de la répartition par personne
  const repartitionPersonnes = calculerRepartitionPersonnes(totalDemiJournees, nombrePersonnes);
  
  // Calcul des dates (estimation automatique)
  const dateDebut = new Date();
  // Ajouter 1 jour pour commencer lundi si on est vendredi
  if (dateDebut.getDay() === 5) { // Vendredi
    dateDebut.setDate(dateDebut.getDate() + 3); // Lundi suivant
  } else if (dateDebut.getDay() === 6) { // Samedi
    dateDebut.setDate(dateDebut.getDate() + 2); // Lundi suivant
  } else if (dateDebut.getDay() === 0) { // Dimanche
    dateDebut.setDate(dateDebut.getDate() + 1); // Lundi suivant
  }
  
  const dateFin = new Date(dateDebut);
  dateFin.setDate(dateDebut.getDate() + Math.ceil(totalDemiJournees / (nombrePersonnes * 2))); // Diviser par personnes × 2 créneaux/jour
  
  // Répartition achats par catégories
  const repartitionAchats = {
    bois: montantAchats * 0.6,        // 60% bois
    quincaillerie: montantAchats * 0.25, // 25% quincaillerie
    autres: montantAchats * 0.15      // 15% autres
  };
  
  console.log('🧮 Estimation calculée automatiquement:', {
    montantDevis,
    montantMainOeuvre,
    coutDemiJournee,
    totalDemiJournees,
    nombrePersonnes,
    repartitionPersonnes: repartitionPersonnes.exemple
  });
  
  return {
    // Montants
    montantDevis,
    montantAchats,
    montantMainOeuvre,
    montantFraisGeneraux,
    montantMarge,
    
    // Temps et ressources
    totalDemiJournees,
    totalHeures,
    demiJourneesFabrication,
    demiJourneesPose,
    nombrePersonnes,
    tauxHoraire,
    coutDemiJournee, // 340€ par demi-journée
    
    // Répartition par personne
    demiJourneesParPersonne: repartitionPersonnes.demiJourneesParPersonne,
    repartitionPersonnes,
    
    // Dates
    dateDebut: dateDebut.toISOString().split('T')[0],
    dateFin: dateFin.toISOString().split('T')[0],
    
    // Répartitions
    pourcentages,
    repartitionAchats,
    
    // Métadonnées
    createdAt: new Date().toISOString(),
    version: '1.0'
  };
};

/**
 * Recalculer l'estimation avec un nouveau nombre de personnes
 */
export const recalculerAvecPersonnes = (estimationActuelle, nouveauNombrePersonnes) => {
  // Garder le montant main d'œuvre original
  const montantMainOeuvre = estimationActuelle.montantMainOeuvre;
  const coutDemiJournee = 340; // 85€ × 4h
  const totalDemiJournees = Math.round(montantMainOeuvre / coutDemiJournee);
  
  // Recalculer la répartition
  const repartitionPersonnes = calculerRepartitionPersonnes(totalDemiJournees, nouveauNombrePersonnes);
  
  // Recalculer les dates en fonction du nouveau nombre de personnes
  const dateDebut = new Date(estimationActuelle.dateDebut);
  const dateFin = new Date(dateDebut);
  dateFin.setDate(dateDebut.getDate() + Math.ceil(totalDemiJournees / (nouveauNombrePersonnes * 2)));
  
  console.log('🔄 Recalcul avec nouveau nombre de personnes:', {
    montantMainOeuvre,
    totalDemiJournees,
    ancienNombrePersonnes: estimationActuelle.nombrePersonnes,
    nouveauNombrePersonnes,
    nouvelleDemiJourneesParPersonne: repartitionPersonnes.demiJourneesParPersonne
  });
  
  return {
    ...estimationActuelle,
    nombrePersonnes: nouveauNombrePersonnes,
    demiJourneesParPersonne: repartitionPersonnes.demiJourneesParPersonne,
    repartitionPersonnes,
    dateFin: dateFin.toISOString().split('T')[0],
    totalHeures: totalDemiJournees * 4, // Recalculer les heures
  };
};

/**
 * Calculer les jours ouvrés (Lundi-Vendredi uniquement)
 */
export const calculerJoursOuvres = (dateDebut, totalDemiJournees) => {
  const dates = [];
  let currentDate = new Date(dateDebut);
  let remainingSlots = totalDemiJournees;
  
  while (remainingSlots > 0) {
    // Lundi = 1, Vendredi = 5 (ignorer sam/dim)
    if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
      // Ajouter matin si slots restants
      if (remainingSlots > 0) {
        dates.push({
          date: currentDate.toISOString().split('T')[0],
          creneau: 'matin',
          jourSemaine: currentDate.toLocaleDateString('fr-FR', { weekday: 'long' })
        });
        remainingSlots--;
      }
      
      // Ajouter après-midi si slots restants
      if (remainingSlots > 0) {
        dates.push({
          date: currentDate.toISOString().split('T')[0],
          creneau: 'apres-midi',
          jourSemaine: currentDate.toLocaleDateString('fr-FR', { weekday: 'long' })
        });
        remainingSlots--;
      }
    }
    
    // Passer au jour suivant
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

/**
 * Valider les données d'estimation
 */
export const validerEstimation = (estimation) => {
  const erreurs = [];
  
  if (!estimation.montantDevis || estimation.montantDevis <= 0) {
    erreurs.push('Le montant du devis doit être supérieur à 0');
  }
  
  if (!estimation.dateDebut) {
    erreurs.push('La date de début est obligatoire');
  }
  
  if (!estimation.dateFin) {
    erreurs.push('La date de fin est obligatoire');
  }
  
  if (estimation.dateDebut && estimation.dateFin && 
      new Date(estimation.dateFin) <= new Date(estimation.dateDebut)) {
    erreurs.push('La date de fin doit être postérieure à la date de début');
  }
  
  if (!estimation.nombrePersonnes || estimation.nombrePersonnes < 1) {
    erreurs.push('Il faut au moins 1 personne sur l\'affaire');
  }
  
  return {
    valide: erreurs.length === 0,
    erreurs
  };
};

/**
 * Formater les montants en euros
 */
export const formatEuros = (montant) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(montant || 0);
};

/**
 * Formater les heures
 */
export const formatHeures = (heures) => {
  return `${(heures || 0).toFixed(1)}h`;
};

/**
 * Calculer la rentabilité
 */
export const calculerRentabilite = (estimation) => {
  if (!estimation.montantDevis || estimation.montantDevis <= 0) return 0;
  
  const coutTotal = estimation.montantAchats + estimation.montantMainOeuvre + estimation.montantFraisGeneraux;
  const rentabilite = ((estimation.montantMarge / estimation.montantDevis) * 100);
  
  return {
    rentabilite: rentabilite.toFixed(1),
    coutTotal,
    ratio: estimation.montantDevis > 0 ? (coutTotal / estimation.montantDevis).toFixed(2) : 0
  };
}; 