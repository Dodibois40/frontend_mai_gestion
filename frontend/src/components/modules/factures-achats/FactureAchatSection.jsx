import React, { useState, useEffect } from 'react';
import { Plus, Receipt, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import FactureAchatList from './FactureAchatList';
import FactureAchatModal from './FactureAchatModal';
import { getAchats, createAchat, updateAchat, deleteAchat, getCategoriesAchat, validerAchat, payerAchat } from '../../../services/achatService';
import { getBdcs } from '../../../services/achatService';
import { getFournisseursActifs } from '../../../services/fournisseurService';
import firebaseStorageService from '../../../services/firebaseStorageService';
import { Button } from '@/components/ui/button';

/**
 * Composant de section Factures d'achats réutilisable
 * Utilise les composants modulaires FactureAchatList et FactureAchatModal
 */
const FactureAchatSection = ({ 
  affaireId, 
  onUpdate, 
  title = "Factures d'Achats",
  subtitle = "Gestion des factures fournisseurs",
  showHeader = true,
  collapsible = false,
  className = ""
}) => {
  // États locaux
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingFacture, setEditingFacture] = useState(null);
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [bdcsDisponibles, setBdcsDisponibles] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState(null);

  // Charger les factures d'achats depuis la base de données
  const loadFactures = async () => {
    if (!affaireId) {
      console.warn('⚠️ [FACTURES] affaireId manquant');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [FACTURES] Chargement des factures pour affaireId:', affaireId);
      
      const response = await getAchats({ affaireId });
      console.log('📦 [FACTURES] Réponse API:', response);
      
      // Gérer différents formats de réponse
      let facturesList = [];
      if (response?.achats) {
        facturesList = response.achats;
      } else if (Array.isArray(response)) {
        facturesList = response;
      } else {
        console.warn('⚠️ [FACTURES] Format de réponse inattendu:', response);
        facturesList = [];
      }
      
      console.log('✅ [FACTURES] Factures chargées:', facturesList.length);
      setFactures(facturesList);
    } catch (error) {
      console.error('❌ [FACTURES] Erreur chargement factures:', error);
      setError('Erreur lors du chargement des factures');
      toast.error(`Erreur lors du chargement des factures: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Charger les catégories
  const loadCategories = async () => {
    try {
      console.log('🔄 [FACTURES] Chargement des catégories');
      const categoriesData = await getCategoriesAchat();
      console.log('📂 [FACTURES] Catégories chargées:', categoriesData);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('❌ [FACTURES] Erreur lors du chargement des catégories:', error);
    }
  };

  // Charger les fournisseurs actifs
  const loadFournisseurs = async () => {
    try {
      console.log('🔄 [FACTURES] Chargement des fournisseurs');
      const fournisseursData = await getFournisseursActifs();
      console.log('🏢 [FACTURES] Fournisseurs chargés:', fournisseursData);
      setFournisseurs(fournisseursData || []);
    } catch (error) {
      console.error('❌ [FACTURES] Erreur lors du chargement des fournisseurs:', error);
    }
  };

  // Charger les BDC disponibles pour l'affaire
  const loadBdcsDisponibles = async () => {
    try {
      console.log('🔄 [FACTURES] Chargement des BDC disponibles');
      const response = await getBdcs({ affaireId });
      
      let bdcsList = [];
      if (response?.bdc) {
        bdcsList = response.bdc;
      } else if (response?.bdcs) {
        bdcsList = response.bdcs;
      } else if (Array.isArray(response)) {
        bdcsList = response;
      }
      
      // Filtrer les BDC validés ou réceptionnés qui pourraient être facturés
      const bdcsUtilisables = bdcsList.filter(bdc => 
        bdc.statut === 'VALIDE' || bdc.statut === 'RECEPTIONNE' || bdc.dateReception
      );
      
      console.log('📋 [FACTURES] BDC disponibles:', bdcsUtilisables.length);
      setBdcsDisponibles(bdcsUtilisables);
    } catch (error) {
      console.error('❌ [FACTURES] Erreur lors du chargement des BDC:', error);
      setBdcsDisponibles([]);
    }
  };

  // Effet de chargement initial
  useEffect(() => {
    console.log('🔄 [FACTURES] Effet de chargement initial avec affaireId:', affaireId);
    loadFactures();
    loadCategories();
    loadFournisseurs();
    loadBdcsDisponibles();
  }, [affaireId]);

  // Ouvrir le modal de création
  const handleCreateFacture = () => {
    console.log('➕ [FACTURES] Ouverture du modal de création');
    console.log('➕ [FACTURES] showModal avant:', showModal);
    setEditingFacture(null);
    setShowModal(true);
    console.log('➕ [FACTURES] showModal après:', true);
  };

  // Créer ou modifier une facture
  const handleSubmitFacture = async (values) => {
    try {
      setSubmitting(true);
      console.log('📤 [FACTURES] Soumission facture, données reçues:', values);

      // Validation des données obligatoires
      const requiredFields = ['fournisseur', 'montantHt', 'montantTtc', 'dateFacture', 'categorieId'];
      const missingFields = requiredFields.filter(field => !values[field]);
      
      if (missingFields.length > 0) {
        toast.error(`Champs obligatoires manquants: ${missingFields.join(', ')}`);
        return;
      }

      if (editingFacture) {
        // Pour la modification, utiliser UpdateAchatDto (sans affaireId)
        const updateData = {
          montantHt: parseFloat(values.montantHt),
          montantTtc: parseFloat(values.montantTtc),
          dateFacture: values.dateFacture instanceof Date ? values.dateFacture : new Date(values.dateFacture),
          categorieId: values.categorieId,
          fournisseur: values.fournisseur,
          bdcId: values.bdcId || undefined,
          commentaire: values.commentaire || undefined
        };

        console.log('📤 [FACTURES] Données formatées pour modification:', updateData);
        console.log('📤 [FACTURES] Types des données:', {
          montantHt: typeof updateData.montantHt,
          montantTtc: typeof updateData.montantTtc,
          dateFacture: typeof updateData.dateFacture,
          categorieId: typeof updateData.categorieId,
          fournisseur: typeof updateData.fournisseur
        });

        const result = await updateAchat(editingFacture.id, updateData);
        toast.success('Facture d\'achat modifiée avec succès !');
        console.log('✅ [FACTURES] Facture modifiée:', result);
        
        // Émettre un événement pour rafraîchir les données financières
        window.dispatchEvent(new CustomEvent('achat_updated', { 
          detail: { affaireId, action: 'update', factureId: editingFacture.id } 
        }));
        
      } else {
        // Pour la création, utiliser CreateAchatDto (avec affaireId)
        const createData = {
          montantHt: parseFloat(values.montantHt),
          montantTtc: parseFloat(values.montantTtc),
          dateFacture: values.dateFacture instanceof Date ? values.dateFacture : new Date(values.dateFacture),
          affaireId: affaireId,
          categorieId: values.categorieId,
          fournisseur: values.fournisseur,
          bdcId: values.bdcId || undefined,
          commentaire: values.commentaire || undefined
        };

        console.log('📤 [FACTURES] Données formatées pour création:', createData);
        console.log('📤 [FACTURES] Types des données:', {
          montantHt: typeof createData.montantHt,
          montantTtc: typeof createData.montantTtc,
          dateFacture: typeof createData.dateFacture,
          affaireId: typeof createData.affaireId,
          categorieId: typeof createData.categorieId,
          fournisseur: typeof createData.fournisseur
        });

        const result = await createAchat(createData);
        toast.success('Facture d\'achat créée avec succès !');
        console.log('✅ [FACTURES] Facture créée:', result);
        
        // Émettre un événement pour rafraîchir les données financières
        window.dispatchEvent(new CustomEvent('achat_updated', { 
          detail: { affaireId, action: 'create', factureId: result.id } 
        }));
      }

      await loadFactures();
      handleCloseModal();
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('❌ [FACTURES] Erreur lors de la création/modification de la facture:', error);
      
      // Afficher un message d'erreur plus détaillé
      let errorMessage = 'Erreur lors de la sauvegarde de la facture';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFacture(null);
  };

  // Supprimer une facture
  const handleDeleteFacture = async (factureId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette facture d\'achat ?')) {
      return;
    }

    try {
      console.log('🗑️ [FACTURES] Suppression facture:', factureId);
      await deleteAchat(factureId);
      toast.success('Facture d\'achat supprimée avec succès !');
      await loadFactures();
      
      // Émettre un événement pour rafraîchir les données financières
      window.dispatchEvent(new CustomEvent('achat_updated', { 
        detail: { affaireId, action: 'delete', factureId } 
      }));
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('❌ [FACTURES] Erreur lors de la suppression de la facture:', error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  // Modifier une facture
  const handleEditFacture = (facture) => {
    console.log('✏️ [FACTURES] Modification facture:', facture);
    setEditingFacture(facture);
    setShowModal(true);
  };

  // Valider une facture
  const handleValidateFacture = async (factureId) => {
    try {
      console.log('✅ [FACTURES] Validation facture:', factureId);
      // Utiliser la méthode du service
      await validerAchat(factureId);
      toast.success('Facture d\'achat validée avec succès !');
      await loadFactures();
      
      // Émettre un événement pour rafraîchir les données financières
      window.dispatchEvent(new CustomEvent('achat_updated', { 
        detail: { affaireId, action: 'validate', factureId } 
      }));
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('❌ [FACTURES] Erreur lors de la validation de la facture:', error);
      toast.error(`Erreur lors de la validation: ${error.message}`);
    }
  };

  // Annuler une facture
  const handleCancelFacture = async (factureId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir marquer cette facture en litige ?')) {
      return;
    }

    try {
      console.log('❌ [FACTURES] Marquage en litige facture:', factureId);
      // Utiliser la mise à jour générale avec le bon statut d'énumération
      const factureData = { statut: 'LITIGE' }; // Utiliser LITIGE au lieu de ANNULEE
      await updateAchat(factureId, factureData);
      toast.success('Facture d\'achat marquée en litige !');
      await loadFactures();
      
      // Émettre un événement pour rafraîchir les données financières
      window.dispatchEvent(new CustomEvent('achat_updated', { 
        detail: { affaireId, action: 'cancel', factureId } 
      }));
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('❌ [FACTURES] Erreur lors du marquage en litige de la facture:', error);
      toast.error(`Erreur lors du marquage en litige: ${error.message}`);
    }
  };

  // Marquer comme payée
  const handlePayFacture = async (factureId) => {
    try {
      console.log('💰 [FACTURES] Paiement facture:', factureId);
      // Utiliser la méthode du service
      await payerAchat(factureId, new Date().toISOString());
      toast.success('Facture d\'achat marquée comme payée !');
      await loadFactures();
      
      // Émettre un événement pour rafraîchir les données financières
      window.dispatchEvent(new CustomEvent('achat_updated', { 
        detail: { affaireId, action: 'pay', factureId } 
      }));
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('❌ [FACTURES] Erreur lors du paiement de la facture:', error);
      toast.error(`Erreur lors du paiement: ${error.message}`);
    }
  };

  // Gestion de l'upload PDF Firebase
  const handlePdfUploadSuccess = async (factureId, result) => {
    try {
      console.log('🔥 [PDF] Upload success result:', result);
      
      // Si result est null (cas de suppression), on supprime les données PDF
      if (result === null) {
        const updateData = {
          nomFichier: null,
          tailleFichier: null,
          dateUpload: null,
          firebaseDownloadUrl: null,
          firebaseStoragePath: null
        };

        console.log('🗑️ [PDF] Suppression des données PDF:', updateData);
        
        await updateAchat(factureId, updateData);
        console.log('✅ [PDF] Facture mise à jour avec succès (suppression)');
         
        // Mettre à jour l'état local
        setFactures(prevFactures => 
          prevFactures.map(facture => 
            facture.id === factureId 
              ? { ...facture, ...updateData }
              : facture
          )
        );
        
        toast.success('PDF supprimé avec succès !');
        
        if (onUpdate) {
          onUpdate();
        }
        return;
      }
      
      // Mettre à jour la facture dans la base de données via achatService
      const updateData = {
        nomFichier: result.fileName || result.nomFichier,
        tailleFichier: parseInt(result.size || result.tailleFichier || 0), // S'assurer que c'est un entier
        dateUpload: result.uploadedAt || result.dateUpload || new Date().toISOString(),
        firebaseDownloadUrl: result.downloadURL || result.firebaseDownloadUrl,
        firebaseStoragePath: result.fullPath || result.firebaseStoragePath
      };

      console.log('📤 [PDF] Données de mise à jour PDF:', updateData);
      
      await updateAchat(factureId, updateData);
      console.log('✅ [PDF] Facture mise à jour avec succès');
       
       // Mettre à jour l'état local
      setFactures(prevFactures => 
        prevFactures.map(facture => 
          facture.id === factureId 
            ? { ...facture, ...updateData }
            : facture
        )
      );
      
      toast.success('PDF uploadé avec succès !');
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('❌ [PDF] Erreur après upload:', error);
      
      // Afficher un message d'erreur plus détaillé
      let errorMessage = 'Erreur lors de la mise à jour de la facture';
      if (error.response?.data?.message) {
        errorMessage = `Erreur: ${error.response.data.message}`;
      } else if (error.response?.data?.error) {
        errorMessage = `Erreur: ${error.response.data.error}`;
      } else if (error.message) {
        errorMessage = `Erreur: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  };

  const handlePdfUploadError = (factureId, error) => {
    console.error('Erreur upload PDF:', error);
    toast.error(`Erreur lors de l'upload: ${error.message}`);
  };

  // Fonctions Firebase pour l'upload des factures
  const uploadPdfFirebase = async (factureId, file, onProgress) => {
    // Trouver la facture pour récupérer son numéro
    const facture = factures.find(f => f.id === factureId);
    const factureNumero = facture?.numeroFacture;
    
    return await firebaseStorageService.uploadFacturePdf(factureId, file, onProgress, factureNumero);
  };

  const deletePdfFirebase = async (factureId, storagePath) => {
    if (storagePath) {
      await firebaseStorageService.deletePdf(storagePath);
    }
    // Ne pas appeler directement la suppression ici car handlePdfUploadSuccess gère déjà le cas result === null
  };

  const getPdfViewUrlFirebase = async (factureId, downloadUrl) => {
    return downloadUrl;
  };

  // Statistiques des factures
  const totalFactures = factures.reduce((sum, facture) => sum + (facture.montantTtc || 0), 0);
  const facturesPayees = factures.filter(facture => facture.datePaiement || facture.statut === 'PAYE');
  const totalPayees = facturesPayees.reduce((sum, facture) => sum + (facture.montantTtc || 0), 0);

  const formatMontant = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  // Rendu du composant
  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* En-tête principal centré - À l'extérieur de l'encadré */}
      {showHeader && (
        <div className="text-center py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
              <Receipt className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Factures d'Achats</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Suivi des factures et paiements</p>
        </div>
      )}

      {/* Contenu principal */}
      <div className={`flex-1 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto ${
        collapsed ? 'hidden' : ''
      }`}>
        {/* Bouton d'action et statistiques rapides */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {factures.length} facture(s) • {formatMontant(totalFactures)} total
          </div>
          <div className="flex-shrink-0">
            <Button 
              onClick={handleCreateFacture}
              className="bg-secondary-600 hover:bg-secondary-700 text-white"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Facture
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Statistiques rapides améliorées */}
        {factures.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div 
              style={{
                backgroundColor: '#f5f0e8',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e8dcc0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div>
                <h4 className="text-sm font-medium" style={{ color: '#000000' }}>Total Factures</h4>
                <p className="text-2xl font-bold" style={{ color: '#000000' }}>{formatMontant(totalFactures)}</p>
                <p className="text-xs" style={{ color: '#333333' }}>{factures.length} facture(s)</p>
              </div>
            </div>
            
            <div 
              style={{
                backgroundColor: '#f0f4e8',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #d9e2c4',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div>
                <h4 className="text-sm font-medium" style={{ color: '#000000' }}>Payées</h4>
                <p className="text-2xl font-bold" style={{ color: '#000000' }}>{formatMontant(totalPayees)}</p>
                <p className="text-xs" style={{ color: '#333333' }}>{facturesPayees.length} payée(s)</p>
              </div>
            </div>
            
            <div 
              style={{
                backgroundColor: '#faf6f0',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #f0e6d2',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div>
                <h4 className="text-sm font-medium" style={{ color: '#000000' }}>En attente</h4>
                <p className="text-2xl font-bold" style={{ color: '#000000' }}>{formatMontant(totalFactures - totalPayees)}</p>
                <p className="text-xs" style={{ color: '#333333' }}>{factures.length - facturesPayees.length} en attente</p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des factures */}
        <FactureAchatList
          factures={factures}
          loading={loading}
          onEdit={handleEditFacture}
          onDelete={handleDeleteFacture}
          onValidate={handleValidateFacture}
          onCancel={handleCancelFacture}
          onPay={handlePayFacture}
          emptyMessage="Créez votre première facture d'achat pour cette affaire."
          uploadPdfFirebase={uploadPdfFirebase}
          deletePdfFirebase={deletePdfFirebase}
          getPdfViewUrlFirebase={getPdfViewUrlFirebase}
          onPdfUploadSuccess={handlePdfUploadSuccess}
          onPdfUploadError={handlePdfUploadError}
        />
      </div>

      {/* Modal de création/modification */}
      <FactureAchatModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitFacture}
        editingFacture={editingFacture}
        categories={categories}
        fournisseurs={fournisseurs}
        bdcsDisponibles={bdcsDisponibles}
        submitting={submitting}
        uploadPdfFirebase={uploadPdfFirebase}
        deletePdfFirebase={deletePdfFirebase}
        getPdfViewUrlFirebase={getPdfViewUrlFirebase}
        onPdfUploadSuccess={handlePdfUploadSuccess}
        onPdfUploadError={handlePdfUploadError}
      />
    </div>
  );
};

export default FactureAchatSection; 