-- Migration pour la liaison estimation vs réel
-- Étape 7 : Comparaison estimation/réalisation

-- Table principale pour stocker les estimations structurées d'une affaire
CREATE TABLE "estimations_affaire" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affaireId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "statut" TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, VALIDEE, ARCHIVEE
    "dateCreation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateValidation" DATETIME,
    "validePar" TEXT,
    "commentaire" TEXT,
    
    -- Données d'estimation globales
    "montantTotalEstime" REAL NOT NULL DEFAULT 0,
    "dureeTotaleEstimee" INTEGER NOT NULL DEFAULT 0, -- en demi-journées
    "coutMainOeuvreEstime" REAL NOT NULL DEFAULT 0,
    "coutAchatsEstime" REAL NOT NULL DEFAULT 0,
    "coutFraisGenerauxEstime" REAL NOT NULL DEFAULT 0,
    "margeEstimee" REAL NOT NULL DEFAULT 0,
    
    -- Répartition temporelle estimée
    "demiJourneesFabricationEstimees" INTEGER NOT NULL DEFAULT 0,
    "demiJourneesPoseEstimees" INTEGER NOT NULL DEFAULT 0,
    "nombrePersonnesEstime" INTEGER NOT NULL DEFAULT 2,
    "tauxHoraireMoyenEstime" REAL NOT NULL DEFAULT 85,
    
    -- Dates estimées
    "dateCommencementEstimee" DATETIME,
    "dateReceptionEstimee" DATETIME,
    
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("affaireId") REFERENCES "affaires" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("validePar") REFERENCES "users" ("id") ON DELETE SET NULL
);

-- Table pour les détails d'estimation par catégorie
CREATE TABLE "estimations_detail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimationId" TEXT NOT NULL,
    "categorie" TEXT NOT NULL, -- MAIN_OEUVRE, ACHATS, FRAIS_GENERAUX, MARGE
    "sousCategorie" TEXT, -- FAB, POSE, SER pour main d'oeuvre / code catégorie pour achats
    "libelle" TEXT NOT NULL,
    "quantiteEstimee" REAL NOT NULL DEFAULT 0,
    "uniteQuantite" TEXT, -- h, demi-j, €, unité, etc.
    "prixUnitaireEstime" REAL NOT NULL DEFAULT 0,
    "montantEstime" REAL NOT NULL DEFAULT 0,
    "commentaire" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 1,
    
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("estimationId") REFERENCES "estimations_affaire" ("id") ON DELETE CASCADE
);

-- Table de comparaison estimation vs réalisation
CREATE TABLE "comparaisons_estimation_reel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affaireId" TEXT NOT NULL,
    "estimationId" TEXT NOT NULL,
    "dateComparaison" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typeComparaison" TEXT NOT NULL DEFAULT 'SNAPSHOT', -- SNAPSHOT, TEMPS_REEL, FINAL
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS', -- EN_COURS, TERMINEE
    
    -- Données réelles au moment de la comparaison
    "montantReelCalcule" REAL NOT NULL DEFAULT 0,
    "dureeTotaleReelle" INTEGER NOT NULL DEFAULT 0, -- en demi-journées
    "coutMainOeuvreReel" REAL NOT NULL DEFAULT 0,
    "coutAchatsReel" REAL NOT NULL DEFAULT 0,
    "coutFraisGenerauxReel" REAL NOT NULL DEFAULT 0,
    "margeReelle" REAL NOT NULL DEFAULT 0,
    
    -- Répartition temporelle réelle
    "demiJourneesFabricationReelles" INTEGER NOT NULL DEFAULT 0,
    "demiJourneesPoseReelles" INTEGER NOT NULL DEFAULT 0,
    "nombrePersonnesReel" INTEGER NOT NULL DEFAULT 0,
    "tauxHoraireMoyenReel" REAL NOT NULL DEFAULT 0,
    
    -- Dates réelles
    "dateCommencementReelle" DATETIME,
    "dateReceptionReelle" DATETIME,
    
    -- Calculs d'écarts (en %)
    "ecartMontantPourcentage" REAL NOT NULL DEFAULT 0,
    "ecartDureePourcentage" REAL NOT NULL DEFAULT 0,
    "ecartMainOeuvrePourcentage" REAL NOT NULL DEFAULT 0,
    "ecartAchatsPourcentage" REAL NOT NULL DEFAULT 0,
    "ecartFraisGenerauxPourcentage" REAL NOT NULL DEFAULT 0,
    "ecartMargePourcentage" REAL NOT NULL DEFAULT 0,
    
    -- Métadonnées
    "calculePar" TEXT, -- ID utilisateur qui a déclenché le calcul
    "commentaire" TEXT,
    "donneesCalcul" TEXT, -- JSON avec détails du calcul
    
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("affaireId") REFERENCES "affaires" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("estimationId") REFERENCES "estimations_affaire" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("calculePar") REFERENCES "users" ("id") ON DELETE SET NULL
);

-- Table pour les détails des écarts par catégorie
CREATE TABLE "ecarts_detail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "comparaisonId" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "sousCategorie" TEXT,
    "libelle" TEXT NOT NULL,
    "valeurEstimee" REAL NOT NULL DEFAULT 0,
    "valeurReelle" REAL NOT NULL DEFAULT 0,
    "ecartAbsolu" REAL NOT NULL DEFAULT 0,
    "ecartPourcentage" REAL NOT NULL DEFAULT 0,
    "uniteValeur" TEXT,
    "commentaire" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 1,
    
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("comparaisonId") REFERENCES "comparaisons_estimation_reel" ("id") ON DELETE CASCADE
);

-- Table d'historique des ajustements d'estimation
CREATE TABLE "ajustements_estimation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimationId" TEXT NOT NULL,
    "typeAjustement" TEXT NOT NULL, -- CORRECTION, AVENANT, REEVALUATION
    "categorieAjustee" TEXT NOT NULL,
    "ancienneValeur" REAL NOT NULL,
    "nouvelleValeur" REAL NOT NULL,
    "motifAjustement" TEXT NOT NULL,
    "dateAjustement" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ajustePar" TEXT NOT NULL,
    "valide" BOOLEAN NOT NULL DEFAULT FALSE,
    "dateValidation" DATETIME,
    "validePar" TEXT,
    
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("estimationId") REFERENCES "estimations_affaire" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("ajustePar") REFERENCES "users" ("id") ON DELETE RESTRICT,
    FOREIGN KEY ("validePar") REFERENCES "users" ("id") ON DELETE SET NULL
);

-- Index pour optimiser les requêtes
CREATE INDEX "idx_estimations_affaire_affaireId" ON "estimations_affaire" ("affaireId");
CREATE INDEX "idx_estimations_affaire_statut" ON "estimations_affaire" ("statut");
CREATE INDEX "idx_estimations_detail_estimationId" ON "estimations_detail" ("estimationId");
CREATE INDEX "idx_estimations_detail_categorie" ON "estimations_detail" ("categorie");
CREATE INDEX "idx_comparaisons_affaireId" ON "comparaisons_estimation_reel" ("affaireId");
CREATE INDEX "idx_comparaisons_estimationId" ON "comparaisons_estimation_reel" ("estimationId");
CREATE INDEX "idx_comparaisons_date" ON "comparaisons_estimation_reel" ("dateComparaison");
CREATE INDEX "idx_ecarts_detail_comparaisonId" ON "ecarts_detail" ("comparaisonId");
CREATE INDEX "idx_ajustements_estimationId" ON "ajustements_estimation" ("estimationId");
CREATE INDEX "idx_ajustements_date" ON "ajustements_estimation" ("dateAjustement"); 