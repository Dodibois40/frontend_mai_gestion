import React, { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  Table,
  Grid,
  Paper,
  Loader,
  Alert,
  Select,
  TextInput,
  Divider,
  Tooltip,
  Progress,
  ActionIcon,
  Modal
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconFileAnalytics,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconDownload,
  IconEye,
  IconFilter,
  IconRefresh,
  IconCalculator,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconFileInvoice,
  IconReceipt,
  IconChartBar
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/affaires';
import { getBdcs, getAchats } from '@/services/achatService';
import { affairesService } from '@/services/affairesService';

const RapprochementAchats = ({ hideHeader = false }) => {
  // États principaux
  const [bdcs, setBdcs] = useState([]);
  const [factures, setFactures] = useState([]);
  const [affaires, setAffaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  
  // Filtres
  const [filtreAffaire, setFiltreAffaire] = useState('');
  const [filtreMois, setFiltreMois] = useState(new Date());
  
  // Modal de détail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAffaire, setSelectedAffaire] = useState(null);

  // Chargement initial
  useEffect(() => {
    loadData();
  }, []);

  // Rechargement lors du changement de filtres
  useEffect(() => {
    if (bdcs.length > 0 && factures.length > 0) {
      analyzeRapprochement();
    }
  }, [bdcs, factures, filtreAffaire, filtreMois]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [bdcResponse, facturesResponse, affairesResponse] = await Promise.all([
        getBdcs({ take: 1000 }),
        getAchats({ take: 1000 }),
        affairesService.getAffaires({ take: 1000 })
      ]);

      // Traitement des réponses
      const bdcsList = Array.isArray(bdcResponse) ? bdcResponse : (bdcResponse?.bdc || bdcResponse?.bdcs || []);
      const facturesList = Array.isArray(facturesResponse) ? facturesResponse : (facturesResponse?.achats || []);
      
      setBdcs(bdcsList.filter(bdc => bdc && bdc.id));
      setFactures(facturesList.filter(f => f && f.id));
      setAffaires(affairesResponse?.affaires || []);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const analyzeRapprochement = () => {
    try {
      const analysis = {};
      const affairesWithData = [];
      
      // Filtrage par mois si spécifié
      const monthStart = new Date(filtreMois.getFullYear(), filtreMois.getMonth(), 1);
      const monthEnd = new Date(filtreMois.getFullYear(), filtreMois.getMonth() + 1, 0);
      
      affaires.forEach(affaire => {
        if (filtreAffaire && affaire.id.toString() !== filtreAffaire) return;
        
        // BDC de l'affaire
        const affaireBdcs = bdcs.filter(bdc => {
          if (bdc.affaireId?.toString() !== affaire.id.toString()) return false;
          
          if (filtreMois) {
            const bdcDate = new Date(bdc.dateBdc || bdc.dateCreation);
            return bdcDate >= monthStart && bdcDate <= monthEnd;
          }
          return true;
        });
        
        // Factures de l'affaire
        const affaireFactures = factures.filter(facture => {
          if (facture.affaireId?.toString() !== affaire.id.toString()) return false;
          
          if (filtreMois) {
            const factureDate = new Date(facture.dateFacture);
            return factureDate >= monthStart && factureDate <= monthEnd;
          }
          return true;
        });
        
        if (affaireBdcs.length === 0 && affaireFactures.length === 0) return;
        
        const totalBdcs = affaireBdcs.reduce((sum, bdc) => sum + (bdc.montantHt || 0), 0);
        const totalFactures = affaireFactures.reduce((sum, f) => sum + (f.montantHt || 0), 0);
        const ecart = totalFactures - totalBdcs;
        const ecartPourcentage = totalBdcs > 0 ? (ecart / totalBdcs) * 100 : (totalFactures > 0 ? 100 : 0);
        
        // Compter les factures sans BDC (factures où bdcId est null)
        const facturesSansBdc = affaireFactures.filter(facture => facture.bdcId === null).length;
        
        const affaireAnalysis = {
          affaire,
          nbBdcs: affaireBdcs.length,
          nbFactures: affaireFactures.length,
          facturesSansBdc,
          totalBdcs,
          totalFactures,
          ecart,
          ecartPourcentage,
          ecartAbsolu: Math.abs(ecart),
          status: getStatusFromEcart(affaireBdcs.length, affaireFactures.length, ecart, facturesSansBdc, totalBdcs, totalFactures),
          bdcsList: affaireBdcs,
          facturesList: affaireFactures
        };
        
        analysis[affaire.id] = affaireAnalysis;
        affairesWithData.push(affaireAnalysis);
      });
      
             // Statistiques globales
       const stats = {
         totalAffaires: affairesWithData.length,
         totalBdcs: affairesWithData.reduce((sum, a) => sum + a.totalBdcs, 0),
         totalFactures: affairesWithData.reduce((sum, a) => sum + a.totalFactures, 0),
         affairesConformes: affairesWithData.filter(a => a.status === 'conforme' || a.status === 'conforme_avec_factures_libres').length,
         affairesEnEcart: affairesWithData.filter(a => a.status === 'ecart' || a.status === 'ecart_avec_factures_libres').length,
         affairesSansFacture: affairesWithData.filter(a => a.status === 'sans_facture').length,
         affairesSansBdc: affairesWithData.filter(a => a.status === 'factures_sans_bdc').length,
         totalFacturesSansBdc: affairesWithData.reduce((sum, a) => sum + (a.facturesSansBdc || 0), 0),
         ecartGlobal: 0
       };
      
      stats.ecartGlobal = stats.totalFactures - stats.totalBdcs;
      
      setAnalysisData({
        details: analysis,
        affairesWithData: affairesWithData.sort((a, b) => b.ecartAbsolu - a.ecartAbsolu),
        stats
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      toast.error('Erreur lors de l\'analyse');
    }
  };

  const getStatusFromEcart = (nbBdcs, nbFactures, ecart, facturesSansBdc, bdcTotal, factureTotal) => {
    // Cas spéciaux : pas de BDC ou pas de factures
    if (nbBdcs === 0 && nbFactures > 0) {
      // Seulement des factures, pas de BDC
      return facturesSansBdc === nbFactures ? 'factures_sans_bdc' : 'ecart';
    }
    if (nbFactures === 0 && nbBdcs > 0) return 'sans_facture';
    if (nbBdcs === 0 && nbFactures === 0) return 'vide'; // Aucune donnée
    
    // Correspondance exacte requise pour l'écart financier
    if (ecart === 0) {
      // Écart = 0, mais il peut y avoir des factures sans BDC
      return facturesSansBdc > 0 ? 'conforme_avec_factures_libres' : 'conforme';
    }
    
    // Il y a un écart financier
    if (facturesSansBdc > 0) {
      // Écart + factures sans BDC
      return 'ecart_avec_factures_libres';
    }
    
    // Écart pur entre BDC rapprochés et factures rapprochées
    return 'ecart';
  };

  const getStatusBadge = (status, ecart, item) => {
    switch (status) {
      case 'conforme':
        return (
          <Badge color="green" variant="light">
            <Group gap={4}>
              <IconCheck size={12} />
              <span>Conforme</span>
            </Group>
          </Badge>
        );
      case 'conforme_avec_factures_libres':
        return (
          <Badge color="green" variant="light">
            <Group gap={4}>
              <IconCheck size={12} />
              <span>Conforme + {item?.facturesSansBdc || 0} fact. libres</span>
            </Group>
          </Badge>
        );
      case 'ecart':
        return (
          <Badge color={ecart > 0 ? 'orange' : 'red'} variant="light">
            <Group gap={4}>
              {ecart > 0 ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
              <span>Écart {ecart > 0 ? '+' : ''}{formatCurrency(ecart)}</span>
            </Group>
          </Badge>
        );
      case 'ecart_avec_factures_libres':
        return (
          <Badge color="orange" variant="light">
            <Group gap={4}>
              <IconAlertTriangle size={12} />
              <span>Écart + {item?.facturesSansBdc || 0} fact. libres</span>
            </Group>
          </Badge>
        );
      case 'sans_facture':
        return (
          <Badge color="yellow" variant="light">
            <Group gap={4}>
              <IconAlertTriangle size={12} />
              <span>BDC sans factures</span>
            </Group>
          </Badge>
        );
      case 'factures_sans_bdc':
        return (
          <Badge color="blue" variant="light">
            <Group gap={4}>
              <IconAlertTriangle size={12} />
              <span>Factures sans BDC</span>
            </Group>
          </Badge>
        );
      case 'vide':
        return (
          <Badge color="gray" variant="light">
            <Group gap={4}>
              <IconMinus size={12} />
              <span>Aucune donnée</span>
            </Group>
          </Badge>
        );
      default:
        return <Badge color="gray">Inconnu</Badge>;
    }
  };

  const handleExportExcel = () => {
    if (!analysisData) return;
    
    // Préparation des données pour l'export
    const exportData = analysisData.affairesWithData.map(item => ({
      'Affaire': item.affaire.numero,
      'Description': item.affaire.description,
      'Nb BDC': item.nbBdcs,
      'Total BDC (€)': item.totalBdcs,
      'Nb Factures': item.nbFactures,
      'Total Factures (€)': item.totalFactures,
      'Écart (€)': item.ecart,
      'Écart (%)': item.ecartPourcentage.toFixed(2),
      'Statut': item.status
    }));
    
    // Ici vous pourriez intégrer une librairie d'export Excel
    console.log('Données à exporter:', exportData);
    toast.success('Export préparé (à implémenter avec librairie Excel)');
  };

  const handleShowDetail = (affaireData) => {
    setSelectedAffaire(affaireData);
    setShowDetailModal(true);
  };

  // Options pour les sélecteurs
  const affairesOptions = [
    { value: '', label: 'Toutes les affaires' },
    ...affaires.map(affaire => ({
      value: affaire.id.toString(),
      label: `${affaire.numero} - ${affaire.description?.substring(0, 30)}${affaire.description?.length > 30 ? '...' : ''}`
    }))
  ];

  const moisOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: date.toISOString(),
      label: date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
    };
  });

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
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-lg">
                <IconFileAnalytics className="w-8 h-8 text-white" />
              </div>
              <div>
                <Title order={2} className="text-purple-900">Rapprochement BDC vs Factures</Title>
                <Text c="dimmed">Contrôle mensuel des écarts entre commandes et facturations</Text>
              </div>
            </div>
            <Group>
              <Button 
                variant="light" 
                leftSection={<IconRefresh size={16} />}
                onClick={loadData}
              >
                Actualiser
              </Button>
              <Button 
                leftSection={<IconDownload size={16} />}
                onClick={handleExportExcel}
                disabled={!analysisData}
              >
                Export Excel
              </Button>
            </Group>
          </div>
        </Card>
      )}
      
      {/* Boutons pour version sans header */}
      {hideHeader && (
        <div className="flex justify-end gap-2">
          <Button 
            variant="light" 
            leftSection={<IconRefresh size={16} />}
            onClick={loadData}
          >
            Actualiser
          </Button>
          <Button 
            leftSection={<IconDownload size={16} />}
            onClick={handleExportExcel}
            disabled={!analysisData}
          >
            Export Excel
          </Button>
        </div>
      )}

      {/* Filtres */}
      <Card>
        <Stack gap="md">
          <Group justify="space-between">
            <Group>
              <IconFilter size={16} />
              <Text fw={600}>Filtres d'analyse</Text>
            </Group>
          </Group>
          
          <Alert mb="md" color="blue" variant="light">
            <Group>
              <IconAlertTriangle size={16} />
              <div>
                <Text fw={500} size="sm">Logique de rapprochement</Text>
                <Text size="xs" c="dimmed">
                  • <strong>Facture AVEC BDC</strong> : Facture liée à un bon de commande (rapprochement manuel effectué)
                  <br />
                  • <strong>Facture SANS BDC</strong> : Facture avec bdcId = null (aucun rapprochement effectué)
                  <br />
                  • <strong>Conforme</strong> : Montant total BDC = Montant total factures liées (écart = 0€)
                </Text>
              </div>
            </Group>
          </Alert>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Select
                label="Affaire"
                data={affairesOptions}
                value={filtreAffaire}
                onChange={setFiltreAffaire}
                searchable
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Select
                label="Mois d'analyse"
                data={moisOptions}
                value={filtreMois?.toISOString()}
                onChange={(value) => setFiltreMois(value ? new Date(value) : new Date())}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <div style={{ marginTop: '24px' }}>
                <Button 
                  variant="light" 
                  fullWidth
                  leftSection={<IconRefresh size={16} />}
                  onClick={() => {
                    setFiltreAffaire('');
                    setFiltreMois(new Date());
                    toast.success('Filtres réinitialisés');
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>

      {/* Statistiques globales */}
      {analysisData && (
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
              <Group>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <IconFileInvoice className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Text size="xl" fw={700} c="blue.8">{analysisData.stats.totalAffaires}</Text>
                  <Text size="sm" c="dimmed">Affaires analysées</Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <Group>
                <div className="p-2 bg-green-500 rounded-lg">
                  <IconCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Text size="xl" fw={700} c="green.8">{analysisData.stats.affairesConformes}</Text>
                  <Text size="sm" c="dimmed">Conformes (écart = 0€)</Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
              <Group>
                <div className="p-2 bg-orange-500 rounded-lg">
                  <IconAlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Text size="xl" fw={700} c="orange.8">{analysisData.stats.affairesEnEcart}</Text>
                  <Text size="sm" c="dimmed">Avec écarts</Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
              <Group>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <IconCalculator className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Text size="xl" fw={700} c={analysisData.stats.ecartGlobal >= 0 ? "purple.8" : "red.8"}>
                    {formatCurrency(analysisData.stats.ecartGlobal)}
                  </Text>
                  <Text size="sm" c="dimmed">Écart global</Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>
      )}

      {/* Tableau de rapprochement */}
      {analysisData && (
        <Card>
          <Title order={4} mb="md">Détail par affaire</Title>
          
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Affaire</Table.Th>
                <Table.Th>BDC</Table.Th>
                <Table.Th>Factures</Table.Th>
                <Table.Th>Fact. libres</Table.Th>
                <Table.Th>Écart</Table.Th>
                <Table.Th>Statut</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {analysisData.affairesWithData.map((item) => (
                <Table.Tr key={item.affaire.id}>
                  <Table.Td>
                    <div>
                      <Text fw={500}>{item.affaire.numero}</Text>
                      <Text size="sm" c="dimmed">
                        {item.affaire.description?.substring(0, 40)}
                        {item.affaire.description?.length > 40 ? '...' : ''}
                      </Text>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <div>
                      <Text fw={600}>{formatCurrency(item.totalBdcs)}</Text>
                      <Text size="sm" c="dimmed">{item.nbBdcs} BDC</Text>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <div>
                      <Text fw={600}>{formatCurrency(item.totalFactures)}</Text>
                      <Text size="sm" c="dimmed">{item.nbFactures} factures</Text>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <div>
                      <Text fw={600} c={item.facturesSansBdc > 0 ? "orange.6" : "gray.5"}>
                        {item.facturesSansBdc || 0}
                      </Text>
                      <Text size="sm" c="dimmed">sans BDC</Text>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <div>
                      <Text fw={600} c={item.ecart >= 0 ? "green.6" : "red.6"}>
                        {item.ecart >= 0 ? '+' : ''}{formatCurrency(item.ecart)}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {item.ecartPourcentage >= 0 ? '+' : ''}{item.ecartPourcentage.toFixed(1)}%
                      </Text>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    {getStatusBadge(item.status, item.ecart, item)}
                  </Table.Td>
                  <Table.Td>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded"
                        onClick={() => handleShowDetail(item)}
                        title="Voir détail"
                      >
                        <IconEye size={16} />
                      </button>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {/* Modal de détail */}
      <Modal
        opened={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Détail - ${selectedAffaire?.affaire?.numero}`}
        size="xl"
      >
        {selectedAffaire && (
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <Card withBorder>
                  <Title order={5} mb="sm" className="flex items-center gap-2">
                    <IconFileInvoice size={16} />
                    Bons de Commande ({selectedAffaire.nbBdcs})
                  </Title>
                  
                  {selectedAffaire.bdcsList.length === 0 ? (
                    <Text c="dimmed" ta="center">Aucun BDC</Text>
                  ) : (
                    <Stack gap="xs">
                      {selectedAffaire.bdcsList.map(bdc => (
                        <div key={bdc.id} className="flex justify-between p-2 bg-gray-50 rounded">
                          <Text size="sm">BDC #{bdc.numero}</Text>
                          <Text size="sm" fw={600}>{formatCurrency(bdc.montantHt)}</Text>
                        </div>
                      ))}
                      <Divider />
                      <div className="flex justify-between font-semibold">
                        <Text>Total BDC</Text>
                        <Text fw={700}>{formatCurrency(selectedAffaire.totalBdcs)}</Text>
                      </div>
                    </Stack>
                  )}
                </Card>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Card withBorder>
                  <Title order={5} mb="sm" className="flex items-center gap-2">
                    <IconReceipt size={16} />
                    Factures ({selectedAffaire.nbFactures})
                  </Title>
                  
                  {selectedAffaire.facturesList.length === 0 ? (
                    <Text c="dimmed" ta="center">Aucune facture</Text>
                  ) : (
                    <Stack gap="xs">
                      {selectedAffaire.facturesList.map(facture => (
                        <div key={facture.id} className="flex justify-between p-2 bg-gray-50 rounded">
                          <Text size="sm">{facture.numeroFacture || 'Sans n°'}</Text>
                          <Text size="sm" fw={600}>{formatCurrency(facture.montantHt)}</Text>
                        </div>
                      ))}
                      <Divider />
                      <div className="flex justify-between font-semibold">
                        <Text>Total Factures</Text>
                        <Text fw={700}>{formatCurrency(selectedAffaire.totalFactures)}</Text>
                      </div>
                    </Stack>
                  )}
                </Card>
              </Grid.Col>
            </Grid>
            
            <Card withBorder className="bg-blue-50">
              <Title order={5} mb="sm">Résumé de l'écart</Title>
              <Grid>
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed">Montant BDC</Text>
                  <Text fw={600}>{formatCurrency(selectedAffaire.totalBdcs)}</Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed">Montant Factures</Text>
                  <Text fw={600}>{formatCurrency(selectedAffaire.totalFactures)}</Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed">Écart</Text>
                  <Text fw={700} c={selectedAffaire.ecart >= 0 ? "green.6" : "red.6"}>
                    {selectedAffaire.ecart >= 0 ? '+' : ''}{formatCurrency(selectedAffaire.ecart)}
                  </Text>
                </Grid.Col>
              </Grid>
            </Card>
          </Stack>
        )}
      </Modal>
    </div>
  );
};

export default RapprochementAchats; 