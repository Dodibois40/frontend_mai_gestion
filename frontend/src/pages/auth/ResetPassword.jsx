import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { IconLock, IconArrowLeft, IconCheck, IconX, IconEye, IconEyeOff } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import authService from '@/services/authService';
import { Button } from '@/components/ui/button';

// Évaluation de la force du mot de passe
const PasswordStrength = ({ password }) => {
  if (!password) return null;

  // Critères de sécurité
  const requirements = [
    { re: /[0-9]/, label: 'Contient des chiffres' },
    { re: /[a-z]/, label: 'Contient des lettres minuscules' },
    { re: /[A-Z]/, label: 'Contient des lettres majuscules' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Contient des caractères spéciaux' },
  ];

  // Vérification des critères
  const strength = requirements.filter(requirement => requirement.re.test(password)).length;

  // Couleur en fonction de la force
  const getColor = () => {
    if (strength === 0) return 'bg-red-500';
    if (strength === 1) return 'bg-orange-500';
    if (strength === 2) return 'bg-yellow-500';
    if (strength === 3) return 'bg-lime-500';
    return 'bg-green-500';
  };

  // Affichage des critères
  const checks = requirements.map((requirement, index) => (
    <div
      key={index}
      className={`flex items-center space-x-2 text-sm mt-2 ${
        requirement.re.test(password) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      }`}
    >
      {requirement.re.test(password) ? <IconCheck className="w-4 h-4" /> : <IconX className="w-4 h-4" />}
      <span>{requirement.label}</span>
    </div>
  ));

  return (
    <div className="mt-4">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${(strength / 4) * 100}%` }}
        ></div>
      </div>
      {checks}
    </div>
  );
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Vérifier la validité du token au chargement
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error('Erreur', {
        description: 'Token de réinitialisation manquant ou invalide'
      });
    }
  }, [token]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    } else {
      // Évaluer la complexité du mot de passe
      const requirements = [
        { re: /[0-9]/ },
        { re: /[a-z]/ },
        { re: /[A-Z]/ },
        { re: /[$&+,:;=?@#|'<>.^*()%!-]/ },
      ];
      
      const strength = requirements.filter(req => req.re.test(formData.password)).length;
      
      if (strength < 2) {
        newErrors.password = 'Le mot de passe est trop faible';
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation est requise';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await authService.resetPassword(token, formData.password);
      
      setSuccess(true);
      
      // Connexion automatique avec le nouveau token
      if (response.token) {
        // Attendre un peu pour que l'utilisateur voie le message de succès
        setTimeout(() => {
          login({ token: response.token });
          navigate('/');
        }, 2000);
      }
      
      toast.success('Succès', {
        description: 'Votre mot de passe a été réinitialisé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      
      if (error.message === 'Token invalide ou expiré') {
        setTokenValid(false);
      }
      
      toast.error('Erreur', {
        description: error.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Si le token est invalide, afficher un message d'erreur
  if (!tokenValid) {
    return (
      <div className="flex items-start space-x-3 p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div>
          <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">Lien invalide ou expiré</h4>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            Le lien de réinitialisation de mot de passe est invalide ou a expiré. 
            Veuillez demander un nouveau lien de réinitialisation.
          </p>
          <div className="text-center">
            <Link to="/auth/forgot-password">
              <Button variant="secondary">
                Demander un nouveau lien
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Si la réinitialisation a réussi, afficher un message de succès
  if (success) {
    return (
      <div className="flex items-start space-x-3 p-4 mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div>
          <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Mot de passe réinitialisé</h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            Votre mot de passe a été réinitialisé avec succès. Vous allez être connecté automatiquement...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Entrez votre nouveau mot de passe ci-dessous pour réinitialiser votre compte.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`modern-input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Votre nouveau mot de passe"
              disabled={loading}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <IconEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <IconEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}
        </div>
        
        <PasswordStrength password={formData.password} />
        
        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`modern-input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="Confirmez votre nouveau mot de passe"
              disabled={loading}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <IconEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <IconEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword}</p>
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
            Réinitialiser le mot de passe
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword; 