import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconAt, IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { toast } from 'sonner';
import authService from '@/services/authService';
import { Button } from '@/components/ui/button';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^\S+@\S+$/.test(email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      
      setEmailSent(true);
      
      toast.success('Email envoyé', {
        description: 'Si votre adresse email est enregistrée, vous recevrez un lien de réinitialisation'
      });
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      
      toast.error('Erreur', {
        description: 'Une erreur est survenue lors de la demande de réinitialisation'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };
  
  return (
    <div>
      {emailSent ? (
        <div className="flex items-start space-x-3 p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <IconAlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Email envoyé</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Si votre adresse email est enregistrée, vous recevrez un lien de réinitialisation.
              Veuillez vérifier votre boîte de réception et vos courriers indésirables.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Entrez votre adresse email ci-dessous et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconAt className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={handleInputChange}
                className={`modern-input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="votre.email@exemple.com"
                disabled={loading}
                required
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <Link 
              to="/auth/login"
              className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <IconArrowLeft className="w-4 h-4" />
              <span>Retour à la connexion</span>
            </Link>
            
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              variant="primary"
            >
              Envoyer le lien
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword; 