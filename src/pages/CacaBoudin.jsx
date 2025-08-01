import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Trash2, Edit } from 'lucide-react';
import cacaBoudinService from '../services/cacaBoudinService';

const CacaBoudin = () => {
  const [cacaBoudins, setCacaBoudins] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    couleur: '#8B4513',
    taille: 'MOYEN',
    odeur: 5,
    dateCaca: new Date().toISOString().split('T')[0] // Date du jour par défaut
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cacaData, statsData] = await Promise.all([
        cacaBoudinService.getAll(),
        cacaBoudinService.getStats()
      ]);
      setCacaBoudins(cacaData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await cacaBoudinService.update(editingItem.id, formData);
      } else {
        await cacaBoudinService.create(formData);
      }
      await loadData();
      setShowForm(false);
      setEditingItem(null);
      setFormData({ nom: '', couleur: '#8B4513', taille: 'MOYEN', odeur: 5, dateCaca: new Date().toISOString().split('T')[0] });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nom: item.nom,
      couleur: item.couleur,
      taille: item.taille,
      odeur: item.odeur,
      dateCaca: item.dateCaca ? new Date(item.dateCaca).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce CACA boudin ?')) {
      try {
        await cacaBoudinService.delete(id);
        await loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const getTailleIcon = (taille) => {
    const sizes = {
      PETIT: '💩',
      MOYEN: '💩💩', 
      GROS: '💩💩💩',
      ENORME: '💩💩💩💩'
    };
    return sizes[taille] || '💩';
  };

  const getOdeurStars = (odeur) => {
    return '🤢'.repeat(Math.min(odeur, 10));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💩</div>
          <div className="text-xl text-gray-600">Chargement des CACA boudins...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                💩 CACA Boudin Manager 💩
              </h1>
              <p className="text-gray-600">
                Gérez vos précieux CACA boudins avec style et élégance !
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-brown-600 hover:bg-brown-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
              style={{ backgroundColor: '#8B4513' }}
            >
              <Plus className="w-5 h-5" />
              Nouveau CACA
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total CACA</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="text-4xl">💩</div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Odeur Moyenne</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.odeurMoyenne.toFixed(1)}/10
                  </p>
                </div>
                <div className="text-4xl">🤢</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">Répartition par Taille</p>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {stats.parTaille.map((item) => (
                  <div key={item.taille} className="text-center">
                    <div className="text-2xl mb-1">{getTailleIcon(item.taille)}</div>
                    <div className="text-sm text-gray-600">{item.taille}</div>
                    <div className="text-lg font-bold">{item._count.taille}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingItem ? 'Modifier' : 'Nouveau'} CACA Boudin
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du CACA
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    placeholder="Ex: Le Magnifique, Le Puant..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date du CACA 💩
                  </label>
                  <input
                    type="date"
                    value={formData.dateCaca}
                    onChange={(e) => setFormData({...formData, dateCaca: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur
                  </label>
                  <input
                    type="color"
                    value={formData.couleur}
                    onChange={(e) => setFormData({...formData, couleur: e.target.value})}
                    className="w-full h-12 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taille
                  </label>
                  <select
                    value={formData.taille}
                    onChange={(e) => setFormData({...formData, taille: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  >
                    <option value="PETIT">PETIT 💩</option>
                    <option value="MOYEN">MOYEN 💩💩</option>
                    <option value="GROS">GROS 💩💩💩</option>
                    <option value="ENORME">ÉNORME 💩💩💩💩</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau d'Odeur (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.odeur}
                    onChange={(e) => setFormData({...formData, odeur: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Ça va</span>
                    <span className="font-bold">{formData.odeur}/10</span>
                    <span>Mortel 🤢</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                      setFormData({ nom: '', couleur: '#8B4513', taille: 'MOYEN', odeur: 5, dateCaca: new Date().toISOString().split('T')[0] });
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#8B4513' }}
                  >
                    {editingItem ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Liste des CACA boudins */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Ma Collection de CACA Boudins
          </h2>
          
          {cacaBoudins.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚽</div>
              <p className="text-xl text-gray-600 mb-2">Aucun CACA boudin enregistré</p>
              <p className="text-gray-500">Cliquez sur "Nouveau CACA" pour commencer !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cacaBoudins.map((caca) => (
                <div
                  key={caca.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  style={{ borderColor: caca.couleur + '40' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{caca.nom}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(caca)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(caca.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Couleur:</span>
                      <div
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: caca.couleur }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Taille:</span>
                      <span className="text-2xl">{getTailleIcon(caca.taille)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Odeur:</span>
                      <span className="text-lg">{getOdeurStars(caca.odeur)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-sm font-medium text-gray-900">
                        📅 {caca.dateCaca ? new Date(caca.dateCaca).toLocaleDateString('fr-FR') : 'Non définie'}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Créé le {new Date(caca.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CacaBoudin; 