import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import authService from '../services/authService';
import { cleanupInvalidTokens, startTokenValidationWatcher } from '../utils/tokenValidator';

// Créer le contexte
const AuthContext = createContext();

// Hook personnalisé pour accéder au contexte
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  
  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        // Nettoyer d'abord les tokens invalides
        const cleanupResult = cleanupInvalidTokens();
        if (cleanupResult.cleaned) {
          console.warn('🧹 Tokens invalides nettoyés:', cleanupResult.reason);
          setLoading(false);
          return;
        }
        
        // Vérifier si un token existe
        if (authService.isAuthenticated()) {
          // Récupérer les données utilisateur stockées
          const userData = authService.getCurrentUser();
          
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Si pas de données utilisateur, essayer de les récupérer
            try {
              const { user: profileData } = await authService.getProfile();
              setUser(profileData);
              setIsAuthenticated(true);
            } catch (profileError) {
              console.error('Erreur lors de la récupération du profil:', profileError);
              handleLogout();
            }
          }
        }
      } catch (error) {
        console.error('Erreur d\'authentification:', error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Démarrer la surveillance des tokens
    const stopWatcher = startTokenValidationWatcher((reason) => {
      console.warn('🔒 Token invalidé automatiquement:', reason);
      toast.warning('Session expirée', {
        description: 'Veuillez vous reconnecter',
        duration: 3000,
      });
      handleLogout();
    });
    
    // Nettoyer la surveillance au démontage
    return () => stopWatcher();
  }, []);
  
  // Fonction de connexion
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast.success('Connexion réussie', {
        description: `Bienvenue, ${response.user.prenom} ${response.user.nom}`,
        duration: 2000,
      });
      
      navigate('/');
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la connexion';
      toast.error('Erreur de connexion', {
        description: errorMessage,
        duration: 4000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction d'inscription
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast.success('Inscription réussie', {
        description: `Bienvenue, ${response.user.prenom} ${response.user.nom}`,
        duration: 2000,
      });
      
      navigate('/');
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de l\'inscription';
      toast.error('Erreur d\'inscription', {
        description: errorMessage,
        duration: 4000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction de déconnexion
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    // Forcer une redirection complète pour nettoyer l'état
    window.location.href = '/auth/login';
  };
  
  // Fonction de mise à jour du profil
  const updateProfile = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.updateProfile(userData);
      
      setUser(response.user);
      
      toast.success('Profil mis à jour', {
        description: 'Vos informations ont été mises à jour avec succès',
        duration: 2000,
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la mise à jour du profil';
      toast.error('Erreur', {
        description: errorMessage,
        duration: 4000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Valeurs exposées par le contexte
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout: handleLogout,
    updateProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 