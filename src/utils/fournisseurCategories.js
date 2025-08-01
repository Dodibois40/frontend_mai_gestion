// Catégories de fournisseurs pour l'agencement et la menuiserie
export const CATEGORIES_FOURNISSEUR = {
  QUINCAILLERIE: 'QUINCAILLERIE',
  BOIS: 'BOIS',
  VITRAGE: 'VITRAGE',
  MENUISERIE: 'MENUISERIE',
  AGENCEMENT: 'AGENCEMENT',
  FERRONNERIE: 'FERRONNERIE',
  PEINTURE: 'PEINTURE',
  ELECTRICITE: 'ELECTRICITE',
  PLOMBERIE: 'PLOMBERIE',
  ISOLATION: 'ISOLATION',
  OUTILLAGE: 'OUTILLAGE',
  AUTRE: 'AUTRE',
};

// Labels français pour l'affichage
export const CATEGORIES_LABELS = {
  [CATEGORIES_FOURNISSEUR.QUINCAILLERIE]: 'Quincaillerie',
  [CATEGORIES_FOURNISSEUR.BOIS]: 'Bois',
  [CATEGORIES_FOURNISSEUR.VITRAGE]: 'Vitrage',
  [CATEGORIES_FOURNISSEUR.MENUISERIE]: 'Menuiserie',
  [CATEGORIES_FOURNISSEUR.AGENCEMENT]: 'Agencement',
  [CATEGORIES_FOURNISSEUR.FERRONNERIE]: 'Ferronnerie',
  [CATEGORIES_FOURNISSEUR.PEINTURE]: 'Peinture',
  [CATEGORIES_FOURNISSEUR.ELECTRICITE]: 'Électricité',
  [CATEGORIES_FOURNISSEUR.PLOMBERIE]: 'Plomberie',
  [CATEGORIES_FOURNISSEUR.ISOLATION]: 'Isolation',
  [CATEGORIES_FOURNISSEUR.OUTILLAGE]: 'Outillage',
  [CATEGORIES_FOURNISSEUR.AUTRE]: 'Autre',
};

