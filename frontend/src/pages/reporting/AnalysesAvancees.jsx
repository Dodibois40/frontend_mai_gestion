import React, { useState, useEffect } from 'react';
import { 
  getMargesAffaires, 
  getInventaireStats,
  getHeuresStats,
  getAchatsEvolution,
  exportCsv 
} from '@/services/reportingService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CalendarIcon, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Package,
  Clock,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { Bar, Line, Doughnut, Scatter } from 'react-chartjs-2';
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

const AnalysesAvancees = () => {
  // États pour les données
  const [margesData, setMargesData] = useState({ marges: [], resumeMarges: {} });
  const [inventaireData, setInventaireData] = useState({});
  const [heuresData, setHeuresData] = useState({});
  const [achatsData, setAchatsData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // États pour les filtres
  const [activeTab, setActiveTab] = useState('marges');
  const [dateDebut, setDateDebut] = useState(subMonths(new Date(), 12));
  const [dateFin, setDateFin] = useState(new Date());
  const [seuilMarge, setSeuilMarge] = useState(15);
  const [showCalendar, setShowCalendar] = useState({ debut: false, fin: false });

  // Fonction pour charger les données
  const loadData = async () => {
    setIsLoading(true);
    try {
      const params = {
        dateDebut: format(dateDebut, 'yyyy-MM-dd'),
        dateFin: format(dateFin, 'yyyy-MM-dd'),
      };

      switch (activeTab) {
        case 'marges':
          const marges = await getMargesAffaires({ 
            ...params, 
            seuilMarge: seuilMarge 
          });
          setMargesData(marges);
          break;
        case 'inventaire':
          const inventaire = await getInventaireStats(params);
          setInventaireData(inventaire);
          break;
        case 'heures':
          const heures = await getHeuresStats(params);
          setHeuresData(heures);
          break;
        case 'achats':
          const achats = await getAchatsEvolution(params);
          setAchatsData(achats);
          break;
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, dateDebut, dateFin, seuilMarge]);

  // Composant pour les filtres de dates
  const DateFilters = () => (
    <div className="flex gap-4 mb-6">
      <div className="flex-1">
        <Label htmlFor="dateDebut">Date de début</Label>
        <Popover open={showCalendar.debut} onOpenChange={(open) => 
          setShowCalendar(prev => ({ ...prev, debut: open }))}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${
                !dateDebut && "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateDebut ? format(dateDebut, "PPP", { locale: fr }) : "Sélectionner une date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateDebut}
              onSelect={(date) => {
                setDateDebut(date);
                setShowCalendar(prev => ({ ...prev, debut: false }));
              }}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex-1">
        <Label htmlFor="dateFin">Date de fin</Label>
        <Popover open={showCalendar.fin} onOpenChange={(open) => 
          setShowCalendar(prev => ({ ...prev, fin: open }))}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${
                !dateFin && "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFin ? format(dateFin, "PPP", { locale: fr }) : "Sélectionner une date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFin}
              onSelect={(date) => {
                setDateFin(date);
                setShowCalendar(prev => ({ ...prev, fin: false }));
              }}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex-none">
        <Button 
          onClick={() => exportCsv(activeTab, {
            dateDebut: format(dateDebut, 'yyyy-MM-dd'),
            dateFin: format(dateFin, 'yyyy-MM-dd'),
          })}
          className="mt-6"
        >
          <Download className="mr-2 h-4 w-4" />
          Exporter CSV
        </Button>
      </div>
    </div>
  );

  // Composant pour l'analyse des marges
  const MargesAnalysis = () => {
    const chartData = {
      labels: margesData.marges?.map(m => m.numero) || [],
      datasets: [
        {
          label: 'Taux de marge (%)',
          data: margesData.marges?.map(m => m.tauxMarge) || [],
          backgroundColor: (ctx) => {
            const value = ctx.parsed.y;
            return value < seuilMarge ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 197, 94, 0.6)';
          },
          borderColor: (ctx) => {
            const value = ctx.parsed.y;
            return value < seuilMarge ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)';
          },
          borderWidth: 1
        }
      ]
    };

    return (
      <div className="space-y-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="seuilMarge">Seuil d'alerte marge (%)</Label>
            <Input
              id="seuilMarge"
              type="number"
              value={seuilMarge}
              onChange={(e) => setSeuilMarge(parseFloat(e.target.value) || 0)}
              placeholder="15"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marge Moyenne</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {margesData.resumeMarges?.margeMoyenne?.toFixed(1) || 0}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Affaires Positives</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {margesData.resumeMarges?.nombreAffairesPositives || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Affaires Négatives</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {margesData.resumeMarges?.nombreAffairesNegatives || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marge Max</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {margesData.resumeMarges?.margeMaximale?.toFixed(1) || 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Analyse des Marges par Affaire</CardTitle>
            <CardDescription>
              Répartition des taux de marge (seuil d'alerte : {seuilMarge}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {margesData.marges?.length > 0 ? (
              <div className="h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Taux de marge (%)'
                      }
                    }
                  }
                }} />
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Affaires en Alerte</CardTitle>
            <CardDescription>
              Affaires avec un taux de marge inférieur à {seuilMarge}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {margesData.marges?.filter(m => m.alerteMarge).map((affaire) => (
                <div key={affaire.affaireId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">{affaire.numero} - {affaire.libelle}</p>
                      <p className="text-sm text-muted-foreground">{affaire.client}</p>
                    </div>
                  </div>
                  <Badge variant={affaire.tauxMarge < 0 ? "destructive" : "secondary"}>
                    {affaire.tauxMarge.toFixed(1)}%
                  </Badge>
                </div>
              )) || <p className="text-center text-muted-foreground">Aucune affaire en alerte</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Composant pour l'analyse de l'inventaire
  const InventaireAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles Actifs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventaireData.articlesStats?._count?.id || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Stock</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventaireData.valeurStock?.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              }) || '0 €'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventaireData.alertesStock?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {inventaireData.alertesStock?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Articles en Rupture de Stock</CardTitle>
            <CardDescription>
              Articles dont le stock actuel est inférieur au stock minimum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inventaireData.alertesStock.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">{article.code} - {article.designation}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Stock: {article.stockActuel} / Min: {article.stockMinimum}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analyses Avancées</h1>
        <p className="text-muted-foreground">
          Analyses détaillées et indicateurs de performance
        </p>
      </div>

      <DateFilters />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="marges">Analyse des Marges</TabsTrigger>
          <TabsTrigger value="inventaire">Inventaire</TabsTrigger>
          <TabsTrigger value="heures">Temps de Travail</TabsTrigger>
          <TabsTrigger value="achats">Achats</TabsTrigger>
        </TabsList>

        <TabsContent value="marges" className="space-y-6">
          <MargesAnalysis />
        </TabsContent>

        <TabsContent value="inventaire" className="space-y-6">
          <InventaireAnalysis />
        </TabsContent>

        <TabsContent value="heures" className="space-y-6">
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-12 w-12 mx-auto mb-4" />
            <p>Analyse des temps de travail - En cours de développement</p>
          </div>
        </TabsContent>

        <TabsContent value="achats" className="space-y-6">
          <div className="text-center text-muted-foreground py-8">
            <BarChart3 className="h-12 w-12 mx-auto mb-4" />
            <p>Analyse des achats - En cours de développement</p>
          </div>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement des données...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysesAvancees; 