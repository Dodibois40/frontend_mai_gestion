import React, { useState, useEffect } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { format } from 'date-fns';
import planningEquipeService from '../../services/planningEquipeService';
import TrashZone from './TrashZone';
import CoutMainOeuvreSimple from './CoutMainOeuvreSimple';

const PlanningEquipeIntegre = ({ className = '' }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [ouvriers, setOuvriers] = useState({ salaries: [], sousTraitants: [] });
  const [affaires, setAffaires] = useState([]);
  const [affectations, setAffectations] = useState({});
  const [loading, setLoading] = useState(true);
  const [draggedElement, setDraggedElement] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [trashActive, setTrashActive] = useState(false);
  
  // ✅ CORRECTION 1: Nom identique à l'original
  const [statutsAffectation, setStatutsAffectation] = useState({});

  useEffect(() => {
    chargerDonneesPlanning();
  }, [currentWeek]);

  // ✅ CORRECTION 2: Algorithme identique à l'original
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNum;
  };

  const getWeekDates = () => {
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

<<<<<<< HEAD
  // 🚀 OPTIMISATION : Charger séparément les données statiques et dynamiques
  const chargerDonneesInitiales = async () => {
    try {
      const [ouvriersData, affairesData] = await Promise.all([
        planningEquipeService.getOuvriersDisponibles(),
        planningEquipeService.getAffairesActives()
=======
  const chargerDonneesPlanning = async () => {
    try {
      setLoading(true);
      const weekDates = getWeekDates();
      const dateDebut = format(weekDates[0], 'yyyy-MM-dd');

      const [ouvriersData, affairesData, planningData] = await Promise.all([
        planningEquipeService.getOuvriersDisponibles(),
        planningEquipeService.getAffairesActives(),
        planningEquipeService.getPlanningHebdomadaire(dateDebut, false)
>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd
      ]);

      setOuvriers(ouvriersData);
      setAffaires(affairesData);
<<<<<<< HEAD
    } catch (error) {
      console.error('Erreur lors du chargement des données initiales:', error);
    }
  };

  // 🚀 OPTIMISATION : Charger seulement le planning (après modifications)
  const chargerPlanningSeul = async () => {
    try {
      const weekDates = getWeekDates();
      const dateDebut = format(weekDates[0], 'yyyy-MM-dd');

      const planningData = await planningEquipeService.getPlanningHebdomadaire(dateDebut, false);
      setAffectations(convertirAffectations(planningData));
    } catch (error) {
      console.error('Erreur lors du chargement du planning:', error);
    }
  };

  // 🚀 OPTIMISATION : Méthode complète pour changement de semaine uniquement
  const chargerDonneesPlanning = async () => {
    try {
      setLoading(true);
      
      // Charger données initiales ET planning pour changement de semaine
      await Promise.all([
        chargerDonneesInitiales(),
        chargerPlanningSeul()
      ]);
=======
      
      // Convertir les affectations au format attendu
      const affectationsConverties = {};
      if (planningData && planningData.length) {
        planningData.forEach(affectation => {
          const date = new Date(affectation.dateAffectation).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const periode = affectation.periode.toLowerCase() === 'aprem' ? 'aprem' : 'matin';
          const key = `${affectation.affaire.libelle}-${date}-${periode}`;
          
          if (!affectationsConverties[key]) {
            affectationsConverties[key] = [];
          }
          
          // NOUVELLE STRUCTURE - Stocker l'objet complet au lieu du simple nom
          const affectationObj = {
            id: affectation.id,
            nom: affectation.user.prenom || affectation.user.nom,
            user: affectation.user,
            affaire: affectation.affaire,
            periode: affectation.periode,
            dateAffectation: affectation.dateAffectation
          };
          
          affectationsConverties[key].push(affectationObj);
        });
      }
      
      setAffectations(affectationsConverties);
>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  // 🚀 OPTIMISATION : Fonction utilitaire pour convertir les affectations
  const convertirAffectations = (planningData) => {
    const affectationsConverties = {};
    if (planningData && planningData.length) {
      planningData.forEach(affectation => {
        const date = new Date(affectation.dateAffectation).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const periode = affectation.periode.toLowerCase() === 'aprem' ? 'aprem' : 'matin';
        const key = `${affectation.affaire.libelle}-${date}-${periode}`;
        
        if (!affectationsConverties[key]) {
          affectationsConverties[key] = [];
        }
        
        const affectationObj = {
          id: affectation.id,
          nom: affectation.user.prenom || affectation.user.nom,
          user: affectation.user,
          affaire: affectation.affaire,
          periode: affectation.periode,
          dateAffectation: affectation.dateAffectation
        };
        
        affectationsConverties[key].push(affectationObj);
      });
    }
    return affectationsConverties;
  };

=======
>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd
  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const getEmployeeBackgroundColor = (employe) => {
    return employe?.couleurPlanning || '#9CA3AF';
  };

  // ✅ CORRECTION 3: Logique identique à l'original
  const toggleStatutAffectation = (affectationId) => {
    setStatutsAffectation(prev => ({
      ...prev,
      [affectationId]: prev[affectationId] === 'ATELIER' ? 'POSE' : 'ATELIER'
    }));
  };

  // ✅ CORRECTION 4: Statut par défaut identique à l'original
  const getStatutAffectation = (affectationId) => {
    return statutsAffectation[affectationId] || 'POSE';
  };

  // ✅ CORRECTION 5: Drag & drop identique à l'original
  const handleDragStart = (e, employe) => {
    const employeData = {
      type: 'employe',
      nom: employe.prenom || employe.nom,
      prenom: employe.prenom,
      id: employe.id
    };
    
    e.dataTransfer.setData('text/plain', JSON.stringify(employeData));
    setDraggedElement(employeData);
    setShowTrash(true);
  };

  const handleDragStartAffectation = (e, affectation) => {
    const affectationData = {
      type: 'affectation',
      id: affectation.id,
      nom: affectation.user?.prenom || affectation.user?.nom || affectation.nom,
      prenom: affectation.user?.prenom,
      user: affectation.user,
      affaire: affectation.affaire,
      periode: affectation.periode,
      dateAffectation: affectation.dateAffectation
    };
    
    e.dataTransfer.setData('text/plain', JSON.stringify(affectationData));
    setDraggedElement(affectationData);
    setShowTrash(true);
    
    // Feedback visuel
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    setDraggedElement(null);
    setShowTrash(false);
    setTrashActive(false);
    if (e.target) {
      e.target.style.opacity = '1';
    }
  };

  const formatDateForAPI = (date) => {
    // Force la date à être à midi UTC pour éviter les décalages de timezone
    const utcDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
    return utcDate.toISOString();
  };

  // ✅ NOUVELLE FONCTION: Vérifier les conflits d'affectation côté frontend
  const checkConflitAffectation = (userId, date, periode, affaireId) => {
    if (!affectations || !affectations.length) return null;
    
    const dateStr = formatDateForAPI(date).split('T')[0];
    
    // Chercher un conflit pour la même date/période mais affaire différente
    for (const affectation of affectations) {
      if (affectation.user?.id === userId && 
          affectation.dateAffectation.split('T')[0] === dateStr &&
          affectation.periode === periode.toUpperCase() &&
          affectation.affaire?.id !== affaireId) {
        return affectation;
      }
    }
    
    return null;
  };

  // ✅ CORRECTION 6: Gestion drop identique à l'original
  const handleDrop = async (e, affaire, date, periode) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dropZone = e.currentTarget;
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      if (data.type === 'affectation') {
        // DÉPLACEMENT d'une affectation existante
        
        // Vérifier les conflits avant la mise à jour
        const conflitExistant = checkConflitAffectation(data.user?.id, date, periode, affaire.id);
        if (conflitExistant) {
          const nomOuvrier = data.nom || data.prenom || 'Cet ouvrier';
          const dateFormatee = date.toLocaleDateString('fr-FR');
          const periodeText = periode === 'MATIN' ? 'matin' : 'après-midi';
          const affaireConflict = conflitExistant.affaire?.numero || conflitExistant.affaire?.libelle;
          
          const confirmer = confirm(`⚠️ CONFLIT D'AFFECTATION DÉTECTÉ
          
${nomOuvrier} est déjà affecté à l'affaire "${affaireConflict}" pour le ${dateFormatee} ${periodeText}.

Voulez-vous continuer ? Cela remplacera l'affectation existante.

✅ OUI = Remplacer l'affectation
❌ NON = Annuler l'opération`);
          
          if (!confirmer) {
            return; // Annuler l'opération
          }
        }
        
        const updateData = {
          affaireId: affaire.id,
          dateAffectation: formatDateForAPI(date),
          periode: periode.toUpperCase()
        };
        
        await planningEquipeService.updateAffectation(data.id, updateData);
<<<<<<< HEAD
        await chargerPlanningSeul(); // 🚀 OPTIMISATION : Charger seulement le planning
=======
        await chargerDonneesPlanning();
>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd
      } else {
        // CRÉATION d'une nouvelle affectation
        
        // Vérifier les conflits avant la création
        const conflitExistant = checkConflitAffectation(data.id, date, periode, affaire.id);
        if (conflitExistant) {
          const nomOuvrier = data.nom || data.prenom || 'Cet ouvrier';
          const dateFormatee = date.toLocaleDateString('fr-FR');
          const periodeText = periode === 'MATIN' ? 'matin' : 'après-midi';
          const affaireConflict = conflitExistant.affaire?.numero || conflitExistant.affaire?.libelle;
          
          alert(`⚠️ CONFLIT D'AFFECTATION
          
${nomOuvrier} est déjà affecté à l'affaire "${affaireConflict}" pour le ${dateFormatee} ${periodeText}.

Solutions possibles :
• Supprimer l'affectation existante en la glissant vers la poubelle
• Choisir une autre période (matin/après-midi)
• Choisir une autre date
• Utiliser un autre ouvrier disponible`);
          
          return; // Annuler l'opération
        }
        
        const affectationData = {
          affaireId: affaire.id,
          userId: data.id,
          dateAffectation: formatDateForAPI(date),
          periode: periode.toUpperCase(),
          typeActivite: 'FABRICATION'
        };
        
        await planningEquipeService.affecterOuvrier(affectationData);
<<<<<<< HEAD
        await chargerPlanningSeul(); // 🚀 OPTIMISATION : Charger seulement le planning
=======
        await chargerDonneesPlanning();
>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd
      }
      
      // Animation de succès
      dropZone.style.backgroundColor = '#dcfce7';
      dropZone.style.borderColor = '#16a34a';
      setTimeout(() => {
        if (dropZone) {
          dropZone.style.backgroundColor = '';
          dropZone.style.borderColor = '';
        }
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error);
      
      // Gestion spécifique des erreurs de conflit
      if (error.response?.status === 409) {
        const nomOuvrier = data.nom || data.prenom || 'Cet ouvrier';
        const dateFormatee = date.toLocaleDateString('fr-FR');
        const periodeText = periode === 'MATIN' ? 'matin' : 'après-midi';
        
        alert(`⚠️ CONFLIT D'AFFECTATION
        
${nomOuvrier} est déjà affecté à une autre affaire pour le ${dateFormatee} ${periodeText}.

Solutions possibles :
• Supprimer l'affectation existante en la glissant vers la poubelle
• Choisir une autre période (matin/après-midi)
• Choisir une autre date
• Utiliser un autre ouvrier disponible`);
      } else {
        // Autres erreurs
        alert(`❌ Erreur lors de l'affectation : ${error.response?.data?.message || error.message}`);
      }
      
      // Animation d'erreur
      dropZone.style.backgroundColor = '#fee2e2';
      dropZone.style.borderColor = '#dc2626';
      setTimeout(() => {
        if (dropZone) {
          dropZone.style.backgroundColor = '';
          dropZone.style.borderColor = '';
        }
      }, 1000);
    } finally {
      setDraggedElement(null);
      setShowTrash(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '#f0fdf4';
    e.currentTarget.style.borderColor = '#22c55e';
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = '';
    e.currentTarget.style.borderColor = '';
  };

  const handleTrashDragOver = (e) => {
    e.preventDefault();
    if (!trashActive) {
      setTrashActive(true);
    }
  };

  const handleTrashDragLeave = (e) => {
    e.preventDefault();
    setTrashActive(false);
  };

  const handleTrashDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setTrashActive(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      if (data.type === 'affectation') {
        await planningEquipeService.desaffecterOuvrier(data.id);
<<<<<<< HEAD
        await chargerPlanningSeul(); // 🚀 OPTIMISATION : Charger seulement le planning
=======
        await chargerDonneesPlanning();
>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setDraggedElement(null);
      setShowTrash(false);
    }
  };

  const transformAffectationsForCoutMainOeuvre = (affectations) => {
    const transformedData = {};
    
    Object.entries(affectations).forEach(([key, affectationsList]) => {
      affectationsList.forEach(affectation => {
        const affaireId = affectation.affaire?.id;
        if (!affaireId) return;
        
        if (!transformedData[affaireId]) {
          transformedData[affaireId] = [];
        }
        
        transformedData[affaireId].push({
          id: affectation.id,
          userId: affectation.user?.id,
          dateAffectation: affectation.dateAffectation,
          periode: affectation.periode,
          typeActivite: getStatutAffectation(affectation.id) === 'POSE' ? 'POSE' : 'FABRICATION',
          user: affectation.user,
          affaire: affectation.affaire
        });
      });
    });
    
    return transformedData;
  };

  const weekDates = getWeekDates();
  const weekNumber = getWeekNumber(currentWeek);

  return (
    <div className={`planning-equipe-integre ${className}`}>
      {/* Titre principal */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-700">PLANNING DES AFFAIRES</h2>
        <div className="mt-6 flex flex-col items-center">
          <div className="flex items-center justify-center gap-6 mb-4">
            {/* Légende POSE/ATELIER */}
            <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-500 border-2 border-green-500"></span>
                <span className="font-medium text-gray-700">Contour vert = POSE</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-500"></span>
                <span className="font-medium text-gray-700">Pas de contour = ATELIER</span>
              </span>
              <span className="text-xs text-gray-500 ml-2 italic">
                (Double-clic pour changer)
              </span>
            </div>
          </div>
          <div className="flex gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-200 border border-green-300"></span>
              Chef d'Atelier
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-200 border border-blue-300"></span>
              Chef de Chantier
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-200 border border-purple-300"></span>
              Ouvrier Atelier
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-200 border border-cyan-300"></span>
              Ouvrier Chantier
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-200 border border-orange-300"></span>
              Sous-traitant
            </span>
          </div>
        </div>
      </div>

      {/* Zone d'employés unifiée */}
      <div className="mb-8">
        {/* Ligne Salarié */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-32 text-lg font-medium text-gray-600">
            Salarié 
            <span className="text-sm text-gray-400 ml-1">({ouvriers.salaries?.length || 0})</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {loading ? <div className="text-gray-500">Chargement...</div> : (
              ouvriers.salaries?.map((salarie) => (
                <button
                  key={salarie.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, salarie)}
                  onDragEnd={handleDragEnd}
                  className="px-6 py-3 rounded-full font-semibold text-base transition-all duration-200 
                    hover:scale-105 hover:shadow-md cursor-grab active:cursor-grabbing"
                  style={{
                    backgroundColor: getEmployeeBackgroundColor(salarie),
                    color: '#ffffff'
                  }}
                >
                  {salarie.prenom || salarie.nom}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Ligne Sous traitant */}
        <div className="flex items-center gap-4">
          <div className="w-32 text-lg font-medium text-gray-600">
            Sous traitant
            <span className="text-sm text-gray-400 ml-1">({ouvriers.sousTraitants?.length || 0})</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {loading ? <div className="text-gray-500">Chargement...</div> : (
              ouvriers.sousTraitants?.map((soustraitant) => (
                <button
                  key={soustraitant.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, soustraitant)}
                  onDragEnd={handleDragEnd}
                  className="px-6 py-3 rounded-full font-semibold text-base transition-all duration-200 
                    hover:scale-105 hover:shadow-md cursor-grab active:cursor-grabbing"
                  style={{
                    backgroundColor: getEmployeeBackgroundColor(soustraitant),
                    color: '#ffffff'
                  }}
                >
                  {soustraitant.prenom || soustraitant.nom}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Planning Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[300px_repeat(5,1fr)] gap-0">
          <div className="bg-gray-50 border-b border-r border-gray-200 p-4 font-semibold text-gray-600">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <IconChevronLeft size={20} />
                </button>
                <div className="bg-gray-100 px-4 py-2 rounded-lg shadow-sm">
                  <span className="text-base font-semibold text-gray-700">Semaine {weekNumber}</span>
                </div>
                <button
                  onClick={() => navigateWeek(1)}
                  className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <IconChevronRight size={20} />
                </button>
              </div>
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors duration-200 shadow-sm text-sm font-medium"
              >
                Aujourd'hui ({new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })})
              </button>
            </div>
          </div>
          
          {weekDates.map((date, index) => (
            <div key={index} className="bg-gray-50 border-b border-r border-gray-200 p-4 text-center">
              <div className="text-lg font-bold text-gray-600">{date.toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase()}</div>
              <div className="text-base font-semibold text-gray-500">{date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-gray-100 p-2 rounded text-sm font-medium text-gray-500">MATIN</div>
                <div className="bg-gray-100 p-2 rounded text-sm font-medium text-gray-500">APREM</div>
              </div>
            </div>
          ))}

          {loading ? (
            <div className="col-span-6 text-center py-16 text-gray-500">Chargement des affaires...</div>
          ) : (
            affaires.map((affaire) => (
              <React.Fragment key={affaire.id}>
                <div className="bg-gray-50 border-b border-r border-gray-200 p-4 flex flex-col justify-center">
                  <div className="text-lg font-bold text-gray-700">{affaire.libelle}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span>Livraison le </span>
                    <span className="font-medium">
                      {affaire.dateCloturePrevue ? new Date(affaire.dateCloturePrevue).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                  </div>
                </div>
                
                {weekDates.map((date, jourIndex) => (
                  <div key={jourIndex} className="border-b border-r border-gray-200 p-2">
                    <div className="grid grid-cols-2 gap-2 h-[210px]">
                      {['matin', 'aprem'].map(periode => {
                        const dateString = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        const key = `${affaire.libelle}-${dateString}-${periode}`;
                        return (
                          <div 
                            key={periode}
                            className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 min-h-[190px] flex flex-wrap gap-1 items-start content-start transition-colors duration-200"
                            onDrop={(e) => handleDrop(e, affaire, date, periode)}
                            onDragOver={(e) => handleDragOver(e)}
                            onDragLeave={(e) => handleDragLeave(e)}
                          >
                            {affectations[key]?.map((affectation, index) => {
                              const statutActuel = getStatutAffectation(affectation.id || `${key}-${index}`);
                              const styleContour = statutActuel === 'POSE' ? {
                                border: '4px solid #22c55e',
                                boxShadow: '0 0 0 2px #16a34a'
                              } : {};
                              
                              return (
                                <span
                                  key={index}
                                  draggable
                                  className="block w-full px-4 py-3 rounded-full text-sm font-semibold cursor-grab hover:cursor-grabbing 
                                    hover:scale-105 transition-all duration-200 mb-2 text-center"
                                  style={{
                                    backgroundColor: affectation.user ? getEmployeeBackgroundColor(affectation.user) : '#9CA3AF',
                                    color: '#ffffff',
                                    ...styleContour
                                  }}
                                  onDragStart={(e) => handleDragStartAffectation(e, affectation)}
                                  onDragEnd={handleDragEnd}
                                  onDoubleClick={() => toggleStatutAffectation(affectation.id || `${key}-${index}`)}
                                  title={`Double-clic pour changer: ${statutActuel === 'POSE' ? 'POSE → ATELIER' : 'ATELIER → POSE'}`}
                                >
                                  {affectation.nom}
                                </span>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))
          )}
        </div>
      </div>
      
      {/* Coûts de Main d'Œuvre */}
      <div className="mt-8">
        <CoutMainOeuvreSimple 
          planningData={transformAffectationsForCoutMainOeuvre(affectations)}
          ouvriers={ouvriers}
          affaires={affaires}
          weekDays={getWeekDates()}
          loading={loading}
          className="w-full"
        />
      </div>
      
      {/* Corbeille flottante */}
      <TrashZone
        isVisible={showTrash}
        isActive={trashActive}
        onDrop={handleTrashDrop}
        onDragOver={handleTrashDragOver}
        onDragLeave={handleTrashDragLeave}
      />
    </div>
  );
};

export default PlanningEquipeIntegre; 