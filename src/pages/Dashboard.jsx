import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Simuler le chargement des données
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
          Générer un rapport
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase">Plannings actifs</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              📅
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase">Collaborateurs</p>
              <p className="text-2xl font-bold text-gray-900">28</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              👥
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase">Tâches en cours</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              💼
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase">Projets terminés</p>
              <p className="text-2xl font-bold text-gray-900">94</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              📈
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tâches récentes */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Tâches récentes</h2>
            <button 
              onClick={() => navigate('/taches')}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              Voir tout
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">En cours</span>
                  <span className="font-medium">Mise à jour du site web</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Assigné à Sophie M. • Échéance: 18/05/2025</p>
              </div>
              <button className="text-blue-500 hover:text-blue-600 text-sm">Détails</button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Terminé</span>
                  <span className="font-medium">Réunion équipe marketing</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Assigné à Marc D. • Échéance: 15/05/2025</p>
              </div>
              <button className="text-blue-500 hover:text-blue-600 text-sm">Détails</button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">En attente</span>
                  <span className="font-medium">Préparation présentation client</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Assigné à Jean D. • Échéance: 20/05/2025</p>
              </div>
              <button className="text-blue-500 hover:text-blue-600 text-sm">Détails</button>
            </div>
          </div>
        </div>

        {/* Progression des projets */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Progression des projets</h2>
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <div className="w-full h-full rounded-full bg-gray-200">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-75"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">12</span>
              </div>
            </div>
            <p className="font-medium text-gray-700 mb-4">Projets en cours</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  En cours
                </span>
                <span className="font-semibold">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Terminés
                </span>
                <span className="font-semibold">25%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  En attente
                </span>
                <span className="font-semibold">30%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accès rapides */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Accès rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                📅
              </div>
              <h3 className="font-semibold text-gray-800">Planning</h3>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">12 actifs</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Gestion du planning des équipes et attribution des tâches</p>
            <button 
              onClick={() => navigate('/plannings')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
            >
              Accéder
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                👥
              </div>
              <h3 className="font-semibold text-gray-800">Collaborateurs</h3>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">28 actifs</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Gestion des équipes et des compétences</p>
            <button 
              onClick={() => navigate('/collaborateurs')}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
            >
              Accéder
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                🏭
              </div>
              <h3 className="font-semibold text-gray-800">Chantiers</h3>
              <span className="text-sm bg-teal-100 text-teal-800 px-2 py-1 rounded-full">Finances</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Gestion financière des chantiers et suivi des budgets</p>
            <button 
              onClick={() => navigate('/chantiers')}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg"
            >
              Accéder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 