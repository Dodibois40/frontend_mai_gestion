import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  IconMail, 
  IconLock, 
  IconEye, 
  IconEyeOff, 
  IconLogin,
  IconBuildingFactory,
  IconDeviceDesktop,
  IconMoon,
  IconSun
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await login({ email: formData.email, password: formData.password });
      // Le contexte gère déjà la navigation et les notifications
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error('Erreur de connexion', {
        description: error.message || 'Vérifiez vos identifiants et réessayez'
      });
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Admin Système', email: 'admin@exemple.fr', password: 'password123' },
    { role: 'Chef d\'atelier', email: 'chef@exemple.fr', password: 'password123' },
    { role: 'Employé', email: 'acheteur@exemple.fr', password: 'password123' }
  ];

  const fillDemoCredentials = (email, password) => {
    setFormData(prev => ({ ...prev, email, password }));
  };

  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/site-web-commande-panneaux.firebasestorage.app/o/Logo%2FLOGO.png?alt=media&token=b236b3a0-eb50-4f46-b8d6-46d54e252ace";

  return (
    <div className="min-h-screen flex justify-center items-center font-sans p-8">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-stone-200 dark:border-gray-700 transition-all z-50"
        title={isDark ? 'Mode clair' : 'Mode sombre'}
      >
        {isDark ? <IconSun className="w-5 h-5 text-amber-400" /> : <IconMoon className="w-5 h-5 text-stone-600" />}
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg" style={{width: '900px', height: '400px'}}>
        
        <div className="flex h-full">
          {/* Colonne gauche - Logo et branding */}
          <div 
            className="flex-1 flex flex-col justify-center items-center rounded-l-2xl p-8 relative"
            style={{
              backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/site-web-commande-panneaux.firebasestorage.app/o/Divers%20belles%20images%2F2a1b3c2fd0d4438568726f2d6059afc0.jpg?alt=media&token=8a778fc8-5681-4b40-bb9f-1669cf13a036')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Overlay pour assurer la lisibilité */}
            <div className="absolute inset-0 bg-black/30 rounded-l-2xl"></div>
            
            {/* Contenu par-dessus l'image */}
            <div className="relative z-10 text-center">
              <img src={logoUrl} alt="M.AI Gestion" className="w-24 h-24 mb-6 mx-auto" />
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">M.AI Gestion</h1>
              <p className="text-white/90 text-center text-sm leading-relaxed drop-shadow">
                Plateforme intelligente de<br />gestion d'entreprise
              </p>
            </div>
          </div>

          {/* Colonne droite - Formulaire */}
          <div className="flex-1 flex flex-col justify-center p-10">
            <div className="mb-6">
              <h2 className="text-xl font-normal text-gray-900 dark:text-white mb-1">Connexion</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Accéder à votre espace</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Adresse e-mail"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-olive-500 focus:ring-1 focus:ring-olive-500 focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-olive-500 focus:ring-1 focus:ring-olive-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-olive-600 hover:bg-olive-700 disabled:bg-olive-400 text-white font-medium py-3 rounded-lg transition-colors shadow-sm"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            {/* Lien d'aide pour identifiants oubliés */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Identifiants oubliés ? 
                <span className="text-olive-600 hover:text-olive-700 cursor-pointer ml-1">
                  Contactez votre administrateur
                </span>
              </p>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
              © {new Date().getFullYear()} M.AI Gestion - Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;