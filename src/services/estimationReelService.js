import api from './api';

const BASE_URL = '/api/estimation-reel';

// ===== GESTION DES ESTIMATIONS =====

/**
 * Créer une nouvelle estimation
 */
export const createEstimation = async (estimationData) => {
  try {
    const response = await api.post(`${BASE_URL}/estimations`, estimationData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'estimation:', error);
    throw error;
  }
};

/**
 * Récupérer toutes les estimations d'une affaire
 */
export const getEstimationsByAffaire = async (affaireId) => {
  try {
    const response = await api.get(`${BASE_URL}/estimations/affaire/${affaireId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des estimations:', error);
    throw error;
  }
};

/**
 * Récupérer une estimation par son ID
 */
export const getEstimationById = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/estimations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'estimation:', error);
    throw error;
  }
};

/**
 * Mettre à jour une estimation
 */
export const updateEstimation = async (id, estimationData) => {
  try {
    const response = await api.put(`${BASE_URL}/estimations/${id}`, estimationData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'estimation:', error);
    throw error;
  }
};

/**
 * Valider une estimation
 */
export const validerEstimation = async (id, validePar) => {
  try {
    const response = await api.post(`${BASE_URL}/estimations/${id}/valider`, { validePar });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la validation de l\'estimation:', error);
    throw error;
  }
};

/**
 * Supprimer une estimation
 */
export const deleteEstimation = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}/estimations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'estimation:', error);
    throw error;
  }
};

/**
 * Supprimer toutes les estimations d'une affaire
 */
export const deleteEstimationsByAffaire = async (affaireId) => {
  try {
    // Récupérer d'abord toutes les estimations de l'affaire
    const estimations = await getEstimationsByAffaire(affaireId);
    
    // Supprimer chaque estimation
    const deletePromises = estimations.map(estimation => 
      deleteEstimation(estimation.id)
    );
    
    await Promise.all(deletePromises);
    

    return { success: true, deletedCount: estimations.length };
  } catch (error) {
    console.error('Erreur lors de la suppression des estimations de l\'affaire:', error);
    throw error;
  }
};

// ===== GESTION DES COMPARAISONS =====

/**
 * Créer une nouvelle comparaison estimation vs réel
 */
export const createComparaison = async (comparaisonData) => {
  try {
    const response = await api.post(`${BASE_URL}/comparaisons`, comparaisonData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la comparaison:', error);
    throw error;
  }
};

/**
 * Récupérer toutes les comparaisons d'une affaire
 */
export const getComparaisonsByAffaire = async (affaireId) => {
  try {
    const response = await api.get(`${BASE_URL}/comparaisons/affaire/${affaireId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des comparaisons:', error);
    throw error;
  }
};

/**
 * Récupérer une comparaison par son ID
 */
export const getComparaisonById = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/comparaisons/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la comparaison:', error);
    throw error;
  }
};

/**
 * Récupérer les données réelles d'une affaire
 */
