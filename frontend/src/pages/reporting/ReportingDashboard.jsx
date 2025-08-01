import React, { useState, useEffect, useCallback } from 'react';
import { 
  getDashboardData, 
  getAffairesPerformance, 
  getHeuresStats, 
  getAchatsEvolution,
  getMargesAffaires,
  exportCsv,
  exportPdf 
} from '@/services/reportingService';
import { getAffaires } from '@/services/achatService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportingDashboard = () => {
  // États pour les données
  const [kpis, setKpis] = useState({
    caTotal: 0,
    achatsTotal: 0,
    heuresTotal: 0,
    margeGlobale: 0,
    nbAffairesActives: 0
  });
  const [affairesPerformance, setAffairesPerformance] = useState([]);
  const [heuresStats, setHeuresStats] = useState({ parType: [], parAffaire: [] });
  const [achatsEvolution, setAchatsEvolution] = useState([]);
  const [margesAffaires, setMargesAffaires] = useState([]);
  const [affaires, setAffaires] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // États pour les filtres
  const [activeTab, setActiveTab] = useState('performance');
  const [periode, setPeriode] = useState('annee');
  const [selectedAffaire, setSelectedAffaire] = useState('');
  const [dateDebut, setDateDebut] = useState(startOfYear(new Date()));
  const [dateFin, setDateFin] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);

  // Fonction pour obtenir les paramètres de filtrage
  const getFilterParams = useCallback(() => {
    const params = {
      dateDebut: format(dateDebut, 'yyyy-MM-dd'),
      dateFin: format(dateFin, 'yyyy-MM-dd'),
    };

    if (selectedAffaire && selectedAffaire !== '_TOUTES_AFFAIRES_') {
      params.affaireId = selectedAffaire;
    }

    return params;
  }, [dateDebut, dateFin, selectedAffaire]);

  // Charger les données initiales
  useEffect(() => {
    const fetchAffaires = async () => {
      try {
        const affairesData = await getAffaires();
        setAffaires(affairesData || []);
      } catch (error) {
        toast.error("Erreur lors du chargement des affaires");
      }
    };

    fetchAffaires();
  }, []);

  // Mettre à jour les dates en fonction de la période sélectionnée
  useEffect(() => {
    const now = new Date();
    let debut, fin;

    switch (periode) {
      case 'mois':
        debut = startOfMonth(now);
        fin = endOfMonth(now);
        break;
      case 'trimestre':
        debut = subMonths(now, 3);
        fin = now;
        break;
      case 'annee':
        debut = startOfYear(now);
        fin = now;
        break;
      case 'personnalise':
        // Garder les dates sélectionnées manuellement
        return;
      default:
        debut = startOfYear(now);
        fin = now;
    }

    setDateDebut(debut);
    setDateFin(fin);
  }, [periode]);

  // Charger les données en fonction des filtres
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const params = getFilterParams();
        
        // Charger les KPIs globaux
        const dashboardData = await getDashboardData(params);
        setKpis(dashboardData);

        // Charger les données spécifiques à l'onglet actif
        switch (activeTab) {
          case 'performance':
            const performanceData = await getAffairesPerformance(params);
            setAffairesPerformance(performanceData || []);
            break;
          case 'heures':
            const heuresData = await getHeuresStats(params);
            setHeuresStats(heuresData || { parType: [], parAffaire: [] });
            break;
          case 'achats':
            const achatsData = await getAchatsEvolution(params);
            setAchatsEvolution(achatsData || []);
            break;
          case 'marges':
            const margesData = await getMargesAffaires(params);
            setMargesAffaires(margesData || []);
            break;
          default:
            break;
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des données de reporting");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [activeTab, getFilterParams]);

  // Gérer les changements de période
  const handlePeriodeChange = (value) => {
    setPeriode(value);
  };

  // Gérer les changements d'affaire
  const handleAffaireChange = (value) => {
    setSelectedAffaire(value === '_TOUTES_AFFAIRES_' ? '' : value);
  };

  // Gérer l'export des données
  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      const params = getFilterParams();
      
      if (format === 'csv') {
        await exportCsv(activeTab, params);
      } else if (format === 'pdf') {
        await exportPdf(activeTab, params);
      }
      
      toast.success(`Export ${format.toUpperCase()} réussi`);
    } catch (error) {
      toast.error(`Erreur lors de l'export en ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Préparation des données pour les graphiques
  const performanceChartData = {
    labels: affairesPerformance.map(a => a.numero),
    datasets: [
      {
        label: 'CA réalisé',
        data: affairesPerformance.map(a => a.caRealise),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      },
      {
        label: 'CA objectif',
        data: affairesPerformance.map(a => a.caObjectif),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      }
    ]
  };

  const heuresTypeChartData = {
    labels: heuresStats.parType.map(h => h.type),
    datasets: [
      {
        data: heuresStats.parType.map(h => h.totalHeures),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)'
        ],
        borderWidth: 1
      }
    ]
  };

  const heuresAffaireChartData = {
    labels: heuresStats.parAffaire.map(h => h.numero),
    datasets: [
      {
        label: 'Heures totales',
        data: heuresStats.parAffaire.map(h => h.totalHeures),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }
    ]
  };

  const achatsEvolutionChartData = {
    labels: achatsEvolution.map(a => a.mois),
    datasets: [
      {
        label: 'Montant des achats',
        data: achatsEvolution.map(a => a.montantTotal),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const margesChartData = {
    labels: margesAffaires.map(m => m.numero),
    datasets: [
      {
        label: 'Marge (€)',
        data: margesAffaires.map(m => m.marge),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgb(255, 159, 64)',
        borderWidth: 1
      },
      {
        label: 'Marge (%)',
        data: margesAffaires.map(m => m.pourcentage * 100),
        backgroundColor: 'rgba(201, 203, 207, 0.6)',
        borderColor: 'rgb(201, 203, 207)',
        borderWidth: 1,
        type: 'line',
        yAxisID: 'percentage'
      }
    ]
  };

  // Options communes pour les graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== undefined) {
              label += context.parsed.y.toFixed(2);
            } else if (context.parsed !== undefined) {
              label += context.parsed.toFixed(2);
            }
            return label;
          }
        }
      }
    }
  };

  // Options spécifiques pour le graphique des marges
  const margesChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Affaires'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Marge (€)'
        }
      },
      percentage: {
        position: 'right',
        title: {
          display: true,
          text: 'Marge (%)'
        },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Reporting & Analyse</CardTitle>
              <CardDescription>
                Visualisez et analysez les performances de vos affaires et activités
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleExport('csv')}
                disabled={isExporting}
              >
                <FileText className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
              >
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Période</label>
              <Select value={periode} onValueChange={handlePeriodeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mois">Mois courant</SelectItem>
                  <SelectItem value="trimestre">3 derniers mois</SelectItem>
                  <SelectItem value="annee">Année en cours</SelectItem>
                  <SelectItem value="personnalise">Personnalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Affaire</label>
              <Select value={selectedAffaire || '_TOUTES_AFFAIRES_'} onValueChange={handleAffaireChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les affaires" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_TOUTES_AFFAIRES_">Toutes les affaires</SelectItem>
                  {affaires.map(affaire => (
                    <SelectItem key={affaire.id} value={affaire.id}>
                      {affaire.numero} - {affaire.libelle.substring(0, 20)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {periode === 'personnalise' && (
              <div className="flex gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Du</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal w-full">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dateDebut, 'dd/MM/yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateDebut}
                        onSelect={setDateDebut}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Au</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal w-full">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dateFin, 'dd/MM/yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFin}
                        onSelect={setDateFin}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">CA Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.caTotal.toLocaleString()} €</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Achats Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.achatsTotal.toLocaleString()} €</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Heures Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.heuresTotal.toLocaleString()} h</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Marge Globale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.margeGlobale.toFixed(2)} %</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Affaires Actives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.nbAffairesActives}</div>
              </CardContent>
            </Card>
          </div>

          {/* Onglets et graphiques */}
          <Tabs defaultValue="performance" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="performance">Performance Affaires</TabsTrigger>
              <TabsTrigger value="heures">Répartition Heures</TabsTrigger>
              <TabsTrigger value="achats">Évolution Achats</TabsTrigger>
              <TabsTrigger value="marges">Analyse Marges</TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance">
              <div className="h-96">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Chargement des données...</p>
                  </div>
                ) : affairesPerformance.length > 0 ? (
                  <Bar data={performanceChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>Aucune donnée disponible pour cette période</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="heures">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p>Chargement des données...</p>
                    </div>
                  ) : heuresStats.parType.length > 0 ? (
                    <Doughnut data={heuresTypeChartData} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p>Aucune donnée disponible pour cette période</p>
                    </div>
                  )}
                </div>
                
                <div className="h-80">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p>Chargement des données...</p>
                    </div>
                  ) : heuresStats.parAffaire.length > 0 ? (
                    <Bar data={heuresAffaireChartData} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p>Aucune donnée disponible pour cette période</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="achats">
              <div className="h-96">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Chargement des données...</p>
                  </div>
                ) : achatsEvolution.length > 0 ? (
                  <Line data={achatsEvolutionChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>Aucune donnée disponible pour cette période</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="marges">
              <div className="h-96">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Chargement des données...</p>
                  </div>
                ) : margesAffaires.length > 0 ? (
                  <Bar data={margesChartData} options={margesChartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>Aucune donnée disponible pour cette période</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div>Période: {format(dateDebut, 'dd/MM/yyyy', { locale: fr })} - {format(dateFin, 'dd/MM/yyyy', { locale: fr })}</div>
          <div>Dernière mise à jour: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })}</div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReportingDashboard; 