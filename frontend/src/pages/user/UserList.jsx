import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Title, Button, Group, Paper, Text, Badge, ActionIcon, Menu, Select, TextInput, Table, Pagination, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconSearch, IconFilter, IconEdit, IconTrash, IconDotsVertical, IconUser } from '@tabler/icons-react';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [filters, setFilters] = useState({
    search: '',
    role: ''
  });
  
  // Simuler le chargement des utilisateurs
  useEffect(() => {
    setLoading(true);
    
    // Données statiques temporaires pour la démo
    setTimeout(() => {
      const mockUsers = [
        { _id: '1', nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com', role: 'admin', poste: 'Directeur', actif: true },
        { _id: '2', nom: 'Martin', prenom: 'Sophie', email: 'sophie.martin@example.com', role: 'manager', poste: 'Chef de projet', actif: true },
        { _id: '3', nom: 'Durand', prenom: 'Pierre', email: 'pierre.durand@example.com', role: 'utilisateur', poste: 'Développeur', actif: true }
      ];
      
      setUsers(mockUsers);
      setPagination({ page: 1, limit: 10, total: mockUsers.length, pages: 1 });
      setLoading(false);
    }, 500);
  }, []);
  
  // Obtenir la couleur du badge en fonction du rôle
  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'red';
      case 'manager': return 'blue';
      case 'utilisateur': return 'green';
      default: return 'gray';
    }
  };
  
  // Simuler la suppression d'un utilisateur
  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(user => user._id !== id));
      notifications.show({
        title: 'Succès',
        message: 'Utilisateur supprimé avec succès',
        color: 'green'
      });
    }
  };
  
  return (
    <div>
      <Group position="apart" mb="md">
        <Title>Gestion des Collaborateurs</Title>
        
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate('/collaborateurs/nouveau')}
        >
          Nouveau Collaborateur
        </Button>
      </Group>
      
      {/* Filtres */}
      <Paper p="md" mb="lg">
        <Group>
          <TextInput
            placeholder="Rechercher un collaborateur..."
            icon={<IconSearch size={16} />}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            style={{ flex: 1 }}
          />
          
          <Select
            placeholder="Rôle"
            icon={<IconFilter size={16} />}
            clearable
            data={[
              { value: 'admin', label: 'Administrateur' },
              { value: 'manager', label: 'Manager' },
              { value: 'utilisateur', label: 'Utilisateur' }
            ]}
            value={filters.role}
            onChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
          />
          
          <Button onClick={() => console.log('Filtrer')}>
            Filtrer
          </Button>
        </Group>
      </Paper>
      
      {/* Tableau des collaborateurs */}
      <Paper p="md" pos="relative">
        <LoadingOverlay visible={loading} />
        
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nom</Table.Th>
              <Table.Th>Prénom</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Poste</Table.Th>
              <Table.Th>Rôle</Table.Th>
              <Table.Th>Statut</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7} align="center">
                  <Text fz="sm" c="dimmed">Aucun collaborateur trouvé</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              users.map((user) => (
                <Table.Tr key={user._id}>
                  <Table.Td>{user.nom}</Table.Td>
                  <Table.Td>{user.prenom}</Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>{user.poste}</Table.Td>
                  <Table.Td>
                    <Badge color={getRoleBadgeColor(user.role)}>
                      {user.role === 'admin' && 'Administrateur'}
                      {user.role === 'manager' && 'Manager'}
                      {user.role === 'utilisateur' && 'Utilisateur'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={user.actif ? 'green' : 'red'}>
                      {user.actif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group spacing={0} position="right">
                      <ActionIcon 
                        color="blue" 
                        onClick={() => navigate(`/collaborateurs/${user._id}`)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      
                      <ActionIcon 
                        color="red" 
                        onClick={() => handleDelete(user._id)}
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
        {pagination.total > 0 && (
          <Group position="center" mt="md">
            <Pagination 
              total={pagination.pages} 
              value={pagination.page}
              onChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
            <Text size="sm" color="dimmed">
              Affichage de {(pagination.page - 1) * pagination.limit + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} collaborateurs
            </Text>
          </Group>
        )}
      </Paper>
    </div>
  );
};

export default UserList; 