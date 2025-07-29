import React from 'react';
import { Edit, Trash2, Receipt, Calendar, DollarSign, Check, X, Clock, FileText } from 'lucide-react';
import { formatDisplayDate } from '../../../utils/dateHelpers';
import PdfUploadFirebase from '../../ui/PdfUploadFirebase';

/**
 * Composant de liste pour les Factures d'achats
 * Composant réutilisable pour afficher une liste de factures d'achats
 */
const FactureAchatList = ({ 
  factures = [], 
  onEdit,
  onDelete,
  onValidate,
  onCancel,
  onPay,
  loading = false,
  emptyMessage = "Aucune facture d'achat trouvée",
  showActions = true,
  // Fonctions Firebase pour l'upload PDF
  uploadPdfFirebase,
  deletePdfFirebase, 
  getPdfViewUrlFirebase,
  onPdfUploadSuccess,
  onPdfUploadError
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
      'RECU': 'orange',
      'VALIDE': 'blue', 
      'PAYE': 'green',
      'LITIGE': 'red'
    };
    return colors[statut] || 'gray';
  };

  const formatStatut = (statut) => {
    const labels = {
      'RECU': 'Reçu',
      'VALIDE': 'Validé',
      'PAYE': 'Payé',
      'LITIGE': 'Litige'
    };
    return labels[statut] || statut;
  };

  const getStatusBadge = (facture) => {
    const statusConfig = {
      'RECU': { 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', 
        text: 'Reçu' 
      },
      'VALIDE': { 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', 
        text: 'Validé' 
      },
      'PAYE': { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', 
        text: 'Payé' 
      },
      'LITIGE': { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', 
        text: 'Litige' 
      }
    };

    // Priorité : datePaiement > statut
    if (facture.datePaiement) {
      const config = statusConfig['PAYE'];
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
          {config.text}
        </span>
      );
    }

    const config = statusConfig[facture.statut] || statusConfig['RECU'];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Chargement des factures d'achats...</p>
      </div>
    );
  }

  if (factures.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune facture d'achat</h3>
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {factures.map((facture) => (
        <div key={facture.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
          {/* En-tête avec numéro et statut */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Receipt className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Facture #{facture.numero}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(facture.dateFacture)}
                </p>
              </div>
            </div>
            {getStatusBadge(facture)}
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fournisseur</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{facture.fournisseur}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Montant TTC</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formatMontant(facture.montantTtc)}</p>
            </div>
          </div>

          {/* Date d'échéance si présente */}
          {facture.dateEcheance && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date d'échéance</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDisplayDate(facture.dateEcheance)}
                </p>
              </div>
            </div>
          )}

          {/* Date de paiement si présente */}
          {facture.datePaiement && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date de paiement</p>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-green-600">
                  {formatDate(facture.datePaiement)}
                </p>
              </div>
            </div>
          )}

          {/* BDC associé si présent */}
          {facture.bdcId && facture.bdc && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Bon de commande associé</p>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  BDC #{facture.bdc.numero} - {formatMontant(facture.bdc.montantHt)}
                </p>
              </div>
            </div>
          )}

          {/* Description si présente */}
          {facture.description && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">{facture.description}</p>
            </div>
          )}

          {/* Section PDF Firebase */}
          <div className="border-t pt-4">
            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Document PDF (Firebase Storage)
            </h5>
            
            <PdfUploadFirebase
              entityId={facture.id}
              entityType="facture"
              existingFile={
                facture.nomFichier ? {
                  nomFichier: facture.nomFichier,
                  tailleFichier: facture.tailleFichier,
                  dateUpload: facture.dateUpload,
                  firebaseDownloadUrl: facture.firebaseDownloadUrl,
                  firebaseStoragePath: facture.firebaseStoragePath
                } : null
              }
              uploadFunction={uploadPdfFirebase}
              deleteFunction={deletePdfFirebase}
              getViewUrlFunction={getPdfViewUrlFirebase}
              onUploadSuccess={(result) => onPdfUploadSuccess && onPdfUploadSuccess(facture.id, result)}
              onUploadError={(error) => onPdfUploadError && onPdfUploadError(facture.id, error)}
            />
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {/* Actions selon le statut */}
                {facture.statut === 'RECU' && (
                  <>
                    {onValidate && (
                      <button
                        onClick={() => onValidate(facture.id)}
                        style={{
                          backgroundColor: '#6b7c3d',
                          color: '#ffffff',
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: '500',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#556533'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#6b7c3d'}
                        title="Valider la facture"
                      >
                        <Check className="w-4 h-4" />
                        Valider
                      </button>
                    )}
                    {onCancel && (
                      <button
                        onClick={() => onCancel(facture.id)}
                        style={{
                          backgroundColor: '#ffffff',
                          color: '#000000',
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: '500',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#ffffff'}
                        title="Marquer en litige"
                      >
                        <X className="w-4 h-4" />
                        Litige
                      </button>
                    )}
                  </>
                )}
                
                {facture.statut === 'VALIDE' && !facture.datePaiement && onPay && (
                  <button
                    onClick={() => onPay(facture.id)}
                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                    title="Marquer comme payée"
                  >
                    <DollarSign className="w-3 h-3" />
                    Payer
                  </button>
                )}

                {facture.statut === 'PAYE' && (
                  <span className="px-3 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Payée
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Boutons d'action généraux */}
                {onEdit && (
                  <button
                    onClick={() => onEdit(facture)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(facture.id)}
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

export default FactureAchatList; 