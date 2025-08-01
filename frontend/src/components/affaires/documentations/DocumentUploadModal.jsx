import React, { useState, useRef } from 'react';
import {
  IconUpload,
  IconX,
  IconFile,
  IconFileText,
  IconPhoto,
  IconFileZip,
  IconAlertCircle
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const DocumentUploadModal = ({ isOpen, onClose, onUpload, affaireId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Configuration des catégories et sous-catégories
  const categories = [
    { id: 'financier', label: 'Financier' },
    { id: 'plans', label: 'Plans' },
    { id: 'photos', label: 'Photos' },
    { id: 'autres', label: 'Autres documents' }
  ];

  const subCategories = {
    financier: [
      { id: 'devis', label: 'Devis' },
      { id: 'factures', label: 'Factures' },
      { id: 'avoirs', label: 'Avoirs' }
    ],
    plans: [
      { id: 'plan-architecte', label: 'Plan architecte' },
      { id: 'plan-technique', label: 'Plan technique' }
    ]
  };

  // Types de fichiers acceptés
  const acceptedTypes = {
    financier: '.pdf,.doc,.docx,.xls,.xlsx',
    plans: '.pdf,.dwg,.dxf,.svg,.jpg,.png',
    photos: '.jpg,.jpeg,.png,.gif,.bmp,.zip',
    autres: '*'
  };

  // Gestion du drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Sélection de fichier
  const handleFileSelect = (file) => {
    // Vérifier la taille (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error('Le fichier est trop volumineux (max 100MB)');
      return;
    }

    setSelectedFile(file);
    // Pré-remplir le nom du document avec le nom du fichier (sans extension)
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    setDocumentName(nameWithoutExt);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedFile(null);
    setDocumentName('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    // Validation
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }
    if (!documentName.trim()) {
      toast.error('Veuillez donner un nom au document');
      return;
    }
    if (!selectedCategory) {
      toast.error('Veuillez sélectionner une catégorie');
      return;
    }
    if (subCategories[selectedCategory] && !selectedSubCategory) {
      toast.error('Veuillez sélectionner une sous-catégorie');
      return;
    }

    setIsUploading(true);

    try {
      // Créer le FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('nom', documentName);
      formData.append('categorie', selectedCategory);
      
      if (selectedSubCategory) {
        formData.append('sousCategorie', selectedSubCategory);
      }
      
      if (description) {
        formData.append('description', description);
      }

      console.log('📤 Envoi upload avec:', {
        affaireId,
        nom: documentName,
        categorie: selectedCategory,
        sousCategorie: selectedSubCategory,
        description: description,
        fileName: selectedFile.name,
        fileSize: selectedFile.size
      });

      // Upload réel via le service (importé dynamiquement pour éviter les erreurs)
      const documentationsService = (await import('@/services/documentationsService')).default;
      const response = await documentationsService.uploadDocument(affaireId, formData);

      toast.success(`Document "${documentName}" uploadé avec succès`);
      
      if (onUpload) {
        // Formater la réponse pour correspondre au format attendu par le composant parent
        onUpload({
          ...response,
          taille: response.taille || formatFileSize(selectedFile.size),
          uploadePar: response.uploadePar || 'Utilisateur actuel',
          type: response.type || selectedFile.name.split('.').pop().toLowerCase()
        });
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Erreur lors de l\'upload du document');
    } finally {
      setIsUploading(false);
    }
  };

  // Obtenir l'icône selon le type de fichier
  const getFileIcon = () => {
    if (!selectedFile) return <IconFile className="w-12 h-12 text-gray-400" />;
    
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
      return <IconPhoto className="w-12 h-12 text-purple-500" />;
    }
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(ext)) {
      return <IconFileText className="w-12 h-12 text-blue-500" />;
    }
    if (['zip', 'rar', '7z'].includes(ext)) {
      return <IconFileZip className="w-12 h-12 text-yellow-500" />;
    }
    
    return <IconFile className="w-12 h-12 text-gray-500" />;
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter un document</DialogTitle>
          <DialogDescription>
            Uploadez un document et organisez-le dans la bonne catégorie
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Zone de drag & drop */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
              ${isDragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-gray-400'}
              ${selectedFile ? 'bg-gray-50' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept={selectedCategory ? acceptedTypes[selectedCategory] : '*'}
            />

            {selectedFile ? (
              <div className="space-y-3">
                {getFileIcon()}
                <div>
                  <p className="font-semibold text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <IconX className="w-4 h-4 mr-1" />
                  Changer de fichier
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <IconUpload className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Glissez-déposez un fichier ici</p>
                  <p className="text-xs text-gray-500">ou cliquez pour parcourir</p>
                  <p className="text-xs text-gray-400 mt-2">Taille maximale : 100 MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Nom du document */}
          <div className="space-y-2">
            <Label htmlFor="documentName">Nom du document *</Label>
            <Input
              id="documentName"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Ex: Devis cuisine moderne V2"
              className="w-full"
            />
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={selectedCategory} onValueChange={(value) => {
              setSelectedCategory(value);
              setSelectedSubCategory(''); // Réinitialiser la sous-catégorie
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sous-catégorie (si applicable) */}
          {selectedCategory && subCategories[selectedCategory] && (
            <div className="space-y-2">
              <Label htmlFor="subCategory">Sous-catégorie *</Label>
              <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez une sous-catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {subCategories[selectedCategory].map(subCat => (
                    <SelectItem key={subCat.id} value={subCat.label}>
                      {subCat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajoutez une description ou des notes..."
              rows={3}
              className="w-full"
            />
          </div>

          {/* Informations sur les types de fichiers acceptés */}
          {selectedCategory && acceptedTypes[selectedCategory] !== '*' && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <IconAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-medium">Types de fichiers acceptés :</p>
                <p>{acceptedTypes[selectedCategory]}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={isUploading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isUploading || !selectedFile || !documentName || !selectedCategory}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Upload en cours...
              </>
            ) : (
              <>
                <IconUpload className="w-4 h-4 mr-2" />
                Uploader
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadModal; 