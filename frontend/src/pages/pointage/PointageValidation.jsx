import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPointages, updatePointage } from '@/services/pointageService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PointageValidation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pointages, setPointages] = useState([]);
  const [totalPointages, setTotalPointages] = useState(0);
  const [selectedPointages, setSelectedPointages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  // Filtres et pagination
  const [filters, setFilters] = useState({
    dateDebut: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Premier jour du mois courant
    dateFin: new Date().toISOString().split('T')[0], // Aujourd'hui
    valide: 'non_valides', // 'tous', 'valides', 'non_valides'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Nombre de pointages par page

  const fetchPointages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        dateDebut: filters.dateDebut,
        dateFin: filters.dateFin,
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
      };
      
      // Ajouter le filtre de validation si spécifié
      if (filters.valide === 'valides') {
        params.valide = true;
      } else if (filters.valide === 'non_valides') {
        params.valide = false;
      }
      
      const result = await getPointages(params);
      setPointages(result.pointages || []);
      setTotalPointages(result.total || 0);
      setSelectedPointages([]); // Réinitialiser la sélection
    } catch (error) {
      toast.error("Erreur lors de la récupération des pointages.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchPointages();
  }, [fetchPointages]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Revenir à la première page quand un filtre change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPointages(pointages.map(p => p.id));
    } else {
      setSelectedPointages([]);
    }
  };

  const handleSelectPointage = (checked, pointageId) => {
    if (checked) {
      setSelectedPointages(prev => [...prev, pointageId]);
    } else {
      setSelectedPointages(prev => prev.filter(id => id !== pointageId));
    }
  };

  const handleValidateSelected = async () => {
    if (selectedPointages.length === 0) {
      toast.info("Veuillez sélectionner au moins un pointage à valider.");
      return;
    }
    
    setIsValidating(true);
    try {
      // Mettre à jour chaque pointage sélectionné
      for (const pointageId of selectedPointages) {
        await updatePointage(pointageId, { valide: true, validePar: user.id });
      }
      
      toast.success(`${selectedPointages.length} pointage(s) validé(s) avec succès.`);
      fetchPointages(); // Actualiser la liste
    } catch (error) {
      toast.error("Erreur lors de la validation des pointages.");
    } finally {
      setIsValidating(false);
    }
  };

  // Calculer le nombre de pages
  const pageCount = Math.ceil(totalPointages / itemsPerPage);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Validation des Pointages</CardTitle>
          <CardDescription>Validez les pointages de l'équipe pour le mois en cours.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Date de début</label>
              <input
                type="date"
                className="w-full border rounded-md p-2"
                value={filters.dateDebut}
                onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Date de fin</label>
              <input
                type="date"
                className="w-full border rounded-md p-2"
                value={filters.dateFin}
                onChange={(e) => handleFilterChange('dateFin', e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Statut</label>
              <Select value={filters.valide} onValueChange={(value) => handleFilterChange('valide', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  <SelectItem value="valides">Validés</SelectItem>
                  <SelectItem value="non_valides">Non validés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-4">
            <Button
              onClick={handleValidateSelected}
              disabled={selectedPointages.length === 0 || isValidating}
              className="mr-2"
            >
              {isValidating ? 'Validation...' : `Valider ${selectedPointages.length} pointage(s)`}
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Chargement des pointages...</div>
          ) : pointages.length === 0 ? (
            <div className="text-center py-8">Aucun pointage trouvé pour les critères sélectionnés.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedPointages.length === pointages.length && pointages.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Collaborateur</TableHead>
                    <TableHead>Affaire</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Heures</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pointages.map((pointage) => (
                    <TableRow key={pointage.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedPointages.includes(pointage.id)}
                          onCheckedChange={(checked) => handleSelectPointage(checked, pointage.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(pointage.datePointage), 'dd MMMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        {pointage.user?.prenom} {pointage.user?.nom}
                      </TableCell>
                      <TableCell>
                        {pointage.affaire?.numero} - {pointage.affaire?.libelle?.substring(0, 20)}
                      </TableCell>
                      <TableCell>{pointage.typeHeure}</TableCell>
                      <TableCell>{pointage.nbHeures}h</TableCell>
                      <TableCell>
                        {pointage.valide ? (
                          <span className="text-green-600 font-medium">Validé</span>
                        ) : (
                          <span className="text-yellow-600 font-medium">En attente</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {pageCount > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1 || isLoading}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                    // Logique pour afficher 5 pages max avec la page actuelle au milieu
                    const pageToShow = Math.min(
                      Math.max(currentPage - 2 + i, 1),
                      pageCount
                    );
                    
                    // Éviter les doublons
                    if (i > 0 && pageToShow <= Math.min(
                      Math.max(currentPage - 2 + i - 1, 1),
                      pageCount
                    )) {
                      return null;
                    }
                    
                    return (
                      <PaginationItem key={pageToShow}>
                        <PaginationLink
                          isActive={currentPage === pageToShow}
                          onClick={() => handlePageChange(pageToShow)}
                        >
                          {pageToShow}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(pageCount, currentPage + 1))}
                      disabled={currentPage === pageCount || isLoading}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PointageValidation; 