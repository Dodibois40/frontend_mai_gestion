import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  IconArrowLeft,
  IconDeviceFloppy,
  IconBriefcase
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { affairesService } from '@/services/affairesService';
import GooglePlacesAutocomplete from '@/components/common/GooglePlacesAutocomplete';
import AddressFields from '@/components/common/AddressFields';
import { validateAffaire } from '@/utils/affaires';

const Section = ({ title, children }) => (
  <div className="p-6 rounded-lg bg-card text-card-foreground shadow-sm">
    <h2 className="text-xl font-bold mb-4 text-primary">{title}</h2>
    {children}
  </div>
);

const AffaireForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    numero: '',
    libelle: '',
    client: '',
    adresse: '',
    rue: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    latitude: null,
    longitude: null
  });

  const fetchAffaire = useCallback(async () => {
    if (!isEdit) return;
    try {
      setLoading(true);
      const affaire = await affairesService.getAffaireById(id);
      setFormData({
        numero: affaire.numero || '',
        libelle: affaire.libelle || '',
        client: affaire.client || '',
        adresse: affaire.adresse || '',
        rue: affaire.rue || '',
        codePostal: affaire.codePostal || '',
        ville: affaire.ville || '',
        pays: affaire.pays || 'France',
        latitude: affaire.latitude || null,
        longitude: affaire.longitude || null
      });
    } catch (error) {
      toast.error("Erreur lors du chargement de l'affaire.");
      navigate('/affaires');
    } finally {
      setLoading(false);
    }
  }, [id, isEdit, navigate]);

  useEffect(() => {
    fetchAffaire();
  }, [fetchAffaire]);


  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = (addressData) => {
    setFormData(prev => ({ ...prev, ...addressData }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dataForValidation = {
        ...formData,
    };
    
    const { isValid, errors: validationErrors } = validateAffaire(dataForValidation);
    
    if (!isValid) {
      setErrors(validationErrors);
      toast.error('Certains champs sont incorrects ou manquants.');
      return;
    }
    
    setErrors({});
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        // Valeurs par défaut pour les champs supprimés
        objectifCaHt: 0, // Sera défini dans le module d'estimation
        dateCommencement: null, // Sera défini dans le module d'estimation
        dateCloturePrevue: null, // Sera défini dans le module d'estimation
        statut: 'PLANIFIEE', // Statut par défaut
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        adresse: formData.adresse?.trim() || null,
        rue: formData.rue?.trim() || null,
        codePostal: formData.codePostal?.trim() || null,
        ville: formData.ville?.trim() || null,
        pays: formData.pays?.trim() || null,
      };

      console.log('Données à envoyer:', dataToSubmit);

      if (isEdit) {
        await affairesService.updateAffaire(id, dataToSubmit);
        toast.success('Affaire modifiée avec succès.');
      } else {
        await affairesService.createAffaire(dataToSubmit);
        toast.success('Affaire créée avec succès.');
      }
      navigate('/affaires');
    } catch (error) {
      console.error('Erreur détaillée:', error);
      console.error('Réponse du serveur:', error.response?.data);
      console.error('Statut de l\'erreur:', error.response?.status);
      toast.error("Erreur lors de la sauvegarde de l'affaire.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <div className="p-8">Chargement de l'affaire...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-lg bg-primary/10">
            <IconBriefcase className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEdit ? "Modifier l'affaire" : "Créer une nouvelle affaire"}
            </h1>
            <p className="text-muted-foreground">
              Remplissez les informations ci-dessous pour {isEdit ? "mettre à jour" : "créer"} une affaire.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Informations Générales">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero">Numéro d'affaire</Label>
                <Input id="numero" name="numero" value={isEdit ? formData.numero : "Généré automatiquement"} readOnly disabled />
              </div>
              <div>
                <Label htmlFor="libelle">Libellé de l'affaire *</Label>
                <Input id="libelle" name="libelle" value={formData.libelle} onChange={handleChange} />
                {errors.libelle && <p className="text-destructive text-sm mt-1">{errors.libelle}</p>}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="client">Client *</Label>
                <Input id="client" name="client" value={formData.client} onChange={handleChange} />
                {errors.client && <p className="text-destructive text-sm mt-1">{errors.client}</p>}
              </div>
            </div>
          </Section>

          <Section title="Adresse du chantier">
            <div className="space-y-4">
              <GooglePlacesAutocomplete onAddressSelect={handleAddressSelect} initialValue={formData.adresse} />
              <AddressFields addressData={formData} onAddressChange={(d) => setFormData(p => ({...p, ...d}))} errors={errors} />
            </div>
          </Section>
          
          

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={loading}>
              <IconArrowLeft size={16} className="mr-2" />
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-olive-700 hover:bg-olive-600 text-white font-bold">
              <IconDeviceFloppy size={16} className="mr-2" />
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AffaireForm; 