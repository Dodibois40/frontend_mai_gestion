import React, { useState, useEffect } from 'react';
import { getStatistiquesInventaire, getCategoriesArticle } from '@/services/inventaireService';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { RefreshCw, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const InventaireStats = () => {
  const [statsData, setStatsData] = useState({
    global: {
      totalArticles: 0,
      valeurTotale: 0,
      articlesEnAlerte: 0
    },
    parCategorie: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getStatistiquesInventaire();
      setStatsData(data);
      setLastUpdate(new Date());
    } catch (error) {
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  // Formater les couleurs en fonction des catégories
  const getCategoryColors = () => {
    const colorMap = {
      'ALUMINIUM': 'rgba(54, 162, 235, 0.6)',
      'VERRE': 'rgba(75, 192, 192, 0.6)',
      'QUINCAILLERIE': 'rgba(255, 206, 86, 0.6)',
      'ACCESSOIRE': 'rgba(153, 102, 255, 0.6)',
      'OUTILLAGE': 'rgba(255, 99, 132, 0.6)'
    };

    return statsData.parCategorie.map(cat => colorMap[cat.categorie] || 'rgba(201, 203, 207, 0.6)');
  };

  // Préparer les données pour le graphique en donut (par catégorie)
  const donutData = {
    labels: statsData.parCategorie.map(item => item.categorie),
    datasets: [
      {
        data: statsData.parCategorie.map(item => item.valeur),
        backgroundColor: getCategoryColors(),
        borderColor: getCategoryColors().map(color => color.replace('0.6', '1')),
        borderWidth: 1
      }
    ]
  };

  // Préparer les données pour le graphique en barres (nombre d'articles par catégorie)
  const barData = {
    labels: statsData.parCategorie.map(item => item.categorie),
    datasets: [
      {
        label: 'Nombre d\'articles',
        data: statsData.parCategorie.map(item => item.nombre),
        backgroundColor: getCategoryColors(),
        borderColor: getCategoryColors().map(color => color.replace('0.6', '1')),
        borderWidth: 1
      }
    ]
  };

  // Options pour le graphique en donut
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${value.toLocaleString()} € (${percentage}%)`;
          }
        }
      }
    }
  };

  // Options pour le graphique en barres
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre d\'articles'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  // Télécharger les données au format CSV
  const downloadCSV = () => {
    // En-têtes du CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Catégorie,Nombre d'Articles,Valeur Totale (€)\n";
    
    // Données par catégorie
    statsData.parCategorie.forEach(cat => {
      csvContent += `${cat.categorie},${cat.nombre},${cat.valeur.toFixed(2)}\n`;
    });
    
    // Totaux
    csvContent += `TOTAL,${statsData.global.totalArticles},${statsData.global.valeurTotale.toFixed(2)}\n`;
    
    // Créer un lien de téléchargement
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventaire_stats_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    
    // Télécharger le fichier
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Statistiques d'inventaire</CardTitle>
            <CardDescription>
              Analyse de la valeur et de la distribution des stocks
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchStats} className="flex items-center gap-2">
              <RefreshCw size={16} />
              Actualiser
            </Button>
            <Button variant="outline" onClick={downloadCSV} className="flex items-center gap-2">
              <Download size={16} />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm text-muted-foreground">Valeur totale du stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsData.global.valeurTotale.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })} €
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm text-muted-foreground">Nombre total d'articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsData.global.totalArticles.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm text-muted-foreground">Articles en alerte de stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {statsData.global.articlesEnAlerte.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Graphiques */}
          <Tabs defaultValue="valeur">
            <TabsList className="mb-4">
              <TabsTrigger value="valeur">Valeur par catégorie</TabsTrigger>
              <TabsTrigger value="quantite">Articles par catégorie</TabsTrigger>
            </TabsList>
            
            <TabsContent value="valeur">
              <div className="h-80">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Chargement des données...</p>
                  </div>
                ) : statsData.parCategorie.length > 0 ? (
                  <Doughnut data={donutData} options={donutOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>Aucune donnée disponible</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="quantite">
              <div className="h-80">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Chargement des données...</p>
                  </div>
                ) : statsData.parCategorie.length > 0 ? (
                  <Bar data={barData} options={barOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>Aucune donnée disponible</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Tableau détaillé */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Détail par catégorie</h3>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">Catégorie</th>
                    <th className="py-3 px-4 text-right font-medium">Nombre d'articles</th>
                    <th className="py-3 px-4 text-right font-medium">Valeur (€)</th>
                    <th className="py-3 px-4 text-right font-medium">% de la valeur totale</th>
                  </tr>
                </thead>
                <tbody>
                  {statsData.parCategorie.map((cat, index) => (
                    <tr key={cat.categorie} className={index % 2 === 0 ? '' : 'bg-muted/20'}>
                      <td className="py-3 px-4">{cat.categorie}</td>
                      <td className="py-3 px-4 text-right">{cat.nombre.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        {cat.valeur.toLocaleString(undefined, { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {((cat.valeur / statsData.global.valeurTotale) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-muted/50 font-medium">
                    <td className="py-3 px-4">TOTAL</td>
                    <td className="py-3 px-4 text-right">{statsData.global.totalArticles.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      {statsData.global.valeurTotale.toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t bg-muted/50 p-2 text-sm text-muted-foreground">
          Dernière mise à jour: {format(lastUpdate, 'dd/MM/yyyy HH:mm', { locale: fr })}
        </CardFooter>
      </Card>
    </div>
  );
};

export default InventaireStats; 