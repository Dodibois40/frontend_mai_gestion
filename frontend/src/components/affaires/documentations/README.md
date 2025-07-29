# Module Documentations d'Affaires

Ce module gère tous les documents et fichiers liés à une affaire spécifique.

## Structure du module

```
documentations/
├── AffaireDocumentations.jsx      # Composant principal
├── components/                    # Sous-composants (à créer)
│   ├── DocumentCard.jsx          # Carte d'affichage d'un document
│   ├── DocumentUploader.jsx      # Composant d'upload
│   ├── DocumentViewer.jsx        # Visualiseur de documents
│   └── DocumentFilters.jsx       # Filtres et recherche
├── hooks/                        # Hooks personnalisés (à créer)
│   └── useDocuments.js          # Hook pour gérer les documents
└── index.js                     # Export principal
```

## Fonctionnalités prévues

### Phase 1 - Base (Actuelle)
- ✅ Interface de base avec liste de documents
- ✅ Catégorisation des documents avec sous-catégories
- ✅ Recherche et filtres
- ✅ Statistiques de base
- ✅ Actions simulées (upload, download, delete)
- ✅ Affichage en colonnes pour les catégories structurées

### Phase 2 - Intégration Backend (À venir)
- [ ] API REST pour CRUD documents
- [ ] Upload réel de fichiers
- [ ] Téléchargement de documents
- [ ] Suppression sécurisée
- [ ] Gestion des permissions

### Phase 3 - Fonctionnalités avancées
- [ ] Prévisualisation de documents (PDF, images)
- [ ] Versionning des documents
- [ ] Commentaires sur les documents
- [ ] Partage de documents par email
- [ ] Génération de liens de partage temporaires
- [ ] OCR pour recherche dans le contenu

### Phase 4 - Intégrations
- [ ] Intégration avec stockage cloud (S3, Azure Blob)
- [ ] Signature électronique
- [ ] Génération automatique de documents depuis templates
- [ ] Export en ZIP de tous les documents
- [ ] Archivage automatique

## Types de documents supportés

- **Documents texte** : PDF, DOC, DOCX, TXT
- **Tableurs** : XLS, XLSX, CSV
- **Images** : JPG, PNG, GIF, BMP
- **Archives** : ZIP, RAR, 7Z
- **Plans** : DWG, DXF, SVG
- **Autres** : Tous autres formats

## Catégories et sous-catégories

1. **Financier** - Documents financiers
   - Devis
   - Factures
   - Avoirs

2. **Plans** - Documents techniques
   - Plan architecte
   - Plan technique

3. **Photos** - Photos et images du projet

4. **Autres documents** - Tout autre type de document

## Affichage

- **Financier** : Affichage en 3 colonnes (Devis, Factures, Avoirs)
- **Plans** : Affichage en 2 colonnes (Plan architecte, Plan technique)
- **Photos** et **Autres documents** : Affichage en grille normale

## Sécurité

- Validation des types de fichiers
- Limite de taille par fichier (configurable)
- Scan antivirus (à implémenter)
- Chiffrement des documents sensibles
- Logs d'accès et de modifications

## Notes de développement

- Le composant utilise actuellement des données de démonstration
- L'intégration backend nécessitera la création d'une table `documentations` dans la BDD
- Prévoir un système de stockage externe pour les fichiers volumineux
- Implémenter une politique de rétention des documents 