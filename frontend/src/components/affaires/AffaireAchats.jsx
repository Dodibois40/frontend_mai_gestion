import React, { useState, useEffect } from 'react';
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
  Modal,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  LoadingOverlay,
  Alert,
  Grid,
  Divider
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { 
  IconPlus, 
  IconPencil, 
  IconTrash, 
  IconCheck, 
  IconX,
  IconReceipt,
  IconInfoCircle,
  IconAlertCircle
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { createAchat, getAchats, updateAchat, deleteAchat, validerAchat } from '@/services/achatService';
import { getCategoriesAchat } from '@/services/categorieAchatService';

const AffaireAchats = ({ affaireId, onAchatChanged }) => {
  const [achats, setAchats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAchat, setEditingAchat] = useState(null);

  const form = useForm({
    initialValues: {
      fournisseur: '',
      montantHt: 0,
      dateFacture: new Date(),
      dateEcheance: null,
      categorieId: '',
      description: '',
      statut: 'RECU'
    },
    validate: {
      fournisseur: (value) => !value ? 'Le fournisseur est obligatoire' : null,
      montantHt: (value) => !value || value <= 0 ? 'Le montant HT doit être supérieur à 0' : null,
      dateFacture: (value) => !value ? 'La date de facture est obligatoire' : null,
      categorieId: (value) => !value ? 'La catégorie est obligatoire' : null
    }
  });

  useEffect(() => {
    Promise.all([
      fetchAchats(),
      fetchCategories()
    ]);
  }, [affaireId]);

  const fetchAchats = async () => {
    try {
      setLoading(true);
      const response = await getAchats({ affaireId });
      // L'API retourne { achats: Achat[], total: number }
      const achatsData = response?.achats || [];
      setAchats(achatsData);
    } catch (error) {
      console.error('Erreur lors du chargement des achats:', error);
      toast.error('Erreur lors du chargement des achats');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategoriesAchat();
      setCategories(response || []);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const handleCreateAchat = async (values) => {
    try {
      setSubmitting(true);
      
      // Calculer le montant TTC (TVA 20%)
      const montantTtc = values.montantHt * 1.2;
      
      const payload = {
        montantHt: parseFloat(values.montantHt),
        montantTtc: montantTtc,
        dateFacture: values.dateFacture,
        affaireId: affaireId, // Garder comme string UUID
        categorieId: values.categorieId, // Garder comme string UUID
        fournisseur: values.fournisseur,
        commentaire: values.description || '', // Mapper description vers commentaire
        // Retirer les champs non attendus par le backend
        // dateEcheance et statut ne sont pas dans le DTO
      };

      if (editingAchat) {
        await updateAchat(editingAchat.id, payload);
        toast.success('Facture d\'achat modifiée avec succès');
        
        // Émettre un événement pour rafraîchir les données financières
        window.dispatchEvent(new CustomEvent('achat_updated', { 
          detail: { affaireId, action: 'update', factureId: editingAchat.id } 
        }));
      } else {
        const result = await createAchat(payload);
        toast.success('Facture d\'achat créée avec succès');
        
        // Émettre un événement pour rafraîchir les données financières
        window.dispatchEvent(new CustomEvent('achat_updated', { 
          detail: { affaireId, action: 'create', factureId: result.id } 
        }));
      }

      // Refresh achats list
      fetchAchats();
      
      // Notifier le parent que les achats ont changé
      if (onAchatChanged) {
        onAchatChanged();
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la création/modification de l\'achat:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAchat = (achat) => {
    setEditingAchat(achat);
    form.setValues({
      fournisseur: achat.fournisseur,
      montantHt: achat.montantHt,
      dateFacture: new Date(achat.dateFacture),
      dateEcheance: achat.dateEcheance ? new Date(achat.dateEcheance) : null,
      categorieId: achat.categorieId, // Garder comme UUID string
      description: achat.commentaire || '', // Utiliser commentaire au lieu de description
      statut: achat.statut
    });
    setShowModal(true);
  };

  const handleDeleteAchat = async (achatId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture d\'achat ?')) {
      try {
        await deleteAchat(achatId);
        toast.success('Facture d\'achat supprimée avec succès');
        fetchAchats();
        
        // Émettre un événement pour rafraîchir les données financières
        window.dispatchEvent(new CustomEvent('achat_updated', { 
          detail: { affaireId, action: 'delete', factureId: achatId } 
        }));
        
        // Notifier le parent que les achats ont changé
        if (onAchatChanged) {
          onAchatChanged();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleValidateAchat = async (achatId) => {
    try {
      await validerAchat(achatId);
      toast.success('Facture d\'achat validée');
      fetchAchats();
      
      // Émettre un événement pour rafraîchir les données financières
      window.dispatchEvent(new CustomEvent('achat_updated', { 
        detail: { affaireId, action: 'validate', factureId: achatId } 
      }));
      
      // Notifier le parent que les achats ont changé
      if (onAchatChanged) {
        onAchatChanged();
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      toast.error('Erreur lors de la validation');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAchat(null);
    form.reset();
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'RECU': return 'blue';
      case 'VALIDE': return 'green';
      case 'PAYE': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'RECU': return 'Reçu';
      case 'VALIDE': return 'Validé';
      case 'PAYE': return 'Payé';
      default: return statut;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const totalAchats = achats.reduce((sum, achat) => sum + achat.montantHt, 0);
  const achatsValides = achats.filter(achat => achat.statut === 'VALIDE');
  const totalAchatsValides = achatsValides.reduce((sum, achat) => sum + achat.montantHt, 0);

  const selectedCategorie = categories.find(cat => cat.id === form.values.categorieId);
  const montantFg = selectedCategorie && form.values.montantHt 
    ? (form.values.montantHt * selectedCategorie.pourcentageFg / 100)
    : 0;

  return (
    <>
      <Card>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={4}>Factures d'achats directes</Title>
            <Button 
              leftSection={<IconPlus size={16} />}
              onClick={() => setShowModal(true)}
            >
              Ajouter une facture
            </Button>
          </Group>

          <Alert icon={<IconInfoCircle size={16} />} color="blue">
            Factures d'achats saisies directement (sans bon de commande préalable) : 
            achats spontanés, bâches, petit matériel, etc.
          </Alert>

          {/* Statistiques */}
          <Grid>
            <Grid.Col span={4}>
              <Card withBorder>
                <Text size="sm" c="dimmed">Total factures</Text>
                <Text size="xl" fw={700}>{formatCurrency(totalAchats)}</Text>
                <Text size="xs" c="dimmed">{achats.length} facture(s)</Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={4}>
              <Card withBorder>
                <Text size="sm" c="dimmed">Factures validées</Text>
                <Text size="xl" fw={700} c="green">{formatCurrency(totalAchatsValides)}</Text>
                <Text size="xs" c="dimmed">{achatsValides.length} facture(s)</Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={4}>
              <Card withBorder>
                <Text size="sm" c="dimmed">En attente</Text>
                <Text size="xl" fw={700} c="orange">
                  {formatCurrency(totalAchats - totalAchatsValides)}
                </Text>
                <Text size="xs" c="dimmed">{achats.length - achatsValides.length} facture(s)</Text>
              </Card>
            </Grid.Col>
          </Grid>

          <LoadingOverlay visible={loading} />
          
          {achats.length === 0 && !loading ? (
            <Alert icon={<IconAlertCircle size={16} />} color="gray">
              Aucune facture d'achat pour cette affaire.
            </Alert>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>N° Facture</Table.Th>
                  <Table.Th>Fournisseur</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Catégorie</Table.Th>
                  <Table.Th>Montant HT</Table.Th>
                  <Table.Th>Statut</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {achats.map((achat) => {
                  const categorie = categories.find(cat => cat.id === achat.categorieId);
                  
                  return (
                    <Table.Tr key={achat.id}>
                      <Table.Td>
                        <Text fw={500}>{achat.numeroFacture}</Text>
                        <Text size="xs" c="dimmed">{achat.numero}</Text>
                      </Table.Td>
                      <Table.Td>{achat.fournisseur}</Table.Td>
                      <Table.Td>{formatDate(achat.dateFacture)}</Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="blue">
                          {categorie?.intitule || 'Non définie'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={500}>{formatCurrency(achat.montantHt)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getStatusColor(achat.statut)}>
                          {getStatusLabel(achat.statut)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {achat.statut === 'RECU' && (
                            <ActionIcon
                              size="sm"
                              color="green"
                              variant="light"
                              onClick={() => handleValidateAchat(achat.id)}
                            >
                              <IconCheck size={14} />
                            </ActionIcon>
                          )}
                          <ActionIcon
                            size="sm"
                            color="blue"
                            variant="light"
                            onClick={() => handleEditAchat(achat)}
                          >
                            <IconPencil size={14} />
                          </ActionIcon>
                          <ActionIcon
                            size="sm"
                            color="red"
                            variant="light"
                            onClick={() => handleDeleteAchat(achat.id)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Card>

      {/* Modal de création/édition */}
      <Modal
        opened={showModal}
        onClose={handleCloseModal}
        title={
          <Group>
            <IconReceipt size={20} />
            <Text fw={500}>
              {editingAchat ? 'Modifier la facture d\'achat' : 'Nouvelle facture d\'achat'}
            </Text>
          </Group>
        }
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleCreateAchat)}>
          <Stack gap="md">
            <Alert icon={<IconInfoCircle size={16} />} color="blue">
              {editingAchat 
                ? 'Pour les achats avec bon de commande, utilisez l\'onglet "Bons de commande".'
                : 'Le numéro de facture sera généré automatiquement au format : FACT-YYYY-XXX'
              }
            </Alert>

            {editingAchat && (
              <div>
                <Text size="sm" fw={500} mb={4}>Numéro de facture</Text>
                <div style={{
                  padding: 8,
                  backgroundColor: 'var(--mantine-color-gray-0)',
                  border: '1px solid var(--mantine-color-gray-3)',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  color: 'var(--mantine-color-gray-7)'
                }}>
                  {editingAchat.numeroFacture}
                </div>
                <Text size="xs" c="dimmed" mt={4}>
                  Numéro interne : {editingAchat.numero}
                </Text>
              </div>
            )}

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Fournisseur"
                  placeholder="Nom du fournisseur"
                  required
                  {...form.getInputProps('fournisseur')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Catégorie d'achat"
                  placeholder="Sélectionner une catégorie"
                  required
                  data={categories.map(cat => ({
                    value: cat.id, // Garder comme UUID string
                    label: cat.intitule
                  }))}
                  {...form.getInputProps('categorieId')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Montant HT"
                  placeholder="0.00"
                  required
                  min={0}
                  step={0.01}
                  decimalScale={2}
                  fixedDecimalScale
                  suffix=" €"
                  {...form.getInputProps('montantHt')}
                />
                {selectedCategorie && (
                  <Text size="xs" c="dimmed" mt={5}>
                    Frais généraux ({selectedCategorie.pourcentageFg}%) : {formatCurrency(montantFg)}
                  </Text>
                )}
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <DateInput
                  label="Date de facture"
                  placeholder="Sélectionner la date"
                  required
                  {...form.getInputProps('dateFacture')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateInput
                  label="Date d'échéance"
                  placeholder="Optionnelle"
                  {...form.getInputProps('dateEcheance')}
                />
              </Grid.Col>
            </Grid>

            <Select
              label="Statut"
              data={[
                { value: 'RECU', label: 'Reçu' },
                { value: 'VALIDE', label: 'Validé' },
                { value: 'PAYE', label: 'Payé' }
              ]}
              {...form.getInputProps('statut')}
            />

            <Textarea
              label="Description"
              placeholder="Description optionnelle"
              rows={3}
              {...form.getInputProps('description')}
            />

            <Divider />

            <Group justify="flex-end">
              <Button variant="light" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button type="submit" loading={submitting}>
                {editingAchat ? 'Modifier' : 'Créer'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
};

export default AffaireAchats; 