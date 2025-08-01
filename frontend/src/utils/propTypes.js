import * as PropTypesOriginal from 'prop-types';

// Re-exporter PropTypes avec un export par défaut
const PropTypes = PropTypesOriginal;

// Export par défaut pour maintenir la compatibilité avec les imports existants
export default PropTypes;

// Export nommé pour permettre l'import destructuré
export const {
  string,
  number,
  bool,
  func,
  array,
  object,
  shape,
  oneOf,
  oneOfType,
  arrayOf,
  objectOf,
  node,
  element,
  instanceOf,
  any,
} = PropTypesOriginal; 