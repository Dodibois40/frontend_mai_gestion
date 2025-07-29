import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextInput, Button, Paper, Title, Select, Textarea, Group, Slider, Text, LoadingOverlay, Stack, MultiSelect } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconArrowLeft, IconCalendarEvent, IconClockHour4 } from '@tabler/icons-react';
import taskService from '@/services/taskService';
import { useAuth } from '../../contexts/AuthContext';

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [plannings, setPlannings] = useState([]);
  
  // Initialiser le formulaire
  const form = useForm({
    initialValues: {
      titre: '',
      description: '',
      statut: 'à faire',
      priorite: 'moyenne',
      dateDebut: new Date(),
      dateFin: null,
      assigneA: '',
      planningId: '',
      tags: [],
      completionPourcentage: 0
    },
    validate: {
      titre: (value) => (value.length >= 3 ? null : 'Le titre doit contenir au moins 3 caractères'),
      dateDebut: (value) => (value ? null : 'La date de début est requise')
    }
  });
  
  // Charger les données de la tâche si on est en mode édition
  useEffect(() => {
    const fetchData = async () => {
      // Charger les utilisateurs et plannings (simulé)
      setUsers([
        { value: '1', label: 'Jean Dupont' },
        { value: '2', label: 'Marie Martin' },
        { value: '3', label: 'Pierre Durand' }
      ]);
      
      setPlannings([
        { value: '1', label: 'Planning Q3 2025' },
        { value: '2', label: 'Planning Marketing' },
        { value: '3', label: 'Planning RH' }
      ]);
      
      if (id && id !== 'nouveau') {
        setInitialLoading(true);
        try {
          const task = await taskService.getTaskById(id);
          
          // Format dates for the form
          const dateDebut = task.dateDebut ? new Date(task.dateDebut) : null;
          const dateFin = task.dateFin ? new Date(task.dateFin) : null;
          
          form.setValues({
            titre: task.titre,
            description: task.description || '',
            statut: task.statut,
            priorite: task.priorite,
            dateDebut,
            dateFin,
            assigneA: task.assigneA ? task.assigneA._id : '',
            planningId: task.planningId ? task.planningId._id : '',
            tags: task.tags || [],
            completionPourcentage: task.completionPourcentage || 0
          });
        } catch (error) {
          console.error('Erreur lors du chargement de la tâche:', error);
          notifications.show({
            title: 'Erreur',
            message: 'Impossible de charger la tâche',
            color: 'red'
          });
          navigate('/taches');
        } finally {
          setInitialLoading(false);
        }
      }
    };
    
    fetchData();
  }, [id]);
  
  // Gestion de la soumission du formulaire
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (id && id !== 'nouveau') {
        // Mode édition
        await taskService.updateTask(id, values);
        notifications.show({
          title: 'Succès',
          message: 'Tâche mise à jour avec succès',
          color: 'green'
        });
      } else {
        // Mode création
        await taskService.createTask({
          ...values,
          creePar: user.id
        });
        notifications.show({
          title: 'Succès',
          message: 'Tâche créée avec succès',
          color: 'green'
        });
      }
      navigate('/taches');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la tâche:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de sauvegarder la tâche',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper p="lg" pos="relative">
      <LoadingOverlay visible={initialLoading} />
      
      <Group position="apart" mb="md">
        <Button 
          variant="outline" 
                      leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/taches')}
        >
          Retour à la liste
        </Button>
      </Group>
      
      <Title order={2} mb="xl">
        {id && id !== 'nouveau' ? 'Modifier la tâche' : 'Nouvelle tâche'}
      </Title>
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <TextInput
            required
            label="Titre"
            placeholder="Titre de la tâche"
            {...form.getInputProps('titre')}
            disabled={loading}
          />
          
          <Textarea
            label="Description"
            placeholder="Description détaillée de la tâche"
            minRows={3}
            {...form.getInputProps('description')}
            disabled={loading}
          />
          
          <Group grow>
            <Select
              required
              label="Statut"
              placeholder="Sélectionner un statut"
              data={[
                { value: 'à faire', label: 'À faire' },
                { value: 'en cours', label: 'En cours' },
                { value: 'terminée', label: 'Terminée' }
              ]}
              {...form.getInputProps('statut')}
              disabled={loading}
            />
            
            <Select
              required
              label="Priorité"
              placeholder="Sélectionner une priorité"
              data={[
                { value: 'basse', label: 'Basse' },
                { value: 'moyenne', label: 'Moyenne' },
                { value: 'haute', label: 'Haute' }
              ]}
              {...form.getInputProps('priorite')}
              disabled={loading}
            />
          </Group>
          
          <Group grow>
            <DatePicker
              required
              label="Date de début"
              placeholder="Sélectionner une date"
              leftSection={<IconCalendarEvent size={16} />}
              value={form.values.dateDebut}
              onChange={(date) => form.setFieldValue('dateDebut', date)}
              error={form.errors.dateDebut}
              disabled={loading}
            />
            
            <DatePicker
              label="Date de fin"
              placeholder="Sélectionner une date"
              leftSection={<IconCalendarEvent size={16} />}
              value={form.values.dateFin}
              onChange={(date) => form.setFieldValue('dateFin', date)}
              disabled={loading}
            />
          </Group>
          
          <Group grow>
            <Select
              label="Assigné à"
              placeholder="Sélectionner un utilisateur"
              data={users}
              {...form.getInputProps('assigneA')}
              disabled={loading}
              clearable
            />
            
            <Select
              label="Planning associé"
              placeholder="Sélectionner un planning"
              data={plannings}
              {...form.getInputProps('planningId')}
              disabled={loading}
              clearable
            />
          </Group>
          
          <MultiSelect
            label="Tags"
            placeholder="Ajouter des tags"
            data={['Urgent', 'Important', 'BugFix', 'Feature', 'Documentation']}
            {...form.getInputProps('tags')}
            disabled={loading}
            searchable
            creatable
            getCreateLabel={(query) => `+ Créer "${query}"`}
            onCreate={(query) => {
              const item = { value: query, label: query };
              return item;
            }}
          />
          
          <div>
            <Text size="sm" mb={5}>Progression: {form.values.completionPourcentage}%</Text>
            <Slider
              min={0}
              max={100}
              step={5}
              label={(value) => `${value}%`}
              {...form.getInputProps('completionPourcentage')}
              disabled={loading}
            />
          </div>
          
          <Group position="right" mt="xl">
            <Button
              variant="outline"
              onClick={() => navigate('/taches')}
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

export default TaskForm; 