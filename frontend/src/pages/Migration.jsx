import React, { useState } from 'react';
import { 
  IconDownload, 
  IconUpload, 
  IconFileExcel, 
  IconAlertCircle, 
  IconCheck, 
  IconDatabase,
  IconFileText,
  IconPackage,
  IconClipboardList
} from '@tabler/icons-react';
import migrationService from '@/services/migrationService';

const Migration = () => {
  const [loading, setLoading] = useState({});
  const [uploadFiles, setUploadFiles] = useState({});
  const [results, setResults] = useState({});

  const handleExport = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      let result;
      switch (type) {
        case 'affaires':
          result = await migrationService.exportAffaires();
          break;
        case 'articles':
          result = await migrationService.exportArticles();
          break;
        case 'bdc':
          result = await migrationService.exportBdc();
          break;
        default:
          throw new Error('Type d\'export non supporté');
      }
      
      setResults(prev => ({ 
        ...prev, 
        [`export_${type}`]: { type: 'success', message: result.message }
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setResults(prev => {
          const newResults = { ...prev };
          delete newResults[`export_${type}`];
          return newResults;
        });
      }, 3000);
      
    } catch (error) {
      console.error(`Erreur export ${type}:`, error);
      setResults(prev => ({ 
        ...prev, 
        [`export_${type}`]: { type: 'error', message: error.message }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDownloadTemplate = async (type) => {
    setLoading(prev => ({ ...prev, [`template_${type}`]: true }));
    try {
      let result;
      switch (type) {
        case 'articles':
          result = await migrationService.downloadArticlesTemplate();
          break;
        case 'affaires':
          result = await migrationService.downloadAffairesTemplate();
          break;
        default:
          throw new Error('Type de modèle non supporté');
      }
      
      setResults(prev => ({ 
        ...prev, 
        [`template_${type}`]: { type: 'success', message: result.message }
      }));
      
      setTimeout(() => {
        setResults(prev => {
          const newResults = { ...prev };
          delete newResults[`template_${type}`];
          return newResults;
        });
      }, 3000);
      
    } catch (error) {
      console.error(`Erreur téléchargement modèle ${type}:`, error);
      setResults(prev => ({ 
        ...prev, 
        [`template_${type}`]: { type: 'error', message: error.message }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [`template_${type}`]: false }));
    }
  };

  const handleFileChange = (type, event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleImport = async (type) => {
    const file = uploadFiles[type];
    if (!file) {
      setResults(prev => ({ 
        ...prev, 
        [`import_${type}`]: { type: 'error', message: 'Veuillez sélectionner un fichier' }
      }));
      return;
    }

    setLoading(prev => ({ ...prev, [`import_${type}`]: true }));
    try {
      let result;
      switch (type) {
        case 'articles':
          result = await migrationService.importArticles(file);
          break;
        case 'affaires':
          result = await migrationService.importAffaires(file);
          break;
        default:
          throw new Error('Type d\'import non supporté');
      }
      
      setResults(prev => ({ 
        ...prev, 
        [`import_${type}`]: { type: 'success', message: result.message, details: result.details }
      }));
      
      // Clear file selection
      setUploadFiles(prev => ({ ...prev, [type]: null }));
      
    } catch (error) {
      console.error(`Erreur import ${type}:`, error);
      setResults(prev => ({ 
        ...prev, 
        [`import_${type}`]: { type: 'error', message: error.message }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [`import_${type}`]: false }));
    }
  };

  const exportSections = [
    {
      key: 'affaires',
      title: 'Affaires',
      description: 'Exporter toutes les affaires avec leurs détails',
      icon: IconFileText,
      color: 'blue'
    },
    {
      key: 'articles',
      title: 'Articles / Inventaire',
      description: 'Exporter tous les articles avec stocks et prix',
      icon: IconPackage,
      color: 'green'
    },
    {
      key: 'bdc',
      title: 'Bons de Commande',
      description: 'Exporter tous les BDC avec leurs relations',
      icon: IconClipboardList,
      color: 'purple'
    }
  ];

  const importSections = [
    {
      key: 'articles',
      title: 'Articles',
      description: 'Importer/Mettre à jour des articles depuis Excel',
      color: 'green'
    },
    {
      key: 'affaires',
      title: 'Affaires',
      description: 'Importer/Mettre à jour des affaires depuis Excel',
      color: 'blue'
    }
  ];

  const ResultMessage = ({ result }) => {
    if (!result) return null;
    
    return (
      <div className={`mt-3 p-3 rounded-lg border ${
        result.type === 'success' 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center space-x-2">
          {result.type === 'success' ? (
            <IconCheck size={16} />
          ) : (
            <IconAlertCircle size={16} />
          )}
          <span className="text-sm font-medium">{result.message}</span>
        </div>
        {result.details && (
          <div className="mt-2 text-xs">
            <p>Créés: {result.details.created}, Mis à jour: {result.details.updated}</p>
            {result.details.errors?.length > 0 && (
              <div className="mt-1">
                <p className="font-medium">Erreurs:</p>
                <ul className="list-disc list-inside">
                  {result.details.errors.slice(0, 3).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {result.details.errors.length > 3 && (
                    <li>... et {result.details.errors.length - 3} autres erreurs</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <IconDatabase className="text-blue-600" size={32} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Migration Excel</h1>
          <p className="text-gray-600">Import et export de données vers/depuis Excel</p>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <IconDownload className="text-green-600" size={24} />
            <span>Export vers Excel</span>
          </h2>
          <p className="text-gray-600 mt-1">Télécharger vos données au format Excel</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exportSections.map((section) => {
              const Icon = section.icon;
              const isLoading = loading[section.key];
              const result = results[`export_${section.key}`];
              
              return (
                <div key={section.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Icon className={`text-${section.color}-600`} size={24} />
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                  
                  <button
                    onClick={() => handleExport(section.key)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isLoading 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : `bg-${section.color}-600 hover:bg-${section.color}-700 text-white`
                    }`}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                    ) : (
                      <IconFileExcel size={16} />
                    )}
                    <span>{isLoading ? 'Export...' : 'Exporter'}</span>
                  </button>
                  
                  <ResultMessage result={result} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <IconUpload className="text-blue-600" size={24} />
            <span>Import depuis Excel</span>
          </h2>
          <p className="text-gray-600 mt-1">Charger des données depuis des fichiers Excel</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {importSections.map((section) => {
              const isLoadingTemplate = loading[`template_${section.key}`];
              const isLoadingImport = loading[`import_${section.key}`];
              const templateResult = results[`template_${section.key}`];
              const importResult = results[`import_${section.key}`];
              const selectedFile = uploadFiles[section.key];
              
              return (
                <div key={section.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <IconFileExcel className={`text-${section.color}-600`} size={24} />
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                  
                  {/* Download Template */}
                  <div className="mb-4">
                    <button
                      onClick={() => handleDownloadTemplate(section.key)}
                      disabled={isLoadingTemplate}
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        isLoadingTemplate 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {isLoadingTemplate ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                      ) : (
                        <IconDownload size={16} />
                      )}
                      <span>{isLoadingTemplate ? 'Téléchargement...' : 'Télécharger le modèle'}</span>
                    </button>
                    <ResultMessage result={templateResult} />
                  </div>
                  
                  {/* File Upload */}
                  <div className="mb-4">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => handleFileChange(section.key, e)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {selectedFile && (
                      <p className="text-xs text-gray-600 mt-1">
                        Fichier sélectionné: {selectedFile.name}
                      </p>
                    )}
                  </div>
                  
                  {/* Import Button */}
                  <button
                    onClick={() => handleImport(section.key)}
                    disabled={isLoadingImport || !selectedFile}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isLoadingImport || !selectedFile
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : `bg-${section.color}-600 hover:bg-${section.color}-700 text-white`
                    }`}
                  >
                    {isLoadingImport ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                    ) : (
                      <IconUpload size={16} />
                    )}
                    <span>{isLoadingImport ? 'Import...' : 'Importer'}</span>
                  </button>
                  
                  <ResultMessage result={importResult} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <IconAlertCircle className="text-blue-600 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <h4 className="font-medium mb-2">Instructions d'utilisation :</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Pour l'import, téléchargez d'abord le modèle Excel correspondant</li>
              <li>Remplissez le modèle avec vos données en respectant les colonnes obligatoires (*)</li>
              <li>Seuls les fichiers Excel (.xlsx) sont acceptés</li>
              <li>Les imports mettent à jour les enregistrements existants ou en créent de nouveaux</li>
              <li>Vérifiez les messages de résultat pour détecter d'éventuelles erreurs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Migration; 