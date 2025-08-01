import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Title, 
  TextInput, 
  Textarea, 
  Button, 
  Group, 
  Card, 
  Select,
  Text,
  Loader,
  Grid,
  Divider,
  Paper,
  Avatar,
  Stack,
  Box,
  Alert,
  ThemeIcon,
  Tooltip,
  ActionIcon,
  Stepper,
  MultiSelect
} from '@mantine/core';
import { DateInput, DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { 
  IconArrowLeft, 
  IconDeviceFloppy,
  IconAlertCircle,
  IconUsers,
  IconInfoCircle,
  IconCheck,
  IconX,
  IconClock,
  IconCalendarEvent,
  IconTrash,
  IconFilePlus,
  IconEye
} from '@tabler/icons-react';
import { 
  getPlanningById, 
  createPlanning, 
  updatePlanning 
} from '@/services/planningService';

function PlanningForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const isEditing = !!id;

  // Liste fictive des responsables potentiels
  const responsableOptions = [
    { value: '1', label: 'Jean Dupont' },
    { value: '2', label: 'Marie Durand' },
    { value: '3', label: 'Philippe Martin' },
    { value: '4', label: 'Sophie Bernard' },
  ];

  // Liste fictive des participants potentiels
  const participantsOptions = [
    { value: '1', label: 'Jean Dupont' },
    { value: '2', label: 'Marie Durand' },
    { value: '3', label: 'Philippe Martin' },
    { value: '4', label: 'Sophie Bernard' },
    { value: '5', label: 'Thomas Robert' },
    { value: '6', label: 'Isabelle Petit' },
    { value: '7', label: 'Luc Moreau' },
    { value: '8', label: 'Laura Simon' },
  ];

  // Initialiser le formulaire avec Mantine Form
  const form = useForm({
    initialValues: {
      titre: localStorage.getItem('planning_titre') || '',
      description: localStorage.getItem('planning_description') || '',
      dateDebut: localStorage.getItem('planning_dateDebut') ? new Date(localStorage.getItem('planning_dateDebut')) : null,
      dateFin: localStorage.getItem('planning_dateFin') ? new Date(localStorage.getItem('planning_dateFin')) : null,
      statut: localStorage.getItem('planning_statut') || 'En attente',
      responsable: localStorage.getItem('planning_responsable') || '',
      participants: localStorage.getItem('planning_participants') ? JSON.parse(localStorage.getItem('planning_participants')) : [],
      priorite: localStorage.getItem('planning_priorite') || 'Normale',
      lieu: localStorage.getItem('planning_lieu') || '',
      notes: localStorage.getItem('planning_notes') || '',
    },
    validate: {
      titre: (value) => {
        if (!value || value.trim().length < 3) {
          return 'Le titre doit contenir au moins 3 caractères';
        }
        return null;
      },
      dateDebut: (value) => (!value ? 'La date de début est requise' : null),
    }
  });

  // Sauvegarder les valeurs du formulaire dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('planning_titre', form.values.titre);
    localStorage.setItem('planning_description', form.values.description);
    localStorage.setItem('planning_statut', form.values.statut);
    localStorage.setItem('planning_priorite', form.values.priorite);
    localStorage.setItem('planning_responsable', form.values.responsable);
    localStorage.setItem('planning_participants', JSON.stringify(form.values.participants));
    localStorage.setItem('planning_lieu', form.values.lieu);
    localStorage.setItem('planning_notes', form.values.notes);
    
    if (form.values.dateDebut) {
      localStorage.setItem('planning_dateDebut', form.values.dateDebut.toString());
    }
    if (form.values.dateFin) {
      localStorage.setItem('planning_dateFin', form.values.dateFin.toString());
    }
    
    // Sauvegarder l'étape courante
    localStorage.setItem('planning_currentStep', currentStep.toString());
  }, [form.values, currentStep]);
  
  // Restaurer l'étape courante au chargement du composant
  useEffect(() => {
    const savedStep = localStorage.getItem('planning_currentStep');
    if (savedStep !== null) {
      setCurrentStep(parseInt(savedStep, 10));
    }
  }, []);

  // Charger les données du planning si en mode édition
  useEffect(() => {
    if (isEditing) {
      const fetchPlanning = async () => {
        try {
          setInitialLoading(true);
          const planning = await getPlanningById(id);
          
          form.setValues({
            titre: planning.titre || '',
            description: planning.description || '',
            dateDebut: planning.dateDebut ? new Date(planning.dateDebut) : null,
            dateFin: planning.dateFin ? new Date(planning.dateFin) : null,
            statut: planning.statut || 'En attente',
            responsable: planning.responsable?._id || '',
            participants: [],
            priorite: 'Normale',
            lieu: '',
            notes: '',
          });
          
          setError(null);
        } catch (err) {
          setError('Erreur lors du chargement du planning');
          console.error(err);
          notifications.show({
            title: 'Erreur',
            message: 'Impossible de charger les informations du planning',
            color: 'red',
          });
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchPlanning();
    }
  }, [id, isEditing]);

  // Fonction pour soumettre le formulaire
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      // Vérifiez que nous avons au moins le titre et la date de début
      if (!values.titre || !values.dateDebut) {
        setError("Le titre et la date de début sont requis");
        return;
      }
      
      // S'assurer que les dates sont bien des objets Date
      const dateDebut = values.dateDebut instanceof Date ? values.dateDebut : new Date(values.dateDebut);
      const dateFin = values.dateFin instanceof Date ? values.dateFin : (values.dateFin ? new Date(values.dateFin) : undefined);
      
      // Vérifier la validité des dates
      if (isNaN(dateDebut.getTime())) {
        setError("La date de début n'est pas valide");
        return;
      }
      
      if (dateFin && isNaN(dateFin.getTime())) {
        setError("La date de fin n'est pas valide");
        return;
      }
      
      // Préparer les données du planning
      const planningData = {
        titre: values.titre,
        description: values.description || undefined,
        dateDebut: dateDebut,
        dateFin: dateFin,
        statut: values.statut,
        responsable: values.responsable || undefined,
        lieu: values.lieu || undefined,
        notes: values.notes || undefined
      };
      
      // Appel API avec gestion d'erreur détaillée
      if (isEditing) {
        try {
          await updatePlanning(id, planningData);
          notifications.show({
            title: 'Planning mis à jour',
            message: 'Le planning a été mis à jour avec succès',
            color: 'green',
          });
          navigate('/plannings');
        } catch (err) {
          console.error('Erreur lors de la mise à jour du planning:', err);
          setError(`Erreur lors de la mise à jour du planning: ${err.message || 'Erreur inconnue'}`);
        }
      } else {
        try {
          await createPlanning(planningData);
          notifications.show({
            title: 'Planning créé',
            message: 'Le nouveau planning a été créé avec succès',
            color: 'green',
          });
          navigate('/plannings');
        } catch (err) {
          console.error('Erreur lors de la création du planning:', err);
          setError(`Erreur lors de la création du planning: ${err.message || 'Erreur inconnue'}`);
        }
      }
    } catch (err) {
      console.error('Erreur générale:', err);
      setError(`Erreur: ${err.message || 'Une erreur inattendue est survenue'}`);
    } finally {
      setLoading(false);
    }
  };

  // Gérer le changement d'étape dans le stepper
  const nextStep = () => {
    try {
      console.log("Bouton suivant cliqué, étape actuelle:", currentStep);
      
      // Utilisation d'une méthode simple pour éviter les problèmes de transition
      if (currentStep === 0) {
        // Validation simplifiée
        const titre = form.values.titre || '';
        if (titre.trim().length >= 3) {
          form.clearErrors('titre');
          // Navigation manuelle vers l'étape suivante
          setTimeout(() => setCurrentStep(1), 10);
        } else {
          form.setFieldError('titre', 'Le titre doit contenir au moins 3 caractères');
        }
      } else if (currentStep === 1) {
        if (form.values.dateDebut) {
          form.clearErrors('dateDebut');
          // Navigation manuelle vers l'étape suivante
          setTimeout(() => setCurrentStep(2), 10);
        } else {
          form.setFieldError('dateDebut', 'La date de début est requise');
        }
      } else if (currentStep === 2) {
        // Pas de validation pour la dernière étape
        setTimeout(() => setCurrentStep(3), 10);
      }
    } catch (error) {
      console.error("Erreur lors du changement d'étape:", error);
    }
  };

  const prevStep = () => setCurrentStep(current => (current > 0 ? current - 1 : current));

  // Aperçu du planning
  const PlanningPreview = () => (
    <Paper withBorder p="lg" radius="md">
      <Group mb="md">
        <ThemeIcon color="blue" size="lg" radius="xl">
          <IconCalendarEvent size={20} />
        </ThemeIcon>
        <Box>
          <Text fw={700} size="lg">{form.values.titre}</Text>
          <Text size="sm" c="dimmed">
            {form.values.dateDebut 
              ? `Du ${form.values.dateDebut.toLocaleDateString('fr-FR')}` 
              : 'Date non définie'} 
            {form.values.dateFin 
              ? ` au ${form.values.dateFin.toLocaleDateString('fr-FR')}` 
              : ''}
          </Text>
        </Box>
      </Group>
      
      <Divider mb="md" />
      
      <Grid mb="md">
        <Grid.Col span={6}>
          <Text size="sm" fw={500}>Statut</Text>
          <BadgeWithRef color={
            form.values.statut === 'En cours' ? 'blue' : 
            form.values.statut === 'Terminé' ? 'green' : 'yellow'
          }>{form.values.statut}</BadgeWithRef>
        </Grid.Col>
        
        <Grid.Col span={6}>
          <Text size="sm" fw={500}>Priorité</Text>
          <BadgeWithRef color={
            form.values.priorite === 'Haute' ? 'red' : 
            form.values.priorite === 'Normale' ? 'blue' : 'green'
          }>{form.values.priorite}</BadgeWithRef>
        </Grid.Col>
      </Grid>
      
      <Text size="sm" fw={500} mb="xs">Description</Text>
      <Text size="sm" mb="lg" style={{ whiteSpace: 'pre-wrap' }}>
        {form.values.description || 'Aucune description fournie'}
      </Text>
      
      {form.values.lieu && (
        <>
          <Text size="sm" fw={500} mb="xs">Lieu</Text>
          <Text size="sm" mb="lg">
            {form.values.lieu}
          </Text>
        </>
      )}
      
      <Grid>
        <Grid.Col span={6}>
          <Text size="sm" fw={500} mb="xs">Responsable</Text>
          <Group>
            {form.values.responsable ? (
              <>
                <Avatar color="blue" radius="xl" size="sm">
                  {responsableOptions.find(r => r.value === form.values.responsable)?.label.charAt(0) || 'R'}
                </Avatar>
                <Text size="sm">
                  {responsableOptions.find(r => r.value === form.values.responsable)?.label || 'Non assigné'}
                </Text>
              </>
            ) : (
              <Text size="sm" c="dimmed">Non assigné</Text>
            )}
          </Group>
        </Grid.Col>
        
        <Grid.Col span={6}>
          <Text size="sm" fw={500} mb="xs">Participants</Text>
          {form.values.participants && form.values.participants.length > 0 ? (
            <Group>
              {form.values.participants.slice(0, 3).map((p) => (
                <Avatar key={p} color="green" radius="xl" size="sm">
                  {participantsOptions.find(opt => opt.value === p)?.label.charAt(0) || 'P'}
                </Avatar>
              ))}
              {form.values.participants.length > 3 && (
                <Avatar radius="xl" size="sm">
                  +{form.values.participants.length - 3}
                </Avatar>
              )}
            </Group>
          ) : (
            <Text size="sm" c="dimmed">Aucun participant</Text>
          )}
        </Grid.Col>
      </Grid>
    </Paper>
  );

  if (initialLoading) {
    return (
      <Box p="xl" className="flex justify-center items-center">
        <Loader size="lg" />
        <Text mt="md">Chargement du planning...</Text>
      </Box>
    );
  }

  return (
    <div>
      <Card p="lg" withBorder shadow="sm" radius="md" mb="lg">
        <Group justify="space-between" mb="md">
          <Title>{isEditing ? 'Modifier le planning' : 'Nouveau planning'}</Title>
          <Group>
            <ForwardRefButton 
              variant={previewMode ? 'filled' : 'light'}
              onClick={() => setPreviewMode(!previewMode)}
              leftSection={<IconEye size={16} />}
            >
              Aperçu
            </ForwardRefButton>
            <ForwardRefButton
              variant="outline"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate('/plannings')}
            >
              Retour
            </ForwardRefButton>
          </Group>
        </Group>
        
        {error && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Erreur" 
            color="red" 
            mb="md"
          >
            {error}
          </Alert>
        )}
        
        <Grid>
          <Grid.Col span={{ base: 12, md: previewMode ? 6 : 12 }}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stepper active={currentStep} onStepClick={setCurrentStep} mb="xl">
                <Stepper.Step 
                  label="Informations de base" 
                  description="Titre et description"
                  icon={<IconInfoCircle size={18} />}
                >
                  <Stack spacing="md">
                    <TextInput
                      required
                      label="Titre"
                      placeholder="Titre du planning"
                      description="Donnez un titre clair et concis à votre planning"
                      {...form.getInputProps('titre')}
                    />
                    
                    <Textarea
                      label="Description"
                      placeholder="Description détaillée du planning"
                      description="Décrivez l'objectif et les détails du planning"
                      autosize
                      minRows={4}
                      {...form.getInputProps('description')}
                    />
                    
                    <Grid>
                      <Grid.Col span={6}>
                        <Select
                          label="Statut"
                          placeholder="Sélectionnez un statut"
                          data={[
                            { value: 'En attente', label: 'En attente' },
                            { value: 'En cours', label: 'En cours' },
                            { value: 'Terminé', label: 'Terminé' },
                          ]}
                          {...form.getInputProps('statut')}
                        />
                      </Grid.Col>
                      
                      <Grid.Col span={6}>
                        <Select
                          label="Priorité"
                          placeholder="Sélectionnez une priorité"
                          data={[
                            { value: 'Basse', label: 'Basse' },
                            { value: 'Normale', label: 'Normale' },
                            { value: 'Haute', label: 'Haute' },
                          ]}
                          {...form.getInputProps('priorite')}
                        />
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Stepper.Step>
                
                <Stepper.Step 
                  label="Dates" 
                  description="Période du planning"
                  icon={<IconCalendarEvent size={18} />}
                >
                  <Paper p="md" withBorder mb="md">
                    <Grid>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <DateInput
                          required
                          label="Date de début"
                          placeholder="Sélectionnez une date"
                          valueFormat="DD/MM/YYYY"
                          description="Date de début du planning"
                          {...form.getInputProps('dateDebut')}
                          clearable={false}
                        />
                      </Grid.Col>
                      
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <DateInput
                          label="Date de fin"
                          placeholder="Sélectionnez une date"
                          valueFormat="DD/MM/YYYY"
                          description="Date de fin du planning (optionnelle)"
                          {...form.getInputProps('dateFin')}
                          minDate={form.values.dateDebut ? new Date(form.values.dateDebut) : undefined}
                          clearable
                        />
                      </Grid.Col>
                    </Grid>
                    
                    {form.values.dateDebut && (
                      <Box mt="lg">
                        <DatePicker 
                          getDayProps={(date) => {
                            if (!date) return {};
                            const day = new Date(date);
                            
                            // Date de début
                            if (form.values.dateDebut && 
                                day.getDate() === new Date(form.values.dateDebut).getDate() && 
                                day.getMonth() === new Date(form.values.dateDebut).getMonth() && 
                                day.getFullYear() === new Date(form.values.dateDebut).getFullYear()) {
                              return { style: { backgroundColor: 'var(--mantine-color-blue-filled)' } };
                            }
                            
                            // Date de fin
                            if (form.values.dateFin && 
                                day.getDate() === new Date(form.values.dateFin).getDate() && 
                                day.getMonth() === new Date(form.values.dateFin).getMonth() && 
                                day.getFullYear() === new Date(form.values.dateFin).getFullYear()) {
                              return { style: { backgroundColor: 'var(--mantine-color-blue-filled)' } };
                            }
                            
                            // Période entre les deux dates
                            if (form.values.dateDebut && form.values.dateFin && 
                                day > new Date(form.values.dateDebut) && 
                                day < new Date(form.values.dateFin)) {
                              return { style: { backgroundColor: 'var(--mantine-color-blue-1)' } };
                            }
                            
                            return {};
                          }}
                        />
                      </Box>
                    )}
                  </Paper>
                  
                  <TextInput
                    label="Lieu"
                    placeholder="Lieu du planning (optionnel)"
                    {...form.getInputProps('lieu')}
                  />
                </Stepper.Step>
                
                <Stepper.Step 
                  label="Participants" 
                  description="Assignation des personnes"
                  icon={<IconUsers size={18} />}
                >
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        label="Responsable"
                        placeholder="Sélectionnez un responsable"
                        data={responsableOptions}
                        {...form.getInputProps('responsable')}
                        clearable
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <MultiSelect
                        label="Participants"
                        placeholder="Sélectionnez les participants"
                        data={participantsOptions}
                        {...form.getInputProps('participants')}
                        clearable
                        searchable
                      />
                    </Grid.Col>
                  </Grid>
                  
                  <Textarea
                    label="Notes additionnelles"
                    placeholder="Notes ou commentaires (optionnel)"
                    description="Ajoutez des notes supplémentaires pour les participants"
                    mt="md"
                    autosize
                    minRows={3}
                    {...form.getInputProps('notes')}
                  />
                </Stepper.Step>
                
                <Stepper.Completed>
                  <Paper withBorder p="xl" radius="md" mb="xl">
                    <Stack align="center" spacing="md">
                      <ThemeIcon size={80} radius={100} color="green">
                        <IconCheck size={40} />
                      </ThemeIcon>
                      
                      <Title order={2}>Prêt à finaliser !</Title>
                      
                      <Text ta="center" size="md" maw={500}>
                        Vous avez complété toutes les étapes. Vérifiez les informations et cliquez sur 
                        {isEditing ? ' "Mettre à jour"' : ' "Créer le planning"'} pour finaliser.
                      </Text>
                      
                      <Group mt="xl">
                        <ForwardRefButton
                          leftSection={<IconDeviceFloppy size={16} />}
                          loading={loading}
                          type="submit"
                          size="md"
                        >
                          {isEditing ? 'Mettre à jour' : 'Créer le planning'}
                        </ForwardRefButton>
                      </Group>
                    </Stack>
                  </Paper>
                </Stepper.Completed>
              </Stepper>
              
              {currentStep !== 3 && (
                <Group justify="space-between" mt="xl">
                  <ForwardRefButton
                    variant="default"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    Précédent
                  </ForwardRefButton>
                  
                  <ForwardRefButton onClick={nextStep}>
                    {currentStep === 2 ? 'Finaliser' : 'Suivant'}
                  </ForwardRefButton>
                </Group>
              )}
            </form>
          </Grid.Col>
          
          {previewMode && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={3} mb="md">Aperçu du planning</Title>
              <PlanningPreview />
            </Grid.Col>
          )}
        </Grid>
      </Card>
    </div>
  );
}

export default PlanningForm; 