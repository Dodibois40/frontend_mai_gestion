import API from './api';

// Couleurs pastel aléatoires pour les noms d'utilisateurs (plus contrastées)
const couleursPastel = [
  '#E91E63', // Rose vif
  '#FF9800', // Orange vif
  '#FFC107', // Jaune doré
  '#4CAF50', // Vert vif
  '#2196F3', // Bleu vif
  '#9C27B0', // Violet vif
  '#F06292', // Rose fuchsia
  '#26A69A', // Turquoise vif
  '#FF5722', // Rouge-orange
  '#673AB7', // Violet foncé
  '#009688', // Teal
  '#795548'  // Marron
];

// Fonction pour obtenir une couleur pastel consistante pour un utilisateur
export const getCouleurPastelUtilisateur = (userId, userData = null) => {
  // Si nous avons les données utilisateur avec la couleur, l'utiliser
  if (userData && userData.couleurPlanning) {
    return userData.couleurPlanning;
  }
  
  // Sinon, utiliser l'ancienne logique comme fallback
  const index = userId % couleursPastel.length;
  return couleursPastel[index];
};

// Configuration des statuts contractuels avec leurs labels français
export const STATUTS_CONTRACTUELS_CONFIG = {
  SALARIE: {
    label: 'Salarié',
    description: 'Employé permanent de l\'entreprise',
    color: 'bg-green-800 text-white'  // Vert olive foncé RAL 6003 et texte blanc
  },
  SOUS_TRAITANT: {
    label: 'Sous-traitant',
    description: 'Intervenant externe ou prestataire',
    color: 'text-white'  // Texte blanc avec fond RGB personnalisé
  }
};

// Styles personnalisés pour les couleurs RAL exactes
export const customRalStyles = {
  SOUS_TRAITANT: {
    backgroundColor: 'rgb(102, 102, 102)',  // RAL 6014 - RGB exacte
    color: 'white'
  }
};

// Configuration des rôles avec leurs labels français
export const ROLES_CONFIG = {
  ADMIN_SYS: {
    label: 'Administrateur Système',
    description: 'Accès total, gestion des paramètres',
    color: 'red'
  },
  DIRIGEANT: {
    label: 'Dirigeant',
    description: 'Direction de l\'entreprise, accès complet',
    color: 'purple'
  },
  CHARGE_AFFAIRE: {
    label: 'Chargé d\'Affaire',
    description: 'Crée/édite les affaires, valide les BDC, consulte reporting',
    color: 'blue'
  },
  CHEF_CHANTIER: {
    label: 'Chef de Chantier',
    description: 'Supervision des chantiers, validation pointages chantier',
    color: 'orange'
  },
  CHEF_ATELIER: {
    label: 'Chef d\'Atelier',
    description: 'Supervision atelier, validation pointages atelier',
    color: 'green'
  },
  ACHETEUR: {
    label: 'Acheteur',
    description: 'Crée/édite BDC, voit les coûts, pas la marge',
    color: 'indigo'
  },
  OUVRIER_CHANTIER: {
    label: 'Ouvrier Chantier',
    description: 'Travail sur chantier, saisie pointages',
    color: 'yellow'
  },
  OUVRIER_ATELIER: {
    label: 'Ouvrier Atelier',
    description: 'Travail en atelier, saisie pointages',
    color: 'teal'
  }
};

// Configuration des spécialités multiples
export const SPECIALITES_CONFIG = {
  specialitePoseur: {
    label: 'Poseur',
    description: 'Spécialisé dans la pose',
    color: 'blue'
  },
  specialiteFabriquant: {
    label: 'Fabriquant',
    description: 'Spécialisé dans la fabrication',
    color: 'green'
  },
  specialiteDessinateur: {
    label: 'Dessinateur',
    description: 'Spécialisé dans le dessin technique',
    color: 'purple'
  },
  specialiteChargeAffaire: {
    label: 'Chargé d\'Affaire',
    description: 'Spécialisé dans le suivi commercial',
    color: 'orange'
  }
};

