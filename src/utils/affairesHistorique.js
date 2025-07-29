import React, { useState, useEffect, useCallback } from 'react';
import planningEquipeService from '../services/planningEquipeService';

/**
 * Calcule les totaux historiques pour une affaire donnée
 * @param {Object} affaire - L'affaire avec ses détails
 * @param {Object} historiquesOuvriers - Cache des historiques d'ouvriers
 * @param {Function} setHistoriquesOuvriers - Fonction pour mettre à jour le cache
 * @returns {Promise<Object>} - Les totaux historiques calculés
 */
export const calculerTotauxHistoriquesAffaire = async (affaire, historiquesOuvriers, setHistoriquesOuvriers) => {
  if (!affaire || !affaire.details || !Array.isArray(affaire.details)) {
    return {
      totalAffectations: 0,
      totalHeures: 0,
      totalCoutMainOeuvre: 0,
      totalVenteMainOeuvre: 0,
      totalFraisGeneraux: 0,
      historiquesDisponibles: false
    };
  }

  let totalAffectations = 0;
  let totalHeures = 0;
  let totalCoutMainOeuvre = 0;
  let totalVenteMainOeuvre = 0;
  let totalFraisGeneraux = 0;
  let historiquesDisponibles = false;

  // Récupérer les données historiques pour chaque ouvrier de cette affaire
  const promisesHistoriques = affaire.details.map(async (ouvrierDetail) => {
    const cle = `${ouvrierDetail.ouvrier.id}-${affaire.affaire.id}`;
    
    // Vérifier si on a déjà les données en cache
    if (historiquesOuvriers && historiquesOuvriers[cle]) {
      return { cle, historique: historiquesOuvriers[cle] };
    }

    // Récupérer les données historiques via l'API
    try {
      const historique = await planningEquipeService.getHistoriqueOuvrierAffaire(
        ouvrierDetail.ouvrier.id,
        affaire.affaire.id
      );
      
      // Mettre à jour le cache si la fonction est fournie
      if (setHistoriquesOuvriers) {
        setHistoriquesOuvriers(prev => ({
          ...prev,
          [cle]: historique
        }));
      }
      
      return { cle, historique };
    } catch (error) {
      console.error(`Erreur lors de la récupération historique pour ${cle}:`, error);
      return { cle, historique: null };
    }
  });

  // Attendre toutes les récupérations d'historiques
  const resultatsHistoriques = await Promise.all(promisesHistoriques);

  // Calculer les totaux
  affaire.details.forEach((ouvrierDetail, index) => {
    const resultat = resultatsHistoriques[index];
    const historique = resultat?.historique;
    
    if (historique) {
      // Utiliser les données historiques complètes
      totalAffectations += historique.totalAffectations;
      totalHeures += historique.totalHeures;
      totalCoutMainOeuvre += historique.totalCoutMainOeuvre;
      totalVenteMainOeuvre += historique.totalVenteMainOeuvre;
      totalFraisGeneraux += historique.totalFraisGeneraux;
      historiquesDisponibles = true;
    } else {
      // Utiliser les données de la semaine courante comme fallback
      totalAffectations += ouvrierDetail.totalPeriodes;
      totalHeures += ouvrierDetail.totalHeures;
      totalCoutMainOeuvre += ouvrierDetail.totalCoutMainOeuvre;
      totalVenteMainOeuvre += ouvrierDetail.totalVenteMainOeuvre;
      totalFraisGeneraux += ouvrierDetail.totalCoutFraisGeneraux;
    }
  });

  return {
    totalAffectations,
    totalHeures,
    totalCoutMainOeuvre,
    totalVenteMainOeuvre,
    totalFraisGeneraux,
    totalCoutTotal: totalCoutMainOeuvre + totalFraisGeneraux,
    totalVenteTotal: totalVenteMainOeuvre + totalFraisGeneraux,
    historiquesDisponibles
  };
};

/**
 * Calcule les totaux historiques pour plusieurs affaires
 * @param {Array} affaires - Liste des affaires
 * @param {Object} historiquesOuvriers - Cache des historiques d'ouvriers
 * @param {Function} setHistoriquesOuvriers - Fonction pour mettre à jour le cache
 * @returns {Promise<Object>} - Les totaux historiques globaux
 */
