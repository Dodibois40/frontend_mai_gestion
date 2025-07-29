/**
 * Polyfill pour PropTypes - résout les erreurs de validation dans les composants React
 */

// Simuler PropTypes si non défini
if (typeof window !== 'undefined') {
  if (!window.PropTypes) {
    const createPropType = (validate) => {
      const checkType = (isRequired, props, propName, componentName) => {
        // Si valeur non définie et obligatoire, émettre un warning
        if (props[propName] === undefined && isRequired) {
          console.warn(`La prop "${propName}" est obligatoire pour le composant "${componentName || 'UnknownComponent'}", mais n'est pas fournie.`);
          return new Error(`La prop "${propName}" est obligatoire pour le composant "${componentName || 'UnknownComponent'}", mais n'est pas fournie.`);
        }
        
        // Si validate est défini et que la valeur existe, valider le type
        if (props[propName] !== undefined && validate) {
          return validate(props, propName, componentName);
        }
        
        return null;
      };
      
      const chainedCheckType = checkType.bind(null, false);
      chainedCheckType.isRequired = checkType.bind(null, true);
      
      return chainedCheckType;
    };
    
    // Créer un objet PropTypes minimal
    window.PropTypes = {
      string: createPropType(),
      number: createPropType(),
      bool: createPropType(),
      func: createPropType(),
      object: createPropType(),
      array: createPropType(),
      any: createPropType(),
      node: createPropType(),
      element: createPropType(),
      symbol: createPropType(),
      arrayOf: () => createPropType(),
      objectOf: () => createPropType(),
      instanceOf: () => createPropType(),
      oneOf: () => createPropType(),
      oneOfType: () => createPropType(),
      shape: () => createPropType(),
      exact: () => createPropType(),
    };
    
    console.log('PropTypes polyfill créé avec succès');
  }
  
  // Patch global pour les bibliothèques qui s'attendent à ce que PropTypes soit disponible globalement
  if (typeof PropTypes === 'undefined' && window.PropTypes) {
    window.PropTypes = window.PropTypes;
  }
}

// Une fonction pour vérifier la validité des props dans les composants
export const validateProps = (props, propTypes, componentName) => {
  if (!propTypes) return;
  
  Object.keys(propTypes).forEach(propName => {
    try {
      propTypes[propName](props, propName, componentName, 'prop', null);
    } catch (e) {
      console.warn(`Validation de prop échouée pour "${propName}" dans "${componentName}":`, e.message);
    }
  });
};

export default window.PropTypes; 