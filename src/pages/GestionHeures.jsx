import React, { useState, useEffect } from 'react';
import { 
  IconClock, 
  IconCalendar, 
  IconUsers, 
  IconPlus,
  IconFilter,
  IconChevronLeft,
  IconChevronRight,
  IconMapPin,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconList,
  IconChartLine
} from '@tabler/icons-react';
import pointageHeuresService from '../services/pointageHeuresService';
import usersService from '../services/usersService';
import CalendrierHeures from '../components/gestion-heures/CalendrierHeures';
import StatistiquesHeures from '../components/gestion-heures/StatistiquesHeures';

const GestionHeures = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('semaine'); // 'semaine' ou 'mois'
  const [displayMode, setDisplayMode] = useState('calendrier'); // 'calendrier', 'liste' ou 'stats'
  const [pointages, setPointages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPointage, setEditingPointage] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedLieu, setSelectedLieu] = useState('');

  // États pour le formulaire
  const [formData, setFormData] = useState({
    userId: '',
    datePointage: '',
    heuresTravaillees: 8,
    typePresence: 'PRESENT',
    lieuTravail: 'ATELIER_CAME',
    heureDebut: '08:00',
    heureFin: '17:00',
    tempsPauseMinutes: 60,
    commentaire: ''
  });

  useEffect(() => {
    loadUsers();
    loadPointages();
  }, [currentDate, viewMode, selectedUserId, selectedLieu]);

  const loadUsers = async () => {
    try {
      const usersData = await usersService.getUsers();
      // Gérer la structure de l'API qui peut retourner soit un tableau soit un objet
      const usersList = Array.isArray(usersData) ? usersData : (usersData.users || []);
      setUsers(usersList.filter(user => user.actif && !user.supprime));
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  const loadPointages = async () => {
    try {
      setLoading(true);
      
      let dateDebut, dateFin;
      if (viewMode === 'semaine') {
        dateDebut = pointageHeuresService.formatDate(pointageHeuresService.getWeekStart(currentDate));
        dateFin = pointageHeuresService.formatDate(pointageHeuresService.getWeekEnd(currentDate));
      } else {
        dateDebut = pointageHeuresService.formatDate(pointageHeuresService.getMonthStart(currentDate));
        dateFin = pointageHeuresService.formatDate(pointageHeuresService.getMonthEnd(currentDate));
      }

      const filters = { dateDebut, dateFin };
      if (selectedUserId) filters.userId = selectedUserId;
      if (selectedLieu) filters.lieuTravail = selectedLieu;

      const pointagesData = await pointageHeuresService.getPointages(filters);
      setPointages(pointagesData);
    } catch (error) {
      console.error('Erreur chargement pointages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingPointage) {
        await pointageHeuresService.updatePointage(editingPointage.id, formData);
      } else {
        await pointageHeuresService.createPointage(formData);
      }
      
      setShowModal(false);
      setEditingPointage(null);
      resetForm();
      await loadPointages();
    } catch (error) {
      console.error('Erreur sauvegarde pointage:', error);
      alert('Erreur lors de la sauvegarde du pointage');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPointage = (pointage) => {
    setEditingPointage(pointage);
    setFormData({
      userId: pointage.userId,
      datePointage: pointageHeuresService.formatDate(pointage.datePointage),
      heuresTravaillees: pointage.heuresTravaillees,
      typePresence: pointage.typePresence,
      lieuTravail: pointage.lieuTravail,
      heureDebut: pointage.heureDebut || '08:00',
      heureFin: pointage.heureFin || '17:00',
      tempsPauseMinutes: pointage.tempsPauseMinutes || 60,
      commentaire: pointage.commentaire || ''
    });
    setShowModal(true);
  };

  const handleDeletePointage = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pointage ?')) {
      try {
        await pointageHeuresService.deletePointage(id);
        await loadPointages();
      } catch (error) {
        console.error('Erreur suppression pointage:', error);
        alert('Erreur lors de la suppression du pointage');
      }
    }
  };

  const resetForm = () => {
    const defaultData = {
      userId: '',
      datePointage: pointageHeuresService.formatDate(new Date()),
      typePresence: 'PRESENT',
      lieuTravail: 'ATELIER_CAME',
      heureDebut: '08:00',
      heureFin: '17:00',
      tempsPauseMinutes: 60,
      commentaire: ''
    };
    // Calculer automatiquement les heures travaillées par défaut
    const heures = calculateHeuresTravaillees(defaultData.heureDebut, defaultData.heureFin, defaultData.tempsPauseMinutes);
    setFormData({ ...defaultData, heuresTravaillees: heures });
  };

  // Fonction pour calculer automatiquement les heures travaillées
  const calculateHeuresTravaillees = (heureDebut, heureFin, tempsPauseMinutes = 0) => {
    if (!heureDebut || !heureFin) return 0;
    
    // Convertir les heures en minutes
    const [debutHeure, debutMin] = heureDebut.split(':').map(Number);
    const [finHeure, finMin] = heureFin.split(':').map(Number);
    
    const debutTotalMin = debutHeure * 60 + debutMin;
    const finTotalMin = finHeure * 60 + finMin;
    
    // Calculer la différence en minutes
    let diffMinutes = finTotalMin - debutTotalMin;
    
    // Si l'heure de fin est avant l'heure de début (passage à minuit), ajouter 24h
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }
    
    // Soustraire la pause
    diffMinutes -= tempsPauseMinutes;
    
    // Convertir en heures avec 2 décimales
    return Math.max(0, Math.round((diffMinutes / 60) * 100) / 100);
  };

  const openNewPointageModal = (initialData = {}) => {
    setEditingPointage(null);
    resetForm();
    if (initialData.datePointage) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
    setShowModal(true);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'semaine') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getTypePresenceLabel = (type) => {
    const labels = {
      PRESENT: 'Présent',
      ABSENT: 'Absent',
      RETARD: 'Retard',
      CONGE: 'Congé',
      MALADIE: 'Maladie'
    };
    return labels[type] || type;
  };

  const getTypePresenceColor = (type) => {
    const colors = {
      PRESENT: 'text-green-700 bg-green-100',
      ABSENT: 'text-red-700 bg-red-100',
      RETARD: 'text-orange-700 bg-orange-100',
      CONGE: 'text-blue-700 bg-blue-100',
      MALADIE: 'text-purple-700 bg-purple-100'
    };
    return colors[type] || 'text-gray-700 bg-gray-100';
  };

  const getLieuTravailLabel = (lieu) => {
    const labels = {
      ATELIER_CAME: 'Atelier Came',
      ATELIER_HOSSEGOR: 'Atelier Hossegor',
      CHANTIER: 'Chantier'
    };
    return labels[lieu] || lieu;
  };

  const formatPeriodTitle = () => {
    if (viewMode === 'semaine') {
      const start = pointageHeuresService.getWeekStart(currentDate);
      const end = pointageHeuresService.getWeekEnd(currentDate);
      return `Semaine du ${start.toLocaleDateString('fr-FR')} au ${end.toLocaleDateString('fr-FR')}`;
    } else {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <IconClock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Heures</h1>
              <p className="text-gray-600 mt-1">Suivi des heures de travail de l'équipe</p>
            </div>
          </div>
          
          <button
            onClick={openNewPointageModal}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <IconPlus className="w-5 h-5 mr-2" />
            Nouveau Pointage
          </button>
        </div>
      </div>

      {/* Contrôles de navigation et filtres */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Sélecteur de mode d'affichage */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setDisplayMode('calendrier')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  displayMode === 'calendrier' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconCalendar className="w-4 h-4 mr-2" />
                Calendrier
              </button>
              <button
                onClick={() => setDisplayMode('liste')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  displayMode === 'liste' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconList className="w-4 h-4 mr-2" />
                Liste
              </button>
              <button
                onClick={() => setDisplayMode('stats')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  displayMode === 'stats' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconChartLine className="w-4 h-4 mr-2" />
                Statistiques
              </button>
            </div>

            {/* Navigation temporelle */}
            {displayMode !== 'stats' && (
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('semaine')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'semaine' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setViewMode('mois')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'mois' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mois
                </button>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <IconChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center min-w-[200px]">
                <h3 className="font-semibold text-gray-900">{formatPeriodTitle()}</h3>
              </div>
              
              <button
                onClick={() => navigateDate('next')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <IconChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
            >
              Aujourd'hui
            </button>
          </div>

          {/* Filtres */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <IconUsers className="w-5 h-5 text-gray-500" />
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les employés</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.prenom} {user.nom}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <IconMapPin className="w-5 h-5 text-gray-500" />
              <select
                value={selectedLieu}
                onChange={(e) => setSelectedLieu(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les lieux</option>
                <option value="ATELIER_CAME">Atelier Came</option>
                <option value="ATELIER_HOSSEGOR">Atelier Hossegor</option>
                <option value="CHANTIER">Chantier</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal selon le mode d'affichage */}
      {displayMode === 'calendrier' && (
        <CalendrierHeures
          currentDate={currentDate}
          viewMode={viewMode}
          pointages={pointages}
          users={users}
          onDateChange={setCurrentDate}
          onNavigate={navigateDate}
          onEditPointage={handleEditPointage}
          onNewPointage={openNewPointageModal}
        />
      )}

      {displayMode === 'stats' && (
        <StatistiquesHeures
          currentDate={currentDate}
          viewMode={viewMode}
          selectedUserId={selectedUserId}
          selectedLieu={selectedLieu}
        />
      )}

            {/* Liste des pointages */}
      {displayMode === 'liste' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : pointages.length === 0 ? (
            <div className="p-8 text-center">
              <IconCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun pointage</h3>
              <p className="text-gray-600">Aucun pointage trouvé pour cette période</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Heures
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Présence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lieu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commentaire
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pointages.map((pointage) => (
                    <tr key={pointage.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-blue-700">
                              {pointage.user.prenom[0]}{pointage.user.nom[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {pointage.user.prenom} {pointage.user.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {pointage.user.statutContractuel === 'SALARIE' ? 'Salarié' : 'Sous-traitant'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pointageHeuresService.formatDateDisplay(pointage.datePointage)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {pointage.heuresTravaillees}h
                        </div>
                        {pointage.heureDebut && pointage.heureFin && (
                          <div className="text-xs text-gray-500">
                            {pointage.heureDebut} - {pointage.heureFin}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypePresenceColor(pointage.typePresence)}`}>
                          {getTypePresenceLabel(pointage.typePresence)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getLieuTravailLabel(pointage.lieuTravail)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {pointage.commentaire || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditPointage(pointage)}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded"
                          >
                            <IconEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePointage(pointage.id)}
                            className="text-red-600 hover:text-red-700 p-1 rounded"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de formulaire */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingPointage ? 'Modifier le Pointage' : 'Nouveau Pointage'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                >
                  <IconX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employé
                  </label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un employé</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.prenom} {user.nom} - {user.statutContractuel === 'SALARIE' ? 'Salarié' : 'Sous-traitant'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.datePointage}
                    onChange={(e) => setFormData({ ...formData, datePointage: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure début
                    </label>
                    <input
                      type="time"
                      value={formData.heureDebut}
                      onChange={(e) => {
                        const newFormData = { ...formData, heureDebut: e.target.value };
                        const heures = calculateHeuresTravaillees(newFormData.heureDebut, newFormData.heureFin, newFormData.tempsPauseMinutes);
                        setFormData({ ...newFormData, heuresTravaillees: heures });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure fin
                    </label>
                    <input
                      type="time"
                      value={formData.heureFin}
                      onChange={(e) => {
                        const newFormData = { ...formData, heureFin: e.target.value };
                        const heures = calculateHeuresTravaillees(newFormData.heureDebut, newFormData.heureFin, newFormData.tempsPauseMinutes);
                        setFormData({ ...newFormData, heuresTravaillees: heures });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heures travaillées
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={formData.heuresTravaillees}
                      onChange={(e) => setFormData({ ...formData, heuresTravaillees: parseFloat(e.target.value) })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pause (min)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="480"
                      value={formData.tempsPauseMinutes}
                      onChange={(e) => {
                        const newFormData = { ...formData, tempsPauseMinutes: parseInt(e.target.value) || 0 };
                        const heures = calculateHeuresTravaillees(newFormData.heureDebut, newFormData.heureFin, newFormData.tempsPauseMinutes);
                        setFormData({ ...newFormData, heuresTravaillees: heures });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de présence
                  </label>
                  <select
                    value={formData.typePresence}
                    onChange={(e) => setFormData({ ...formData, typePresence: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PRESENT">Présent</option>
                    <option value="ABSENT">Absent</option>
                    <option value="RETARD">Retard</option>
                    <option value="CONGE">Congé</option>
                    <option value="MALADIE">Maladie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lieu de travail
                  </label>
                  <select
                    value={formData.lieuTravail}
                    onChange={(e) => setFormData({ ...formData, lieuTravail: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ATELIER_CAME">Atelier Came</option>
                    <option value="ATELIER_HOSSEGOR">Atelier Hossegor</option>
                    <option value="CHANTIER">Chantier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commentaire
                  </label>
                  <textarea
                    value={formData.commentaire}
                    onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Commentaire optionnel..."
                  />
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <IconCheck className="w-4 h-4 mr-2" />
                        {editingPointage ? 'Modifier' : 'Créer'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionHeures; 