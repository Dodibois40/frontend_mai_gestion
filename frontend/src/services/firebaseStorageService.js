import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  getMetadata 
} from "firebase/storage";
import { storage } from "../config/firebase";

/**
 * Service Firebase Storage pour la gestion des PDFs
 */
const firebaseStorageService = {
  
  /**
   * Upload un PDF pour un BDC avec progress tracking
   * @param {string} bdcId - ID du bon de commande
   * @param {File} file - Fichier PDF à uploader
   * @param {Function} onProgress - Callback pour le progress (optionnel)
   * @param {string} bdcNumero - Numéro du BDC pour nommer le fichier (optionnel)
   * @returns {Promise<Object>} - URL de téléchargement et métadonnées
   */
  async uploadBdcPdf(bdcId, file, onProgress = null, bdcNumero = null) {
    try {
      // Validation du fichier
      if (!file || file.type !== 'application/pdf') {
        throw new Error('Le fichier doit être un PDF');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB max
        throw new Error('Le fichier ne doit pas dépasser 10MB');
      }

      // Créer le nom de fichier basé sur le numéro BDC ou par défaut avec timestamp
      let fileName;
      if (bdcNumero) {
        fileName = `${bdcNumero}.pdf`;
      } else {
        fileName = `${Date.now()}_${file.name}`;
      }
      
      const storageRef = ref(storage, `bdc/${bdcId}/${fileName}`);

      // Upload avec progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file, {
        customMetadata: {
          bdcId: bdcId,
          originalName: bdcNumero ? `${bdcNumero}.pdf` : file.name,
          uploadedAt: new Date().toISOString()
        }
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress callback
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress);
            }
            console.log(`Upload progress: ${progress.toFixed(2)}%`);
          },
          (error) => {
            console.error('Erreur upload Firebase:', error);
            reject(new Error(`Erreur lors de l'upload: ${error.message}`));
          },
          async () => {
            try {
              // Upload terminé avec succès
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const metadata = await getMetadata(uploadTask.snapshot.ref);
              
              resolve({
                downloadURL,
                fileName: fileName,
                originalName: file.name,
                size: metadata.size,
                uploadedAt: metadata.timeCreated,
                fullPath: metadata.fullPath
              });
            } catch (error) {
              reject(new Error(`Erreur lors de la récupération de l'URL: ${error.message}`));
            }
          }
        );
      });
    } catch (error) {
      console.error('Erreur uploadBdcPdf:', error);
      throw error;
    }
  },

  /**
   * Upload un PDF pour une facture d'achat
   * @param {string} achatId - ID de la facture d'achat
   * @param {File} file - Fichier PDF à uploader
   * @param {Function} onProgress - Callback pour le progress (optionnel)
   * @param {string} factureNumero - Numéro de la facture pour nommer le fichier (optionnel)
   * @returns {Promise<Object>} - URL de téléchargement et métadonnées
   */
  async uploadFacturePdf(achatId, file, onProgress = null, factureNumero = null) {
    try {
      // Validation du fichier
      if (!file || file.type !== 'application/pdf') {
        throw new Error('Le fichier doit être un PDF');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB max
        throw new Error('Le fichier ne doit pas dépasser 10MB');
      }

      // Créer le nom de fichier basé sur le numéro de facture ou par défaut avec timestamp
      let fileName;
      if (factureNumero) {
        fileName = `${factureNumero}.pdf`;
      } else {
        fileName = `${Date.now()}_${file.name}`;
      }
      
      const storageRef = ref(storage, `achats/${achatId}/${fileName}`);

      // Upload avec progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file, {
        customMetadata: {
          achatId: achatId,
          originalName: factureNumero ? `${factureNumero}.pdf` : file.name,
          uploadedAt: new Date().toISOString()
        }
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress callback
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress);
            }
            console.log(`Upload progress facture: ${progress.toFixed(2)}%`);
          },
          (error) => {
            console.error('Erreur upload Firebase facture:', error);
            reject(new Error(`Erreur lors de l'upload: ${error.message}`));
          },
          async () => {
            try {
              // Upload terminé avec succès
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const metadata = await getMetadata(uploadTask.snapshot.ref);
              
              resolve({
                downloadURL,
                fileName: fileName,
                originalName: file.name,
                size: metadata.size,
                uploadedAt: metadata.timeCreated,
                fullPath: metadata.fullPath
              });
            } catch (error) {
              reject(new Error(`Erreur lors de la récupération de l'URL: ${error.message}`));
            }
          }
        );
      });
    } catch (error) {
      console.error('Erreur uploadFacturePdf:', error);
      throw error;
    }
  },

  /**
   * Upload un PDF pour un devis
   * @param {string} devisId - ID du devis
   * @param {File} file - Fichier PDF à uploader
   * @param {Function} onProgress - Callback pour le progress (optionnel)
   * @returns {Promise<Object>} - URL de téléchargement et métadonnées
   */
  async uploadDevisPdf(devisId, file, onProgress = null) {
    try {
      // Validation du fichier
      if (!file || file.type !== 'application/pdf') {
        throw new Error('Le fichier doit être un PDF');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB max
        throw new Error('Le fichier ne doit pas dépasser 10MB');
      }

      // Créer la référence Firebase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `devis/${devisId}/${fileName}`);

      // Upload avec progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file, {
        customMetadata: {
          devisId: devisId,
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress callback
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress);
            }
            console.log(`Upload progress: ${progress.toFixed(2)}%`);
          },
          (error) => {
            console.error('Erreur upload Firebase:', error);
            reject(new Error(`Erreur lors de l'upload: ${error.message}`));
          },
          async () => {
            try {
              // Upload terminé avec succès
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const metadata = await getMetadata(uploadTask.snapshot.ref);
              
              resolve({
                downloadURL,
                fileName: fileName,
                originalName: file.name,
                size: metadata.size,
                uploadedAt: metadata.timeCreated,
                fullPath: metadata.fullPath
              });
            } catch (error) {
              reject(new Error(`Erreur lors de la récupération de l'URL: ${error.message}`));
            }
          }
        );
      });
    } catch (error) {
      console.error('Erreur uploadDevisPdf:', error);
      throw error;
    }
  },

  /**
   * Supprimer un PDF depuis Firebase Storage
   * @param {string} fullPath - Chemin complet du fichier dans Firebase
   * @returns {Promise<void>}
   */
  async deletePdf(fullPath) {
    try {
      const fileRef = ref(storage, fullPath);
      await deleteObject(fileRef);
      console.log('Fichier supprimé avec succès:', fullPath);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  },

  /**
   * Obtenir l'URL de téléchargement d'un PDF
   * @param {string} fullPath - Chemin complet du fichier dans Firebase
   * @returns {Promise<string>} - URL de téléchargement
   */
  async getPdfDownloadUrl(fullPath) {
    try {
      const fileRef = ref(storage, fullPath);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'URL:', error);
      throw new Error(`Erreur lors de la récupération de l'URL: ${error.message}`);
    }
  },

  /**
   * Obtenir les métadonnées d'un PDF
   * @param {string} fullPath - Chemin complet du fichier dans Firebase
   * @returns {Promise<Object>} - Métadonnées du fichier
   */
  async getPdfMetadata(fullPath) {
    try {
      const fileRef = ref(storage, fullPath);
      return await getMetadata(fileRef);
    } catch (error) {
      console.error('Erreur lors de la récupération des métadonnées:', error);
      throw new Error(`Erreur lors de la récupération des métadonnées: ${error.message}`);
    }
  },

  /**
   * Vérifier si un PDF existe
   * @param {string} fullPath - Chemin complet du fichier dans Firebase
   * @returns {Promise<boolean>} - true si le fichier existe
   */
  async pdfExists(fullPath) {
    try {
      const fileRef = ref(storage, fullPath);
      await getMetadata(fileRef);
      return true;
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        return false;
      }
      throw error;
    }
  }
};

export default firebaseStorageService; 