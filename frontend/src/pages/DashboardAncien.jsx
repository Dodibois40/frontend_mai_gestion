import { useState, useEffect } from 'react';
import { Title, SimpleGrid, Card, Text, Button, Group, Divider, Badge, Progress, Paper, Grid, Stack, List, Avatar, RingProgress, rem } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { 
  IconCalendarEvent, 
  IconUsers, 
  IconBriefcase, 
  IconChartBar, 
  IconTrendingUp,
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconArrowUpRight,
  IconBuildingFactory
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import CountUp from 'react-countup';
import { Button } from '@/components/ui/button';

// Composant pour les statistiques avec animation
const StatCard = ({ title, value, icon, color }) => {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb={5}>
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">{title}</Text>
        <Avatar color={color} size="sm" radius="xl">
          {icon}
        </Avatar>
      </Group>
      <Title order={2} fw={700} mt="xs">
        <CountUp end={value} duration={2.5} separator=" " />
      </Title>
      <Text c="dimmed" size="sm" mt={5}>
        <Text component="span" c={color} inherit fw={700}>
          +{Math.floor(Math.random() * 10) + 1}%
        </Text>{' '}
        depuis le mois dernier
      </Text>
    </Paper>
  );
};

// Données factices pour les tâches récentes
const recentTasks = [
  { id: 1, title: "Mise à jour du site web", status: "En cours", user: "Sophie M.", date: "18/05/2025" },
  { id: 2, title: "Réunion équipe marketing", status: "Terminé", user: "Marc D.", date: "15/05/2025" },
  { id: 3, title: "Préparation présentation client", status: "En attente", user: "Jean D.", date: "20/05/2025" },
  { id: 4, title: "Analyse des données trimestrielles", status: "En cours", user: "Emma L.", date: "17/05/2025" },
];

