import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Title,
  Paper,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Button,
  Group,
  Stack,
  Alert,
  LoadingOverlay,
  Grid,
  Card,
  Text,
  Badge,
  Divider
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconReceipt, IconInfoCircle, IconDeviceFloppy, IconArrowLeft } from '@tabler/icons-react';

// Services
import { createAchat, updateAchat, getAchat } from '@/services/achatService';
import { affairesService } from '@/services/affairesService';
import { getCategoriesAchat } from '@/services/categorieAchatService';
import FournisseurSelect from '@/components/affaires/FournisseurSelect';

const AchatForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [affaires, setAffaires] = useState([]);
  const [categories, setCategories] = useState([]);

  const form = useForm({
    initialValues: {
      numero: '', // Sera généré automatiquement côté backend
      fournisseur: '',
      montantHt: 0,
      dateFacture: new Date(),
      dateEcheance: null,
      affaireId: '',
      categorieId: '',
      description: '',
      numeroFacture: '',
      statut: 'RECU'
    },
    validate: {
      fournisseur: (value) => !value ? 'Le fournisseur est obligatoire' : null,
      montantHt: (value) => value <= 0 ? 'Le montant HT doit être supérieur à 0' : null,
      dateFacture: (value) => !value ? 'La date de facture est obligatoire' : null,
      affaireId: (value) => !value ? 'L\'affaire est obligatoire' : null,
      categorieId: (value) => !value ? 'La catégorie est obligatoire' : null,
      numeroFacture: (value) => !value ? 'Le numéro de facture est obligatoire' : null
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true);
        
        // Charger les affaires et catégories
        const [affairesResponse, categoriesResponse] = await Promise.all([
          affairesService.getAffaires({ take: 1000 }),
          getCategoriesAchat()
        ]);

        setAffaires(affairesResponse.affaires || []);
        setCategories(categoriesResponse || []);

        // Si édition, charger l'achat
        if (isEditing) {
          const achat = await getAchat(id);
          form.setValues({
            numero: achat.numero,
            fournisseur: achat.fournisseur,
            montantHt: achat.montantHt,
            dateFacture: new Date(achat.dateFacture),
            dateEcheance: achat.dateEcheance ? new Date(achat.dateEcheance) : null,
            affaireId: achat.affaireId?.toString(),
            categorieId: achat.categorieId?.toString(),
            description: achat.description || '',
            numeroFacture: achat.numeroFacture,
            statut: achat.statut
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Impossible de charger les données',
          color: 'red'
        });
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [id, isEditing]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const payload = {
        ...values,
        affaireId: values.affaireId, // Garder en string pour compatibilité
        categorieId: values.categorieId, // Garder en string pour compatibilité
        dateFacture: values.dateFacture,
        dateEcheance: values.dateEcheance,
        montantTtc: values.montantHt ? Math.round(values.montantHt * 1.2 * 100) / 100 : 0
      };

      if (isEditing) {
        await updateAchat(id, payload);
        notifications.show({
          title: 'Succès',
          message: 'Facture d\'achat modifiée avec succès',
          color: 'green'
        });
      } else {
        await createAchat(payload);
        notifications.show({
          title: 'Succès',
          message: 'Facture d\'achat créée avec succès',
          color: 'green'
        });
      }
      
      navigate('/achats');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      notifications.show({
        title: 'Erreur',
        message: error.response?.data?.message || 'Erreur lors de la sauvegarde',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Container size="md">
        <LoadingOverlay visible />
      </Container>
    );
  }

  const selectedCategorie = categories.find(cat => cat.id.toString() === form.values.categorieId);
  const montantFg = selectedCategorie && form.values.montantHt 
    ? (form.values.montantHt * (selectedCategorie.pourcentageFg || 0) / 100)
    : 0;

  // Options pour les sélecteurs
  const affairesOptions = affaires.map(affaire => ({
    value: affaire.id.toString(),
    label: `${affaire.numero} - ${affaire.description}`
  }));

  const categoriesOptions = categories.map(cat => ({
    value: cat.id.toString(),
    label: cat.nom
  }));

  const statutsOptions = [
    { value: 'RECU', label: 'Reçu' },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'PAYE', label: 'Payé' },
    { value: 'ANNULE', label: 'Annulé' }
  ];

  return (
    <Container size="md">
      <Stack gap="lg">
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={20} />}
            onClick={() => navigate('/achats')}
          >
            Retour aux achats
          </Button>
        </Group>

        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group>
              <IconReceipt size={24} />
              <Title order={2}>
                {isEditing ? 'Modifier la facture d\'achat' : 'Créer une facture d\'achat'}
              </Title>
            </Group>

            <Alert icon={<IconInfoCircle size={16} />} color="blue">
              Utilisez ce formulaire pour saisir directement une facture d'achat sans passer par un bon de commande 
              (ex: bâche, petit matériel, achats spontanés).
            </Alert>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Numéro de facture fournisseur"
                      placeholder="F-2025-001"
                      required
                      {...form.getInputProps('numeroFacture')}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <FournisseurSelect
                      label="Fournisseur"
                      placeholder="Sélectionner un fournisseur"
                      required
                      {...form.getInputProps('fournisseur')}
                    />
                  </Grid.Col>
                </Grid>

                <Grid>
                  <Grid.Col span={6}>
                    <DateInput
                      label="Date de facture"
                      placeholder="Sélectionner une date"
                      required
                      {...form.getInputProps('dateFacture')}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <DateInput
                      label="Date d'échéance (optionnelle)"
                      placeholder="Sélectionner une date"
                      {...form.getInputProps('dateEcheance')}
                    />
                  </Grid.Col>
                </Grid>

                <Grid>
                  <Grid.Col span={6}>
                    <Select
                      label="Affaire"
                      placeholder="Sélectionner une affaire"
                      data={affairesOptions}
                      required
                      searchable
                      {...form.getInputProps('affaireId')}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      label="Catégorie d'achat"
                      placeholder="Sélectionner une catégorie"
                      data={categoriesOptions}
                      required
                      {...form.getInputProps('categorieId')}
                    />
                  </Grid.Col>
                </Grid>

                <Grid>
                  <Grid.Col span={4}>
                    <NumberInput
                      label="Montant HT (€)"
                      placeholder="0.00"
                      required
                      min={0}
                      decimalScale={2}
                      fixedDecimalScale
                      {...form.getInputProps('montantHt')}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <NumberInput
                      label="Montant TTC (€)"
                      placeholder="Calculé automatiquement"
                      disabled
                      min={0}
                      decimalScale={2}
                      fixedDecimalScale
                      value={form.values.montantHt ? Math.round(form.values.montantHt * 1.2 * 100) / 100 : 0}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Select
                      label="Statut"
                      data={statutsOptions}
                      required
                      {...form.getInputProps('statut')}
                    />
                  </Grid.Col>
                </Grid>

                <Textarea
                  label="Description / Commentaire"
                  placeholder="Détails sur l'achat..."
                  minRows={3}
                  {...form.getInputProps('description')}
                />

                {selectedCategorie && form.values.montantHt > 0 && (
                  <Card withBorder>
                    <Title order={4} mb="sm">Résumé financier</Title>
                    <Grid>
                      <Grid.Col span={6}>
                        <Text size="sm" c="dimmed">Montant HT</Text>
                        <Text fw={500}>{form.values.montantHt.toFixed(2)} €</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" c="dimmed">TVA (20%)</Text>
                        <Text fw={500}>{(form.values.montantHt * 0.2).toFixed(2)} €</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" c="dimmed">Montant TTC</Text>
                        <Text fw={700} c="blue">{(form.values.montantHt * 1.2).toFixed(2)} €</Text>
                      </Grid.Col>
                      {montantFg > 0 && (
                        <Grid.Col span={6}>
                          <Text size="sm" c="dimmed">Frais généraux estimés</Text>
                          <Text fw={500} c="orange">{montantFg.toFixed(2)} €</Text>
                        </Grid.Col>
                      )}
                    </Grid>
                  </Card>
                )}

                <Divider />

                <Group justify="flex-end">
                  <Button 
                    variant="light" 
                    onClick={() => navigate('/achats')}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    loading={loading}
                    leftSection={<IconDeviceFloppy size={16} />}
                  >
                    {isEditing ? 'Modifier' : 'Créer la facture'}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default AchatForm; 