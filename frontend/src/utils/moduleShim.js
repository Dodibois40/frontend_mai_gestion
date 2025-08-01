// Shim pour les modules CommonJS dans un environnement ESM
if (typeof window !== 'undefined' && typeof window.module === 'undefined') {
  window.module = { exports: {} };
  window.require = function(moduleName) {
    console.warn(`require('${moduleName}') appelé dans un environnement ESM - simulation activée`);
    return {};
  };
  window.global = window;
}

export default {}; 