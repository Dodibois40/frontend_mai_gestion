import { PrismaClient, RoleEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding...');

  // Suppression des données existantes (pour les tests)
  await prisma.pointage.deleteMany({});
  await prisma.bdc.deleteMany({});
  await prisma.affaire.deleteMany({});
  await prisma.categorieAchat.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.parametreGlobal.deleteMany({});

  console.log('Données précédentes supprimées');

  // Création des paramètres globaux
  const parametres = await prisma.parametreGlobal.createMany({
    data: [
      { cle: 'TAUX_TVA', valeur: '20', description: 'Taux de TVA en pourcentage' },
      { cle: 'TAUX_HORAIRE', valeur: '45', description: 'Taux horaire interne en €/h' },
      { cle: 'SEUIL_ALERTE_MARGE', valeur: '5', description: 'Seuil d\'alerte pour les marges négatives (%)' },
    ]
  });

  console.log(`${parametres.count} paramètres globaux créés`);

  // Création des utilisateurs
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      nom: 'Admin',
      prenom: 'Système',
      passwordHash: adminPasswordHash,
      role: RoleEnum.ADMIN_SYS,
      tarifHoraireBase: 50
    }
  });

  const adminUserFr = await prisma.user.create({
    data: {
      email: 'admin@exemple.fr',
      nom: 'Admin',
      prenom: 'Système',
      passwordHash,
      role: RoleEnum.ADMIN_SYS,
      tarifHoraireBase: 50
    }
  });

  const chargeAffaireUser = await prisma.user.create({
    data: {
      email: 'charge@exemple.fr',
      nom: 'Dupont',
      prenom: 'Jean',
      passwordHash,
      role: RoleEnum.CHARGE_AFFAIRE,
      tarifHoraireBase: 45
    }
  });

  const acheteurUser = await prisma.user.create({
    data: {
      email: 'acheteur@exemple.fr',
      nom: 'Martin',
      prenom: 'Sophie',
      passwordHash,
      role: RoleEnum.ACHETEUR,
      tarifHoraireBase: 40
    }
  });

  const chefAtelierUser = await prisma.user.create({
    data: {
      email: 'chef@exemple.fr',
      nom: 'Durand',
      prenom: 'Pierre',
      passwordHash,
      role: RoleEnum.CHEF_ATELIER,
      tarifHoraireBase: 42
    }
  });

  console.log('Utilisateurs créés');

  // Création des catégories d'achat
  const categorieBois = await prisma.categorieAchat.create({
    data: {
      code: 'BOI',
      intitule: 'Bois',
      pourcentageFg: 10
    }
  });

  const categorieAcier = await prisma.categorieAchat.create({
    data: {
      code: 'ACI',
      intitule: 'Acier',
      pourcentageFg: 12
    }
  });

  const categorieVitrage = await prisma.categorieAchat.create({
    data: {
      code: 'VIT',
      intitule: 'Vitrage',
      pourcentageFg: 8
    }
  });

  const categorieQuincaillerie = await prisma.categorieAchat.create({
    data: {
      code: 'QUI',
      intitule: 'Quincaillerie',
      pourcentageFg: 15
    }
  });

  const categorieAutre = await prisma.categorieAchat.create({
    data: {
      code: 'AUT',
      intitule: 'Autre',
      pourcentageFg: 10
    }
  });

  console.log('Catégories d\'achat créées');

  // Création des affaires
  const affaire1 = await prisma.affaire.create({
    data: {
      numero: '24-BOIS-001',
      libelle: 'Rénovation chalet montagne',
      client: 'M. Montagne',
      adresse: '123 Route des Alpes, 74000 Annecy',
      dateCloturePrevue: new Date('2024-06-30'),
      objectifCaHt: 15000,
      objectifAchatHt: 8000,
      objectifHeuresFab: 120,
      objectifHeuresSer: 10,
      objectifHeuresPose: 25,
      statut: 'EN_COURS'
    }
  });

  const affaire2 = await prisma.affaire.create({
    data: {
      numero: '24-ALU-002',
      libelle: 'Fenêtres appartement neuf',
      client: 'Mme Dupuis',
      adresse: '45 Avenue de la Plage, 06000 Nice',
      dateCloturePrevue: new Date('2024-08-15'),
      objectifCaHt: 8500,
      objectifAchatHt: 4200,
      objectifHeuresFab: 80,
      objectifHeuresSer: 5,
      objectifHeuresPose: 15,
      statut: 'PLANIFIEE'
    }
  });

  console.log('Affaires créées');

  // Création des bons de commande
  const bdc1 = await prisma.bdc.create({
    data: {
      numero: 'BDC-2025-001',
      montantHt: 3200,
      dateBdc: new Date('2025-02-10'),
      dateReception: new Date('2025-02-25'),
      commentaire: 'Livraison complète',
      affaireId: affaire1.id,
      categorieId: categorieBois.id,
      fournisseur: 'BoisPro SARL',
      montantFg: 3200 * (categorieBois.pourcentageFg / 100)
    }
  });

  const bdc2 = await prisma.bdc.create({
    data: {
      numero: 'BDC-2025-002',
      montantHt: 1800,
      dateBdc: new Date('2025-02-15'),
      commentaire: 'En attente de livraison',
      affaireId: affaire1.id,
      categorieId: categorieQuincaillerie.id,
      fournisseur: 'QuincaillerieExpress',
      montantFg: 1800 * (categorieQuincaillerie.pourcentageFg / 100)
    }
  });

  const bdc3 = await prisma.bdc.create({
    data: {
      numero: 'BDC-2025-003',
      montantHt: 2500,
      dateBdc: new Date('2025-03-01'),
      commentaire: 'Commande confirmée',
      affaireId: affaire2.id,
      categorieId: categorieVitrage.id,
      fournisseur: 'Vitrage&Co',
      montantFg: 2500 * (categorieVitrage.pourcentageFg / 100)
    }
  });

  console.log('Bons de commande créés');

  // Création des pointages
  const pointage1 = await prisma.pointage.create({
    data: {
      datePointage: new Date('2024-02-20'),
      nbHeures: 8,
      typeHeure: 'FAB',
      commentaire: 'Fabrication menuiseries',
      affaireId: affaire1.id,
      userId: chefAtelierUser.id
    }
  });

  const pointage2 = await prisma.pointage.create({
    data: {
      datePointage: new Date('2024-02-21'),
      nbHeures: 7.5,
      typeHeure: 'FAB',
      commentaire: 'Fabrication menuiseries - suite',
      affaireId: affaire1.id,
      userId: chefAtelierUser.id
    }
  });

  const pointage3 = await prisma.pointage.create({
    data: {
      datePointage: new Date('2024-02-25'),
      nbHeures: 4,
      typeHeure: 'POSE',
      commentaire: 'Installation sur site',
      affaireId: affaire1.id,
      userId: chefAtelierUser.id
    }
  });

  console.log('Pointages créés');

  console.log('Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 