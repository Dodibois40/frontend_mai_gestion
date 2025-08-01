# Thème "Terre, Chêne, Vert Olive" - M.AI Gestion

## 🎨 Palette de couleurs principale

### Vert Olive 6003 (Couleur principale)
- **Hex :** `#6b7c3d`
- **Usage :** Boutons d'action positifs (Créer, Valider, Confirmer)
- **Hover :** `#556533` (vert olive foncé)

### Couleurs neutres
- **Blanc pur :** `#ffffff`
- **Gris bordure :** `#d1d5db` 
- **Gris texte :** `#374151`
- **Gris texte secondaire :** `#333333`

### Couleurs pastel pour arrière-plans
- **Terre pastel :** `#f5f0e8` avec bordure `#e8dcc0`
- **Vert olive pastel :** `#f0f4e8` avec bordure `#d9e2c4`
- **Chêne pastel :** `#faf6f0` avec bordure `#f0e6d2`

## 🖱️ Styles de boutons standardisés

### Boutons d'action positive (Créer/Valider)
```css
{
  backgroundColor: '#6b7c3d',
  color: '#ffffff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: '500',
  minHeight: '36px'
}

/* Hover */
:hover {
  backgroundColor: '#556533';
}
```

### Boutons neutres (Annuler/Litige)
```css
{
  backgroundColor: '#ffffff',
  border: '1px solid #d1d5db',
  color: '#374151',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: '500',
  minHeight: '36px'
}

/* Pas d'effet hover - reste statique */
```

## 📋 Encadrés statistiques

### Style épuré sans icônes
```css
.stats-card-terre {
  backgroundColor: '#f5f0e8',
  border: '1px solid #e8dcc0',
  borderRadius: '8px',
  padding: '16px'
}

.stats-card-olive {
  backgroundColor: '#f0f4e8',
  border: '1px solid #d9e2c4',
  borderRadius: '8px',
  padding: '16px'
}

.stats-card-chene {
  backgroundColor: '#faf6f0',
  border: '1px solid #f0e6d2',
  borderRadius: '8px',
  padding: '16px'
}
```

### Typographie pour les encadrés
- **Titres :** `color: #000000` (noir pur), `fontSize: 14px`, `fontWeight: 600`
- **Montants :** `color: #000000` (noir pur), `fontSize: 20px`, `fontWeight: 700`
- **Détails :** `color: #333333` (gris foncé), `fontSize: 12px`, `fontWeight: 400`

## 🔐 Page de connexion

### Design rectangulaire horizontal
- **Dimensions :** 900×400px
- **Structure :** Deux colonnes égales (50/50) en flexbox
- **Image de fond :** URL Firebase forêt avec overlay noir 30%
- **Logo :** 96×96px avec ombre portée
- **Couleur principale :** Vert olive #6b7c3d

## 📁 Fichiers modifiés avec le thème

### Composants principaux
1. `frontend/src/components/AuthLayout.jsx` - Suppression contraintes largeur
2. `frontend/src/pages/auth/Login.jsx` - Design rectangulaire avec image
3. `frontend/src/pages/affaires/AffairesList.jsx` - Bouton "Nouvelle affaire"
4. `frontend/src/pages/affaires/AffaireDetails.jsx` - Bouton "Modifier l'affaire"

### Modals et sections
5. `frontend/src/components/modules/bdc/BdcModal.jsx` - Modal BDC standalone
6. `frontend/src/components/affaires/AffaireBdcSectionReal.jsx` - Modal BDC intégré
7. `frontend/src/components/modules/factures-achats/FactureAchatModal.jsx` - Modal factures
8. `frontend/src/components/modules/factures-achats/FactureAchatList.jsx` - Boutons factures
9. `frontend/src/components/modules/factures-achats/FactureAchatSection.jsx` - Encadrés factures

### CSS global
10. `frontend/src/index.css` - Styles forcés avec !important pour Mantine

## 🎯 Classes CSS spécifiques

### Pour forcer les styles Mantine
```css
/* Bouton Créer BDC */
.bdc-submit-button {
  background-color: #6b7c3d !important;
  color: #ffffff !important;
  border: none !important;
  font-size: 13px !important;
  padding: 8px 16px !important;
  border-radius: 6px !important;
  min-height: 36px !important;
}

/* ID unique pour bouton Annuler BDC */
#bouton-annuler-bdc-force-blanc {
  background-color: #ffffff !important;
  border: 1px solid #d1d5db !important;
  color: #374151 !important;
  /* ... autres propriétés */
}
```

## 🚨 Points d'attention

### Problèmes résolus
- **Deux modals BDC différents :** `BdcModal.jsx` (standalone) et `AffaireBdcSectionReal.jsx` (intégré)
- **Styles Mantine :** Nécessite `!important` et sélecteurs spécifiques
- **Cache navigateur :** Peut nécessiter un rechargement forcé (Ctrl+F5)

### Couleurs à éviter
- **❌ Marron #8b4513 :** Ancienne couleur remplacée par vert olive
- **❌ Violet/Purple :** Remplacé par le thème uniforme
- **❌ Dégradés colorés :** Remplacés par tons pastel épurés

## 📐 Tailwind Config

### Couleurs personnalisées ajoutées
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        olive: {
          600: '#6b7c3d',
          700: '#556533'
        }
      }
    }
  }
}
```

## 🎨 Philosophie du design

### Principes appliqués
1. **Épuré :** Suppression des icônes distrayantes
2. **Lisible :** Noir pur pour les textes importants
3. **Cohérent :** Une seule couleur principale (vert olive)
4. **Naturel :** Tons inspirés de la terre et de la nature
5. **Professionnel :** Design sobre et moderne

### Application systématique
- **Actions positives :** Toujours vert olive
- **Actions neutres/négatives :** Toujours blanc avec bordure grise
- **Informations :** Arrière-plans pastel sans surcharge visuelle
- **Typographie :** Noir pour la lisibilité maximale

---
*Dernière mise à jour : Janvier 2025*
*Thème appliqué à M.AI Gestion (ex-Entreprise Organiser)* 