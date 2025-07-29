import { useState, useEffect } from 'react';
import { CATEGORIES_DEFAUT, POURCENTAGE_BUDGET_DEFAUT } from '../components/affaires/estimation-achats/constants';
import { 
  sauvegarderEstimationAchats, 
  getEstimationAchats, 
  mettreAJourEstimationAchats 
} from '../services/estimationAchatsService';
import { toast } from 'sonner';

export const useEstimationAchats = (affaireId) => {
  const [affaire, setAffaire] = useState(null);
  const [categoriesActives, setCategoriesActives] = useState([]);
  const [montantTotalDevis, setMontantTotalDevis] = useState(0);
  const [montantEstimationAchats, setMontantEstimationAchats] = useState(0);
  const [categoriesPersonnalisees, setCategoriesPersonnalisees] = useState([]);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [pourcentageBudgetAchats, setPourcentageBudgetAchats] = useState(POURCENTAGE_BUDGET_DEFAUT);

  // Charger les catégories personnalisées depuis localStorage
  const chargerCategoriesPersonnalisees = () => {
    try {
      const categoriesSauvegardees = localStorage.getItem('categoriesPersonnalisees');
      if (categoriesSauvegardees) {
        setCategoriesPersonnalisees(JSON.parse(categoriesSauvegardees));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories personnalisées:', error);
    }
  };

  // Sauvegarder les catégories personnalisées dans localStorage
  const sauvegarderCategoriesPersonnalisees = (categories) => {
    try {
      localStorage.setItem('categoriesPersonnalisees', JSON.stringify(categories));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des catégories personnalisées:', error);
    }
  };

  // Charger les données de l'affaire
  const chargerDonnees = async () => {
    try {
      console.log('🔄 Chargement des données pour affaire ID:', affaireId);
      
      // Charger les données de l'affaire et la situation financière depuis l'API
      const [affaireResponse, financialResponse] = await Promise.all([
        import('@/services/affairesService').then(module => module.affairesService.getAffaireById(affaireId)),
        import('@/services/affairesService').then(module => module.affairesService.getFinancialSituation(affaireId))
      ]);
      
      console.log('📊 Réponse affaire:', affaireResponse);
      console.log('💰 Réponse financière complète:', financialResponse);
      
      const affaireData = affaireResponse.data || affaireResponse;
      setAffaire(affaireData);
      
      // Récupérer le vrai montant des devis validés depuis l'API
      const totalDevisValides = financialResponse.devis?.totalValides || 0;
      
      // TEMPORAIRE: Forcer à 35000€ pour tester l'affichage
      const montantTest = 35000;
      setMontantTotalDevis(montantTest);
      
      console.log('✅ Données affaire chargées:', affaireData);
      console.log('💵 Montant API des devis validés:', totalDevisValides);
      console.log('💵 Montant TEST forcé:', montantTest);
      console.log('📋 Structure devis dans la réponse:', financialResponse.devis);
      
      // Charger l'estimation sauvegardée si elle existe
      await chargerEstimationSauvegardee();
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      console.error('❌ Détails de l\'erreur:', error.message, error.stack);
      
      // En cas d'erreur, utiliser des valeurs par défaut
      setAffaire({
        id: affaireId,
        numero: 'Affaire inconnue',
        libelle: 'Données non disponibles',
        client: 'Client inconnu'
      });
      setMontantTotalDevis(0);
    }
  };

  // Charger l'estimation sauvegardée depuis le backend
  const chargerEstimationSauvegardee = async () => {
    try {
      const estimation = await getEstimationAchats(affaireId);
      if (estimation) {
        setCategoriesActives(estimation.categoriesActives || []);
        setPourcentageBudgetAchats(estimation.pourcentageBudgetAchats || POURCENTAGE_BUDGET_DEFAUT);
        console.log('Estimation chargée depuis le backend:', estimation);
      } else {
        // Pas d'estimation sauvegardée, utiliser des données par défaut pour la démo
        setCategoriesActives([
          { id: 'bois-massif', nom: 'Bois massif', couleur: '#8B4513', pourcentage: 20 },
          { id: 'panneau', nom: 'Panneau', couleur: '#D2691E', pourcentage: 15 }
        ]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'estimation:', error);
      // En cas d'erreur, utiliser des données par défaut
      setCategoriesActives([
        { id: 'bois-massif', nom: 'Bois massif', couleur: '#8B4513', pourcentage: 20 },
        { id: 'panneau', nom: 'Panneau', couleur: '#D2691E', pourcentage: 15 }
      ]);
    }
  };

  // Sauvegarder l'estimation actuelle
  const sauvegarderEstimation = async () => {
    try {
      const estimationData = {
        affaireId,
        categoriesActives,
        pourcentageBudgetAchats,
        montantEstimationAchats,
        totalPourcentage,
        dateModification: new Date().toISOString()
      };

      await sauvegarderEstimationAchats(affaireId, estimationData);
      toast.success('Estimation sauvegardée avec succès !');
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de l\'estimation');
      return false;
    }
  };

  // Ajouter une catégorie au camembert
  const ajouterCategorie = (categorie) => {
    console.log('=== AJOUT CATEGORIE ===');
    console.log('Catégorie à ajouter:', categorie.nom, categorie.id);
    
    setCategoriesActives(prevCategories => {
      console.log('Catégories actives AVANT:', prevCategories.map(c => `${c.nom} (${c.id})`));
      
      // Vérifier si la catégorie existe déjà par ID
      const categorieExistante = prevCategories.find(c => c.id === categorie.id);
      console.log('Catégorie existante trouvée:', categorieExistante ? categorieExistante.nom : 'NON');
      
      if (!categorieExistante) {
        // Créer une copie de la catégorie
        const nouvelleCategorie = {
          id: categorie.id,
          nom: categorie.nom,
          couleur: categorie.couleur,
          pourcentage: categorie.pourcentage,
          _timestamp: Date.now()
        };
        
        const nouvellesCategoriesActives = [...prevCategories, nouvelleCategorie];
        console.log('Nouvelles catégories actives APRÈS:', nouvellesCategoriesActives.map(c => `${c.nom} (${c.id})`));
        console.log('Nombre de catégories:', nouvellesCategoriesActives.length);
        
        return nouvellesCategoriesActives;
      } else {
        console.log('Catégorie déjà présente, ignorée');
        return prevCategories;
      }
    });
    
    console.log('=== FIN AJOUT CATEGORIE ===');
  };

  // Retirer une catégorie du camembert
  const retirerCategorie = (categorie) => {
    console.log('=== RETRAIT CATEGORIE ===');
    console.log('Catégorie à retirer:', categorie.nom, categorie.id);
    console.log('Catégories actives AVANT:', categoriesActives.map(c => `${c.nom} (${c.id})`));
    
    const categorieId = typeof categorie === 'object' ? categorie.id : categorie;
    setCategoriesActives(prevCategories => {
      const nouvelleListe = prevCategories.filter(c => c.id !== categorieId);
      console.log('Catégories actives APRÈS:', nouvelleListe.map(c => `${c.nom} (${c.id})`));
      return nouvelleListe;
    });
    
    console.log('=== FIN RETRAIT CATEGORIE ===');
  };

  // Modifier le pourcentage d'une catégorie
  const modifierPourcentage = (categorieId, nouveauPourcentage) => {
    console.log('=== MODIFICATION POURCENTAGE ===');
    console.log('ID:', categorieId, 'Nouveau pourcentage:', nouveauPourcentage);
    
    // Mettre à jour les catégories actives
    setCategoriesActives(categoriesActives.map(c => 
      c.id === categorieId 
        ? { ...c, pourcentage: nouveauPourcentage }
        : c
    ));
    
    // Mettre à jour les catégories personnalisées si nécessaire
    const categoriePersonnalisee = categoriesPersonnalisees.find(c => c.id === categorieId);
    if (categoriePersonnalisee) {
      const nouvellesCategoriesPersonnalisees = categoriesPersonnalisees.map(c => 
        c.id === categorieId 
          ? { ...c, pourcentage: nouveauPourcentage }
          : c
      );
      setCategoriesPersonnalisees(nouvellesCategoriesPersonnalisees);
      sauvegarderCategoriesPersonnalisees(nouvellesCategoriesPersonnalisees);
    }
    
    console.log('=== FIN MODIFICATION POURCENTAGE ===');
  };

  // Créer une catégorie personnalisée
  const creerCategoriePersonnalisee = (nouvelleCategorie) => {
    console.log('=== CRÉATION CATÉGORIE PERSONNALISÉE ===');
    console.log('Nouvelle catégorie:', nouvelleCategorie);
    
    const nouvellesCategoriesPersonnalisees = [...categoriesPersonnalisees, nouvelleCategorie];
    setCategoriesPersonnalisees(nouvellesCategoriesPersonnalisees);
    sauvegarderCategoriesPersonnalisees(nouvellesCategoriesPersonnalisees);
    
    console.log('Catégories personnalisées mises à jour:', nouvellesCategoriesPersonnalisees.length);
    console.log('=== FIN CRÉATION CATÉGORIE PERSONNALISÉE ===');
  };

  // Supprimer une catégorie personnalisée
  const supprimerCategoriePersonnalisee = (categorieId) => {
    console.log('=== SUPPRESSION CATÉGORIE PERSONNALISÉE ===');
    console.log('ID à supprimer:', categorieId);
    
    // Retirer de la liste des catégories actives si elle y est
    setCategoriesActives(prev => prev.filter(c => c.id !== categorieId));
    
    // Retirer de la liste des catégories personnalisées
    const nouvellesCategoriesPersonnalisees = categoriesPersonnalisees.filter(c => c.id !== categorieId);
    setCategoriesPersonnalisees(nouvellesCategoriesPersonnalisees);
    sauvegarderCategoriesPersonnalisees(nouvellesCategoriesPersonnalisees);
    
    console.log('=== FIN SUPPRESSION CATÉGORIE PERSONNALISÉE ===');
  };

  // Calcul du montant d'estimation des achats
  useEffect(() => {
    setMontantEstimationAchats(Math.round(montantTotalDevis * (pourcentageBudgetAchats / 100)));
  }, [montantTotalDevis, pourcentageBudgetAchats]);

  // Fonction pour forcer le rechargement des données
  const rafraichirDonnees = async () => {
    await chargerDonnees();
  };

  // Chargement initial
  useEffect(() => {
    chargerDonnees();
    chargerCategoriesPersonnalisees();
  }, [affaireId]);

  // Écouter les événements de mise à jour
  useEffect(() => {
    const handleBdcUpdate = (event) => {
      const { affaireId: eventAffaireId } = event.detail;
      if (eventAffaireId === affaireId) {
        console.log('🔄 Rafraîchissement automatique de l\'estimation suite à une action BDC');
        chargerDonnees();
      }
    };
    
    const handleDevisUpdate = (event) => {
      const { affaireId: eventAffaireId } = event.detail;
      if (eventAffaireId === affaireId) {
        console.log('🔄 Rafraîchissement automatique de l\'estimation suite à une action devis');
        chargerDonnees();
      }
    };
    
    // Ajouter les listeners
    window.addEventListener('bdc_updated', handleBdcUpdate);
    window.addEventListener('devis_updated', handleDevisUpdate);
    window.addEventListener('affaire_updated', handleDevisUpdate);
    
    // Nettoyer les listeners
    return () => {
      window.removeEventListener('bdc_updated', handleBdcUpdate);
      window.removeEventListener('devis_updated', handleDevisUpdate);
      window.removeEventListener('affaire_updated', handleDevisUpdate);
    };
  }, [affaireId]);

  // Calculs dérivés
  const toutesLesCategories = [...CATEGORIES_DEFAUT, ...categoriesPersonnalisees];
  const totalPourcentage = categoriesActives.reduce((sum, c) => sum + c.pourcentage, 0);
  const pourcentageNonAffecte = Math.max(0, 100 - totalPourcentage);

  return {
    // État
    affaire,
    categoriesActives,
    categoriesPersonnalisees,
    editingCategoryId,
    montantTotalDevis,
    montantEstimationAchats,
    pourcentageBudgetAchats,
    
    // Données calculées
    toutesLesCategories,
    totalPourcentage,
    pourcentageNonAffecte,
    
    // Actions
    setEditingCategoryId,
    setPourcentageBudgetAchats,
    ajouterCategorie,
    retirerCategorie,
    modifierPourcentage,
    creerCategoriePersonnalisee,
    supprimerCategoriePersonnalisee,
    sauvegarderEstimation,
    chargerEstimationSauvegardee,
    rafraichirDonnees
  };
}; 