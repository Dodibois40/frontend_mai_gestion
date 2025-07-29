import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getArticle, deleteArticle } from '@/services/articlesService';
import { getMouvementsStock, createMouvementStock } from '@/services/mouvementsStockService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Package, 
  Plus, 
  Minus, 
  RotateCcw,
  Archive,
  AlertTriangle,
  Calendar,
  MapPin,
  Truck,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ArticleDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // États
  const [article, setArticle] = useState(null);
  const [mouvements, setMouvements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('informations');

  // États pour nouveau mouvement
  const [showMouvementForm, setShowMouvementForm] = useState(false);
  const [mouvementData, setMouvementData] = useState({
    type: '',
    quantite: '',
    motif: '',
    reference: ''
  });
  const [isCreatingMouvement, setIsCreatingMouvement] = useState(false);

  // Charger les données
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [articleData, mouvementsData] = await Promise.all([
        getArticle(id),
        getMouvementsStock({ articleId: id })
      ]);
      
      setArticle(articleData);
      setMouvements(mouvementsData.mouvements || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
      navigate('/articles');
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer l'article
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteArticle(id);
      toast.success("Article supprimé avec succès");
      navigate('/articles');
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Créer un mouvement de stock
  const handleCreateMouvement = async () => {
    if (!mouvementData.type || !mouvementData.quantite) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    setIsCreatingMouvement(true);
    try {
      await createMouvementStock({
        articleId: id,
        type: mouvementData.type,
        quantite: parseFloat(mouvementData.quantite),
        motif: mouvementData.motif || null,
        reference: mouvementData.reference || null
      });

      toast.success("Mouvement de stock créé avec succès");
      setMouvementData({ type: '', quantite: '', motif: '', reference: '' });
      setShowMouvementForm(false);
      loadData(); // Recharger les données
    } catch (error) {
      toast.error("Erreur lors de la création du mouvement");
    } finally {
      setIsCreatingMouvement(false);
    }
  };

  // Fonction pour obtenir l'icône du type de mouvement
  const getMouvementIcon = (type) => {
    switch (type) {
      case 'ENTREE': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'SORTIE': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'AJUSTEMENT': return <RotateCcw className="h-4 w-4 text-blue-500" />;
      case 'INVENTAIRE': return <Archive className="h-4 w-4 text-purple-500" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  // Fonction pour obtenir la couleur du badge selon le type
  const getMouvementVariant = (type) => {
    switch (type) {
      case 'ENTREE': return 'default';
      case 'SORTIE': return 'destructive';
      case 'AJUSTEMENT': return 'secondary';
      case 'INVENTAIRE': return 'outline';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p>Article non trouvé</p>
      </div>
    );
  }

  const stockEnAlerte = article.stockActuel <= article.stockMinimum;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/articles')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{article.code}</h1>
            {!article.actif && (
              <Badge variant="secondary">Inactif</Badge>
            )}
            {stockEnAlerte && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Stock faible
              </Badge>
            )}
          </div>
        </div>
        <p className="text-lg text-muted-foreground">{article.designation}</p>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={() => navigate(`/articles/${id}/modifier`)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="informations">Informations</TabsTrigger>
          <TabsTrigger value="mouvements">
            Mouvements de stock ({mouvements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="informations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Code</Label>
                    <p className="font-semibold">{article.code}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Unité</Label>
                    <p className="font-semibold">{article.unite}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Désignation</Label>
                  <p className="font-semibold">{article.designation}</p>
                </div>

                {article.emplacement && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Emplacement</Label>
                      <p className="font-semibold">{article.emplacement}</p>
                    </div>
                  </div>
                )}

                {article.fournisseur && (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Fournisseur</Label>
                      <p className="font-semibold">{article.fournisseur}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock et prix */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Stock et prix
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Prix unitaire</Label>
                    <p className="text-xl font-bold text-green-600">
                      {article.prixUnitaire.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Valeur stock</Label>
                    <p className="text-xl font-bold">
                      {(article.stockActuel * article.prixUnitaire).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Stock actuel</Label>
                    <p className={`text-lg font-bold ${stockEnAlerte ? 'text-red-600' : 'text-green-600'}`}>
                      {article.stockActuel} {article.unite}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Stock minimum</Label>
                    <p className="text-lg font-semibold">{article.stockMinimum} {article.unite}</p>
                  </div>
                  {article.stockMaximum && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Stock maximum</Label>
                      <p className="text-lg font-semibold">{article.stockMaximum} {article.unite}</p>
                    </div>
                  )}
                </div>

                {stockEnAlerte && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700 font-medium">
                      Stock en dessous du minimum recommandé
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mouvements" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Historique des mouvements</h3>
            <Button onClick={() => setShowMouvementForm(!showMouvementForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau mouvement
            </Button>
          </div>

          {/* Formulaire de nouveau mouvement */}
          {showMouvementForm && (
            <Card>
              <CardHeader>
                <CardTitle>Nouveau mouvement de stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type de mouvement *</Label>
                    <Select
                      value={mouvementData.type}
                      onValueChange={(value) => setMouvementData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENTREE">Entrée</SelectItem>
                        <SelectItem value="SORTIE">Sortie</SelectItem>
                        <SelectItem value="AJUSTEMENT">Ajustement</SelectItem>
                        <SelectItem value="INVENTAIRE">Inventaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantite">Quantité *</Label>
                    <Input
                      id="quantite"
                      type="number"
                      step="0.01"
                      value={mouvementData.quantite}
                      onChange={(e) => setMouvementData(prev => ({ ...prev, quantite: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reference">Référence</Label>
                    <Input
                      id="reference"
                      value={mouvementData.reference}
                      onChange={(e) => setMouvementData(prev => ({ ...prev, reference: e.target.value }))}
                      placeholder="Ex: BDC-001, FACT-123"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motif">Motif</Label>
                    <Input
                      id="motif"
                      value={mouvementData.motif}
                      onChange={(e) => setMouvementData(prev => ({ ...prev, motif: e.target.value }))}
                      placeholder="Motif du mouvement"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateMouvement}
                    disabled={isCreatingMouvement}
                  >
                    {isCreatingMouvement ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Création...
                      </div>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer le mouvement
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowMouvementForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des mouvements */}
          <div className="space-y-4">
            {mouvements.length > 0 ? (
              mouvements.map((mouvement) => (
                <Card key={mouvement.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getMouvementIcon(mouvement.type)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getMouvementVariant(mouvement.type)}>
                              {mouvement.type}
                            </Badge>
                            <span className="font-semibold">
                              {mouvement.type === 'SORTIE' ? '-' : '+'}{mouvement.quantite} {article.unite}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(mouvement.createdAt), 'PPP à HH:mm', { locale: fr })}
                            {mouvement.user && (
                              <span>• Par {mouvement.user.prenom} {mouvement.user.nom}</span>
                            )}
                          </div>
                          {mouvement.motif && (
                            <p className="text-sm text-muted-foreground mt-1">{mouvement.motif}</p>
                          )}
                          {mouvement.reference && (
                            <p className="text-sm text-blue-600 mt-1">Réf: {mouvement.reference}</p>
                          )}
                        </div>
                      </div>
                      {mouvement.prixUnitaire && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Prix unitaire</p>
                          <p className="font-semibold">
                            {mouvement.prixUnitaire.toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'EUR'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucun mouvement de stock enregistré</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'article "{article.code}" ? 
              Cette action est irréversible et supprimera également tout l'historique des mouvements de stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArticleDetails; 