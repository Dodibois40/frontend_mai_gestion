import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Configuration Firebase - REMPLACEZ par vos vraies valeurs
const firebaseConfig = {
  apiKey: "AIzaSyCC1VwhprRXivPSEL_9UwCksOZLuka9de4",
  authDomain: "entreprise-organiser.firebaseapp.com",
  projectId: "entreprise-organiser",
  storageBucket: "entreprise-organiser.firebasestorage.app",
  messagingSenderId: "148962094148",
  appId: "1:148962094148:web:670deb9a62f005a5ef6011"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const FirebaseTest = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validation : PDF uniquement, max 10MB
      if (selectedFile.type !== 'application/pdf') {
        setError('Seuls les fichiers PDF sont autorisés');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Créer une référence avec un nom unique
      const timestamp = Date.now();
      const fileName = `test_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `test/${fileName}`);

      console.log('🔥 Début upload vers Firebase Storage...');
      
      // Upload du fichier avec métadonnées
      const metadata = {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          testUpload: 'true'
        }
      };

      const snapshot = await uploadBytes(storageRef, file, metadata);
      console.log('✅ Upload terminé:', snapshot);

      // Obtenir l'URL de téléchargement
      const url = await getDownloadURL(snapshot.ref);
      console.log('🔗 URL de téléchargement:', url);

      setDownloadURL(url);
      setSuccess(`✅ Fichier uploadé avec succès ! Taille: ${(file.size / 1024).toFixed(2)} KB`);
      
    } catch (err) {
      console.error('❌ Erreur upload:', err);
      setError(`Erreur upload: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async () => {
    if (!downloadURL) return;

    try {
      // Extraire le chemin du fichier depuis l'URL
      const url = new URL(downloadURL);
      const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
      if (!pathMatch) throw new Error('Impossible d\'extraire le chemin du fichier');
      
      const filePath = decodeURIComponent(pathMatch[1]);
      const fileRef = ref(storage, filePath);
      
      await deleteObject(fileRef);
      console.log('🗑️ Fichier supprimé');
      
      setDownloadURL('');
      setSuccess('Fichier supprimé avec succès');
      setFile(null);
      
    } catch (err) {
      console.error('❌ Erreur suppression:', err);
      setError(`Erreur suppression: ${err.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        🔥 Test Firebase Storage
      </h2>
      
      {/* Sélection de fichier */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner un fichier PDF (max 10MB)
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            📄 Fichier sélectionné: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={uploadFile}
          disabled={!file || uploading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? '⏳ Upload en cours...' : '📤 Upload vers Firebase'}
        </button>
        
        {downloadURL && (
          <button
            onClick={deleteFile}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            🗑️ Supprimer
          </button>
        )}
      </div>

      {/* Messages de statut */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Prévisualisation du fichier uploadé */}
      {downloadURL && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">📄 Fichier uploadé :</h3>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>URL:</strong> 
              <a href={downloadURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                Ouvrir le PDF
              </a>
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(downloadURL)}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
            >
              📋 Copier l'URL
            </button>
          </div>
          
          {/* Iframe de prévisualisation */}
          <div className="mt-4">
            <iframe
              src={downloadURL}
              className="w-full h-96 border rounded"
              title="Prévisualisation PDF"
              allow="fullscreen"
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">📋 Instructions :</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Configurez Firebase Storage dans la console</li>
          <li>2. Activez le plan Blaze (pay-as-you-go)</li>
          <li>3. Configurez les règles de sécurité en mode test</li>
          <li>4. Sélectionnez un fichier PDF et testez l'upload</li>
          <li>5. Vérifiez que la prévisualisation fonctionne</li>
        </ol>
      </div>
    </div>
  );
};

export default FirebaseTest; 