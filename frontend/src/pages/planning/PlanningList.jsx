import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Title, 
  Group, 
  Table, 
  Badge, 
  ActionIcon, 
  Text,
  Card,
  Menu,
  Flex,
  Loader,
  Modal,
  Box,
  TextInput,
  Select,
  SegmentedControl,
  Tabs,
  Divider,
  Paper,
  Avatar,
  Tooltip,
  rem,
  SimpleGrid,
  Pagination
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconPencil, 
  IconTrash, 
  IconPlus, 
  IconSearch, 
  IconFilter, 
  IconSortAscending,
  IconSortDescending,
  IconCalendarStats,
  IconDotsVertical,
  IconEye,
  IconDownload,
  IconCopy,
  IconChecks,
  IconX,
  IconClock,
  IconListDetails,
  IconLayoutGrid
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { getAllPlannings, deletePlanning } from '@/services/planningService';
import { Button } from '@/components/ui/button';

// Fonction pour formater les dates
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Badge pour les statuts
const StatusBadge = ({ status }) => {
  let color;
  let icon;
  
  switch (status) {
    case 'En cours':
      color = 'blue';
      icon = <IconClock size={14} />;
      break;
    case 'Terminé':
      color = 'green';
      icon = <IconChecks size={14} />;
      break;
    case 'En attente':
      color = 'yellow';
      icon = <IconClock size={14} />;
      break;
    default:
      color = 'gray';
      icon = null;
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      color === 'blue' ? 'bg-blue-100 text-blue-800' :
      color === 'green' ? 'bg-green-100 text-green-800' :
      color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {icon && <span className="mr-1">{icon}</span>}
      {status}
    </span>
  );
};

// Composant pour afficher un planning en mode grille
const PlanningCard = ({ planning, onEdit, onDelete, ...props }) => {
  return (
    <Card withBorder shadow="sm" radius="md" padding="lg" {...props}>
      <Card.Section withBorder p="md">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={700} truncate>{planning.titre}</Text>
          <Menu position="bottom-end" withArrow shadow="md">
            <Menu.Target>
              <button className="p-1 rounded hover:bg-gray-100" aria-label="Options">
                <IconDotsVertical size={18} />
              </button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEye size={14} />} onClick={() => onEdit(planning)}>
                Afficher les détails
              </Menu.Item>
              <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEdit(planning)}>
                Modifier
              </Menu.Item>
              <Menu.Item leftSection={<IconCopy size={14} />}>
                Dupliquer
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<IconDownload size={14} />}>
                Exporter
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                leftSection={<IconTrash size={14} />} 
                color="red" 
                onClick={() => onDelete(planning)}
              >
                Supprimer
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Card.Section>
      
      <Box mt="md">
        <Text size="sm" lineClamp={2} mb="md">
          {planning.description || 'Aucune description'}
        </Text>
        
        <Group gap="xs" mb="md">
          <StatusBadge status={planning.statut} />
        </Group>
        
        <Divider my="sm" />
        
        <Group position="apart">
          <div>
            <Text size="xs" c="dimmed">Date de début</Text>
            <Text size="sm" fw={500}>{formatDate(planning.dateDebut)}</Text>
          </div>
          
          <div>
            <Text size="xs" c="dimmed" ta="right">Date de fin</Text>
            <Text size="sm" fw={500} ta="right">{formatDate(planning.dateFin) || '-'}</Text>
          </div>
        </Group>
        
        {planning.responsable && (
          <>
            <Divider my="sm" />
            <Group>
              <Avatar color="blue" radius="xl" size="sm">
                {planning.responsable.nom ? planning.responsable.nom.charAt(0) : 'U'}
              </Avatar>
              <div>
                <Text size="xs" c="dimmed">Responsable</Text>
                <Text size="sm">{planning.responsable.nom || 'Non assigné'}</Text>
              </div>
            </Group>
          </>
        )}
        
        <Group mt="lg" justify="flex-end">
          <Button variant="light" size="xs" onClick={() => onEdit(planning)}>
            Modifier
          </Button>
        </Group>
      </Box>
    </Card>
  );
};

