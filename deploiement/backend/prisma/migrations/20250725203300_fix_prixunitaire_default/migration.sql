-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_lignes_bdc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "designation" TEXT NOT NULL,
    "reference" TEXT,
    "quantite" REAL NOT NULL,
    "prixUnitaire" REAL NOT NULL DEFAULT 0,
    "montantLigne" REAL NOT NULL,
    "bdcId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lignes_bdc_bdcId_fkey" FOREIGN KEY ("bdcId") REFERENCES "bdc" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_lignes_bdc" ("bdcId", "createdAt", "designation", "id", "montantLigne", "ordre", "prixUnitaire", "quantite", "reference", "updatedAt") SELECT "bdcId", "createdAt", "designation", "id", "montantLigne", "ordre", "prixUnitaire", "quantite", "reference", "updatedAt" FROM "lignes_bdc";
DROP TABLE "lignes_bdc";
ALTER TABLE "new_lignes_bdc" RENAME TO "lignes_bdc";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
