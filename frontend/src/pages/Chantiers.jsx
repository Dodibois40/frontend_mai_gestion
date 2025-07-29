import { useState, useEffect } from 'react';
import { 
  Title, 
  Button, 
  Group, 
  Table, 
  Text, 
  Badge, 
  ActionIcon, 
  Modal, 
  TextInput, 
  Select, 
  Tabs, 
  Card, 
  Tooltip, 
  Divider,
  NumberInput,
  Box,
  Paper,
  Grid
} from '@mantine/core';
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconEye, 
  IconBuildingFactory, 
  IconCurrencyEuro, 
  IconChartBar,
  IconClock,
  IconCalendar,
  IconUser
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import axios from 'axios';

// Service pour les appels API
const API_URL = '/api/chantiers';

// Composant principal
function Chantiers() {
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [modalFinanceOuvert, setModalFinanceOuvert] = useState(false);
  const [chantierActuel, setChantierActuel] = useState(null);
  const [typeFinance, setTypeFinance] = useState('estimation'); // 'estimation' ou 'reel'

  // Formulaire pour la création/modification d'un chantier
  const form = useForm({
    initialValues: {
      nom: '',
      code: '',
      client: '',
      dateDebut: null,
      dateFin: null,
      statut: 'En préparation',
      description: '',
      adresse: '',
      responsable: ''
    },
    validate: {
      nom: (value) => (value.trim().length < 2 ? 'Le nom doit contenir au moins 2 caractères' : null),
      code: (value) => (value.trim().length < 2 ? 'Le code doit contenir au moins 2 caractères' : null),
      client: (value) => (value.trim().length < 2 ? 'Le nom du client est requis' : null),
      dateDebut: (value) => (!value ? 'La date de début est requise' : null),
      dateFin: (value) => (!value ? 'La date de fin est requise' : null)
    }
  });

  // Formulaire pour les données financières
  const formFinance = useForm({
    initialValues: {
      montantMarcheSigne: 0,
      budgetDepenses: 0,
      achatMatieresPremieres: 0,
      sousTraitance: 0,
      tempsFabrication: 0,
      tempsPause: 0
    },
    validate: {
      montantMarcheSigne: (value) => (value < 0 ? 'Le montant ne peut pas être négatif' : null),
      budgetDepenses: (value) => (value < 0 ? 'Le budget ne peut pas être négatif' : null),
      achatMatieresPremieres: (value) => (value < 0 ? 'Le montant ne peut pas être négatif' : null),
      sousTraitance: (value) => (value < 0 ? 'Le montant ne peut pas être négatif' : null),
      tempsFabrication: (value) => (value < 0 ? 'Le temps ne peut pas être négatif' : null),
      tempsPause: (value) => (value < 0 ? 'Le temps ne peut pas être négatif' : null)
    }
  });

  // Récupérer les chantiers
  const fetchChantiers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setChantiers(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des chantiers:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de récupérer les chantiers',
        color: 'red',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChantiers();
  }, []);

  // Ouvrir le modal pour ajouter un chantier
  const ajouterChantier = () => {
    form.reset();
    setChantierActuel(null);
    setModalOuvert(true);
  };

  // Ouvrir le modal pour modifier un chantier
  const modifierChantier = (chantier) => {
    form.setValues({
      nom: chantier.nom,
      code: chantier.code,
      client: chantier.client,
      dateDebut: new Date(chantier.dateDebut),
      dateFin: new Date(chantier.dateFin),
      statut: chantier.statut,
      description: chantier.description || '',
      adresse: chantier.adresse || '',
      responsable: chantier.responsable || ''
    });
    setChantierActuel(chantier);
    setModalOuvert(true);
  };

  // Ouvrir le modal pour la gestion financière
  const gererFinances = (chantier, type) => {
    setChantierActuel(chantier);
    setTypeFinance(type); // 'estimation' ou 'reel'

    // Charger les données financières existantes
    const donnees = chantier[type] || {
      montantMarcheSigne: 0,
      budgetDepenses: 0,
      achatMatieresPremieres: 0,
      sousTraitance: 0,
      tempsFabrication: 0,
      tempsPause: 0
    };

    formFinance.setValues(donnees);
    setModalFinanceOuvert(true);
  };

  // Enregistrer un chantier
  const handleSubmit = async (values) => {
    try {
      if (chantierActuel) {
        // Mettre à jour un chantier existant
        await axios.put(`${API_URL}/${chantierActuel._id}`, values);
        notifications.show({
          title: 'Succès',
          message: 'Chantier mis à jour avec succès',
          color: 'green',
        });
      } else {
        // Créer un nouveau chantier
        await axios.post(API_URL, values);
        notifications.show({
          title: 'Succès',
          message: 'Chantier créé avec succès',
          color: 'green',
        });
      }
      setModalOuvert(false);
      fetchChantiers();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du chantier:', error);
      notifications.show({
        title: 'Erreur',
        message: error.response?.data?.message || 'Une erreur est survenue',
        color: 'red',
      });
    }
  };

  // Enregistrer les données financières
  const handleSubmitFinance = async (values) => {
    try {
      await axios.put(`${API_URL}/${chantierActuel._id}/finances`, {
        type: typeFinance,
        donnees: values
      });
      
      notifications.show({
        title: 'Succès',
        message: `Données financières (${typeFinance === 'estimation' ? 'Estimation' : 'Réel'}) mises à jour avec succès`,
        color: 'green',
      });
      
      setModalFinanceOuvert(false);
      fetchChantiers();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des données financières:', error);
      notifications.show({
        title: 'Erreur',
        message: error.response?.data?.message || 'Une erreur est survenue',
        color: 'red',
      });
    }
  };

  // Supprimer un chantier
  const supprimerChantier = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chantier ?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        notifications.show({
          title: 'Succès',
          message: 'Chantier supprimé avec succès',
          color: 'green',
        });
        fetchChantiers();
      } catch (error) {
        console.error('Erreur lors de la suppression du chantier:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Impossible de supprimer le chantier',
          color: 'red',
        });
      }
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'En préparation': return 'blue';
      case 'En cours': return 'green';
      case 'En pause': return 'yellow';
      case 'Terminé': return 'teal';
      case 'Annulé': return 'red';
      default: return 'gray';
    }
  };

  // Calculer la marge (différence entre montant signé et budget dépenses)
  const calculerMarge = (finances) => {
    if (!finances) return 0;
    return finances.montantMarcheSigne - finances.budgetDepenses;
  };

  return (
    <div>
      <Group position="apart" mb="lg">
        <Title>Gestion des Chantiers</Title>
        <Button 
                      leftSection={<IconPlus size={18} />} 
          onClick={ajouterChantier}
        >
          Nouveau Chantier
        </Button>
      </Group>

      {/* Liste des chantiers */}
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Code</th>
            <th>Nom</th>
            <th>Client</th>
            <th>Statut</th>
            <th>Date début</th>
            <th>Date fin</th>
            <th>Marché signé (€)</th>
            <th>Marge prev. (€)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={9}><Text align="center">Chargement...</Text></td>
            </tr>
          ) : chantiers.length === 0 ? (
            <tr>
              <td colSpan={9}><Text align="center">Aucun chantier trouvé</Text></td>
            </tr>
          ) : (
            chantiers.map((chantier) => (
              <tr key={chantier._id}>
                <td>{chantier.code}</td>
                <td>{chantier.nom}</td>
                <td>{chantier.client}</td>
                <td>
                  <Badge color={getStatusColor(chantier.statut)}>{chantier.statut}</Badge>
                </td>
                <td>{new Date(chantier.dateDebut).toLocaleDateString()}</td>
                <td>{new Date(chantier.dateFin).toLocaleDateString()}</td>
                <td>{chantier.estimation?.montantMarcheSigne?.toLocaleString() || 0} €</td>
                <td>
                  <Text c={chantier.margePrevisionnelle >= 0 ? 'green' : 'red'} fw={500}>
                    {chantier.margePrevisionnelle?.toLocaleString() || 0} €
                  </Text>
                </td>
                <td>
                  <Group spacing={5}>
                    <Tooltip label="Modifier">
                      <ActionIcon onClick={() => modifierChantier(chantier)} color="blue">
                        <IconEdit size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Gérer l'estimation">
                      <ActionIcon onClick={() => gererFinances(chantier, 'estimation')} color="teal">
                        <IconChartBar size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Gérer le réel">
                      <ActionIcon onClick={() => gererFinances(chantier, 'reel')} color="violet">
                        <IconCurrencyEuro size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Supprimer">
                      <ActionIcon onClick={() => supprimerChantier(chantier._id)} color="red">
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modal pour ajouter/modifier un chantier */}
      <Modal
        opened={modalOuvert}
        onClose={() => setModalOuvert(false)}
        title={chantierActuel ? "Modifier le chantier" : "Nouveau chantier"}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid gutter="md">
            <Grid.Col span={6}>
              <TextInput
                label="Nom du chantier"
                placeholder="Ex: Rénovation bureaux Paris"
                required
                {...form.getInputProps('nom')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Code du chantier"
                placeholder="Ex: CHAN-2023-001"
                required
                {...form.getInputProps('code')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="Client"
                placeholder="Nom du client"
                required
                {...form.getInputProps('client')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <DatePickerInput
                label="Date de début"
                placeholder="Sélectionner une date"
                required
                {...form.getInputProps('dateDebut')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <DatePickerInput
                label="Date de fin"
                placeholder="Sélectionner une date"
                required
                {...form.getInputProps('dateFin')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Statut"
                data={[
                  { value: 'En préparation', label: 'En préparation' },
                  { value: 'En cours', label: 'En cours' },
                  { value: 'En pause', label: 'En pause' },
                  { value: 'Terminé', label: 'Terminé' },
                  { value: 'Annulé', label: 'Annulé' }
                ]}
                required
                {...form.getInputProps('statut')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="Adresse"
                placeholder="Adresse du chantier"
                {...form.getInputProps('adresse')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="Description"
                placeholder="Description du chantier"
                {...form.getInputProps('description')}
              />
            </Grid.Col>
          </Grid>

          <Group position="right" mt="md">
            <Button variant="outline" onClick={() => setModalOuvert(false)}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </Group>
        </form>
      </Modal>

      {/* Modal pour la gestion financière */}
      <Modal
        opened={modalFinanceOuvert}
        onClose={() => setModalFinanceOuvert(false)}
        title={
          <Group>
            <IconCurrencyEuro size={20} />
            <Text fw={500}>
              {typeFinance === 'estimation' ? 'Estimation financière' : 'Données financières réelles'} - {chantierActuel?.nom}
            </Text>
          </Group>
        }
        size="lg"
      >
        <form onSubmit={formFinance.onSubmit(handleSubmitFinance)}>
          <Paper p="md" withBorder mb="md">
            <Title order={4} mb="sm">Données {typeFinance === 'estimation' ? 'prévisionnelles' : 'réelles'}</Title>
            
            <Grid gutter="md">
              <Grid.Col span={6}>
                <NumberInput
                  label="Montant du marché signé (€)"
                  placeholder="0"
                  precision={2}
                  min={0}
                  step={1000}
                  {...formFinance.getInputProps('montantMarcheSigne')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Budget des dépenses (€)"
                  placeholder="0"
                  precision={2}
                  min={0}
                  step={1000}
                  {...formFinance.getInputProps('budgetDepenses')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Achat des matières premières (€)"
                  placeholder="0"
                  precision={2}
                  min={0}
                  step={500}
                  {...formFinance.getInputProps('achatMatieresPremieres')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Sous-traitance (€)"
                  placeholder="0"
                  precision={2}
                  min={0}
                  step={500}
                  {...formFinance.getInputProps('sousTraitance')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Temps de fabrication (h)"
                  placeholder="0"
                  precision={1}
                  min={0}
                  step={4}
                  {...formFinance.getInputProps('tempsFabrication')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Temps de pause (h)"
                  placeholder="0"
                  precision={1}
                  min={0}
                  step={1}
                  {...formFinance.getInputProps('tempsPause')}
                />
              </Grid.Col>
            </Grid>

            <Divider my="md" />

            <Box>
              <Text fw={500} mb={5}>Marge calculée:</Text>
              <Text size="xl" fw={700} c={
                formFinance.values.montantMarcheSigne - formFinance.values.budgetDepenses >= 0 
                  ? 'green' 
                  : 'red'
                }
              >
                {(formFinance.values.montantMarcheSigne - formFinance.values.budgetDepenses).toLocaleString()} €
              </Text>
            </Box>
          </Paper>

          <Group position="right" mt="md">
            <Button variant="outline" onClick={() => setModalFinanceOuvert(false)}>Annuler</Button>
            <Button type="submit" color={typeFinance === 'estimation' ? 'teal' : 'violet'}>
              Enregistrer
            </Button>
          </Group>
        </form>
      </Modal>
    </div>
  );
}

export default Chantiers;