function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Simuler le chargement des données
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      try {
        notifications.show({
          title: 'Bienvenue !',
          message: 'Le tableau de bord a été chargé avec succès',
          color: 'blue',
        });
      } catch (error) {
        console.error("Erreur lors de l'affichage de la notification", error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'En cours': return 'blue';
      case 'Terminé': return 'green';
      case 'En attente': return 'yellow';
      default: return 'gray';
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'En cours': return <IconClock size={16} />;
      case 'Terminé': return <IconCheck size={16} />;
      case 'En attente': return <IconAlertCircle size={16} />;
      default: return null;
    }
  };

  const handleGenerateReport = () => {
    try {
      notifications.show({
        title: 'Rapport généré',
        message: 'Le rapport hebdomadaire a été généré et envoyé par email',
        color: 'green',
      });
    } catch (error) {
      console.error("Erreur lors de l'affichage de la notification", error);
    }
  };

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <Title>Tableau de bord</Title>
        <ForwardRefButton 
          leftSection={<IconChartBar size={18} />} 
          variant="light"
          onClick={handleGenerateReport}
        >
          Générer un rapport
        </ForwardRefButton>
      </Group>

      {/* Statistiques */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
        <StatCard 
          title="Plannings actifs" 
          value={12} 
          icon={<IconCalendarEvent size={16} />} 
          color="blue"
        />
        <StatCard 
          title="Collaborateurs" 
          value={28} 
          icon={<IconUsers size={16} />} 
          color="green"
        />
        <StatCard 
          title="Tâches en cours" 
          value={45} 
          icon={<IconBriefcase size={16} />} 
          color="yellow"
        />
        <StatCard 
          title="Projets terminés" 
          value={94} 
          icon={<IconTrendingUp size={16} />} 
          color="violet"
        />
      </SimpleGrid>

      <Grid gutter="lg" mb="xl">
        {/* Tâches récentes */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card>
            <Group justify="space-between" mb="md">
              <Title order={3}>Tâches récentes</Title>
              <Button variant="subtle" onClick={() => navigate('/taches')}>Voir tout</Button>
            </Group>
            <Divider mb="md" />
            
            <Stack gap="xs">
              {recentTasks.map(task => (
                <Paper key={task.id} withBorder p="md" radius="md">
                  <Group justify="space-between" wrap="nowrap">
                    <div>
                      <Group gap="xs">
                        <Badge 
                          color={getStatusColor(task.status)}
                          leftSection={getStatusIcon(task.status)}
                        >
                          {task.status}
                        </Badge>
                        <Text fw={500}>{task.title}</Text>
                      </Group>
                      <Text size="sm" c="dimmed" mt={4}>Assigné à {task.user} • Échéance: {task.date}</Text>
                    </div>
                    <Button variant="subtle" size="xs" radius="xl">Détails</Button>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
        
        {/* Progression des projets */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card h="100%">
            <Title order={3} mb="md">Progression des projets</Title>
            <Divider mb="lg" />
            
            <Stack justify="space-around" h="calc(100% - 80px)">
              <div style={{ textAlign: 'center' }}>
                <RingProgress
                  size={150}
                  thickness={16}
                  roundCaps
                  sections={[
                    { value: 45, color: 'blue' },
                    { value: 25, color: 'green' },
                    { value: 30, color: 'yellow' },
                  ]}
                  label={
                    <Text fw={700} ta="center" size="xl">
                      12
                    </Text>
                  }
                />
                <Text mt="md" fw={500}>Projets en cours</Text>
              </div>
              
              <List spacing="xs" size="sm" center>
                <List.Item icon={
                  <Avatar size={18} radius="xl" bg="blue.5" />
                }>
                  <Group justify="space-between">
                    <Text>En cours</Text>
                    <Text fw={700}>45%</Text>
                  </Group>
                </List.Item>
                <List.Item icon={
                  <Avatar size={18} radius="xl" bg="green.5" />
                }>
                  <Group justify="space-between">
                    <Text>Terminés</Text>
                    <Text fw={700}>25%</Text>
                  </Group>
                </List.Item>
                <List.Item icon={
                  <Avatar size={18} radius="xl" bg="yellow.5" />
                }>
                  <Group justify="space-between">
                    <Text>En attente</Text>
                    <Text fw={700}>30%</Text>
                  </Group>
                </List.Item>
              </List>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Accès rapides */}
      <Title order={3} mb="md">Accès rapides</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section className="bg-blue-50 dark:bg-blue-900 p-4 flex justify-center">
            <IconCalendarEvent 
              size={48} 
              color={`var(--mantine-color-blue-${7})`} 
              stroke={1.5}
            />
          </Card.Section>
          
          <Group justify="space-between" mt="md" mb="xs">
            <Text fw={500}>Planning</Text>
            <Badge color="blue" variant="light">12 actifs</Badge>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            Gestion du planning des équipes et attribution des tâches
          </Text>
          <Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={() => navigate('/plannings')}>
            Accéder
          </Button>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section className="bg-green-50 dark:bg-green-900 p-4 flex justify-center">
            <IconUsers
              size={48}
              color={`var(--mantine-color-green-${7})`}
              stroke={1.5}
            />
          </Card.Section>
          
          <Group justify="space-between" mt="md" mb="xs">
            <Text fw={500}>Collaborateurs</Text>
            <Badge color="green" variant="light">28 actifs</Badge>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            Gestion des équipes et des compétences
          </Text>
          <Button variant="light" color="green" fullWidth mt="md" radius="md" onClick={() => navigate('/collaborateurs')}>
            Accéder
          </Button>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section className="bg-teal-50 dark:bg-teal-900 p-4 flex justify-center">
            <IconBuildingFactory
              size={48}
              color={`var(--mantine-color-teal-${7})`}
              stroke={1.5}
            />
          </Card.Section>
          
          <Group justify="space-between" mt="md" mb="xs">
            <Text fw={500}>Chantiers</Text>
            <Badge color="teal" variant="light">Finances</Badge>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            Gestion financière des chantiers et suivi des budgets
          </Text>
          <Button variant="light" color="teal" fullWidth mt="md" radius="md" onClick={() => navigate('/chantiers')}>
            Accéder
          </Button>
        </Card>
      </SimpleGrid>
    </div>
  );
}

export default Dashboard;
