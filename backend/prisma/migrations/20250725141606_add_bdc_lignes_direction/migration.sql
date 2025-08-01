-- CreateTable
CREATE TABLE "lignes_bdc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "designation" TEXT NOT NULL,
    "reference" TEXT,
    "quantite" REAL NOT NULL,
    "prixUnitaire" REAL NOT NULL,
    "montantLigne" REAL NOT NULL,
    "bdcId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lignes_bdc_bdcId_fkey" FOREIGN KEY ("bdcId") REFERENCES "bdc" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bdc" (
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
    "direction" TEXT NOT NULL DEFAULT 'SORTANT',
    CONSTRAINT "bdc_affaireId_fkey" FOREIGN KEY ("affaireId") REFERENCES "affaires" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bdc_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "categories_achat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_bdc" ("affaireId", "categorieId", "commentaire", "createdAt", "dateBdc", "dateLivraison", "dateReception", "dateUpload", "fichierPdf", "firebaseDownloadUrl", "firebaseStoragePath", "fournisseur", "id", "montantFg", "montantHt", "nomFichier", "numero", "statut", "tailleFichier", "updatedAt") SELECT "affaireId", "categorieId", "commentaire", "createdAt", "dateBdc", "dateLivraison", "dateReception", "dateUpload", "fichierPdf", "firebaseDownloadUrl", "firebaseStoragePath", "fournisseur", "id", "montantFg", "montantHt", "nomFichier", "numero", "statut", "tailleFichier", "updatedAt" FROM "bdc";
DROP TABLE "bdc";
ALTER TABLE "new_bdc" RENAME TO "bdc";
CREATE UNIQUE INDEX "bdc_numero_key" ON "bdc"("numero");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
