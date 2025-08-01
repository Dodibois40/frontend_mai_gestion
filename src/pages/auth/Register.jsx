import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Group, Text, Divider, Anchor, Stack, Progress, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAt, IconLock, IconUser, IconBriefcase, IconUserPlus, IconCheck, IconX } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';

// Évaluation de la force du mot de passe
const PasswordStrength = ({ password }) => {
  if (!password) return null;

  // Critères de sécurité
  const requirements = [
    { re: /[0-9]/, label: 'Contient des chiffres' },
    { re: /[a-z]/, label: 'Contient des lettres minuscules' },
    { re: /[A-Z]/, label: 'Contient des lettres majuscules' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Contient des caractères spéciaux' },
  ];

  // Vérification des critères
  const strength = requirements.filter(requirement => requirement.re.test(password)).length;

  // Couleur en fonction de la force
  const color = strength === 0 ? 'red' : strength === 1 ? 'orange' : strength === 2 ? 'yellow' : strength === 3 ? 'lime' : 'green';

  // Affichage des critères
  const checks = requirements.map((requirement, index) => (
    <Text
      key={index}
      color={requirement.re.test(password) ? 'teal' : 'red'}
      size="sm"
      mt={5}
      style={{ display: 'flex', alignItems: 'center' }}
    >
      {requirement.re.test(password) ? <IconCheck size={14} /> : <IconX size={14} />} {requirement.label}
    </Text>
  ));

  return (
    <Box mt="md">
      <Progress value={(strength / 4) * 100} color={color} size="sm" mb="md" />
      {checks}
    </Box>
  );
};

const Register = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Configuration du formulaire avec validation améliorée
  const form = useForm({
    initialValues: {
      nom: '',
      prenom: '',
      email: '',
      poste: '',
      password: '',
      confirmPassword: ''
    },
    validate: {
      nom: (value) => (value.length >= 2 ? null : 'Le nom doit contenir au moins 2 caractères'),
      prenom: (value) => (value.length >= 2 ? null : 'Le prénom doit contenir au moins 2 caractères'),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Email invalide'),
      poste: (value) => (value.length >= 2 ? null : 'Le poste doit contenir au moins 2 caractères'),
      password: (value) => {
        if (value.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères';
        
        // Évaluer la complexité du mot de passe
        const requirements = [
          { re: /[0-9]/ },
          { re: /[a-z]/ },
          { re: /[A-Z]/ },
          { re: /[$&+,:;=?@#|'<>.^*()%!-]/ },
        ];
        
        const strength = requirements.filter(req => req.re.test(value)).length;
        
        if (strength < 2) return 'Le mot de passe est trop faible';
        return null;
      },
      confirmPassword: (value, values) => 
        value !== values.password ? 'Les mots de passe ne correspondent pas' : null
    }
  });
  
  // Gestion de la soumission du formulaire
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Nous n'envoyons pas confirmPassword au serveur
      const { confirmPassword, ...userData } = values;
      await register(userData);
      // La redirection est gérée dans le contexte d'authentification
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      // Les notifications sont gérées dans le contexte d'authentification
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack spacing="md">
        <Group grow>
          <TextInput
            required
            label="Nom"
            placeholder="Votre nom"
            icon={<IconUser size={16} />}
            {...form.getInputProps('nom')}
            disabled={loading}
          />
          
          <TextInput
            required
            label="Prénom"
            placeholder="Votre prénom"
            icon={<IconUser size={16} />}
            {...form.getInputProps('prenom')}
            disabled={loading}
          />
        </Group>
        
        <TextInput
          required
          label="Email"
          placeholder="votre.email@exemple.com"
          icon={<IconAt size={16} />}
          {...form.getInputProps('email')}
          disabled={loading}
        />
        
        <TextInput
          required
          label="Poste"
          placeholder="Votre poste dans l'entreprise"
          icon={<IconBriefcase size={16} />}
          {...form.getInputProps('poste')}
          disabled={loading}
        />
        
        <PasswordInput
          required
          label="Mot de passe"
          placeholder="Choisissez un mot de passe sécurisé"
          icon={<IconLock size={16} />}
          {...form.getInputProps('password')}
          disabled={loading}
        />
        
        <PasswordStrength password={form.values.password} />
        
        <PasswordInput
          required
          label="Confirmer le mot de passe"
          placeholder="Répétez votre mot de passe"
          icon={<IconLock size={16} />}
          {...form.getInputProps('confirmPassword')}
          disabled={loading}
        />
        
        <Group position="apart" mt="md">
          <Anchor component={Link} to="/auth/login" size="sm">
            Déjà un compte ? Connectez-vous
          </Anchor>
        </Group>
        
        <Button
          fullWidth
          type="submit"
          leftSection={<IconUserPlus size={18} />}
          loading={loading}
        >
          Créer un compte
        </Button>
      </Stack>
    </form>
  );
};

export default Register; 