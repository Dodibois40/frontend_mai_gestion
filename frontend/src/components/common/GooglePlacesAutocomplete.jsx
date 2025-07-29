import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { IconMapPin, IconLoader } from '@tabler/icons-react';

const GooglePlacesAutocomplete = ({ 
  onAddressSelect, 
  initialValue = '', 
  placeholder = "Tapez l'adresse du chantier...",
  className = '',
  error = null 
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Configuration Google Maps API
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'VOTRE_CLE_API', // À configurer
    version: 'weekly',
    libraries: ['places']
  });

  useEffect(() => {
    const initAutocomplete = async () => {
      // Vérifier si on a une vraie clé API
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === 'VOTRE_CLE_API') {
        console.info('Google Maps API désactivée : clé API non configurée');
        return;
      }

      try {
        await loader.load();
        
        if (inputRef.current && window.google) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ['address'],
              componentRestrictions: { country: 'fr' }, // Limiter à la France
              fields: [
                'address_components',
                'formatted_address',
                'geometry.location',
                'place_id'
              ]
            }
          );

          autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de Google Maps API:', error);
      }
    };

    initAutocomplete();

    return () => {
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    
    if (!place.address_components) {
      console.warn('Aucun détail d\'adresse disponible');
      return;
    }

    // Parser les composants de l'adresse
    const addressComponents = parseAddressComponents(place.address_components);
    
    const addressData = {
      ...addressComponents,
      adresse: place.formatted_address,
      latitude: place.geometry?.location?.lat(),
      longitude: place.geometry?.location?.lng(),
      placeId: place.place_id
    };

    setInputValue(place.formatted_address);
    setShowSuggestions(false);
    
    if (onAddressSelect) {
      onAddressSelect(addressData);
    }
  };

  const parseAddressComponents = (components) => {
    const result = {
      rue: '',
      codePostal: '',
      ville: '',
      pays: ''
    };

    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        result.rue = component.long_name + ' ';
      } else if (types.includes('route')) {
        result.rue += component.long_name;
      } else if (types.includes('postal_code')) {
        result.codePostal = component.long_name;
      } else if (types.includes('locality')) {
        result.ville = component.long_name;
      } else if (types.includes('country')) {
        result.pays = component.long_name;
      }
    });

    return result;
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Petit délai pour permettre la sélection d'une suggestion
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors ${
            error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          } ${className}`}
        />
        
        {/* Icône */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <IconLoader className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <IconMapPin className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <IconMapPin className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Indication API Key manquante */}
      {(!import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY === 'VOTRE_CLE_API') && (
        <div className="mt-1 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs">
          <p className="text-amber-700 dark:text-amber-300 font-medium">
            💡 Mode saisie manuelle
          </p>
          <p className="text-amber-600 dark:text-amber-400">
            L'auto-complétion Google Maps n'est pas activée. Vous pouvez saisir l'adresse manuellement.
          </p>
        </div>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete; 