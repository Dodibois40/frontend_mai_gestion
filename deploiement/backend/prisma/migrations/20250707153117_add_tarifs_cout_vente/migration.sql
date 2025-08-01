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
    "statutContractuel" TEXT NOT NULL DEFAULT 'SALARIE',
    "specialitePoseur" BOOLEAN NOT NULL DEFAULT false,
    "specialiteFabriquant" BOOLEAN NOT NULL DEFAULT false,
    "specialiteDessinateur" BOOLEAN NOT NULL DEFAULT false,
    "specialiteChargeAffaire" BOOLEAN NOT NULL DEFAULT false,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "supprime" BOOLEAN NOT NULL DEFAULT false,
    "supprimeLe" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dateEmbauche" DATETIME,
    "tarifHoraireBase" REAL NOT NULL DEFAULT 0,
    "tarifHoraireCout" REAL NOT NULL DEFAULT 0,
    "tarifHoraireVente" REAL NOT NULL DEFAULT 0,
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
INSERT INTO "new_users" ("actif", "avatar", "blockedUntil", "couleurPlanning", "createdAt", "dateEmbauche", "disponiblePlanning", "email", "failedLoginAttempts", "forcePasswordChange", "id", "isBlocked", "lastLoginAt", "lastPasswordChange", "nom", "passwordHash", "prenom", "role", "specialiteChargeAffaire", "specialiteDessinateur", "specialiteFabriquant", "specialitePoseur", "statutContractuel", "supprime", "supprimeLe", "tarifHoraireBase", "telephone", "twoFactorEnabled", "twoFactorSecret", "updatedAt") SELECT "actif", "avatar", "blockedUntil", "couleurPlanning", "createdAt", "dateEmbauche", "disponiblePlanning", "email", "failedLoginAttempts", "forcePasswordChange", "id", "isBlocked", "lastLoginAt", "lastPasswordChange", "nom", "passwordHash", "prenom", "role", "specialiteChargeAffaire", "specialiteDessinateur", "specialiteFabriquant", "specialitePoseur", "statutContractuel", "supprime", "supprimeLe", "tarifHoraireBase", "telephone", "twoFactorEnabled", "twoFactorSecret", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
