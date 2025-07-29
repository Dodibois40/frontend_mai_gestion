import React, { useState, useCallback, useRef } from 'react';
import { DndContext, DragOverlay, useSensors, useSensor, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { toast } from 'sonner';
import usePlanningData from '../../hooks/usePlanningData';

/**
 * Container principal du Planning Équipe
 * Gère le contexte Drag & Drop et coordonne tous les composants
 */
const PlanningEquipeContainer = ({ children, className = "" }) => {
  // ========== HOOKS ==========
  
  const {
    currentWeek,
    planningData,
    ouvriers,
    affaires,
    statistiques,
    loading,
    error,
    weekDays,
    isDataLoaded,
    
    // Actions
    affecterOuvrier,
    changerTypeActivite,
    desaffecterOuvrier,
    refreshPlanning,
    navigateWeek,
    goToToday,
    setCurrentWeek
  } = usePlanningData({
    autoRefresh: false,
    loadOnMount: true
  });

  // ========== ÉTAT LOCAL ==========
  
  const [draggedItem, setDraggedItem] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedAffectation, setSelectedAffectation] = useState(null);

  // ========== REFS ==========
  
  const containerRef = useRef(null);

  // ========== CONFIGURATION DRAG & DROP ==========
  
  // Configuration optimisée pour Windows/Surface
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px pour éviter les clics accidentels
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms pour éviter les conflits avec le scroll
        tolerance: 5,
      },
    })
  );

  // ========== HANDLERS DRAG & DROP ==========

  /**
   * Gestionnaire de début de drag
   */
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    console.log('🎯 Début drag:', active);
    
    // Récupérer les données de l'élément draggé
    const dragData = active.data?.current;
    if (dragData) {
      setDraggedItem(dragData);
      console.log('📦 Données drag:', dragData);
    }
    
    // Fermer le menu contextuel s'il est ouvert
    setContextMenu(null);
  }, []);

  /**
   * Gestionnaire de survol pendant le drag
   */
  const handleDragOver = useCallback((event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Logique de validation du drop en temps réel
    const dragData = active.data?.current;
    const dropData = over.data?.current;
    
    if (dragData && dropData) {
      // Valider si le drop est possible
      const canDrop = validateDrop(dragData, dropData);
      
      // Changer le curseur visuellement si nécessaire
      if (!canDrop) {
        console.log('❌ Drop non autorisé');
      }
    }
  }, []);

  /**
   * Gestionnaire de fin de drag
   */
  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    
    console.log('🎯 Fin drag:', { active: active?.id, over: over?.id });
    
    // Reset du state
    setDraggedItem(null);
    
    if (!over) {
      console.log('🚫 Drop en dehors d\'une zone valide');
      return;
    }

    try {
      const dragData = active.data?.current;
      const dropData = over.data?.current;
      
      if (!dragData || !dropData) {
        console.error('❌ Données drag/drop manquantes');
        return;
      }

      console.log('📥 Traitement drop:', { dragData, dropData });

      // Validation finale
      if (!validateDrop(dragData, dropData)) {
        toast.error('Cette affectation n\'est pas possible');
        return;
      }

      // Traitement selon le type de drag
      await handleDropAction(dragData, dropData);
      
    } catch (error) {
      console.error('❌ Erreur lors du drop:', error);
      toast.error(error.message || 'Erreur lors de l\'affectation');
    }
  }, []);

  // ========== LOGIQUE MÉTIER ==========

  /**
   * Valider si un drop est possible
   */
  const validateDrop = useCallback((dragData, dropData) => {
    // Vérifier que c'est bien un ouvrier vers une cellule planning
    if (dragData.type !== 'ouvrier' || dropData.type !== 'planning-cell') {
      return false;
    }

    // Vérifier que l'ouvrier est disponible
    if (!dragData.ouvrier?.disponible) {
      return false;
    }

    // Vérifier que la date n'est pas dans le passé
    const dropDate = new Date(dropData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dropDate < today) {
      return false;
    }

    return true;
  }, []);

  /**
   * Traiter l'action de drop
   */
  const handleDropAction = useCallback(async (dragData, dropData) => {
    const { ouvrier } = dragData;
    const { affaireId, date, periode } = dropData;

    // Préparer les données d'affectation
    const affectationData = {
      affaireId,
      userId: ouvrier.id,
      dateAffectation: date,
      periode,
      typeActivite: 'FABRICATION', // Par défaut, modifiable avec clic droit
    };

    console.log('🎯 Affectation en cours:', affectationData);

    // Effectuer l'affectation
    const result = await affecterOuvrier(affectationData);
    
    if (result.success) {
      console.log('✅ Affectation réussie:', result);
      
      // Toast de succès avec détails
      const affaire = affaires.find(a => a.id === affaireId);
      const dateFormatted = new Date(date).toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'short' 
      });
      
      toast.success(
        `${ouvrier.prenom} ${ouvrier.nom} affecté à "${affaire?.numero}" - ${dateFormatted} ${periode.toLowerCase()}`,
        { duration: 4000 }
      );
    } else {
      throw new Error(result.message);
    }
  }, [affecterOuvrier, affaires]);

  // ========== HANDLERS INTERFACE ==========

  /**
   * Gestionnaire clic droit sur affectation
   */
  const handleAffectationRightClick = useCallback((affectation, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('🖱️ Clic droit sur affectation:', affectation);
    
    setContextMenu({
      affectation,
      position: { x: event.clientX, y: event.clientY },
      visible: true
    });
  }, []);

  /**
   * Gestionnaire clic sur affectation
   */
  const handleAffectationClick = useCallback((affectation) => {
    console.log('🖱️ Clic sur affectation:', affectation);
    setSelectedAffectation(affectation);
  }, []);

  /**
   * Fermer le menu contextuel
   */
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  /**
   * Changer le type d'activité depuis le menu contextuel
   */
  const handleChangeTypeActivite = useCallback(async (affectationId, nouveauType) => {
    try {
      await changerTypeActivite(affectationId, nouveauType);
      closeContextMenu();
    } catch (error) {
      console.error('❌ Erreur changement type:', error);
    }
  }, [changerTypeActivite, closeContextMenu]);

  /**
   * Désaffecter depuis le menu contextuel
   */
  const handleDesaffecter = useCallback(async (affectationId) => {
    try {
      await desaffecterOuvrier(affectationId);
      closeContextMenu();
    } catch (error) {
      console.error('❌ Erreur désaffectation:', error);
    }
  }, [desaffecterOuvrier, closeContextMenu]);

  // ========== GESTIONNAIRE CLAVIER ==========

  const handleKeyDown = useCallback((event) => {
    // Fermer le menu contextuel avec Escape
    if (event.key === 'Escape') {
      closeContextMenu();
      setSelectedAffectation(null);
    }
    
    // Navigation avec flèches
    if (event.key === 'ArrowLeft' && event.ctrlKey) {
      navigateWeek('prev');
    }
    if (event.key === 'ArrowRight' && event.ctrlKey) {
      navigateWeek('next');
    }
    
    // Aujourd'hui avec Home
    if (event.key === 'Home' && event.ctrlKey) {
      goToToday();
    }
    
    // Rafraîchir avec F5
    if (event.key === 'F5') {
      event.preventDefault();
      refreshPlanning();
    }
  }, [closeContextMenu, navigateWeek, goToToday, refreshPlanning]);

  // ========== PROPS POUR ENFANTS ==========

  const childrenProps = {
    // Données
    currentWeek,
    planningData,
    ouvriers,
    affaires,
    statistiques,
    weekDays,
    loading,
    error,
    isDataLoaded,
    
    // Handlers
    onAffectationClick: handleAffectationClick,
    onAffectationRightClick: handleAffectationRightClick,
    onRefresh: refreshPlanning,
    onWeekChange: setCurrentWeek,
    onNavigateWeek: navigateWeek,
    onGoToToday: goToToday,
    
    // État interface
    selectedAffectation,
    draggedItem,
    
    // Actions
    affecterOuvrier,
    changerTypeActivite: handleChangeTypeActivite,
    desaffecterOuvrier: handleDesaffecter,
  };

  // ========== RENDU ==========

  return (
    <div
      ref={containerRef}
      className={`planning-equipe-container h-full w-full ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Contenu principal avec props injectées */}
        {typeof children === 'function' 
          ? children(childrenProps)
          : React.Children.map(children, child =>
              React.isValidElement(child)
                ? React.cloneElement(child, childrenProps)
                : child
            )
        }

        {/* Overlay de drag */}
        <DragOverlay>
          {draggedItem && (
            <div className="drag-overlay opacity-80 transform rotate-2 shadow-lg">
              {draggedItem.type === 'ouvrier' && (
                <div className="bg-white border-2 border-blue-500 rounded-lg p-2 min-w-24">
                  <div className="text-xs font-medium text-gray-900">
                    {draggedItem.ouvrier.prenom} {draggedItem.ouvrier.nom}
                  </div>
                  <div className="text-xs text-gray-500">
                    {draggedItem.ouvrier.role.replace('_', ' ')}
                  </div>
                </div>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Menu contextuel */}
      {contextMenu?.visible && (
        <div 
          className="fixed inset-0 z-50"
          onClick={closeContextMenu}
        >
          <div
            className="absolute bg-white rounded-lg shadow-lg border py-2 min-w-48"
            style={{
              left: contextMenu.position.x,
              top: contextMenu.position.y,
              transform: 'translate(-50%, -10px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1 text-xs font-medium text-gray-500 border-b">
              {contextMenu.affectation?.ouvrier?.prenom} {contextMenu.affectation?.ouvrier?.nom}
            </div>
            
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              onClick={() => handleChangeTypeActivite(
                contextMenu.affectation.id, 
                contextMenu.affectation.typeActivite === 'FABRICATION' ? 'POSE' : 'FABRICATION'
              )}
            >
              🔄 Changer vers {contextMenu.affectation?.typeActivite === 'FABRICATION' ? 'Pose' : 'Fabrication'}
            </button>
            
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
              onClick={() => handleDesaffecter(contextMenu.affectation.id)}
            >
              🗑️ Désaffecter
            </button>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-40">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Chargement du planning...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningEquipeContainer; 