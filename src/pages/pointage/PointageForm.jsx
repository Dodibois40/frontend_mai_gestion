import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createPointage, getPointageById, updatePointage } from '@/services/pointageService';
import { getAffaires } from '@/services/achatService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Récupérer TypeHeure depuis le schéma Prisma ou le définir ici si plus simple pour le frontend
// Pour l'instant, on le définit ici en attendant une source plus dynamique si besoin.
const TypeHeure = {
  FAB: 'FAB',
  SER: 'SER',
  POSE: 'POSE',
};

const PointageForm = () => {
  const { id } = useParams(); // ID du pointage pour le mode édition
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(id);

  // Récupérer la date passée en paramètre d'URL (ex: depuis un clic calendrier)
  const queryParams = new URLSearchParams(location.search);
  const dateFromQuery = queryParams.get('date');

  const [formData, setFormData] = useState({
    datePointage: dateFromQuery || new Date().toISOString().split('T')[0],
    nbHeures: '',
    commentaire: '',
    typeHeure: TypeHeure.FAB, // Valeur par défaut
    affaireId: '',
  });

  const [affaires, setAffaires] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState(null);

  const fetchAffaires = useCallback(async () => {
    try {
      const affairesData = await getAffaires();
      setAffaires(affairesData || []);
    } catch (error) {
      toast.error("Erreur lors de la récupération des affaires.");
      setPageError("Impossible de charger la liste des affaires.");
    }
  }, []);

  const fetchPointageData = useCallback(async (pointageId) => {
    setIsLoading(true);
    try {
      const pointage = await getPointageById(pointageId);
      if (pointage) {
        setFormData({
          datePointage: new Date(pointage.datePointage).toISOString().split('T')[0],
          nbHeures: String(pointage.nbHeures),
          commentaire: pointage.commentaire || '',
          typeHeure: pointage.typeHeure,
          affaireId: String(pointage.affaireId),
        });
      }
    } catch (error) {
      toast.error("Erreur lors de la récupération du pointage.");
      setPageError("Impossible de charger les données du pointage.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAffaires();
    if (isEditMode && id) {
      fetchPointageData(id);
    }
  }, [fetchAffaires, fetchPointageData, isEditMode, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.affaireId || !formData.nbHeures || formData.nbHeures <= 0) {
      toast.error("Veuillez sélectionner une affaire et saisir un nombre d'heures valide.");
      return;
    }
    setIsLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        nbHeures: parseFloat(formData.nbHeures),
        // L'userId sera ajouté par le backend
      };

      if (isEditMode) {
        await updatePointage(id, dataToSubmit);
        toast.success("Pointage mis à jour avec succès !");
      } else {
        await createPointage(dataToSubmit);
        toast.success("Pointage créé avec succès !");
      }
      navigate('/pointages'); // Rediriger vers la vue calendrier/liste
    } catch (error) {
      toast.error(error.message || "Erreur lors de la sauvegarde du pointage.");
    }
    setIsLoading(false);
  };

  if (pageError) {
    return <div className="container mx-auto p-4 text-red-600">{pageError}</div>;
  }
  if (isEditMode && isLoading && !formData.affaireId) { // Chargement initial en mode édition
    return <div className="container mx-auto p-4">Chargement du pointage...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditMode ? 'Modifier le Pointage' : 'Saisir un Pointage'}</CardTitle>
          <CardDescription>
            {isEditMode ? 'Modifiez les détails de votre pointage.' : 'Enregistrez vos heures pour une affaire.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="datePointage">Date du pointage *</Label>
              <Input 
                id="datePointage" 
                name="datePointage" 
                type="date" 
                value={formData.datePointage} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div>
              <Label htmlFor="affaireId">Affaire *</Label>
              <Select name="affaireId" value={formData.affaireId} onValueChange={(value) => handleSelectChange('affaireId', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une affaire" />
                </SelectTrigger>
                <SelectContent>
                  {affaires.length === 0 && <SelectItem value="" disabled>Chargement des affaires...</SelectItem>}
                  {affaires.map(affaire => (
                    <SelectItem key={affaire.id} value={String(affaire.id)}>
                      {affaire.numero} - {affaire.libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="typeHeure">Type d'heure *</Label>
              <Select name="typeHeure" value={formData.typeHeure} onValueChange={(value) => handleSelectChange('typeHeure', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type d'heure" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TypeHeure).map(([key, value]) => (
                    <SelectItem key={key} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="nbHeures">Nombre d'heures *</Label>
              <Input 
                id="nbHeures" 
                name="nbHeures" 
                type="number" 
                step="0.25" 
                min="0.25"
                value={formData.nbHeures} 
                onChange={handleChange} 
                required 
                placeholder="Ex: 7.5"
              />
            </div>

            <div>
              <Label htmlFor="commentaire">Commentaire</Label>
              <Textarea 
                id="commentaire" 
                name="commentaire" 
                value={formData.commentaire} 
                onChange={handleChange} 
                placeholder="Détails sur le travail effectué..."
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/pointages')} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading || affaires.length === 0}>
                {isLoading ? (isEditMode ? 'Sauvegarde...' : 'Création...') : (isEditMode ? 'Sauvegarder' : 'Créer Pointage')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PointageForm; 