function PlanningList() {
  const [plannings, setPlannings] = useState([]);
  const [filteredPlannings, setFilteredPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlanning, setSelectedPlanning] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [viewMode, setViewMode] = useState('list');
  const [filterValue, setFilterValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortDirection, setSortDirection] = useState('desc');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const navigate = useNavigate();

  // Charger les plannings avec pagination
  const fetchPlannings = async () => {
    setLoading(true);
    try {
      const result = await getAllPlannings({
        page: pagination.page,
        limit: pagination.limit,
        search: filterValue,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort: sortDirection
      });
      
      setPlannings(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.total
      }));
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des plannings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les plannings au chargement initial et lors des changements de filtres/pagination
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPlannings();
    }, 300); // Debounce de 300ms pour éviter trop de requêtes

    return () => clearTimeout(debounceTimer);
  }, [pagination.page, filterValue, statusFilter, sortDirection]);

  // Gérer le changement de page
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Gérer le changement de filtre avec debounce
  const handleFilterChange = (value) => {
    setFilterValue(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Réinitialiser à la première page
  };

  // Gérer le changement de statut
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Réinitialiser à la première page
  };

  // Gérer le changement de tri
  const handleSortChange = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    setPagination(prev => ({ ...prev, page: 1 })); // Réinitialiser à la première page
  };

  // Fonction pour ouvrir le modal de confirmation de suppression
  const handleOpenDeleteModal = (planning) => {
    setSelectedPlanning(planning);
    open();
  };

  // Fonction pour supprimer un planning
  const handleDeletePlanning = async () => {
    if (!selectedPlanning) return;
    
    try {
      await deletePlanning(selectedPlanning._id);
      
      // Notification de succès
      try {
        notifications.show({
          title: 'Planning supprimé',
          message: `Le planning "${selectedPlanning.titre}" a été supprimé avec succès`,
          color: 'green',
        });
      } catch (error) {
        console.error("Erreur lors de l'affichage de la notification", error);
      }
      
      await fetchPlannings(); // Recharger la liste
      close();
    } catch (err) {
      setError('Erreur lors de la suppression du planning');
      console.error(err);
      
      try {
        notifications.show({
          title: 'Erreur',
          message: 'Impossible de supprimer le planning',
          color: 'red',
        });
      } catch (error) {
        console.error("Erreur lors de l'affichage de la notification", error);
      }
    }
  };

  // Actions rapides pour les plannings
  const handleEditPlanning = (planning) => {
    navigate(`/plannings/${planning._id}`);
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-16">
        <Loader size="lg" />
      </Box>
    );
  }

  return (
    <div>
      <Card p="lg" withBorder shadow="sm" radius="md" mb="lg">
        <Flex justify="space-between" align="center" mb="md">
          <Title>Plannings</Title>
          <LinkButton 
            to="/plannings/nouveau" 
            leftSection={<IconPlus size={16} />}
          >
            Nouveau Planning
          </LinkButton>
        </Flex>

        <Tabs defaultValue="all" mb="lg">
          <Tabs.List>
            <Tabs.Tab value="all" leftSection={<IconCalendarStats size={16} />}>
              Tous les plannings
            </Tabs.Tab>
            <Tabs.Tab value="recent" leftSection={<IconCalendarStats size={16} />}>
              Récents
            </Tabs.Tab>
            <Tabs.Tab value="upcoming" leftSection={<IconCalendarStats size={16} />}>
              À venir
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <Group mb="lg">
          <TextInput
            placeholder="Rechercher..."
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1 }}
            value={filterValue}
            onChange={(e) => handleFilterChange(e.currentTarget.value)}
          />
          
          <Select
            placeholder="Statut"
            data={[
              { value: 'all', label: 'Tous les statuts' },
              { value: 'En cours', label: 'En cours' },
              { value: 'Terminé', label: 'Terminé' },
              { value: 'En attente', label: 'En attente' },
            ]}
            leftSection={<IconFilter size={16} />}
            value={statusFilter}
            onChange={handleStatusChange}
            w={200}
          />
          
          <Tooltip label={sortDirection === 'asc' ? 'Plus récent d\'abord' : 'Plus ancien d\'abord'}>
            <ActionIcon variant="subtle" onClick={handleSortChange}>
              {sortDirection === 'asc' ? <IconSortAscending size={18} /> : <IconSortDescending size={18} />}
            </ActionIcon>
          </Tooltip>
          
          <SegmentedControl
            data={[
              { value: 'list', label: <IconListDetails size={16} /> },
              { value: 'grid', label: <IconLayoutGrid size={16} /> },
            ]}
            value={viewMode}
            onChange={setViewMode}
          />
        </Group>

        {error && (
          <Card shadow="sm" withBorder mb="md" className="bg-red-50">
            <Text color="red">{error}</Text>
          </Card>
        )}

        {filteredPlannings.length === 0 ? (
          <Paper shadow="sm" withBorder p="xl" radius="md" className="text-center">
            <Text size="lg" mb="md">Aucun planning disponible</Text>
            <Button 
              component={Link} 
              to="/plannings/nouveau" 
              variant="outline"
              leftSection={<IconPlus size={16} />}
            >
              Créer un planning
            </Button>
          </Paper>
        ) : viewMode === 'list' ? (
          <Box style={{ overflowX: 'auto' }}>
            <Table striped highlightOnHover verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Titre</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Date début</Table.Th>
                  <Table.Th>Date fin</Table.Th>
                  <Table.Th>Statut</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredPlannings.map((planning) => (
                  <Table.Tr key={planning._id}>
                    <Table.Td>
                      <Text fw={500}>{planning.titre}</Text>
                    </Table.Td>
                    <Table.Td>
                      {planning.description 
                        ? planning.description.length > 30 
                          ? `${planning.description.substring(0, 30)}...` 
                          : planning.description 
                        : '-'}
                    </Table.Td>
                    <Table.Td>{formatDate(planning.dateDebut)}</Table.Td>
                    <Table.Td>{formatDate(planning.dateFin)}</Table.Td>
                    <Table.Td>
                      <StatusBadge status={planning.statut} />
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Group gap="xs" justify="flex-end">
                        <TooltipWithRef label="Modifier">
                          <ActionIconWithRef 
                            variant="subtle" 
                            color="blue"
                            onClick={() => handleEditPlanning(planning)}
                          >
                            <IconPencil size={16} stroke={1.5} />
                          </ActionIconWithRef>
                        </TooltipWithRef>
                        <Menu position="bottom-end" withArrow shadow="md">
                          <Menu.Target>
                            <ActionIconWithRef variant="subtle">
                              <IconDotsVertical size={16} stroke={1.5} />
                            </ActionIconWithRef>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item leftSection={<IconEye size={14} />}>
                              Afficher les détails
                            </Menu.Item>
                            <Menu.Item leftSection={<IconCopy size={14} />}>
                              Dupliquer
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item 
                              leftSection={<IconTrash size={14} />} 
                              color="red"
                              onClick={() => handleOpenDeleteModal(planning)}
                            >
                              Supprimer
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        ) : (
          <SimpleGrid
            cols={{ base: 1, xs: 2, md: 3, xl: 4 }}
            spacing="lg"
          >
            {filteredPlannings.map((planning) => (
              <PlanningCard
                key={planning._id}
                planning={planning}
                onEdit={handleEditPlanning}
                onDelete={handleOpenDeleteModal}
              />
            ))}
          </SimpleGrid>
        )}
      </Card>

      {/* Modal de confirmation de suppression */}
      <Modal opened={opened} onClose={close} title="Confirmer la suppression" centered>
        <Text mb="md">
          Êtes-vous sûr de vouloir supprimer le planning "{selectedPlanning?.titre}" ?
          Cette action est irréversible.
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" onClick={close} leftSection={<IconX size={16} />}>
            Annuler
          </Button>
          <Button 
            color="red" 
            onClick={handleDeletePlanning}
            leftSection={<IconTrash size={16} />}
          >
            Supprimer
          </Button>
        </Group>
      </Modal>

      {/* Ajout de la pagination */}
      <Pagination
        total={Math.ceil(pagination.total / pagination.limit)}
        value={pagination.page}
        onChange={handlePageChange}
        mt="md"
        position="center"
      />
    </div>
  );
}

export default PlanningList; 