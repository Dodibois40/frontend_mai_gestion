import { useEffect, useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { UsersProvider } from './contexts/UsersContext';
import { Toaster } from 'sonner';

// Composant pour détecter les rechargements de page
const PageReloadIndicator = () => {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    // Cache l'indicateur après un délai
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);
    
    // Nettoyer le timer
    return () => clearTimeout(timer);
  }, []);
  
  if (!show) return null;
  
  return (
    <div className="page-reload-indicator">
      ✨ Interface modernisée • {new Date().toLocaleTimeString()}
    </div>
  );
};

function App({ children }) {
  const [reloadKey, setReloadKey] = useState(Date.now());
  
  // Réinitialiser la clé à chaque rechargement
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Sauvegarder l'état actuel avant le rechargement
      sessionStorage.setItem('lastReload', Date.now().toString());
    };
    
    const handleLoad = () => {
      const lastReload = sessionStorage.getItem('lastReload');
      if (lastReload) {
        setReloadKey(Date.now());
        // Nettoyer le stockage après utilisation
        sessionStorage.removeItem('lastReload');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  // Configuration des toasts
  const toasterProps = {
    position: 'top-right',
    richColors: true,
    expand: true,
    gap: 12,
    toastOptions: {
      style: {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  };
  
  return (
    <ThemeProvider>
      <UsersProvider>
        {/* Toast System */}
        <Toaster {...toasterProps} />
        
        {/* Page Reload Indicator */}
        <PageReloadIndicator key={reloadKey} />
        
        {/* Main App Content */}
        <div className="app-container">
          {children}
        </div>
        
        {/* Background Effects */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse-custom"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse-custom delay-1000"></div>
        </div>
      </UsersProvider>
    </ThemeProvider>
  );
}

export default App;
