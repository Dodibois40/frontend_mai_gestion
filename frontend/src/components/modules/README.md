# 📁 Modules Réutilisables

Cette structure permet de bien organiser et réutiliser les composants pour les modules similaires (BDC et Factures d'achats).

## 🏗️ Structure

```
modules/
├── bdc/                     # Module Bons de Commande
│   ├── BdcCore.jsx         # Composant complet avec logique intégrée
│   ├── BdcList.jsx         # Liste réutilisable des BDC
│   ├── BdcModal.jsx        # Modal de formulaire réutilisable
│   ├── BdcSection.jsx      # Section principale (utilise List + Modal)
│   └── index.js            # Exports du module
│
├── factures-achats/         # Module Factures d'Achats
│   ├── FactureAchatList.jsx     # Liste des factures
│   ├── FactureAchatModal.jsx    # Modal de formulaire
│   ├── FactureAchatSection.jsx  # Section principale
│   └── index.js                 # Exports du module
│
└── README.md               # Cette documentation
```

## 🎯 Principe de Réutilisabilité

### **Composants de Base**
- **List** : Affichage en liste avec actions
- **Modal** : Formulaire de création/modification
- **Section** : Assemblage List + Modal + logique métier

### **Avantages**
✅ **Code réutilisable** : Même structure pour BDC et Factures  
✅ **Maintenance facile** : Modifications dans un seul endroit  
✅ **Tests isolés** : Chaque composant testable indépendamment  
✅ **Import flexible** : Utiliser seulement ce qui est nécessaire  

## 📦 Utilisation

### **Import d'un module complet**
```jsx
import BdcSection from '@/components/modules/bdc';
import FactureAchatSection from '@/components/modules/factures-achats';

// Utilisation
<BdcSection affaireId={123} onUpdate={handleUpdate} />
<FactureAchatSection affaireId={123} onUpdate={handleUpdate} />
```

### **Import de composants individuels**
```jsx
import { BdcList, BdcModal } from '@/components/modules/bdc';
import { FactureAchatList, FactureAchatModal } from '@/components/modules/factures-achats';

// Utilisation personnalisée
<BdcList bdcs={bdcs} onEdit={handleEdit} />
<BdcModal opened={true} onSubmit={handleSubmit} />
```

## 🔄 Migration des Fichiers Existants

### **Fichiers BDC existants (À NE PAS SUPPRIMER)**
- `AffaireBdcSectionReal.jsx` ✅ **Fonctionne**
- `AffaireBdcSection.jsx` ✅ **Fonctionne** 
- `AffaireBdc.jsx` ✅ **Fonctionne**

### **Migration Progressive**
1. **Phase 1** : Nouveaux développements utilisent les modules
2. **Phase 2** : Migration progressive des composants existants
3. **Phase 3** : Suppression des anciens fichiers (quand testé)

## 🎨 Personnalisation

### **Props de Configuration**
```jsx
<BdcSection
  affaireId={123}
  title="Mes Bons de Commande"           // Titre personnalisé
  subtitle="Gestion des commandes"       // Sous-titre
  showHeader={true}                      // Afficher l'en-tête
  collapsible={false}                    // Section pliable
  className="custom-class"               // Classes CSS
  onUpdate={handleUpdate}               // Callback de mise à jour
/>
```

### **Couleurs par Module**
- **BDC** : Orange (`bg-orange-100`, `text-orange-600`)
- **Factures d'achats** : Violet (`bg-purple-100`, `text-purple-600`)

## 🧪 Tests

### **Tests unitaires recommandés**
```jsx
// Tests BDC
describe('BdcList', () => {
  it('should display BDC list', () => { /* ... */ });
  it('should handle edit action', () => { /* ... */ });
});

describe('BdcModal', () => {
  it('should validate form', () => { /* ... */ });
  it('should submit data', () => { /* ... */ });
});
```

## 🚀 Développement Futur

### **Nouveaux Modules Suggérés**
- **Devis** : Même structure que BDC
- **Factures de Vente** : Basé sur Factures d'achats
- **Contrats** : Adaptation de la structure

### **Améliorations Prévues**
- **Tests automatisés** : Jest + React Testing Library
- **Storybook** : Documentation interactive des composants
- **Types TypeScript** : Migration progressive vers TS

---

**📞 Support** : Cette structure respecte le code existant et ajoute une couche modulaire pour l'avenir. 