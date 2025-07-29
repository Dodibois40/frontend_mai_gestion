import { useState } from 'react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Shield, 
  Smartphone, 
  Copy, 
  Download, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import twoFactorService from '../../services/twoFactorService';

const TwoFactorSetup = ({ user, onSetupComplete }) => {
  const [step, setStep] = useState(1); // 1: Info, 2: QR Code, 3: Verification, 4: Backup Codes
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Étape 1 : Démarrer la configuration
  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const data = await twoFactorService.setup(user.email);
      setSetupData(data);
      setStep(2);
      toast.success('Configuration 2FA initialisée');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Étape 3 : Vérifier et activer la 2FA
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error('Le code doit contenir 6 chiffres');
      return;
    }

    setLoading(true);
    try {
      await twoFactorService.verifyAndEnable(verificationCode);
      setStep(4);
      toast.success('2FA activée avec succès !');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Copier le secret manuel
  const copySecret = () => {
    navigator.clipboard.writeText(setupData.manualEntryKey);
    toast.success('Secret copié dans le presse-papiers');
  };

  // Télécharger les codes de récupération
  const downloadBackupCodes = () => {
    const content = `Codes de récupération Mai Gestion - ${user.prenom} ${user.nom}\nDate: ${new Date().toLocaleDateString()}\n\n${setupData.backupCodes.join('\n')}\n\n⚠️ Conservez ces codes dans un endroit sûr.\nChaque code ne peut être utilisé qu'une seule fois.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mai-gestion-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Codes de récupération téléchargés');
  };

  // Terminer la configuration
  const handleComplete = () => {
    onSetupComplete();
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
      
      {/* En-tête */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{backgroundColor: '#f0f4e8', border: '1px solid #d9e2c4'}}>
          <Shield className="w-8 h-8" style={{color: '#6b7c3d'}} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{color: '#000000'}}>
          Authentification à deux facteurs
        </h2>
        <p style={{color: '#333333'}}>
          Sécurisez votre compte avec la 2FA
        </p>
      </div>

      {/* Étape 1 : Introduction */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="rounded-lg p-4" style={{backgroundColor: '#f0f4e8', border: '1px solid #d9e2c4'}}>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 mt-0.5" style={{color: '#6b7c3d'}} />
              <div>
                <h3 className="font-semibold" style={{color: '#000000'}}>Pourquoi activer la 2FA ?</h3>
                <p className="text-sm mt-1" style={{color: '#333333'}}>
                  La 2FA ajoute une couche de sécurité supplémentaire à votre compte en demandant un code de votre téléphone en plus de votre mot de passe.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold" style={{color: '#000000'}}>Vous aurez besoin de :</h4>
            <div className="flex items-center space-x-3" style={{color: '#333333'}}>
              <Smartphone className="w-5 h-5" />
              <span>Une application d'authentification (Google Authenticator, Authy, etc.)</span>
            </div>
          </div>

          <button
            onClick={handleStartSetup}
            disabled={loading}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            style={{
              backgroundColor: loading ? '#6b7c3d' : '#6b7c3d',
              border: 'none',
              fontSize: '13px',
              fontWeight: '500',
              minHeight: '36px'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#556533')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#6b7c3d')}
          >
            {loading ? 'Configuration...' : 'Commencer la configuration'}
          </button>
        </div>
      )}

      {/* Étape 2 : QR Code */}
      {step === 2 && setupData && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2" style={{color: '#000000'}}>
              Scanner le QR code
            </h3>
            <p className="text-sm mb-4" style={{color: '#333333'}}>
              Utilisez votre application d'authentification pour scanner ce code :
            </p>
            
                         <div className="bg-white p-4 rounded-lg inline-block">
               <QRCodeSVG 
                 value={setupData.qrCode} 
                 size={200}
                 level="M"
                 includeMargin={true}
               />
             </div>
          </div>

          <div className="rounded-lg p-4" style={{backgroundColor: '#faf6f0', border: '1px solid #f0e6d2'}}>
            <h4 className="font-semibold mb-2" style={{color: '#000000'}}>Configuration manuelle</h4>
            <p className="text-sm mb-2" style={{color: '#333333'}}>
              Si vous ne pouvez pas scanner le QR code, saisissez cette clé manuellement :
            </p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-white border rounded px-3 py-2 text-sm font-mono" style={{borderColor: '#d1d5db', color: '#374151'}}>
                {setupData.manualEntryKey}
              </code>
              <button
                onClick={copySecret}
                className="p-2 hover:opacity-70 transition-opacity"
                style={{color: '#6b7c3d'}}
                title="Copier la clé"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setStep(3)}
            className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors"
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
            J'ai configuré l'application
          </button>
        </div>
      )}

      {/* Étape 3 : Vérification */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2" style={{color: '#000000'}}>
              Vérifier la configuration
            </h3>
            <p className="text-sm mb-4" style={{color: '#333333'}}>
              Entrez le code à 6 chiffres généré par votre application :
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full text-center text-2xl font-mono tracking-widest border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:border-transparent"
                style={{
                  borderColor: '#d1d5db',
                  color: '#374151',
                  focusRingColor: '#6b7c3d',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6b7c3d'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                maxLength={6}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              style={{
                backgroundColor: '#6b7c3d',
                border: 'none',
                fontSize: '13px',
                fontWeight: '500',
                minHeight: '36px'
              }}
              onMouseEnter={(e) => !loading && verificationCode.length === 6 && (e.target.style.backgroundColor = '#556533')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#6b7c3d')}
            >
              {loading ? 'Vérification...' : 'Vérifier et activer'}
            </button>
          </form>

          <button
            onClick={() => setStep(2)}
            className="w-full py-2 hover:opacity-70 transition-opacity"
            style={{color: '#333333'}}
          >
            Retour au QR code
          </button>
        </div>
      )}

      {/* Étape 4 : Codes de récupération */}
      {step === 4 && setupData && (
        <div className="space-y-4">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{color: '#6b7c3d'}} />
            <h3 className="text-lg font-semibold mb-2" style={{color: '#000000'}}>
              2FA activée avec succès !
            </h3>
            <p className="text-sm mb-4" style={{color: '#333333'}}>
              Sauvegardez ces codes de récupération dans un endroit sûr :
            </p>
          </div>

          <div className="rounded-lg p-4" style={{backgroundColor: '#f5f0e8', border: '1px solid #e8dcc0'}}>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 mt-0.5" style={{color: '#6b7c3d'}} />
              <div>
                <h4 className="font-semibold" style={{color: '#000000'}}>Important !</h4>
                <p className="text-sm mt-1" style={{color: '#333333'}}>
                  Ces codes vous permettront de récupérer l'accès à votre compte si vous perdez votre téléphone. Chaque code ne peut être utilisé qu'une seule fois.
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
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {setupData.backupCodes.map((code, index) => (
                  <div key={index} className="bg-white border rounded px-3 py-2 text-center" style={{borderColor: '#d1d5db', color: '#374151'}}>
                    {code}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={downloadBackupCodes}
              className="flex-1 flex items-center justify-center space-x-2 font-semibold py-3 px-4 rounded-lg transition-colors"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                color: '#374151',
                fontSize: '13px',
                fontWeight: '500',
                minHeight: '36px'
              }}
            >
              <Download className="w-4 h-4" />
              <span>Télécharger</span>
            </button>
            
            <button
              onClick={handleComplete}
              className="flex-1 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
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
              Terminer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup; 