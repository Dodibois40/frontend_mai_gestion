-- CreateTable
CREATE TABLE "devis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "montantHt" REAL NOT NULL,
    "dateCreation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateValidite" DATETIME NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE_VALIDATION',
    "description" TEXT,
    "commentaire" TEXT,
    "affaireId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dateUpload" DATETIME,
    "fichierPdf" TEXT,
    "nomFichier" TEXT,
    "tailleFichier" INTEGER,
    CONSTRAINT "devis_affaireId_fkey" FOREIGN KEY ("affaireId") REFERENCES "affaires" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "affaires" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "adresse" TEXT,
    "dateCreation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateCloturePrevue" DATETIME,
    "objectifCaHt" REAL NOT NULL,
    "objectifAchatHt" REAL NOT NULL,
    "objectifHeuresFab" REAL NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'PLANIFIEE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "achatReelHt" REAL NOT NULL DEFAULT 0,
    "caReelHt" REAL NOT NULL DEFAULT 0,
    "heuresReellesFab" REAL NOT NULL DEFAULT 0,
    "heuresReellesPose" REAL NOT NULL DEFAULT 0,
    "objectifHeuresPose" REAL NOT NULL DEFAULT 0,
    "objectifHeuresSer" REAL NOT NULL DEFAULT 0,
    "avancementPourcentage" REAL NOT NULL DEFAULT 0,
    "codePostal" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "pays" TEXT,
    "rue" TEXT,
    "ville" TEXT,
    "dateCommencement" DATETIME,
    "objectifFraisGeneraux" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "categories_achat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "pourcentageFg" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "estimations_achat_categorie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affaireId" TEXT NOT NULL,
    "categorieId" TEXT NOT NULL,
    "montantEstime" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "estimations_achat_categorie_affaireId_fkey" FOREIGN KEY ("affaireId") REFERENCES "affaires" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "estimations_achat_categorie_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "categories_achat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "estimations_achats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affaireId" TEXT NOT NULL,
    "pourcentageBudgetAchats" REAL NOT NULL DEFAULT 30,
    "montantEstimationAchats" REAL NOT NULL DEFAULT 0,
    "totalPourcentage" REAL NOT NULL DEFAULT 0,
    "categoriesActives" JSONB NOT NULL DEFAULT [],
    "dateCreation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateModification" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "estimations_achats_affaireId_fkey" FOREIGN KEY ("affaireId") REFERENCES "affaires" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bdc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "montantHt" REAL NOT NULL,
    "dateBdc" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateReception" DATETIME,
    "commentaire" TEXT,
    "affaireId" TEXT NOT NULL,
    "categorieId" TEXT NOT NULL,
    "fournisseur" TEXT NOT NULL,
    "montantFg" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "dateUpload" DATETIME,
    "fichierPdf" TEXT,
    "nomFichier" TEXT,
    "tailleFichier" INTEGER,
    "firebaseDownloadUrl" TEXT,
    "firebaseStoragePath" TEXT,
    "dateLivraison" DATETIME,
    CONSTRAINT "bdc_affaireId_fkey" FOREIGN KEY ("affaireId") REFERENCES "affaires" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bdc_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "categories_achat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pointages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "datePointage" DATETIME NOT NULL,
    "nbHeures" REAL NOT NULL,
    "commentaire" TEXT,
    "typeHeure" TEXT NOT NULL,
    "affaireId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "coutCalcule" REAL NOT NULL DEFAULT 0,
    "tacheId" TEXT,
    CONSTRAINT "pointages_affaireId_fkey" FOREIGN KEY ("affaireId") REFERENCES "affaires" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pointages_tacheId_fkey" FOREIGN KEY ("tacheId") REFERENCES "taches_affectation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "pointages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "parametres_globaux" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "supprime" BOOLEAN NOT NULL DEFAULT false,
    "supprimeLe" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dateEmbauche" DATETIME,
    "tarifHoraireBase" REAL NOT NULL DEFAULT 0,
    "telephone" TEXT
);