// Récupérer la liste des utilisateurs avec filtres et pagination
export const getUsers = async (params = {}) => {
  try {
    const { data } = await API.get('/users', { params });
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

// Récupérer un utilisateur par ID
export const getUserById = async (id) => {
  try {
    const { data } = await API.get(`/users/${id}`);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
};

// Créer un nouvel utilisateur
export const createUser = async (userData) => {
  try {
    const { data } = await API.post('/users', userData);
    return data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    throw error;
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (id, userData) => {
  try {
    const { data } = await API.put(`/users/${id}`, userData);
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw error;
  }
};

// Supprimer (désactiver) un utilisateur
export const deleteUser = async (id) => {
  try {
    const { data } = await API.delete(`/users/${id}`);
    return data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw error;
  }
};

// Réactiver un utilisateur
export const reactivateUser = async (id) => {
  try {
    const { data } = await API.patch(`/users/${id}/reactivate`);
    return data;
  } catch (error) {
    console.error('Erreur lors de la réactivation de l\'utilisateur:', error);
    throw error;
  }
};

// Changer le mot de passe d'un utilisateur
export const changeUserPassword = async (id, passwordData) => {
  try {
    const { data } = await API.patch(`/users/${id}/password`, passwordData);
    return data;
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    throw error;
  }
};

// Obtenir les statistiques des utilisateurs
export const getUsersStats = async () => {
  try {
    const { data } = await API.get('/users/stats');
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

// Obtenir les utilisateurs par rôle
export const getUsersByRole = async (role) => {
  try {
    const { data } = await API.get(`/users/by-role/${role}`);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs par rôle:', error);
    throw error;
  }
};

// Vérifier si un email est disponible
export const checkEmailAvailability = async (email, excludeUserId = null) => {
  try {
    // On ne cherche que sur la première page, car si l'email existe, il sera trouvé.
    const response = await getUsers({ search: email, page: 1, limit: 10 });
    // La réponse de l'API contient un objet { users: [...] }
    const usersList = response?.users || [];

    const existingUser = usersList.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      (!excludeUserId || user.id !== excludeUserId)
    );
    return !existingUser; // Retourne true si l'email est disponible
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    return true; // En cas d'erreur, on laisse passer la validation
  }
};

// Fonctions utilitaires
export const getRoleLabel = (role) => {
  return ROLES_CONFIG[role]?.label || role;
};

export const getRoleColor = (role) => {
  return ROLES_CONFIG[role]?.color || 'gray';
};

export const getRoleDescription = (role) => {
  return ROLES_CONFIG[role]?.description || '';
};

export const getRolesForSelect = () => {
  return Object.entries(ROLES_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
    description: config.description
  }));
};

// Obtenir les rôles selon le statut contractuel
export const getRolesForStatutContractuel = (statutContractuel) => {
  // Tous les rôles sont disponibles pour les salariés
  if (statutContractuel === 'SALARIE') {
    return getRolesForSelect();
  }
  
  // Pour les sous-traitants, seulement certains rôles sont disponibles
  if (statutContractuel === 'SOUS_TRAITANT') {
    const rolesAutorisesEquipe = ['OUVRIER_CHANTIER', 'OUVRIER_ATELIER'];
    return Object.entries(ROLES_CONFIG)
      .filter(([key]) => rolesAutorisesEquipe.includes(key))
      .map(([value, config]) => ({
        value,
        label: config.label,
        description: config.description
      }));
  }
  
  return getRolesForSelect();
};

// Fonctions utilitaires pour les statuts contractuels
export const getStatutContractuelLabel = (statut) => {
  return STATUTS_CONTRACTUELS_CONFIG[statut]?.label || statut;
};

export const getStatutContractuelColor = (statut) => {
  return STATUTS_CONTRACTUELS_CONFIG[statut]?.color || 'gray';
};

export const getStatutContractuelDescription = (statut) => {
  return STATUTS_CONTRACTUELS_CONFIG[statut]?.description || '';
};

export const getStatutsContractuelsForSelect = () => {
  return Object.entries(STATUTS_CONTRACTUELS_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
    description: config.description
  }));
};

// Fonctions utilitaires pour les spécialités
export const getSpecialiteLabel = (specialite) => {
  return SPECIALITES_CONFIG[specialite]?.label || specialite;
};

export const getSpecialiteDescription = (specialite) => {
  return SPECIALITES_CONFIG[specialite]?.description || '';
};

export const getSpecialitesForSelect = () => {
  return Object.entries(SPECIALITES_CONFIG).map(([key, config]) => ({
    key,
    label: config.label,
    description: config.description
  }));
};

export const getUserSpecialites = (user) => {
  const specialites = [];
  if (user.specialitePoseur) specialites.push('Poseur');
  if (user.specialiteFabriquant) specialites.push('Fabriquant');
  if (user.specialiteDessinateur) specialites.push('Dessinateur');
  if (user.specialiteChargeAffaire) specialites.push('Chargé d\'Affaire');
  return specialites;
};

export const getUserSpecialitesString = (user) => {
  const specialites = getUserSpecialites(user);
  return specialites.length > 0 ? specialites.join(', ') : 'Aucune spécialité';
};

// Validation des données utilisateur
export const validateUserData = (userData) => {
  const errors = {};

  if (!userData.nom?.trim()) {
    errors.nom = 'Le nom est obligatoire';
  }

  if (!userData.prenom?.trim()) {
    errors.prenom = 'Le prénom est obligatoire';
  }

  if (!userData.email?.trim()) {
    errors.email = 'L\'email est obligatoire';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.email = 'Format d\'email invalide';
  }

  if (!userData.role) {
    errors.role = 'Le rôle est obligatoire';
  }

  if (userData.tarifHoraireBase !== undefined && userData.tarifHoraireBase < 0) {
    errors.tarifHoraireBase = 'Le tarif horaire ne peut pas être négatif';
  }

  if (userData.telephone && !/^[0-9\s\-\+\(\)]+$/.test(userData.telephone)) {
    errors.telephone = 'Format de téléphone invalide';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  reactivateUser,
  changeUserPassword,
  getUsersStats,
  getUsersByRole,
  checkEmailAvailability,
  getRoleLabel,
  getRoleColor,
  getRoleDescription,
  getRolesForSelect,
  validateUserData,
  ROLES_CONFIG
}; 