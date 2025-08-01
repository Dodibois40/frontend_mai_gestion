// Script pour vérifier et créer les utilisateurs
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function verifUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== VERIFICATION DES UTILISATEURS ===');
    
    // Afficher tous les utilisateurs actifs
    const users = await prisma.user.findMany({
      where: { actif: true, supprime: false },
      select: { 
        id: true,
        email: true, 
        prenom: true, 
        nom: true, 
        role: true,
        couleurPlanning: true 
      }
    });
    
    console.log(`Nombre d'utilisateurs: ${users.length}`);
    console.log('');
    
    users.forEach(u => {
      console.log(`- ${u.prenom} ${u.nom} (${u.email})`);
      console.log(`  Role: ${u.role}`);
      console.log(`  Couleur: ${u.couleurPlanning}`);
      console.log('');
    });
    
    // Vérifier si l'utilisateur test existe
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@claude.ai' }
    });
    
    if (!testUser) {
      console.log('=== CREATION UTILISATEUR TEST ===');
      
      // Créer le hash du mot de passe
      const passwordHash = await bcrypt.hash('test123', 10);
      
      // Créer l'utilisateur test
      const newUser = await prisma.user.create({
        data: {
          email: 'test@claude.ai',
          nom: 'Test',
          prenom: 'Claude',
          passwordHash,
          role: 'ADMIN_SYS',
          actif: true,
          couleurPlanning: '#8B4513', // Première couleur de notre palette
          dateEmbauche: new Date(),
          tarifHoraireBase: 35.0
        }
      });
      
      console.log('Utilisateur test cree avec succes !');
      console.log(`Email: ${newUser.email}`);
      console.log('Mot de passe: test123');
      console.log(`Role: ${newUser.role}`);
    } else {
      console.log('=== UTILISATEUR TEST EXISTANT ===');
      console.log(`Email: ${testUser.email}`);
      console.log('Mot de passe: test123');
      console.log(`Role: ${testUser.role}`);
    }
    
    console.log('');
    console.log('=== INSTRUCTIONS DE CONNEXION ===');
    console.log('1. Allez sur http://localhost:8080');
    console.log('2. Utilisez ces identifiants:');
    console.log('   Email: test@claude.ai');
    console.log('   Mot de passe: test123');
    console.log('3. Vous devriez voir les nouvelles couleurs !');
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifUsers(); 