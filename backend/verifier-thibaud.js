const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifierThibaud() {
  try {
    console.log('🔍 Recherche de Thibaud dans la base de données...\n');

    // Chercher tous les utilisateurs avec "Thibaud" dans le nom ou prénom
    const utilisateurs = await prisma.user.findMany({
      where: {
        OR: [
          { nom: { contains: 'Thibaud', mode: 'insensitive' } },
          { prenom: { contains: 'Thibaud', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        role: true,
        actif: true,
        supprime: true,
        disponiblePlanning: true,
        statutContractuel: true,
        couleurPlanning: true,
        dateCreation: true
      }
    });

    if (utilisateurs.length === 0) {
      console.log('❌ Aucun utilisateur trouvé avec "Thibaud" dans le nom ou prénom');
      return;
    }

    console.log(`✅ ${utilisateurs.length} utilisateur(s) trouvé(s) avec "Thibaud":\n`);

    for (const user of utilisateurs) {
      console.log(`👤 ${user.prenom} ${user.nom} (ID: ${user.id})`);
      console.log(`   📅 Créé le: ${user.dateCreation.toLocaleDateString('fr-FR')}`);
      console.log(`   🎭 Rôle: ${user.role}`);
      console.log(`   📊 Statut contractuel: ${user.statutContractuel}`);
      console.log(`   ✅ Actif: ${user.actif ? 'OUI' : 'NON'}`);
      console.log(`   🗑️ Supprimé: ${user.supprime ? 'OUI' : 'NON'}`);
      console.log(`   📋 Disponible planning: ${user.disponiblePlanning ? 'OUI' : 'NON'}`);
      console.log(`   🎨 Couleur planning: ${user.couleurPlanning || 'NON DÉFINIE'}`);
      
      // Vérifier si l'utilisateur répond aux critères pour apparaître dans le planning
      const rolesValides = ['OUVRIER_CHANTIER', 'OUVRIER_ATELIER', 'CHEF_ATELIER', 'CHEF_CHANTIER'];
      const criteres = {
        roleValide: rolesValides.includes(user.role),
        actif: user.actif,
        nonSupprime: !user.supprime,
        disponiblePlanning: user.disponiblePlanning
      };
      
      console.log('\n📝 Vérification des critères pour apparaître dans le planning:');
      console.log(`   ✅ Rôle valide (${rolesValides.join(', ')}): ${criteres.roleValide ? 'OUI' : 'NON'}`);
      console.log(`   ✅ Actif: ${criteres.actif ? 'OUI' : 'NON'}`);
      console.log(`   ✅ Non supprimé: ${criteres.nonSupprime ? 'OUI' : 'NON'}`);
      console.log(`   ✅ Disponible planning: ${criteres.disponiblePlanning ? 'OUI' : 'NON'}`);
      
      const tousLesCriteres = Object.values(criteres).every(Boolean);
      console.log(`\n🎯 Devrait apparaître dans le planning: ${tousLesCriteres ? '✅ OUI' : '❌ NON'}`);
      
      if (!tousLesCriteres) {
        console.log('⚠️  Problèmes détectés:');
        if (!criteres.roleValide) {
          console.log(`   - Rôle "${user.role}" non valide pour le planning`);
        }
        if (!criteres.actif) {
          console.log('   - Utilisateur non actif');
        }
        if (!criteres.nonSupprime) {
          console.log('   - Utilisateur marqué comme supprimé');
        }
        if (!criteres.disponiblePlanning) {
          console.log('   - Utilisateur non disponible pour le planning');
        }
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    }

    // Afficher les critères pour info
    console.log('📋 Critères pour apparaître dans le planning d\'équipe:');
    console.log('   - Rôle: OUVRIER_CHANTIER, OUVRIER_ATELIER, CHEF_ATELIER, ou CHEF_CHANTIER');
    console.log('   - Actif: true');
    console.log('   - Supprimé: false');
    console.log('   - Disponible planning: true');
    console.log('   - Statut contractuel: SALARIE (pour section salariés) ou SOUS_TRAITANT (pour section sous-traitants)');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifierThibaud(); 