import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Title, Button, Group, Paper, Text, Badge, ActionIcon, Menu, Select, TextInput, Table, Pagination, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconSearch, IconFilter, IconEdit, IconTrash, IconDotsVertical, IconCheck, IconClock, IconAlertCircle } from '@tabler/icons-react';
import taskService from '@/services/taskService';

const TaskList = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ 
    page: 1, 
    limit: 10, 
    total: 0, 
    pages: 1 
  });
  const [filters, setFilters] = useState({
    search: '',
    statut: '',
    priorite: ''
  });
  
  // Charger les tâches avec filtres et pagination
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getAllTasks({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      // S'assurer que la réponse contient les données attendues
      if (response && response.data) {
        setTasks(response.data.tasks || []);
        // S'assurer que pagination existe et contient les propriétés nécessaires
        const paginationData = response.data.pagination || { page: 1, limit: 10, total: 0, pages: 1 };
        setPagination(paginationData);
      } else {
        setTasks([]);
        setPagination({ page: 1, limit: 10, total: 0, pages: 1 });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de charger la liste des tâches',
        color: 'red'
      });
      setTasks([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 1 });
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les tâches au chargement de la page et lors des changements de filtres/pagination
  useEffect(() => {
    fetchTasks();
  }, [pagination.page, filters]);
  
  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'à faire': return 'gray';
      case 'en cours': return 'blue';
      case 'terminée': return 'green';
      default: return 'gray';
    }
  };
  
  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'à faire': return <IconAlertCircle size={16} />;
      case 'en cours': return <IconClock size={16} />;
      case 'terminée': return <IconCheck size={16} />;
      default: return null;
    }
  };
  
  // Fonction pour obtenir la couleur de la priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'basse': return 'teal';
      case 'moyenne': return 'yellow';
      case 'haute': return 'red';
      default: return 'gray';
    }
  };
  
  // Supprimer une tâche
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await taskService.deleteTask(id);
        fetchTasks(); // Recharger la liste après suppression
        notifications.show({
          title: 'Succès',
          message: 'Tâche supprimée avec succès',
          color: 'green'
        });
      } catch (error) {
        console.error('Erreur lors de la suppression de la tâche:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Impossible de supprimer la tâche',
          color: 'red'
        });
      }
    }
  };
  
  // Appliquer les filtres
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 })); // Revenir à la première page
  };
  
  return (
    <div>
      <Group position="apart" mb="md">
        <Title>Gestion des Tâches</Title>
        
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate('/taches/nouveau')}
        >
          Nouvelle Tâche
        </Button>
      </Group>
      
      {/* Filtres */}
      <Paper p="md" mb="lg">
        <Group>
          <TextInput
            placeholder="Rechercher une tâche..."
            icon={<IconSearch size={16} />}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            style={{ flex: 1 }}
          />
          
          <Select
            placeholder="Statut"
            icon={<IconFilter size={16} />}
            clearable
            data={[
              { value: 'à faire', label: 'À faire' },
              { value: 'en cours', label: 'En cours' },
              { value: 'terminée', label: 'Terminée' }
            ]}
            value={filters.statut}
            onChange={(value) => setFilters(prev => ({ ...prev, statut: value }))}
          />
          
          <Select
            placeholder="Priorité"
            icon={<IconFilter size={16} />}
            clearable
            data={[
              { value: 'basse', label: 'Basse' },
              { value: 'moyenne', label: 'Moyenne' },
              { value: 'haute', label: 'Haute' }
            ]}
            value={filters.priorite}
            onChange={(value) => setFilters(prev => ({ ...prev, priorite: value }))}
          />
          
          <Button onClick={applyFilters}>
            Filtrer
          </Button>
        </Group>
      </Paper>
      
      {/* Tableau des tâches */}
      <Paper p="md" pos="relative">
        <LoadingOverlay visible={loading} />
        
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Titre</Table.Th>
              <Table.Th>Statut</Table.Th>
              <Table.Th>Priorité</Table.Th>
              <Table.Th>Assigné à</Table.Th>
              <Table.Th>Date début</Table.Th>
              <Table.Th>Date fin</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tasks.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7} align="center">
                  <Text fz="sm" c="dimmed">Aucune tâche trouvée</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              tasks.map((task) => (
                <Table.Tr key={task._id}>
                  <Table.Td>{task.titre}</Table.Td>
                  <Table.Td>
                    <Badge 
                      color={getStatusColor(task.statut)}
                      leftSection={getStatusIcon(task.statut)}
                    >
                      {task.statut.charAt(0).toUpperCase() + task.statut.slice(1)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getPriorityColor(task.priorite)}>
                      {task.priorite.charAt(0).toUpperCase() + task.priorite.slice(1)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {task.assigneA ? 
                      `${task.assigneA.prenom} ${task.assigneA.nom}` : 
                      <Text fz="sm" c="dimmed">Non assigné</Text>
                    }
                  </Table.Td>
                  <Table.Td>
                    {task.dateDebut ? new Date(task.dateDebut).toLocaleDateString() : '-'}
                  </Table.Td>
                  <Table.Td>
                    {task.dateFin ? new Date(task.dateFin).toLocaleDateString() : '-'}
                  </Table.Td>
                  <Table.Td>
                    <Group spacing={0} position="right">
                      <ActionIcon 
                        color="blue" 
                        onClick={() => navigate(`/taches/${task._id}`)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      
                      <ActionIcon 
                        color="red" 
                        onClick={() => handleDelete(task._id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
        
        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <Group position="center" mt="md">
            <Pagination 
              total={pagination.pages || 1} 
              value={pagination.page || 1}
              onChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
            />
            <Text size="sm" color="dimmed">
              Affichage de {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} tâches
            </Text>
          </Group>
        )}
      </Paper>
    </div>
  );
};

export default TaskList; 