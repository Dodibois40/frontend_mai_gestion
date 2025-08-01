import React, { useState, useEffect } from 'react';
import {
  Modal,
  Title,
  Grid,
  NumberInput,
  Button,
  Group,
  Card,
  Text,
  Divider
} from '@mantine/core';
import { IconCurrencyEuro, IconClock } from '@tabler/icons-react';

const EstimationModal = ({ opened, onClose, affaire, onUpdate }) => {
  const [formData, setFormData] = useState({
    objectifCaHt: 0,
    objectifAchatHt: 0,
    objectifHeuresFab: 0,
    objectifHeuresSer: 0,
    objectifHeuresPose: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (affaire && opened) {
      setFormData({
        objectifCaHt: affaire.objectifCaHt || 0,
        objectifAchatHt: affaire.objectifAchatHt || 0,
        objectifHeuresFab: affaire.objectifHeuresFab || 0,
        objectifHeuresSer: affaire.objectifHeuresSer || 0,
        objectifHeuresPose: affaire.objectifHeuresPose || 0
      });
    }
  }, [affaire, opened]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onUpdate(formData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value || 0
    }));
  };

  const calculerMarge = () => {
    return formData.objectifCaHt - formData.objectifAchatHt;
  };

  const calculerPourcentageMarge = () => {
    if (formData.objectifCaHt === 0) return 0;
    return ((formData.objectifCaHt - formData.objectifAchatHt) / formData.objectifCaHt) * 100;
  };

  const calculerTotalHeures = () => {
    return formData.objectifHeuresFab + formData.objectifHeuresSer + formData.objectifHeuresPose;
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconCurrencyEuro size={20} />
          <Title order={4}>Modifier l'estimation - {affaire?.numero}</Title>
        </Group>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Card withBorder p="md" mb="md">
          <Title order={5} mb="md">Objectifs financiers</Title>
          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Objectif CA HT (€)"
                placeholder="0"
                value={formData.objectifCaHt}
                onChange={(value) => handleChange('objectifCaHt', value)}
                min={0}
                step={100}
                precision={2}
                thousandSeparator=" "
                rightSection="€"
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Objectif Achat HT (€)"
                placeholder="0"
                value={formData.objectifAchatHt}
                onChange={(value) => handleChange('objectifAchatHt', value)}
                min={0}
                step={100}
                precision={2}
                thousandSeparator=" "
                rightSection="€"
                required
              />
            </Grid.Col>
          </Grid>
          
          <Divider my="md" />
          
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Marge calculée</Text>
              <Text size="lg" fw={700} c={calculerMarge() >= 0 ? "green" : "red"}>
                {calculerMarge().toLocaleString('fr-FR')} €
              </Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">Pourcentage de marge</Text>
              <Text size="lg" fw={700} c={calculerPourcentageMarge() >= 0 ? "green" : "red"}>
                {calculerPourcentageMarge().toFixed(1)} %
              </Text>
            </div>
          </Group>
        </Card>

        <Card withBorder p="md" mb="md">
          <Title order={5} mb="md">Objectifs temps (heures)</Title>
          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Heures Fabrication"
                placeholder="0"
                value={formData.objectifHeuresFab}
                onChange={(value) => handleChange('objectifHeuresFab', value)}
                min={0}
                step={0.5}
                precision={1}
                rightSection="h"
                required
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Heures Service"
                placeholder="0"
                value={formData.objectifHeuresSer}
                onChange={(value) => handleChange('objectifHeuresSer', value)}
                min={0}
                step={0.5}
                precision={1}
                rightSection="h"
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Heures Pose"
                placeholder="0"
                value={formData.objectifHeuresPose}
                onChange={(value) => handleChange('objectifHeuresPose', value)}
                min={0}
                step={0.5}
                precision={1}
                rightSection="h"
              />
            </Grid.Col>
          </Grid>
          
          <Divider my="md" />
          
          <Group justify="center">
            <div style={{ textAlign: 'center' }}>
              <Text size="sm" c="dimmed">Total heures estimées</Text>
              <Text size="xl" fw={700} c="blue">
                {calculerTotalHeures().toFixed(1)} h
              </Text>
            </div>
          </Group>
        </Card>

        <Group justify="space-between" mt="xl">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            loading={isLoading}
            leftSection={<IconCurrencyEuro size={16} />}
          >
            Mettre à jour l'estimation
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default EstimationModal; 