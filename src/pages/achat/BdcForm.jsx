import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBdc, createBdc, updateBdc, getAffaires, getCategoriesAchat } from '@/services/achatService';
import { getFournisseursActifs } from '@/services/fournisseurService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import LignesBdcInput from '@/components/ui/LignesBdcInput';
import { toast } from 'sonner';
import { Send, ArrowLeft, Package, Building2, Calendar, MessageSquare, FileText, Sparkles } from 'lucide-react';

const BdcForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    // numero généré automatiquement par le backend
    dateBdc: new Date().toISOString().split('T')[0],
    fournisseur: '',
    affaireId: '',
    categorieId: '',
    commentaire: '',
    montantHt: 0,
    direction: 'SORTANT', // Toujours SORTANT maintenant
    lieuLivraison: 'ATELIER', // Par défaut à l'atelier
    adresseLivraison: '', // Adresse personnalisée si chantier
    lignes: [
      {
        id: Date.now(),
        designation: '',
        reference: '',
        quantite: 1,
        prixUnitaire: 0, // 0 pour demandes sans prix
        validee: false, // État de validation de la ligne
      }
    ],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [fournisseurs, setFournisseurs] = useState([]);
  const [affaires, setAffaires] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadData();
    if (isEditMode) {
      loadBdc();
    }
  }, [id, isEditMode]);

  const loadData = async () => {
    try {
      const [fournisseursResponse, affairesResponse, categoriesResponse] = await Promise.all([
        getFournisseursActifs(),
        getAffaires(),
        getCategoriesAchat()
      ]);

      console.log('🏢 [BDC-FORM] Fournisseurs response:', fournisseursResponse);
      console.log('📋 [BDC-FORM] Affaires response:', affairesResponse);
      console.log('📂 [BDC-FORM] Categories response:', categoriesResponse);

      // getFournisseursActifs retourne directement les données
      setFournisseurs(fournisseursResponse || []);
      // getAffaires retourne maintenant directement le tableau des affaires
      setAffaires(affairesResponse || []);
      setCategories(categoriesResponse.data || categoriesResponse || []);

      console.log('✅ [BDC-FORM] Données définies:', {
        fournisseurs: fournisseursResponse?.length || 0,
        affaires: affairesResponse?.length || 0,
        categories: (categoriesResponse.data || categoriesResponse)?.length || 0
      });
    } catch (error) {
      console.error('❌ [BDC-FORM] Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const loadBdc = async () => {
    try {
      setLoading(true);
      const response = await getBdc(id);
      if (response.data) {
        // S'assurer que chaque ligne a le champ validee
        const lignesAvecValidation = (response.data.lignes || formData.lignes).map(ligne => ({
          ...ligne,
          validee: ligne.validee || false // Ajouter le champ validee si il n'existe pas
        }));
        
        setFormData({
          ...response.data,
          dateBdc: response.data.dateBdc?.split('T')[0] || new Date().toISOString().split('T')[0],
          lignes: lignesAvecValidation,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du BDC:', error);
      toast.error('Erreur lors du chargement du BDC');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleLignesChange = (nouvelles_lignes) => {
    setFormData(prev => ({
      ...prev,
      lignes: nouvelles_lignes
    }));
  };

  const calculerMontantTotal = () => {
    return formData.lignes.reduce((total, ligne) => {
      if (ligne.prixUnitaire > 0) {
        return total + (ligne.quantite * ligne.prixUnitaire);
      }
      return total;
    }, 0);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.dateBdc) {
      newErrors.dateBdc = "La date est requise";
    }

    if (!formData.fournisseur) {
      newErrors.fournisseur = "Le fournisseur est requis";
    }

    if (!formData.affaireId) {
      newErrors.affaireId = "L'affaire est requise";
    }

    if (!formData.categorieId) {
      newErrors.categorieId = "La catégorie est requise";
    }

    // Validation des champs de livraison
    if (formData.lieuLivraison === 'CHANTIER' && !formData.adresseLivraison?.trim()) {
      newErrors.adresseLivraison = "L'adresse de livraison est requise pour un chantier";
    }

    // Filtrer les lignes qui ne sont pas complètement vides
    const lignesNonVides = formData.lignes.filter(ligne => 
      ligne.designation?.trim() || ligne.reference?.trim()
    );

    console.log('🔍 [BDC-VALIDATION] Lignes totales:', formData.lignes.length);
    console.log('🔍 [BDC-VALIDATION] Lignes non vides:', lignesNonVides.length);
    console.log('🔍 [BDC-VALIDATION] Détail des lignes:', formData.lignes.map((ligne, index) => ({
      index,
      designation: ligne.designation,
      reference: ligne.reference,
      quantite: ligne.quantite,
      prixUnitaire: ligne.prixUnitaire,
      estVide: !ligne.designation?.trim() && !ligne.reference?.trim()
    })));

    // Validation des lignes non vides
    if (lignesNonVides.length === 0) {
      newErrors.lignes = "Au moins un article est requis";
    } else {
      lignesNonVides.forEach((ligne, originalIndex) => {
        // Trouver l'index original de cette ligne dans le tableau complet
        const indexOriginal = formData.lignes.findIndex(l => l === ligne);
        
        if (!ligne.designation?.trim()) {
          newErrors[`ligne_${indexOriginal}_designation`] = "La désignation est requise";
        }
        if (!ligne.quantite || ligne.quantite <= 0) {
          newErrors[`ligne_${indexOriginal}_quantite`] = "La quantité doit être positive";
        }
        if (ligne.prixUnitaire < 0) {
          newErrors[`ligne_${indexOriginal}_prix`] = "Le prix ne peut pas être négatif";
        }
      });
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    console.log('🔍 [BDC-VALIDATION] Erreurs détectées:', newErrors);
    console.log('🔍 [BDC-VALIDATION] Formulaire valide:', isValid);
    
    if (!isValid) {
      console.log('❌ [BDC-VALIDATION] Échec de validation - détails:', {
        nombreErreurs: Object.keys(newErrors).length,
        erreurs: newErrors,
        formData: {
          dateBdc: formData.dateBdc,
          fournisseur: formData.fournisseur,
          affaireId: formData.affaireId,
          categorieId: formData.categorieId,
          lignes: formData.lignes
        }
      });
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 [BDC-SUBMIT] Début de la soumission du formulaire');
    
    if (!validateForm()) {
      console.log('❌ [BDC-SUBMIT] Validation échouée');
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    try {
      setLoading(true);
      
      // Filtrer les lignes vides avant envoi
      const lignesValides = formData.lignes.filter(ligne => 
        ligne.designation?.trim() || ligne.reference?.trim()
      );

      console.log('📋 [BDC-SUBMIT] Préparation des données:', {
        lignesOriginales: formData.lignes.length,
        lignesValides: lignesValides.length,
        formData: formData
      });

      const bdcData = {
        ...formData,
        montantHt: calculerMontantTotal(),
        lignes: lignesValides.map(ligne => ({
          designation: ligne.designation,
          reference: ligne.reference || null,
          quantite: ligne.quantite,
          prixUnitaire: ligne.prixUnitaire || 0,
        })),
      };

      console.log('📤 [BDC-SUBMIT] Données à envoyer:', bdcData);

      if (isEditMode) {
        console.log('✏️ [BDC-SUBMIT] Mise à jour du BDC:', id);
        await updateBdc(id, bdcData);
        toast.success('BDC mis à jour avec succès');
      } else {
        console.log('➕ [BDC-SUBMIT] Création du BDC');
        const result = await createBdc(bdcData);
        console.log('✅ [BDC-SUBMIT] BDC créé avec succès:', result);
        toast.success('BDC créé avec succès');
      }

      navigate(-1);
    } catch (error) {
      console.error('❌ [BDC-SUBMIT] Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg font-medium">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/10 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-light text-white">
                  {isEditMode ? 'Modifier la demande de BDC' : 'Créer une demande de BDC'}
                </h1>
                <p className="text-blue-100 mt-1 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Le numéro de BDC sera généré automatiquement au format : BDC-YYYY-XXX (ex: BDC-2025-001)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="w-full px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-8xl mx-auto">
          
          {/* Section Info BDC */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-light text-gray-800">
                <FileText className="h-6 w-6 mr-3 text-blue-600" />
                Informations de la demande
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cartouche informatif */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">Demande de BDC pour fournisseur</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>📋 Créez une demande détaillée avec articles à envoyer au fournisseur.</p>
                      <p>⚠️ Les prix seront complétés lors du retour du fournisseur.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ligne 1: Date et Fournisseur */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    Date de création *
                  </Label>
                  <Input
                    type="date"
                    value={formData.dateBdc}
                    onChange={(e) => handleInputChange('dateBdc', e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                  />
                  {errors.dateBdc && (
                    <p className="text-red-500 text-sm">{errors.dateBdc}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                    Fournisseur * ({fournisseurs.length} disponibles)
                  </Label>
                  <Select
                    value={formData.fournisseur}
                    onValueChange={(value) => {
                      console.log('🏢 [BDC-FORM] Fournisseur sélectionné:', value);
                      handleInputChange('fournisseur', value);
                    }}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg">
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      {fournisseurs.length > 0 ? (
                        fournisseurs.map((fournisseur) => (
                          <SelectItem key={fournisseur.id} value={fournisseur.nom}>
                            {fournisseur.nom}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Chargement des fournisseurs...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.fournisseur && (
                    <p className="text-red-500 text-sm">{errors.fournisseur}</p>
                  )}
                </div>
              </div>

              {/* Ligne 2: Affaire et Catégorie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Affaire *
                  </Label>
                  <Select
                    value={formData.affaireId}
                    onValueChange={(value) => handleInputChange('affaireId', value)}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg">
                      <SelectValue placeholder="Sélectionner une affaire" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(affaires) && affaires.map((affaire) => (
                        <SelectItem key={affaire.id} value={affaire.id}>
                          {affaire.numero} - {affaire.libelle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.affaireId && (
                    <p className="text-red-500 text-sm">{errors.affaireId}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Catégorie d'achat *
                  </Label>
                  <Select
                    value={formData.categorieId}
                    onValueChange={(value) => handleInputChange('categorieId', value)}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(categories) && categories.map((categorie) => (
                        <SelectItem key={categorie.id} value={categorie.id}>
                          {categorie.code} - {categorie.intitule}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categorieId && (
                    <p className="text-red-500 text-sm">{errors.categorieId}</p>
                  )}
                </div>
              </div>

              {/* Ligne 3: Livraison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                    Lieu de livraison *
                  </Label>
                  <Select
                    value={formData.lieuLivraison}
                    onValueChange={(value) => {
                      handleInputChange('lieuLivraison', value);
                      // Réinitialiser l'adresse si on change pour atelier
                      if (value === 'ATELIER') {
                        handleInputChange('adresseLivraison', '');
                      }
                    }}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg">
                      <SelectValue placeholder="Choisir le lieu de livraison" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ATELIER">
                        🏭 Atelier - La Manufacture de l'agencement
                      </SelectItem>
                      <SelectItem value="CHANTIER">
                        🚧 Chantier - Adresse personnalisée
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <Package className="h-4 w-4 mr-2 text-green-600" />
                    Adresse de livraison {formData.lieuLivraison === 'CHANTIER' && '*'}
                  </Label>
                  {formData.lieuLivraison === 'ATELIER' ? (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">La Manufacture de l'agencement</p>
                      <p className="text-xs text-blue-600">2273 avenue des Pyrénées</p>
                      <p className="text-xs text-blue-600">64520 Came</p>
                    </div>
                  ) : (
                    <>
                      <Textarea
                        value={formData.adresseLivraison}
                        onChange={(e) => handleInputChange('adresseLivraison', e.target.value)}
                        placeholder="Adresse complète du chantier..."
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg min-h-[80px] resize-none"
                      />
                      {errors.adresseLivraison && (
                        <p className="text-red-500 text-sm">{errors.adresseLivraison}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Commentaire */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                  Commentaire
                </Label>
                <Textarea
                  value={formData.commentaire}
                  onChange={(e) => handleInputChange('commentaire', e.target.value)}
                  placeholder="Commentaire sur la commande..."
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg min-h-[100px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section Articles */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-light text-gray-800">
                <Package className="h-6 w-6 mr-3 text-blue-600" />
                Articles commandés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LignesBdcInput
                lignes={formData.lignes}
                onLignesChange={handleLignesChange}
                errors={errors}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl border-0 shadow-lg p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Annuler
            </Button>
            
            <Button
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </div>
              ) : (
                <div className="flex items-center">
                  <Send className="h-4 w-4 mr-2" />
                  Créer le BDC
                </div>
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BdcForm; 
