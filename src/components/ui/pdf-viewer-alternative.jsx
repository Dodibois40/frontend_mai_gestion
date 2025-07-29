import React from 'react';

// TEMPORAIREMENT DÉSACTIVÉ POUR DÉPLOIEMENT - PDF viewer non disponible
const PdfViewerAlternative = ({ 
  pdfUrl, 
  fileName = 'document.pdf',
  height = 600,
  onClose = null
}) => {
  return (
    <div className="w-full border rounded-lg bg-white" style={{ height: `${height}px` }}>
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Visionneuse PDF temporairement indisponible
          </h3>
          <p className="text-gray-600 mb-6 max-w-md">
            La visionneuse PDF sera réactivée prochainement. En attendant, vous pouvez télécharger le document.
          </p>
          {pdfUrl && (
            <div className="space-y-3">
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                📥 Télécharger {fileName}
              </a>
              <br />
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                👁️ Ouvrir dans un nouvel onglet
              </a>
            </div>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfViewerAlternative; 