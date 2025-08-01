import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Lock, 
  Download, 
  Trash2, 
  ShieldCheck,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const PrivacySettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState({ export: false, delete: false });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const handleExportData = async () => {
    setLoading(prev => ({ ...prev, export: true }));
    try {
      // TODO: Implement API call to export user data
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Votre exportation de données a commencé. Vous recevrez un email lorsque ce sera prêt.');
    } catch (error) {
      toast.error('Erreur lors de la demande d\'exportation.');
    } finally {
      setLoading(prev => ({ ...prev, export: false }));
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== `supprimer/${user.email}`) {
      toast.error('Le texte de confirmation est incorrect.');
      return;
    }

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      // TODO: Implement API call to delete account
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Votre compte a été supprimé avec succès.');
      // TODO: logout and redirect user
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte.');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };
  
  const renderConsentSection = () => (
    <div className="space-y-4">
      <div className="flex items-start">
        <ShieldCheck className="w-5 h-5 mt-0.5 mr-3" style={{color: '#6b7c3d'}}/>
        <div>
          <h4 className="font-medium text-stone-800">Consentement marketing</h4>
          <p className="text-sm text-stone-600 mt-1">Vous avez accepté de recevoir nos communications marketing.</p>
        </div>
      </div>
       <div className="flex items-start">
        <FileText className="w-5 h-5 mt-0.5 mr-3" style={{color: '#6b7c3d'}}/>
        <div>
          <h4 className="font-medium text-stone-800">Conditions d'utilisation</h4>
          <p className="text-sm text-stone-600 mt-1">Vous avez accepté nos conditions d'utilisation lors de votre inscription.</p>
        </div>
      </div>
      <p className="text-sm text-stone-500 italic">Pour modifier vos consentements, veuillez contacter le support.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Confidentialité et Données</h2>
        <p className="text-stone-600">Gérez vos données personnelles et la confidentialité de votre compte.</p>
      </div>

      <div className="space-y-8">
        {/* Exportation des données */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-stone-200/50">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" style={{color: '#6b7c3d'}} />
            Exporter vos données
          </h3>
          <p className="text-stone-600 mb-4">
            Vous pouvez demander une exportation de toutes les données que nous détenons vous concernant au format JSON.
          </p>
          <button
            onClick={handleExportData}
            disabled={loading.export}
            className="flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: loading.export ? '#a8b884' : '#6b7c3d',
              border: 'none'
            }}
          >
            {loading.export ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Demande en cours...
              </>
            ) : (
              'Demander l\'exportation'
            )}
          </button>
        </div>
        
        {/* Gestion du consentement */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-stone-200/50">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" style={{color: '#6b7c3d'}} />
            Gestion des consentements
          </h3>
          {renderConsentSection()}
        </div>

        {/* Suppression du compte */}
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Zone de danger
          </h3>
          <p className="text-red-700 mb-4">
            La suppression de votre compte est une action irréversible. Toutes vos données seront définitivement perdues.
          </p>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Supprimer mon compte
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-red-800 font-medium">
                Pour confirmer, veuillez taper <code className="bg-red-200 text-red-900 px-1 py-0.5 rounded font-mono">{`supprimer/${user?.email}`}</code> dans le champ ci-dessous.
              </p>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading.delete || deleteConfirmationText !== `supprimer/${user?.email}`}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.delete ? 'Suppression...' : 'Je confirme la suppression'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings; 