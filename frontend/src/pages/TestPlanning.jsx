import React, { useState, useEffect } from 'react';
import { Container, Title, Text, Alert, Button, Group } from '@mantine/core';
import { IconInfoCircle, IconCalendar } from '@tabler/icons-react';
import PlanningContainer from '../components/planning-interactif/PlanningContainer';

const TestPlanning = () => {
  const [affairesDemo, setAffairesDemo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Générer des données de démonstration
  useEffect(() => {
    const generateDemoData = () => {
      const clients = ['Dupont SA', 'Martin SARL', 'Leblanc & Fils', 'Durand Construction', 'Bernard Rénovation'];
      const statuts = ['PLANIFIEE', 'EN_COURS', 'TERMINEE'];
      const priorites = ['BASSE', 'NORMALE', 'HAUTE', 'URGENTE'];
      
      const affaires = [];
      const today = new Date();
      
      for (let i = 1; i <= 15; i++) {
        const dateDebut = new Date(today.getTime() + (Math.random() - 0.5) * 30 * 24 * 60 * 60 * 1000);
        const duree = Math.floor(Math.random() * 20) + 5; // 5 à 25 jours
        const dateFin = new Date(dateDebut.getTime() + duree * 24 * 60 * 60 * 1000);
        
        affaires.push({
          id: `demo-${i}`,
          numero: `AFF-2024-${String(i).padStart(3, '0')}`,
          libelle: `Projet ${['Rénovation', 'Construction', 'Extension', 'Aménagement', 'Réparation'][Math.floor(Math.random() * 5)]} ${clients[Math.floor(Math.random() * clients.length)]}`,
          client: clients[Math.floor(Math.random() * clients.length)],
          dateDebut: dateDebut,
          dateFin: dateFin,
          dureeJours: duree,
          statut: statuts[Math.floor(Math.random() * statuts.length)],
          priorite: priorites[Math.floor(Math.random() * priorites.length)],
          estimationBudget: Math.floor(Math.random() * 500000) + 50000,
          montantRealise: Math.floor(Math.random() * 300000) + 20000,
          progression: Math.floor(Math.random() * 100),
          equipe: [
            { id: 1, prenom: 'Jean', nom: 'Dupont' },
            { id: 2, prenom: 'Marie', nom: 'Martin' },
            { id: 3, prenom: 'Pierre', nom: 'Durand' }
          ].slice(0, Math.floor(Math.random() * 3) + 1)
        });
      }
      
      return affaires;
    };

    // Simuler un chargement
    setTimeout(() => {
      setAffairesDemo(generateDemoData());
      setIsLoading(false);
    }, 1000);
  }, []);

  const regenererDonnees = () => {
    setIsLoading(true);
    setTimeout(() => {
      setAffairesDemo([]);
      setTimeout(() => {
        const clients = ['Dupont SA', 'Martin SARL', 'Leblanc & Fils', 'Durand Construction', 'Bernard Rénovation'];
        const statuts = ['PLANIFIEE', 'EN_COURS', 'TERMINEE'];
        const affaires = [];
        const today = new Date();
        
        for (let i = 1; i <= Math.floor(Math.random() * 10) + 10; i++) {
          const dateDebut = new Date(today.getTime() + (Math.random() - 0.5) * 30 * 24 * 60 * 60 * 1000);
          const duree = Math.floor(Math.random() * 20) + 5;
          const dateFin = new Date(dateDebut.getTime() + duree * 24 * 60 * 60 * 1000);
          
          affaires.push({
            id: `demo-${i}`,
            numero: `AFF-2024-${String(i).padStart(3, '0')}`,
            libelle: `Projet ${['Rénovation', 'Construction', 'Extension', 'Aménagement', 'Réparation'][Math.floor(Math.random() * 5)]} ${clients[Math.floor(Math.random() * clients.length)]}`,
            client: clients[Math.floor(Math.random() * clients.length)],
            dateDebut: dateDebut,
            dateFin: dateFin,
            dureeJours: duree,
            statut: statuts[Math.floor(Math.random() * statuts.length)],
            estimationBudget: Math.floor(Math.random() * 500000) + 50000,
            progression: Math.floor(Math.random() * 100),
            equipe: [
              { id: 1, prenom: 'Jean', nom: 'Dupont' },
              { id: 2, prenom: 'Marie', nom: 'Martin' }
            ].slice(0, Math.floor(Math.random() * 2) + 1)
          });
        }
        
        setAffairesDemo(affaires);
        setIsLoading(false);
      }, 500);
    }, 200);
  };

  return (
    <Container size="xl" py="xl">
      {/* Header de test */}
      <div className="mb-8">
        <Title order={1} className="text-[#000000] mb-4">
          🧪 Test Module Planning Interactif
        </Title>
        <Text size="lg" className="text-[#333333] mb-4">
          Démonstration du planning optimisé Surface Microsoft avec thème "terre bois vert olive"
        </Text>
        
        <Alert 
          icon={<IconInfoCircle size={16} />} 
          title="Sprint 1 - Fonctionnalités Testables"
          className="mb-6"
          style={{ 
            backgroundColor: '#f0f4e8',
            border: '1px solid #d9e2c4'
          }}
        >
          <ul className="text-sm space-y-1 mt-2">
            <li>✅ <strong>Navigation tactile</strong> : Testez les boutons de vue (Jour/Semaine/Mois)</li>
            <li>✅ <strong>Couleurs automatiques</strong> : Chaque affaire a sa couleur unique</li>
            <li>✅ <strong>Drag & Drop</strong> : Glissez les cartes d'affaires (optimisé Surface)</li>
            <li>✅ <strong>Zones de drop</strong> : Feedback visuel sur les zones de destination</li>
            <li>✅ <strong>Statistiques</strong> : Dashboard temps réel avec progressions</li>
            <li>✅ <strong>Thème cohérent</strong> : Design "terre bois vert olive" appliqué</li>
          </ul>
        </Alert>

        <Group>
          <Button
            variant="outline"
            leftSection={<IconCalendar size={16} />}
            onClick={regenererDonnees}
            className="border-[#6b7c3d] text-[#6b7c3d] hover:bg-[#6b7c3d] hover:text-white"
          >
            Régénérer Données Demo
          </Button>
          <Text size="sm" className="text-[#333333]">
            {affairesDemo.length} affaires chargées
          </Text>
        </Group>
      </div>

      {/* Module Planning */}
      <div className="bg-white rounded-lg shadow-sm border border-[#d9e2c4] p-6">
        <PlanningContainer 
          affaires={affairesDemo}
          isLoading={isLoading}
          onAffaireUpdate={(affaire) => {
            console.log('Affaire mise à jour:', affaire);
            // Ici on pourrait faire un appel API
          }}
          onAffaireClick={(affaire) => {
            console.log('Affaire cliquée:', affaire);
            alert(`Affaire sélectionnée:\n${affaire.numero} - ${affaire.libelle}\nClient: ${affaire.client}`);
          }}
        />
      </div>

      {/* Instructions de test */}
      <div className="mt-8">
        <Title order={3} className="text-[#6b7c3d] mb-4">
          📋 Instructions de Test
        </Title>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-[#f5f0e8] border border-[#e8dcc0] rounded-lg">
            <Title order={4} className="text-[#8b5a2b] mb-3">Navigation</Title>
            <ul className="space-y-2 text-sm">
              <li>🖱️ <strong>Vue Jour</strong> : Cliquez sur "Jour" pour voir le planning détaillé</li>
              <li>📅 <strong>Vue Semaine</strong> : Vue d'ensemble sur 7 jours</li>
              <li>📊 <strong>Vue Mois</strong> : Planning mensuel complet</li>
              <li>⬅️➡️ <strong>Navigation</strong> : Flèches pour changer de période</li>
              <li>🏠 <strong>Aujourd'hui</strong> : Bouton pour revenir à la date actuelle</li>
            </ul>
          </div>

          <div className="p-4 bg-[#f0f4e8] border border-[#d9e2c4] rounded-lg">
            <Title order={4} className="text-[#6b7c3d] mb-3">Drag & Drop</Title>
            <ul className="space-y-2 text-sm">
              <li>🖱️ <strong>Glisser</strong> : Maintenez le clic sur une carte d'affaire</li>
              <li>📍 <strong>Déposer</strong> : Relâchez sur une zone en pointillés</li>
              <li>✨ <strong>Feedback</strong> : Zones colorées quand survol</li>
              <li>📱 <strong>Tactile</strong> : Fonctionne au doigt sur tablette</li>
              <li>🎯 <strong>Précision</strong> : Zones optimisées Surface Microsoft</li>
            </ul>
          </div>

          <div className="p-4 bg-[#faf6f0] border border-[#f0e6d2] rounded-lg">
            <Title order={4} className="text-[#556b2f] mb-3">Couleurs</Title>
            <ul className="space-y-2 text-sm">
              <li>🎨 <strong>Automatiques</strong> : 24 couleurs distinctives</li>
              <li>🔄 <strong>Cohérentes</strong> : Même affaire = même couleur</li>
              <li>📱 <strong>Lisibles</strong> : Contrastes optimisés</li>
              <li>🎯 <strong>Uniques</strong> : Pas de doublons visuels</li>
            </ul>
          </div>

          <div className="p-4 bg-[#f0f4e8] border border-[#d9e2c4] rounded-lg">
            <Title order={4} className="text-[#6b7c3d] mb-3">Statistiques</Title>
            <ul className="space-y-2 text-sm">
              <li>📊 <strong>Temps réel</strong> : Données mises à jour automatiquement</li>
              <li>💰 <strong>Budget</strong> : Progression financière avec barres</li>
              <li>👥 <strong>Équipe</strong> : Charge de travail par membre</li>
              <li>🎯 <strong>Performance</strong> : Score global calculé</li>
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default TestPlanning; 