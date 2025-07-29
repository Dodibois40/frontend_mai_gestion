import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, FileText, Calendar, DollarSign, Check, X, Clock, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, TextInput, NumberInput, Select, Textarea, Button, Group, Stack, Divider } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import PdfUploadFirebase from '../../ui/PdfUploadFirebase';
import PdfViewer from '../../ui/PdfViewer';
import firebaseStorageService from '../../../services/firebaseStorageService';
import { createBdc, getBdcs, updateBdc, deleteBdc, getCategoriesAchat, validerBdc, annulerBdc, receptionnerBdc } from '../../../services/achatService';
import { getFournisseursActifs } from '../../../services/fournisseurService';
import { findCategorieAchatForFournisseur } from '../../../utils/fournisseurCategories';
import { getDeliveryDateStyle, formatDisplayDate } from '../../../utils/dateHelpers';

/**
 * Composant de base pour la gestion des BDC - Version réutilisable
 * Ce composant contient toute la logique métier des BDC
 */
const BdcCore = ({ 
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
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState(null);

  // Formulaire pour les BDC
  const form = useForm({
    initialValues: {
      fournisseur: '',
      montantHt: 0,
      dateBdc: new Date(),
      dateLivraison: null,
      categorieId: '',
      commentaire: ''
    },
    validate: {
      fournisseur: (value) => !value ? 'Le fournisseur est obligatoire' : null,
      montantHt: (value) => value && value < 0 ? 'Le montant ne peut pas être négatif' : null, // ✅ Rendu optionnel
      categorieId: (value) => !value ? 'La catégorie est obligatoire' : null
    }
  });

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
    form.reset();
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
    form.reset();
  };

  // Supprimer un BDC
  const handleDeleteBdc = async (bdcId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce BDC ?')) {
      return;
    }

    try {
      console.log('🗑️ [BDC] Suppression BDC:', bdcId);
      await deleteBdc(bdcId);
      toast.success('BDC supprimé avec succès !');
      await loadBdcs();
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('❌ [BDC] Erreur lors de la suppression du BDC:', error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  // Modifier un BDC
  const handleEditBdc = (bdc) => {
    console.log('✏️ [BDC] Modification BDC:', bdc);
    setEditingBdc(bdc);
    form.setValues({
      fournisseur: bdc.fournisseur || '',
      montantHt: bdc.montantHt || 0,
      dateBdc: bdc.dateBdc ? new Date(bdc.dateBdc) : new Date(),
      dateLivraison: bdc.dateLivraison ? new Date(bdc.dateLivraison) : null,
      categorieId: bdc.categorieId || '',
      commentaire: bdc.commentaire || ''
    });
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
              {bdcs.length} Total
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

      {/* Contenu principal */}
      {(!collapsible || !collapsed) && (
        <div className="flex-1 p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement des BDCs...</p>
            </div>
          ) : bdcs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun BDC</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Créez votre premier bon de commande pour cette affaire.
              </p>
              <button
                onClick={handleCreateBdc}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un BDC
              </button>
            </div>
          ) : (
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
                    <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getStatutColor(bdc.statut)}-100 text-${getStatutColor(bdc.statut)}-800`}>
                      {formatStatut(bdc.statut)}
                    </span>
                  </div>

                  {/* Informations principales */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
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
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDisplayDate(bdc.dateLivraison)}</p>
                    </div>
                  )}

                  {/* Commentaire si présent */}
                  {bdc.commentaire && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{bdc.commentaire}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      {/* Actions selon le statut */}
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
                    </div>
                    
                    <div className="flex items-center gap-2">
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
                  <div className="border-t pt-4 mt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">
                      Document PDF (Firebase Storage)
                    </h5>
                    
                    <PdfUploadFirebase
                      entityId={bdc.id}
                      entityType="bdc"
                      existingFile={
                        bdc.nomFichier ? {
                          nomFichier: bdc.nomFichier,
                          tailleFichier: bdc.tailleFichier,
                          dateUpload: bdc.dateUpload,
                          firebaseDownloadUrl: bdc.firebaseDownloadUrl,
                          firebaseStoragePath: bdc.firebaseStoragePath
                        } : null
                      }
                      onUploadSuccess={(result) => {
                        // Mettre à jour la liste des BDCs
                        loadBdcs();
                      }}
                      onUploadError={(error) => {
                        toast.error(`Erreur upload PDF: ${error.message}`);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de création/modification de BDC */}
      <Modal
        opened={showModal}
        onClose={handleCloseModal}
        title={editingBdc ? "Modifier le BDC" : "Nouveau BDC"}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmitBdc)}>
          <Stack spacing="md">
            <Select
              label="Fournisseur"
              placeholder="Sélectionner un fournisseur"
              required
              searchable
              clearable
              data={fournisseurs?.map(fournisseur => ({ 
                value: fournisseur.nom, 
                label: fournisseur.nom,
                description: [
                  fournisseur.categorie ? `Catégorie: ${fournisseur.categorie}` : null,
                  fournisseur.contact ? `Contact: ${fournisseur.contact}` : null
                ].filter(Boolean).join(' • ')
              })) || []}
              {...form.getInputProps('fournisseur')}
              onChange={(value) => {
                form.setFieldValue('fournisseur', value);
                
                // Auto-sélection de la catégorie basée sur le fournisseur
                if (value && fournisseurs && categories) {
                  const fournisseurSelectionne = fournisseurs.find(f => f.nom === value);
                  if (fournisseurSelectionne) {
                    const categorieId = findCategorieAchatForFournisseur(fournisseurSelectionne, categories);
                    if (categorieId) {
                      form.setFieldValue('categorieId', categorieId);
                      toast.success(`Catégorie automatiquement sélectionnée : ${fournisseurSelectionne.categorie}`);
                    }
                  }
                }
              }}
            />

            <NumberInput
              label="Montant HT (€)"
              placeholder="0.00"
              precision={2}
              min={0}
              required
              {...form.getInputProps('montantHt')}
            />

            <DateInput
              label="Date du BDC"
              placeholder="Sélectionner une date"
              required
              {...form.getInputProps('dateBdc')}
            />

            <DateInput
              label="Date de livraison prévue"
              placeholder="Sélectionner la date de livraison"
              description="📅 Date à laquelle vous souhaitez recevoir la commande"
              minDate={new Date()}
              {...form.getInputProps('dateLivraison')}
            />

            <Select
              label="Catégorie"
              placeholder="Sélectionner une catégorie"
              required
              data={categories?.map(cat => ({ 
                value: cat.id.toString(), 
                label: cat.intitule || cat.nom || `Catégorie ${cat.id}` 
              })) || []}
              {...form.getInputProps('categorieId')}
            />

            <Textarea
              label="Commentaire"
              placeholder="Commentaire sur le BDC..."
              rows={3}
              {...form.getInputProps('commentaire')}
            />

            <Divider />

            <Group position="right">
              <Button variant="outline" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button type="submit" loading={submitting}>
                {editingBdc ? 'Modifier' : 'Créer'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Aperçu PDF */}
      {selectedPdf && (
        <PdfViewer
          url={selectedPdf.url}
          filename={selectedPdf.filename}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </div>
  );
};

export default BdcCore; 