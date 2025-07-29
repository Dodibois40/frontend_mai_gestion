import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import optiCoupeService from '../../services/optiCoupeService';

export default function ProjetsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });

  // Charger les projets depuis l'API
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const projectsData = await optiCoupeService.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      setError('Erreur lors du chargement des projets');
      // Fallback avec données simulées si l'API n'est pas disponible
      setProjects([
        {
          id: 1,
          name: 'Cuisine moderne',
          description: 'Éléments hauts et bas de cuisine',
          pieces: 15,
          status: 'active',
          optimized: true,
          createdAt: '2025-01-15'
        },
        {
          id: 2,
          name: 'Bibliothèque salon',
          description: 'Meuble TV avec rangements',
          pieces: 8,
          status: 'active',
          optimized: false,
          createdAt: '2025-01-10'
        },
        {
          id: 3,
          name: 'Placards bureau',
          description: 'Rangements sur mesure',
          pieces: 6,
          status: 'completed',
          optimized: true,
          createdAt: '2025-01-05'
        }
      ]);
    }
    setLoading(false);
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      alert('Veuillez entrer un nom de projet');
      return;
    }

    try {
      const createdProject = await optiCoupeService.createProject({
        name: newProject.name,
        description: newProject.description || 'Nouveau projet OptiCoupe'
      });
      
      setProjects([createdProject, ...projects]);
      setNewProject({ name: '', description: '' });
      alert('Projet créé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      alert('Erreur lors de la création du projet');
    }
  };

  const handleOpenProject = (projectId) => {
    navigate(`/opti-coupe/projets/${projectId}`);
  };

  const handleEditProject = (projectId) => {
    navigate(`/opti-coupe/projets/${projectId}/edit`);
  };

  const handleOptimizeProject = (projectId) => {
    navigate(`/opti-coupe/optimisation?project=${projectId}`);
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }

    try {
      await optiCoupeService.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      alert('Projet supprimé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      alert('Erreur lors de la suppression du projet');
    }
  };

  const handleExportProjects = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nom,Description,Pièces,Statut,Optimisé,Date de création\n"
      + projects.map(p => 
          `"${p.name}","${p.description}",${p.pieces},"${getStatusLabel(p.status)}","${p.optimized ? 'Oui' : 'Non'}","${new Date(p.createdAt).toLocaleDateString()}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "projets_opticoupe.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'completed': return 'Terminé';
      case 'paused': return 'En pause';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              📋 Gestion des Projets
            </h1>
            <p className="text-gray-600">
              Créez et gérez vos projets d'optimisation de découpe
            </p>
          </div>
          <button
            onClick={() => navigate('/opti-coupe')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Retour au tableau de bord
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => document.getElementById('newProjectForm').scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Nouveau projet
          </button>
          <button 
            onClick={() => alert('Statistiques: ' + projects.length + ' projets au total')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            📊 Statistiques projets
          </button>
          <button 
            onClick={handleExportProjects}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            📋 Export liste
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">⚠️ {error}</p>
            <button 
              onClick={loadProjects}
              className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Liste des projets */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Chargement des projets...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      title="Supprimer le projet"
                    >
                      ❌
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pièces :</span>
                    <span className="font-medium">{project.pieces || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Optimisé :</span>
                    <span className={`font-medium ${project.optimized ? 'text-green-600' : 'text-orange-600'}`}>
                      {project.optimized ? '✅ Oui' : '⏳ Non'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Créé le :</span>
                    <span className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenProject(project.id)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Ouvrir
                  </button>
                  <button 
                    onClick={() => handleEditProject(project.id)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Modifier
                  </button>
                  {!project.optimized && (
                    <button 
                      onClick={() => handleOptimizeProject(project.id)}
                      className="px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      ⚡ Optimiser
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {projects.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Aucun projet trouvé</p>
            <button 
              onClick={() => document.getElementById('newProjectForm').scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Créer votre premier projet
            </button>
          </div>
        )}
      </div>

      {/* Formulaire nouveau projet */}
      <div id="newProjectForm" className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">🆕 Création rapide de projet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du projet *
            </label>
            <input
              type="text"
              value={newProject.name}
              onChange={(e) => setNewProject({...newProject, name: e.target.value})}
              placeholder="Ex: Cuisine moderne"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              placeholder="Ex: Éléments hauts et bas"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button 
            onClick={handleCreateProject}
            disabled={!newProject.name.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Créer le projet
          </button>
          <button 
            onClick={() => setNewProject({ name: '', description: '' })}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>

      {/* Message d'information */}
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-green-900 font-medium mb-2">✅ Fonctionnalités actives</h3>
        <p className="text-green-800 text-sm">
          Les boutons sont maintenant fonctionnels ! Vous pouvez créer, modifier, supprimer et optimiser des projets. 
          Si l'API backend n'est pas disponible, des données de démonstration sont affichées.
        </p>
      </div>
    </div>
  );
} 