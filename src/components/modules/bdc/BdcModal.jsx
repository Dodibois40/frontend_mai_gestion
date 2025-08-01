import React from 'react';
import { Modal, TextInput, NumberInput, Select, Textarea, Button, Group, Stack, Divider } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { toast } from 'sonner';
import { findCategorieAchatForFournisseur } from '../../../utils/fournisseurCategories';

/**
 * Modal de formulaire réutilisable pour les BDC
 * Gérer la création et modification des bons de commande
 * Thème vert olive appliqué
 */
const BdcModal = ({
  opened,
  onClose,
  onSubmit,
  editingBdc = null,
  categories = [],
  fournisseurs = [],
  submitting = false,
  title = "Nouveau BDC"
}) => {
  // Formulaire pour les BDC
  const form = useForm({
    initialValues: {
      fournisseur: editingBdc?.fournisseur || '',
      montantHt: editingBdc?.montantHt || 0,
      dateBdc: editingBdc?.dateBdc ? new Date(editingBdc.dateBdc) : new Date(),
      dateLivraison: editingBdc?.dateLivraison ? new Date(editingBdc.dateLivraison) : null,
      categorieId: editingBdc?.categorieId || '',
      commentaire: editingBdc?.commentaire || ''
    },
    validate: {
      fournisseur: (value) => !value ? 'Le fournisseur est obligatoire' : null,
      montantHt: (value) => value && value < 0 ? 'Le montant ne peut pas être négatif' : null, // ✅ Rendu optionnel
      categorieId: (value) => !value ? 'La catégorie est obligatoire' : null
    }
  });

  // Réinitialiser le formulaire quand on change de BDC
  React.useEffect(() => {
    if (editingBdc) {
      form.setValues({
        fournisseur: editingBdc.fournisseur || '',
        montantHt: editingBdc.montantHt || 0,
        dateBdc: editingBdc.dateBdc ? new Date(editingBdc.dateBdc) : new Date(),
        dateLivraison: editingBdc.dateLivraison ? new Date(editingBdc.dateLivraison) : null,
        categorieId: editingBdc.categorieId || '',
        commentaire: editingBdc.commentaire || ''
      });
    } else {
      form.reset();
    }
  }, [editingBdc]);

  // Gérer la soumission du formulaire
  const handleSubmit = (values) => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  // Gérer la fermeture du modal
  const handleClose = () => {
    form.reset();
    if (onClose) {
      onClose();
    }
  };

  // Gérer le changement de fournisseur avec auto-sélection de catégorie
  const handleFournisseurChange = (value) => {
    console.log('🔄 [BDC-MODAL] Changement de fournisseur:', value);
    console.log('🔄 [BDC-MODAL] Fournisseurs disponibles:', fournisseurs?.length || 0);
    console.log('🔄 [BDC-MODAL] Catégories disponibles:', categories?.length || 0);
    
    form.setFieldValue('fournisseur', value);
    
    // Auto-sélection de la catégorie basée sur le fournisseur
    if (value && fournisseurs && categories) {
      const fournisseurSelectionne = fournisseurs.find(f => f.nom === value);
      console.log('🏢 [BDC-MODAL] Fournisseur trouvé:', fournisseurSelectionne);
      
      if (fournisseurSelectionne) {
        try {
          const categorieId = findCategorieAchatForFournisseur(fournisseurSelectionne, categories);
          console.log('🎯 [BDC-MODAL] Catégorie ID trouvée:', categorieId);
          
          if (categorieId) {
            form.setFieldValue('categorieId', categorieId);
            toast.success(`Catégorie automatiquement sélectionnée : ${fournisseurSelectionne.categorie}`);
            console.log('✅ [BDC-MODAL] Catégorie auto-sélectionnée avec succès');
          } else {
            console.log('❌ [BDC-MODAL] Aucune catégorie trouvée pour ce fournisseur');
            toast.info(`Aucune catégorie automatique trouvée pour ${fournisseurSelectionne.nom}`);
          }
        } catch (error) {
          console.error('❌ [BDC-MODAL] Erreur lors de la recherche de catégorie:', error);
        }
      } else {
        console.log('❌ [BDC-MODAL] Fournisseur non trouvé dans la liste');
      }
    } else {
      console.log('⚠️ [BDC-MODAL] Données manquantes pour l\'auto-sélection');
    }
  };

  // Données pour les selects
  const fournisseursData = fournisseurs?.map(fournisseur => ({ 
    value: fournisseur.nom, 
    label: fournisseur.nom,
    description: [
      fournisseur.categorie ? `Catégorie: ${fournisseur.categorie}` : null,
      fournisseur.contact ? `Contact: ${fournisseur.contact}` : null
    ].filter(Boolean).join(' • ')
  })) || [];

  const categoriesData = categories?.map(cat => ({ 
    value: cat.id.toString(), 
    label: cat.intitule || cat.nom || `Catégorie ${cat.id}` 
  })) || [];

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={editingBdc ? "Modifier le BDC" : title}
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          {/* Information sur le numéro BDC lors de la modification */}
          {editingBdc && (
            <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-sm text-primary-800">
                <strong>Numéro de BDC :</strong> {editingBdc.numero}
              </p>
            </div>
          )}

          {/* Sélection du fournisseur */}
          <Select
            label="Fournisseur"
            placeholder="Sélectionner un fournisseur"
            required
            searchable
            clearable
            data={fournisseursData}
            {...form.getInputProps('fournisseur')}
            onChange={handleFournisseurChange}
          />

          {/* Montant HT */}
          <NumberInput
            label="Montant HT (€)"
            placeholder="0.00"
            precision={2}
            min={0}
            required
            {...form.getInputProps('montantHt')}
          />

          {/* Date du BDC */}
          <DateInput
            label="Date du BDC"
            placeholder="Sélectionner une date"
            required
            {...form.getInputProps('dateBdc')}
          />

          {/* Date de livraison prévue */}
          <DateInput
            label="Date de livraison prévue"
            placeholder="Sélectionner la date de livraison"
            description="📅 Date à laquelle vous souhaitez recevoir la commande"
            minDate={new Date()} // Empêche de sélectionner une date passée
            styles={{
              input: {
                borderColor: form.values.dateLivraison && 
                  new Date(form.values.dateLivraison).toDateString() === new Date().toDateString() 
                  ? '#f59e0b' : undefined,
                borderWidth: form.values.dateLivraison && 
                  new Date(form.values.dateLivraison).toDateString() === new Date().toDateString() 
                  ? '2px' : undefined,
                backgroundColor: form.values.dateLivraison && 
                  new Date(form.values.dateLivraison).toDateString() === new Date().toDateString() 
                  ? '#fef3c7' : undefined
              }
            }}
            {...form.getInputProps('dateLivraison')}
          />

          {/* Catégorie */}
          <Select
            label="Catégorie"
            placeholder="Sélectionner une catégorie"
            required
            data={categoriesData}
            {...form.getInputProps('categorieId')}
          />

          {/* Commentaire */}
          <Textarea
            label="Commentaire"
            placeholder="Commentaire sur le BDC..."
            rows={3}
            {...form.getInputProps('commentaire')}
          />

          <Divider />

          {/* Informations automatiques */}
          {!editingBdc && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                ℹ️ Le numéro de BDC sera généré automatiquement au format : BDC-YYYY-XXX
              </p>
            </div>
          )}

          {/* Boutons d'action */}
          <Group position="right">
            <div
              onClick={handleClose}
              id="bouton-annuler-bdc-force-blanc"
              style={{
                backgroundColor: '#ffffff',
                background: '#ffffff',
                border: '1px solid #d1d5db',
                borderColor: '#d1d5db',
                color: '#374151',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                minHeight: '36px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
                boxSizing: 'border-box',
                transition: 'none',
                transform: 'none',
                filter: 'none',
                opacity: '1'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.background = '#ffffff';
                e.target.style.borderColor = '#d1d5db';
                e.target.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.background = '#ffffff';
                e.target.style.borderColor = '#d1d5db';
                e.target.style.color = '#374151';
              }}
            >
              Annuler
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bdc-submit-button"
              style={{
                backgroundColor: '#6b7c3d',
                border: 'none',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                minHeight: '36px',
                opacity: submitting ? 0.5 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.target.style.backgroundColor = '#556533';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.target.style.backgroundColor = '#6b7c3d';
                }
              }}
            >
              {submitting && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              )}
              {editingBdc ? 'Modifier' : 'Créer'}
            </button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default BdcModal; 