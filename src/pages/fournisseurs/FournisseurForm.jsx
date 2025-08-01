import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Title,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Switch,
  Grid,
  Alert,
  LoadingOverlay,
  Select
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBuilding, IconArrowLeft, IconDeviceFloppy, IconAlertCircle } from '@tabler/icons-react';
import {
  createFournisseur,
  getFournisseur,
  updateFournisseur
} from '@/services/fournisseurService';
import { CATEGORIES_OPTIONS } from '@/utils/fournisseurCategories';

const FournisseurForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm({
    initialValues: {
      nom: '',
      codeClient: '',
      enCompte: false,
      categorie: '',
      adresse: '',
      telephone: '',
      email: '',
      contact: '',
      commentaire: '',
      actif: true,
    },
    validate: {
      nom: (value) => !value ? 'Le nom du fournisseur est obligatoire' : null,
      email: (value) => value && !/^\S+@\S+$/.test(value) ? 'Format d\'email invalide' : null,
    }
  });

  // Charger les données du fournisseur si on est en mode édition
  useEffect(() => {
    if (isEditing) {
      loadFournisseur();
    }
  }, [id, isEditing]);

  const loadFournisseur = async () => {
    try {
      setInitialLoading(true);
      const fournisseur = await getFournisseur(id);
      form.setValues({
        nom: fournisseur.nom || '',
        codeClient: fournisseur.codeClient || '',
        enCompte: fournisseur.enCompte || false,
        categorie: fournisseur.categorie || '',
        adresse: fournisseur.adresse || '',
        telephone: fournisseur.telephone || '',
        email: fournisseur.email || '',
        contact: fournisseur.contact || '',
        commentaire: fournisseur.commentaire || '',
        actif: fournisseur.actif !== undefined ? fournisseur.actif : true,
      });
    } catch (error) {
      console.error('Erreur lors du chargement du fournisseur:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de charger les données du fournisseur',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Nettoyer les données avant envoi
      const cleanedValues = {
        ...values,
        // Convertir les chaînes vides en null pour les champs optionnels
        codeClient: values.codeClient?.trim() || null,
        categorie: values.categorie || null,
        adresse: values.adresse?.trim() || null,
        telephone: values.telephone?.trim() || null,
        email: values.email?.trim() || null,
        contact: values.contact?.trim() || null,
        commentaire: values.commentaire?.trim() || null,
      };
      
      console.log('Données nettoyées à envoyer:', cleanedValues);
      
      if (isEditing) {
        await updateFournisseur(id, cleanedValues);
        notifications.show({
          title: 'Succès',
          message: 'Fournisseur modifié avec succès',
          color: 'green',
        });
      } else {
        await createFournisseur(cleanedValues);
        notifications.show({
          title: 'Succès',
          message: 'Fournisseur créé avec succès',
          color: 'green',
        });
      }
      
      navigate('/fournisseurs');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      let message = 'Une erreur est survenue lors de la sauvegarde';
      
      if (error.response?.status === 409) {
        message = 'Un fournisseur avec ce nom existe déjà';
      } else if (error.response?.status === 400) {
        // Afficher le message d'erreur de validation du serveur
        const serverMessage = error.response?.data?.message;
        if (Array.isArray(serverMessage)) {
          message = serverMessage.join(', ');
        } else if (typeof serverMessage === 'string') {
          message = serverMessage;
        } else {
          message = 'Données de formulaire invalides';
        }
      }
      
      notifications.show({
        title: 'Erreur',
        message,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <LoadingOverlay visible={true} />
          <div style={{ height: 200 }} />
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <LoadingOverlay visible={loading} />
        
        <Group position="apart" mb="md">
          <Group>
            <IconBuilding size={24} />
            <Title order={2}>
              {isEditing ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
            </Title>
          </Group>
          <Button
            variant="outline"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/fournisseurs')}
          >
            Retour
          </Button>
        </Group>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
              Les champs marqués d'un * sont obligatoires
            </Alert>

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Nom du fournisseur"
                  placeholder="ex: Menuiseries Dupont SARL"
                  required
                  {...form.getInputProps('nom')}
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <TextInput
                  label="Code client"
                  placeholder="ex: CLI-001234"
                  description="Votre code client chez ce fournisseur"
                  {...form.getInputProps('codeClient')}
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <Select
                  label="Catégorie"
                  placeholder="Sélectionner une catégorie"
                  description="Domaine d'activité du fournisseur"
                  data={CATEGORIES_OPTIONS}
                  clearable
                  searchable
                  {...form.getInputProps('categorie')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Téléphone"
                  placeholder="ex: 01.23.45.67.89"
                  {...form.getInputProps('telephone')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Email"
                  placeholder="ex: contact@fournisseur.fr"
                  type="email"
                  {...form.getInputProps('email')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Personne de contact"
              placeholder="ex: Jean Dupont"
              description="Nom de votre interlocuteur principal"
              {...form.getInputProps('contact')}
            />

            <Textarea
              label="Adresse"
              placeholder="Adresse complète du fournisseur"
              rows={2}
              {...form.getInputProps('adresse')}
            />

            <Textarea
              label="Commentaire"
              placeholder="Notes ou informations complémentaires..."
              rows={3}
              {...form.getInputProps('commentaire')}
            />

            <Grid>
              <Grid.Col span={6}>
                <Switch
                  label="En compte"
                  description="Indique si vous êtes en compte avec ce fournisseur"
                  {...form.getInputProps('enCompte', { type: 'checkbox' })}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Switch
                  label="Actif"
                  description="Fournisseur actif dans le système"
                  {...form.getInputProps('actif', { type: 'checkbox' })}
                />
              </Grid.Col>
            </Grid>

            <Group position="right" mt="xl">
              <Button
                variant="outline"
                onClick={() => navigate('/fournisseurs')}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                leftSection={<IconDeviceFloppy size={16} />}
                loading={loading}
              >
                {isEditing ? 'Modifier' : 'Créer'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </div>
  );
};

export default FournisseurForm; 