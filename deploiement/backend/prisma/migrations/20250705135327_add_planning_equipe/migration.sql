-- CreateTable
CREATE TABLE "panels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,
    "thickness" REAL NOT NULL,
    "material" TEXT NOT NULL,
    "grainDirection" TEXT NOT NULL,
    "pricePerM2" REAL NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 1,
    "isOffcut" BOOLEAN NOT NULL DEFAULT false,
    "depreciation" REAL NOT NULL DEFAULT 1.0,
    "minOffcutWidth" REAL NOT NULL DEFAULT 100,
    "minOffcutHeight" REAL NOT NULL DEFAULT 100,
    "supplierCode" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "cutting_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "kerfWidth" REAL NOT NULL DEFAULT 3.2,
    "peripheralCut" REAL NOT NULL DEFAULT 5.0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "affaireId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pieces" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,
    "thickness" REAL NOT NULL,
    "material" TEXT NOT NULL,
    "grainDirection" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "edgeTop" REAL NOT NULL DEFAULT 0,
    "edgeBottom" REAL NOT NULL DEFAULT 0,
    "edgeLeft" REAL NOT NULL DEFAULT 0,
    "edgeRight" REAL NOT NULL DEFAULT 0,
    "canRotate" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pieces_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "cutting_projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cutting_layouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "panelId" TEXT NOT NULL,
    "layoutNumber" INTEGER NOT NULL,
    "panelWidth" REAL NOT NULL,
    "panelHeight" REAL NOT NULL,
    "efficiency" REAL NOT NULL,
    "wasteArea" REAL NOT NULL,
    "totalCutLength" REAL NOT NULL,
    "cutCount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cutting_layouts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "cutting_projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cutting_layouts_panelId_fkey" FOREIGN KEY ("panelId") REFERENCES "panels" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "placed_pieces" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "layoutId" TEXT NOT NULL,
    "pieceId" TEXT NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,
    "isRotated" BOOLEAN NOT NULL DEFAULT false,
    "pieceNumber" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "placed_pieces_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "cutting_layouts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "placed_pieces_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "pieces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "offcuts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "layoutId" TEXT NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,
    "area" REAL NOT NULL,
    "isUsable" BOOLEAN NOT NULL DEFAULT true,
    "material" TEXT NOT NULL,
    "thickness" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "offcuts_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "cutting_layouts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "optimization_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "totalPanelsUsed" INTEGER NOT NULL,
    "totalEfficiency" REAL NOT NULL,
    "totalWaste" REAL NOT NULL,
    "totalCost" REAL NOT NULL,
    "totalCutLength" REAL NOT NULL,
    "totalCutTime" REAL,
    "algorithm" TEXT NOT NULL DEFAULT 'BOTTOM_LEFT_FILL',
    "metrics" TEXT NOT NULL,
    "isOptimal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "optimization_results_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "cutting_projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "planning_affectations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affaireId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateAffectation" DATETIME NOT NULL,
    "periode" TEXT NOT NULL,
    "typeActivite" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'ACTIVE',
    "commentaire" TEXT,
    "couleurPersonne" TEXT,
    "ordreAffichage" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "planning_affectations_affaireId_fkey" FOREIGN KEY ("affaireId") REFERENCES "affaires" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "planning_affectations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
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
    "telephone" TEXT,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockedUntil" DATETIME,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" DATETIME,
    "lastPasswordChange" DATETIME,
    "forcePasswordChange" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "avatar" TEXT,
    "couleurPlanning" TEXT DEFAULT '#3B82F6',
    "disponiblePlanning" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_users" ("actif", "avatar", "blockedUntil", "createdAt", "dateEmbauche", "email", "failedLoginAttempts", "forcePasswordChange", "id", "isBlocked", "lastLoginAt", "lastPasswordChange", "nom", "passwordHash", "prenom", "role", "supprime", "supprimeLe", "tarifHoraireBase", "telephone", "twoFactorEnabled", "twoFactorSecret", "updatedAt") SELECT "actif", "avatar", "blockedUntil", "createdAt", "dateEmbauche", "email", "failedLoginAttempts", "forcePasswordChange", "id", "isBlocked", "lastLoginAt", "lastPasswordChange", "nom", "passwordHash", "prenom", "role", "supprime", "supprimeLe", "tarifHoraireBase", "telephone", "twoFactorEnabled", "twoFactorSecret", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "planning_affectations_affaireId_userId_dateAffectation_periode_key" ON "planning_affectations"("affaireId", "userId", "dateAffectation", "periode");