export const calculerTotauxHistoriquesGlobaux = async (affaires, historiquesOuvriers, setHistoriquesOuvriers) => {
  if (!affaires || !Array.isArray(affaires) || affaires.length === 0) {
    return {
      totalAffectations: 0,
      totalHeures: 0,
      totalCoutMainOeuvre: 0,
      totalVenteMainOeuvre: 0,
      totalFraisGeneraux: 0,
      totalCoutTotal: 0,
      totalVenteTotal: 0,
      nombreAffaires: 0,
      historiquesDisponibles: false
    };
  }

  // Calculer les totaux pour chaque affaire
  const promisesAffaires = affaires.map(affaire => 
    calculerTotauxHistoriquesAffaire(affaire, historiquesOuvriers, setHistoriquesOuvriers)
  );

  const resultatsAffaires = await Promise.all(promisesAffaires);

  // Agréger les totaux
  const totaux = resultatsAffaires.reduce((acc, totauxAffaire) => {
    acc.totalAffectations += totauxAffaire.totalAffectations;
    acc.totalHeures += totauxAffaire.totalHeures;
    acc.totalCoutMainOeuvre += totauxAffaire.totalCoutMainOeuvre;
    acc.totalVenteMainOeuvre += totauxAffaire.totalVenteMainOeuvre;
    acc.totalFraisGeneraux += totauxAffaire.totalFraisGeneraux;
    acc.historiquesDisponibles = acc.historiquesDisponibles || totauxAffaire.historiquesDisponibles;
    return acc;
  }, {
    totalAffectations: 0,
    totalHeures: 0,
    totalCoutMainOeuvre: 0,
    totalVenteMainOeuvre: 0,
    totalFraisGeneraux: 0,
    historiquesDisponibles: false
  });

  return {
    ...totaux,
    totalCoutTotal: totaux.totalCoutMainOeuvre + totaux.totalFraisGeneraux,
    totalVenteTotal: totaux.totalVenteMainOeuvre + totaux.totalFraisGeneraux,
    nombreAffaires: affaires.length,
    coutMoyenAffaire: affaires.length > 0 ? (totaux.totalCoutMainOeuvre + totaux.totalFraisGeneraux) / affaires.length : 0,
    venteMoyenneAffaire: affaires.length > 0 ? (totaux.totalVenteMainOeuvre + totaux.totalFraisGeneraux) / affaires.length : 0
  };
};

/**
 * Hook personnalisé pour gérer les totaux historiques d'affaires
 * @param {Array} affaires - Liste des affaires
 * @returns {Object} - État et fonctions pour gérer les totaux historiques
 */
export const useHistoriquesAffaires = (affaires) => {
  const [historiquesOuvriers, setHistoriquesOuvriers] = useState({});
  const [totauxHistoriques, setTotauxHistoriques] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculerTotaux = useCallback(async () => {
    if (!affaires || affaires.length === 0) {
      setTotauxHistoriques(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const totaux = await calculerTotauxHistoriquesGlobaux(affaires, historiquesOuvriers, setHistoriquesOuvriers);
      setTotauxHistoriques(totaux);
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du calcul des totaux historiques:', err);
    } finally {
      setLoading(false);
    }
  }, [affaires, historiquesOuvriers]);

  useEffect(() => {
    calculerTotaux();
  }, [calculerTotaux]);

  return {
    totauxHistoriques,
    historiquesOuvriers,
    loading,
    error,
    recalculer: calculerTotaux
  };
};

/**
 * Formate un montant en euros
 * @param {number} montant - Montant à formater
 * @returns {string} - Montant formaté en euros
 */
export const formatEuros = (montant) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(montant || 0);
};

/**
 * Formate les heures
 * @param {number} heures - Nombre d'heures
 * @returns {string} - Heures formatées
 */
export const formatHeures = (heures) => {
  if (!heures) return '0h';
  return `${heures}h`;
}; 