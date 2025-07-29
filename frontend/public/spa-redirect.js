// Ce script gère les redirections SPA et définit les variables globales requises
(function() {
  // Définir module et require pour les bibliothèques CommonJS
  if (typeof window.module === 'undefined') {
    window.module = { exports: {} };
  }
  if (typeof window.require === 'undefined') {
    window.require = function(name) {
      console.warn('require(' + name + ') appelé dans un environnement ESM');
      return {};
    };
  }
  if (typeof window.global === 'undefined') {
    window.global = window;
  }
  
  // Gestion des redirections SPA
  const path = window.location.pathname;
  if (path !== '/' && !path.includes('.')) {
    sessionStorage.setItem('spa-redirect', path);
  }
})();
