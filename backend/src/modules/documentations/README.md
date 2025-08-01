# Module Documentations - Backend

Module de gestion des documents et fichiers associés aux affaires.

## Structure prévue

```
documentations/
├── documentations.controller.ts    # Contrôleur principal
├── documentations.service.ts       # Service métier
├── documentations.module.ts        # Module NestJS
├── dto/                           # Data Transfer Objects
│   ├── create-documentation.dto.ts
│   ├── update-documentation.dto.ts
│   └── search-documentation.dto.ts
├── entities/                      # Entités (si nécessaire)
│   └── documentation.entity.ts
└── storage/                       # Services de stockage
    ├── storage.service.ts         # Interface abstraite
    ├── local-storage.service.ts   # Stockage local
    └── cloud-storage.service.ts   # Stockage cloud (S3, Azure)
```

## Endpoints prévus

### Documents par affaire
- `GET /documentations/affaire/:affaireId` - Liste des documents d'une affaire
- `GET /documentations/affaire/:affaireId/stats` - Statistiques des documents
- `GET /documentations/affaire/:affaireId/search` - Recherche de documents

### CRUD de base
- `GET /documentations/:id` - Obtenir un document
- `POST /documentations/affaire/:affaireId` - Uploader un document
- `PATCH /documentations/:id` - Mettre à jour un document
- `DELETE /documentations/:id` - Supprimer un document

### Actions spéciales
- `GET /documentations/:id/download` - Télécharger un document
- `POST /documentations/:id/share` - Créer un lien de partage
- `GET /documentations/:id/versions` - Historique des versions
- `POST /documentations/bulk-download` - Téléchargement multiple

## Configuration requise

### Variables d'environnement
```env
# Stockage local
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=104857600  # 100MB
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,png,zip,dwg

# Stockage cloud (optionnel)
STORAGE_TYPE=local  # local | s3 | azure
AWS_S3_BUCKET=
AWS_S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Sécurité
ENABLE_VIRUS_SCAN=false
VIRUS_SCAN_API_KEY=
```

## Sécurité

1. **Validation des fichiers**
   - Type MIME
   - Extension
   - Taille maximale
   - Scan antivirus (optionnel)

2. **Permissions**
   - Seuls les utilisateurs autorisés peuvent uploader
   - Respect des permissions sur les affaires
   - Logs d'accès

3. **Stockage sécurisé**
   - Noms de fichiers aléatoires
   - Pas d'accès direct aux fichiers
   - Chiffrement pour documents sensibles

## Notes d'implémentation

- Utiliser Multer pour la gestion des uploads
- Implémenter une stratégie de nommage des fichiers
- Prévoir la gestion des gros fichiers (streaming)
- Implémenter un système de cache pour les métadonnées
- Prévoir une tâche CRON pour nettoyer les fichiers orphelins 