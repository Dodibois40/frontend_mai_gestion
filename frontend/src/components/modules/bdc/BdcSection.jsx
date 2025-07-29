import React, { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import BdcList from './BdcList';
import BdcModal from './BdcModal';
import PdfUploadFirebase from '../../ui/PdfUploadFirebase';
import { createBdc, getBdcs, updateBdc, deleteBdc, getCategoriesAchat, validerBdc, annulerBdc, receptionnerBdc } from '../../../services/achatService';
import { getFournisseursActifs } from '../../../services/fournisseurService';

/**
 * Composant de section BDC réutilisable
 * Utilise les composants modulaires BdcList et BdcModal
 */
const BdcSection = ({ 
  affaireId, 
  onUpdate, 
  title = "Bons de Commande",
  subtitle = "Gestion des commandes fournisseurs",
  showHeader = true,
  collapsible = false,
  className = ""
}) => {
  // États locaux
  const [bdcs, setBdcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBdc, setEditingBdc] = useState(null);
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState(null);

  // Charger les BDCs depuis la base de données
  const loadBdcs = async () => {
    if (!affaireId) {
      console.warn('⚠️ [BDC] affaireId manquant');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [BDC] Chargement des BDCs pour affaireId:', affaireId);
      
      const response = await getBdcs({ affaireId });
      console.log('📦 [BDC] Réponse API:', response);
      
      // Gérer différents formats de réponse
      let bdcsList = [];
      if (response?.bdc) {
        bdcsList = response.bdc;
      } else if (response?.bdcs) {
        bdcsList = response.bdcs;
      } else if (Array.isArray(response)) {
        bdcsList = response;
      } else {
        console.warn('⚠️ [BDC] Format de réponse inattendu:', response);
        bdcsList = [];
      }
      
      console.log('✅ [BDC] BDCs chargés:', bdcsList.length);
      setBdcs(bdcsList);
    } catch (error) {
      console.error('❌ [BDC] Erreur chargement BDCs:', error);
      setError('Erreur lors du chargement des BDCs');
      toast.error(`Erreur lors du chargement des BDCs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Charger les catégories
  const loadCategories = async () => {
    try {
      console.log('🔄 [BDC] Chargement des catégories');
      const categoriesData = await getCategoriesAchat();
      console.log('📂 [BDC] Catégories chargées:', categoriesData);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('❌ [BDC] Erreur lors du chargement des catégories:', error);
    }
  };

  // Charger les fournisseurs actifs
  const loadFournisseurs = async () => {
    try {
      console.log('🔄 [BDC] Chargement des fournisseurs');
      const fournisseursData = await getFournisseursActifs();
      console.log('🏢 [BDC] Fournisseurs chargés:', fournisseursData);
      setFournisseurs(fournisseursData || []);
    } catch (error) {
      console.error('❌ [BDC] Erreur lors du chargement des fournisseurs:', error);
    }
  };

  // Effet de chargement initial
  useEffect(() => {
    console.log('🔄 [BDC] Effet de chargement initial avec affaireId:', affaireId);
    loadBdcs();
    loadCategories();
    loadFournisseurs();
  }, [affaireId]);

  // Ouvrir le modal de création
  const handleCreateBdc = () => {
    console.log('➕ [BDC] Ouverture du modal de création');
    setEditingBdc(null);
    setShowModal(true);
  };

  // Créer ou modifier un BDC
  const handleSubmitBdc = async (values) => {
    try {
      setSubmitting(true);
      console.log('💾 [BDC] Sauvegarde BDC:', values);
      
      const bdcData = {
        ...values,
        affaireId: affaireId,
        dateBdc: values.dateBdc instanceof Date ? values.dateBdc : new Date(values.dateBdc)
      };

      console.log('📤 [BDC] Données à envoyer:', bdcData);

      if (editingBdc) {
        await updateBdc(editingBdc.id, bdcData);
        toast.success('BDC modifié avec succès !');
        console.log('✅ [BDC] BDC modifié');
      } else {
        const result = await createBdc(bdcData);
        toast.success('BDC créé avec succès !');
        console.log('✅ [BDC] BDC créé:', result);
      }

      await loadBdcs();
      handleCloseModal();
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('❌ [BDC] Erreur lors de la sauvegarde du BDC:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBdc(null);
  };

  // Supprimer un BDC
  const handleDeleteBdc = async (bdcId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce BDC ?')) {
      return;
    }

    // Récupérer le BDC pour diagnostic
    const targetBdc = bdcs.find(bdc => bdc.id === bdcId);
    console.log('🔍 [BDC] Diagnostic suppression:', {
      bdcId,
      statut: targetBdc?.statut,
      targetBdc: targetBdc
    });

    try {
      console.log('🗑️ [BDC] Tentative suppression BDC:', bdcId);
      await deleteBdc(bdcId);
      toast.success('BDC supprimé avec succès !');
      await loadBdcs();
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('❌ [BDC] Erreur suppression BDC:', error);
      console.log('🔍 [BDC] Détails erreur:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
        fullError: error
      });
      
      // Gestion spécifique de l'erreur 400 (mot de passe requis)
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || '';
        console.log('🔍 [BDC] Message erreur 400 exact:', JSON.stringify(errorMessage));
        
        // Vérification plus permissive du message d'erreur
        const needsPassword = errorMessage.toLowerCase().includes('mot de passe') || 
                            errorMessage.toLowerCase().includes('password') || 
                            errorMessage.toLowerCase().includes('requis') || 
                            errorMessage.toLowerCase().includes('required') ||
                            errorMessage.toLowerCase().includes('validé');
        
        console.log('🔍 [BDC] Besoin mot de passe détecté:', needsPassword);
        
        if (needsPassword) {
          console.log('🔐 [BDC] Demande mot de passe à l\'utilisateur');
          
          // Demander le mot de passe avec un message clair
          const password = window.prompt(
            'Ce BDC est validé et nécessite un mot de passe pour être supprimé.\n\n' +
            'Entrez le mot de passe administrateur :'
          );
          
          if (password) {
            try {
              console.log('🔐 [BDC] Nouvelle tentative avec mot de passe');
              await deleteBdc(bdcId, password);
              toast.success('BDC supprimé avec succès !');
              await loadBdcs();
              
              if (onUpdate) {
                onUpdate();
              }
            } catch (passwordError) {
              console.error('❌ [BDC] Erreur avec mot de passe:', passwordError);
              
              if (passwordError.response?.status === 401) {
                toast.error('Mot de passe incorrect');
              } else {
                const pwdErrorMsg = passwordError.response?.data?.message || passwordError.message || 'Erreur inconnue';
                toast.error(`Erreur: ${pwdErrorMsg}`);
              }
            }
          } else {
            console.log('🔐 [BDC] Utilisateur a annulé la saisie du mot de passe');
          }
        } else {
          // Autre type d'erreur 400
          console.log('🔍 [BDC] Erreur 400 non liée au mot de passe');
          toast.error(`Erreur: ${errorMessage || 'Erreur de validation'}`);
        }
      } else {
        // Autres types d'erreurs (401, 403, 500, etc.)
        const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la suppression du BDC';
        console.log('🔍 [BDC] Erreur non-400:', errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  // Modifier un BDC
  const handleEditBdc = (bdc) => {
    console.log('✏️ [BDC] Modification BDC:', bdc);
    setEditingBdc(bdc);
    setShowModal(true);
  };

  // Valider un BDC
  const handleValidateBdc = async (bdcId) => {
    try {
      console.log('✅ [BDC] Validation BDC:', bdcId);
      await validerBdc(bdcId);
      toast.success('BDC validé avec succès !');
      await loadBdcs();
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('❌ [BDC] Erreur lors de la validation du BDC:', error);
      toast.error(`Erreur lors de la validation: ${error.message}`);
    }
  };

  // Annuler un BDC
  const handleCancelBdc = async (bdcId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce BDC ?')) {
      return;
    }

    try {
      console.log('❌ [BDC] Annulation BDC:', bdcId);
      await annulerBdc(bdcId);
      toast.success('BDC annulé avec succès !');
      await loadBdcs();
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('❌ [BDC] Erreur lors de l\'annulation du BDC:', error);
      toast.error(`Erreur lors de l'annulation: ${error.message}`);
    }
  };

  // Réceptionner un BDC
  const handleReceptionBdc = async (bdcId) => {
    try {
      console.log('📦 [BDC] Réception BDC:', bdcId);
      await receptionnerBdc(bdcId);
      toast.success('BDC réceptionné avec succès !');
      await loadBdcs();
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('❌ [BDC] Erreur lors de la réception du BDC:', error);
      toast.error(`Erreur lors de la réception: ${error.message}`);
    }
  };

  // Statistiques des BDC
  const totalBdcs = bdcs.reduce((sum, bdc) => sum + bdc.montantHt, 0);
  const bdcsReceptionnes = bdcs.filter(bdc => bdc.dateReception || bdc.statut === 'RECEPTIONNE');
  const totalReceptionnes = bdcsReceptionnes.reduce((sum, bdc) => sum + bdc.montantHt, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  // Rendu du composant
  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header optionnel */}
      {showHeader && (
        <div 
          className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 ${
            collapsible ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors' : ''
          }`}
          onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
              {bdcs.length} Total • {bdcsReceptionnes.length} Réceptionnés
            </span>
            <button
              onClick={handleCreateBdc}
              className="inline-flex items-center px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau BDC
            </button>
          </div>
        </div>
      )}
      
      {/* Ligne de statistiques supplémentaire pour harmoniser avec les factures */}
      {showHeader && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded">
                <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestion des commandes fournisseurs • {formatCurrency(totalBdcs)} total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
                {bdcs.length} Total • {bdcsReceptionnes.length} Réceptionnés
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      {(!collapsible || !collapsed) && (
        <div className="flex-1 p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Statistiques rapides */}
          {bdcs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total BDC</h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalBdcs)}</p>
                <p className="text-xs text-gray-500">{bdcs.length} bon(s)</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Réceptionnés</h4>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceptionnes)}</p>
                <p className="text-xs text-gray-500">{bdcsReceptionnes.length} bon(s)</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">En attente</h4>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalBdcs - totalReceptionnes)}</p>
                <p className="text-xs text-gray-500">{bdcs.length - bdcsReceptionnes.length} bon(s)</p>
              </div>
            </div>
          )}

          {/* Liste des BDC */}
          <BdcList
            bdcs={bdcs}
            loading={loading}
            onEdit={handleEditBdc}
            onDelete={handleDeleteBdc}
            onValidate={handleValidateBdc}
            onCancel={handleCancelBdc}
            onReceive={handleReceptionBdc}
            emptyMessage="Créez votre premier bon de commande pour cette affaire."
          />
        </div>
      )}

      {/* Modal de création/modification */}
      <BdcModal
        opened={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitBdc}
        editingBdc={editingBdc}
        categories={categories}
        fournisseurs={fournisseurs}
        submitting={submitting}
        title="Nouveau BDC"
      />
    </div>
  );
};

export default BdcSection; 