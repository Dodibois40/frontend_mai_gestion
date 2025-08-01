import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, FileText, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import PdfUploadFirebase from '../ui/PdfUploadFirebase';
import firebaseStorageService from '../../services/firebaseStorageService';
import bdcServiceFirebase from '../../services/bdcServiceFirebase';

/**
 * Composant de test pour la gestion des BDC avec Firebase Storage
 */
const AffaireBdcSectionFirebase = ({ affaireId = 'test-affaire-123', onUpdate }) => {
  // Données de test mockées
  const [bdcs, setBdcs] = useState([
    {
      id: 'bdc-test-1',
      numero: 'BDC-2025-001',
      montantHt: 1250.00,
      dateBdc: '2025-01-15',
      fournisseur: 'Fournisseur Test SA',
      statut: 'EN_ATTENTE',
      commentaire: 'Bon de commande de test pour démonstration Firebase',
      nomFichier: null,
      tailleFichier: null,
      dateUpload: null,
      firebaseDownloadUrl: null,
      firebaseStoragePath: null
    },
    {
      id: 'bdc-test-2',
      numero: 'BDC-2025-002',
      montantHt: 850.75,
      dateBdc: '2025-01-10',
      fournisseur: 'Entreprise Demo SARL',
      statut: 'VALIDE',
      commentaire: 'Deuxième BDC de test',
      nomFichier: null,
      tailleFichier: null,
      dateUpload: null,
      firebaseDownloadUrl: null,
      firebaseStoragePath: null
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBdc, setEditingBdc] = useState(null);

  // Fonctions de test
  const handleCreateBdc = () => {
    const newBdc = {
      id: `bdc-test-${Date.now()}`,
      numero: `BDC-2025-${String(bdcs.length + 1).padStart(3, '0')}`,
      montantHt: Math.round((Math.random() * 2000 + 500) * 100) / 100,
      dateBdc: new Date().toISOString().split('T')[0],
      fournisseur: 'Nouveau Fournisseur',
      statut: 'EN_ATTENTE',
      commentaire: 'Nouveau BDC créé pour test',
      nomFichier: null,
      tailleFichier: null,
      dateUpload: null,
      firebaseDownloadUrl: null,
      firebaseStoragePath: null
    };
    
    setBdcs([...bdcs, newBdc]);
    setShowForm(false);
    toast.success('Nouveau BDC créé avec succès !');
  };

  const handleDeleteBdc = (bdcId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce BDC ?')) {
      setBdcs(bdcs.filter(bdc => bdc.id !== bdcId));
      toast.success('BDC supprimé avec succès !');
    }
  };

  const handleEditBdc = (bdc) => {
    console.log('Modifier BDC:', bdc);
    // TODO: Implémenter la modification
  };

  // Valider un BDC
  const handleValidateBdc = async (bdcId) => {
    try {
      await bdcServiceFirebase.valider(bdcId);
      toast.success('BDC validé avec succès');
      
      // Mettre à jour l'état local
      setBdcs(prevBdcs => 
        prevBdcs.map(bdc => 
          bdc.id === bdcId 
            ? { ...bdc, statut: 'VALIDE' }
            : bdc
        )
      );
      
      if (onUpdate) {
        onUpdate();
      }
      
      // Émettre un événement global pour rafraîchir toute l'interface
      window.dispatchEvent(new CustomEvent('bdc_updated', { 
        detail: { action: 'validate', bdcId, affaireId: affaire.id } 
      }));
      window.dispatchEvent(new CustomEvent('affaire_updated', { 
        detail: { affaireId: affaire.id } 
      }));
      
    } catch (error) {
      console.error('Erreur lors de la validation du BDC:', error);
      toast.error('Erreur lors de la validation du BDC');
    }
  };

  // Annuler un BDC
  const handleCancelBdc = async (bdcId) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce BDC ?')) {
      try {
        await bdcServiceFirebase.annuler(bdcId);
        toast.success('BDC annulé avec succès');
        
        // Mettre à jour l'état local
        setBdcs(prevBdcs => 
          prevBdcs.map(bdc => 
            bdc.id === bdcId 
              ? { ...bdc, statut: 'ANNULE' }
              : bdc
          )
        );
        
        if (onUpdate) {
          onUpdate();
        }
        
        // Émettre un événement global
        window.dispatchEvent(new CustomEvent('bdc_updated', { 
          detail: { action: 'cancel', bdcId, affaireId: affaire.id } 
        }));
        window.dispatchEvent(new CustomEvent('affaire_updated', { 
          detail: { affaireId: affaire.id } 
        }));
        
      } catch (error) {
        console.error('Erreur lors de l\'annulation du BDC:', error);
        toast.error('Erreur lors de l\'annulation du BDC');
      }
    }
  };

  // Réceptionner un BDC
  const handleReceptionBdc = async (bdcId) => {
    try {
      await bdcServiceFirebase.receptionner(bdcId);
      toast.success('BDC réceptionné avec succès');
      
      // Mettre à jour l'état local
      setBdcs(prevBdcs => 
        prevBdcs.map(bdc => 
          bdc.id === bdcId 
            ? { ...bdc, statut: 'RECEPTIONNE', dateReception: new Date() }
            : bdc
        )
      );
      
      if (onUpdate) {
        onUpdate();
      }
      
      // Émettre un événement global
      window.dispatchEvent(new CustomEvent('bdc_updated', { 
        detail: { action: 'receive', bdcId, affaireId: affaire.id } 
      }));
      window.dispatchEvent(new CustomEvent('affaire_updated', { 
        detail: { affaireId: affaire.id } 
      }));
      
    } catch (error) {
      console.error('Erreur lors de la réception du BDC:', error);
      toast.error('Erreur lors de la réception du BDC');
    }
  };

  // Gestion de l'upload PDF Firebase
  const handlePdfUploadSuccess = async (bdcId, result) => {
    try {
      console.log('🔥 Upload success result:', result);
      console.log('🔥 BDC ID:', bdcId);
      
      // Mettre à jour le BDC avec les informations Firebase
      setBdcs(prevBdcs => {
        const updatedBdcs = prevBdcs.map(bdc => 
          bdc.id === bdcId 
            ? {
                ...bdc,
                nomFichier: result.fileName || result.nomFichier,
                tailleFichier: result.size || result.tailleFichier,
                dateUpload: result.uploadedAt || result.dateUpload || new Date().toISOString(),
                firebaseDownloadUrl: result.downloadURL || result.firebaseDownloadUrl,
                firebaseStoragePath: result.fullPath || result.firebaseStoragePath
              }
            : bdc
        );
        
        console.log('🔥 Updated BDCs:', updatedBdcs);
        return updatedBdcs;
      });
      
      toast.success('PDF uploadé avec succès sur Firebase !');
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Erreur après upload:', error);
    }
  };

  const handlePdfUploadError = (bdcId, error) => {
    console.error('Erreur upload PDF:', error);
    toast.error(`Erreur lors de l'upload: ${error.message}`);
  };

  const handlePdfDelete = async (bdcId) => {
    try {
      // Mettre à jour le BDC en supprimant les informations PDF
      setBdcs(prevBdcs => 
        prevBdcs.map(bdc => 
          bdc.id === bdcId 
            ? {
                ...bdc,
                nomFichier: null,
                tailleFichier: null,
                dateUpload: null,
                firebaseDownloadUrl: null,
                firebaseStoragePath: null
              }
            : bdc
        )
      );
      
      toast.success('PDF supprimé avec succès !');
    } catch (error) {
      console.error('Erreur suppression PDF:', error);
      toast.error('Erreur lors de la suppression du PDF');
    }
  };

  // Fonctions d'upload Firebase
  const uploadPdfFirebase = async (bdcId, file, onProgress) => {
    return await firebaseStorageService.uploadBdcPdf(
      bdcId,
      file,
      onProgress
    );
  };

  const deletePdfFirebase = async (bdcId, storagePath) => {
    if (storagePath) {
      await firebaseStorageService.deletePdf(storagePath);
    }
    await handlePdfDelete(bdcId);
  };

  const getPdfViewUrlFirebase = async (bdcId, downloadUrl) => {
    return downloadUrl;
  };

  // Formatage des montants
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  };

  // Formatage des dates
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Obtenir la couleur du statut
  const getStatutColor = (statut) => {
    const colors = {
      'EN_ATTENTE': 'yellow',
      'VALIDE': 'green',
      'REFUSE': 'red',
      'LIVRE': 'blue'
    };
    return colors[statut] || 'gray';
  };

  // Formater le statut
  const formatStatut = (statut) => {
    const labels = {
      'EN_ATTENTE': 'En attente',
      'VALIDE': 'Validé',
      'REFUSE': 'Refusé',
      'LIVRE': 'Livré'
    };
    return labels[statut] || statut;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* En-tête de section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Bons de Commande</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {bdcs.length} BDC • Firebase Storage
            </p>
          </div>
        </div>
        <button
          onClick={handleCreateBdc}
          className="inline-flex items-center px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau BDC
        </button>
      </div>

      {/* Debug info */}
      <div className="p-2 bg-yellow-50 border-b text-xs text-gray-600">
        🔍 Debug: {bdcs.length} BDCs - 
        PDFs: {bdcs.filter(bdc => bdc.nomFichier).length} avec fichiers
      </div>

      {/* Contenu de la section */}
      <div className="p-4">
        {bdcs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun bon de commande
            </h3>
            <p className="text-gray-500 mb-4">
              Commencez par créer votre premier bon de commande pour cette affaire.
            </p>
            <button
              onClick={handleCreateBdc}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un BDC
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bdcs.filter(bdc => bdc && bdc.id).map((bdc) => (
              <div key={bdc.id} className="border border-gray-200 rounded-lg p-6">
                {/* En-tête du BDC */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        BDC #{bdc.numero}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatutColor(bdc.statut)}-100 text-${getStatutColor(bdc.statut)}-800`}
                      >
                        {formatStatut(bdc.statut)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{formatMontant(bdc.montantHt)}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Créé le {formatDate(bdc.dateBdc)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Fournisseur:</span>
                        <span className="ml-1">{bdc.fournisseur}</span>
                      </div>
                    </div>

                    {bdc.commentaire && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{bdc.commentaire}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {/* Boutons selon le statut */}
                    {bdc.statut === 'EN_ATTENTE' && (
                      <>
                        <button
                          onClick={() => handleValidateBdc(bdc.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                          title="Valider le BDC"
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => handleCancelBdc(bdc.id)}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                          title="Annuler le BDC"
                        >
                          Annuler
                        </button>
                      </>
                    )}
                    
                    {bdc.statut === 'VALIDE' && !bdc.dateReception && (
                      <button
                        onClick={() => handleReceptionBdc(bdc.id)}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                        title="Réceptionner le BDC"
                      >
                        Réceptionner
                      </button>
                    )}
                    
                    {/* Boutons d'action généraux */}
                    <button
                      onClick={() => handleEditBdc(bdc)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBdc(bdc.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section PDF Firebase */}
                <div className="border-t pt-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">
                    Document PDF (Firebase Storage)
                  </h5>
                  
                  <PdfUploadFirebase
                    entityId={bdc.id}
                    entityType="bdc"
                    existingFile={
                      bdc && bdc.nomFichier ? {
                        nomFichier: bdc.nomFichier,
                        tailleFichier: bdc.tailleFichier,
                        dateUpload: bdc.dateUpload,
                        firebaseDownloadUrl: bdc.firebaseDownloadUrl,
                        firebaseStoragePath: bdc.firebaseStoragePath
                      } : null
                    }
                    uploadFunction={(entityId, file, onProgress) => uploadPdfFirebase(entityId, file, onProgress)}
                    deleteFunction={(entityId, storagePath) => deletePdfFirebase(entityId, storagePath)}
                    getViewUrlFunction={(entityId, downloadUrl) => getPdfViewUrlFirebase(entityId, downloadUrl)}
                    onUploadSuccess={(result) => handlePdfUploadSuccess(bdc.id, result)}
                    onUploadError={(error) => handlePdfUploadError(bdc.id, error)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AffaireBdcSectionFirebase; 