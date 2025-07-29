import React, { useState, useEffect } from 'react';
import { 
  getArticles, 
  getCategoriesArticle, 
  deleteArticle, 
  ajusterStock
} from '@/services/inventaireService';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash, 
  PlusCircle, 
  MinusCircle, 
  AlertTriangle
} from 'lucide-react';

const InventaireList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [filters, setFilters] = useState({
    categorie: '',
    recherche: '',
    seuilAlert: false
  });
  
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [ajustementMode, setAjustementMode] = useState(null); // 'ENTREE' ou 'SORTIE'
  const [ajustementQuantite, setAjustementQuantite] = useState(1);
  const [ajustementCommentaire, setAjustementCommentaire] = useState('');
  const [showAjustementDialog, setShowAjustementDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const categories = getCategoriesArticle();

  // Charger les articles
  useEffect(() => {
    fetchArticles();
  }, [pagination.page, filters]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const result = await getArticles(params);
      
      setArticles(result.articles);
      setPagination(prev => ({
        ...prev,
        total: result.pagination.total,
        pages: result.pagination.pages
      }));
    } catch (error) {
      toast.error("Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };

  // Gérer les changements de filtres
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Revenir à la première page
  };

  // Gérer la pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Préparer le modal d'ajustement de stock
  const prepareAjustement = (article, mode) => {
    setSelectedArticle(article);
    setAjustementMode(mode);
    setAjustementQuantite(1);
    setAjustementCommentaire('');
    setShowAjustementDialog(true);
  };

  // Soumettre l'ajustement de stock
  const submitAjustement = async () => {
    try {
      if (!selectedArticle || !ajustementMode || ajustementQuantite <= 0) {
        toast.error("Veuillez remplir tous les champs correctement");
        return;
      }

      await ajusterStock(selectedArticle._id, {
        quantite: Number(ajustementQuantite),
        type: ajustementMode,
        commentaire: ajustementCommentaire
      });

      toast.success(`Stock ${ajustementMode === 'ENTREE' ? 'augmenté' : 'diminué'} avec succès`);
      setShowAjustementDialog(false);
      fetchArticles(); // Recharger les données
    } catch (error) {
      if (error.message === 'Stock insuffisant pour cette sortie') {
        toast.error("Stock insuffisant pour cette sortie");
      } else {
        toast.error("Erreur lors de l'ajustement du stock");
      }
    }
  };

  // Supprimer un article
  const handleDelete = async (id) => {
    try {
      await deleteArticle(id);
      toast.success("Article supprimé avec succès");
      fetchArticles(); // Recharger les données
      setConfirmDelete(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'article");
    }
  };

  // Formatter le statut en badge
  const getStatusBadge = (article) => {
    if (article.quantiteStock <= article.seuilAlerte) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle size={14} />
          Alerte stock
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Stock normal
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestion de l'inventaire</CardTitle>
            <CardDescription>
              Gérez les stocks de matériaux et fournitures
            </CardDescription>
          </div>
          <Link to="/inventaire/nouveau">
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Nouvel article
            </Button>
          </Link>
        </CardHeader>

        <CardContent>
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                placeholder="Rechercher un article..."
                className="pl-8"
                value={filters.recherche}
                onChange={(e) => handleFilterChange('recherche', e.target.value)}
              />
            </div>

            <Select
              value={filters.categorie}
              onValueChange={(value) => handleFilterChange('categorie', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les catégories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Button
                variant={filters.seuilAlert ? "default" : "outline"}
                onClick={() => handleFilterChange('seuilAlert', !filters.seuilAlert)}
                className="gap-2"
              >
                <AlertTriangle size={16} />
                Articles en alerte
              </Button>
              
              {(filters.categorie || filters.recherche || filters.seuilAlert) && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setFilters({
                      categorie: '',
                      recherche: '',
                      seuilAlert: false
                    });
                  }}
                >
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Désignation</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      Chargement des articles...
                    </TableCell>
                  </TableRow>
                ) : articles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      Aucun article trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  articles.map((article) => (
                    <TableRow key={article._id}>
                      <TableCell className="font-medium">
                        {article.reference}
                      </TableCell>
                      <TableCell>{article.designation}</TableCell>
                      <TableCell>{article.categorie}</TableCell>
                      <TableCell className="text-right">
                        {article.quantiteStock} {article.unite}
                      </TableCell>
                      <TableCell className="text-right">
                        {article.prixUnitaire.toFixed(2)} €
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(article)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => prepareAjustement(article, 'ENTREE')}>
                              <PlusCircle className="mr-2" size={16} />
                              Ajouter au stock
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => prepareAjustement(article, 'SORTIE')}>
                              <MinusCircle className="mr-2" size={16} />
                              Retirer du stock
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/inventaire/${article._id}`}>
                                <Edit className="mr-2" size={16} />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setConfirmDelete(article._id)}
                            >
                              <Trash className="mr-2" size={16} />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                      className={pagination.page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === pagination.pages || 
                      (page >= pagination.page - 1 && page <= pagination.page + 1)
                    )
                    .map((page, index, array) => {
                      // Ajouter des ellipsis quand nécessaire
                      if (index > 0 && page - array[index - 1] > 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <PaginationItem>
                              <PaginationLink disabled>...</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink 
                                isActive={pagination.page === page}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        );
                      }
                      
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            isActive={pagination.page === page}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                      className={pagination.page >= pagination.pages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t bg-muted/50 p-2 text-sm text-muted-foreground">
          Total: {pagination.total} articles trouvés
        </CardFooter>
      </Card>

      {/* Modal d'ajustement de stock */}
      <Dialog open={showAjustementDialog} onOpenChange={setShowAjustementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {ajustementMode === 'ENTREE' ? 'Ajouter au stock' : 'Retirer du stock'}
            </DialogTitle>
            <DialogDescription>
              {selectedArticle?.designation} - Référence: {selectedArticle?.reference}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-sm font-medium">Quantité actuelle:</div>
              <div className="col-span-2">
                {selectedArticle?.quantiteStock} {selectedArticle?.unite}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 items-center">
              <label htmlFor="quantite" className="text-sm font-medium">
                Quantité à {ajustementMode === 'ENTREE' ? 'ajouter' : 'retirer'}:
              </label>
              <div className="col-span-2">
                <Input 
                  id="quantite"
                  type="number" 
                  min="1" 
                  value={ajustementQuantite}
                  onChange={(e) => setAjustementQuantite(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 items-start">
              <label htmlFor="commentaire" className="text-sm font-medium">
                Commentaire:
              </label>
              <div className="col-span-2">
                <Input 
                  id="commentaire"
                  placeholder="Raison de l'ajustement..."
                  value={ajustementCommentaire}
                  onChange={(e) => setAjustementCommentaire(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAjustementDialog(false)}>
              Annuler
            </Button>
            <Button onClick={submitAjustement}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(confirmDelete)}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventaireList; 