import React from 'react';
import { IconMapPin, IconBuilding, IconMapPin2, IconWorld } from '@tabler/icons-react';

const AddressFields = ({ 
  addressData, 
  onAddressChange, 
  errors = {}, 
  readOnly = false,
  showCoordinates = false 
}) => {
  const handleFieldChange = (field, value) => {
    if (onAddressChange) {
      onAddressChange({
        ...addressData,
        [field]: value
      });
    }
  };

  const inputClassName = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors ${
    readOnly ? 'bg-gray-50 dark:bg-gray-700 cursor-not-allowed' : ''
  }`;

  const getFieldClassName = (field) => {
    return `${inputClassName} ${
      errors[field] ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
    }`;
  };

  return (
    <div className="space-y-4">
      {/* Rue */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <IconMapPin className="w-4 h-4 inline mr-1" />
          Rue *
        </label>
        <input
          type="text"
          value={addressData?.rue || ''}
          onChange={(e) => handleFieldChange('rue', e.target.value)}
          placeholder="Ex: 123 Rue des Érables"
          className={getFieldClassName('rue')}
          readOnly={readOnly}
        />
        {errors.rue && (
          <p className="mt-1 text-sm text-red-600">{errors.rue}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Code Postal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <IconMapPin2 className="w-4 h-4 inline mr-1" />
            Code Postal *
          </label>
          <input
            type="text"
            value={addressData?.codePostal || ''}
            onChange={(e) => handleFieldChange('codePostal', e.target.value)}
            placeholder="Ex: 75000"
            maxLength="5"
            className={getFieldClassName('codePostal')}
            readOnly={readOnly}
          />
          {errors.codePostal && (
            <p className="mt-1 text-sm text-red-600">{errors.codePostal}</p>
          )}
        </div>

        {/* Ville */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <IconBuilding className="w-4 h-4 inline mr-1" />
            Ville *
          </label>
          <input
            type="text"
            value={addressData?.ville || ''}
            onChange={(e) => handleFieldChange('ville', e.target.value)}
            placeholder="Ex: Paris"
            className={getFieldClassName('ville')}
            readOnly={readOnly}
          />
          {errors.ville && (
            <p className="mt-1 text-sm text-red-600">{errors.ville}</p>
          )}
        </div>
      </div>

      {/* Pays */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <IconWorld className="w-4 h-4 inline mr-1" />
          Pays
        </label>
        <input
          type="text"
          value={addressData?.pays || 'France'}
          onChange={(e) => handleFieldChange('pays', e.target.value)}
          placeholder="France"
          className={getFieldClassName('pays')}
          readOnly={readOnly}
        />
        {errors.pays && (
          <p className="mt-1 text-sm text-red-600">{errors.pays}</p>
        )}
      </div>

      {/* Coordonnées GPS (optionnel) */}
      {showCoordinates && (addressData?.latitude || addressData?.longitude) && (
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Coordonnées GPS
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Latitude:</span>
              <span className="ml-2 font-mono">{addressData.latitude?.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Longitude:</span>
              <span className="ml-2 font-mono">{addressData.longitude?.toFixed(6)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Adresse complète (lecture seule) */}
      {addressData?.adresse && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
            Adresse complète
          </h4>
          <p className="text-sm text-blue-600 dark:text-blue-400">{addressData.adresse}</p>
        </div>
      )}
    </div>
  );
};

export default AddressFields; 