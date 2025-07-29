# Module d'Estimation des Achats

Ce module fournit une interface complète pour gérer l'estimation des achats d'une affaire avec un camembert interactif.

## 📁 Structure des fichiers

```
estimation-achats/
├── README.md                 # Documentation du module
├── index.js                  # Point d'entrée - exports tous les composants
├── constants.js              # Constantes et données par défaut
├── ChartControlPanel.jsx     # Panneau de contrôle sous le camembert
├── CategoryButton.jsx        # Boutons de catégories (drag & drop + clic)
└── CreateCategoryForm.jsx    # Formulaire de création de catégories personnalisées
```

## 🎯 Composants principaux

### `ChartControlPanel`
- Panneau de contrôle qui apparaît sous le camembert
- Permet d'ajuster les pourcentages avec slider et input numérique
- Affiche les calculs en temps réel (montant estimé, pourcentage restant, total)
- Alertes visuelles pour dépassement ou completion

### `CategoryButton`
- Boutons de catégories avec drag & drop
- Cliquables pour sélection/édition quand dans le camembert
- Gestion des catégories prédéfinies et personnalisées
- Boutons de suppression contextuels

### `CreateCategoryForm`
- Formulaire pour créer des catégories personnalisées
- Validation des données (nom unique, pourcentage valide)
- Sélecteur de couleurs prédéfinies
- Aperçu en temps réel

## 🔧 Hook personnalisé

### `useEstimationAchats(affaireId)`
Situé dans `/src/hooks/useEstimationAchats.js`

**Retourne :**
- **État :** affaire, categoriesActives, montantEstimationAchats, etc.
- **Données calculées :** totalPourcentage, pourcentageNonAffecte, etc.
- **Actions :** ajouterCategorie, modifierPourcentage, etc.

## 🚀 Utilisation

### Import simple
```javascript
import { 
  ChartControlPanel, 
  CategoryButton, 
  CreateCategoryForm,
  CATEGORIES_DEFAUT 
} from '../components/affaires/estimation-achats';
import { useEstimationAchats } from '../hooks/useEstimationAchats';
```

### Utilisation dans un composant
```javascript
const MonComposant = () => {
  const { id } = useParams();
  const {
    affaire,
    categoriesActives,
    editingCategoryId,
    setEditingCategoryId,
    ajouterCategorie,
    modifierPourcentage,
    // ... autres propriétés
  } = useEstimationAchats(id);

  return (
    <div>
      {/* Votre interface */}
      <ChartControlPanel
        categorieSelectionnee={categoriesActives.find(c => c.id === editingCategoryId)}
        onUpdate={modifierPourcentage}
        onDeselect={() => setEditingCategoryId(null)}
        montantEstimationAchats={montantEstimationAchats}
        totalPourcentage={totalPourcentage}
      />
    </div>
  );
};
```

## 🔄 Duplication pour d'autres modules

Pour dupliquer ce module (ex: estimation-ventes, estimation-temps) :

1. **Copier le dossier** `estimation-achats` vers `estimation-[nouveau-type]`
2. **Modifier les constantes** dans `constants.js` (catégories, pourcentages par défaut)
3. **Adapter le hook** `useEstimation[NouveauType].js` 
4. **Personnaliser les composants** selon les besoins spécifiques
5. **Mettre à jour les imports** dans le composant parent

## 📊 Fonctionnalités

- ✅ Drag & drop des catégories vers le camembert
- ✅ Clic sur catégories pour édition des pourcentages
- ✅ Slider et input numérique pour ajustement précis
- ✅ Calculs en temps réel (montants, pourcentages)
- ✅ Catégories personnalisées avec persistance localStorage
- ✅ Validation et alertes visuelles
- ✅ Pourcentage de budget modifiable
- ✅ Interface responsive et moderne

## 🎨 Personnalisation

- **Couleurs :** Modifiez les couleurs dans `constants.js`
- **Catégories par défaut :** Adaptez `CATEGORIES_DEFAUT`
- **Styles :** Tous les composants utilisent Tailwind CSS
- **Logique métier :** Centralisée dans le hook `useEstimationAchats` 