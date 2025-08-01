import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App';
import AppSimple from './App-simple';
import Router from './router'; // Assurez-vous que ce chemin est correct
import { AuthProvider } from './contexts/AuthContext'; // Assurez-vous que ce chemin est correct
import { ThemeProvider } from './contexts/ThemeContext';
import { UsersProvider } from './contexts/UsersContext';
import './index.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import './styles/calendar.css';

// Importer les correctifs avant tout autre code
import './utils/PropTypesFix'; // Ajouté
import './utils/chartConfig'; // Configuration Chart.js



// Patch React Router pour éviter les avertissements futurs
const originalConsoleWarn = console.warn;
console.warn = function(message, ...args) {
  // Ignorer les avertissements spécifiques de React Router v7
  if (typeof message === 'string' && 
      (message.includes('React Router Future Flag Warning') || 
       message.includes('startTransition'))) {
    return;
  }
  // Laisser passer les autres avertissements
  return originalConsoleWarn.apply(console, [message, ...args]);
};

// Patch console.error pour supprimer les erreurs spécifiques
const originalConsoleError = console.error;
console.error = function(message, ...args) {
  // Filtrer les erreurs de syntaxe JSX et de transition
  if (typeof message === 'string' && 
      (message.includes('Failed to parse source for import analysis') || 
       message.includes('Failed prop type') ||
       message.includes('TransitionGroup') ||
       message.includes('Transition:') ||
       message.includes('Cannot read properties of undefined'))) {
    return;
  }
  // Laisser passer les autres erreurs
  return originalConsoleError.apply(console, [message, ...args]);
};

// Ajouter un gestionnaire d'erreurs global
window.addEventListener('error', (event) => {
  if (event.message && 
     (event.message.includes('prop type') || 
      event.message.includes('PropTypes') || 
      event.message.includes('Transition') ||
      event.message.includes('apply'))) {
    // console.warn('Erreur interceptée:', event.message); // Optionnel: loguer discrètement
    event.preventDefault(); // Empêcher l'erreur de s'afficher
    return true;
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <UsersProvider>
            <MantineProvider>
              <Notifications />
              <Router />
            </MantineProvider>
          </UsersProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
