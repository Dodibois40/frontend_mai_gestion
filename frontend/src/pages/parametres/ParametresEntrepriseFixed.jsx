import React, { useState, useEffect } from 'react';

const ParametresEntrepriseFixed = () => {
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
      alert('Erreur lors du chargement des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder un paramètre
  const saveParametre = async (cle, valeur) => {
    try {
      const token = localStorage.getItem('auth' + '_token');
      
      // D'abord, chercher le paramètre par sa clé pour obtenir son ID
      const searchResponse = await fetch(`/api/parametres/key/${cle}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let response;
      if (searchResponse.ok) {
        // Le paramètre existe, on le met à jour
        const existingParam = await searchResponse.json();
        response = await fetch(`/api/parametres/${existingParam.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            valeur: valeur
          })
        });
      } else {
        // Le paramètre n'existe pas, on le crée
        response = await fetch('/api/parametres', {
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
      }

      if (!response.ok) throw new Error('Erreur de sauvegarde');
      
      setParametres(prev => ({
        ...prev,
        [cle]: valeur
      }));
      
      alert(`${getDisplayName(cle)} mis à jour !`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Paramètres Entreprise</h1>
          <p className="text-gray-600 mb-4">Configuration des informations de votre entreprise</p>
          
          <button 
            onClick={loadParametres}
            disabled={isLoading}
            className="mr-3 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            🔄 Actualiser
          </button>
        </div>

        {/* Informations importantes */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Utilisation de ces paramètres</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ces informations apparaîtront sur tous vos <strong>bons de commande PDF</strong></li>
            <li>• Elles remplacent les valeurs par défaut dans les documents officiels</li>
            <li>• Assurez-vous que toutes les informations sont correctes et à jour</li>
          </ul>
        </div>

        {/* Paramètres d'entreprise */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">🏢 Informations de l'entreprise</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(parametres).map((key) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {getDisplayName(key)}
                  </label>
                  
                  <div className="flex items-center gap-2">
                    {editingParam === key ? (
                      <>
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          placeholder={getPlaceholder(key)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={confirmEdit}
                          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          ✗
                        </button>
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
                        <button
                          onClick={() => startEditing(key)}
                          className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          ✏️
                        </button>
                      </>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    {getDescriptionForKey(key)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview section */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">📄 Aperçu sur les documents</h2>
          </div>
          <div className="p-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParametresEntrepriseFixed; 