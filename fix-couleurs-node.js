// Script Node.js pour corriger les couleurs des utilisateurs
// Utilise Prisma Client directement

const { PrismaClient } = require('@prisma/client');

// Palette de couleurs thématique (terre, bois, olive, soleil)
const COULEURS_PLANNING = [
  // Tons terre
  '#8B4513', '#A0522D', '#CD853F', '#D2691E',
  // Tons bois  
  '#DEB887', '#BC8F8F', '#F4A460', '#DAA520',
  // Tons olive
  '#556B2F', '#6B8E23', '#808000', '#9ACD32',
  // Tons soleil
  '#FF8C00', '#FFB347', '#FFA500', '#F0E68C',
  // Couleurs complémentaires terre
  '#B22222', '#CD5C5C', '#D2B48C', '#F5DEB3'
];

async function fixCouleurs() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🎨 Fix des couleurs utilisateurs MAI-GESTION');
    console.log('==========================================');
    
    // Récupérer tous les utilisateurs actifs
    const utilisateurs = await prisma.user.findMany({
      where: {
        actif: true,
        supprime: false
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log(`📋 ${utilisateurs.length} utilisateurs trouvés`);
    
    // Mettre à jour chaque utilisateur avec une couleur unique
    for (let i = 0; i < utilisateurs.length; i++) {
      const utilisateur = utilisateurs[i];
      const nouvelleCouleur = COULEURS_PLANNING[i % COULEURS_PLANNING.length];
      
      await prisma.user.update({
        where: { id: utilisateur.id },
        data: { couleurPlanning: nouvelleCouleur }
      });
      
      console.log(`✅ ${utilisateur.prenom} ${utilisateur.nom}: ${nouvelleCouleur}`);
    }
    
    console.log('');
    console.log('🎉 Toutes les couleurs ont été mises à jour !');
    console.log('💡 Rechargez votre interface web (F5) pour voir les changements');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error.message);
    console.error('💡 Vérifiez que la base de données est accessible');
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
fixCouleurs(); 