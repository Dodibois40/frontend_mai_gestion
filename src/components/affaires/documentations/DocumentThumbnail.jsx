import React, { useState } from 'react';
import { IconFile, IconPhoto, IconFileText } from '@tabler/icons-react';
import documentationsService from '../../../services/documentationsService';

const DocumentThumbnail = ({ document, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Types de fichiers supportés pour les miniatures
  const supportedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
  const isImageSupported = supportedImageTypes.includes(document.type?.toLowerCase());

  // Obtenir l'icône de fallback selon le type
  const getFallbackIcon = () => {
    const iconProps = { className: "w-8 h-8 text-gray-400" };
    
    switch (document.type?.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <IconPhoto {...iconProps} />;
      case 'pdf':
        return <IconFileText {...iconProps} />;
      default:
        return <IconFile {...iconProps} />;
    }
  };

  if (!isImageSupported || imageError) {
    // Affichage fallback avec icône
    return (
      <div className={`flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg ${className}`}>
        {getFallbackIcon()}
      </div>
    );
  }

  const thumbnailUrl = documentationsService.getThumbnailUrl(document.id);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm border ${className}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
      <img
        src={thumbnailUrl}
        alt={`Miniature de ${document.nom}`}
        className={`w-full h-full object-contain transition-all duration-300 hover:scale-102 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => {
          setImageLoaded(true);
          setImageError(false);
        }}
        onError={() => {
          console.log(`❌ Erreur chargement miniature pour document ${document.id}`);
          setImageError(true);
          setImageLoaded(false);
        }}
      />
      {imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-300" />
      )}
      {/* Badge de type de fichier */}
      {imageLoaded && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700 opacity-0 hover:opacity-100 transition-all duration-200">
          {document.type?.toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default DocumentThumbnail; 