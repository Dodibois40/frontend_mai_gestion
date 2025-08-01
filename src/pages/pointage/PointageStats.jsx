import React, { useState, useEffect } from 'react';
import { getPointagesStats } from '@/services/pointageService';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Créer un composant de graphique de remplacement
const ChartPlaceholder = ({ title, description }) => {
  return (
    <div className="flex items-center justify-center h-60 bg-muted/20 rounded-md border">
      <div className="text-center p-6">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
        <p className="mt-4 text-xs">Chart.js sera intégré ultérieurement</p>
      </div>
    </div>
  );
};

const PointageStats = () => {
  const [stats, setStats] = useState({
    totalHeures: 0,
    heuresParType: [],
    heuresParAffaire: [],
    heuresParJour: []
  });
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('mois');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getPointagesStats(periode);
        setStats(data);
      } catch (error) {
        toast.error("Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [periode]);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Statistiques des pointages</CardTitle>
              <CardDescription>Analyses des heures travaillées</CardDescription>
            </div>
            <div>
              <Tabs value={periode} onValueChange={setPeriode}>
                <TabsList>
                  <TabsTrigger value="semaine">Semaine</TabsTrigger>
                  <TabsTrigger value="mois">Mois</TabsTrigger>
                  <TabsTrigger value="annee">Année</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm text-muted-foreground">Total des heures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalHeures} h</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm text-muted-foreground">Heures atelier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.heuresParType.find(h => h.type === 'ATELIER')?.total || 0} h
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm text-muted-foreground">Heures pose</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.heuresParType.find(h => h.type === 'POSE')?.total || 0} h
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm text-muted-foreground">Heures déplacement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.heuresParType.find(h => h.type === 'DEPLACEMENT')?.total || 0} h
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Graphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par type</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-60">
                    <p>Chargement...</p>
                  </div>
                ) : (
                  <ChartPlaceholder 
                    title="Répartition des heures par type" 
                    description="Atelier, Pose, Déplacement, etc."
                  />
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top affaires</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-60">
                    <p>Chargement...</p>
                  </div>
                ) : (
                  <ChartPlaceholder 
                    title="Affaires les plus consommatrices" 
                    description="Heures par affaire"
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Daily Evolution */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution journalière</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-60">
                  <p>Chargement...</p>
                </div>
              ) : (
                <ChartPlaceholder 
                  title="Heures travaillées par jour" 
                  description="Évolution sur la période"
                />
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default PointageStats; 