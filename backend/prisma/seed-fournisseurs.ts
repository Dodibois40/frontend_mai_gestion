import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFournisseurs() {
  console.log('🌱 Création des fournisseurs de test...');

  const fournisseurs = [
    {
      nom: 'Menuiseries Dupont SARL',
      codeClient: 'CLI-001234',
      enCompte: true,
      categorie: 'MENUISERIE' as any,
      adresse: '123 Rue des Artisans, 75001 Paris',
      telephone: '01.23.45.67.89',
      email: 'contact@menuiseries-dupont.fr',
      contact: 'Jean Dupont',
      commentaire: 'Fournisseur principal pour les menuiseries aluminium et bois',
    },
    {
      nom: 'Visserie Pro',
      codeClient: 'VIS-5678',
      enCompte: true,
      categorie: 'QUINCAILLERIE' as any,
      adresse: '456 Avenue de l\'Industrie, 69000 Lyon',
      telephone: '04.78.90.12.34',
      email: 'commandes@visserie-pro.com',
      contact: 'Marie Martin',
      commentaire: 'Spécialiste quincaillerie et fixations',
    },
    {
      nom: 'Verres & Cristaux SA',
      codeClient: 'VER-9012',
      enCompte: false,
      categorie: 'VITRAGE' as any,
      adresse: '789 Boulevard du Verre, 33000 Bordeaux',
      telephone: '05.56.78.90.12',
      email: 'info@verres-cristaux.fr',
      contact: 'Pierre Dubois',
      commentaire: 'Fournisseur de verres sur mesure et vitrages',
    },
    {
      nom: 'Outillage Moderne',
      codeClient: null,
      enCompte: false,
      categorie: 'OUTILLAGE' as any,
      adresse: '321 Rue de l\'Outillage, 13000 Marseille',
      telephone: '04.91.23.45.67',
      email: 'vente@outillage-moderne.fr',
      contact: 'Sophie Leroy',
      commentaire: 'Outillage professionnel et équipements de chantier',
    },
    {
      nom: 'Profilés Alu Express',
      codeClient: 'ALU-3456',
      enCompte: true,
      categorie: 'AGENCEMENT' as any,
      adresse: '654 Zone Industrielle Nord, 59000 Lille',
      telephone: '03.20.12.34.56',
      email: 'commercial@profils-alu.com',
      contact: 'Laurent Moreau',
      commentaire: 'Spécialiste profilés aluminium et accessoires',
    },
    {
      nom: 'Bois du Nord',
      codeClient: 'BOIS-7890',
      enCompte: true,
      categorie: 'BOIS' as any,
      adresse: '123 Chemin des Scieries, 88000 Épinal',
      telephone: '03.29.12.34.56',
      email: 'contact@bois-du-nord.fr',
      contact: 'Claude Forestier',
      commentaire: 'Scierie et négoce de bois massif, contreplaqué',
    },
    {
      nom: 'Ferronnerie Artisanale',
      codeClient: 'FER-2468',
      enCompte: false,
      categorie: 'FERRONNERIE' as any,
      adresse: '789 Rue du Métal, 42000 Saint-Étienne',
      telephone: '04.77.89.01.23',
      email: 'atelier@ferronnerie-artisanale.fr',
      contact: 'Michel Forgeron',
      commentaire: 'Ferronnerie d\'art et serrurerie sur mesure',
    },
    {
      nom: 'Peintures & Finitions Pro',
      codeClient: null,
      enCompte: false,
      categorie: 'PEINTURE' as any,
      adresse: '456 Avenue des Couleurs, 31000 Toulouse',
      telephone: '05.61.23.45.67',
      email: 'vente@peintures-pro.com',
      contact: 'Sylvie Coloris',
      commentaire: 'Peintures professionnelles et produits de finition',
    },
  ];

  for (const fournisseurData of fournisseurs) {
    try {
      const fournisseur = await prisma.fournisseur.create({
        data: fournisseurData,
      });
      console.log(`✅ Fournisseur créé: ${fournisseur.nom}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la création du fournisseur ${fournisseurData.nom}:`, error);
    }
  }

  console.log('✨ Seed des fournisseurs terminé !');
}

async function main() {
  try {
    await seedFournisseurs();
  } catch (error) {
    console.error('Erreur lors du seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { seedFournisseurs }; 