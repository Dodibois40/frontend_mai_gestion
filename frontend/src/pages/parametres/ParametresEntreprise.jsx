import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { IconBuilding, IconSave, IconRefresh, IconEdit, IconCheck, IconX } from '@tabler/icons-react';

const ParametresEntreprise = () => {
  const [parametres, setParametres] = useState({
    ENTREPRISE_NOM: '',
    ENTREPRISE_ADRESSE: '',
    ENTREPRISE_TEL: '',
    ENTREPRISE_EMAIL: '',
    ENTREPRISE_SIRET: '',
    ENTREPRISE_CODE_POSTAL: '',
    ENTREPRISE_VILLE: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [editingParam, setEditingParam] = useState(null);
  const [tempValue, setTempValue] = useState('');

  // Charger les paramètres d'entreprise
  const loadParametres = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth' + '_token');
      const response = await fetch('/api/parametres', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erreur de chargement');
      
      const data = await response.json();
      const parametresMap = {};
      
      // Créer un map des paramètres existants
      data.forEach(param => {
        if (param.cle.startsWith('ENTREPRISE_')) {
          parametresMap[param.cle] = param.valeur || '';
        }
      });
      
      setParametres(prev => ({
        ...prev,
        ...parametresMap
      }));
      
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder un paramètre
  const saveParametre = async (cle, valeur) => {
    try {
      const token = localStorage.getItem('auth' + '_token');
      const response = await fetch('/api/parametres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cle: cle,
          valeur: valeur,
          description: getDescriptionForKey(cle)
        })
      });

      if (!response.ok) throw new Error('Erreur de sauvegarde');
      
      setParametres(prev => ({
        ...prev,
        [cle]: valeur
      }));
      
      toast.success(`${getDisplayName(cle)} mis à jour !`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
      return false;
    }
  };

  // Démarrer l'édition
  const startEditing = (key) => {
    setEditingParam(key);
    setTempValue(parametres[key] || '');
  };

  // Confirmer l'édition
  const confirmEdit = async () => {
    if (await saveParametre(editingParam, tempValue)) {
      setEditingParam(null);
      setTempValue('');
    }
  };

  // Annuler l'édition
  const cancelEdit = () => {
    setEditingParam(null);
    setTempValue('');
  };

  // Initialiser les paramètres d'entreprise par défaut
  const initializeDefaults = async () => {
    setIsLoading(true);
    try {
      const defaultParams = [
        { cle: 'ENTREPRISE_NOM', valeur: 'MAI GESTION', description: 'Nom de l\'entreprise' },
        { cle: 'ENTREPRISE_ADRESSE', valeur: '', description: 'Adresse de l\'entreprise' },
        { cle: 'ENTREPRISE_TEL', valeur: '', description: 'Téléphone de l\'entreprise' },
        { cle: 'ENTREPRISE_EMAIL', valeur: '', description: 'Email de l\'entreprise' },
        { cle: 'ENTREPRISE_SIRET', valeur: '', description: 'Numéro SIRET' },
        { cle: 'ENTREPRISE_CODE_POSTAL', valeur: '', description: 'Code postal' },
        { cle: 'ENTREPRISE_VILLE', valeur: '', description: 'Ville' }
      ];

      for (const param of defaultParams) {
        const token = localStorage.getItem('auth' + '_token');
        await fetch('/api/parametres', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(param)
        });
      }

      await loadParametres();
      toast.success('Paramètres d\'entreprise initialisés !');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      toast.error('Erreur lors de l\'initialisation');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonctions utilitaires
  const getDisplayName = (key) => {
    const names = {
      'ENTREPRISE_NOM': 'Nom de l\'entreprise',
      'ENTREPRISE_ADRESSE': 'Adresse',
      'ENTREPRISE_TEL': 'Téléphone',
      'ENTREPRISE_EMAIL': 'Email',
      'ENTREPRISE_SIRET': 'SIRET',
      'ENTREPRISE_CODE_POSTAL': 'Code postal',
      'ENTREPRISE_VILLE': 'Ville'
    };
    return names[key] || key;
  };

  const getDescriptionForKey = (key) => {
    const descriptions = {
      'ENTREPRISE_NOM': 'Nom de l\'entreprise affiché sur les documents',
      'ENTREPRISE_ADRESSE': 'Adresse complète de l\'entreprise',
      'ENTREPRISE_TEL': 'Numéro de téléphone principal',
      'ENTREPRISE_EMAIL': 'Adresse email de contact',
      'ENTREPRISE_SIRET': 'Numéro SIRET de l\'entreprise',
      'ENTREPRISE_CODE_POSTAL': 'Code postal',
      'ENTREPRISE_VILLE': 'Ville de l\'entreprise'
    };
    return descriptions[key] || '';
  };

  const getPlaceholder = (key) => {
    const placeholders = {
      'ENTREPRISE_NOM': 'Ex: MAI GESTION',
      'ENTREPRISE_ADRESSE': 'Ex: 123 Rue de la République',
      'ENTREPRISE_TEL': 'Ex: 01 23 45 67 89',
      'ENTREPRISE_EMAIL': 'Ex: contact@mai-gestion.fr',
      'ENTREPRISE_SIRET': 'Ex: 12345678901234',
      'ENTREPRISE_CODE_POSTAL': 'Ex: 75001',
      'ENTREPRISE_VILLE': 'Ex: Paris'
    };
    return placeholders[key] || '';
  };

  useEffect(() => {
    loadParametres();
  }, []);

  return (
    <div className="p-6 md:p-8 lg:p-10 bg-stone-50 min-h-screen">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IconBuilding className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paramètres Entreprise</h1>
              <p className="text-gray-600">Configuration des informations de votre entreprise</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={loadParametres}
              variant="outline"
              disabled={isLoading}
            >
              <IconRefresh className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            
            <Button 
              onClick={initializeDefaults}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Initialiser les paramètres manquants
            </Button>
          </div>
        </div>

        {/* Informations importantes */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <IconBuilding className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">📋 Utilisation de ces paramètres</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ces informations apparaîtront sur tous vos <strong>bons de commande PDF</strong></li>
                  <li>• Elles remplacent les valeurs par défaut dans les documents officiels</li>
                  <li>• Assurez-vous que toutes les informations sont correctes et à jour</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres d'entreprise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBuilding className="w-5 h-5" />
              Informations de l'entreprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(parametres).map((key) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="text-sm font-medium text-gray-700">
                    {getDisplayName(key)}
                  </Label>
                  
                  <div className="flex items-center gap-2">
                    {editingParam === key ? (
                      <>
                        <Input
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          placeholder={getPlaceholder(key)}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={confirmEdit}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <IconCheck className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                        >
                          <IconX className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm min-h-[40px] flex items-center">
                          {parametres[key] || (
                            <span className="text-gray-400 italic">
                              {getPlaceholder(key)}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(key)}
                        >
                          <IconEdit className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    {getDescriptionForKey(key)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preview section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📄 Aperçu sur les documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Aperçu sur un bon de commande :
              </h4>
              <div className="text-sm text-gray-700 space-y-1">
                <div className="font-semibold">
                  {parametres.ENTREPRISE_NOM || 'MAI GESTION'}
                </div>
                {parametres.ENTREPRISE_ADRESSE && (
                  <div>{parametres.ENTREPRISE_ADRESSE}</div>
                )}
                {(parametres.ENTREPRISE_CODE_POSTAL || parametres.ENTREPRISE_VILLE) && (
                  <div>
                    {parametres.ENTREPRISE_CODE_POSTAL} {parametres.ENTREPRISE_VILLE}
                  </div>
                )}
                {parametres.ENTREPRISE_TEL && (
                  <div>Tél: {parametres.ENTREPRISE_TEL}</div>
                )}
                {parametres.ENTREPRISE_EMAIL && (
                  <div>Email: {parametres.ENTREPRISE_EMAIL}</div>
                )}
                {parametres.ENTREPRISE_SIRET && (
                  <div>SIRET: {parametres.ENTREPRISE_SIRET}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParametresEntreprise; 