import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { IconCheck, IconX, IconLoader } from '@tabler/icons-react';
import { toast } from 'sonner';
import authService from '@/services/authService';
import { Button } from '@/components/ui/button';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Token de vérification manquant');
        setLoading(false);
        return;
      }
      
      try {
        await authService.verifyEmail(token);
        setVerified(true);
        
        toast.success('Email vérifié', {
          description: 'Votre adresse email a été vérifiée avec succès'
        });
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'email:', error);
        setError(error.message || 'Erreur lors de la vérification de l\'email');
        
        toast.error('Erreur de vérification', {
          description: error.message || 'Une erreur est survenue lors de la vérification'
        });
      } finally {
        setLoading(false);
      }
    };
    
    verifyEmail();
  }, [token]);
  
  const handleContinue = () => {
    navigate('/auth/login');
  };
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center mb-4">
          <IconLoader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Vérification en cours...
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Veuillez patienter pendant que nous vérifions votre adresse email.
        </p>
      </div>
    );
  }
  
  if (verified) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <IconCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Email vérifié avec succès !
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Votre adresse email a été vérifiée. Vous pouvez maintenant vous connecter.
        </p>
        <Button onClick={handleContinue} variant="primary">
          Se connecter
        </Button>
      </div>
    );
  }
  
  return (
    <div className="text-center py-8">
      <div className="flex items-center justify-center mb-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <IconX className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Erreur de vérification
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {error || 'Une erreur est survenue lors de la vérification de votre email.'}
      </p>
      <div className="space-x-4">
        <Link to="/auth/login">
          <Button variant="secondary">
            Retour à la connexion
          </Button>
        </Link>
        <Link to="/auth/register">
          <Button variant="primary">
            S'inscrire à nouveau
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail; 