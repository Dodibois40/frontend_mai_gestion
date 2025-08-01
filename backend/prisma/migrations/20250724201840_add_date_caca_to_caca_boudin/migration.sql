-- CreateTable
CREATE TABLE "caca_boudin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "couleur" TEXT NOT NULL,
    "taille" TEXT NOT NULL,
    "odeur" INTEGER NOT NULL,
    "dateCaca" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