-- CreateTable
CREATE TABLE "fournisseurs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "codeClient" TEXT,
    "enCompte" BOOLEAN NOT NULL DEFAULT false,
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "contact" TEXT,
    "commentaire" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categorie" TEXT
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "unite" TEXT NOT NULL,
    "prixUnitaire" REAL NOT NULL,
    "stockActuel" REAL NOT NULL DEFAULT 0,
    "stockMinimum" REAL NOT NULL DEFAULT 0,
    "stockMaximum" REAL,
    "emplacement" TEXT,
    "fournisseur" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "mouvements_stock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "quantite" REAL NOT NULL,
    "prixUnitaire" REAL,
    "motif" TEXT,
    "reference" TEXT,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "mouvements_stock_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mouvements_stock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "achats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "numeroFacture" TEXT NOT NULL,
    "montantHt" REAL NOT NULL,
    "montantTtc" REAL NOT NULL,
    "dateFacture" DATETIME NOT NULL,
    "dateReception" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datePaiement" DATETIME,
    "statut" TEXT NOT NULL DEFAULT 'RECU',
    "commentaire" TEXT,
    "affaireId" TEXT NOT NULL,
    "categorieId" TEXT NOT NULL,
    "fournisseur" TEXT NOT NULL,
    "bdcId" TEXT,
    "montantFg" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dateUpload" DATETIME,
    "fichierPdf" TEXT,
    "nomFichier" TEXT,
    "tailleFichier" INTEGER,
    "firebaseDownloadUrl" TEXT,
    "firebaseStoragePath" TEXT,
    CONSTRAINT "achats_affaireId_fkey" FOREIGN KEY ("affaireId") REFERENCES "affaires" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "achats_bdcId_fkey" FOREIGN KEY ("bdcId") REFERENCES "bdc" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "achats_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "categories_achat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "phases_chantier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "typePhase" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'PLANIFIEE',
    "dateDebutPrevue" DATETIME,
    "dateFinPrevue" DATETIME,
    "dateDebutReelle" DATETIME,
    "dateFinReelle" DATETIME,
    "tempsEstimeH" REAL NOT NULL DEFAULT 0,
    "coutEstime" REAL NOT NULL DEFAULT 0,
    "tempsReelH" REAL NOT NULL DEFAULT 0,
    "coutReel" REAL NOT NULL DEFAULT 0,
    "ordre" INTEGER NOT NULL DEFAULT 1,
    "affaireId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tauxHoraire" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "phases_chantier_affaireId_fkey" FOREIGN KEY ("affaireId") REFERENCES "affaires" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "taches_affectation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ASSIGNEE',
    "dateAffectation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDebutPrevue" DATETIME,
    "dateFinPrevue" DATETIME,
    "dateDebutReelle" DATETIME,
    "dateFinReelle" DATETIME,
    "tempsEstimeH" REAL NOT NULL DEFAULT 0,
    "coutEstime" REAL NOT NULL DEFAULT 0,
    "tempsReelH" REAL NOT NULL DEFAULT 0,
    "coutReel" REAL NOT NULL DEFAULT 0,
    "phaseId" TEXT NOT NULL,
    "ouvrierAffecteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "taches_affectation_ouvrierAffecteId_fkey" FOREIGN KEY ("ouvrierAffecteId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "taches_affectation_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "phases_chantier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "devis_numero_key" ON "devis"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "affaires_numero_key" ON "affaires"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "categories_achat_code_key" ON "categories_achat"("code");

-- CreateIndex
CREATE UNIQUE INDEX "estimations_achat_categorie_affaireId_categorieId_key" ON "estimations_achat_categorie"("affaireId", "categorieId");

-- CreateIndex
CREATE UNIQUE INDEX "estimations_achats_affaireId_key" ON "estimations_achats"("affaireId");

-- CreateIndex
CREATE UNIQUE INDEX "bdc_numero_key" ON "bdc"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "parametres_globaux_cle_key" ON "parametres_globaux"("cle");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "fournisseurs_nom_key" ON "fournisseurs"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "articles_code_key" ON "articles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "achats_numero_key" ON "achats"("numero");
