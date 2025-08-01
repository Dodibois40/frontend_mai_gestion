# Guide d'Upload de Documents

## Fonctionnalités actuelles

### 1. Modal d'upload
- **Drag & Drop** : Glissez-déposez vos fichiers directement
- **Sélection manuelle** : Cliquez pour parcourir vos fichiers
- **Limite de taille** : 100 MB maximum par fichier

### 2. Organisation des documents
- **Nom personnalisé** : Donnez un nom significatif à vos documents
- **Catégorisation** : 
  - Financier (Devis, Factures, Avoirs)
  - Plans (Plan architecte, Plan technique)
  - Photos
  - Autres documents
- **Description** : Ajoutez des notes ou commentaires (optionnel)

### 3. Validation des fichiers
- **Types acceptés par catégorie** :
  - Financier : PDF, DOC, DOCX, XLS, XLSX
  - Plans : PDF, DWG, DXF, SVG, JPG, PNG
  - Photos : JPG, JPEG, PNG, GIF, BMP, ZIP
  - Autres : Tous types

### 4. Workflow d'upload
1. Cliquez sur "Ajouter un document"
2. Sélectionnez ou glissez votre fichier
3. Donnez un nom au document
4. Choisissez la catégorie
5. Sélectionnez la sous-catégorie (si applicable)
6. Ajoutez une description (optionnel)
7. Cliquez sur "Uploader"

## État actuel

- ✅ Interface complète d'upload
- ✅ Validation côté client
- ✅ Ajout local des documents
- ✅ Prévisualisation des informations
- ⏳ Upload réel vers le serveur (à implémenter)
- ⏳ Stockage des fichiers (à implémenter)

## Prochaines étapes

### Backend (à développer)
1. Créer le module NestJS `documentations`
2. Implémenter le contrôleur avec Multer pour l'upload
3. Configurer le stockage (local ou cloud)
4. Créer les endpoints :
   - POST `/documentations/affaire/:affaireId` - Upload
   - GET `/documentations/:id/download` - Téléchargement
   - DELETE `/documentations/:id` - Suppression

### Frontend (améliorations)
1. Intégrer l'upload réel avec FormData
2. Ajouter une barre de progression
3. Gérer les erreurs d'upload
4. Implémenter la prévisualisation (PDF, images)
5. Ajouter le drag & drop multiple

### Sécurité
1. Vérification antivirus
2. Validation MIME type côté serveur
3. Génération de noms de fichiers sécurisés
4. Gestion des permissions par utilisateur

## Code d'exemple pour l'upload réel

```javascript
// Dans DocumentUploadModal.jsx
const handleSubmit = async () => {
  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('nom', documentName);
  formData.append('categorie', selectedCategory);
  formData.append('sousCategorie', selectedSubCategory);
  formData.append('description', description);

  try {
    const response = await documentationsService.uploadDocument(affaireId, formData);
    toast.success('Document uploadé avec succès');
    onUpload(response.data);
  } catch (error) {
    toast.error('Erreur lors de l\'upload');
    console.error(error);
  }
};
``` 