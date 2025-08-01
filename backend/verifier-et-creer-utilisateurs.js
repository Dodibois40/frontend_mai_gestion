const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Vérification complète des utilisateurs pour le planning d\'équipe...\n');

    // Vérifier tous les utilisateurs éligibles au planning
    const utilisateursEligibles = await prisma.user.findMany({
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
        couleurPlanning: true,
        email: true
      },
      orderBy: [
        { prenom: 'asc' },
        { nom: 'asc' }
      ]
    });

    console.log(`📊 Utilisateurs éligibles trouvés: ${utilisateursEligibles.length}`);
    
    // Grouper par statut contractuel comme dans le service
    const salaries = utilisateursEligibles.filter(o => {
      if (!o.statutContractuel) return true;
      return o.statutContractuel === 'SALARIE';
    });

    const sousTraitants = utilisateursEligibles.filter(o => {
      return o.statutContractuel === 'SOUS_TRAITANT';
    });

    console.log(`\n📋 SALARIÉS (${salaries.length}):`);
    salaries.forEach(s => {
      console.log(`  - ${s.prenom} ${s.nom} (${s.role}) - Statut: ${s.statutContractuel || 'NON DÉFINI'} - Couleur: ${s.couleurPlanning || 'NON DÉFINIE'}`);
    });

    console.log(`\n📋 SOUS-TRAITANTS (${sousTraitants.length}):`);
    sousTraitants.forEach(st => {
      console.log(`  - ${st.prenom} ${st.nom} (${st.role}) - Statut: ${st.statutContractuel || 'NON DÉFINI'} - Couleur: ${st.couleurPlanning || 'NON DÉFINIE'}`);
    });

    // Chercher spécifiquement Dorian et Thibaud
    const dorian = await prisma.user.findFirst({
      where: {
        OR: [
          { nom: { contains: 'Dorian', mode: 'insensitive' } },
          { prenom: { contains: 'Dorian', mode: 'insensitive' } }
        ]
      }
    });

    const thibaud = await prisma.user.findFirst({
      where: {
        OR: [
          { nom: { contains: 'Thibaud', mode: 'insensitive' } },
          { prenom: { contains: 'Thibaud', mode: 'insensitive' } }
        ]
      }
    });

    console.log('\n🔍 RECHERCHE SPÉCIFIQUE:');

    // Traiter Dorian
    if (!dorian) {
      console.log('❌ Dorian non trouvé, création...');
      const nouveauDorian = await prisma.user.create({
        data: {
          nom: 'Dorian',
          prenom: 'Dorian',
          email: `dorian.${Date.now()}@example.com`,
          role: 'OUVRIER_CHANTIER',
          actif: true,
          supprime: false,
          disponiblePlanning: true,
          statutContractuel: 'SALARIE',
          couleurPlanning: '#A0522D', // Couleur terre
          motDePasse: 'password123' // Mot de passe temporaire
        }
      });
      console.log(`✅ Dorian créé avec succès! ID: ${nouveauDorian.id}`);
    } else {
      console.log(`✅ Dorian trouvé: ${dorian.prenom} ${dorian.nom}`);
      console.log(`   Rôle: ${dorian.role}, Actif: ${dorian.actif}, Supprimé: ${dorian.supprime}`);
      console.log(`   Disponible planning: ${dorian.disponiblePlanning}, Statut: ${dorian.statutContractuel}`);
      
      if (!dorian.actif || dorian.supprime || !dorian.disponiblePlanning || 
          !['OUVRIER_CHANTIER', 'OUVRIER_ATELIER', 'CHEF_ATELIER', 'CHEF_CHANTIER'].includes(dorian.role)) {
        console.log('🔧 Correction de Dorian...');
        await prisma.user.update({
          where: { id: dorian.id },
          data: {
            role: dorian.role || 'OUVRIER_CHANTIER',
            actif: true,
            supprime: false,
            disponiblePlanning: true,
            statutContractuel: dorian.statutContractuel || 'SALARIE',
            couleurPlanning: dorian.couleurPlanning || '#A0522D'
          }
        });
        console.log('✅ Dorian corrigé!');
      }
    }

    // Traiter Thibaud
    if (!thibaud) {
      console.log('❌ Thibaud non trouvé, création...');
      const nouveauThibaud = await prisma.user.create({
        data: {
          nom: 'Thibaud',
          prenom: 'Thibaud',
          email: `thibaud.${Date.now()}@example.com`,
          role: 'OUVRIER_ATELIER',
          actif: true,
          supprime: false,
          disponiblePlanning: true,
          statutContractuel: 'SALARIE',
          couleurPlanning: '#8B4513', // Couleur marron terre cuite
          motDePasse: 'password123' // Mot de passe temporaire
        }
      });
      console.log(`✅ Thibaud créé avec succès! ID: ${nouveauThibaud.id}`);
    } else {
      console.log(`✅ Thibaud trouvé: ${thibaud.prenom} ${thibaud.nom}`);
      console.log(`   Rôle: ${thibaud.role}, Actif: ${thibaud.actif}, Supprimé: ${thibaud.supprime}`);
      console.log(`   Disponible planning: ${thibaud.disponiblePlanning}, Statut: ${thibaud.statutContractuel}`);
      
      if (!thibaud.actif || thibaud.supprime || !thibaud.disponiblePlanning || 
          !['OUVRIER_CHANTIER', 'OUVRIER_ATELIER', 'CHEF_ATELIER', 'CHEF_CHANTIER'].includes(thibaud.role)) {
        console.log('🔧 Correction de Thibaud...');
        await prisma.user.update({
          where: { id: thibaud.id },
          data: {
            role: thibaud.role || 'OUVRIER_ATELIER',
            actif: true,
            supprime: false,
            disponiblePlanning: true,
            statutContractuel: thibaud.statutContractuel || 'SALARIE',
            couleurPlanning: thibaud.couleurPlanning || '#8B4513'
          }
        });
        console.log('✅ Thibaud corrigé!');
      }
    }

    // Vérification finale
    console.log('\n🔍 VÉRIFICATION FINALE...');
    const utilisateursFinaux = await prisma.user.findMany({
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
      },
      orderBy: [
        { prenom: 'asc' },
        { nom: 'asc' }
      ]
    });

    const salariesFinaux = utilisateursFinaux.filter(o => {
      if (!o.statutContractuel) return true;
      return o.statutContractuel === 'SALARIE';
    });

    const sousTraitantsFinaux = utilisateursFinaux.filter(o => {
      return o.statutContractuel === 'SOUS_TRAITANT';
    });

    console.log(`\n📊 RÉSULTATS FINAUX:`);
    console.log(`   Total utilisateurs éligibles: ${utilisateursFinaux.length}`);
    console.log(`   Salariés: ${salariesFinaux.length}`);
    salariesFinaux.forEach(s => {
      console.log(`     - ${s.prenom} ${s.nom} (${s.role})`);
    });
    
    console.log(`   Sous-traitants: ${sousTraitantsFinaux.length}`);
    sousTraitantsFinaux.forEach(st => {
      console.log(`     - ${st.prenom} ${st.nom} (${st.role})`);
    });

    console.log('\n🎉 Vérification et correction terminées !');
    console.log('🔄 Rechargez complètement la page du planning d\'équipe (Ctrl+F5).');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 