import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createArticle, updateArticle, getArticle } from '@/services/articlesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Save, ArrowLeft, Package } from 'lucide-react';
import { toast } from 'sonner';

const ArticleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  // État du formulaire
  const [formData, setFormData] = useState({
    code: '',
    designation: '',
    unite: '',
    prixUnitaire: '',
    stockActuel: '',
    stockMinimum: '',
    stockMaximum: '',
    emplacement: '',
    fournisseur: '',
    actif: true
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Unités prédéfinies
  const unites = [
    { value: 'm', label: 'Mètre (m)' },
    { value: 'm²', label: 'Mètre carré (m²)' },
    { value: 'm³', label: 'Mètre cube (m³)' },
    { value: 'kg', label: 'Kilogramme (kg)' },
    { value: 'g', label: 'Gramme (g)' },
    { value: 'L', label: 'Litre (L)' },
    { value: 'pièce', label: 'Pièce' },
    { value: 'lot', label: 'Lot' },
    { value: 'boîte', label: 'Boîte' },
    { value: 'pack', label: 'Pack' },
    { value: 'rouleau', label: 'Rouleau' },
    { value: 'planche', label: 'Planche' },
    { value: 'panneau', label: 'Panneau' },
  ];

  // Charger les données de l'article si édition
  useEffect(() => {
    if (isEditing) {
      loadArticle();
    }
  }, [id, isEditing]);

  const loadArticle = async () => {
    setIsLoadingData(true);
    try {
      const article = await getArticle(id);
      setFormData({
        code: article.code || '',
        designation: article.designation || '',
        unite: article.unite || '',
        prixUnitaire: article.prixUnitaire?.toString() || '',
        stockActuel: article.stockActuel?.toString() || '',
        stockMinimum: article.stockMinimum?.toString() || '',
        stockMaximum: article.stockMaximum?.toString() || '',
        emplacement: article.emplacement || '',
        fournisseur: article.fournisseur || '',
        actif: article.actif ?? true
      });
    } catch (error) {
      toast.error("Erreur lors du chargement de l'article");
      navigate('/articles');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Gérer les changements de champs
  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Supprimer l'erreur si le champ est corrigé
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    // Champs obligatoires
    if (!formData.code.trim()) {
      newErrors.code = 'Le code est obligatoire';
    }
    if (!formData.designation.trim()) {
      newErrors.designation = 'La désignation est obligatoire';
    }
    if (!formData.unite.trim()) {
      newErrors.unite = 'L\'unité est obligatoire';
    }
    if (!formData.prixUnitaire || parseFloat(formData.prixUnitaire) < 0) {
      newErrors.prixUnitaire = 'Le prix unitaire doit être positif';
    }

    // Validation des stocks
    const stockActuel = parseFloat(formData.stockActuel) || 0;
    const stockMinimum = parseFloat(formData.stockMinimum) || 0;
    const stockMaximum = parseFloat(formData.stockMaximum) || 0;

    if (stockActuel < 0) {
      newErrors.stockActuel = 'Le stock actuel ne peut pas être négatif';
    }
    if (stockMinimum < 0) {
      newErrors.stockMinimum = 'Le stock minimum ne peut pas être négatif';
    }
    if (stockMaximum > 0 && stockMaximum < stockMinimum) {
      newErrors.stockMaximum = 'Le stock maximum doit être supérieur au stock minimum';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    setIsLoading(true);
    try {
      const articleData = {
        code: formData.code.trim(),
        designation: formData.designation.trim(),
        unite: formData.unite,
        prixUnitaire: parseFloat(formData.prixUnitaire),
        stockActuel: parseFloat(formData.stockActuel) || 0,
        stockMinimum: parseFloat(formData.stockMinimum) || 0,
        stockMaximum: formData.stockMaximum ? parseFloat(formData.stockMaximum) : null,
        emplacement: formData.emplacement.trim() || null,
        fournisseur: formData.fournisseur.trim() || null,
        actif: formData.actif
      };

      if (isEditing) {
        await updateArticle(id, articleData);
        toast.success("Article modifié avec succès");
      } else {
        await createArticle(articleData);
        toast.success("Article créé avec succès");
      }

      navigate('/articles');
    } catch (error) {
      const message = error?.message || error?.details || 'Une erreur est survenue';
      toast.error(`Erreur lors de la ${isEditing ? 'modification' : 'création'} : ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Modifier l\'article' : 'Nouvel article'}
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground">
          {isEditing 
            ? 'Modifiez les informations de l\'article'
            : 'Ajoutez un nouvel article à l\'inventaire'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code article *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  placeholder="Ex: BOI-001"
                  className={errors.code ? 'border-red-500' : ''}
                />
                {errors.code && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.code}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unite">Unité *</Label>
                <Select
                  value={formData.unite}
                  onValueChange={(value) => handleChange('unite', value)}
                >
                  <SelectTrigger className={errors.unite ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Sélectionner une unité" />
                  </SelectTrigger>
                  <SelectContent>
                    {unites.map((unite) => (
                      <SelectItem key={unite.value} value={unite.value}>
                        {unite.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unite && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.unite}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Désignation *</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
                placeholder="Ex: Planche de chêne 20x200x2000"
                className={errors.designation ? 'border-red-500' : ''}
              />
              {errors.designation && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.designation}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emplacement">Emplacement</Label>
                <Input
                  id="emplacement"
                  value={formData.emplacement}
                  onChange={(e) => handleChange('emplacement', e.target.value)}
                  placeholder="Ex: Hangar A - Étagère 3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fournisseur">Fournisseur</Label>
                <Input
                  id="fournisseur"
                  value={formData.fournisseur}
                  onChange={(e) => handleChange('fournisseur', e.target.value)}
                  placeholder="Ex: Scierie Martin"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prix et stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prixUnitaire">Prix unitaire (€) *</Label>
                <Input
                  id="prixUnitaire"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prixUnitaire}
                  onChange={(e) => handleChange('prixUnitaire', e.target.value)}
                  placeholder="0.00"
                  className={errors.prixUnitaire ? 'border-red-500' : ''}
                />
                {errors.prixUnitaire && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.prixUnitaire}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockActuel">Stock actuel</Label>
                <Input
                  id="stockActuel"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.stockActuel}
                  onChange={(e) => handleChange('stockActuel', e.target.value)}
                  placeholder="0"
                  className={errors.stockActuel ? 'border-red-500' : ''}
                />
                {errors.stockActuel && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.stockActuel}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockMinimum">Stock minimum</Label>
                <Input
                  id="stockMinimum"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.stockMinimum}
                  onChange={(e) => handleChange('stockMinimum', e.target.value)}
                  placeholder="0"
                  className={errors.stockMinimum ? 'border-red-500' : ''}
                />
                {errors.stockMinimum && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.stockMinimum}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockMaximum">Stock maximum</Label>
                <Input
                  id="stockMaximum"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.stockMaximum}
                  onChange={(e) => handleChange('stockMaximum', e.target.value)}
                  placeholder="Optionnel"
                  className={errors.stockMaximum ? 'border-red-500' : ''}
                />
                {errors.stockMaximum && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.stockMaximum}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="actif"
                checked={formData.actif}
                onCheckedChange={(checked) => handleChange('actif', checked)}
              />
              <Label htmlFor="actif">Article actif</Label>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Les articles inactifs n'apparaissent pas dans les listes de sélection
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/articles')}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-32"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enregistrement...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isEditing ? 'Modifier' : 'Créer'}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm; 