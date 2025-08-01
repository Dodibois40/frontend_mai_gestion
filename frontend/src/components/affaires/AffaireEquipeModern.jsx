import React, { useState, useEffect } from 'react';
import {
  IconPlus,
  IconRefresh,
  IconUsers,
  IconAlertTriangle
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import phasesService from '@/services/phasesService';
import { PhaseCard, PhaseStats } from './equipe';

export default function AffaireEquipeModern({ affaire, onDataUpdate }) {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);

  useEffect(() => {
    if (affaire?.id) {
      loadPhases();
    }
  }, [affaire?.id]);

  const loadPhases = async () => {
    if (!affaire?.id) return;

    setLoading(true);
    try {
      const response = await phasesService.getByAffaire(affaire.id);
      
      // Le backend retourne { phases: [...], total: number }
      const phasesArray = Array.isArray(response) ? response : (response?.phases || []);
      
      setPhases(phasesArray);
    } catch (error) {
      console.error('Erreur lors du chargement des phases:', error);
      toast.error('Erreur lors du chargement des phases');
      setPhases([]); // S'assurer que phases est toujours un tableau
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePhase = () => {
    setEditingPhase(null);
    setShowModal(true);
  };

  const handleEditPhase = (phase) => {
    setEditingPhase(phase);
    setShowModal(true);
  };

  const handleDeletePhase = async (phaseId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette phase ?')) return;

    try {
      await phasesService.delete(phaseId);
      toast.success('Phase supprimée avec succès');
      loadPhases();
      onDataUpdate?.();
    } catch (error) {
      console.error('Erreur suppression phase:', error);
      toast.error('Erreur lors de la suppression de la phase');
    }
  };

  const handleCalculatePhase = async (phaseId) => {
    try {
      await phasesService.calculateRealData(phaseId);
      toast.success('Calculs de la phase mis à jour');
      loadPhases();
      onDataUpdate?.();
    } catch (error) {
      console.error('Erreur calcul phase:', error);
      toast.error('Erreur lors du recalcul de la phase');
    }
  };

  const handlePhaseSaved = () => {
    setShowModal(false);
    setEditingPhase(null);
    loadPhases();
    onDataUpdate?.();
  };

  const handleStatusChange = () => {
    loadPhases();
    onDataUpdate?.();
  };

  if (!affaire) {
    return (
      <div className="p-6 text-center">
        <IconAlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucune affaire sélectionnée</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IconUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            Gestion d'Équipe
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Phases de travail pour l'affaire <span className="font-semibold">{affaire.numero}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={loadPhases}
            variant="outline"
            size="sm"
            icon={IconRefresh}
            disabled={loading}
          >
            Actualiser
          </Button>
          <Button
            onClick={handleCreatePhase}
            size="sm"
            icon={IconPlus}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Nouvelle Phase
          </Button>
        </div>
      </div>

      {/* Statistiques des phases */}
      <PhaseStats phases={phases} loading={loading} />

      {/* Liste des phases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="w-5 h-5" />
            Phases de Travail ({phases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg h-32 animate-pulse"></div>
              ))}
            </div>
          ) : phases.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconUsers className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Aucune phase créée
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Commencez par créer une première phase de travail pour organiser le suivi de cette affaire.
              </p>
              <Button
                onClick={handleCreatePhase}
                icon={IconPlus}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Créer la première phase
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {phases.map((phase) => (
                <PhaseCard
                  key={phase.id}
                  phase={phase}
                  onEdit={handleEditPhase}
                  onDelete={handleDeletePhase}
                  onCalculate={handleCalculatePhase}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création/édition (à implémenter séparément) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingPhase ? 'Modifier la phase' : 'Nouvelle phase'}
              </h3>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handlePhaseSaved}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingPhase ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 