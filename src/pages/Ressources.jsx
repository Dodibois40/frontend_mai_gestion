import React, { useState, useEffect } from 'react';
import {
  IconTool,
  IconPlus,
  IconSearch,
  IconFilter,
  IconCalendar,
  IconMapPin,
  IconEye,
  IconPencil,
  IconTrash,
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconUser,
  IconBuilding,
  IconSettings,
  IconPackage,
  IconBattery,
  IconActivity
} from '@tabler/icons-react';

const Ressources = () => {
  const [activeTab, setActiveTab] = useState('materiels');
  const [ressources, setRessources] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [filteredRessources, setFilteredRessources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRessource, setSelectedRessource] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    location: '',
    search: ''
  });

  // Données d'exemple (à remplacer par l'API)
  const mockData = {
    materiels: [
      {
        id: 1,
        name: 'Perceuse Bosch Professional',
        category: 'Outils électriques',
        type: 'materiel',
        status: 'disponible',
        location: 'Atelier principal',
        description: 'Perceuse sans fil 18V avec batteries',
        serialNumber: 'BSH-2024-001',
        purchaseDate: '2024-01-15',
        value: 350,
        maintenanceDate: '2024-06-15',
        condition: 'excellent',
        currentUser: null
      },
      {
        id: 2,
        name: 'Scie circulaire Festool',
        category: 'Outils électriques',
        type: 'materiel',
        status: 'en_utilisation',
        location: 'Chantier Dupont',
        description: 'Scie circulaire plongeante avec rail de guidage',
        serialNumber: 'FST-2023-045',
        purchaseDate: '2023-08-20',
        value: 850,
        maintenanceDate: '2024-08-20',
        condition: 'bon',
        currentUser: 'Jean Martin'
      },
      {
        id: 3,
        name: 'Camionnette Iveco',
        category: 'Véhicules',
        type: 'vehicule',
        status: 'maintenance',
        location: 'Garage',
        description: 'Camionnette utilitaire pour transport matériel',
        serialNumber: 'IVC-2022-003',
        purchaseDate: '2022-03-10',
        value: 35000,
        maintenanceDate: '2024-03-10',
        condition: 'maintenance_required',
        currentUser: null
      },
      {
        id: 4,
        name: 'Échafaudage mobile',
        category: 'Équipement sécurité',
        type: 'equipement',
        status: 'disponible',
        location: 'Entrepôt',
        description: 'Échafaudage mobile 4 niveaux',
        serialNumber: 'ECH-2023-012',
        purchaseDate: '2023-05-15',
        value: 1200,
        maintenanceDate: '2024-05-15',
        condition: 'bon',
        currentUser: null
      }
    ],
    reservations: [
      {
        id: 1,
        ressourceId: 1,
        ressourceName: 'Perceuse Bosch Professional',
        userId: 2,
        userName: 'Pierre Durand',
        startDate: '2024-01-20',
        endDate: '2024-01-22',
        purpose: 'Installation étagères',
        status: 'confirmee',
        affaireName: 'Aménagement bureau'
      },
      {
        id: 2,
        ressourceId: 3,
        ressourceName: 'Camionnette Iveco',
        userId: 1,
        userName: 'Jean Martin',
        startDate: '2024-01-25',
        endDate: '2024-01-25',
        purpose: 'Livraison matériel',
        status: 'en_attente',
        affaireName: 'Cuisine Dupont'
      }
    ]
  };

  const categories = [
    'Outils électriques',
    'Outils manuels',
    'Véhicules',
    'Équipement sécurité',
    'Machines',
    'Consommables'
  ];

  const locations = [
    'Atelier principal',
    'Entrepôt',
    'Garage',
    'Chantier externe',
    'En réparation'
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [ressources, filters, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRessources(mockData.materiels);
      setReservations(mockData.reservations);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...ressources];

    // Filtrer par type selon l'onglet actif
    if (activeTab === 'materiels') {
      filtered = filtered.filter(r => r.type === 'materiel');
    } else if (activeTab === 'vehicules') {
      filtered = filtered.filter(r => r.type === 'vehicule');
    } else if (activeTab === 'equipements') {
      filtered = filtered.filter(r => r.type === 'equipement');
    }

    if (filters.category) {
      filtered = filtered.filter(r => r.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    if (filters.location) {
      filtered = filtered.filter(r => r.location === filters.location);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(search) ||
        r.description.toLowerCase().includes(search) ||
        r.serialNumber.toLowerCase().includes(search)
      );
    }

    setFilteredRessources(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'disponible': return 'bg-green-100 text-green-800';
      case 'en_utilisation': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'reserve': return 'bg-yellow-100 text-yellow-800';
      case 'hors_service': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'bon': return 'text-blue-600';
      case 'moyen': return 'text-yellow-600';
      case 'maintenance_required': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'disponible': return 'Disponible';
      case 'en_utilisation': return 'En utilisation';
      case 'maintenance': return 'En maintenance';
      case 'reserve': return 'Réservé';
      case 'hors_service': return 'Hors service';
      default: return status;
    }
  };

  const formatCondition = (condition) => {
    switch (condition) {
      case 'excellent': return 'Excellent';
      case 'bon': return 'Bon';
      case 'moyen': return 'Moyen';
      case 'maintenance_required': return 'Maintenance requise';
      default: return condition;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'disponible': return <IconCheck className="w-4 h-4" />;
      case 'en_utilisation': return <IconUser className="w-4 h-4" />;
      case 'maintenance': return <IconSettings className="w-4 h-4" />;
      case 'reserve': return <IconClock className="w-4 h-4" />;
      case 'hors_service': return <IconAlertCircle className="w-4 h-4" />;
      default: return <IconPackage className="w-4 h-4" />;
    }
  };

  const stats = {
    total: ressources.length,
    disponible: ressources.filter(r => r.status === 'disponible').length,
    en_utilisation: ressources.filter(r => r.status === 'en_utilisation').length,
    maintenance: ressources.filter(r => r.status === 'maintenance').length,
    valeur_totale: ressources.reduce((total, r) => total + r.value, 0)
  };

  const tabs = [
    { id: 'materiels', label: 'Matériels', icon: IconTool },
    { id: 'vehicules', label: 'Véhicules', icon: IconActivity },
    { id: 'equipements', label: 'Équipements', icon: IconPackage },
    { id: 'reservations', label: 'Réservations', icon: IconCalendar }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <IconTool className="text-blue-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Ressources</h1>
            <p className="text-gray-600">Matériels, véhicules et équipements de l'entreprise</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <IconPlus size={16} />
          <span>Nouvelle ressource</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total ressources</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <IconPackage className="text-gray-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-green-600">{stats.disponible}</p>
            </div>
            <IconCheck className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En utilisation</p>
              <p className="text-2xl font-bold text-blue-600">{stats.en_utilisation}</p>
            </div>
            <IconUser className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En maintenance</p>
              <p className="text-2xl font-bold text-red-600">{stats.maintenance}</p>
            </div>
            <IconSettings className="text-red-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valeur totale</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.valeur_totale.toLocaleString()}€
              </p>
            </div>
            <IconBattery className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'reservations' ? (
            // Onglet Réservations
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Réservations en cours</h3>
              
              <div className="space-y-4">
                {reservations.map(reservation => (
                  <div key={reservation.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{reservation.ressourceName}</h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <IconUser size={16} />
                            <span>{reservation.userName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <IconCalendar size={16} />
                            <span>{reservation.startDate} - {reservation.endDate}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <IconBuilding size={16} />
                            <span>{reservation.affaireName}</span>
                          </div>
                          <p className="mt-2">{reservation.purpose}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reservation.status === 'confirmee' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reservation.status === 'confirmee' ? 'Confirmée' : 'En attente'}
                        </span>
                        <div className="flex space-x-1">
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <IconPencil size={16} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Onglets Ressources
            <>
              {/* Filtres */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <IconFilter className="text-gray-400" size={20} />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Toutes les catégories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Tous les statuts</option>
                        <option value="disponible">Disponible</option>
                        <option value="en_utilisation">En utilisation</option>
                        <option value="maintenance">En maintenance</option>
                        <option value="reserve">Réservé</option>
                        <option value="hors_service">Hors service</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Tous les emplacements</option>
                        {locations.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        placeholder="Rechercher..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des ressources */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRessources.map(ressource => (
                  <div key={ressource.id} className="border rounded-lg p-6 space-y-4">
                    {/* Header de la carte */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{ressource.name}</h3>
                        <p className="text-sm text-gray-600">{ressource.category}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(ressource.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ressource.status)}`}>
                          {formatStatus(ressource.status)}
                        </span>
                      </div>
                    </div>

                    {/* Informations */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">N° série:</span>
                        <span className="font-mono text-gray-900">{ressource.serialNumber}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">État:</span>
                        <span className={`font-medium ${getConditionColor(ressource.condition)}`}>
                          {formatCondition(ressource.condition)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Emplacement:</span>
                        <div className="flex items-center space-x-1">
                          <IconMapPin size={14} className="text-gray-400" />
                          <span className="text-gray-900">{ressource.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Valeur:</span>
                        <span className="font-semibold text-gray-900">{ressource.value.toLocaleString()}€</span>
                      </div>

                      {ressource.currentUser && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Utilisateur:</span>
                          <div className="flex items-center space-x-1">
                            <IconUser size={14} className="text-blue-400" />
                            <span className="text-blue-600">{ressource.currentUser}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">{ressource.description}</p>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <IconEye size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                          <IconPencil size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <IconTrash size={16} />
                        </button>
                      </div>
                      
                      {ressource.status === 'disponible' && (
                        <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors">
                          Réserver
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredRessources.length === 0 && (
                <div className="text-center py-12">
                  <IconPackage className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">Aucune ressource trouvée</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ressources;
