# 🧹 Plan de Nettoyage du Module Estimation Intelligente

## 📅 Date : 15/07/2025

### ❌ Fichiers à SUPPRIMER (non utilisés)

1. **`DatesPlanificationModal.jsx`**
   - **Statut** : NON UTILISÉ - Aucun import dans le code
   - **Taille** : 276 lignes / 9.1KB
   - **Description** : Modal de planification orphelin
   - **Action** : À SUPPRIMER après tests

### ⚠️ Fichiers à OPTIMISER (partiellement utilisés)

1. **`utils/planningSync.js`** (289 lignes / 8.5KB)
   - **Utilisé** : 2/8 fonctions
     - ✅ `getEstimationAffaire`
     - ✅ `clearPlanningEstimation`
   - **Non utilisé** : 
     - ❌ `syncWithPlanning`
     - ❌ `getEstimationsActives`
     - ❌ `isCaseEstimation`
     - ❌ `getCouleurCase`
     - ❌ `initPlanningListeners`
     - ❌ `usePlanningEstimations`
   - **Action** : Extraire les 2 fonctions utiles

2. **`utils/calculEstimation.js`** (260 lignes / 8.7KB)
   - **Utilisé** : 1/8 fonctions
     - ✅ `formatEuros` (uniquement dans BlocMontant)
   - **Non utilisé** : 7 autres fonctions
   - **Action** : Déplacer `formatEuros` ailleurs

3. **`utils/couleursPastel.js`** (313 lignes / 8.4KB)
   - **Utilisé** : 2/15 fonctions
     - ✅ `getCouleursAffaire`
     - ✅ `getCouleurPastelAffaire` (via planningSync)
   - **Non utilisé** : 13 autres fonctions
   - **Action** : Extraire les 2 fonctions utiles

### ✅ Fichiers ESSENTIELS (à conserver)

- `AffaireEstimation.jsx` - Composant principal
- `EstimationCartouche.jsx` - Cartouche d'information
- `blocs/BlocMontant.jsx` - Saisie montant
- `blocs/BlocTemps.jsx` - Gestion temps
- `blocs/BlocEquipe.jsx` - Gestion équipe
- `blocs/BlocAchats.jsx` - Gestion achats
- `blocs/BlocAffectations.jsx` - Affichage affectations
- `blocs/CalendrierUnifie.jsx` - Calendrier
- `blocs/CamembertEstimation.jsx` - Graphique

### 📊 Impact du nettoyage

- **Suppression immédiate** : 276 lignes / 9.1KB
- **Optimisation potentielle** : ~750 lignes / ~20KB
- **Gain total** : ~1000 lignes / ~30KB

### 🚀 Plan d'action

1. **Phase 1** : Marquer les fichiers avec commentaires WARNING
2. **Phase 2** : Tester l'application pendant 24h
3. **Phase 3** : Si pas d'erreurs, procéder au nettoyage
4. **Phase 4** : Créer un fichier utilitaire minimal avec les fonctions utiles 