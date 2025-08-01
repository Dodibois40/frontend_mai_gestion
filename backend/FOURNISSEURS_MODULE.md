# Module Fournisseurs

## Description

Le module fournisseurs permet de gérer une base de données centralisée des fournisseurs de l'entreprise avec toutes leurs informations de contact et de facturation.

## Fonctionnalités

### Champs disponibles
- **Nom** (obligatoire) : Nom du fournisseur
- **Code client** : Votre code client chez ce fournisseur
- **En compte** : Indique si vous êtes en compte avec ce fournisseur
- **Adresse** : Adresse complète du fournisseur
- **Téléphone** : Numéro de téléphone
- **Email** : Adresse email
- **Contact** : Nom de la personne de contact
- **Commentaire** : Notes ou informations complémentaires
- **Actif** : Statut actif/inactif

### API Endpoints

#### Fournisseurs
- `GET /api/fournisseurs` - Liste paginée avec filtres
- `GET /api/fournisseurs/active` - Liste des fournisseurs actifs
- `GET /api/fournisseurs/stats` - Statistiques des fournisseurs
- `GET /api/fournisseurs/:id` - Détails d'un fournisseur
- `POST /api/fournisseurs` - Créer un nouveau fournisseur
- `PATCH /api/fournisseurs/:id` - Modifier un fournisseur
- `DELETE /api/fournisseurs/:id` - Désactiver un fournisseur (soft delete)
- `PATCH /api/fournisseurs/:id/reactivate` - Réactiver un fournisseur

#### Paramètres de filtrage
- `search` : Recherche par nom, contact ou email
- `actif` : Filtrer par statut actif (true/false)
- `enCompte` : Filtrer par fournisseurs en compte (true/false)
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 10)

## Frontend

### Pages disponibles
- `/fournisseurs` - Liste des fournisseurs avec filtres et pagination
- `/fournisseurs/nouveau` - Formulaire de création
- `/fournisseurs/:id/modifier` - Formulaire de modification

### Composants
- `FournisseursList` - Liste avec tableau et filtres
- `FournisseurForm` - Formulaire de création/modification
- `FournisseurSelect` - Composant Select personnalisé avec informations détaillées

### Services
- `fournisseurService.js` - Service pour les appels API

## Intégration avec les autres modules

Le module fournisseur s'intègre avec :
- **Achats** : Sélection du fournisseur lors de la création d'un achat
- **BDC** : Sélection du fournisseur lors de la création d'un bon de commande
- **Articles** : Référence du fournisseur principal pour chaque article

## Base de données

### Table `fournisseurs`
```sql
CREATE TABLE fournisseurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR UNIQUE NOT NULL,
  code_client VARCHAR,
  en_compte BOOLEAN DEFAULT false,
  adresse TEXT,
  telephone VARCHAR,
  email VARCHAR,
  contact VARCHAR,
  commentaire TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Données de test

Le script `prisma/seed-fournisseurs.ts` crée 5 fournisseurs de test :
1. Menuiseries Dupont SARL (en compte)
2. Visserie Pro (en compte)
3. Verres & Cristaux SA
4. Outillage Moderne
5. Profilés Alu Express (en compte)

## Utilisation

### Créer un fournisseur
1. Aller sur `/fournisseurs`
2. Cliquer sur "Nouveau fournisseur"
3. Remplir le formulaire
4. Cliquer sur "Créer"

### Modifier un fournisseur
1. Dans la liste, cliquer sur l'icône crayon
2. Modifier les informations
3. Cliquer sur "Modifier"

### Désactiver un fournisseur
1. Dans la liste, cliquer sur l'icône poubelle
2. Confirmer la désactivation

### Réactiver un fournisseur
1. Filtrer par "Inactifs"
2. Cliquer sur l'icône de validation verte

## Navigation

Le module est accessible via la sidebar dans la section "Gestion" → "Fournisseurs".

## Permissions

Toutes les opérations nécessitent une authentification JWT valide. 