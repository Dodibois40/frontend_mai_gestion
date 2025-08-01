-- CreateTable
CREATE TABLE "pointage_heures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "datePointage" DATETIME NOT NULL,
    "heuresTravaillees" REAL NOT NULL,
    "typePresence" TEXT NOT NULL,
    "lieuTravail" TEXT NOT NULL,
    "heureDebut" TEXT,
    "heureFin" TEXT,
    "tempsPauseMinutes" INTEGER DEFAULT 0,
    "commentaire" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pointage_heures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ajustements_estimation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimationId" TEXT NOT NULL,
    "typeAjustement" TEXT NOT NULL,
    "categorieAjustee" TEXT NOT NULL,
    "ancienneValeur" REAL NOT NULL,
    "nouvelleValeur" REAL NOT NULL,
    "motifAjustement" TEXT NOT NULL,
    "dateAjustement" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ajustePar" TEXT NOT NULL,
    "valide" BOOLEAN NOT NULL DEFAULT false,
    "dateValidation" DATETIME,
    "validePar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ajustements_estimation_estimationId_fkey" FOREIGN KEY ("estimationId") REFERENCES "estimations_affaire" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ajustements_estimation_ajustePar_fkey" FOREIGN KEY ("ajustePar") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ajustements_estimation_validePar_fkey" FOREIGN KEY ("validePar") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ajustements_estimation" ("ajustePar", "ancienneValeur", "categorieAjustee", "createdAt", "dateAjustement", "dateValidation", "estimationId", "id", "motifAjustement", "nouvelleValeur", "typeAjustement", "valide", "validePar") SELECT "ajustePar", "ancienneValeur", "categorieAjustee", "createdAt", "dateAjustement", "dateValidation", "estimationId", "id", "motifAjustement", "nouvelleValeur", "typeAjustement", "valide", "validePar" FROM "ajustements_estimation";
DROP TABLE "ajustements_estimation";
ALTER TABLE "new_ajustements_estimation" RENAME TO "ajustements_estimation";
CREATE TABLE "new_comparaisons_estimation_reel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affaireId" TEXT NOT NULL,
    "estimationId" TEXT NOT NULL,
    "dateComparaison" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typeComparaison" TEXT NOT NULL DEFAULT 'SNAPSHOT',
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "montantReelCalcule" REAL NOT NULL DEFAULT 0,
    "dureeTotaleReelle" INTEGER NOT NULL DEFAULT 0,
    "coutMainOeuvreReel" REAL NOT NULL DEFAULT 0,
    "coutAchatsReel" REAL NOT NULL DEFAULT 0,
    "coutFraisGenerauxReel" REAL NOT NULL DEFAULT 0,
    "margeReelle" REAL NOT NULL DEFAULT 0,
    "demiJourneesFabricationReelles" INTEGER NOT NULL DEFAULT 0,
    "demiJourneesPoseReelles" INTEGER NOT NULL DEFAULT 0,
    "nombrePersonnesReel" INTEGER NOT NULL DEFAULT 0,
    "tauxHoraireMoyenReel" REAL NOT NULL DEFAULT 0,
    "dateCommencementReelle" DATETIME,
    "dateReceptionReelle" DATETIME,
    "ecartMontantPourcentage" REAL NOT NULL DEFAULT 0,
    "ecartDureePourcentage" REAL NOT NULL DEFAULT 0,
    "ecartMainOeuvrePourcentage" REAL NOT NULL DEFAULT 0,
    "ecartAchatsPourcentage" REAL NOT NULL DEFAULT 0,
    "ecartFraisGenerauxPourcentage" REAL NOT NULL DEFAULT 0,
    "ecartMargePourcentage" REAL NOT NULL DEFAULT 0,
    "calculePar" TEXT,
    "commentaire" TEXT,
    "donneesCalcul" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "comparaisons_estimation_reel_affaireId_fkey" FOREIGN KEY ("affaireId") REFERENCES "affaires" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comparaisons_estimation_reel_estimationId_fkey" FOREIGN KEY ("estimationId") REFERENCES "estimations_affaire" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comparaisons_estimation_reel_calculePar_fkey" FOREIGN KEY ("calculePar") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_comparaisons_estimation_reel" ("affaireId", "calculePar", "commentaire", "coutAchatsReel", "coutFraisGenerauxReel", "coutMainOeuvreReel", "createdAt", "dateCommencementReelle", "dateComparaison", "dateReceptionReelle", "demiJourneesFabricationReelles", "demiJourneesPoseReelles", "donneesCalcul", "dureeTotaleReelle", "ecartAchatsPourcentage", "ecartDureePourcentage", "ecartFraisGenerauxPourcentage", "ecartMainOeuvrePourcentage", "ecartMargePourcentage", "ecartMontantPourcentage", "estimationId", "id", "margeReelle", "montantReelCalcule", "nombrePersonnesReel", "statut", "tauxHoraireMoyenReel", "typeComparaison", "updatedAt") SELECT "affaireId", "calculePar", "commentaire", "coutAchatsReel", "coutFraisGenerauxReel", "coutMainOeuvreReel", "createdAt", "dateCommencementReelle", "dateComparaison", "dateReceptionReelle", "demiJourneesFabricationReelles", "demiJourneesPoseReelles", "donneesCalcul", "dureeTotaleReelle", "ecartAchatsPourcentage", "ecartDureePourcentage", "ecartFraisGenerauxPourcentage", "ecartMainOeuvrePourcentage", "ecartMargePourcentage", "ecartMontantPourcentage", "estimationId", "id", "margeReelle", "montantReelCalcule", "nombrePersonnesReel", "statut", "tauxHoraireMoyenReel", "typeComparaison", "updatedAt" FROM "comparaisons_estimation_reel";
