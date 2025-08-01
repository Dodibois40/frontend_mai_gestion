import React from 'react';
import { Edit, Trash2, FileText, Calendar, DollarSign, Check, X, Clock, Truck } from 'lucide-react';
import { formatDisplayDate } from '../../../utils/dateHelpers';

/**
 * Composant de liste pour les BDC
 * Composant réutilisable pour afficher une liste de BDC
 */
const BdcList = ({ 
  bdcs = [], 
  onEdit,
  onDelete,
  onValidate,
  onCancel,
  onReceive,
  loading = false,
  emptyMessage = "Aucun bon de commande trouvé",
  showActions = true
}) => {
  // Fonctions utilitaires
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatutColor = (statut) => {
    const colors = {
      'EN_ATTENTE': 'orange',
      'VALIDE': 'blue',
      'RECEPTIONNE': 'green',
      'ANNULE': 'red'
    };
    return colors[statut] || 'gray';
  };

  const formatStatut = (statut) => {
    const labels = {
      'EN_ATTENTE': 'En attente',
      'VALIDE': 'Validé',
      'RECEPTIONNE': 'Réceptionné',
      'ANNULE': 'Annulé'
    };
    return labels[statut] || statut;
  };

  const getStatusBadge = (bdc) => {
    const statusConfig = {
      'EN_ATTENTE': { 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', 
        text: 'En attente' 
      },
      'VALIDE': { 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', 
        text: 'Validé' 
      },
      'RECEPTIONNE': { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', 
        text: 'Réceptionné' 
      },
      'ANNULE': { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', 
        text: 'Annulé' 
      }
    };

    // Priorité : dateReception > statut
    if (bdc.dateReception) {
      const config = statusConfig['RECEPTIONNE'];
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
          {config.text}
        </span>
      );
    }

    const config = statusConfig[bdc.statut] || statusConfig['EN_ATTENTE'];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Chargement des BDCs...</p>
      </div>
    );
  }

  if (bdcs.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun BDC</h3>
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bdcs.map((bdc) => (
        <div key={bdc.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
          {/* En-tête avec numéro et statut */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  BDC #{bdc.numero}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(bdc.dateBdc)}
                </p>
              </div>
            </div>
            {getStatusBadge(bdc)}
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fournisseur</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{bdc.fournisseur}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Montant HT</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formatMontant(bdc.montantHt)}</p>
            </div>
          </div>

          {/* Date de livraison si présente */}
          {bdc.dateLivraison && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date de livraison prévue</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDisplayDate(bdc.dateLivraison)}
                </p>
              </div>
            </div>
          )}

          {/* Date de réception si présente */}
          {bdc.dateReception && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date de réception</p>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-green-600">
                  {formatDate(bdc.dateReception)}
                </p>
              </div>
            </div>
          )}

          {/* Commentaire si présent */}
          {bdc.commentaire && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">{bdc.commentaire}</p>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {/* Actions selon le statut */}
                {bdc.statut === 'EN_ATTENTE' && (
                  <>
                    {onValidate && (
                      <button
                        onClick={() => onValidate(bdc.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                        title="Valider le BDC"
                      >
                        <Check className="w-3 h-3" />
                        Valider
                      </button>
                    )}
                    {onCancel && (
                      <button
                        onClick={() => onCancel(bdc.id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                        title="Annuler le BDC"
                      >
                        <X className="w-3 h-3" />
                        Annuler
                      </button>
                    )}
                  </>
                )}
                
                {bdc.statut === 'VALIDE' && !bdc.dateReception && onReceive && (
                  <button
                    onClick={() => onReceive(bdc.id)}
                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                    title="Réceptionner le BDC"
                  >
                    <Truck className="w-3 h-3" />
                    Réceptionner
                  </button>
                )}

                {bdc.statut === 'RECEPTIONNE' && (
                  <span className="px-3 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Réceptionné
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Boutons d'action généraux */}
                {onEdit && (
                  <button
                    onClick={() => onEdit(bdc)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(bdc.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BdcList; 