export const getDonneesReelles = async (affaireId) => {
  try {
    const response = await api.get(`${BASE_URL}/donnees-reelles/${affaireId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des données réelles:', error);
    throw error;
  }
};

/**
 * Récupérer le résumé des écarts d'une affaire
 */
export const getResumeEcarts = async (affaireId) => {
  try {
    const response = await api.get(`${BASE_URL}/resume-ecarts/${affaireId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du résumé des écarts:', error);
    throw error;
  }
};

// ===== UTILITAIRES =====

/**
 * Calculer l'écart en pourcentage entre deux valeurs
 */
export const calculerEcartPourcentage = (valeurEstimee, valeurReelle) => {
  if (valeurEstimee === 0) {
    return valeurReelle === 0 ? 0 : 100;
  }
  return ((valeurReelle - valeurEstimee) / valeurEstimee) * 100;
};

/**
 * Déterminer le statut d'un écart (ACCEPTABLE, ATTENTION, CRITIQUE)
 */
export const determinerStatutEcart = (ecartPourcentage, seuils = { acceptable: 10, attention: 25 }) => {
  const ecartAbsolu = Math.abs(ecartPourcentage);
  
  if (ecartAbsolu <= seuils.acceptable) {
    return 'ACCEPTABLE';
  } else if (ecartAbsolu <= seuils.attention) {
    return 'ATTENTION';
  } else {
    return 'CRITIQUE';
  }
};

/**
 * Formater un pourcentage avec signe
 */
export const formatPourcentage = (valeur, decimales = 1) => {
  const signe = valeur >= 0 ? '+' : '';
  return `${signe}${valeur.toFixed(decimales)}%`;
};

/**
 * Obtenir la couleur d'un écart basée sur son statut
 */
export const getCouleurEcart = (statut) => {
  switch (statut) {
    case 'ACCEPTABLE':
      return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
    case 'ATTENTION':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
    case 'CRITIQUE':
      return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
  }
};

/**
 * Créer une estimation à partir des données d'une affaire
 */
export const createEstimationFromAffaire = async (affaireId, affaireData) => {
  try {
    // Extraire les données nécessaires depuis l'affaire
    const estimationData = {
      affaireId,
      montantTotalEstime: affaireData.objectifCaHt || 0,
      coutMainOeuvreEstime: (affaireData.objectifHeuresFab + affaireData.objectifHeuresPose) * 85, // Tarif horaire moyen
      coutAchatsEstime: affaireData.objectifAchatHt || 0,
      coutFraisGenerauxEstime: affaireData.objectifFraisGeneraux || 0,
      margeEstimee: (affaireData.objectifCaHt || 0) - (affaireData.objectifAchatHt || 0) - (affaireData.objectifFraisGeneraux || 0),
      demiJourneesFabricationEstimees: Math.ceil((affaireData.objectifHeuresFab || 0) / 4),
      demiJourneesPoseEstimees: Math.ceil((affaireData.objectifHeuresPose || 0) / 4),
      dureeTotaleEstimee: Math.ceil((affaireData.objectifHeuresFab + affaireData.objectifHeuresPose) / 4),
      dateCommencementEstimee: affaireData.dateCommencement,
      dateReceptionEstimee: affaireData.dateCloturePrevue,
      commentaire: 'Estimation automatique générée depuis les objectifs de l\'affaire',
      details: [
        {
          categorie: 'MAIN_OEUVRE',
          sousCategorie: 'FABRICATION',
          libelle: 'Fabrication',
          quantiteEstimee: affaireData.objectifHeuresFab || 0,
          uniteQuantite: 'heures',
          prixUnitaireEstime: 85,
          montantEstime: (affaireData.objectifHeuresFab || 0) * 85,
          ordre: 1
        },
        {
          categorie: 'MAIN_OEUVRE',
          sousCategorie: 'POSE',
          libelle: 'Pose',
          quantiteEstimee: affaireData.objectifHeuresPose || 0,
          uniteQuantite: 'heures',
          prixUnitaireEstime: 85,
          montantEstime: (affaireData.objectifHeuresPose || 0) * 85,
          ordre: 2
        },
        {
          categorie: 'ACHATS',
          libelle: 'Achats matériaux',
          quantiteEstimee: 1,
          uniteQuantite: 'ensemble',
          prixUnitaireEstime: affaireData.objectifAchatHt || 0,
          montantEstime: affaireData.objectifAchatHt || 0,
          ordre: 3
        },
        {
          categorie: 'FRAIS_GENERAUX',
          libelle: 'Frais généraux',
          quantiteEstimee: Math.ceil((affaireData.objectifHeuresFab + affaireData.objectifHeuresPose) / 4),
          uniteQuantite: 'demi-journées',
          prixUnitaireEstime: 508.58,
          montantEstime: affaireData.objectifFraisGeneraux || 0,
          ordre: 4
        }
      ]
    };

    return await createEstimation(estimationData);
  } catch (error) {
    console.error('Erreur lors de la création de l\'estimation depuis l\'affaire:', error);
    throw error;
  }
};

/**
 * Synchroniser une affaire (créer une comparaison avec les données actuelles)
 */
export const synchroniserAffaire = async (affaireId, estimationId) => {
  try {
    const comparaisonData = {
      affaireId,
      estimationId,
      typeComparaison: 'SNAPSHOT',
      commentaire: 'Synchronisation manuelle'
    };

    return await createComparaison(comparaisonData);
  } catch (error) {
    console.error('Erreur lors de la synchronisation de l\'affaire:', error);
    throw error;
  }
};

/**
 * Exporter les données de comparaison au format CSV
 */
export const exporterComparaisonsCSV = (comparaisons) => {
  const headers = [
    'Date',
    'Type',
    'Statut',
    'Écart Montant (%)',
    'Écart Durée (%)',
    'Écart Main Œuvre (%)',
    'Écart Achats (%)',
    'Écart Frais Généraux (%)',
    'Écart Marge (%)',
    'Montant Estimé',
    'Montant Réel',
    'Durée Estimée',
    'Durée Réelle'
  ];

  const rows = comparaisons.map(comp => [
    new Date(comp.dateComparaison).toLocaleDateString('fr-FR'),
    comp.typeComparaison,
    comp.statut,
    comp.ecartMontantPourcentage.toFixed(1),
    comp.ecartDureePourcentage.toFixed(1),
    comp.ecartMainOeuvrePourcentage.toFixed(1),
    comp.ecartAchatsPourcentage.toFixed(1),
    comp.ecartFraisGenerauxPourcentage.toFixed(1),
    comp.ecartMargePourcentage.toFixed(1),
    comp.estimation?.montantTotalEstime || 0,
    comp.montantReelCalcule,
    comp.estimation?.dureeTotaleEstimee || 0,
    comp.dureeTotaleReelle
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `comparaisons_estimation_reel_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 