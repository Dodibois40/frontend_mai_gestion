import React, { useState, useEffect } from 'react';
import { X, Plus, FileText, Calculator, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import PdfUploadFirebase from '../../ui/PdfUploadFirebase';
import firebaseStorageService from '../../../services/firebaseStorageService';
import { findCategorieAchatForFournisseur } from '../../../utils/fournisseurCategories';

/**
 * Modal de création/édition des factures d'achat
 * Design cohérent avec le système modulaire (couleur violette)
 */
const FactureAchatModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingFacture = null,
  categories = [],
  fournisseurs = [],
  bdcsDisponibles = [],
  submitting = false,
  // Fonctions pour la gestion des PDF Firebase
  uploadPdfFirebase,
  deletePdfFirebase,
  getPdfViewUrlFirebase,
  onPdfUploadSuccess,
  onPdfUploadError
}) => {
  // États du formulaire
  const [formData, setFormData] = useState({
    fournisseur: '',
    montantHt: '',
    montantTtc: '',
    dateFacture: new Date().toISOString().split('T')[0],
    dateEcheance: '',
    categorieId: '',
    bdcId: '',
    commentaire: '',
    numeroFacture: ''
  });

  const [errors, setErrors] = useState({});
  const [autoCalculTtc, setAutoCalculTtc] = useState(true);

  // Réinitialiser le formulaire quand le modal s'ouvre/ferme
  useEffect(() => {
    if (isOpen) {
      if (editingFacture) {
        setFormData({
          fournisseur: editingFacture.fournisseur || '',
          montantHt: editingFacture.montantHt?.toString() || '',
          montantTtc: editingFacture.montantTtc?.toString() || '',
          dateFacture: editingFacture.dateFacture ? 
            new Date(editingFacture.dateFacture).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0],
          dateEcheance: editingFacture.dateEcheance ? 
            new Date(editingFacture.dateEcheance).toISOString().split('T')[0] : '',
          categorieId: editingFacture.categorieId || '',
          bdcId: editingFacture.bdcId || '',
          commentaire: editingFacture.commentaire || '',
          numeroFacture: editingFacture.numeroFacture || ''
        });
        setAutoCalculTtc(false);
      } else {
        setFormData({
          fournisseur: '',
          montantHt: '',
          montantTtc: '',
          dateFacture: new Date().toISOString().split('T')[0],
          dateEcheance: '',
          categorieId: '',
          bdcId: '',
          commentaire: '',
          numeroFacture: ''
        });
        setAutoCalculTtc(true);
      }
      setErrors({});
    }
  }, [isOpen, editingFacture]);

  // Auto-sélection de catégorie basée sur le fournisseur
  useEffect(() => {
    if (formData.fournisseur && !formData.categorieId && categories.length > 0) {
      const categorieAuto = findCategorieAchatForFournisseur(formData.fournisseur, categories);
      if (categorieAuto) {
        setFormData(prev => ({ ...prev, categorieId: categorieAuto.id }));
        console.log(`🎯 [FACTURES-MODAL] Auto-sélection catégorie "${categorieAuto.intitule}" pour fournisseur "${formData.fournisseur}"`);
      }
    }
  }, [formData.fournisseur, categories]);

  // Calcul automatique du TTC
  useEffect(() => {
    if (autoCalculTtc && formData.montantHt) {
      const montantHt = parseFloat(formData.montantHt);
      if (!isNaN(montantHt)) {
        const montantTtc = Math.round(montantHt * 1.2 * 100) / 100;
        setFormData(prev => ({ ...prev, montantTtc: montantTtc.toString() }));
      }
    }
  }, [formData.montantHt, autoCalculTtc]);

  // Gestionnaire de changement des champs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Désactiver auto-calcul si l'utilisateur modifie manuellement le TTC
    if (field === 'montantTtc') {
      setAutoCalculTtc(false);
    }
  };

  // Association avec un BDC
  const handleBdcSelection = (bdcId) => {
    const bdc = bdcsDisponibles.find(b => b.id === bdcId);
    if (bdc) {
      setFormData(prev => ({
        ...prev,
        bdcId: bdcId,
        fournisseur: bdc.fournisseur,
        montantHt: bdc.montantHt?.toString() || '',
        categorieId: bdc.categorieId || prev.categorieId
      }));
      setAutoCalculTtc(true);
    } else {
      setFormData(prev => ({ ...prev, bdcId: '' }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fournisseur.trim()) {
      newErrors.fournisseur = 'Le fournisseur est obligatoire';
    }

    const montantHt = parseFloat(formData.montantHt);
    if (!formData.montantHt || isNaN(montantHt) || montantHt <= 0) {
      newErrors.montantHt = 'Le montant HT doit être supérieur à 0';
    }

    const montantTtc = parseFloat(formData.montantTtc);
    if (!formData.montantTtc || isNaN(montantTtc) || montantTtc <= 0) {
      newErrors.montantTtc = 'Le montant TTC doit être supérieur à 0';
    }

    if (!formData.dateFacture) {
      newErrors.dateFacture = 'La date de facture est obligatoire';
    }

    if (!formData.categorieId) {
      newErrors.categorieId = 'La catégorie est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    const submitData = {
      ...formData,
      montantHt: parseFloat(formData.montantHt),
      montantTtc: parseFloat(formData.montantTtc),
      dateFacture: new Date(formData.dateFacture),
      dateEcheance: formData.dateEcheance ? new Date(formData.dateEcheance) : null,
    };

    onSubmit(submitData);
  };

  // Fermeture du modal
  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  // Obtenir les infos de la catégorie sélectionnée
  const selectedCategory = categories.find(cat => cat.id === formData.categorieId);
  const selectedBdc = bdcsDisponibles.find(bdc => bdc.id === formData.bdcId);

  // Debug
  console.log('🔍 [FACTURES-MODAL] isOpen:', isOpen);
  console.log('🔍 [FACTURES-MODAL] categories:', categories.length);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingFacture ? 'Modifier la facture' : 'Nouvelle facture d\'achat'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {editingFacture ? 'Modification d\'une facture existante' : 'Création d\'une nouvelle facture fournisseur'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Corps du formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Info numéro de facture en édition */}
          {editingFacture && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Numéro de facture :</strong> {editingFacture.numeroFacture || editingFacture.numero}
                </p>
              </div>
            </div>
          )}

          {/* Association BDC optionnelle */}
          {bdcsDisponibles.length > 0 && (
            <div className="space-y-2">
              <Label>Associer à un bon de commande (optionnel)</Label>
              <Select 
                value={formData.bdcId} 
                onValueChange={handleBdcSelection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucun BDC associé" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun BDC associé</SelectItem>
                  {bdcsDisponibles.map(bdc => (
                    <SelectItem key={bdc.id} value={bdc.id}>
                      <div className="flex items-center gap-2">
                        <span>{bdc.numero}</span>
                        <Badge variant="outline" className="text-xs">
                          {bdc.fournisseur}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(bdc.montantHt)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBdc && (
                <p className="text-sm text-blue-600">
                  ℹ️ Les informations du BDC "{selectedBdc.numero}" ont été pré-remplies
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fournisseur */}
            <div className="space-y-2">
              <Label htmlFor="fournisseur">Fournisseur *</Label>
              <Input
                id="fournisseur"
                value={formData.fournisseur}
                onChange={(e) => handleInputChange('fournisseur', e.target.value)}
                placeholder="Nom du fournisseur"
                className={errors.fournisseur ? 'border-red-500' : ''}
                disabled={submitting}
              />
              {errors.fournisseur && (
                <p className="text-sm text-red-500">{errors.fournisseur}</p>
              )}
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <Label>Catégorie d'achat *</Label>
              <Select 
                value={formData.categorieId} 
                onValueChange={(value) => handleInputChange('categorieId', value)}
              >
                <SelectTrigger className={errors.categorieId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span>{category.intitule}</span>
                        {category.code && (
                          <Badge variant="outline" className="text-xs">
                            {category.code}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categorieId && (
                <p className="text-sm text-red-500">{errors.categorieId}</p>
              )}
              {selectedCategory && (
                <p className="text-sm text-gray-500">
                  💡 Auto-sélectionné pour ce type de fournisseur
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Montant HT */}
            <div className="space-y-2">
              <Label htmlFor="montantHt">Montant HT (€) *</Label>
              <Input
                id="montantHt"
                type="number"
                step="0.01"
                value={formData.montantHt}
                onChange={(e) => handleInputChange('montantHt', e.target.value)}
                placeholder="0.00"
                className={errors.montantHt ? 'border-red-500' : ''}
                disabled={submitting}
              />
              {errors.montantHt && (
                <p className="text-sm text-red-500">{errors.montantHt}</p>
              )}
            </div>

            {/* Montant TTC */}
            <div className="space-y-2">
              <Label htmlFor="montantTtc">Montant TTC (€) *</Label>
              <div className="relative">
                <Input
                  id="montantTtc"
                  type="number"
                  step="0.01"
                  value={formData.montantTtc}
                  onChange={(e) => handleInputChange('montantTtc', e.target.value)}
                  placeholder="0.00"
                  className={errors.montantTtc ? 'border-red-500' : ''}
                  disabled={submitting}
                />
                {autoCalculTtc && (
                  <div className="absolute right-2 top-2">
                    <Calculator className="w-4 h-4 text-green-500" title="Calcul automatique (TVA 20%)" />
                  </div>
                )}
              </div>
              {errors.montantTtc && (
                <p className="text-sm text-red-500">{errors.montantTtc}</p>
              )}
              {autoCalculTtc && (
                <p className="text-sm text-green-600">
                  🧮 Calcul automatique avec TVA 20%
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date de facture */}
            <div className="space-y-2">
              <Label htmlFor="dateFacture">Date de facture *</Label>
              <Input
                id="dateFacture"
                type="date"
                value={formData.dateFacture}
                onChange={(e) => handleInputChange('dateFacture', e.target.value)}
                className={errors.dateFacture ? 'border-red-500' : ''}
                disabled={submitting}
              />
              {errors.dateFacture && (
                <p className="text-sm text-red-500">{errors.dateFacture}</p>
              )}
            </div>

            {/* Date d'échéance */}
            <div className="space-y-2">
              <Label htmlFor="dateEcheance">Date d'échéance</Label>
              <Input
                id="dateEcheance"
                type="date"
                value={formData.dateEcheance}
                onChange={(e) => handleInputChange('dateEcheance', e.target.value)}
                disabled={submitting}
              />
              <p className="text-sm text-gray-500">Optionnel</p>
            </div>
          </div>

          {/* Commentaire */}
          <div className="space-y-2">
            <Label htmlFor="commentaire">Commentaire</Label>
            <Textarea
              id="commentaire"
              value={formData.commentaire}
              onChange={(e) => handleInputChange('commentaire', e.target.value)}
              placeholder="Description ou remarques sur cette facture..."
              rows={3}
              disabled={submitting}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              style={{
                backgroundColor: '#6b7c3d',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                fontSize: '13px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#556533'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7c3d'}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {editingFacture ? 'Modification...' : 'Création...'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {editingFacture ? 'Modifier' : 'Créer la facture'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FactureAchatModal; 