import React from 'react';

// TEMPORAIREMENT DÉSACTIVÉ POUR DÉPLOIEMENT - PDF viewer non disponible
const PdfViewer = ({ 
  pdfUrl, 
  fileName = 'document.pdf',
  height = 600,
  onClose = null
}) => {
  return (
    <div className="w-full border rounded-lg" style={{ height: `${height}px` }}>
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center p-6">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-medium mb-2">
            Visionneuse PDF temporairement indisponible
          </h3>
          <p className="text-gray-600 mb-4">
            La visionneuse PDF sera réactivée prochainement.
          </p>
          {pdfUrl && (
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              📥 Télécharger le PDF
            </a>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfViewer; 