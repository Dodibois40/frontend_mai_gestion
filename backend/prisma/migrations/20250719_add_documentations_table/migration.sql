-- CreateTable
CREATE TABLE "documentations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "affaireId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "nomOriginal" TEXT NOT NULL,
    "chemin" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "categorie" TEXT NOT NULL DEFAULT 'autres',
    "sousCategorie" TEXT,
    "taille" BIGINT NOT NULL,
    "mimeType" TEXT,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "uploadePar" TEXT NOT NULL,
    "uploadeParId" TEXT NOT NULL,
    "dateUpload" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "derniereModification" DATETIME NOT NULL,
    "nombreTelechargements" INTEGER NOT NULL DEFAULT 0,
    "estArchive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "documentations_affaireId_fkey" FOREIGN KEY ("affaireId") REFERENCES "affaires" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documentations_uploadeParId_fkey" FOREIGN KEY ("uploadeParId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "documentations_affaireId_idx" ON "documentations"("affaireId");

-- CreateIndex
CREATE INDEX "documentations_categorie_idx" ON "documentations"("categorie");

-- CreateIndex
CREATE INDEX "documentations_uploadeParId_idx" ON "documentations"("uploadeParId");

-- CreateIndex
CREATE INDEX "documentations_dateUpload_idx" ON "documentations"("dateUpload"); 