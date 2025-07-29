import API from './api';

const PLANNING_URL = '/api/plannings';

// Récupérer tous les plannings
export const getAllPlannings = async () => {
  try {
    const response = await API.get(PLANNING_URL);
    console.log('Réponse getAllPlannings:', response);
    return response.data;
  } catch (error) {
    console.error('Erreur getAllPlannings:', error);
    throw error;
  }
};

// Récupérer un planning par ID
export const getPlanningById = async (id) => {
  try {
    const response = await API.get(`${PLANNING_URL}/${id}`);
    console.log(`Réponse getPlanningById ${id}:`, response);
    return response.data.planning;
  } catch (error) {
    console.error(`Erreur getPlanningById ${id}:`, error);
    throw error;
  }
};

// Créer un nouveau planning
export const createPlanning = async (planningData) => {
  try {
    // Simplification des données envoyées au backend
    console.log('Données du planning à créer:', planningData);
    
    // Envoi direct des données sans transformation complexe
    const response = await API.post(PLANNING_URL, planningData);
    console.log('Réponse createPlanning:', response);
    return response.data;
  } catch (error) {
    console.error('Erreur createPlanning:', error);
    throw error;
  }
};

// Mettre à jour un planning existant
export const updatePlanning = async (id, planningData) => {
  try {
    console.log(`Mise à jour planning ${id} - données:`, planningData);
    const response = await API.put(`${PLANNING_URL}/${id}`, planningData);
    console.log(`Réponse updatePlanning ${id}:`, response);
    return response.data;
  } catch (error) {
    console.error(`Erreur updatePlanning ${id}:`, error);
    throw error;
  }
};

// Supprimer un planning
export const deletePlanning = async (id) => {
  try {
    const response = await API.delete(`${PLANNING_URL}/${id}`);
    console.log(`Réponse deletePlanning ${id}:`, response);
    return response.data;
  } catch (error) {
    console.error(`Erreur deletePlanning ${id}:`, error);
    throw error;
  }
}; 