import React, { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Table,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  LoadingOverlay,
  Alert,
  Grid,
  Divider,
  Tooltip
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { 
  IconPlus, 
  IconPencil, 
  IconTrash, 
  IconCheck, 
  IconX,
  IconFileText,
  IconInfoCircle,
  IconAlertCircle,
  IconEye,
  IconDownload
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { createBdc, getBdcs, updateBdc, deleteBdc, receptionnerBdc, validerBdc, annulerBdc, getCategoriesAchat, downloadBdcPdf } from '@/services/achatService';
import { getFournisseursActifs } from '@/services/fournisseurService';
import { findCategorieAchatForFournisseur } from '@/utils/fournisseurCategories';
import { getDeliveryDateStyle, formatDisplayDate } from '@/utils/dateHelpers';
import { PasswordModal } from '../ui/password-modal';

const AffaireBdc = ({ affaireId, onBdcChanged }) => {
  console.log('🚨 [COMPOSANT ACTIF] AffaireBdc.jsx est utilisé avec affaireId:', affaireId);
  
  const [bdcs, setBdcs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBdc, setEditingBdc] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [bdcToDelete, setBdcToDelete] = useState(null);
  const [deletingBdc, setDeletingBdc] = useState(false);

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
      montantHt: (value) => !value || value <= 0 ? 'Le montant HT doit être supérieur à 0' : null,
      categorieId: (value) => !value ? 'La catégorie est obligatoire' : null
    }
  });

  useEffect(() => {
    Promise.all([
      fetchBdcs(),
      fetchCategories(),
      fetchFournisseurs()
    ]);
  }, [affaireId]);

  const fetchBdcs = async () => {
    try {
      setLoading(true);
      const response = await getBdcs({ affaireId });
      
      // Gérer différents formats de réponse
      let bdcsList = [];
      if (response?.bdc) {
        bdcsList = response.bdc;
      } else if (response?.bdcs) {
        bdcsList = response.bdcs;
      } else if (Array.isArray(response)) {
        bdcsList = response;
      }
      
      setBdcs(bdcsList);
    } catch (error) {
      console.error('Erreur lors du chargement des BDC:', error);
      toast.error('Erreur lors du chargement des bons de commande');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategoriesAchat();
      setCategories(response || []);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const response = await getFournisseursActifs();
      setFournisseurs(response || []);
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
    }
  };

  const handleCreateBdc = async (values) => {
    try {
      setSubmitting(true);
      
      const payload = {
        montantHt: parseFloat(values.montantHt),
        dateBdc: values.dateBdc,
        affaireId: affaireId,
        categorieId: values.categorieId,
        fournisseur: values.fournisseur,
        commentaire: values.commentaire || ''
      };

      if (editingBdc) {
        await updateBdc(editingBdc.id, payload);
        toast.success('Bon de commande modifié avec succès');
      } else {
        await createBdc(payload);
        toast.success('Bon de commande créé avec succès');
      }

      fetchBdcs();
      
      if (onBdcChanged) {
        onBdcChanged();
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la création/modification du BDC:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBdc = (bdc) => {
    setEditingBdc(bdc);
    form.setValues({
      fournisseur: bdc.fournisseur,
      montantHt: bdc.montantHt,
      dateBdc: new Date(bdc.dateBdc),
      dateLivraison: bdc.dateLivraison ? new Date(bdc.dateLivraison) : null,
      categorieId: bdc.categorieId,
      commentaire: bdc.commentaire || ''
    });
    setShowModal(true);
  };

  const handleDeleteBdc = async (bdcId) => {
    const bdc = bdcs.find(b => b.id === bdcId);
    
    // Si le BDC est validé, demander le mot de passe
    if (bdc && bdc.statut === 'VALIDE') {
      setBdcToDelete(bdcId);
      setShowPasswordModal(true);
    } else {
      // Suppression normale pour les BDC non validés
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bon de commande ?')) {
        await performDelete(bdcId);
      }
    }
  };

  const performDelete = async (bdcId, password = null) => {
    try {
      setDeletingBdc(true);
      await deleteBdc(bdcId, password);
      toast.success('Bon de commande supprimé avec succès');
      fetchBdcs();
      
      if (onBdcChanged) {
        onBdcChanged();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      
      if (error.response?.status === 400) {
        toast.error('Un mot de passe est requis pour supprimer un BDC validé');
      } else if (error.response?.status === 401) {
        toast.error('Mot de passe incorrect');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } finally {
      setDeletingBdc(false);
      setShowPasswordModal(false);
      setBdcToDelete(null);
    }
  };

  const handlePasswordConfirm = (password) => {
    if (bdcToDelete) {
      performDelete(bdcToDelete, password);
    }
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setBdcToDelete(null);
  };

  const handleReceptionBdc = async (bdcId) => {
    try {
      await receptionnerBdc(bdcId, new Date());
      toast.success('Bon de commande réceptionné');
      fetchBdcs();
      
      if (onBdcChanged) {
        onBdcChanged();
      }
    } catch (error) {
      console.error('Erreur lors de la réception:', error);
      toast.error('Erreur lors de la réception');
    }
  };

  // Valider un BDC
  const handleValidateBdc = async (bdcId) => {
    try {
      await validerBdc(bdcId);
      toast.success('Bon de commande validé');
      fetchBdcs();
      
      if (onBdcChanged) {
        onBdcChanged();
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      toast.error('Erreur lors de la validation');
    }
  };

  // Annuler un BDC
  const handleCancelBdc = async (bdcId) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce bon de commande ?')) {
      try {
        await annulerBdc(bdcId);
        toast.success('Bon de commande annulé');
        fetchBdcs();
        
        if (onBdcChanged) {
          onBdcChanged();
        }
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
        toast.error('Erreur lors de l\'annulation');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBdc(null);
    form.reset();
  };

  const handleDownloadPdf = async (bdc) => {
    try {
      // Si le BDC a une URL Firebase, télécharger depuis Firebase avec le bon nom
      if (bdc.firebaseDownloadUrl) {
        const response = await fetch(bdc.firebaseDownloadUrl);
        if (!response.ok) {
          throw new Error('Erreur lors du téléchargement depuis Firebase');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Utiliser le nomFichier ou le numéro BDC comme nom
        const fileName = bdc.nomFichier || `${bdc.numero}.pdf`;
        link.setAttribute('download', fileName);
        
        document.body.appendChild(link);
        link.click();
        
        // Nettoyer
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        toast.success(`PDF ${fileName} téléchargé avec succès`);
      } else {
        // Sinon, utiliser le téléchargement backend standard
        await downloadBdcPdf(bdc.id);
        toast.success(`PDF du BDC ${bdc.numero} téléchargé avec succès`);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      toast.error('Erreur lors du téléchargement du PDF');
    }
  };

  const getStatusColor = (bdc) => {
    // Priorité : dateReception > statut
    if (bdc.dateReception) return 'green';
    
    const statusColors = {
      'EN_ATTENTE': 'orange',
      'VALIDE': 'blue',
      'RECEPTIONNE': 'green',
      'ANNULE': 'red'
    };
    return statusColors[bdc.statut] || 'orange';
  };

  const getStatusLabel = (bdc) => {
    // Priorité : dateReception > statut
    if (bdc.dateReception) return 'Réceptionné';
    
    const statusLabels = {
      'EN_ATTENTE': 'En attente',
      'VALIDE': 'Validé',
      'RECEPTIONNE': 'Réceptionné',
      'ANNULE': 'Annulé'
    };
    return statusLabels[bdc.statut] || 'En attente';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const totalBdcs = bdcs.reduce((sum, bdc) => sum + bdc.montantHt, 0);
  const bdcsReceptionnes = bdcs.filter(bdc => bdc.dateReception || bdc.statut === 'RECEPTIONNE');
  const totalBdcsReceptionnes = bdcsReceptionnes.reduce((sum, bdc) => sum + bdc.montantHt, 0);

  const selectedCategorie = categories.find(cat => cat.id === form.values.categorieId);
  const montantFg = selectedCategorie && form.values.montantHt 
    ? (form.values.montantHt * selectedCategorie.pourcentageFg / 100)
    : 0;

  return (
    <>
      <Card>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={4}>Bons de commande</Title>
            <Button 
              leftSection={<IconPlus size={16} />}
              onClick={() => setShowModal(true)}
            >
              Nouveau BDC
            </Button>
          </Group>

          <Alert icon={<IconInfoCircle size={16} />} color="blue">
            Bons de commande pour cette affaire : commandes auprès des fournisseurs.
          </Alert>

          {/* Statistiques */}
          <Grid>
            <Grid.Col span={4}>
              <Card withBorder>
                <Text size="sm" c="dimmed">Total BDC</Text>
                <Text size="xl" fw={700}>{formatCurrency(totalBdcs)}</Text>
                <Text size="xs" c="dimmed">{bdcs.length} bon(s)</Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={4}>
              <Card withBorder>
                <Text size="sm" c="dimmed">BDC réceptionnés</Text>
                <Text size="xl" fw={700} c="green">{formatCurrency(totalBdcsReceptionnes)}</Text>
                <Text size="xs" c="dimmed">{bdcsReceptionnes.length} bon(s)</Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={4}>
              <Card withBorder>
                <Text size="sm" c="dimmed">En attente</Text>
                <Text size="xl" fw={700} c="orange">
                  {formatCurrency(totalBdcs - totalBdcsReceptionnes)}
                </Text>
                <Text size="xs" c="dimmed">{bdcs.length - bdcsReceptionnes.length} bon(s)</Text>
              </Card>
            </Grid.Col>
          </Grid>

          <LoadingOverlay visible={loading} />
          
          {bdcs.length === 0 && !loading ? (
            <Alert icon={<IconAlertCircle size={16} />} color="gray">
              Aucun bon de commande pour cette affaire.
            </Alert>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>N° BDC</Table.Th>
                  <Table.Th>Fournisseur</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Livraison</Table.Th>
                  <Table.Th>Catégorie</Table.Th>
                  <Table.Th>Montant HT</Table.Th>
                  <Table.Th>Statut</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {bdcs.map((bdc) => {
                  const categorie = categories.find(cat => cat.id === bdc.categorieId);
                  
                  // Debug du statut
                  console.log(`BDC ${bdc.numero}:`, { 
                    statut: bdc.statut, 
                    dateReception: bdc.dateReception,
                    statusType: typeof bdc.statut 
                  });
                  
                  return (
                    <Table.Tr key={bdc.id}>
                      <Table.Td>
                        <Text fw={500}>{bdc.numero}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text truncate style={{ maxWidth: '150px' }}>{bdc.fournisseur}</Text>
                      </Table.Td>
                      <Table.Td>{formatDate(bdc.dateBdc)}</Table.Td>
                      <Table.Td>
                        {bdc.dateLivraison ? (
                          <div className="flex flex-col gap-1">
                            <Text size="sm">{formatDisplayDate(bdc.dateLivraison)}</Text>
                            {(() => {
                              const style = getDeliveryDateStyle(bdc.dateLivraison);
                              return (
                                <span className={`px-1 py-0.5 text-xs font-bold rounded-full border ${style.badge} text-center`}>
                                  {style.text}
                                </span>
                              );
                            })()}
                          </div>
                        ) : (
                          <Text size="sm" c="dimmed">-</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="blue">
                          {categorie?.intitule || 'Non définie'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={500}>{formatCurrency(bdc.montantHt)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getStatusColor(bdc)}>
                          {getStatusLabel(bdc)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {/* Debug pour voir les valeurs */}
                          {console.log(`🔍 [BDC Actions] ${bdc.numero}:`, { 
                            statut: bdc.statut, 
                            statutType: typeof bdc.statut,
                            dateReception: bdc.dateReception,
                            condition1: bdc.statut === 'EN_ATTENTE',
                            condition2: !bdc.dateReception,
                            shouldShowButtons: (bdc.statut === 'EN_ATTENTE' || !bdc.dateReception)
                          })}
                          
                          {/* Actions selon le statut - FORCER L'AFFICHAGE TEMPORAIREMENT */}
                          {(!bdc.dateReception) && (
                            <>
                              <Tooltip label="Valider">
                                <ActionIcon
                                  size="sm"
                                  color="blue"
                                  variant="light"
                                  onClick={() => handleValidateBdc(bdc.id)}
                                >
                                  <IconCheck size={14} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Annuler">
                                <ActionIcon
                                  size="sm"
                                  color="red"
                                  variant="light"
                                  onClick={() => handleCancelBdc(bdc.id)}
                                >
                                  <IconX size={14} />
                                </ActionIcon>
                              </Tooltip>
                            </>
                          )}
                          
                          {bdc.statut === 'VALIDE' && !bdc.dateReception && (
                            <Tooltip label="Réceptionner">
                              <ActionIcon
                                size="sm"
                                color="green"
                                variant="light"
                                onClick={() => handleReceptionBdc(bdc.id)}
                              >
                                <IconCheck size={14} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          
                          <Tooltip label="Télécharger PDF">
                            <ActionIcon
                              size="sm"
                              color="green"
                              variant="light"
                              onClick={() => handleDownloadPdf(bdc)}
                            >
                              <IconDownload size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Modifier">
                            <ActionIcon
                              size="sm"
                              color="blue"
                              variant="light"
                              onClick={() => handleEditBdc(bdc)}
                            >
                              <IconPencil size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Supprimer">
                            <ActionIcon
                              size="sm"
                              color="red"
                              variant="light"
                              onClick={() => handleDeleteBdc(bdc.id)}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Card>

      {/* Modal de création/édition */}
      <Modal
        opened={showModal}
        onClose={handleCloseModal}
        title={
          <Group>
            <IconFileText size={20} />
            <Text fw={500}>
              {editingBdc ? 'Modifier le bon de commande' : 'Nouveau bon de commande'}
            </Text>
          </Group>
        }
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleCreateBdc)}>
          <Stack gap="md">
            <Alert icon={<IconInfoCircle size={16} />} color="blue">
              {editingBdc 
                ? 'Modifiez les informations du bon de commande.'
                : 'Le numéro de BDC sera généré automatiquement au format : BDC-YYYY-XXX'
              }
            </Alert>

            {editingBdc && (
              <div>
                <Text size="sm" fw={500} mb={4}>Numéro de BDC</Text>
                <div style={{
                  padding: 8,
                  backgroundColor: 'var(--mantine-color-gray-0)',
                  border: '1px solid var(--mantine-color-gray-3)',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  color: 'var(--mantine-color-gray-7)'
                }}>
                  {editingBdc.numero}
                </div>
              </div>
            )}

            <Grid>
              <Grid.Col span={6}>
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
                    console.log('🔄 [AFFAIRE-BDC] Changement de fournisseur:', value);
                    console.log('🔄 [AFFAIRE-BDC] Fournisseurs disponibles:', fournisseurs?.length || 0);
                    console.log('🔄 [AFFAIRE-BDC] Catégories disponibles:', categories?.length || 0);
                    
                    form.setFieldValue('fournisseur', value);
                    
                    // Auto-sélection de la catégorie basée sur le fournisseur
                    if (value && fournisseurs && categories) {
                      const fournisseurSelectionne = fournisseurs.find(f => f.nom === value);
                      console.log('🏢 [AFFAIRE-BDC] Fournisseur trouvé:', fournisseurSelectionne);
                      
                      if (fournisseurSelectionne) {
                        try {
                          const categorieId = findCategorieAchatForFournisseur(fournisseurSelectionne, categories);
                          console.log('🎯 [AFFAIRE-BDC] Catégorie ID trouvée:', categorieId);
                          
                                                      if (categorieId) {
                              form.setFieldValue('categorieId', categorieId);
                              toast.success(`Catégorie automatiquement sélectionnée : ${fournisseurSelectionne.categorie}`);
                              console.log('✅ [AFFAIRE-BDC] Catégorie auto-sélectionnée avec succès');
                            } else {
                              console.log('❌ [AFFAIRE-BDC] Aucune catégorie trouvée pour ce fournisseur');
                              toast.info(`Aucune catégorie automatique trouvée pour ${fournisseurSelectionne.nom}`);
                            }
                          } catch (error) {
                            console.error('❌ [AFFAIRE-BDC] Erreur lors de la recherche de catégorie:', error);
                          }
                        } else {
                          console.log('❌ [AFFAIRE-BDC] Fournisseur non trouvé dans la liste');
                        }
                      } else {
                        console.log('⚠️ [AFFAIRE-BDC] Données manquantes pour l\'auto-sélection');
                      }
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Catégorie d'achat"
                    placeholder="Sélectionner une catégorie"
                    required
                    data={categories.map(cat => ({
                      value: cat.id,
                      label: cat.intitule
                    }))}
                    {...form.getInputProps('categorieId')}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Montant HT"
                    placeholder="0.00"
                    required
                    min={0}
                    step={0.01}
                    decimalScale={2}
                    fixedDecimalScale
                    suffix=" €"
                    {...form.getInputProps('montantHt')}
                  />
                  {selectedCategorie && (
                    <Text size="xs" c="dimmed" mt={5}>
                      Frais généraux ({selectedCategorie.pourcentageFg}%) : {formatCurrency(montantFg)}
                    </Text>
                  )}
                </Grid.Col>
                <Grid.Col span={6}>
                  <DateInput
                    label="Date du BDC"
                    placeholder="Sélectionner la date"
                    required
                    {...form.getInputProps('dateBdc')}
                  />
                </Grid.Col>
              </Grid>

              <DateInput
                label="Date de livraison prévue"
                placeholder="Sélectionner la date de livraison"
                description="📅 Date à laquelle vous souhaitez recevoir la commande"
                minDate={new Date()} // Empêche de sélectionner une date passée
                styles={{
                  input: {
                    borderColor: form.values.dateLivraison && 
                      new Date(form.values.dateLivraison).toDateString() === new Date().toDateString() 
                      ? '#f59e0b' : undefined,
                    borderWidth: form.values.dateLivraison && 
                      new Date(form.values.dateLivraison).toDateString() === new Date().toDateString() 
                      ? '2px' : undefined,
                    backgroundColor: form.values.dateLivraison && 
                      new Date(form.values.dateLivraison).toDateString() === new Date().toDateString() 
                      ? '#fef3c7' : undefined
                  }
                }}
                {...form.getInputProps('dateLivraison')}
              />

              <Textarea
                label="Commentaire"
                placeholder="Commentaire optionnel"
                rows={3}
                {...form.getInputProps('commentaire')}
              />

              <Divider />

              <Group justify="flex-end">
                <Button variant="light" onClick={handleCloseModal}>
                  Annuler
                </Button>
                <Button type="submit" loading={submitting}>
                  {editingBdc ? 'Modifier' : 'Créer'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        {/* Modal de mot de passe */}
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={handlePasswordModalClose}
          onConfirm={handlePasswordConfirm}
          title="Suppression d'un BDC validé"
          message="Ce bon de commande est validé. Un mot de passe administrateur est requis pour le supprimer."
          loading={deletingBdc}
        />
      </>
    );
  };

  export default AffaireBdc;