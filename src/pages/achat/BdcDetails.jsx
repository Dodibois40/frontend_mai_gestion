import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Card, 
  Group, 
  Title, 
  Text, 
  Divider, 
  Badge, 
  Button, 
  Grid, 
  LoadingOverlay,
  ActionIcon,
  Box,
  Paper,
  useMantineTheme
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconArrowLeft, 
  IconPencil, 
  IconTrash, 
  IconCheck, 
  IconClock,
  IconFileInvoice,
  IconBuilding,
  IconUser,
  IconTags,
  IconCalendar,
  IconCoin,
  IconChartBar,
  IconNotes,
  IconPackage,
  IconX
} from '@tabler/icons-react';
import { getBdc, deleteBdc, receptionnerBdc, getStatsByAffaire, validerBdc, annulerBdc } from '@/services/achatService';
import { PasswordModal } from '../../components/ui/password-modal';

const InfoItem = ({ icon, label, value, color }) => {
  const theme = useMantineTheme();
  return (
    <Group align="flex-start" spacing="xs">
      <Box mt={3} style={{ color }}>
        {icon}
      </Box>
      <div>
        <Text size="sm" c="dimmed">{label}</Text>
        <Text>{value || '-'}</Text>
      </div>
    </Group>
  );
};

const BdcDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const [bdc, setBdc] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deletingBdc, setDeletingBdc] = useState(false);

  useEffect(() => {
    const fetchBdcDetails = async () => {
      try {
        setLoading(true);
        const data = await getBdc(id);
        setBdc(data);
        
        // Charger les statistiques de l'affaire associée
        if (data.affaire?.id) {
          const affaireStats = await getStatsByAffaire(data.affaire.id);
          setStats(affaireStats);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails du bon de commande:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Impossible de charger les détails du bon de commande',
          color: 'red'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBdcDetails();
  }, [id]);

  const handleDelete = async () => {
    // Si le BDC est validé, demander le mot de passe
    if (bdc && bdc.statut === 'VALIDE') {
      setShowPasswordModal(true);
    } else {
      // Suppression normale pour les BDC non validés
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bon de commande ?')) {
        await performDelete();
      }
    }
  };

  const performDelete = async (password = null) => {
    try {
      setDeletingBdc(true);
      await deleteBdc(id, password);
      notifications.show({
        title: 'Succès',
        message: 'Bon de commande supprimé avec succès',
        color: 'green'
      });
      navigate('/bdc');
    } catch (error) {
      console.error('Erreur lors de la suppression du bon de commande:', error);
      
      if (error.response?.status === 400) {
        notifications.show({
          title: 'Erreur',
          message: 'Un mot de passe est requis pour supprimer un BDC validé',
          color: 'red'
        });
      } else if (error.response?.status === 401) {
        notifications.show({
          title: 'Erreur',
          message: 'Mot de passe incorrect',
          color: 'red'
        });
      } else {
        notifications.show({
          title: 'Erreur',
          message: 'Impossible de supprimer le bon de commande',
          color: 'red'
        });
      }
    } finally {
      setDeletingBdc(false);
      setShowPasswordModal(false);
    }
  };

  const handlePasswordConfirm = (password) => {
    performDelete(password);
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
  };

  const handleReception = async () => {
    try {
      const dateReception = new Date();
      await receptionnerBdc(id, dateReception);
      
      // Mettre à jour l'élément
      setBdc({ ...bdc, dateReception });
      
      notifications.show({
        title: 'Succès',
        message: 'Bon de commande réceptionné avec succès',
        color: 'green'
      });
    } catch (error) {
      console.error('Erreur lors de la réception du bon de commande:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de réceptionner le bon de commande',
        color: 'red'
      });
    }
  };

  // Valider un BDC
  const handleValidation = async () => {
    try {
      await validerBdc(id);
      
      // Mettre à jour l'élément
      setBdc({ ...bdc, statut: 'VALIDE' });
      
      notifications.show({
        title: 'Succès',
        message: 'Bon de commande validé avec succès',
        color: 'green'
      });
    } catch (error) {
      console.error('Erreur lors de la validation du bon de commande:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de valider le bon de commande',
        color: 'red'
      });
    }
  };

  // Annuler un BDC
  const handleAnnulation = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce bon de commande ?')) {
      try {
        await annulerBdc(id);
        
        // Mettre à jour l'élément
        setBdc({ ...bdc, statut: 'ANNULE' });
        
        notifications.show({
          title: 'Succès',
          message: 'Bon de commande annulé avec succès',
          color: 'orange'
        });
      } catch (error) {
        console.error('Erreur lors de l\'annulation du bon de commande:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Impossible d\'annuler le bon de commande',
          color: 'red'
        });
      }
    }
  };

  // Statut du BDC (badge)
  const getBadgeStatus = () => {
    if (!bdc) return null;
    
    const statusConfig = {
      'EN_ATTENTE': { 
        color: 'orange', 
        icon: IconClock, 
        text: 'En attente de validation' 
      },
      'VALIDE': { 
        color: 'blue', 
        icon: IconCheck, 
        text: 'Validé' 
      },
      'RECEPTIONNE': { 
        color: 'green', 
        icon: IconCheck, 
        text: 'Réceptionné' 
      },
      'ANNULE': { 
        color: 'red', 
        icon: IconX, 
        text: 'Annulé' 
      }
    };

    // Priorité : dateReception > statut
    if (bdc.dateReception) {
      const config = statusConfig['RECEPTIONNE'];
      const IconComponent = config.icon;
      return (
        <Badge color={config.color} size="lg" variant="light">
          <Group spacing={4}>
            <IconComponent size={16} />
            <Text>Réceptionné le {new Date(bdc.dateReception).toLocaleDateString('fr-FR')}</Text>
          </Group>
        </Badge>
      );
    }

    const config = statusConfig[bdc.statut] || statusConfig['EN_ATTENTE'];
    const IconComponent = config.icon;
    return (
      <Badge color={config.color} size="lg" variant="light">
        <Group spacing={4}>
          <IconComponent size={16} />
          <Text>{config.text}</Text>
        </Group>
      </Badge>
    );
  };

  return (
    <Container size="xl">
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
      
      <Group position="apart" mb="lg" align="center">
        <Group>
          <ActionIcon 
            variant="light" 
            component={Link} 
            to="/bdc"
            size="lg"
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <div>
            <Title order={2}>Bon de commande</Title>
            {bdc && <Text c="dimmed">{bdc.numero}</Text>}
          </div>
        </Group>
        
        <Group>
          {/* Actions selon le statut */}
          {bdc && bdc.statut === 'EN_ATTENTE' && (
            <>
              <Button 
                style={{
                  backgroundColor: '#84a368',
                  borderColor: '#84a368',
                  color: 'white'
                }}
                onClick={handleValidation}
                leftSection={<IconCheck size={16} />}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#6b7f54';
                  e.target.style.borderColor = '#6b7f54';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#84a368';
                  e.target.style.borderColor = '#84a368';
                }}
              >
                Valider
              </Button>
              <Button 
                style={{
                  backgroundColor: '#8b4513',
                  borderColor: '#8b4513',
                  color: 'white'
                }}
                onClick={handleAnnulation}
                leftSection={<IconX size={16} />}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#6b3410';
                  e.target.style.borderColor = '#6b3410';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#8b4513';
                  e.target.style.borderColor = '#8b4513';
                }}
              >
                Annuler
              </Button>
            </>
          )}
          
          {bdc && bdc.statut === 'VALIDE' && !bdc.dateReception && (
            <Button 
              color="green" 
              onClick={handleReception}
              leftSection={<IconCheck size={16} />}
            >
              Réceptionner
            </Button>
          )}
          
          <Button 
            variant="outline" 
            component={Link} 
            to={`/bdc/${id}/modifier`}
            leftSection={<IconPencil size={16} />}
          >
            Modifier
          </Button>
          <Button 
            color="red" 
            variant="subtle" 
            onClick={handleDelete}
            leftSection={<IconTrash size={16} />}
          >
            Supprimer
          </Button>
        </Group>
      </Group>
      
      {bdc && (
        <Grid>
          <Grid.Col span={8}>
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Card.Section withBorder p="md" bg={theme.colors.blue[0]}>
                <Group position="apart">
                  <Group>
                    <IconFileInvoice size={24} color={theme.colors.blue[6]} />
                    <Title order={3}>{bdc.numero}</Title>
                  </Group>
                  {getBadgeStatus()}
                </Group>
              </Card.Section>
              
              <Divider my="md" label="Informations générales" labelPosition="center" />
              
              <Grid columns={12}>
                <Grid.Col span={6}>
                  <InfoItem 
                    icon={<IconBuilding size={18} />} 
                    label="Affaire" 
                    value={bdc.affaire ? `${bdc.affaire.numero} - ${bdc.affaire.libelle}` : ''}
                    color={theme.colors.blue[6]}
                  />
                  <InfoItem 
                    icon={<IconTags size={18} />} 
                    label="Catégorie" 
                    value={bdc.categorie ? `${bdc.categorie.code} - ${bdc.categorie.intitule}` : ''}
                    color={theme.colors.green[6]}
                  />
                  <InfoItem 
                    icon={<IconUser size={18} />} 
                    label="Fournisseur" 
                    value={bdc.fournisseur}
                    color={theme.colors.violet[6]}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <InfoItem 
                    icon={<IconCalendar size={18} />} 
                    label="Date du BDC" 
                    value={bdc.dateBdc ? new Date(bdc.dateBdc).toLocaleDateString('fr-FR') : '-'}
                    color={theme.colors.orange[6]}
                  />
                  <InfoItem 
                    icon={<IconPackage size={18} />} 
                    label="Date de réception" 
                    value={bdc.dateReception ? new Date(bdc.dateReception).toLocaleDateString('fr-FR') : 'Non réceptionné'}
                    color={theme.colors.red[6]}
                  />
                  <InfoItem 
                    icon={<IconNotes size={18} />} 
                    label="Commentaire" 
                    value={bdc.commentaire || 'Aucun commentaire'}
                    color={theme.colors.gray[6]}
                  />
                </Grid.Col>
              </Grid>
              
              <Divider my="md" label="Montants" labelPosition="center" />
              
              <Grid columns={12}>
                <Grid.Col span={4}>
                  <Paper p="md" withBorder radius="md" bg={theme.colors.blue[0]}>
                    <InfoItem 
                      icon={<IconCoin size={20} />} 
                      label="Montant HT" 
                      value={`${bdc.montantHt.toLocaleString('fr-FR')} €`}
                      color={theme.colors.blue[6]}
                    />
                  </Paper>
                </Grid.Col>
                
                <Grid.Col span={4}>
                  <Paper p="md" withBorder radius="md" bg={theme.colors.green[0]}>
                    <InfoItem 
                      icon={<IconChartBar size={20} />} 
                      label="Frais généraux" 
                      value={`${bdc.montantFg?.toLocaleString('fr-FR') || '0'} €`}
                      color={theme.colors.green[6]}
                    />
                  </Paper>
                </Grid.Col>
                
                <Grid.Col span={4}>
                  <Paper p="md" withBorder radius="md" bg={theme.colors.orange[0]}>
                    <InfoItem 
                      icon={<IconCoin size={20} />} 
                      label="Total" 
                      value={`${(bdc.montantHt + (bdc.montantFg || 0)).toLocaleString('fr-FR')} €`}
                      color={theme.colors.orange[6]}
                    />
                  </Paper>
                </Grid.Col>
              </Grid>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={4}>
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Card.Section withBorder p="md" bg={theme.colors.grape[0]}>
                <Group>
                  <IconBuilding size={24} color={theme.colors.grape[6]} />
                  <Title order={3}>Statistiques affaire</Title>
                </Group>
              </Card.Section>
              
              {stats ? (
                <>
                  <Text mt="md">{stats.numeroAffaire} - {stats.libelleAffaire}</Text>
                  
                  <Divider my="md" />
                  
                  <InfoItem 
                    icon={<IconCoin size={18} />} 
                    label="Objectif achat HT" 
                    value={`${stats.objectifAchatHt.toLocaleString('fr-FR')} €`}
                    color={theme.colors.blue[6]}
                  />
                  
                  <InfoItem 
                    icon={<IconCoin size={18} />} 
                    label="Total achat HT" 
                    value={`${stats.totalMontantHt.toLocaleString('fr-FR')} €`}
                    color={theme.colors.green[6]}
                  />
                  
                  <InfoItem 
                    icon={<IconChartBar size={18} />} 
                    label="Total frais généraux" 
                    value={`${stats.totalMontantFg.toLocaleString('fr-FR')} €`}
                    color={theme.colors.orange[6]}
                  />
                  
                  <InfoItem 
                    icon={<IconChartBar size={18} />} 
                    label="Écart objectif" 
                    value={`${stats.ecartObjectif.toFixed(2)} %`}
                    color={stats.ecartObjectif > 0 ? theme.colors.red[6] : theme.colors.green[6]}
                  />
                </>
              ) : (
                <Text align="center" c="dimmed" my="md">
                  Aucune statistique disponible
                </Text>
              )}
            </Card>
          </Grid.Col>
        </Grid>
      )}
      
      {/* Modal de mot de passe */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        onConfirm={handlePasswordConfirm}
        title="Suppression d'un BDC validé"
        message={`Ce bon de commande (${bdc?.numero}) est validé. Un mot de passe administrateur est requis pour le supprimer.`}
        loading={deletingBdc}
      />
    </Container>
  );
};

export default BdcDetails; 