import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  IconFileInvoice,
  IconPlus,
  IconCheck,
  IconX,
  IconEye,
  IconEdit,
  IconTrash,
  IconLoader,
  IconAlertCircle,
  IconFile,
  IconUpload,
  IconCircleCheck,
  IconCircleX
} from '@tabler/icons-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import PdfUpload from '../ui/pdf-upload';
import PdfPreviewModal from '../ui/pdf-preview-modal';
import SmartPdfViewer from '../ui/SmartPdfViewer';
import devisService from '../../services/devisService';
import { affairesService } from '../../services/affairesService';

const AffaireDevis = ({ affaireId, onDevisValidated, onDevisChanged }) => {
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    libelle: '',
    description: '',
    montantHt: '',
    dateValidite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    commentaire: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    devisId: null,
    devisInfo: null
  });

  useEffect(() => {
    fetchDevis();
  }, [affaireId]);

  const fetchDevis = async () => {
    try {
      setLoading(true);
      const response = await devisService.getDevisByAffaire(affaireId);
      setDevis(response.data || response || []);
    } catch (error) {
      console.error('Erreur lors du chargement des devis:', error);
      toast.error('Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.libelle.trim()) {
      toast.error('Le libellé est obligatoire');
      return;
    }
    
    if (!formData.montantHt || parseFloat(formData.montantHt) <= 0) {
      toast.error('Le montant HT doit être supérieur à 0');
      return;
    }

    try {
      setSubmitting(true);
      
      const devisData = {
        libelle: formData.libelle.trim(),
        description: formData.description.trim(),
        montantHt: parseFloat(formData.montantHt),
        dateValidite: new Date(formData.dateValidite),
        affaireId: affaireId,
        commentaire: formData.commentaire?.trim() || ''
      };

      await devisService.createDevis(devisData);
      toast.success('Devis créé avec succès');
      
      // Reset form
      setFormData({
        libelle: '',
        description: '',
        montantHt: '',
        dateValidite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        commentaire: ''
      });
      setShowForm(false);
      
      // Refresh devis list
      fetchDevis();
      
      // Notifier le parent que les devis ont changé
      if (onDevisChanged) {
        onDevisChanged();
      }
    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
      toast.error('Erreur lors de la création du devis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidateDevis = async (devisId) => {
    try {
      await devisService.updateStatutDevis(devisId, 'VALIDE');
      toast.success('Devis validé avec succès');
      fetchDevis();
      
      // Recalculer les données réelles de l'affaire
      if (onDevisValidated) {
        onDevisValidated();
      }
      
      // Notifier le parent que les devis ont changé
      if (onDevisChanged) {
        onDevisChanged();
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      toast.error('Erreur lors de la validation du devis');
    }
  };

  const handleRejectDevis = async (devisId) => {
    try {
      await devisService.updateStatutDevis(devisId, 'REFUSE');
      toast.success('Devis refusé');
      fetchDevis();
      
      // Notifier le parent que les devis ont changé
      if (onDevisChanged) {
        onDevisChanged();
      }
    } catch (error) {
      console.error('Erreur lors du refus:', error);
      toast.error('Erreur lors du refus du devis');
    }
  };

  const handleRealiseDevis = async (devisId) => {
    try {
      await devisService.updateStatutDevis(devisId, 'REALISE');
      toast.success('Devis marqué comme réalisé - Avancement mis à jour');
      fetchDevis();
      
      // Notifier le parent que les devis ont changé (pour recalculer l'avancement)
      if (onDevisChanged) {
        onDevisChanged();
      }
    } catch (error) {
      console.error('Erreur lors du marquage réalisé:', error);
      toast.error('Erreur lors du marquage du devis comme réalisé');
    }
  };

  const handleDeleteDevis = async (devisId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      try {
        await devisService.deleteDevis(devisId);
        toast.success('Devis supprimé avec succès');
        fetchDevis();
        
        // Notifier le parent que les devis ont changé
        if (onDevisChanged) {
          onDevisChanged();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression du devis');
      }
    }
  };

  const handlePreviewPdf = (devisItem) => {
    setPreviewModal({
      isOpen: true,
      devisId: devisItem.id,
      devisInfo: {
        numero: devisItem.numero,
        libelle: devisItem.libelle
      }
    });
  };

  const closePreviewModal = () => {
    setPreviewModal({
      isOpen: false,
      devisId: null,
      devisInfo: null
    });
  };

  const getStatutBadge = (statut) => {
    const config = {
      'EN_ATTENTE_VALIDATION': { color: 'bg-amber-100 text-amber-800', text: 'En attente' },
      'VALIDE': { color: 'bg-green-100 text-green-800', text: 'Validé' },
      'REALISE': { color: 'bg-sky-100 text-sky-800', text: 'Réalisé' },
      'REFUSE': { color: 'bg-red-100 text-red-800', text: 'Refusé' },
      'EXPIRE': { color: 'bg-stone-100 text-stone-800', text: 'Expiré' }
    };
    
    const style = config[statut] || config['EN_ATTENTE_VALIDATION'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.color}`}>
        {style.text}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('fr-FR');
  };

  const getTotalValidatedAmount = () => {
    return devis
      .filter(d => d.statut === 'VALIDE' || d.statut === 'REALISE')
      .reduce((total, d) => total + (d.montantHt || 0), 0);
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-lg flex items-center justify-center h-64">
        <IconLoader className="w-8 h-8 animate-spin text-amber-500" />
        <p className="ml-4 text-lg text-stone-700">Chargement des devis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <IconFileInvoice className="w-7 h-7 text-amber-600" />
          Devis ({devis.length})
        </h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-amber-600 hover:bg-amber-700 text-white">
          <IconPlus className="w-4 h-4 mr-2" />
          {showForm ? 'Annuler' : 'Nouveau devis'}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Créer un nouveau devis</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="libelle" className="block text-sm font-medium text-stone-700 mb-1">Libellé *</label>
                  <Input id="libelle" name="libelle" value={formData.libelle} onChange={handleInputChange} required />
                </div>
                <div>
                  <label htmlFor="montantHt" className="block text-sm font-medium text-stone-700 mb-1">Montant HT *</label>
                  <Input id="montantHt" name="montantHt" type="number" step="0.01" value={formData.montantHt} onChange={handleInputChange} required />
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dateValidite" className="block text-sm font-medium text-stone-700 mb-1">Date de validité</label>
                  <Input id="dateValidite" name="dateValidite" type="date" value={formData.dateValidite} onChange={handleInputChange} />
                </div>
                <div>
                  <label htmlFor="commentaire" className="block text-sm font-medium text-stone-700 mb-1">Commentaire</label>
                  <Input id="commentaire" name="commentaire" value={formData.commentaire} onChange={handleInputChange} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white" disabled={submitting}>
                  {submitting ? <IconLoader className="w-4 h-4 animate-spin" /> : 'Créer le devis'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex justify-between items-center">
        <p className="text-amber-800 font-medium">Total validé :</p>
        <p className="text-2xl font-bold text-amber-900">{formatCurrency(getTotalValidatedAmount())}</p>
      </div>

      {devis.length === 0 && !loading && (
         <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
           <IconFileInvoice className="mx-auto h-12 w-12 text-stone-400" />
           <h3 className="mt-2 text-sm font-medium text-stone-900">Aucun devis</h3>
           <p className="mt-1 text-sm text-stone-500">Commencez par créer un nouveau devis.</p>
         </div>
      )}

      <div className="space-y-4">
        {devis.map(d => (
          <Card key={d.id} className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Section PDF */}
                <div className="md:w-1/3">
                  <h4 className="text-sm font-semibold text-stone-600 mb-2">Fichier PDF du devis</h4>
                  {d.fichierPdf ? (
                    <div className="relative group cursor-pointer" onClick={() => handlePreviewPdf(d)}>
                      <div className="w-full h-48 flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-lg">
                        <IconFileInvoice className="w-16 h-16 text-stone-400" />
                        <p className="mt-2 text-sm font-semibold text-stone-700 truncate px-4">{d.nomFichier}</p>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300 rounded-lg">
                        <IconEye className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-300" />
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-stone-300 rounded-2xl p-4 text-center h-full flex flex-col justify-center">
                        <IconFile className="mx-auto h-10 w-10 text-stone-400" />
                        <p className="mt-2 text-sm text-stone-500">Aucun fichier associé</p>
                        <PdfUpload
                          affaireId={affaireId}
                          devisId={d.id}
                          apiService={devisService}
                          onFileUploaded={() => {
                            toast.success('Fichier PDF uploadé avec succès!');
                            fetchDevis();
                            if (onDevisChanged) onDevisChanged();
                          }}
                        >
                          <Button variant="link" className="mt-2 text-amber-600 hover:text-amber-700">
                            <IconUpload className="w-4 h-4 mr-1"/>
                            Uploader maintenant
                          </Button>
                        </PdfUpload>
                    </div>
                  )}
                </div>
                
                {/* Section Infos */}
                <div className="md:w-2/3 md:pl-6">
                  <div className="flex justify-between items-start">
                      <div>
                         <h3 className="text-lg font-bold text-stone-800">{d.numero} - {d.libelle}</h3>
                         <p className="text-sm text-stone-500">{d.description}</p>
                      </div>
                      {getStatutBadge(d.statut)}
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 my-4 text-sm">
                    <div>
                      <p className="text-stone-500">Montant HT</p>
                      <p className="font-semibold text-stone-800 text-base">{formatCurrency(d.montantHt)}</p>
                    </div>
                    <div>
                      <p className="text-stone-500">Validité</p>
                      <p className="font-semibold text-stone-800">{formatDate(d.dateValidite)}</p>
                    </div>
                     <div>
                      <p className="text-stone-500">Créé le</p>
                      <p className="font-semibold text-stone-800">{formatDate(d.dateCreation)}</p>
                    </div>
                    {d.nomFichier && (
                      <div>
                        <p className="text-stone-500">Fichier PDF</p>
                        <p className="font-semibold text-stone-800 truncate">{d.nomFichier}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Boutons d'action */}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-stone-200">
                      {d.statut === 'VALIDE' && (
                           <Button onClick={() => handleRealiseDevis(d.id)} size="sm" className="bg-sky-600 hover:bg-sky-700 text-white">
                             <IconCheck className="w-4 h-4 mr-2" />
                             Marquer réalisé
                           </Button>
                      )}
                      {d.statut === 'EN_ATTENTE_VALIDATION' && (
                        <>
                          <Button onClick={() => handleValidateDevis(d.id)} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            <IconCircleCheck className="w-4 h-4 mr-2" />
                            Valider
                          </Button>
                          <Button onClick={() => handleRejectDevis(d.id)} size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-100 hover:text-red-800">
                            <IconCircleX className="w-4 h-4 mr-2" />
                            Refuser
                          </Button>
                        </>
                      )}
                      <Button onClick={() => handlePreviewPdf(d)} size="icon" variant="ghost" className="text-stone-500 hover:bg-stone-100 hover:text-stone-800" disabled={!d.fichierPdf}>
                         <IconEye className="w-5 h-5" />
                       </Button>
                      <Button onClick={() => handleDeleteDevis(d.id)} size="icon" variant="ghost" className="text-red-600 hover:bg-red-100 hover:text-red-700">
                        <IconTrash className="w-5 h-5" />
                      </Button>
                  </div>

                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PdfPreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreviewModal}
        devisId={previewModal.devisId}
        devisInfo={previewModal.devisInfo}
      />
    </div>
  );
};

export default AffaireDevis; 