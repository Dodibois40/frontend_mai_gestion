import React, { useState, useEffect } from 'react';
import {
  IconEdit,
  IconTrash,
  IconCalculator,
  IconPlayerPlay,
  IconCheck,
  IconRefresh,
  IconCurrencyEuro,
  IconClock,
  IconCalendar
} from '@tabler/icons-react';
import { toast } from 'sonner';
import phasesService from '@/services/phasesService';
import { formatCurrency, formatHours } from '@/utils/affaires';

const STATUT_PHASE_OPTIONS = [
  { value: 'PLANIFIEE', label: 'Planifiée' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINEE', label: 'Terminée' },
  { value: 'ANNULEE', label: 'Annulée' },
];

export const PhaseCard = ({ phase, onEdit, onDelete, onCalculate, onStatusChange }) => {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await phasesService.getStats(phase.id);
      setStats(data);
    } catch (error) {
      console.error('Erreur stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [phase.id]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'FABRICATION': return '🔨';
      case 'POSE': return '🏗️';
      case 'SERVICE': return '🔧';
      case 'LIVRAISON': return '🚚';
      case 'SAV': return '🛠️';
      default: return '📋';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'PLANIFIEE': return 'EN_COURS';
      case 'EN_COURS': return 'TERMINEE';
      case 'TERMINEE': return null;
      case 'ANNULEE': return 'PLANIFIEE';
      default: return null;
    }
  };

  const getStatusAction = (currentStatus) => {
    switch (currentStatus) {
      case 'PLANIFIEE': return { label: 'Démarrer', icon: IconPlayerPlay, color: 'orange' };
      case 'EN_COURS': return { label: 'Terminer', icon: IconCheck, color: 'green' };
      case 'TERMINEE': return null;
      case 'ANNULEE': return { label: 'Réactiver', icon: IconRefresh, color: 'blue' };
      default: return null;
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await phasesService.update(phase.id, { statut: newStatus });
      toast.success(`Statut mis à jour vers "${STATUT_PHASE_OPTIONS.find(s => s.value === newStatus)?.label}"`);
      onStatusChange?.();
    } catch (error) {
      toast.error(`Erreur : ${error.message}`);
    }
  };

  const statusAction = getStatusAction(phase.statut);
  const nextStatus = getNextStatus(phase.statut);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header de la phase */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getTypeIcon(phase.typePhase)}</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{phase.nom}</h3>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                phase.statut === 'TERMINEE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                phase.statut === 'EN_COURS' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                phase.statut === 'PLANIFIEE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
              }`}>
                {STATUT_PHASE_OPTIONS.find(s => s.value === phase.statut)?.label || phase.statut}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(phase)}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Modifier"
            >
              <IconEdit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onCalculate(phase.id)}
              className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
              title="Recalculer"
            >
              <IconCalculator className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(phase.id)}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Supprimer"
            >
              <IconTrash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {phase.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {phase.description}
          </p>
        )}
      </div>

      {/* Actions de statut */}
      {statusAction && nextStatus && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50">
          <button
            onClick={() => handleStatusChange(nextStatus)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusAction.color === 'orange' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400' :
              statusAction.color === 'green' ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' :
              statusAction.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400' :
              'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900/30 dark:text-gray-400'
            }`}
          >
            <statusAction.icon className="w-4 h-4" />
            {statusAction.label}
          </button>
        </div>
      )}

      {/* Statistiques de la phase */}
      <div className="px-6 py-4">
        {loadingStats ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-2 text-sm text-gray-600">Chargement...</span>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Temps estimé</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatHours(stats.tempsEstime)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Temps réel</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatHours(stats.tempsReel)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Coût estimé</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(stats.coutEstime)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Coût réel</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(stats.coutReel)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
            Aucune donnée disponible
          </div>
        )}

        {/* Indicateurs de dates */}
        {(phase.dateDebut || phase.dateFin) && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {phase.dateDebut && (
                <div className="flex items-center gap-1">
                  <IconCalendar className="w-4 h-4" />
                  <span>Début: {new Date(phase.dateDebut).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
              {phase.dateFin && (
                <div className="flex items-center gap-1">
                  <IconCalendar className="w-4 h-4" />
                  <span>Fin: {new Date(phase.dateFin).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhaseCard; 