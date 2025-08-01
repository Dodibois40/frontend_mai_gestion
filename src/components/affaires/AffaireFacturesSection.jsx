import React, { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Stack,
  Text,
  Badge,
  Group,
  Button,
  Alert,
  ActionIcon,
  Modal,
  TextInput,
  Select,
  Textarea,
  NumberInput,
  Divider
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import {
  IconFileInvoice,
  IconPlus,
  IconPencil,
  IconTrash,
  IconChevronDown,
  IconChevronUp,
  IconReceipt,
  IconEdit
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { createAchat, getAchats, updateAchat, deleteAchat, getBdcs } from '@/services/achatService';

const AffaireFacturesSection = ({ affaire, categoriesAchat, onDataChanged }) => {
  const [achats, setAchats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAchat, setEditingAchat] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bdcsDisponibles, setBdcsDisponibles] = useState([]);

  // Debug des catégories
  console.log('🔍 [AffaireFacturesSection] Catégories reçues:', categoriesAchat);

  // Formulaire pour les achats
  const form = useForm({
    initialValues: {
      fournisseur: '',
      montantHt: 0,
      montantTtc: 0,
      dateFacture: new Date(),
      categorieId: '',
      bdcId: '',
      description: ''
    },
    validate: {
      fournisseur: (value) => !value ? 'Le fournisseur est obligatoire' : null,
      montantHt: (value) => !value || value <= 0 ? 'Le montant HT doit être supérieur à 0' : null,
      montantTtc: (value) => !value || value <= 0 ? 'Le montant TTC doit être supérieur à 0' : null,
      dateFacture: (value) => !value ? 'La date de facture est obligatoire' : null,
      categorieId: (value) => !value ? 'La catégorie est obligatoire' : null
    }
  });

  // Chargement des achats
  const loadAchats = async () => {
    try {
      setLoading(true);
      const response = await getAchats({ affaireId: affaire.id });
      
      // S'assurer que la réponse est un tableau
      if (Array.isArray(response)) {
        setAchats(response);
      } else if (response && Array.isArray(response.achats)) {
        setAchats(response.achats);
      } else {
        console.warn('Format de réponse achats inattendu:', response);
        setAchats([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des achats:', error);
      setAchats([]);
    } finally {
      setLoading(false);
    }
  };

  // Chargement des BDC disponibles pour l'affaire
  const loadBdcsDisponibles = async () => {
    try {
      const response = await getBdcs({ affaireId: affaire.id });
      
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
      
      setBdcsDisponibles(bdcsUtilisables);
    } catch (error) {
      console.error('Erreur lors du chargement des BDC:', error);
      setBdcsDisponibles([]);
    }
  };

  // Effet de chargement initial
  useEffect(() => {
    if (affaire?.id) {
      loadAchats();
      loadBdcsDisponibles();
    }
  }, [affaire?.id]);

  // Création/modification d'un achat
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      const achatData = {
        montantHt: parseFloat(values.montantHt),
        montantTtc: parseFloat(values.montantTtc) || Math.round(parseFloat(values.montantHt) * 1.2 * 100) / 100,
        dateFacture: values.dateFacture, // Envoyer l'objet Date directement
        affaireId: affaire.id,
        categorieId: values.categorieId,
        fournisseur: values.fournisseur,
        bdcId: values.bdcId || null,
        commentaire: values.description || values.commentaire || ''
      };

      if (editingAchat) {
        await updateAchat(editingAchat.id, achatData);
        toast.success('Achat modifié avec succès');
      } else {
        await createAchat(achatData);
        toast.success('Achat créé avec succès');
      }

      await loadAchats();
      handleCloseModal();
      
      if (onDataChanged) {
        onDataChanged();
      }
    } catch (error) {
      console.error('Erreur lors de la création/modification de l\'achat:', error);
      toast.error('Erreur lors de l\'opération');
    } finally {
      setSubmitting(false);
    }
  };

  // Édition d'un achat
  const handleEdit = (achat) => {
    setEditingAchat(achat);
    form.setValues({
      fournisseur: achat.fournisseur,
      montantHt: achat.montantHt,
      montantTtc: achat.montantTtc || Math.round(achat.montantHt * 1.2 * 100) / 100,
      dateFacture: new Date(achat.dateFacture),
      categorieId: achat.categorieId,
      bdcId: achat.bdcId || '',
      description: achat.commentaire || achat.description || ''
    });
    setShowModal(true);
  };

  // Suppression d'un achat
  const handleDelete = async (achatId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet achat ?')) {
      return;
    }

    try {
      await deleteAchat(achatId);
      toast.success('Achat supprimé avec succès');
      await loadAchats();
      
      if (onDataChanged) {
        onDataChanged();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Fermeture du modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAchat(null);
    form.reset();
  };

  // Formatage de la devise
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  // Formatage de la date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  // Fonction pour obtenir le badge du statut BDC
  const getBdcStatusBadge = (bdc) => {
    if (!bdc) return null;
    
    const statusConfig = {
      'EN_ATTENTE': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', text: 'BDC En attente' },
      'VALIDE': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', text: 'BDC Validé' },
      'RECEPTIONNE': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', text: 'BDC Réceptionné' },
      'ANNULE': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', text: 'BDC Annulé' }
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
      <Card withBorder>
        <Text ta="center" p="md">Chargement des factures d'achats...</Text>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* En-tête supprimé pour éviter la duplication - Contrôles déplacés en haut */}
      <div className="p-4">
        {/* Informations et contrôles en haut */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {achats.length} factures • {formatCurrency(achats.reduce((sum, a) => sum + (a.montantHt || 0), 0))} HT
            {achats.filter(a => a.bdc).length > 0 && (
              <span className="ml-2 text-xs">({achats.filter(a => a.bdc).length} liées à des BDC)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                FACTURES
            </span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
              {formatCurrency(achats.reduce((sum, a) => sum + (a.montantHt || 0), 0))} HT
            </span>
            <button 
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <IconChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <IconChevronUp className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Contenu avec hauteur adaptative */}
        <div className={`transition-all duration-300 ${collapsed ? 'h-0 overflow-hidden' : 'overflow-y-auto flex-1'}`}>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
            {/* Bouton Nouvelle Facture */}
              <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                <IconPlus className="w-4 h-4" />
                Nouvelle Facture
              </button>

              {/* Liste des Factures */}
              {achats.length === 0 ? (
                <div className="text-center py-8">
                  <IconReceipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune facture</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Créez votre première facture d'achat pour cette affaire.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {achats.map((achat) => (
                    <div key={achat.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              Facture #{achat.numeroFacture}
                            </span>
                            {getBdcStatusBadge(achat.bdc)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <div>Fournisseur: {achat.fournisseur}</div>
                            <div>Montant: {formatCurrency(achat.montantHt)} HT</div>
                            <div>Date: {formatDate(achat.dateFacture)}</div>
                            {achat.bdc && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs">BDC: {achat.bdc.numero}</span>
                                <span className="text-xs text-gray-500">
                                  ({formatCurrency(achat.bdc.montantHt)} HT)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(achat)}
                            className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                            title="Modifier"
                          >
                            <IconEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(achat.id)}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            title="Supprimer"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal pour créer/modifier une facture */}
      <Modal
        opened={showModal}
        onClose={handleCloseModal}
        title={editingAchat ? "Modifier la facture" : "Nouvelle facture"}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <TextInput
              label="Fournisseur"
              placeholder="Nom du fournisseur"
              required
              {...form.getInputProps('fournisseur')}
            />

            <Group grow>
            <NumberInput
                label="Montant HT (€)"
                placeholder="0.00"
                precision={2}
                min={0}
              required
              {...form.getInputProps('montantHt')}
              onChange={(value) => {
                form.setFieldValue('montantHt', value);
                // Calcul automatique du TTC (TVA 20%)
                if (value) {
                  form.setFieldValue('montantTtc', Math.round(value * 1.2 * 100) / 100);
                }
              }}
            />

            <NumberInput
                label="Montant TTC (€)"
                placeholder="0.00"
                precision={2}
                min={0}
              required
              {...form.getInputProps('montantTtc')}
            />
            </Group>

            <DateInput
              label="Date de facture"
              placeholder="Sélectionner une date"
              required
              {...form.getInputProps('dateFacture')}
            />

            <Select
              label="Catégorie"
              placeholder="Sélectionner une catégorie"
              required
              data={categoriesAchat?.map(cat => ({ 
                value: cat.id.toString(), 
                label: cat.nom || cat.intitule || cat.libelle || `Catégorie ${cat.id}` 
              })) || []}
              {...form.getInputProps('categorieId')}
            />

            <Select
              label="Bon de commande (optionnel)"
              placeholder="Associer à un BDC existant"
              clearable
              data={bdcsDisponibles?.map(bdc => ({ 
                value: bdc.id, 
                label: `${bdc.numero} - ${bdc.fournisseur} (${formatCurrency(bdc.montantHt)} HT)`
              })) || []}
              {...form.getInputProps('bdcId')}
              description="Vous pouvez associer cette facture à un bon de commande existant"
            />

            <Textarea
              label="Description / Commentaire"
              placeholder="Description de l'achat..."
              rows={3}
              {...form.getInputProps('description')}
            />

            <Divider />

            <Group position="right">
              <Button variant="outline" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button type="submit" loading={submitting}>
                {editingAchat ? 'Modifier' : 'Créer'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
};

export default AffaireFacturesSection; 