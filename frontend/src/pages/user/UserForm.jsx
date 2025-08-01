import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Group, Paper, Title, Select, Switch, LoadingOverlay, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconArrowLeft, IconUser, IconAt, IconBriefcase, IconLock } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  
  // Initialiser le formulaire
  const form = useForm({
    initialValues: {
      nom: '',
      prenom: '',
      email: '',
      password: '',
      role: 'utilisateur',
      poste: '',
      actif: true
    },
    validate: {
      nom: (value) => (value.length >= 2 ? null : 'Le nom doit contenir au moins 2 caractères'),
      prenom: (value) => (value.length >= 2 ? null : 'Le prénom doit contenir au moins 2 caractères'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email invalide'),
      password: (value) => (!id && value.length < 6 ? 'Le mot de passe doit contenir au moins 6 caractères' : null),
      poste: (value) => (value.length >= 2 ? null : 'Le poste doit contenir au moins 2 caractères')
    }
  });
  
  // Charger les données de l'utilisateur si on est en mode édition
  useEffect(() => {
    if (id && id !== 'nouveau') {
      setInitialLoading(true);
      
      // Simuler le chargement des données
      setTimeout(() => {
        // Données statiques pour la démo
        const mockUser = {
          _id: id,
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@example.com',
          role: 'admin',
          poste: 'Directeur',
          actif: true
        };
        
        form.setValues({
          ...mockUser,
          password: ''  // Ne pas remplir le mot de passe
        });
        
        setInitialLoading(false);
      }, 500);
    }
  }, [id]);
  
  // Gestion de la soumission du formulaire
  const handleSubmit = async (values) => {
    setLoading(true);
    
    // Créer ou mettre à jour l'utilisateur (simulé)
    setTimeout(() => {
      try {
        if (id && id !== 'nouveau') {
          notifications.show({
            title: 'Succès',
            message: 'Collaborateur mis à jour avec succès',
            color: 'green'
          });
        } else {
          notifications.show({
            title: 'Succès',
            message: 'Collaborateur créé avec succès',
            color: 'green'
          });
        }
        
        navigate('/collaborateurs');
      } catch (error) {
        console.error('Erreur:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Une erreur est survenue',
          color: 'red'
        });
      } finally {
        setLoading(false);
      }
    }, 1000);
  };
  
  return (
    <Paper p="lg" pos="relative">
      <LoadingOverlay visible={initialLoading} />
      
      <Group position="apart" mb="md">
        <Button 
          variant="outline" 
                      leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/collaborateurs')}
        >
          Retour à la liste
        </Button>
      </Group>
      
      <Title order={2} mb="xl">
        {id && id !== 'nouveau' ? 'Modifier le collaborateur' : 'Nouveau collaborateur'}
      </Title>
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <Group grow>
            <TextInput
              required
              label="Nom"
              placeholder="Nom de famille"
              icon={<IconUser size={16} />}
              {...form.getInputProps('nom')}
              disabled={loading}
            />
            
            <TextInput
              required
              label="Prénom"
              placeholder="Prénom"
              icon={<IconUser size={16} />}
              {...form.getInputProps('prenom')}
              disabled={loading}
            />
          </Group>
          
          <TextInput
            required
            label="Email"
            placeholder="email@exemple.com"
            icon={<IconAt size={16} />}
            {...form.getInputProps('email')}
            disabled={loading || (id && id !== 'nouveau')}
          />
          
          <TextInput
            label="Poste"
            placeholder="Poste ou fonction"
            icon={<IconBriefcase size={16} />}
            {...form.getInputProps('poste')}
            disabled={loading}
          />
          
          <Select
            required
            label="Rôle"
            placeholder="Sélectionner un rôle"
            data={[
              { value: 'admin', label: 'Administrateur' },
              { value: 'manager', label: 'Manager' },
              { value: 'utilisateur', label: 'Utilisateur' }
            ]}
            {...form.getInputProps('role')}
            disabled={loading || (currentUser?.role !== 'admin')}
          />
          
          {(!id || id === 'nouveau') && (
            <PasswordInput
              required
              label="Mot de passe"
              placeholder="Mot de passe sécurisé"
              icon={<IconLock size={16} />}
              {...form.getInputProps('password')}
              disabled={loading}
            />
          )}
          
          {id && id !== 'nouveau' && (
            <PasswordInput
              label="Nouveau mot de passe"
              placeholder="Laisser vide pour ne pas changer"
              description="Laisser vide pour conserver le mot de passe actuel"
              icon={<IconLock size={16} />}
              {...form.getInputProps('password')}
              disabled={loading}
            />
          )}
          
          <Switch
            label="Compte actif"
            checked={form.values.actif}
            onChange={(event) => form.setFieldValue('actif', event.currentTarget.checked)}
            disabled={loading}
          />
          
          <Group position="right" mt="xl">
            <Button
              variant="outline"
              onClick={() => navigate('/collaborateurs')}
              disabled={loading}
            >
              Annuler
            </Button>
            
            <Button
              type="submit"
              leftSection={<IconDeviceFloppy size={16} />}
              loading={loading}
            >
              Enregistrer
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default UserForm; 