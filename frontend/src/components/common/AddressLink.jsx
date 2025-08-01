import React from 'react';
import { IconMapPin, IconRoute, IconExternalLink, IconBuilding } from '@tabler/icons-react';
import { 
  generateGoogleMapsLink, 
  generateGoogleMapsDirectionsLink, 
  formatAddress, 
  isAddressValid 
} from '@/utils/googleMapsUtils';

/**
 * Composant pour afficher une adresse avec des liens Google Maps
 * @param {Object} props
 * @param {Object} props.addressData - Données d'adresse
 * @param {boolean} props.showDirections - Afficher le lien pour les directions (défaut: true)
 * @param {boolean} props.showMapLink - Afficher le lien vers la carte (défaut: true)
 * @param {boolean} props.showIcon - Afficher l'icône de la carte (défaut: true)
 * @param {string} props.className - Classes CSS supplémentaires
 * @param {string} props.variant - Variante d'affichage ('default', 'compact', 'detailed')
 * @param {React.ReactNode} props.children - Contenu personnalisé
 */
const AddressLink = ({ 
  addressData, 
  showDirections = true, 
  showMapLink = true,
  showIcon = true,
  className = '',
  variant = 'default',
  children 
}) => {
  if (!isAddressValid(addressData)) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <IconMapPin className="w-4 h-4" />
        <span className="text-sm italic">Aucune adresse renseignée</span>
      </div>
    );
  }

  const formattedAddress = formatAddress(addressData);
  const mapsLink = generateGoogleMapsLink(addressData);
  const directionsLink = generateGoogleMapsDirectionsLink(addressData);

  const handleMapLinkClick = () => {
    if (mapsLink) {
      window.open(mapsLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDirectionsClick = () => {
    if (directionsLink) {
      window.open(directionsLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Variante compacte pour les listes
  if (variant === 'compact') {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-start gap-2">
          {showIcon && <IconMapPin className="w-3 h-3 text-current/70 mt-0.5 flex-shrink-0" />}
          <p className="text-xs break-words leading-tight">
            {formattedAddress}
          </p>
        </div>
        
        <div className="flex items-center gap-2 ml-5">
          {showMapLink && mapsLink && (
            <button
              onClick={handleMapLinkClick}
              className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
              title="Voir sur Google Maps"
            >
              <IconExternalLink className="w-2.5 h-2.5" />
              Carte
            </button>
          )}
          
          {showDirections && directionsLink && (
            <button
              onClick={handleDirectionsClick}
              className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
              title="Obtenir l'itinéraire"
            >
              <IconRoute className="w-2.5 h-2.5" />
              Itinéraire
            </button>
          )}
        </div>
      </div>
    );
  }

  // Variante détaillée pour les pages de détails
  if (variant === 'detailed') {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800 ${className}`}>
        {/* En-tête avec icône */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <IconBuilding className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Adresse du chantier</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Localisation du projet</p>
          </div>
        </div>

        {/* Adresse formatée */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3 border border-gray-100 dark:border-gray-700">
          <div className="flex items-start gap-3">
            {showIcon && <IconMapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />}
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                {formattedAddress}
              </p>
              
              {/* Coordonnées GPS si disponibles */}
              {addressData.latitude && addressData.longitude && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-mono">
                    📍 {addressData.latitude.toFixed(6)}, {addressData.longitude.toFixed(6)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Boutons d'action stylisés */}
        <div className="flex flex-wrap gap-3">
          {showMapLink && mapsLink && (
            <button
              onClick={handleMapLinkClick}
              className="flex-1 min-w-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              title="Voir sur Google Maps"
            >
              <IconExternalLink className="w-4 h-4" />
              Voir sur la carte
            </button>
          )}
          
          {showDirections && directionsLink && (
            <button
              onClick={handleDirectionsClick}
              className="flex-1 min-w-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              title="Obtenir l'itinéraire"
            >
              <IconRoute className="w-4 h-4" />
              Itinéraire
            </button>
          )}
        </div>

        {/* Contenu personnalisé */}
        {children}
      </div>
    );
  }

  // Variante par défaut
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Adresse principale */}
      <div className="flex items-start gap-3">
        {showIcon && <IconMapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 dark:text-white font-medium break-words leading-relaxed">
            {formattedAddress}
          </p>
          
          {/* Coordonnées GPS si disponibles */}
          {addressData.latitude && addressData.longitude && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
              📍 {addressData.latitude.toFixed(6)}, {addressData.longitude.toFixed(6)}
            </p>
          )}
        </div>
      </div>

      {/* Liens d'action */}
      <div className="flex items-center gap-4 ml-8">
        {showMapLink && mapsLink && (
          <button
            onClick={handleMapLinkClick}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-md transition-all"
            title="Voir sur Google Maps"
          >
            <IconExternalLink className="w-4 h-4" />
            Voir sur la carte
          </button>
        )}
        
        {showDirections && directionsLink && (
          <button
            onClick={handleDirectionsClick}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 rounded-md transition-all"
            title="Obtenir l'itinéraire"
          >
            <IconRoute className="w-4 h-4" />
            Itinéraire
          </button>
        )}
      </div>

      {/* Contenu personnalisé */}
      {children}
    </div>
  );
};

export default AddressLink; 