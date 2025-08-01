import React from 'react';
import { IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import SmartPdfViewer from './SmartPdfViewer';

const SmartPdfModal = ({ 
  isOpen, 
  onClose, 
  devisId,
  fileName
}) => {
  if (!isOpen || !devisId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Aperçu du PDF
            </h2>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <IconX className="h-4 w-4" />
              <span>Fermer</span>
            </Button>
          </div>
          
          {/* Content */}
          <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
            <SmartPdfViewer
              devisId={devisId}
              fileName={fileName}
              height={600}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartPdfModal; 