import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('blue');
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);

  // Initialisation du thème
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedPrimaryColor = localStorage.getItem('primaryColor') || 'blue';
    const savedCompactMode = localStorage.getItem('compactMode') === 'true';
    const savedAnimations = localStorage.getItem('animations') !== 'false'; // Par défaut true
    
    // Vérifier les préférences système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    setPrimaryColor(savedPrimaryColor);
    setCompactMode(savedCompactMode);
    setAnimations(savedAnimations);
    
    // Appliquer le thème
    updateTheme(shouldBeDark);
    updatePrimaryColor(savedPrimaryColor);
    updateCompactMode(savedCompactMode);
    updateAnimations(savedAnimations);
  }, []);

  // Écouter les changements de préférences système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        updateTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const updateTheme = (dark) => {
    document.documentElement.classList.toggle('dark', dark);
    if (dark) {
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.style.colorScheme = 'light';
    }
  };

  const updatePrimaryColor = (color) => {
    document.documentElement.setAttribute('data-primary-color', color);
  };

  const updateCompactMode = (compact) => {
    document.documentElement.classList.toggle('compact', compact);
  };

  const updateAnimations = (enabled) => {
    document.documentElement.classList.toggle('no-animations', !enabled);
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    updateTheme(newTheme);
  };

  const setTheme = (theme) => {
    const dark = theme === 'dark';
    setIsDark(dark);
    localStorage.setItem('theme', theme);
    updateTheme(dark);
  };

  const changePrimaryColor = (color) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
    updatePrimaryColor(color);
  };

  const toggleCompactMode = () => {
    const newCompact = !compactMode;
    setCompactMode(newCompact);
    localStorage.setItem('compactMode', newCompact.toString());
    updateCompactMode(newCompact);
  };

  const toggleAnimations = () => {
    const newAnimations = !animations;
    setAnimations(newAnimations);
    localStorage.setItem('animations', newAnimations.toString());
    updateAnimations(newAnimations);
  };

  const resetToDefaults = () => {
    setIsDark(false);
    setPrimaryColor('blue');
    setCompactMode(false);
    setAnimations(true);
    
    localStorage.removeItem('theme');
    localStorage.removeItem('primaryColor');
    localStorage.removeItem('compactMode');
    localStorage.removeItem('animations');
    
    updateTheme(false);
    updatePrimaryColor('blue');
    updateCompactMode(false);
    updateAnimations(true);
  };

  const value = {
    // État
    isDark,
    primaryColor,
    compactMode,
    animations,
    
    // Actions
    toggleTheme,
    setTheme,
    changePrimaryColor,
    toggleCompactMode,
    toggleAnimations,
    resetToDefaults,
    
    // Utilitaires
    theme: isDark ? 'dark' : 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 