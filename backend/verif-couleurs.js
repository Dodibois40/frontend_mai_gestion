// Vérification rapide des couleurs en base
const { PrismaClient } = require('@prisma/client');

async function verifCouleurs() {
  const prisma = new PrismaClient();
  
  try {
    const users = await prisma.user.findMany({
      where: { actif: true, supprime: false },
      select: { prenom: true, nom: true, couleurPlanning: true }
    });
    
    console.log('=== COULEURS EN BASE ===');
    users.forEach(u => {
      console.log(`${u.prenom} ${u.nom}: ${u.couleurPlanning}`);
    });
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifCouleurs(); 