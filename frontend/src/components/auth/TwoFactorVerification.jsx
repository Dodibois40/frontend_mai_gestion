import { useState } from 'react';
import { toast } from 'sonner';
import { Shield, HelpCircle, ArrowLeft } from 'lucide-react';
import twoFactorService from '../../services/twoFactorService';

const TwoFactorVerification = ({ user, onVerified, onCancel }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBackupCodeInput, setShowBackupCodeInput] = useState(false);

  // Vérifier le code 2FA
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error('Veuillez entrer un code');
      return;
    }

    if (!showBackupCodeInput && code.length !== 6) {
      toast.error('Le code doit contenir 6 chiffres');
      return;
    }

    if (showBackupCodeInput && code.length !== 8) {
      toast.error('Le code de récupération doit contenir 8 caractères');
      return;
    }

    setLoading(true);
    try {
      const result = await twoFactorService.verifyLogin(code);
      
      if (result.usedBackupCode) {
        toast.success('Code de récupération utilisé avec succès');
      } else {
        toast.success('Code 2FA vérifié avec succès');
      }
      
      onVerified(result);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Basculer entre code normal et code de récupération
  const toggleBackupCode = () => {
    setShowBackupCodeInput(!showBackupCodeInput);
    setCode('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* En-tête */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vérification requise
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Bonjour {user?.prenom}, entrez votre code d'authentification
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
          <form onSubmit={handleVerifyCode} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {showBackupCodeInput ? 'Code de récupération' : 'Code d\'authentification'}
              </label>
              
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  const value = showBackupCodeInput 
                    ? e.target.value.toUpperCase().replace(/[^A-F0-9]/g, '').slice(0, 8)
                    : e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                }}
                placeholder={showBackupCodeInput ? 'A1B2C3D4' : '123456'}
                className="w-full text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={showBackupCodeInput ? 8 : 6}
                autoComplete="off"
                autoFocus
              />
              
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {showBackupCodeInput 
                  ? 'Entrez l\'un de vos codes de récupération de 8 caractères'
                  : 'Entrez le code à 6 chiffres de votre application d\'authentification'
                }
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim() || (showBackupCodeInput ? code.length !== 8 : code.length !== 6)}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Vérification...' : 'Vérifier'}
            </button>
          </form>

          {/* Options alternatives */}
          <div className="mt-6 space-y-4">
            <button
              onClick={toggleBackupCode}
              className="w-full flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
            >
              <HelpCircle className="w-4 h-4" />
              <span>
                {showBackupCodeInput 
                  ? 'Utiliser le code de l\'application'
                  : 'Utiliser un code de récupération'
                }
              </span>
            </button>

            {onCancel && (
              <button
                onClick={onCancel}
                className="w-full flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour à la connexion</span>
              </button>
            )}
          </div>
        </div>

        {/* Aide */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Besoin d'aide ?</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Si vous n'avez pas accès à votre application d'authentification, 
                utilisez l'un de vos codes de récupération de 8 caractères.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerification; 