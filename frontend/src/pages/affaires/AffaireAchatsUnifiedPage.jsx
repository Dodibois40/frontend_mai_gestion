import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Tabs,
  Group,
  Button,
  LoadingOverlay,
  Alert,
  Breadcrumbs,
  Anchor
} from '@mantine/core';
import {
  IconCalculator,
  IconReceipt,
  IconFileText,
  IconShoppingCart,
  IconArrowLeft
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { affairesService } from '@/services/affairesService';
import AffaireAchatsUnified from '@/components/affaires/AffaireAchatsUnified';
import AffaireBdc from '@/components/affaires/AffaireBdc';
import AffaireAchats from '@/components/affaires/AffaireAchats';

const AffaireAchatsUnifiedPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [affaire, setAffaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('estimation-vs-reel');

  useEffect(() => {
    if (id) {
      loadAffaire();
    }
  }, [id]);

  const loadAffaire = async () => {
    try {
      setLoading(true);
      const response = await affairesService.getAffaireById(id);
      setAffaire(response);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'affaire:', error);
      toast.error('Erreur lors du chargement de l\'affaire');
      navigate('/affaires');
    } finally {
      setLoading(false);
    }
  };

  const handleDataChanged = () => {
    // Callback pour actualiser les données si nécessaire
    loadAffaire();
  };

  if (loading) {
    return (
      <Container size="xl" py="md">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (!affaire) {
    return (
      <Container size="xl" py="md">
        <Alert color="red" title="Erreur">
          Affaire non trouvée
        </Alert>
      </Container>
    );
  }

  const breadcrumbItems = [
    { title: 'Affaires', href: '/affaires' },
    { title: affaire.libelle, href: `/affaires/${affaire.id}` },
    { title: 'Gestion des Achats', href: null }
  ].map((item, index) => (
    <Anchor 
      key={index} 
      onClick={() => item.href && navigate(item.href)}
      style={{ cursor: item.href ? 'pointer' : 'default' }}
    >
      {item.title}
    </Anchor>
  ));

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <div>
          <Breadcrumbs mb="xs">{breadcrumbItems}</Breadcrumbs>
          <Title order={1}>
            <Group>
              <IconShoppingCart size={32} />
              Gestion des Achats
            </Group>
          </Title>
        </div>
        
        <Button
          variant="outline"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate(`/affaires/${affaire.id}`)}
        >
          Retour à l'affaire
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab 
            value="estimation-vs-reel" 
            leftSection={<IconCalculator size={16} />}
          >
            Estimation vs Réel
          </Tabs.Tab>
          <Tabs.Tab 
            value="bons-commande" 
            leftSection={<IconFileText size={16} />}
          >
            Bons de Commande
          </Tabs.Tab>
          <Tabs.Tab 
            value="factures-achats" 
            leftSection={<IconReceipt size={16} />}
          >
            Factures d'Achats
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="estimation-vs-reel" pt="md">
          <AffaireAchatsUnified 
            affaire={affaire} 
            onDataChanged={handleDataChanged}
          />
        </Tabs.Panel>

        <Tabs.Panel value="bons-commande" pt="md">
          <AffaireBdc 
            affaireId={affaire.id} 
            onBdcChanged={handleDataChanged}
          />
        </Tabs.Panel>

        <Tabs.Panel value="factures-achats" pt="md">
          <AffaireAchats 
            affaireId={affaire.id} 
            onAchatChanged={handleDataChanged}
          />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default AffaireAchatsUnifiedPage; 