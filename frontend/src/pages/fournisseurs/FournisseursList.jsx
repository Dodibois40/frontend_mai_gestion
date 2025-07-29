import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Title,
  Table,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  ActionIcon,
  TextInput,
  Select,
  Pagination,
  LoadingOverlay,
  Modal,
  Grid,
  Alert,
  Menu
} from '@mantine/core';
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconSearch,
  IconBuilding,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconRefresh,
  IconDots,
  IconEye,
  IconEyeOff
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import {
  getFournisseurs,
  deleteFournisseur,
  reactivateFournisseur,
  getFournisseurStats,
  deleteFournisseurPermanent
} from '@/services/fournisseurService';
import { CATEGORIES_OPTIONS, getCategorieLabel, getCategorieColor } from '@/utils/fournisseurCategories';

const FournisseursList = () => {
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);

  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteType, setDeleteType] = useState('soft'); // 'soft' ou 'hard'
  
  // Filtres et pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [compteFilter, setCompteFilter] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const pageSize = 10;

  useEffect(() => {
    loadFournisseurs();
    loadStats();
  }, [currentPage, search, statusFilter, compteFilter, categorieFilter]);

  const loadFournisseurs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      if (search) params.search = search;
      if (statusFilter) params.actif = statusFilter;
      if (compteFilter) params.enCompte = compteFilter;
      if (categorieFilter) params.categorie = categorieFilter;

      const response = await getFournisseurs(params);
      setFournisseurs(response.fournisseurs);
      setTotalItems(response.total);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de charger les fournisseurs',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getFournisseurStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadFournisseurs();
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter('');
    setCompteFilter('');
    setCategorieFilter('');
    setCurrentPage(1);
  };

  const handleDelete = (fournisseur, type = 'soft') => {
    setSelectedFournisseur(fournisseur);
    setDeleteType(type);
    open();
  };

  const confirmDelete = async () => {
    if (!selectedFournisseur) return;

    try {
      setActionLoading(true);
      
      if (deleteType === 'hard') {
        await deleteFournisseurPermanent(selectedFournisseur.id);
        notifications.show({
          title: 'Succès',
          message: 'Fournisseur supprimé définitivement avec succès',
          color: 'green',
        });
      } else {
        await deleteFournisseur(selectedFournisseur.id);
        notifications.show({
          title: 'Succès',
          message: 'Fournisseur désactivé avec succès',
          color: 'green',
        });
      }
      
      loadFournisseurs();
      loadStats();
    } catch (error) {
      console.error(`Erreur lors de la ${deleteType === 'hard' ? 'suppression' : 'désactivation'}:`, error);
      notifications.show({
        title: 'Erreur',
        message: `Impossible de ${deleteType === 'hard' ? 'supprimer' : 'désactiver'} le fournisseur`,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setActionLoading(false);
      close();
      setSelectedFournisseur(null);
    }
  };

  const handleReactivate = async (fournisseur) => {
    try {
      setActionLoading(true);
      await reactivateFournisseur(fournisseur.id);
      notifications.show({
        title: 'Succès',
        message: 'Fournisseur réactivé avec succès',
        color: 'green',
      });
      loadFournisseurs();
      loadStats();
    } catch (error) {
      console.error('Erreur lors de la réactivation:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de réactiver le fournisseur',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Stack spacing="lg">
        {/* En-tête avec statistiques */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group position="apart" mb="md">
            <Group>
              <IconBuilding size={24} />
              <Title order={2}>Gestion des fournisseurs</Title>
            </Group>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate('/fournisseurs/nouveau')}
            >
              Nouveau fournisseur
            </Button>
          </Group>

          {stats && (
            <Grid>
              <Grid.Col span={3}>
                <Text size="sm" color="dimmed">Total</Text>
                <Text size="xl" weight={600}>{stats.total}</Text>
              </Grid.Col>
              <Grid.Col span={3}>
                <Text size="sm" color="dimmed">Actifs</Text>
                <Text size="xl" weight={600} color="green">{stats.actifs}</Text>
              </Grid.Col>
              <Grid.Col span={3}>
                <Text size="sm" color="dimmed">Inactifs</Text>
                <Text size="xl" weight={600} color="red">{stats.inactifs}</Text>
              </Grid.Col>
              <Grid.Col span={3}>
                <Text size="sm" color="dimmed">En compte</Text>
                <Text size="xl" weight={600} color="blue">{stats.enCompte}</Text>
              </Grid.Col>
            </Grid>
          )}
        </Card>

        {/* Filtres */}
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Group>
            <TextInput
              placeholder="Rechercher par nom, contact ou email..."
              icon={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Statut"
              value={statusFilter}
              onChange={setStatusFilter}
              data={[
                { value: '', label: 'Tous' },
                { value: 'true', label: 'Actifs' },
                { value: 'false', label: 'Inactifs' },
              ]}
              clearable
              style={{ width: 120 }}
            />
            <Select
              placeholder="En compte"
              value={compteFilter}
              onChange={setCompteFilter}
              data={[
                { value: '', label: 'Tous' },
                { value: 'true', label: 'En compte' },
                { value: 'false', label: 'Pas en compte' },
              ]}
              clearable
              style={{ width: 140 }}
            />
            <Select
              placeholder="Catégorie"
              value={categorieFilter}
              onChange={setCategorieFilter}
              data={[
                { value: '', label: 'Toutes' },
                ...CATEGORIES_OPTIONS
              ]}
              clearable
              style={{ width: 150 }}
            />
            <Button onClick={handleSearch} leftSection={<IconSearch size={16} />}>
              Rechercher
            </Button>
            <Button variant="outline" onClick={handleReset} leftSection={<IconRefresh size={16} />}>
              Réinitialiser
            </Button>
          </Group>
        </Card>

        {/* Tableau */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <LoadingOverlay visible={loading} />
          
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Code client</th>
                <th>Contact</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>En compte</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fournisseurs.map((fournisseur) => (
                <tr key={fournisseur.id}>
                  <td>
                    <Text weight={500}>{fournisseur.nom}</Text>
                  </td>
                  <td>
                    {fournisseur.categorie ? (
                      <Badge 
                        color={getCategorieColor(fournisseur.categorie)} 
                        variant="light"
                        size="sm"
                      >
                        {getCategorieLabel(fournisseur.categorie)}
                      </Badge>
                    ) : (
                      <Text size="sm" color="dimmed">-</Text>
                    )}
                  </td>
                  <td>
                    <Text size="sm">{fournisseur.codeClient || '-'}</Text>
                  </td>
                  <td>
                    <Text size="sm">{fournisseur.contact || '-'}</Text>
                  </td>
                  <td>
                    <Text size="sm">{fournisseur.telephone || '-'}</Text>
                  </td>
                  <td>
                    <Text size="sm">{fournisseur.email || '-'}</Text>
                  </td>
                  <td>
                    {fournisseur.enCompte ? (
                      <Badge color="blue" variant="light">
                        <IconCheck size={12} style={{ marginRight: 4 }} />
                        En compte
                      </Badge>
                    ) : (
                      <Badge color="gray" variant="light">
                        <IconX size={12} style={{ marginRight: 4 }} />
                        Non
                      </Badge>
                    )}
                  </td>
                  <td>
                    <Badge
                      color={fournisseur.actif ? 'green' : 'red'}
                      variant="light"
                    >
                      {fournisseur.actif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td>
                    <Group spacing="xs">
                      <ActionIcon
                        color="blue"
                        variant="light"
                        onClick={() => navigate(`/fournisseurs/${fournisseur.id}/modifier`)}
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                      
                      {fournisseur.actif ? (
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <ActionIcon color="red" variant="light">
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              icon={<IconEyeOff size={14} />}
                              onClick={() => handleDelete(fournisseur, 'soft')}
                            >
                              Désactiver
                            </Menu.Item>
                            <Menu.Item
                              icon={<IconTrash size={14} />}
                              color="red"
                              onClick={() => handleDelete(fournisseur, 'hard')}
                            >
                              Supprimer définitivement
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      ) : (
                        <ActionIcon
                          color="green"
                          variant="light"
                          onClick={() => handleReactivate(fournisseur)}
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {fournisseurs.length === 0 && !loading && (
            <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light" mt="md">
              Aucun fournisseur trouvé avec les critères sélectionnés.
            </Alert>
          )}

          {totalPages > 1 && (
            <Group position="center" mt="md">
              <Pagination
                value={currentPage}
                onChange={setCurrentPage}
                total={totalPages}
                size="sm"
              />
              <Text size="sm" color="dimmed">
                {totalItems} fournisseur{totalItems > 1 ? 's' : ''} au total
              </Text>
            </Group>
          )}
        </Card>

        {/* Modal de confirmation de suppression */}
        <Modal
          opened={opened}
          onClose={close}
          title={deleteType === 'hard' ? 'Confirmer la suppression définitive' : 'Confirmer la désactivation'}
          centered
        >
          <Stack spacing="md">
            <Alert 
              icon={<IconAlertCircle size={16} />} 
              color={deleteType === 'hard' ? 'red' : 'orange'} 
              variant="light"
            >
              Êtes-vous sûr de vouloir {deleteType === 'hard' ? 'supprimer définitivement' : 'désactiver'} le fournisseur <strong>{selectedFournisseur?.nom}</strong> ?
            </Alert>
            <Text size="sm" color="dimmed">
              {deleteType === 'hard' 
                ? '⚠️ Cette action est irréversible ! Le fournisseur et toutes ses données seront définitivement supprimés.'
                : 'Le fournisseur sera désactivé mais ses données seront conservées. Vous pourrez le réactiver plus tard si nécessaire.'
              }
            </Text>
            <Group position="right">
              <Button variant="outline" onClick={close}>
                Annuler
              </Button>
              <Button
                color="red"
                onClick={confirmDelete}
                loading={actionLoading}
              >
                {deleteType === 'hard' ? 'Supprimer définitivement' : 'Désactiver'}
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </div>
  );
};

export default FournisseursList; 