DROP TABLE "comparaisons_estimation_reel";
ALTER TABLE "new_comparaisons_estimation_reel" RENAME TO "comparaisons_estimation_reel";
CREATE TABLE "new_ecarts_detail" (
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
    CONSTRAINT "ecarts_detail_comparaisonId_fkey" FOREIGN KEY ("comparaisonId") REFERENCES "comparaisons_estimation_reel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ecarts_detail" ("categorie", "commentaire", "comparaisonId", "createdAt", "ecartAbsolu", "ecartPourcentage", "id", "libelle", "ordre", "sousCategorie", "uniteValeur", "valeurEstimee", "valeurReelle") SELECT "categorie", "commentaire", "comparaisonId", "createdAt", "ecartAbsolu", "ecartPourcentage", "id", "libelle", "ordre", "sousCategorie", "uniteValeur", "valeurEstimee", "valeurReelle" FROM "ecarts_detail";
DROP TABLE "ecarts_detail";
ALTER TABLE "new_ecarts_detail" RENAME TO "ecarts_detail";
CREATE TABLE "new_estimations_affaire" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affaireId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "statut" TEXT NOT NULL DEFAULT 'DRAFT',
    "dateCreation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateValidation" DATETIME,
    "validePar" TEXT,
    "commentaire" TEXT,
    "montantTotalEstime" REAL NOT NULL DEFAULT 0,
    "dureeTotaleEstimee" INTEGER NOT NULL DEFAULT 0,
    "coutMainOeuvreEstime" REAL NOT NULL DEFAULT 0,
    "coutAchatsEstime" REAL NOT NULL DEFAULT 0,
    "coutFraisGenerauxEstime" REAL NOT NULL DEFAULT 0,
    "margeEstimee" REAL NOT NULL DEFAULT 0,
    "demiJourneesFabricationEstimees" INTEGER NOT NULL DEFAULT 0,
    "demiJourneesPoseEstimees" INTEGER NOT NULL DEFAULT 0,
    "nombrePersonnesEstime" INTEGER NOT NULL DEFAULT 2,
    "tauxHoraireMoyenEstime" REAL NOT NULL DEFAULT 85,
    "dateCommencementEstimee" DATETIME,
    "dateReceptionEstimee" DATETIME,
    "donneesEtendues" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "estimations_affaire_affaireId_fkey" FOREIGN KEY ("affaireId") REFERENCES "affaires" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "estimations_affaire_validePar_fkey" FOREIGN KEY ("validePar") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_estimations_affaire" ("affaireId", "commentaire", "coutAchatsEstime", "coutFraisGenerauxEstime", "coutMainOeuvreEstime", "createdAt", "dateCommencementEstimee", "dateCreation", "dateReceptionEstimee", "dateValidation", "demiJourneesFabricationEstimees", "demiJourneesPoseEstimees", "dureeTotaleEstimee", "id", "margeEstimee", "montantTotalEstime", "nombrePersonnesEstime", "statut", "tauxHoraireMoyenEstime", "updatedAt", "validePar", "version") SELECT "affaireId", "commentaire", "coutAchatsEstime", "coutFraisGenerauxEstime", "coutMainOeuvreEstime", "createdAt", "dateCommencementEstimee", "dateCreation", "dateReceptionEstimee", "dateValidation", "demiJourneesFabricationEstimees", "demiJourneesPoseEstimees", "dureeTotaleEstimee", "id", "margeEstimee", "montantTotalEstime", "nombrePersonnesEstime", "statut", "tauxHoraireMoyenEstime", "updatedAt", "validePar", "version" FROM "estimations_affaire";
DROP TABLE "estimations_affaire";
ALTER TABLE "new_estimations_affaire" RENAME TO "estimations_affaire";
CREATE TABLE "new_estimations_detail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimationId" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "sousCategorie" TEXT,
    "libelle" TEXT NOT NULL,
    "quantiteEstimee" REAL NOT NULL DEFAULT 0,
    "uniteQuantite" TEXT,
    "prixUnitaireEstime" REAL NOT NULL DEFAULT 0,
    "montantEstime" REAL NOT NULL DEFAULT 0,
    "commentaire" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "estimations_detail_estimationId_fkey" FOREIGN KEY ("estimationId") REFERENCES "estimations_affaire" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_estimations_detail" ("categorie", "commentaire", "createdAt", "estimationId", "id", "libelle", "montantEstime", "ordre", "prixUnitaireEstime", "quantiteEstimee", "sousCategorie", "uniteQuantite", "updatedAt") SELECT "categorie", "commentaire", "createdAt", "estimationId", "id", "libelle", "montantEstime", "ordre", "prixUnitaireEstime", "quantiteEstimee", "sousCategorie", "uniteQuantite", "updatedAt" FROM "estimations_detail";
DROP TABLE "estimations_detail";
ALTER TABLE "new_estimations_detail" RENAME TO "estimations_detail";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "pointage_heures_datePointage_idx" ON "pointage_heures"("datePointage");

-- CreateIndex
CREATE INDEX "pointage_heures_userId_idx" ON "pointage_heures"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "pointage_heures_userId_datePointage_key" ON "pointage_heures"("userId", "datePointage");
