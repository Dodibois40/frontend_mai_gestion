import React, { createContext, useContext, useState, useCallback } from 'react';

// Créer le contexte
const UsersContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers doit être utilisé dans un UsersProvider');
  }
  return context;
};

// Provider du contexte
export const UsersProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fonction pour déclencher un refresh de tous les composants qui écoutent
  const triggerRefresh = useCallback((action = 'update', userData = null) => {
    console.log('🔄 Déclenchement refresh utilisateurs:', action, userData);
    setRefreshTrigger(prev => prev + 1);
    setLastUpdate({
      action,
      userData,
      timestamp: Date.now()
    });
  }, []);

  // Fonction pour s'abonner aux changements
  const useRefreshTrigger = useCallback(() => {
    return refreshTrigger;
  }, [refreshTrigger]);

  const value = {
    triggerRefresh,
    useRefreshTrigger,
    lastUpdate,
    refreshTrigger
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
};

export default UsersContext; 