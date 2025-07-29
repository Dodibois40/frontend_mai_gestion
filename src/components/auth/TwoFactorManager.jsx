import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Shield, 
  ShieldCheck, 
  ShieldX,
  Smartphone, 
  Key,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  Calendar,
  Hash
} from 'lucide-react';
import twoFactorService from '../../services/twoFactorService';
import TwoFactorSetup from './TwoFactorSetup';

const TwoFactorManager = ({ user }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Charger le statut de la 2FA
  const loadStatus = async () => {
    setLoading(true);
    try {
      const statusData = await twoFactorService.getStatus();
      setStatus(statusData);
    } catch (error) {
      toast.error('Erreur lors du chargement du statut 2FA');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // Démarrer la configuration 2FA
  const handleSetupStart = () => {
    setShowSetup(true);
  };

  // Configuration terminée
  const handleSetupComplete = () => {
    setShowSetup(false);
    loadStatus(); // Recharger le statut
    toast.success('2FA configurée avec succès !');
  };

  // Désactiver la 2FA
  const handleDisable = async () => {
    setLoading(true);
    try {
      await twoFactorService.disable();
      await loadStatus();
      setShowDisableConfirm(false);
      toast.success('2FA désactivée avec succès');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Régénérer les codes de récupération
  const handleRegenerateBackupCodes = async () => {
    setLoading(true);
    try {
      const result = await twoFactorService.regenerateBackupCodes();
      setNewBackupCodes(result.backupCodes);
      await loadStatus();
      toast.success('Nouveaux codes de récupération générés');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Télécharger les codes de récupération
  const downloadBackupCodes = (codes) => {
    const content = `Codes de récupération Mai Gestion - ${user.prenom} ${user.nom}\nDate: ${new Date().toLocaleDateString()}\n\n${codes.join('\n')}\n\n⚠️ Conservez ces codes dans un endroit sûr.\nChaque code ne peut être utilisé qu'une seule fois.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mai-gestion-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Codes de récupération téléchargés');
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{borderColor: '#6b7c3d'}}></div>
      </div>
    );
  }

  // Affichage de la configuration si pas encore configuré ou en cours de setup
  if (showSetup || (!status?.isConfigured && !loading)) {
    return (
      <TwoFactorSetup 
        user={user} 
        onSetupComplete={handleSetupComplete}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Statut de la 2FA */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {status?.isEnabled ? (
              <ShieldCheck className="w-8 h-8" style={{color: '#6b7c3d'}} />
            ) : (
              <ShieldX className="w-8 h-8" style={{color: '#dc2626'}} />
            )}
            <div>
              <h2 className="text-xl font-bold" style={{color: '#000000'}}>
                Authentification à deux facteurs
              </h2>
              <p className="text-sm" style={{color: '#333333'}}>
                {status?.isEnabled ? 'Activée et protégeant votre compte' : 'Désactivée'}
              </p>
            </div>
          </div>
          
          <div className="px-3 py-1 rounded-full text-sm font-medium" style={{
            backgroundColor: status?.isEnabled ? '#f0f4e8' : '#fee2e2',
            border: status?.isEnabled ? '1px solid #d9e2c4' : '1px solid #fecaca',
            color: status?.isEnabled ? '#000000' : '#dc2626'
          }}>
            {status?.isEnabled ? 'Activée' : 'Désactivée'}
          </div>
        </div>

        {/* Informations détaillées */}
        {status?.isEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {status.lastUsed && (
              <div className="flex items-center space-x-3 p-3 rounded-lg" style={{backgroundColor: '#f5f0e8', border: '1px solid #e8dcc0'}}>
                <Calendar className="w-5 h-5" style={{color: '#6b7c3d'}} />
                <div>
                  <p className="text-sm font-medium" style={{color: '#000000'}}>Dernière utilisation</p>
                  <p className="text-xs" style={{color: '#333333'}}>
                    {new Date(status.lastUsed).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 p-3 rounded-lg" style={{backgroundColor: '#faf6f0', border: '1px solid #f0e6d2'}}>
              <Hash className="w-5 h-5" style={{color: '#6b7c3d'}} />
              <div>
                <p className="text-sm font-medium" style={{color: '#000000'}}>Codes de récupération</p>
                <p className="text-xs" style={{color: '#333333'}}>
                  {status.backupCodesCount} code(s) disponible(s)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {!status?.isEnabled ? (
            <button
              onClick={handleSetupStart}
              className="flex items-center space-x-2 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              style={{
                backgroundColor: '#6b7c3d',
                border: 'none',
                fontSize: '13px',
                fontWeight: '500',
                minHeight: '36px'
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#556533')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#6b7c3d')}
            >
              <Shield className="w-4 h-4" />
              <span>Activer la 2FA</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleRegenerateBackupCodes}
                disabled={loading}
                className="flex items-center space-x-2 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                style={{
                  backgroundColor: '#6b7c3d',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '500',
                  minHeight: '36px'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#556533')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#6b7c3d')}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Régénérer les codes</span>
              </button>

              <button
                onClick={() => setShowDisableConfirm(true)}
                className="flex items-center space-x-2 font-semibold py-2 px-4 rounded-lg transition-colors"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: '500',
                  minHeight: '36px'
                }}
              >
                <ShieldX className="w-4 h-4" />
                <span>Désactiver la 2FA</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Nouveaux codes de récupération générés */}
      {newBackupCodes && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Key className="w-6 h-6" style={{color: '#6b7c3d'}} />
            <h3 className="text-lg font-semibold" style={{color: '#000000'}}>
              Nouveaux codes de récupération
            </h3>
          </div>

          <div className="rounded-lg p-4 mb-4" style={{backgroundColor: '#f5f0e8', border: '1px solid #e8dcc0'}}>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 mt-0.5" style={{color: '#6b7c3d'}} />
              <div>
                <h4 className="font-semibold" style={{color: '#000000'}}>Sauvegardez ces codes !</h4>
                <p className="text-sm mt-1" style={{color: '#333333'}}>
                  Ces nouveaux codes remplacent les anciens. Sauvegardez-les dans un endroit sûr.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg p-4" style={{backgroundColor: '#faf6f0', border: '1px solid #f0e6d2'}}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold" style={{color: '#000000'}}>Codes de récupération</h4>
              <button
                onClick={() => setShowBackupCodes(!showBackupCodes)}
                className="flex items-center space-x-1 hover:opacity-70 transition-opacity"
                style={{color: '#6b7c3d'}}
              >
                {showBackupCodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="text-sm">{showBackupCodes ? 'Masquer' : 'Afficher'}</span>
              </button>
            </div>

            {showBackupCodes && (
              <div className="grid grid-cols-2 gap-2 font-mono text-sm mb-4">
                {newBackupCodes.map((code, index) => (
                  <div key={index} className="bg-white border rounded px-3 py-2 text-center" style={{borderColor: '#d1d5db', color: '#374151'}}>
                    {code}
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => downloadBackupCodes(newBackupCodes)}
                className="flex items-center space-x-2 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                style={{
                  backgroundColor: '#6b7c3d',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '500',
                  minHeight: '36px'
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#556533')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#6b7c3d')}
              >
                <Download className="w-4 h-4" />
                <span>Télécharger</span>
              </button>
              
              <button
                onClick={() => setNewBackupCodes(null)}
                className="font-semibold py-2 px-4 rounded-lg transition-colors"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: '500',
                  minHeight: '36px'
                }}
              >
                J'ai sauvegardé les codes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation pour désactiver */}
      {showDisableConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6" style={{color: '#dc2626'}} />
              <h3 className="text-lg font-semibold" style={{color: '#000000'}}>
                Désactiver la 2FA
              </h3>
            </div>

            <p className="mb-6" style={{color: '#333333'}}>
              Êtes-vous sûr de vouloir désactiver l'authentification à deux facteurs ? 
              Cela réduira la sécurité de votre compte.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDisableConfirm(false)}
                className="flex-1 font-semibold py-2 px-4 rounded-lg transition-colors"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: '500',
                  minHeight: '36px'
                }}
              >
                Annuler
              </button>
              
              <button
                onClick={handleDisable}
                disabled={loading}
                className="flex-1 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                style={{
                  backgroundColor: '#dc2626',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '500',
                  minHeight: '36px'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#b91c1c')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#dc2626')}
              >
                {loading ? 'Désactivation...' : 'Désactiver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorManager; 