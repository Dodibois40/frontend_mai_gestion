/**
 * Polyfill pour PropTypes
 * Ceci est utilisé pour éviter les erreurs 'Cannot access PropTypes before initialization'
 */

// Créer une version simplifiée de PropTypes
const PropTypes = {
  string: () => null,
  number: () => null,
  bool: () => null,
  func: () => null,
  array: () => null,
  object: () => null,
  node: () => null,
  element: () => null,
  instanceOf: () => () => null,
  oneOf: () => () => null,
  oneOfType: () => () => null,
  arrayOf: () => () => null,
  objectOf: () => () => null,
  shape: () => () => null,
  any: () => null,
};

// Définir default pour les ESM
PropTypes.default = PropTypes;

// Définir __esModule pour les CommonJS
Object.defineProperty(PropTypes, '__esModule', { value: true });

// Ajouter au global pour les cas où il est accédé avant l'initialisation
if (typeof window !== 'undefined') {
  window.PropTypes = PropTypes;
}

export default PropTypes;
export const {
  string,
  number,
  bool,
  func,
  array,
  object,
  node,
  element,
  instanceOf,
  oneOf,
  oneOfType,
  arrayOf,
  objectOf,
  shape,
  any
} = PropTypes; 