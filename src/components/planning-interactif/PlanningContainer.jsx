import React, { useState, useEffect, useRef } from 'react';
import { DndContext, DragOverlay, useSensors, useSensor, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { Card, Title, Group, Button, Alert, Loader, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCalendar, IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';

import planningInteractifService from '../../services/planningInteractifService';
import PlanningGrid from './PlanningGrid';
import ViewSelector from './ViewSelector';
import AffaireCard from './AffaireCard';
import PlanningStats from './PlanningStats';

const PlanningContainer = ({ isFullPage = false }) => {
  // État principal
  const [affaires, setAffaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentPeriod, setCurrentPeriod] = useState({ start: new Date(), end: new Date() });
  const [selectedAffaire, setSelectedAffaire] = useState(null);
  const [draggedAffaire, setDraggedAffaire] = useState(null);
  const [stats, setStats] = useState(null);

  // Référence pour le conteneur principal
  const containerRef = useRef(null);

  // Configuration des capteurs de drag & drop optimisés pour Surface
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px avant déclenchement (optimisé tactile)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms pour éviter conflits scroll
        tolerance: 5,
      },
    })
  );

  // Calculer les dates de début et fin selon la vue
  const getViewDates = () => {
    switch (currentView) {
      case 'day':
        return {
          start: new Date(currentDate),
          end: new Date(currentDate)
        };
      case 'week':
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 })
        };
      case 'month':
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        return {
          start: startOfMonth,
          end: endOfMonth
        };
      default:
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 })
        };
    }
  };

  // Charger les affaires pour la période actuelle
  const loadAffaires = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { start, end } = getViewDates();
      const [affairesData, statsData] = await Promise.all([
        planningInteractifService.getAffairesPlanning(start, end),
        planningInteractifService.getPlanningStats(start, end)
      ]);
      
      setAffaires(affairesData);
      setStats(statsData);
    } catch (err) {
      console.error('Erreur lors du chargement des affaires:', err);
      setError('Erreur lors du chargement du planning');
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de charger les données du planning',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour la période courante quand la vue ou la date change
  useEffect(() => {
    const newPeriod = getViewDates();
    setCurrentPeriod(newPeriod);
  }, [currentView, currentDate]);

  // Recharger quand la vue ou la date change
  useEffect(() => {
    loadAffaires();
  }, [currentView, currentDate]);

  // Gérer le début du drag
  const handleDragStart = (event) => {
    const affaire = affaires.find(a => a.id === event.active.id);
    setDraggedAffaire(affaire);
  };

  // Gérer la fin du drag
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setDraggedAffaire(null);

    if (!over) {
      return; // Dropped outside valid zone
    }

    try {
      const affaireId = active.id;
      const dropData = over.data.current;
      
      if (!dropData || !dropData.date) {
        console.warn('Drop data invalide');
        return;
      }

      const affaire = affaires.find(a => a.id === affaireId);
      if (!affaire) {
        console.warn('Affaire non trouvée');
        return;
      }

      // Calculer les nouvelles dates
      const newStartDate = new Date(dropData.date);
      const duration = affaire.dateFin.getTime() - affaire.dateDebut.getTime();
      const newEndDate = new Date(newStartDate.getTime() + duration);

      // Valider le déplacement
      const validation = planningInteractifService.validateMove(affaire, newStartDate, newEndDate);
      if (!validation.isValid) {
        notifications.show({
          title: 'Déplacement impossible',
          message: validation.errors.join(', '),
          color: 'red',
        });
        return;
      }

      // Effectuer le déplacement
      await planningInteractifService.moveAffaire(affaireId, newStartDate, newEndDate);
      
      // Mettre à jour l'affaire dans l'état local
      setAffaires(prev => prev.map(a => 
        a.id === affaireId 
          ? { ...a, dateDebut: newStartDate, dateFin: newEndDate }
          : a
      ));

      notifications.show({
        title: 'Affaire déplacée',
        message: `${affaire.numero} déplacée vers le ${format(newStartDate, 'dd/MM/yyyy', { locale: fr })}`,
        color: 'green',
      });

    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de déplacer l\'affaire',
        color: 'red',
      });
    }
  };

  // Navigation dans les dates
  const navigateDate = (direction) => {
    const amount = direction === 'next' ? 1 : -1;
    
    switch (currentView) {
      case 'day':
        setCurrentDate(prev => new Date(prev.getTime() + (amount * 24 * 60 * 60 * 1000)));
        break;
      case 'week':
        setCurrentDate(prev => amount > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
        break;
    }
  };

  // Formater le titre de la période
  const formatPeriodTitle = () => {
    const { start, end } = getViewDates();
    
    switch (currentView) {
      case 'day':
        return format(currentDate, 'EEEE dd MMMM yyyy', { locale: fr });
      case 'week':
        return `Semaine du ${format(start, 'dd/MM', { locale: fr })} au ${format(end, 'dd/MM/yyyy', { locale: fr })}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: fr });
      default:
        return '';
    }
  };

  // Fonction pour changer la période (utilisée par ViewSelector)
  const handlePeriodChange = (newPeriod) => {
    setCurrentPeriod(newPeriod);
    // Mettre à jour currentDate en fonction de la période
    setCurrentDate(newPeriod.start);
  };

  // Fonction pour gérer le déplacement d'affaire (wrapper pour handleDragEnd)
  const handleMoveAffaire = async (affaireId, newDate) => {
    try {
      const affaire = affaires.find(a => a.id === affaireId);
      if (!affaire) return;

      const duration = affaire.dateFin.getTime() - affaire.dateDebut.getTime();
      const newEndDate = new Date(newDate.getTime() + duration);

      await planningInteractifService.moveAffaire(affaireId, newDate, newEndDate);
      
      setAffaires(prev => prev.map(a => 
        a.id === affaireId 
          ? { ...a, dateDebut: newDate, dateFin: newEndDate }
          : a
      ));

      notifications.show({
        title: 'Affaire déplacée',
        message: `${affaire.numero} déplacée avec succès`,
        color: 'green',
      });
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de déplacer l\'affaire',
        color: 'red',
      });
    }
  };

  if (loading) {
    return (
      <Card p="lg" withBorder shadow="sm" radius="md">
        <div className="flex items-center justify-center py-16">
          <Loader size="lg" />
        </div>
      </Card>
    );
  }

  if (isFullPage) {
    return (
      <div className="h-full w-full" style={{ background: '#faf6f0' }}>
        {/* Header de contrôle - pleine largeur avec thème terre bois */}
        <div className="w-full border-b border-[#e8dcc0] px-8 py-6" style={{ background: '#f5f0e8' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <IconCalendar className="h-7 w-7 text-[#6b7c3d]" />
              <div>
                <h2 className="text-2xl font-bold text-[#000000]">
                  Planning Interactif
                </h2>
                <p className="text-[#333333] text-lg">
                  {formatPeriodTitle()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                leftSection={<IconRefresh size={18} />}
                onClick={loadAffaires}
                size="md"
                className="border-[#6b7c3d] text-[#6b7c3d] hover:bg-[#6b7c3d] hover:text-white text-base px-6"
              >
                Actualiser
              </Button>
              
              <Button
                onClick={() => setCurrentDate(new Date())}
                size="md"
                className="bg-[#6b7c3d] text-white hover:bg-[#556533] text-base px-6"
              >
                Aujourd'hui
              </Button>
            </div>
          </div>

          {/* Sélecteur de vues pleine largeur */}
          <ViewSelector 
            currentView={currentView}
            onViewChange={setCurrentView}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onNavigate={navigateDate}
            periodTitle={formatPeriodTitle()}
            isCompact={false}
            isFullWidth={true}
          />
        </div>

        {/* Contenu principal avec sidebar */}
        <div className="flex h-[calc(100%-180px)] w-full">
          {/* Zone principale du planning */}
          <div className="flex-1 overflow-auto p-8">
            <PlanningGrid
              affaires={affaires}
              currentView={currentView}
              currentDate={currentDate}
              onAffaireSelect={setSelectedAffaire}
              isFullPage={true}
              isFullWidth={true}
              isLoading={loading}
            />
          </div>

          {/* Sidebar stats - largeur fixe optimisée avec thème terre bois */}
          <div className="w-96 border-l border-[#e8dcc0] flex-shrink-0" style={{ background: '#f0f4e8' }}>
            <div className="h-full overflow-auto p-6">
              <h3 className="text-xl font-semibold text-[#000000] mb-6 flex items-center">
                <IconRefresh className="h-5 w-5 mr-2 text-[#6b7c3d]" />
                Statistiques
              </h3>
              <PlanningStats stats={stats} isCompact={false} isSidebar={true} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullPage ? 'h-full flex flex-col' : 'max-w-full mx-auto'} ${isFullPage ? 'gap-3' : 'space-y-6'}`}>
      {/* Header avec navigation - Version pleine page ou normale */}
      <Card 
        p={isFullPage ? "md" : "lg"} 
        withBorder 
        shadow="sm" 
        radius="md" 
        style={{ background: '#faf6f0' }}
        className={isFullPage ? 'flex-shrink-0' : ''}
      >
        <Group justify="space-between" mb={isFullPage ? "xs" : "md"}>
          <div className="flex items-center space-x-3">
            <IconCalendar className="text-[#6b7c3d]" size={isFullPage ? 28 : 32} />
            <div>
              <Title order={isFullPage ? 3 : 2} className="text-[#000000]">
                {isFullPage ? 'Planning' : 'Planning Interactif'}
              </Title>
              {!isFullPage && <p className="text-[#333333] text-sm">Surface Microsoft optimisé</p>}
            </div>
          </div>
          
          <Group>
            <Button
              variant="outline"
              leftSection={<IconRefresh size={16} />}
              onClick={loadAffaires}
              size={isFullPage ? "sm" : "md"}
              className="border-[#6b7c3d] text-[#6b7c3d] hover:bg-[#6b7c3d] hover:text-white"
            >
              Actualiser
            </Button>
            
            <Button
              onClick={() => setCurrentDate(new Date())}
              size={isFullPage ? "sm" : "md"}
              className="bg-[#6b7c3d] text-white hover:bg-[#556533]"
            >
              Aujourd'hui
            </Button>
          </Group>
        </Group>

        {/* Sélecteur de vues */}
        <ViewSelector 
          currentView={currentView}
          onViewChange={setCurrentView}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onNavigate={navigateDate}
          periodTitle={formatPeriodTitle()}
          isCompact={isFullPage}
        />
      </Card>

      {/* Layout adaptatif pour mode pleine page */}
      <div className={isFullPage ? 'flex gap-3 flex-1 overflow-hidden' : 'space-y-6'}>
        
        {/* Sidebar stats en mode pleine page */}
        {isFullPage && stats && (
          <div className="w-80 flex-shrink-0">
            <PlanningStats stats={stats} isCompact={true} />
          </div>
        )}

        {/* Contenu principal */}
        <div className={isFullPage ? 'flex-1 flex flex-col overflow-hidden' : ''}>
          
          {/* Statistiques en mode normal */}
          {!isFullPage && stats && (
            <PlanningStats stats={stats} />
          )}

          {/* Erreur */}
          {error && (
            <Alert 
              icon={<IconAlertCircle size={16} />} 
              title="Erreur" 
              color="red"
              className="bg-red-50 border-red-200"
            >
              {error}
            </Alert>
          )}

          {/* Planning principal avec DnD */}
          <Card 
            p={isFullPage ? "md" : "lg"} 
            withBorder 
            shadow="sm" 
            radius="md" 
            ref={containerRef}
            className={isFullPage ? 'flex-1 overflow-hidden' : ''}
          >
            <DndContext 
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <PlanningGrid
                affaires={affaires}
                currentView={currentView}
                currentDate={currentDate}
                onAffaireSelect={setSelectedAffaire}
                isFullPage={isFullPage}
                isLoading={loading}
              />
              
              {/* Overlay pour le drag */}
              <DragOverlay>
                {draggedAffaire && (
                  <AffaireCard 
                    affaire={draggedAffaire}
                    isDragging={true}
                    style={{ 
                      transform: 'rotate(5deg)',
                      opacity: 0.8,
                      cursor: 'grabbing'
                    }}
                  />
                )}
              </DragOverlay>
            </DndContext>
          </Card>
          
        </div>
      </div>
    </div>
  );
};

export default PlanningContainer; 