# Règles de sécurité Firebase Storage

## Configuration requise dans la console Firebase

Allez dans la console Firebase > Storage > Rules et remplacez les règles par défaut par :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Règles pour les PDFs des BDC
    match /bdc/{bdcId}/{fileName} {
      // Permettre la lecture et l'écriture pour tous les utilisateurs authentifiés
      // TODO: Ajouter une authentification plus fine si nécessaire
      allow read, write: if true;
    }
    
    // Règles pour les PDFs des devis
    match /devis/{devisId}/{fileName} {
      // Permettre la lecture et l'écriture pour tous les utilisateurs authentifiés
      // TODO: Ajouter une authentification plus fine si nécessaire
      allow read, write: if true;
    }
    
    // Règle par défaut - refuser tout le reste
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Règles de sécurité recommandées (avec authentification)

Si vous souhaitez ajouter une authentification Firebase plus tard :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Règles pour les PDFs des BDC (avec authentification)
    match /bdc/{bdcId}/{fileName} {
      allow read, write: if request.auth != null;
    }
    
    // Règles pour les PDFs des devis (avec authentification)
    match /devis/{devisId}/{fileName} {
      allow read, write: if request.auth != null;
    }
    
    // Règle par défaut - refuser tout le reste
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Structure des fichiers dans Firebase Storage

```
entreprise-organiser.firebasestorage.app/
├── bdc/
│   ├── {bdcId1}/
│   │   └── {timestamp}_{filename}.pdf
│   ├── {bdcId2}/
│   │   └── {timestamp}_{filename}.pdf
│   └── ...
└── devis/
    ├── {devisId1}/
    │   └── {timestamp}_{filename}.pdf
    ├── {devisId2}/
    │   └── {timestamp}_{filename}.pdf
    └── ...
```

## Avantages de cette structure

1. **Organisation claire** : Chaque BDC/devis a son propre dossier
2. **Éviter les conflits** : Le timestamp évite les collisions de noms
3. **Sécurité** : Règles granulaires par type de document
4. **Évolutivité** : Facile d'ajouter d'autres types de documents

## Configuration dans la console Firebase

1. Allez sur https://console.firebase.google.com/
2. Sélectionnez votre projet "entreprise-organiser"
3. Allez dans "Storage" dans le menu de gauche
4. Cliquez sur l'onglet "Rules"
5. Remplacez les règles par celles ci-dessus
6. Cliquez sur "Publier"

## Test des règles

Vous pouvez tester les règles directement dans la console Firebase :
1. Allez dans l'onglet "Rules"
2. Cliquez sur "Simulateur de règles"
3. Testez différents scénarios d'accès

## Notes importantes

- Les règles actuelles permettent l'accès à tous (temporaire)
- Pour la production, il est recommandé d'ajouter une authentification
- Les fichiers sont organisés par type (bdc/devis) puis par ID
- Chaque fichier a un timestamp pour éviter les conflusions
