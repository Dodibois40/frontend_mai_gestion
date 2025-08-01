import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { IconFileText } from '@tabler/icons-react';

// COMPOSANT TEMPORAIREMENT DÉSACTIVÉ POUR DEPLOY - CONFLIT REACT-PDF
export default function PdfViewer({ 
  pdfUrl, 
  fileName = 'document.pdf',
  showControls = true,
  height = 600,
  className = ''
}) {
  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        <div 
          className="flex flex-col items-center justify-center text-gray-500"
          style={{ height: `${height}px` }}
        >
          <IconFileText size={64} className="mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">PDF Viewer en maintenance</h3>
          <p className="text-sm text-center mb-4">
            Le visualiseur PDF est temporairement indisponible.
          </p>
          {pdfUrl && (
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Télécharger {fileName}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}