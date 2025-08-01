import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/affaires';
import { getBdcs, getAchats } from '@/services/achatService';

export const SyntheseAchatsSection = ({ affaire, onDataUpdate }) => {
  const [achatsRealises, setAchatsRealises] = useState([]);
  const [bdcReceptionnes, setBdcReceptionnes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!affaire?.id) return;
      
      try {
        setLoading(true);
        const [bdcResponse, achatsResponse] = await Promise.all([
          getBdcs({ affaireId: affaire.id }),
          getAchats({ affaireId: affaire.id })
        ]);
        
        let bdcsList = [];
        if (bdcResponse?.bdc) {
          bdcsList = bdcResponse.bdc;
        } else if (bdcResponse?.bdcs) {
          bdcsList = bdcResponse.bdcs;
        } else if (Array.isArray(bdcResponse)) {
          bdcsList = bdcResponse;
        }
        
        const bdcReceptionnesList = bdcsList.filter(bdc => 
          bdc && (bdc.dateReception || bdc.statut === 'RECEPTIONNE')
        );
        
        let facturesList = [];
        if (Array.isArray(achatsResponse)) {
          facturesList = achatsResponse;
        } else if (achatsResponse && Array.isArray(achatsResponse.achats)) {
          facturesList = achatsResponse.achats;
        }
        
        setBdcReceptionnes(bdcReceptionnesList);
        setAchatsRealises(facturesList);
        
      } catch (error) {
        console.error('Erreur lors du chargement de la synthèse:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [affaire?.id]);

  const totalBdc = bdcReceptionnes.reduce((sum, bdc) => sum + (bdc.montantHt || 0), 0);
  const totalFactures = achatsRealises.reduce((sum, achat) => sum + (achat.montantHt || 0), 0);
  const totalGeneral = totalBdc + totalFactures;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Résumé des totaux */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Total BDC Réceptionnés</div>
          <div className="text-lg font-bold text-green-700 dark:text-green-300">{formatCurrency(totalBdc)}</div>
          <div className="text-xs text-green-600 dark:text-green-400">{bdcReceptionnes.length} BDC</div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Factures</div>
          <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatCurrency(totalFactures)}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400">{achatsRealises.length} factures</div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Général</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalGeneral)}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {bdcReceptionnes.length + achatsRealises.length} éléments
          </div>
        </div>
      </div>

      {/* Listes détaillées */}
      {bdcReceptionnes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h5 className="font-medium text-gray-900 dark:text-white mb-3">BDC Réceptionnés</h5>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {bdcReceptionnes.map((bdc) => (
              <div key={bdc.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  {bdc.numero} - {bdc.fournisseur}
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(bdc.montantHt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {achatsRealises.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h5 className="font-medium text-gray-900 dark:text-white mb-3">Factures d'Achats</h5>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {achatsRealises.map((achat) => (
              <div key={achat.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  {achat.numeroFacture} - {achat.fournisseur}
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {formatCurrency(achat.montantHt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalGeneral === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-lg mb-2">📋</div>
          <div>Aucun achat réalisé pour le moment</div>
        </div>
      )}
    </div>
  );
};

export default SyntheseAchatsSection; 