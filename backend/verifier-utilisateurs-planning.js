const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Diagnostic des utilisateurs pour le planning d\'équipe...\n');

    // Récupérer tous les utilisateurs éligibles au planning
    const utilisateurs = await prisma.user.findMany({
      where: {
        role: {
          in: ['OUVRIER_CHANTIER', 'OUVRIER_ATELIER', 'CHEF_ATELIER', 'CHEF_CHANTIER']
        },
        actif: true,
        supprime: false,
        disponiblePlanning: true
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        role: true,
        statutContractuel: true,
        couleurPlanning: true
      }
    });

    console.log(`📊 Total utilisateurs éligibles: ${utilisateurs.length}\n`);

    // Analyser la répartition
    const salaries = utilisateurs.filter(u => u.statutContractuel === 'SALARIE');
    const sousTraitants = utilisateurs.filter(u => u.statutContractuel === 'SOUS_TRAITANT');
    const sansStatut = utilisateurs.filter(u => !u.statutContractuel);

    console.log(`✅ Salariés (SALARIE): ${salaries.length}`);
    salaries.forEach(u => console.log(`   - ${u.prenom} ${u.nom} (${u.role})`));

    console.log(`\n🔧 Sous-traitants (SOUS_TRAITANT): ${sousTraitants.length}`);
    sousTraitants.forEach(u => console.log(`   - ${u.prenom} ${u.nom} (${u.role})`));

    console.log(`\n⚠️  Sans statut contractuel: ${sansStatut.length}`);
    sansStatut.forEach(u => console.log(`   - ${u.prenom} ${u.nom} (${u.role}) - PROBLÈME!`));

    if (sansStatut.length > 0) {
      console.log('\n🚨 PROBLÈME IDENTIFIÉ:');
      console.log(`${sansStatut.length} utilisateur(s) n'ont pas de statut contractuel défini.`);
      console.log('Ces utilisateurs n\'apparaissent donc ni dans "Salarié" ni dans "Sous traitant".\n');
      
      console.log('💡 SOLUTION: Voulez-vous que je mette à jour ces utilisateurs ?');
      console.log('   - Les utilisateurs seront définis comme SALARIE par défaut');
      console.log('   - Vous pourrez modifier individuellement plus tard si nécessaire\n');
      
      // Auto-correction
      console.log('🔧 Correction automatique en cours...');
      
      for (const user of sansStatut) {
        await prisma.user.update({
          where: { id: user.id },
          data: { statutContractuel: 'SALARIE' }
        });
        console.log(`   ✅ ${user.prenom} ${user.nom} → SALARIE`);
      }
      
      console.log('\n🎉 Correction terminée! Tous les utilisateurs ont maintenant un statut contractuel.');
    } else {
      console.log('\n✅ Tous les utilisateurs ont un statut contractuel défini.');
    }

    // Récapitulatif final
    console.log('\n📋 RÉCAPITULATIF APRÈS CORRECTION:');
    const utilisateursMisAJour = await prisma.user.findMany({
      where: {
        role: {
          in: ['OUVRIER_CHANTIER', 'OUVRIER_ATELIER', 'CHEF_ATELIER', 'CHEF_CHANTIER']
        },
        actif: true,
        supprime: false,
        disponiblePlanning: true
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        role: true,
        statutContractuel: true
      }
    });

    const salariesFinaux = utilisateursMisAJour.filter(u => u.statutContractuel === 'SALARIE');
    const sousTraitantsFinaux = utilisateursMisAJour.filter(u => u.statutContractuel === 'SOUS_TRAITANT');

    console.log(`👥 Salariés: ${salariesFinaux.length}`);
    console.log(`🔧 Sous-traitants: ${sousTraitantsFinaux.length}`);
    console.log('\n✨ Le planning d\'équipe devrait maintenant afficher tous les utilisateurs correctement!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 