import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Text, 
  Group, 
  Button, 
  TextInput, 
  Select, 
  Table, 
  Badge, 
  ActionIcon, 
  Menu, 
  Pagination, 
  LoadingOverlay, 
  Tooltip,
  Card
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconPlus, 
  IconSearch, 
  IconCheck, 
  IconDotsVertical, 
  IconEye, 
  IconPencil, 
  IconTrash,
  IconClock,
  IconFileInvoice,
  IconFilter,
  IconX,
  IconPhoto,
  IconDownload,
  IconReceipt
} from '@tabler/icons-react';
import { getBdcs, deleteBdc, receptionnerBdc, getAffaires, validerBdc, annulerBdc, downloadBdcPdf } from '@/services/achatService';
import { PasswordModal } from '../../components/ui/password-modal';

const BdcList = ({ hideHeader = false }) => {
  console.log('🚨 [COMPOSANT ACTIF] BdcList.jsx est utilisé');
  
  const navigate = useNavigate();
  const [bdcs, setBdcs] = useState([]);
  const [affaires, setAffaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    affaireId: '',
    fournisseur: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [bdcToDelete, setBdcToDelete] = useState(null);
  const [deletingBdc, setDeletingBdc] = useState(false);

  // Charger la liste des affaires pour le filtre
  useEffect(() => {
    const fetchAffaires = async () => {
      try {
        const affairesData = await getAffaires();
        const formattedAffaires = affairesData.map(affaire => ({
          value: affaire.id,
          label: `${affaire.numero} - ${affaire.libelle}`
        }));
        setAffaires(formattedAffaires);
      } catch (error) {
        console.error('Erreur lors du chargement des affaires:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Impossible de charger la liste des affaires',
          color: 'red'
        });
      }
    };

    fetchAffaires();
  }, []);

  // Charger les BDCs avec pagination et filtres
  useEffect(() => {
    const fetchBdcs = async () => {
      try {
        setLoading(true);
        const skip = (currentPage - 1) * itemsPerPage;
        
        const params = {
          skip,
          take: itemsPerPage,
          ...filters
        };
        
        const response = await getBdcs(params);
        
        setBdcs(response.bdc);
        setTotalItems(response.total);
      } catch (error) {
        console.error('Erreur lors du chargement des bons de commande:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Impossible de charger la liste des bons de commande',
          color: 'red'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBdcs();
  }, [currentPage, itemsPerPage, filters]);

  // Gérer la pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Appliquer les filtres
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Réinitialiser à la première page lors de l'application d'un filtre
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      affaireId: '',
      fournisseur: ''
    });
    setCurrentPage(1);
  };

  // Supprimer un BDC
  const handleDelete = async (bdc) => {
    // Si le BDC est validé, demander le mot de passe
    if (bdc.statut === 'VALIDE') {
      setBdcToDelete(bdc);
      setShowPasswordModal(true);
    } else {
      // Suppression normale pour les BDC non validés
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bon de commande ?')) {
        await performDelete(bdc.id);
      }
    }
  };

  const performDelete = async (bdcId, password = null) => {
    try {
      setDeletingBdc(true);
      await deleteBdc(bdcId, password);
      
      // Supprimer l'élément de la liste locale
      setBdcs(bdcs.filter(bdc => bdc.id !== bdcId));
      setTotalItems(prev => prev - 1);
      
      notifications.show({
        title: 'Succès',
        message: 'Bon de commande supprimé avec succès',
        color: 'green'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      notifications.show({
        title: 'Erreur',
        message: error.message || 'Erreur lors de la suppression du bon de commande',
        color: 'red'
      });
    } finally {
      setDeletingBdc(false);
      setShowPasswordModal(false);
      setBdcToDelete(null);
    }
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setBdcToDelete(null);
    setDeletingBdc(false);
  };

  const handlePasswordConfirm = async (password) => {
    if (bdcToDelete) {
      await performDelete(bdcToDelete.id, password);
    }
  };

  // Valider un BDC
  const handleValidation = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir valider ce bon de commande ?')) {
      try {
        await validerBdc(id);
        
        // Mettre à jour l'élément dans la liste
        setBdcs(bdcs.map(bdc => 
          bdc.id === id ? { ...bdc, statut: 'VALIDE' } : bdc
        ));
        
        notifications.show({
          title: 'Succès',
          message: 'Bon de commande validé avec succès',
          color: 'green'
        });
      } catch (error) {
        console.error('Erreur lors de la validation du bon de commande:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Impossible de valider le bon de commande',
          color: 'red'
        });
      }
    }
  };

  // Réceptionner un BDC
  const handleReception = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir réceptionner ce bon de commande ?')) {
      try {
        const response = await receptionnerBdc(id);
        
        // Mettre à jour l'élément dans la liste
        setBdcs(bdcs.map(bdc => 
          bdc.id === id ? { ...bdc, dateReception: response.dateReception } : bdc
        ));
        
        notifications.show({
          title: 'Succès',
          message: 'Bon de commande réceptionné avec succès',
          color: 'green'
        });
      } catch (error) {
        console.error('Erreur lors de la réception du bon de commande:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Impossible de réceptionner le bon de commande',
          color: 'red'
        });
      }
    }
  };

  const handleViewDocument = (bdc) => {
    if (bdc.firebaseDownloadUrl) {
      // Ouvrir le document dans un nouvel onglet
      window.open(bdc.firebaseDownloadUrl, '_blank');
    } else if (bdc.fichierPdf) {
      // Fallback vers le chemin local si pas de Firebase URL
      const documentUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/uploads/${bdc.fichierPdf}`;
      window.open(documentUrl, '_blank');
    } else {
      notifications.show({
        title: 'Information',
        message: 'Aucun document associé à ce bon de commande',
        color: 'orange'
      });
    }
  };

  // Annuler un BDC
  const handleAnnulation = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce bon de commande ?')) {
      try {
        await annulerBdc(id);
        
        // Mettre à jour l'élément dans la liste
        setBdcs(bdcs.map(bdc => 
          bdc.id === id ? { ...bdc, statut: 'ANNULE' } : bdc
        ));
        
        notifications.show({
          title: 'Succès',
          message: 'Bon de commande annulé avec succès',
          color: 'orange'
        });
      } catch (error) {
        console.error('Erreur lors de l\'annulation du bon de commande:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Impossible d\'annuler le bon de commande',
          color: 'red'
        });
      }
    }
  };

  // Statut du BDC (badge)
  const getBadgeStatus = (bdc) => {
    const statusConfig = {
      'EN_ATTENTE': { 
        color: '#FF9500', 
        bgColor: '#FFF5E6',
        text: 'En attente' 
      },
      'VALIDE': { 
        color: '#007AFF', 
        bgColor: '#E6F2FF',
        text: 'Validé' 
      },
      'RECEPTIONNE': { 
        color: '#34C759', 
        bgColor: '#E6F7EA',
        text: 'Réceptionné' 
      },
      'ANNULE': { 
        color: '#FF3B30', 
        bgColor: '#FFE6E6',
        text: 'Annulé' 
      }
    };

    // Priorité : dateReception > statut
    if (bdc.dateReception) {
      const config = statusConfig['RECEPTIONNE'];
      return (
        <span style={{
          backgroundColor: config.bgColor,
          color: config.color,
          padding: '4px 12px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          ✓ {config.text}
        </span>
      );
    }

    const config = statusConfig[bdc.statut] || statusConfig['EN_ATTENTE'];
    const icon = bdc.statut === 'EN_ATTENTE' ? '⏱️' : 
                 bdc.statut === 'VALIDE' ? '✓' : 
                 bdc.statut === 'ANNULE' ? '✕' : '⏱️';
    
    return (
      <span style={{
        backgroundColor: config.bgColor,
        color: config.color,
        padding: '4px 12px',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {icon} {config.text}
      </span>
    );
  };

  const handleDownloadPdf = async (bdc) => {
    try {
      console.log('🔽 Téléchargement PDF depuis BdcList pour BDC:', bdc);
      
      // Si le BDC a une URL Firebase, télécharger depuis Firebase avec le bon nom
      if (bdc.firebaseDownloadUrl) {
        console.log('📁 Téléchargement depuis Firebase:', bdc.firebaseDownloadUrl);
        
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
        console.log('📄 Nom de fichier utilisé:', fileName);
        
        link.setAttribute('download', fileName);
        
        document.body.appendChild(link);
        link.click();
        
        // Nettoyer
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        notifications.show({
          title: 'Succès',
          message: `PDF ${fileName} téléchargé avec succès`,
          color: 'green'
        });
      } else {
        console.log('🔧 Téléchargement depuis le backend (génération automatique)');
        
        // Sinon, utiliser le téléchargement backend standard
        await downloadBdcPdf(bdc.id);
        notifications.show({
          title: 'Succès',
          message: `PDF du BDC ${bdc.numero} téléchargé avec succès`,
          color: 'green'
        });
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Erreur lors du téléchargement du PDF',
        color: 'red'
      });
    }
  };

  // Styles du thème CRM
  const themeStyles = {
    primaryButton: {
      backgroundColor: '#6b7c3d',
      color: '#ffffff',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    secondaryButton: {
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      color: '#374151',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      minHeight: '36px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    },
    statsCardTerre: {
      backgroundColor: '#f5f0e8',
      border: '1px solid #e8dcc0',
      borderRadius: '12px',
      padding: '20px'
    },
    statsCardOlive: {
      backgroundColor: '#f0f4e8',
      border: '1px solid #d9e2c4',
      borderRadius: '12px',
      padding: '20px'
    },
    statsCardChene: {
      backgroundColor: '#faf6f0',
      border: '1px solid #f0e6d2',
      borderRadius: '12px',
      padding: '20px'
    },
    mainCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }
  };

  return (
    <div className={hideHeader ? "space-y-8" : "p-8 bg-gray-50 min-h-screen"}>
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
      
      {/* En-tête moderne */}
      {!hideHeader && (
        <div style={themeStyles.mainCard}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#6b7c3d' }}>
                <IconReceipt className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Bons de Commande</h1>
                <p className="text-gray-600">Gestion professionnelle des commandes fournisseurs</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/bdc/nouveau')}
              style={themeStyles.primaryButton}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#556533'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7c3d'}
            >
              <IconPlus size={18} />
              Nouveau BDC
            </button>
          </div>
        </div>
      )}
      
      {/* Bouton pour version sans header */}
      {hideHeader && (
        <div className="flex justify-end mb-6">
          <button 
            onClick={() => navigate('/bdc/nouveau')}
            style={themeStyles.primaryButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#556533'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7c3d'}
          >
            <IconPlus size={18} />
            Nouveau BDC
          </button>
        </div>
      )}

      {/* Statistiques épurées avec thème */}
      {bdcs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div style={themeStyles.statsCardTerre}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <IconReceipt className="w-5 h-5" style={{ color: '#6b7c3d' }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Total BDC</p>
                <p className="text-2xl font-bold text-black">{totalItems}</p>
              </div>
            </div>
          </div>
          
          <div style={themeStyles.statsCardOlive}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <IconCheck className="w-5 h-5" style={{ color: '#34C759' }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Réceptionnés</p>
                <p className="text-2xl font-bold text-black">
                  {bdcs.filter(bdc => bdc.dateReception).length}
                </p>
              </div>
            </div>
          </div>
          
          <div style={themeStyles.statsCardChene}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <IconClock className="w-5 h-5" style={{ color: '#FF9500' }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">En attente</p>
                <p className="text-2xl font-bold text-black">
                  {bdcs.filter(bdc => !bdc.dateReception).length}
                </p>
              </div>
            </div>
          </div>
          
          <div style={themeStyles.statsCardTerre}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color: '#6b7c3d' }}>€</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Montant HT</p>
                <p className="text-2xl font-bold text-black">
                  {bdcs.reduce((sum, bdc) => sum + (bdc.montantHt || 0), 0).toLocaleString()}€
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filtres modernisés */}
      <div style={themeStyles.mainCard}>
        <div className="flex items-center gap-3 mb-6">
          <IconFilter size={20} style={{ color: '#6b7c3d' }} />
          <h3 className="text-lg font-semibold text-gray-900">Filtres de recherche</h3>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Select 
            placeholder="Filtrer par affaire"
            clearable
            data={affaires}
            value={filters.affaireId}
            onChange={(value) => handleFilterChange('affaireId', value)}
            leftSection={<IconFilter size={16} />}
            style={{ minWidth: 280 }}
            styles={{
              input: {
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }
            }}
          />
          
          <TextInput 
            placeholder="Rechercher par fournisseur"
            value={filters.fournisseur}
            onChange={(e) => handleFilterChange('fournisseur', e.target.value)}
            leftSection={<IconSearch size={16} />}
            style={{ minWidth: 240 }}
            styles={{
              input: {
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }
            }}
          />
          
          <button 
            style={{
              ...themeStyles.secondaryButton,
              opacity: (!filters.affaireId && !filters.fournisseur) ? 0.5 : 1
            }}
            onClick={resetFilters}
            disabled={!filters.affaireId && !filters.fournisseur}
          >
            <IconX size={16} />
            Réinitialiser
          </button>
        </div>
      </div>
      
      {/* Tableau modernisé */}
      <div style={themeStyles.mainCard}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Numéro</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Affaire</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Fournisseur</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Montant HT</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Date BDC</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Statut</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-900 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bdcs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <IconReceipt size={48} className="text-gray-300" />
                      <p className="text-gray-500 font-medium">Aucun bon de commande trouvé</p>
                      <p className="text-sm text-gray-400">Essayez de modifier vos filtres ou créez un nouveau BDC</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bdcs.map((bdc, index) => (
                  <tr 
                    key={bdc.id}
                    style={{ 
                      borderBottom: '1px solid #f3f4f6',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                    }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <IconReceipt size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{bdc.numero}</span>
                        {(bdc.firebaseDownloadUrl || bdc.fichierPdf) && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" title="Document disponible"></div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700 font-medium">{bdc.affaire?.numero}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">{bdc.fournisseur}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900">
                        {bdc.montantHt.toLocaleString('fr-FR')} €
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-600">
                        {bdc.dateBdc ? new Date(bdc.dateBdc).toLocaleDateString('fr-FR') : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {getBadgeStatus(bdc)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {/* Bouton PDF modernisé */}
                        <button
                          onClick={() => handleDownloadPdf(bdc)}
                          style={{
                            backgroundColor: '#34C759',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Télécharger PDF"
                        >
                          <IconDownload size={14} />
                          PDF
                        </button>
                        
                        {/* Menu actions modernisé */}
                        <Menu shadow="md" width={220}>
                          <Menu.Target>
                            <button
                              style={{
                                backgroundColor: '#007AFF',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <IconDotsVertical size={14} />
                              Actions
                            </button>
                          </Menu.Target>
                          <Menu.Dropdown>
                            {/* Actions conditionnelles selon le statut */}
                            {bdc.statut === 'EN_ATTENTE' && !bdc.dateReception && (
                              <Menu.Item
                                onClick={() => handleValidation(bdc.id)}
                                color="blue"
                                leftSection={<IconCheck size={16} />}
                              >
                                Valider BDC
                              </Menu.Item>
                            )}
                            
                            {bdc.statut === 'VALIDE' && !bdc.dateReception && (
                              <Menu.Item
                                onClick={() => handleReception(bdc.id)}
                                color="green"
                                leftSection={<IconCheck size={16} />}
                              >
                                Réceptionner BDC
                              </Menu.Item>
                            )}
                            
                            {/* Actions toujours visibles */}
                            <Menu.Item
                              onClick={() => handleDownloadPdf(bdc)}
                              color="green"
                              leftSection={<IconDownload size={16} />}
                            >
                              Télécharger PDF
                            </Menu.Item>

                            {(bdc.firebaseDownloadUrl || bdc.fichierPdf) && (
                              <Menu.Item
                                onClick={() => handleViewDocument(bdc)}
                                color="blue"
                                leftSection={<IconEye size={16} />}
                              >
                                Voir le document
                              </Menu.Item>
                            )}
                            
                            <Menu.Divider />
                            
                            <Menu.Item
                              onClick={() => navigate(`/bdc/${bdc.id}`)}
                              color="blue"
                              leftSection={<IconEye size={16} />}
                            >
                              Voir les détails
                            </Menu.Item>
                            
                            <Menu.Item
                              onClick={() => navigate(`/bdc/${bdc.id}/modifier`)}
                              color="blue"
                              leftSection={<IconPencil size={16} />}
                            >
                              Modifier
                            </Menu.Item>
                            
                            <Menu.Item
                              onClick={() => handleDelete(bdc)}
                              color="red"
                              leftSection={<IconTrash size={16} />}
                            >
                              Supprimer
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination modernisée */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Affichage de {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} bons de commande
            </p>
            <Pagination 
              total={Math.ceil(totalItems / itemsPerPage)} 
              page={currentPage}
              onChange={handlePageChange}
              size="sm"
              styles={{
                control: {
                  '&[data-active]': {
                    backgroundColor: '#6b7c3d',
                    borderColor: '#6b7c3d'
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Modal de mot de passe */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        onConfirm={handlePasswordConfirm}
        title="Suppression d'un BDC validé"
        message={`Ce bon de commande (${bdcToDelete?.numero}) est validé. Un mot de passe administrateur est requis pour le supprimer.`}
        loading={deletingBdc}
      />
    </div>
  );
};

export default BdcList; 