const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  console.log('🔑 Création d\'un utilisateur test pour Claude...');
  
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@claude.ai' }
    });
    
    if (existingUser) {
      console.log('✅ Utilisateur test déjà existant: test@claude.ai');
      console.log(`ID: ${existingUser.id}`);
      return existingUser;
    }
    
    // Créer le hash du mot de passe
    const passwordHash = await bcrypt.hash('test123', 10);
    
    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: 'test@claude.ai',
        nom: 'Test',
        prenom: 'Claude',
        passwordHash,
        role: 'ADMIN_SYS',
        actif: true,
        dateEmbauche: new Date(),
        tarifHoraireBase: 35.0
      }
    });
    
    console.log('✅ Utilisateur test créé avec succès !');
    console.log(`Email: ${user.email}`);
    console.log(`Mot de passe: test123`);
    console.log(`ID: ${user.id}`);
    console.log(`Rôle: ${user.role}`);
    
    return user;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createTestUser();
}

module.exports = { createTestUser }; 