import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Title, 
  Button, 
  Group, 
  Stack, 
  Text, 
  Badge, 
  Table, 
  ActionIcon, 
  Modal, 
  Grid, 
  Paper,
  Loader,
  Alert,
  TextInput,
  Select,
  NumberInput,
  Textarea,
  Divider,
  Switch,
  Pagination,
  Tooltip
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { 
  IconPlus, 
  IconPencil, 
  IconTrash, 
  IconFileInvoice,
  IconBuilding,
  IconCalendar,
  IconCurrencyEuro,
  IconFilter,
  IconDownload,
  IconEye,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconSearch,
  IconRefresh,
  IconDeviceFloppy,
  IconPhoto
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/affaires';
import { getAchats, createAchat, updateAchat, deleteAchat } from '@/services/achatService';
import { affairesService } from '@/services/affairesService';
import { getCategoriesAchat } from '@/services/categorieAchatService';
import FournisseurSelect from '@/components/affaires/FournisseurSelect';

const Achats = ({ hideHeader = false }) => {
  const navigate = useNavigate();
  
  // États principaux
  const [achats, setAchats] = useState([]);
  const [affaires, setAffaires] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal et édition
  const [showModal, setShowModal] = useState(false);
  const [editingAchat, setEditingAchat] = useState(null);
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreAffaire, setFiltreAffaire] = useState('');
  const [filtreCategorie, setFiltreCategorie] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [showOnlyFacturesOnly, setShowOnlyFacturesOnly] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  // Formulaire
  const form = useForm({
    initialValues: {
      fournisseur: '',
      montantHt: 0,
      montantTtc: 0,
      dateFacture: new Date(),
      dateEcheance: null,
      affaireId: '',
      categorieId: '',
      numeroFacture: '',
      commentaire: '',
      statut: 'RECU'
    },
    validate: {
      fournisseur: (value) => !value ? 'Le fournisseur est obligatoire' : null,
      montantHt: (value) => !value || value <= 0 ? 'Le montant HT doit être supérieur à 0' : null,
      dateFacture: (value) => !value ? 'La date de facture est obligatoire' : null,
      affaireId: (value) => !value ? 'L\'affaire est obligatoire' : null,
      categorieId: (value) => !value ? 'La catégorie est obligatoire' : null,
      numeroFacture: (value) => !value ? 'Le numéro de facture est obligatoire' : null
    }
  });

  // Chargement initial
  useEffect(() => {
    loadInitialData();
  }, []);

  // Chargement des achats avec filtres
  useEffect(() => {
    loadAchats();
  }, [currentPage, searchTerm, filtreAffaire, filtreCategorie, filtreStatut]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [affairesResponse, categoriesResponse] = await Promise.all([
        affairesService.getAffaires({ take: 1000 }),
        getCategoriesAchat()
      ]);

      setAffaires(affairesResponse.affaires || []);
      setCategories(categoriesResponse || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadAchats = async () => {
    try {
      const params = {
        page: currentPage,
        take: itemsPerPage,
        search: searchTerm,
        affaireId: filtreAffaire,
        categorieId: filtreCategorie,
        statut: filtreStatut
      };

      const response = await getAchats(params);
      
      if (Array.isArray(response)) {
        setAchats(response);
        setTotalItems(response.length);
      } else if (response && Array.isArray(response.achats)) {
        setAchats(response.achats);
        setTotalItems(response.total || response.achats.length);
      } else {
        setAchats([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des achats:', error);
      toast.error('Erreur lors du chargement des factures');
      setAchats([]);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      const achatData = {
        fournisseur: values.fournisseur,
        montantHt: parseFloat(values.montantHt),
        montantTtc: parseFloat(values.montantTtc) || Math.round(parseFloat(values.montantHt) * 1.2 * 100) / 100,
        dateFacture: values.dateFacture,
        dateEcheance: values.dateEcheance,
        affaireId: values.affaireId,
        categorieId: values.categorieId,
        numeroFacture: values.numeroFacture,
        commentaire: values.commentaire,
        statut: values.statut
      };

      if (editingAchat) {
        await updateAchat(editingAchat.id, achatData);
        toast.success('Facture modifiée avec succès');
      } else {
        await createAchat(achatData);
        toast.success('Facture créée avec succès');
      }

      await loadAchats();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (achat) => {
    setEditingAchat(achat);
    form.setValues({
      fournisseur: achat.fournisseur,
      montantHt: achat.montantHt,
      montantTtc: achat.montantTtc || Math.round(achat.montantHt * 1.2 * 100) / 100,
      dateFacture: new Date(achat.dateFacture),
      dateEcheance: achat.dateEcheance ? new Date(achat.dateEcheance) : null,
      affaireId: achat.affaireId?.toString(),
      categorieId: achat.categorieId?.toString(),
      numeroFacture: achat.numeroFacture || '',
      commentaire: achat.commentaire || '',
      statut: achat.statut || 'RECU'
    });
    setShowModal(true);
  };

  const handleDelete = async (achat) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la facture ${achat.numeroFacture} ?`)) {
      try {
        await deleteAchat(achat.id);
        toast.success('Facture supprimée avec succès');
        await loadAchats();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleViewDocument = (achat) => {
    if (achat.firebaseDownloadUrl) {
      // Ouvrir le document dans un nouvel onglet
      window.open(achat.firebaseDownloadUrl, '_blank');
    } else if (achat.fichierPdf) {
      // Fallback vers le chemin local si pas de Firebase URL
      const documentUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/uploads/${achat.fichierPdf}`;
      window.open(documentUrl, '_blank');
    } else {
      toast.error('Aucun document associé à cette facture');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAchat(null);
    form.reset();
  };

  const handleNewAchat = () => {
    if (hideHeader) {
      // Si on est dans l'interface unifiée, utiliser le modal
      setEditingAchat(null);
      form.reset();
      setShowModal(true);
    } else {
      // Si on est sur la page indépendante, naviguer vers le formulaire
      navigate('/achats/factures/nouveau');
    }
  };

  // Calcul automatique du montant TTC
  const handleMontantHtChange = (value) => {
    form.setFieldValue('montantHt', value);
    if (value) {
      const montantTtc = Math.round(value * 1.2 * 100) / 100;
      form.setFieldValue('montantTtc', montantTtc);
    }
  };

  // Données filtrées
  const achatsFiltered = achats.filter(achat => {
    if (showOnlyFacturesOnly && !achat.numeroFacture) return false;
    return true;
  });

  // Statistiques
  const totalFactures = achatsFiltered.length;
  const montantTotal = achatsFiltered.reduce((sum, achat) => sum + (achat.montantHt || 0), 0);
  const facturesReceptionnees = achatsFiltered.filter(achat => achat.statut === 'RECU').length;

  // Options pour les sélecteurs avec validation
  const affairesOptions = affaires
    .filter(affaire => affaire && affaire.id && affaire.numero)
    .map(affaire => ({
      value: String(affaire.id),
      label: `${affaire.numero} - ${(affaire.description || '').substring(0, 50)}${affaire.description && affaire.description.length > 50 ? '...' : ''}`
    }));

  const categoriesOptions = categories
    .filter(cat => cat && cat.id && cat.nom)
    .map(cat => ({
      value: String(cat.id),
      label: String(cat.nom)
    }));

  const statutsOptions = [
    { value: 'RECU', label: 'Reçu' },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'PAYE', label: 'Payé' },
    { value: 'ANNULE', label: 'Annulé' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className={hideHeader ? "space-y-6" : "p-6 space-y-6"}>
      {/* En-tête conditionnel */}
      {!hideHeader && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <IconFileInvoice className="w-8 h-8 text-white" />
              </div>
              <div>
                <Title order={2} className="text-blue-900">Gestion des Factures d'Achats</Title>
                <Text c="dimmed">Toutes les factures fournisseurs de l'entreprise</Text>
              </div>
            </div>
            <Button 
              onClick={handleNewAchat}
              leftSection={<IconPlus size={16} />}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Nouvelle facture
            </Button>
          </div>
        </Card>
      )}
      
      {/* Bouton nouvelle facture pour version sans header */}
      {hideHeader && (
        <div className="flex justify-end">
          <Button 
            onClick={handleNewAchat}
            leftSection={<IconPlus size={16} />}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Nouvelle facture
          </Button>
        </div>
      )}

      {/* Statistiques */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
            <Group>
              <div className="p-2 bg-green-500 rounded-lg">
                <IconFileInvoice className="w-5 h-5 text-white" />
              </div>
              <div>
                <Text size="xl" fw={700} c="green.8">{totalFactures}</Text>
                <Text size="sm" c="dimmed">Factures totales</Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
            <Group>
              <div className="p-2 bg-blue-500 rounded-lg">
                <IconCurrencyEuro className="w-5 h-5 text-white" />
              </div>
              <div>
                <Text size="xl" fw={700} c="blue.8">{formatCurrency(montantTotal)}</Text>
                <Text size="sm" c="dimmed">Montant total HT</Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
            <Group>
              <div className="p-2 bg-orange-500 rounded-lg">
                <IconCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <Text size="xl" fw={700} c="orange.8">{facturesReceptionnees}</Text>
                <Text size="sm" c="dimmed">Factures reçues</Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
            <Group>
              <div className="p-2 bg-purple-500 rounded-lg">
                <IconBuilding className="w-5 h-5 text-white" />
              </div>
              <div>
                <Text size="xl" fw={700} c="purple.8">{affaires.length}</Text>
                <Text size="sm" c="dimmed">Affaires actives</Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Filtres */}
      <Card>
        <Stack gap="md">
          <Group justify="space-between">
            <Group>
              <IconFilter size={16} />
              <Text fw={600}>Filtres</Text>
            </Group>
            <Button 
              variant="light" 
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFiltreAffaire('');
                setFiltreCategorie('');
                setFiltreStatut('');
                setCurrentPage(1);
              }}
              leftSection={<IconRefresh size={14} />}
            >
              Réinitialiser
            </Button>
          </Group>
          
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filtrer par affaire"
                data={affairesOptions}
                value={filtreAffaire}
                onChange={setFiltreAffaire}
                clearable
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filtrer par catégorie"
                data={categoriesOptions}
                value={filtreCategorie}
                onChange={setFiltreCategorie}
                clearable
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filtrer par statut"
                data={statutsOptions}
                value={filtreStatut}
                onChange={setFiltreStatut}
                clearable
              />
            </Grid.Col>
          </Grid>
          
          <Switch
            label="Afficher uniquement les factures avec numéro"
            checked={showOnlyFacturesOnly}
            onChange={(event) => setShowOnlyFacturesOnly(event.currentTarget.checked)}
          />
        </Stack>
      </Card>

      {/* Tableau des factures */}
      <Card>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>N° Facture</Table.Th>
              <Table.Th>Fournisseur</Table.Th>
              <Table.Th>Affaire</Table.Th>
              <Table.Th>Catégorie</Table.Th>
              <Table.Th>Montant HT</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Statut</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {achatsFiltered.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Alert icon={<IconAlertCircle size={16} />} title="Aucune facture trouvée">
                    Aucune facture ne correspond aux critères de recherche.
                  </Alert>
                </Table.Td>
              </Table.Tr>
            ) : (
                             achatsFiltered.map((achat) => {
                 // Validation des données d'achat
                 if (!achat || !achat.id) return null;
                 
                 const affaire = affaires.find(a => a && a.id && a.id.toString() === achat.affaireId?.toString());
                 const categorie = categories.find(c => c && c.id && c.id.toString() === achat.categorieId?.toString());
                 
                 return (
                   <Table.Tr key={achat.id}>
                     <Table.Td>
                       <div className="flex items-center gap-2">
                         <Text fw={500}>{String(achat.numeroFacture || 'Non défini')}</Text>
                         {(achat.firebaseDownloadUrl || achat.fichierPdf) && (
                           <div className="w-2 h-2 bg-green-500 rounded-full" title="Document disponible"></div>
                         )}
                       </div>
                     </Table.Td>
                     <Table.Td>
                       <Text>{String(achat.fournisseur || 'Non défini')}</Text>
                     </Table.Td>
                     <Table.Td>
                       <Text>
                         {affaire ? 
                           `${affaire.numero} - ${(affaire.description || '').substring(0, 30)}${affaire.description && affaire.description.length > 30 ? '...' : ''}` : 
                           'N/A'
                         }
                       </Text>
                     </Table.Td>
                     <Table.Td>
                       <Badge variant="light" color="blue">
                         {categorie?.nom || 'N/A'}
                       </Badge>
                     </Table.Td>
                     <Table.Td>
                       <Text fw={600} c="green.6">{formatCurrency(achat.montantHt || 0)}</Text>
                     </Table.Td>
                     <Table.Td>
                       <Text size="sm">
                         {achat.dateFacture ? new Date(achat.dateFacture).toLocaleDateString() : 'N/A'}
                       </Text>
                     </Table.Td>
                     <Table.Td>
                       <Badge 
                         color={
                           achat.statut === 'RECU' ? 'green' : 
                           achat.statut === 'PAYE' ? 'blue' : 
                           achat.statut === 'ANNULE' ? 'red' : 'yellow'
                         }
                         variant="light"
                       >
                         {achat.statut || 'RECU'}
                       </Badge>
                     </Table.Td>
                     <Table.Td>
                       <div className="flex gap-2 justify-end">
                         {(achat.firebaseDownloadUrl || achat.fichierPdf) && (
                           <button
                             type="button"
                             className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded"
                             onClick={() => handleViewDocument(achat)}
                             title="Voir le document"
                           >
                             <IconPhoto size={16} />
                           </button>
                         )}
                         <button
                           type="button"
                           className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded"
                           onClick={() => handleEdit(achat)}
                           title="Modifier"
                         >
                           <IconPencil size={16} />
                         </button>
                         <button
                           type="button"
                           className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                           onClick={() => handleDelete(achat)}
                           title="Supprimer"
                         >
                           <IconTrash size={16} />
                         </button>
                       </div>
                     </Table.Td>
                   </Table.Tr>
                 );
               }).filter(Boolean)
            )}
          </Table.Tbody>
        </Table>
        
        {totalItems > itemsPerPage && (
          <Group justify="center" mt="md">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={Math.ceil(totalItems / itemsPerPage)}
              size="sm"
            />
          </Group>
        )}
      </Card>

      {/* Modal de création/édition */}
      <Modal
        opened={showModal}
        onClose={handleCloseModal}
        title={editingAchat ? 'Modifier la facture' : 'Nouvelle facture'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Numéro de facture"
                  placeholder="F2025-001"
                  required
                  {...form.getInputProps('numeroFacture')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Statut"
                  data={statutsOptions}
                  required
                  {...form.getInputProps('statut')}
                />
              </Grid.Col>
            </Grid>

            <FournisseurSelect
              label="Fournisseur"
              placeholder="Sélectionner un fournisseur"
              required
              {...form.getInputProps('fournisseur')}
            />

            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Affaire"
                  placeholder="Sélectionner une affaire"
                  data={affairesOptions}
                  required
                  searchable
                  {...form.getInputProps('affaireId')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Catégorie"
                  placeholder="Sélectionner une catégorie"
                  data={categoriesOptions}
                  required
                  {...form.getInputProps('categorieId')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Montant HT (€)"
                  placeholder="0.00"
                  required
                  min={0}
                  decimalScale={2}
                  fixedDecimalScale
                  value={form.values.montantHt}
                  onChange={handleMontantHtChange}
                  error={form.errors.montantHt}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Montant TTC (€)"
                  placeholder="0.00"
                  min={0}
                  decimalScale={2}
                  fixedDecimalScale
                  {...form.getInputProps('montantTtc')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <DateInput
                  label="Date de facture"
                  placeholder="Sélectionner une date"
                  required
                  {...form.getInputProps('dateFacture')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateInput
                  label="Date d'échéance"
                  placeholder="Optionnel"
                  {...form.getInputProps('dateEcheance')}
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label="Commentaire"
              placeholder="Informations supplémentaires..."
              minRows={3}
              {...form.getInputProps('commentaire')}
            />

            <Divider />

            <Group justify="flex-end">
              <Button 
                variant="light" 
                onClick={handleCloseModal}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                loading={submitting}
                leftSection={<IconDeviceFloppy size={16} />}
              >
                {editingAchat ? 'Modifier' : 'Créer'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
};

export default Achats;
