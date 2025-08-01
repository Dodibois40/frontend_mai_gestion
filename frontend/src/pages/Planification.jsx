import React, { useState, useEffect } from 'react';
import {
  IconCalendar,
  IconPlus,
  IconUsers,
  IconClock,
  IconBuilding,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconSearch,
  IconEye,
  IconPencil,
  IconTrash,
  IconTarget,
  IconAlertCircle
} from '@tabler/icons-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

const Planification = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [plannings, setPlannings] = useState([]);
  const [filteredPlannings, setFilteredPlannings] = useState([]);
  const [users, setUsers] = useState([]);
  const [affaires, setAffaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlanning, setSelectedPlanning] = useState(null);
  const [filters, setFilters] = useState({
    user: '',
    affaire: '',
    search: ''
  });

  // Données d'exemple (à remplacer par l'API)
  const mockData = {
    plannings: [
      {
        id: 1,
        title: 'Installation cuisine - Maison Dupont',
        startDate: new Date(),
        endDate: addDays(new Date(), 2),
        userId: 1,
        userName: 'Jean Martin',
        affaireId: 1,
        affaireName: 'Cuisine Dupont',
        status: 'en_cours',
        priority: 'high',
        estimatedHours: 16,
        description: 'Installation complète de la cuisine avec pose du plan de travail'
      },
      {
        id: 2,
        title: 'Réparation porte d\'entrée',
        startDate: addDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        userId: 2,
        userName: 'Pierre Durand',
        affaireId: 2,
        affaireName: 'Réparations Maison Martin',
        status: 'planifie',
        priority: 'medium',
        estimatedHours: 4,
        description: 'Réparation et ajustement de la porte d\'entrée'
      }
    ],
    users: [
      { id: 1, name: 'Jean Martin', role: 'Menuisier' },
      { id: 2, name: 'Pierre Durand', role: 'Apprenti' },
      { id: 3, name: 'Marie Petit', role: 'Chef d\'équipe' }
    ],
    affaires: [
      { id: 1, name: 'Cuisine Dupont', status: 'en_cours' },
      { id: 2, name: 'Réparations Maison Martin', status: 'en_cours' },
      { id: 3, name: 'Dressing chambre', status: 'planifie' }
    ]
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [plannings, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPlannings(mockData.plannings);
      setUsers(mockData.users);
      setAffaires(mockData.affaires);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...plannings];

    if (filters.user) {
      filtered = filtered.filter(p => p.userId.toString() === filters.user);
    }

    if (filters.affaire) {
      filtered = filtered.filter(p => p.affaireId.toString() === filters.affaire);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search) ||
        p.userName.toLowerCase().includes(search) ||
        p.affaireName.toLowerCase().includes(search)
      );
    }

    setFilteredPlannings(filtered);
  };

  // Navigation du calendrier
  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Génération des jours du calendrier
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: fr });
    const endDate = endOfWeek(monthEnd, { locale: fr });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  // Obtenir les plannings pour une date donnée
  const getPlanningsForDate = (date) => {
    return filteredPlannings.filter(planning => {
      const startDate = new Date(planning.startDate);
      const endDate = new Date(planning.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planifie': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-green-100 text-green-800';
      case 'termine': return 'bg-gray-100 text-gray-800';
      case 'annule': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'planifie': return 'Planifié';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'annule': return 'Annulé';
      default: return status;
    }
  };

  const calendarDays = generateCalendarDays();

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
          <IconCalendar className="text-blue-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Planification</h1>
            <p className="text-gray-600">Gestion des plannings et affectations d'équipe</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <IconPlus size={16} />
          <span>Nouveau planning</span>
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Plannings actifs</p>
              <p className="text-2xl font-bold text-blue-600">
                {plannings.filter(p => p.status === 'en_cours').length}
              </p>
            </div>
            <IconTarget className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Planifiés</p>
              <p className="text-2xl font-bold text-yellow-600">
                {plannings.filter(p => p.status === 'planifie').length}
              </p>
            </div>
            <IconClock className="text-yellow-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Collaborateurs</p>
              <p className="text-2xl font-bold text-green-600">{users.length}</p>
            </div>
            <IconUsers className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Heures planifiées</p>
              <p className="text-2xl font-bold text-purple-600">
                {plannings.reduce((total, p) => total + p.estimatedHours, 0)}h
              </p>
            </div>
            <IconClock className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <IconFilter className="text-gray-400" size={20} />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collaborateur
              </label>
              <select
                value={filters.user}
                onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les collaborateurs</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Affaire
              </label>
              <select
                value={filters.affaire}
                onChange={(e) => setFilters({ ...filters, affaire: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les affaires</option>
                {affaires.map(affaire => (
                  <option key={affaire.id} value={affaire.id}>{affaire.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header du calendrier */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IconChevronLeft size={20} />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IconChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Grille du calendrier */}
        <div className="p-6">
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Jours du mois */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayPlannings = getPlanningsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-24 p-2 border border-gray-100 cursor-pointer transition-colors ${
                    isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''} ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="text-sm font-medium">
                    {format(day, 'd')}
                  </div>
                  
                  {/* Plannings du jour */}
                  <div className="mt-1 space-y-1">
                    {dayPlannings.slice(0, 2).map(planning => (
                      <div
                        key={planning.id}
                        className={`text-xs p-1 rounded border-l-2 ${getPriorityColor(
                          planning.priority
                        )} bg-gray-50`}
                        title={planning.title}
                      >
                        <div className="truncate font-medium">
                          {planning.userName}
                        </div>
                        <div className="truncate text-gray-600">
                          {planning.title}
                        </div>
                      </div>
                    ))}
                    {dayPlannings.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayPlannings.length - 2} autres
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Liste des plannings pour la date sélectionnée */}
      {selectedDate && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Plannings du {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
            </h3>
          </div>
          
          <div className="p-6">
            {getPlanningsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8">
                <IconCalendar className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">Aucun planning pour cette date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getPlanningsForDate(selectedDate).map(planning => (
                  <div
                    key={planning.id}
                    className={`border rounded-lg p-4 border-l-4 ${getPriorityColor(
                      planning.priority
                    )}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{planning.title}</h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <IconUsers size={16} />
                            <span>{planning.userName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <IconBuilding size={16} />
                            <span>{planning.affaireName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <IconClock size={16} />
                            <span>{planning.estimatedHours}h estimées</span>
                          </div>
                        </div>
                        {planning.description && (
                          <p className="mt-2 text-sm text-gray-600">{planning.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(planning.status)}`}>
                          {formatStatus(planning.status)}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setSelectedPlanning(planning);
                              setShowForm(true);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Planification;
