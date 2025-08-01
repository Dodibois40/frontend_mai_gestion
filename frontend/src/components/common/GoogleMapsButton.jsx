import React from 'react';
import { IconMapPin, IconRoute } from '@tabler/icons-react';
import { 
  generateGoogleMapsLink, 
  generateGoogleMapsDirectionsLink, 
  isAddressValid 
} from '@/utils/googleMapsUtils';

/**
 * Composant bouton compact pour les liens Google Maps
 * @param {Object} props
 * @param {Object} props.addressData - Données d'adresse
 * @param {string} props.type - Type de lien ('map' ou 'directions')
 * @param {string} props.size - Taille du bouton ('sm', 'md', 'lg')
 * @param {string} props.variant - Variante du bouton ('primary', 'secondary', 'ghost')
 * @param {string} props.className - Classes CSS supplémentaires
 */
const GoogleMapsButton = ({ 
  addressData, 
  type = 'map',
  size = 'sm',
  variant = 'ghost',
  className = ''
}) => {
  if (!isAddressValid(addressData)) {
    return null;
  }

  const link = type === 'directions' 
    ? generateGoogleMapsDirectionsLink(addressData)
    : generateGoogleMapsLink(addressData);

  if (!link) return null;

  const handleClick = () => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const Icon = type === 'directions' ? IconRoute : IconMapPin;
  
  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500',
    ghost: 'text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/20'
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center rounded-lg transition-all duration-200
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        ${className}
      `}
      title={type === 'directions' ? 'Obtenir l\'itinéraire' : 'Voir sur Google Maps'}
    >
      <Icon className={iconSize[size]} />
    </button>
  );
};

export default GoogleMapsButton; 