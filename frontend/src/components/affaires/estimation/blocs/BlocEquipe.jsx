import React, { useState, useEffect } from 'react';
import { 
  IconUsers, 
  IconEdit, 
  IconDeviceFloppy,
  IconX,
  IconPlus,
  IconMinus,
  IconUserPlus,
  IconUserMinus,
  IconSettings,
  IconCheck,
  IconCalendarEvent
} from '@tabler/icons-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Bloc Équipe - Éditable 
 * Gestion des ressources humaines et répartition des tâches
 */
const BlocEquipe = ({ estimation = {}, onEstimationChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUserEditing, setIsUserEditing] = useState(false); // 🔧 NOUVEAU : Flag pour savoir si l'utilisateur édite activement
  const [lastEstimationSync, setLastEstimationSync] = useState(null); // 🔧 NOUVEAU : Dernière synchronisation pour éviter les doublons
  const [editableData, setEditableData] = useState({
    nombrePersonnes: estimation.nombrePersonnes || 2,
    // 🔧 CORRECTION : Gérer les différents noms de champs entre frontend et backend
    demiJourneesFabrication: estimation.demiJourneesFabrication || estimation.demiJourneesFabricationEstimees || 0,
    demiJourneesPose: estimation.demiJourneesPose || estimation.demiJourneesPoseEstimees || 0,
    totalDemiJournees: estimation.totalDemiJournees || 0,
    repartitionFabrication: estimation.repartitionFabrication || 60,
    repartitionPose: estimation.repartitionPose || 40,
    tauxHoraireCout: estimation.tauxHoraireCout || 25,  // 💰 NOUVEAU : Taux de coût à 25€/h
    tauxHoraireVente: estimation.tauxHoraireVente || 75, // 💰 NOUVEAU : Taux de vente à 75€/h
    tauxHoraire: estimation.tauxHoraire || 25, // Maintenir pour compatibilité
    nombreSousTraitants: estimation.nombreSousTraitants || 0, // 👷 NOUVEAU : Nombre de sous-traitants
    dateCommencement: estimation.dateCommencement || estimation.dateDebut || '',
    dateReception: estimation.dateReception || estimation.dateFin || '',
    competences: {
      fabrication: ['Menuisier', 'Ébéniste'],
      pose: ['Poseur', 'Finisseur']
    },
    planning: {
      semaine: 5, // jours par semaine
      heuresParJour: 8,
      creneaux: ['matin', 'après-midi']
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  // 🔄 NOUVEAU : Gérer la réinitialisation quand l'estimation est vidée
  useEffect(() => {
    if (estimation.montantDevis === 0 && editableData.totalDemiJournees > 0) {
      console.log('🔄 Réinitialisation du bloc équipe - estimation vidée');
      setEditableData({
        nombrePersonnes: 2,
        demiJourneesFabrication: 0,
        demiJourneesPose: 0,
        totalDemiJournees: 0,
        repartitionFabrication: 60,
        repartitionPose: 40,
        tauxHoraireCout: 25,  // 💰 NOUVEAU
        tauxHoraireVente: 75, // 💰 NOUVEAU
        tauxHoraire: 25,
        nombreSousTraitants: 0, // 👷 NOUVEAU
        dateCommencement: '',
        dateReception: '',
        competences: {
          fabrication: ['Menuisier', 'Ébéniste'],
          pose: ['Poseur', 'Finisseur']
        },
        planning: {
          semaine: 5,
          heuresParJour: 8,
          creneaux: ['matin', 'après-midi']
        }
      });
    }
  }, [estimation.montantDevis]);

  // Calculer la répartition automatique (version simple)
  const calculerRepartition = (demiJournees = null, repartitionFab = null, repartitionPos = null) => {
    const totalDJ = demiJournees || editableData.totalDemiJournees || estimation.totalDemiJournees || 0;
    const fabricationPct = repartitionFab || editableData.repartitionFabrication || 60;
    const posePct = repartitionPos || editableData.repartitionPose || 40;
    
    // 🔧 CORRECTION : Utiliser Math.round pour la fabrication et ajuster la pose
    const fabrication = Math.round(totalDJ * (fabricationPct / 100));
    const pose = totalDJ - fabrication; // La pose prend le reste pour garantir le bon total
    
    console.log('🧮 Calcul répartition:', {
      totalDJ,
      fabricationPct,
      posePct,
      fabrication,
      pose,
      total: fabrication + pose
    });
    
    return { fabrication, pose };
  };

  // Synchroniser avec l'estimation (version OPTIMISÉE - permettre les modifications multiples)
  useEffect(() => {
    // 🔄 AMÉLIORATION : Toujours mettre à jour si le total de demi-journées change
    const hasNewTotalDemiJournees = estimation.totalDemiJournees > 0;
    const totalDemiJourneesChanged = estimation.totalDemiJournees !== editableData.totalDemiJournees;
    
    console.log('🔍 BlocEquipe - Vérification sync:', {
      estimationTotal: estimation.totalDemiJournees,
      editableTotal: editableData.totalDemiJournees,
      hasNew: hasNewTotalDemiJournees,
      changed: totalDemiJourneesChanged
    });
    
    // Si le total de demi-journées a changé (depuis le planning), on met à jour
    if (totalDemiJourneesChanged && hasNewTotalDemiJournees) {
      console.log('🔄 Mise à jour du bloc équipe - Nouveau total:', estimation.totalDemiJournees);
      
      const { fabrication, pose } = calculerRepartition(estimation.totalDemiJournees);
      
      setEditableData(prev => ({
        ...prev,
        totalDemiJournees: estimation.totalDemiJournees,
        // Recalculer la répartition avec les pourcentages actuels
        demiJourneesFabrication: fabrication,
        demiJourneesPose: pose,
        // Garder les autres valeurs existantes
        tauxHoraire: prev.tauxHoraire || estimation.tauxHoraire || 75,
        repartitionFabrication: prev.repartitionFabrication || estimation.repartitionFabrication || 60,
        repartitionPose: prev.repartitionPose || estimation.repartitionPose || 40,
        dateCommencement: estimation.dateCommencement || estimation.dateDebut || prev.dateCommencement,
        dateReception: estimation.dateReception || estimation.dateFin || prev.dateReception,
        nombrePersonnes: prev.nombrePersonnes || estimation.nombrePersonnes || 2
      }));
      
      // 🔥 NOUVEAU : Propager immédiatement les changements vers le parent
      // 💰 CORRECTION : Inclure le calcul de main d'œuvre dans la mise à jour automatique
      const resultatsMainOeuvre = calculerCoutMainOeuvre(
        editableData.nombrePersonnes || estimation.nombrePersonnes || 2,
        estimation.totalDemiJournees,
        editableData.tauxHoraireCout || estimation.tauxHoraireCout || 25,
        editableData.tauxHoraireVente || estimation.tauxHoraireVente || 75,
        editableData.nombreSousTraitants || estimation.nombreSousTraitants || 0
      );
      
      const updatedEstimation = {
        ...estimation,
        demiJourneesFabrication: fabrication,
        demiJourneesPose: pose,
        montantMainOeuvre: resultatsMainOeuvre.cout, // Utiliser uniquement le coût
        montantMainOeuvreCout: resultatsMainOeuvre.cout,
        montantMainOeuvreVente: resultatsMainOeuvre.vente,
        montantMainOeuvreGain: resultatsMainOeuvre.gain,
        recalculerRepartition: true // Flag pour recalculer la répartition complète
      };
      
      if (onEstimationChange) {
        console.log('📤 Propagation immédiate vers parent avec montant MO:', updatedEstimation);
        onEstimationChange(updatedEstimation);
      }
    }
  }, [estimation.totalDemiJournees]); // Dépendance simplifiée

  // 🔄 Synchroniser les dates séparément (version OPTIMISÉE)
  useEffect(() => {
    const newDateDebut = estimation.dateCommencement || estimation.dateDebut;
    const newDateFin = estimation.dateReception || estimation.dateFin;
    
    if (newDateDebut && newDateDebut !== editableData.dateCommencement) {
      setEditableData(prev => ({
        ...prev,
        dateCommencement: newDateDebut
      }));
    }
    
    if (newDateFin && newDateFin !== editableData.dateReception) {
      setEditableData(prev => ({
        ...prev,
        dateReception: newDateFin
      }));
    }
  }, [estimation.dateDebut, estimation.dateFin, estimation.dateCommencement, estimation.dateReception]);

  // 💰 NOUVEAU : Calculer le coût réel de main d'œuvre
  const calculerCoutMainOeuvre = (nbPersonnes, totalDemiJournees, tauxHoraireCout, tauxHoraireVente, nbSousTraitants = 0) => {
    const heuresParDemiJournee = 4; // 4 heures par demi-journée
    const totalHeures = totalDemiJournees * heuresParDemiJournee;
    
    // Calculer pour l'équipe interne
    const totalPersonnes = nbPersonnes + nbSousTraitants;
    const coutTotal = totalPersonnes * totalHeures * tauxHoraireCout;
    const venteTotal = totalPersonnes * totalHeures * tauxHoraireVente;
    const gainTotal = venteTotal - coutTotal;
    
    console.log('💰 Calcul main d\'œuvre:', {
      nbPersonnes,
      nbSousTraitants,
      totalPersonnes,
      totalDemiJournees,
      tauxHoraireCout,
      tauxHoraireVente,
      heuresParDemiJournee,
      totalHeures,
      coutTotal,
      venteTotal,
      gainTotal
    });
    
    return {
      cout: Math.round(coutTotal),
      vente: Math.round(venteTotal),
      gain: Math.round(gainTotal)
    };
  };

  // Gérer les changements (version CORRIGÉE pour React)
  const handleChange = (field, value) => {
    setEditableData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Recalculer la répartition si nécessaire
      if (field === 'repartitionFabrication') {
        newData.repartitionPose = 100 - value;
      } else if (field === 'repartitionPose') {
        newData.repartitionFabrication = 100 - value;
      }
      
      // 🔧 CORRECTION REACT : Préparer la remontée mais ne pas l'exécuter pendant setState
      const { fabrication, pose } = calculerRepartition(newData.totalDemiJournees, newData.repartitionFabrication, newData.repartitionPose);
      
      // 💰 NOUVEAU : Calculer le coût de main d'œuvre dynamique
      const montantsMainOeuvre = calculerCoutMainOeuvre(
        newData.nombrePersonnes, 
        newData.totalDemiJournees, 
        newData.tauxHoraireCout,
        newData.tauxHoraireVente,
        newData.nombreSousTraitants
      );
      
      const updatedEstimation = {
        ...estimation,
        nombrePersonnes: newData.nombrePersonnes,
        demiJourneesFabrication: fabrication,
        demiJourneesPose: pose,
        tauxHoraireCout: newData.tauxHoraireCout,
        tauxHoraireVente: newData.tauxHoraireVente,
        nombreSousTraitants: newData.nombreSousTraitants,
        repartitionFabrication: newData.repartitionFabrication,
        repartitionPose: newData.repartitionPose,
        montantMainOeuvre: montantsMainOeuvre.cout, // 💰 Coût pour compatibilité
        montantMainOeuvreCout: montantsMainOeuvre.cout, // 💰 NOUVEAU : Coût explicite
        montantMainOeuvreVente: montantsMainOeuvre.vente, // 💰 NOUVEAU : Vente
        montantMainOeuvreGain: montantsMainOeuvre.gain, // 💰 NOUVEAU : Gain
        recalculerRepartition: true // 🔄 NOUVEAU : Flag pour demander au parent de recalculer
      };
      
      // 🔧 CORRECTION REACT : Programmer la remontée pour le prochain cycle de render
      onEstimationChange(updatedEstimation);
      
      return newData;
    });
    setHasChanges(true);
  };

  // Sauvegarder les modifications (version SIMPLIFIÉE)
  const handleSave = () => {
    const { fabrication, pose } = calculerRepartition();
    
    // 💰 NOUVEAU : Calculer le coût de main d'œuvre lors de la sauvegarde
    const montantsMainOeuvre = calculerCoutMainOeuvre(
      editableData.nombrePersonnes,
      editableData.totalDemiJournees,
      editableData.tauxHoraireCout,
      editableData.tauxHoraireVente,
      editableData.nombreSousTraitants
    );
    
    const updatedEstimation = {
      ...estimation,
      nombrePersonnes: editableData.nombrePersonnes,
      demiJourneesFabrication: fabrication,
      demiJourneesPose: pose,
      tauxHoraireCout: editableData.tauxHoraireCout,
      tauxHoraireVente: editableData.tauxHoraireVente,
      nombreSousTraitants: editableData.nombreSousTraitants,
      repartitionFabrication: editableData.repartitionFabrication,
      repartitionPose: editableData.repartitionPose,
      montantMainOeuvre: montantsMainOeuvre.cout, // 💰 Coût pour compatibilité
      montantMainOeuvreCout: montantsMainOeuvre.cout, // 💰 NOUVEAU : Coût explicite
      montantMainOeuvreVente: montantsMainOeuvre.vente, // 💰 NOUVEAU : Vente
      montantMainOeuvreGain: montantsMainOeuvre.gain, // 💰 NOUVEAU : Gain
      recalculerRepartition: true // 🔄 NOUVEAU : Flag pour recalcul
    };
    
    onEstimationChange(updatedEstimation);
    setIsEditing(false);
    setHasChanges(false);
    
    // 🔄 CORRECTION : Pas de délai - permettre modifications futures immédiatement
    setIsUserEditing(false);
  };

  // Annuler les modifications (version SIMPLIFIÉE)
  const handleCancel = () => {
    setEditableData({
      nombrePersonnes: estimation.nombrePersonnes || 2,
      demiJourneesFabrication: estimation.demiJourneesFabrication || 0,
      demiJourneesPose: estimation.demiJourneesPose || 0,
      totalDemiJournees: estimation.totalDemiJournees || 0,
      repartitionFabrication: 60,
      repartitionPose: 40,
      tauxHoraireCout: 25,  // 💰 NOUVEAU
      tauxHoraireVente: 75, // 💰 NOUVEAU
      tauxHoraire: 25,
      nombreSousTraitants: 0, // 👷 NOUVEAU
      dateCommencement: estimation.dateCommencement || estimation.dateDebut || '',
      dateReception: estimation.dateReception || estimation.dateFin || '',
      competences: {
        fabrication: ['Menuisier', 'Ébéniste'],
        pose: ['Poseur', 'Finisseur']
      },
      planning: {
        semaine: 5,
        heuresParJour: 8,
        creneaux: ['matin', 'après-midi']
      }
    });
    setIsEditing(false);
    setHasChanges(false);
    
    // 🔄 CORRECTION : Pas de délai - permettre modifications futures immédiatement
    setIsUserEditing(false);
  };

  // Calculer la répartition (version simple)
  const { fabrication, pose } = calculerRepartition();

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-purple-900 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
              <IconUsers className="w-6 h-6 text-white" />
            </div>
            Équipe & Ressources
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* 🔄 CORRECTION : Supprimer l'indicateur "toujours modifiable" - plus nécessaire */}
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(true);
                  // 🔄 CORRECTION : Optionnel - plus de flag strict
                  setIsUserEditing(true);
                }}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <IconEdit className="w-4 h-4 mr-1" />
                Modifier
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <IconX className="w-4 h-4 mr-1" />
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={!hasChanges}
                >
                  <IconDeviceFloppy className="w-4 h-4 mr-1" />
                  Sauvegarder
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {(estimation.totalDemiJournees > 0 || editableData.totalDemiJournees > 0) ? (
          <div className="space-y-4">
            {/* Nombre de personnes */}
            <div className="bg-purple-100/50 p-4 rounded-lg">
              <Label className="text-purple-800 font-medium mb-2 block">
                Nombre de personnes affectées
              </Label>
              
              {isEditing ? (
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChange('nombrePersonnes', Math.max(1, editableData.nombrePersonnes - 1))}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <IconMinus className="w-4 h-4" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={editableData.nombrePersonnes}
                    onChange={(e) => handleChange('nombrePersonnes', parseInt(e.target.value) || 1)}
                    min="1"
                    max="10"
                    className="w-20 text-center border-purple-300 focus:border-purple-500"
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChange('nombrePersonnes', Math.min(10, editableData.nombrePersonnes + 1))}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <IconPlus className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-900">
                    {editableData.nombrePersonnes}
                  </div>
                  <div className="text-sm text-purple-600">personnes affectées</div>
                </div>
              )}
            </div>

            {/* Sous-traitants */}
            <div className="bg-orange-100/50 p-4 rounded-lg">
              <Label className="text-orange-800 font-medium mb-2 block">
                👷 Sous-traitants
              </Label>
              
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChange('nombreSousTraitants', Math.max(0, editableData.nombreSousTraitants - 1))}
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <IconMinus className="w-4 h-4" />
                    </Button>
                    
                    <Input
                      type="number"
                      value={editableData.nombreSousTraitants}
                      onChange={(e) => handleChange('nombreSousTraitants', parseInt(e.target.value) || 0)}
                      min="0"
                      max="10"
                      className="w-20 text-center border-orange-300 focus:border-orange-500"
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChange('nombreSousTraitants', Math.min(10, editableData.nombreSousTraitants + 1))}
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <IconPlus className="w-4 h-4" />
                    </Button>
                    
                    <span className="text-orange-700 font-medium ml-2">
                      sous-traitant{editableData.nombreSousTraitants > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {editableData.nombreSousTraitants > 0 && (
                    <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                      Équipe totale : {editableData.nombrePersonnes + editableData.nombreSousTraitants} personnes
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-900">
                    {editableData.nombreSousTraitants}
                  </div>
                  <div className="text-sm text-orange-600">
                    {editableData.nombreSousTraitants === 0 ? 'Aucun sous-traitant' : `sous-traitant${editableData.nombreSousTraitants > 1 ? 's' : ''}`}
                  </div>
                  {editableData.nombreSousTraitants > 0 && (
                    <div className="text-xs text-orange-500 mt-1">
                      Total équipe : {editableData.nombrePersonnes + editableData.nombreSousTraitants} pers.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Répartition des tâches */}
            <div className="space-y-4">
              <Label className="text-purple-800 font-medium">
                Répartition des tâches
              </Label>
              
              {/* NOUVEAU : Affichage du total de demi-journées */}
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-700">Total demi-journées planifiées :</span>
                  <span className="font-bold text-purple-900 text-lg">{editableData.totalDemiJournees}</span>
                </div>
                <div className="text-xs text-purple-600 mt-1">
                  La répartition est calculée automatiquement (arrondie au plus proche)
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-purple-800">Fabrication</span>
                    <Badge variant="outline" className="text-purple-700">
                      {editableData.repartitionFabrication}%
                    </Badge>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={editableData.repartitionFabrication}
                        onChange={(e) => handleChange('repartitionFabrication', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-purple-600">
                        {fabrication} demi-journées
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-purple-600">
                      {editableData.demiJourneesFabrication} demi-j
                    </div>
                  )}
                </div>
                
                <div className="bg-purple-100 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-purple-800">Pose</span>
                    <Badge variant="outline" className="text-purple-700">
                      {editableData.repartitionPose}%
                    </Badge>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={editableData.repartitionPose}
                        onChange={(e) => handleChange('repartitionPose', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-purple-600">
                        {pose} demi-journées
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-purple-600">
                      {editableData.demiJourneesPose} demi-j
                    </div>
                  )}
                </div>
              </div>
              
              {/* Vérification du total */}
              {editableData.totalDemiJournees > 0 && (
                <div className="text-center text-sm text-purple-600 bg-purple-50 p-2 rounded">
                  Total: {editableData.demiJourneesFabrication} + {editableData.demiJourneesPose} = {editableData.demiJourneesFabrication + editableData.demiJourneesPose} demi-journées
                </div>
              )}
            </div>

            {/* Taux horaires coût et vente */}
            {isEditing && (
              <div className="bg-purple-100/50 p-4 rounded-lg space-y-3">
                <Label className="text-purple-800 font-medium block">
                  💰 Taux horaires
                </Label>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Taux de coût */}
                  <div>
                    <Label className="text-purple-700 text-sm mb-1 block">Coût interne</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editableData.tauxHoraireCout}
                        onChange={(e) => handleChange('tauxHoraireCout', parseInt(e.target.value) || 25)}
                        min="10"
                        max="100"
                        className="w-20 border-purple-300 focus:border-purple-500"
                      />
                      <span className="text-purple-700 text-sm">€/h</span>
                    </div>
                  </div>
                  
                  {/* Taux de vente */}
                  <div>
                    <Label className="text-purple-700 text-sm mb-1 block">Vente client</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editableData.tauxHoraireVente}
                        onChange={(e) => handleChange('tauxHoraireVente', parseInt(e.target.value) || 75)}
                        min="50"
                        max="200"
                        className="w-20 border-purple-300 focus:border-purple-500"
                      />
                      <span className="text-purple-700 text-sm">€/h</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded">
                  Marge : {editableData.tauxHoraireVente - editableData.tauxHoraireCout}€/h 
                  ({Math.round(((editableData.tauxHoraireVente - editableData.tauxHoraireCout) / editableData.tauxHoraireVente) * 100)}%)
                </div>
              </div>
            )}
            
            {/* 💰 NOUVEAU : Affichage détaillé coût/vente/gain */}
            {editableData.totalDemiJournees > 0 && (
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-lg border border-purple-300 space-y-3">
                <Label className="text-purple-800 font-medium block">
                  💼 Analyse financière main d'œuvre
                </Label>
                
                {(() => {
                  const calculs = calculerCoutMainOeuvre(
                    editableData.nombrePersonnes,
                    editableData.totalDemiJournees,
                    editableData.tauxHoraireCout,
                    editableData.tauxHoraireVente,
                    editableData.nombreSousTraitants
                  );
                  const totalPersonnes = editableData.nombrePersonnes + editableData.nombreSousTraitants;
                  const totalHeures = editableData.totalDemiJournees * 4;
                  
                  return (
                    <div className="space-y-3">
                      {/* Détail du calcul */}
                      <div className="text-xs text-purple-600 bg-white/50 p-2 rounded">
                        {totalPersonnes} personne{totalPersonnes > 1 ? 's' : ''} 
                        ({editableData.nombrePersonnes} interne{editableData.nombrePersonnes > 1 ? 's' : ''}
                        {editableData.nombreSousTraitants > 0 && ` + ${editableData.nombreSousTraitants} sous-traitant${editableData.nombreSousTraitants > 1 ? 's' : ''}`}) 
                        × {editableData.totalDemiJournees} demi-journées × 4h = {totalHeures * totalPersonnes}h
                      </div>
                      
                      {/* Coût */}
                      <div className="flex justify-between items-center">
                        <span className="text-purple-700">Coût total :</span>
                        <span className="text-xl font-bold text-purple-900">
                          {calculs.cout.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                      
                      {/* Vente */}
                      <div className="flex justify-between items-center">
                        <span className="text-purple-700">Vente client :</span>
                        <span className="text-xl font-bold text-green-700">
                          {calculs.vente.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                      
                      {/* Gain */}
                      <div className="flex justify-between items-center pt-2 border-t border-purple-300">
                        <span className="text-purple-800 font-medium">Gain sur main d'œuvre :</span>
                        <span className="text-2xl font-bold text-emerald-700">
                          + {calculs.gain.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                      
                      {/* Pourcentages */}
                      {estimation.montantDevis > 0 && (
                        <div className="text-sm text-purple-700 bg-purple-50 p-2 rounded">
                          <div>Coût : {Math.round((calculs.cout / estimation.montantDevis) * 100)}% du devis</div>
                          <div>Vente : {Math.round((calculs.vente / estimation.montantDevis) * 100)}% du devis</div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Synchronisation avec le planning */}
            {(editableData.dateCommencement || editableData.dateReception) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                  <IconCalendarEvent className="w-4 h-4" />
                  Synchronisé avec le planning
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {editableData.dateCommencement && (
                    <div>
                      <span className="text-green-600">Début :</span>
                      <div className="font-medium text-green-800">
                        {new Date(editableData.dateCommencement).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                    </div>
                  )}
                  {editableData.dateReception && (
                    <div>
                      <span className="text-green-600">Fin :</span>
                      <div className="font-medium text-green-800">
                        {new Date(editableData.dateReception).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Compétences requises */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <Label className="text-purple-800 font-medium mb-3 block">
                Compétences requises
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-purple-700 mb-2">Fabrication</div>
                  <div className="flex flex-wrap gap-1">
                    {editableData.competences.fabrication.map((comp, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-purple-700 mb-2">Pose</div>
                  <div className="flex flex-wrap gap-1">
                    {editableData.competences.pose.map((comp, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-purple-600 py-8">
            <IconUsers className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <div>En attente du calcul d'estimation</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlocEquipe; 