// Options pour les selects
export const CATEGORIES_OPTIONS = Object.entries(CATEGORIES_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// Couleurs pour les badges par catégorie
export const CATEGORIES_COLORS = {
  [CATEGORIES_FOURNISSEUR.QUINCAILLERIE]: 'blue',
  [CATEGORIES_FOURNISSEUR.BOIS]: 'brown',
  [CATEGORIES_FOURNISSEUR.VITRAGE]: 'cyan',
  [CATEGORIES_FOURNISSEUR.MENUISERIE]: 'orange',
  [CATEGORIES_FOURNISSEUR.AGENCEMENT]: 'green',
  [CATEGORIES_FOURNISSEUR.FERRONNERIE]: 'gray',
  [CATEGORIES_FOURNISSEUR.PEINTURE]: 'pink',
  [CATEGORIES_FOURNISSEUR.ELECTRICITE]: 'yellow',
  [CATEGORIES_FOURNISSEUR.PLOMBERIE]: 'teal',
  [CATEGORIES_FOURNISSEUR.ISOLATION]: 'violet',
  [CATEGORIES_FOURNISSEUR.OUTILLAGE]: 'indigo',
  [CATEGORIES_FOURNISSEUR.AUTRE]: 'gray',
};

// Fonction utilitaire pour obtenir le label d'une catégorie
export const getCategorieLabel = (categorie) => {
  return CATEGORIES_LABELS[categorie] || categorie;
};

// Fonction utilitaire pour obtenir la couleur d'une catégorie
export const getCategorieColor = (categorie) => {
  return CATEGORIES_COLORS[categorie] || 'gray';
};

/**
 * Trouve la catégorie d'achat correspondante pour un fournisseur donné
 * @param {Object} fournisseur - Le fournisseur sélectionné
 * @param {Array} categoriesAchat - La liste des catégories d'achat disponibles
 * @returns {string|null} - L'ID de la catégorie trouvée ou null
 */
export const findCategorieAchatForFournisseur = (fournisseur, categoriesAchat) => {
  console.log('🔍 [AUTO-CATEGORIE] ===== DÉBUT DIAGNOSTIC COMPLET =====');
  console.log('🏢 [AUTO-CATEGORIE] Fournisseur reçu:', JSON.stringify(fournisseur, null, 2));
  console.log('📂 [AUTO-CATEGORIE] Catégories disponibles:', JSON.stringify(categoriesAchat, null, 2));
  console.log('🔍 [AUTO-CATEGORIE] Type fournisseur:', typeof fournisseur);
  console.log('🔍 [AUTO-CATEGORIE] Type categoriesAchat:', typeof categoriesAchat);
  console.log('🔍 [AUTO-CATEGORIE] IsArray categoriesAchat:', Array.isArray(categoriesAchat));

  if (!fournisseur || !categoriesAchat || !Array.isArray(categoriesAchat)) {
    console.log('❌ [AUTO-CATEGORIE] Données manquantes ou invalides');
    console.log('❌ [AUTO-CATEGORIE] fournisseur:', !!fournisseur);
    console.log('❌ [AUTO-CATEGORIE] categoriesAchat:', !!categoriesAchat);
    console.log('❌ [AUTO-CATEGORIE] isArray:', Array.isArray(categoriesAchat));
    return null;
  }

  // Cas spéciaux pour des fournisseurs connus (priorité 1)
  const casSpeciaux = {
    'BOUNEY': 'BOIS',
    'FOUSSIER': 'QUINCAILLERIE',
    'MENUISERIES DUPONT': 'MENUISERIE',
    'VISSERIE PRO': 'QUINCAILLERIE',
    'VERRES': 'VITRAGE',
    'CRISTAUX': 'VITRAGE',
    'OUTILLAGE MODERNE': 'OUTILLAGE',
    'PROFIL': 'AGENCEMENT',
    'BOIS DU NORD': 'BOIS',
    'FERRONNERIE': 'FERRONNERIE',
    'PEINTURE': 'PEINTURE',
  };

  const nomFournisseur = (fournisseur.nom || '').toUpperCase();
  console.log('🔍 [AUTO-CATEGORIE] Nom fournisseur original:', fournisseur.nom);
  console.log('🔍 [AUTO-CATEGORIE] Nom fournisseur (majuscules):', nomFournisseur);
  console.log('🔍 [AUTO-CATEGORIE] Cas spéciaux disponibles:', Object.keys(casSpeciaux));

  // Recherche par nom de fournisseur (cas spéciaux)
  for (const [nomSpecial, categorieSpeciale] of Object.entries(casSpeciaux)) {
    console.log(`🔍 [AUTO-CATEGORIE] Test "${nomSpecial}" dans "${nomFournisseur}"`);
    if (nomFournisseur.includes(nomSpecial)) {
      console.log('🔍 [AUTO-CATEGORIE] Cas spécial trouvé pour:', nomSpecial, '→', categorieSpeciale);
      
      // Rechercher la catégorie correspondante
      console.log('🔍 [AUTO-CATEGORIE] Recherche de la catégorie:', categorieSpeciale);
      console.log('🔍 [AUTO-CATEGORIE] Dans les catégories:', categoriesAchat.map(cat => ({
        id: cat.id,
        intitule: cat.intitule,
        nom: cat.nom,
        intituleUpper: (cat.intitule || cat.nom || '').toUpperCase()
      })));

      const categorieCorrespondante = categoriesAchat.find(cat => {
        const intituleCategorie = (cat.intitule || cat.nom || '').toUpperCase();
        const match = intituleCategorie.includes(categorieSpeciale);
        console.log(`🔍 [AUTO-CATEGORIE] "${intituleCategorie}" contient "${categorieSpeciale}"? ${match}`);
        return match;
      });
      
      if (categorieCorrespondante) {
        console.log('🎯 [AUTO-CATEGORIE] Retour cas spécial:', categorieCorrespondante.id.toString());
        console.log('🔍 [AUTO-CATEGORIE] ===== FIN DIAGNOSTIC (SUCCÈS) =====');
        return categorieCorrespondante.id.toString();
      } else {
        console.log('⚠️ [AUTO-CATEGORIE] Cas spécial trouvé mais catégorie non trouvée:', categorieSpeciale);
      }
    }
  }

  // Si pas de cas spécial trouvé, utiliser la catégorie du fournisseur (priorité 2)
  console.log('🔍 [AUTO-CATEGORIE] Aucun cas spécial trouvé, vérification catégorie fournisseur');
  console.log('🔍 [AUTO-CATEGORIE] Propriétés du fournisseur:', Object.keys(fournisseur));
  console.log('🔍 [AUTO-CATEGORIE] Catégorie fournisseur:', fournisseur.categorie);
  console.log('🔍 [AUTO-CATEGORIE] Type catégorie fournisseur:', typeof fournisseur.categorie);

  if (!fournisseur.categorie) {
    console.log('❌ [AUTO-CATEGORIE] Fournisseur sans catégorie définie et aucun cas spécial');
    console.log('🔍 [AUTO-CATEGORIE] ===== FIN DIAGNOSTIC (ÉCHEC) =====');
    return null;
  }

  console.log('🔍 [AUTO-CATEGORIE] Catégorie du fournisseur:', fournisseur.categorie);

  // Recherche par correspondance exacte du nom de la catégorie
  const categorieExacte = categoriesAchat.find(cat => {
    const intituleCategorie = (cat.intitule || cat.nom || '').toUpperCase();
    const categorieFournisseur = fournisseur.categorie.toUpperCase();
    const match = intituleCategorie === categorieFournisseur;
    
    console.log(`🔍 [AUTO-CATEGORIE] Correspondance exacte: "${intituleCategorie}" === "${categorieFournisseur}"? ${match}`);
    
    if (match) {
      console.log('✅ [AUTO-CATEGORIE] Correspondance exacte trouvée:', cat);
    }
    
    return match;
  });

  if (categorieExacte) {
    console.log('🎯 [AUTO-CATEGORIE] Retour correspondance exacte:', categorieExacte.id.toString());
    console.log('🔍 [AUTO-CATEGORIE] ===== FIN DIAGNOSTIC (SUCCÈS) =====');
    return categorieExacte.id.toString();
  }

  // Recherche par correspondance partielle (contient le mot-clé)
  const categoriePartielle = categoriesAchat.find(cat => {
    const intituleCategorie = (cat.intitule || cat.nom || '').toUpperCase();
    const categorieFournisseur = fournisseur.categorie.toUpperCase();
    const match = intituleCategorie.includes(categorieFournisseur) || categorieFournisseur.includes(intituleCategorie);
    
    console.log(`🔍 [AUTO-CATEGORIE] Correspondance partielle: "${intituleCategorie}" <-> "${categorieFournisseur}"? ${match}`);
    
    if (match) {
      console.log('🔍 [AUTO-CATEGORIE] Correspondance partielle trouvée:', cat);
    }
    
    return match;
  });

  if (categoriePartielle) {
    console.log('🎯 [AUTO-CATEGORIE] Retour correspondance partielle:', categoriePartielle.id.toString());
    console.log('🔍 [AUTO-CATEGORIE] ===== FIN DIAGNOSTIC (SUCCÈS) =====');
    return categoriePartielle.id.toString();
  }

  // Mappage spécifique pour certaines catégories communes (priorité 3)
  const mappingCategories = {
    'QUINCAILLERIE': ['QUINCAILLERIE', 'VISSERIE', 'FIXATION'],
    'BOIS': ['BOIS', 'SCIAGE', 'PLANCHES', 'PANNEAUX'],
    'VITRAGE': ['VITRAGE', 'VERRE', 'MIROITERIE'],
    'MENUISERIE': ['MENUISERIE', 'PORTES', 'FENÊTRES', 'VOLETS'],
    'AGENCEMENT': ['AGENCEMENT', 'MOBILIER', 'RANGEMENT'],
    'FERRONNERIE': ['FERRONNERIE', 'MÉTALLERIE', 'SERRURERIE'],
    'PEINTURE': ['PEINTURE', 'REVÊTEMENT', 'FINITION'],
    'ELECTRICITE': ['ELECTRICITÉ', 'ÉLECTRIQUE', 'ÉCLAIRAGE'],
    'PLOMBERIE': ['PLOMBERIE', 'SANITAIRE', 'ROBINETTERIE'],
    'ISOLATION': ['ISOLATION', 'ÉTANCHÉITÉ'],
    'OUTILLAGE': ['OUTILLAGE', 'OUTIL', 'MACHINES']
  };

  console.log('🔍 [AUTO-CATEGORIE] Recherche par mapping...');

  // Recherche par mapping de catégories
  for (const [categoriePrincipale, motsClefs] of Object.entries(mappingCategories)) {
    const categorieFournisseur = fournisseur.categorie.toUpperCase();
    
    console.log(`🔍 [AUTO-CATEGORIE] Test mapping "${categoriePrincipale}" avec "${categorieFournisseur}"`);
    
    if (motsClefs.some(motClef => 
      categorieFournisseur.includes(motClef) || motClef.includes(categorieFournisseur)
    )) {
      console.log('🔍 [AUTO-CATEGORIE] Mot-clé trouvé pour catégorie:', categoriePrincipale);
      
      const categorieCorrespondante = categoriesAchat.find(cat => {
        const intituleCategorie = (cat.intitule || cat.nom || '').toUpperCase();
        const match = motsClefs.some(motClef => intituleCategorie.includes(motClef));
        console.log(`🔍 [AUTO-CATEGORIE] "${intituleCategorie}" contient un mot-clé de [${motsClefs.join(', ')}]? ${match}`);
        return match;
      });
      
      if (categorieCorrespondante) {
        console.log('🎯 [AUTO-CATEGORIE] Retour mapping:', categorieCorrespondante.id.toString());
        console.log('🔍 [AUTO-CATEGORIE] ===== FIN DIAGNOSTIC (SUCCÈS) =====');
        return categorieCorrespondante.id.toString();
      }
    }
  }

  // Aucune correspondance trouvée
  console.log('❌ [AUTO-CATEGORIE] Aucune correspondance trouvée');
  console.log('🔍 [AUTO-CATEGORIE] ===== FIN DIAGNOSTIC (ÉCHEC) =====');
  return null;
}; 