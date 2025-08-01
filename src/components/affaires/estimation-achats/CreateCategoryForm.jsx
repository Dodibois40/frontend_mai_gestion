import React, { useState } from 'react';

const CreateCategoryForm = ({ onCreateCategory, categoriesExistantes }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    pourcentage: 5,
    couleur: '#3B82F6'
  });
  const [errors, setErrors] = useState({});

  const couleursPredefinies = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#F43F5E', '#8B5A2B', '#6B7280', '#DC2626'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    } else if (categoriesExistantes.some(cat => cat.nom.toLowerCase() === formData.nom.trim().toLowerCase())) {
      newErrors.nom = 'Une catégorie avec ce nom existe déjà';
    }
    
    if (formData.pourcentage < 1 || formData.pourcentage > 100) {
      newErrors.pourcentage = 'Le pourcentage doit être entre 1 et 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const nouvelleCategorie = {
      id: `custom-${Date.now()}`,
      nom: formData.nom.trim(),
      couleur: formData.couleur,
      pourcentage: parseInt(formData.pourcentage),
      isCustom: true
    };
    
    onCreateCategory(nouvelleCategorie);
    
    // Reset form
    setFormData({ nom: '', pourcentage: 5, couleur: '#3B82F6' });
    setErrors({});
    setShowForm(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Créer une catégorie personnalisée
      </button>
    );
  }

  return (
    <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-blue-800">Nouvelle catégorie</h4>
        <button
          onClick={() => {
            setShowForm(false);
            setFormData({ nom: '', pourcentage: 5, couleur: '#3B82F6' });
            setErrors({});
          }}
          className="text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">
            Nom de la catégorie
          </label>
          <input
            type="text"
            value={formData.nom}
            onChange={(e) => handleInputChange('nom', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.nom ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Ex: Matériel électrique"
          />
          {errors.nom && (
            <p className="text-red-600 text-xs mt-1">{errors.nom}</p>
          )}
        </div>

        {/* Pourcentage */}
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">
            Pourcentage initial
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="100"
              value={formData.pourcentage}
              onChange={(e) => handleInputChange('pourcentage', parseInt(e.target.value))}
              className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="number"
              min="1"
              max="100"
              value={formData.pourcentage}
              onChange={(e) => handleInputChange('pourcentage', parseInt(e.target.value) || 1)}
              className={`w-16 px-2 py-1 text-center border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.pourcentage ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            <span className="text-sm text-blue-700">%</span>
          </div>
          {errors.pourcentage && (
            <p className="text-red-600 text-xs mt-1">{errors.pourcentage}</p>
          )}
        </div>

        {/* Couleur */}
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-2">
            Couleur
          </label>
          <div className="grid grid-cols-5 gap-2">
            {couleursPredefinies.map((couleur) => (
              <button
                key={couleur}
                type="button"
                onClick={() => handleInputChange('couleur', couleur)}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                  formData.couleur === couleur 
                    ? 'border-blue-600 ring-2 ring-blue-300' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: couleur }}
                title={couleur}
              />
            ))}
          </div>
        </div>

        {/* Aperçu */}
        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <p className="text-sm text-blue-700 mb-2">Aperçu :</p>
          <div 
            className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-gray-200"
            style={{
              borderLeftColor: formData.couleur,
              borderLeftWidth: '6px',
            }}
          >
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: formData.couleur }}
            />
            <span className="font-medium text-sm">
              {formData.nom || 'Nom de la catégorie'}
            </span>
            <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs">
              {formData.pourcentage}%
            </span>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setFormData({ nom: '', pourcentage: 5, couleur: '#3B82F6' });
              setErrors({});
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Créer
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategoryForm; 