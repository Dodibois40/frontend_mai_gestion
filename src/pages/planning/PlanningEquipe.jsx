import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { startOfWeek, endOfWeek, format, addDays, getWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import planningEquipeService from '../../services/planningEquipeService';
import TrashZone from '../../components/planning-equipe/TrashZone';
import CoutMainOeuvreSimple from '../../components/planning-equipe/CoutMainOeuvreSimple';
import BoutonSuppressionAffectations from '../../components/planning-equipe/BoutonSuppressionAffectations';

/**
 * PLANNING DES AFFAIRES - Connecté au Backend
 */
const PlanningEquipe = () => {
  // États pour les données du backend
  const [affectations, setAffectations] = useState({});
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [ouvriers, setOuvriers] = useState({ salaries: [], sousTraitants: [] });
  const [affaires, setAffaires] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le drag & drop - SIMPLIFIÉ
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [trashActive, setTrashActive] = useState(false);
  
  // État pour gérer POSE/ATELIER - clé: affectationId ou userKey, valeur: 'POSE' ou 'ATELIER'
  const [statutsAffectation, setStatutsAffectation] = useState({});

  // Calculer le numéro de semaine
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNum;
  };

  // Obtenir les dates de la semaine (du lundi au vendredi) - même logique que le backend
  const getWeekDates = () => {
    // Utiliser la même logique que le backend : startOfWeek avec weekStartsOn: 1 (lundi)
    const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
    
    // Générer les 5 jours (lundi à vendredi)
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  // Fonction pour charger les données du planning
  const chargerDonneesPlanning = async () => {
    try {
      setLoading(true);
      // Utiliser exactement la même logique que le backend
      const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const dateDebut = format(startDate, 'yyyy-MM-dd');
      const weekDatesDebug = getWeekDates();
      
      const [ouvriersData, affairesData, planningData] = await Promise.all([
        planningEquipeService.getOuvriersDisponibles(),
        planningEquipeService.getAffairesActives(),
        planningEquipeService.getPlanningHebdomadaire(dateDebut, false)
      ]);
      
      setOuvriers(ouvriersData);
      setAffaires(affairesData);
      
      // Réinitialiser les affectations avant de les remplir
      const affectationsConverties = {};
      if (planningData && planningData.length) {
        planningData.forEach(affectation => {
          const date = new Date(affectation.dateAffectation).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const key = `${affectation.affaire.libelle}-${date}-${affectation.periode.toLowerCase()}`;
          
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
      
    } catch (error) {
      console.error('❌ [PlanningEquipe] Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données. Voir la console pour les détails.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage et quand la semaine change
  useEffect(() => {
    chargerDonneesPlanning();
  }, [currentWeek]);

  // Navigation semaine
  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  // Drag and Drop handlers
  // Fonction pour les couleurs de fond selon le rôle (conservée pour référence)
  const getEmployeeBackgroundClass = (employe) => {
    // Utiliser la couleur personnalisée de l'utilisateur si disponible
    if (employe?.couleurPlanning) {
      return `text-white`;
    }
    
    // Fallback sur les couleurs de rôles si pas de couleur personnalisée
    const roleClasses = {
      'CHEF_ATELIER': 'bg-green-200 text-green-800',
      'CHEF_CHANTIER': 'bg-blue-200 text-blue-800',
      'OUVRIER_ATELIER': 'bg-purple-200 text-purple-800',
      'OUVRIER_CHANTIER': 'bg-cyan-200 text-cyan-800',
      'SOUS_TRAITANT': 'bg-orange-200 text-orange-800'
    };
    const role = typeof employe === 'string' ? employe : employe?.role;
    return roleClasses[role] || 'bg-gray-200 text-gray-800';
  };

  // Fonction pour obtenir la couleur de fond directe
  const getEmployeeBackgroundColor = (employe) => {
    return employe?.couleurPlanning || '#9CA3AF';
  };

  // Fonction pour basculer entre POSE et ATELIER
  const toggleStatutAffectation = (affectationId) => {
    setStatutsAffectation(prev => ({
      ...prev,
      [affectationId]: prev[affectationId] === 'ATELIER' ? 'POSE' : 'ATELIER'
    }));
  };

  // Fonction pour obtenir le statut d'une affectation (POSE par défaut)
  const getStatutAffectation = (affectationId) => {
    return statutsAffectation[affectationId] || 'POSE';
  };

  // Fonction pour calculer la couleur de texte contrastée
  const getContrastTextColor = (backgroundColor) => {
    if (!backgroundColor) return '#000000';
    
    // Convertir hex en RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculer la luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Retourner blanc si sombre, noir si clair
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  // Handler pour drag d'employé depuis la liste
  const handleDragStart = (e, employe) => {
    const employeData = {
      type: 'employe',
      nom: employe.prenom || employe.nom,
      prenom: employe.prenom,
      id: employe.id
    };
    
    e.dataTransfer.setData('text/plain', JSON.stringify(employeData));
    setDraggedItem(employeData);
    setIsDragging(true);
    setShowTrash(true);
  };

  // Handler pour drag d'affectation existante
  const handleDragStartAffectation = (e, affectation) => {
    const affectationData = {
      type: 'affectation',
      id: affectation.id,
      nom: affectation.nom,
      user: affectation.user,
      affaire: affectation.affaire,
      periode: affectation.periode,
      dateAffectation: affectation.dateAffectation
    };
    
    e.dataTransfer.setData('text/plain', JSON.stringify(affectationData));
    setDraggedItem(affectationData);
    setIsDragging(true);
    setShowTrash(true);
    
    // Feedback visuel
    e.target.style.opacity = '0.5';
  };

  // Handler de fin de drag
  const handleDragEnd = (e) => {
    setIsDragging(false);
    setShowTrash(false);
    setTrashActive(false);
    setDraggedItem(null);
    if (e.target) {
      e.target.style.opacity = '1';
    }
  };

  // Handler drop sur créneau - SIMPLIFIÉ
  const handleDrop = async (e, affaire, date, periode) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dropZone = e.currentTarget;
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      if (data.type === 'affectation') {
        // DÉPLACEMENT d'une affectation existante
        await deplacerAffectationSimple(data, affaire, date, periode);
      } else {
        // CRÉATION d'une nouvelle affectation
        await creerAffectationSimple(data, affaire, date, periode);
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
      console.error('❌ [DROP] Erreur:', error);
      toast.error(error.message || 'Erreur lors de l\'opération');
      
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
      setDraggedItem(null);
      setIsDragging(false);
      setShowTrash(false);
    }
  };

  // Fonction utilitaire pour éviter les problèmes de timezone
  const formatDateForAPI = (date) => {
    // Force la date à être à midi UTC pour éviter les décalages de timezone
    const utcDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
    return utcDate.toISOString();
  };

  // Fonction de déplacement simplifiée
  const deplacerAffectationSimple = async (affectationData, nouvelleAffaire, nouvelleDate, nouvellePeriode) => {
    const updateData = {
      affaireId: nouvelleAffaire.id,
      dateAffectation: formatDateForAPI(nouvelleDate),
      periode: nouvellePeriode.toUpperCase()
    };

    try {
      await planningEquipeService.updateAffectation(affectationData.id, updateData);
      toast.success(`${affectationData.nom} déplacé vers ${nouvelleAffaire.libelle}`);
      await chargerDonneesPlanning();
      
    } catch (error) {
      console.error('❌ [DÉPLACEMENT] Erreur:', error);
      toast.error('Erreur lors du déplacement');
      throw error;
    }
  };

  // Fonction de création simplifiée
  const creerAffectationSimple = async (employeData, affaire, date, periode) => {
    const affectationData = {
      affaireId: affaire.id,
      userId: employeData.id,
      dateAffectation: formatDateForAPI(date),
      periode: periode.toUpperCase(),
      typeActivite: 'FABRICATION'
    };

    await planningEquipeService.affecterOuvrier(affectationData);
    toast.success(`${employeData.nom} affecté à ${affaire.libelle}`);
    await chargerDonneesPlanning();
  };

  // Handlers simplifiés pour les zones
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '#f0fdf4';
    e.currentTarget.style.borderColor = '#22c55e';
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = '';
    e.currentTarget.style.borderColor = '';
  };

  // Handlers améliorés pour la corbeille
  const handleTrashDragOver = (e) => {
    e.preventDefault();
    // Plus stable - ne change l'état que si nécessaire
    if (!trashActive) {
      setTrashActive(true);
    }
  };

  const handleTrashDragLeave = (e) => {
    e.preventDefault();
    // Délai géré dans le composant TrashZone
    setTrashActive(false);
  };

  const handleTrashDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Animation de feedback immédiat
    setTrashActive(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      if (data.type === 'affectation') {
        console.log('🗑️ [CORBEILLE] Suppression de:', data.nom);
        await planningEquipeService.desaffecterOuvrier(data.id);
        toast.success(`${data.nom} retiré du planning`);
        await chargerDonneesPlanning();
        console.log('✅ [CORBEILLE] Suppression réussie');
      } else {
        toast.info('Seules les affectations peuvent être supprimées');
      }
    } catch (error) {
      console.error('❌ [CORBEILLE] Erreur:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      // Nettoyage des états
      setDraggedItem(null);
      setShowTrash(false);
      setIsDragging(false);
      setTrashActive(false);
    }
  };

  const weekDates = getWeekDates();
  const weekNumber = getWeekNumber(currentWeek);
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Fonction pour transformer les affectations au format attendu par CoutMainOeuvre
  const transformAffectationsForCoutMainOeuvre = (affectations) => {
    const transformedData = {};
    
    // Parcourir toutes les affectations
    Object.entries(affectations).forEach(([key, affectationsList]) => {
      // Extraire l'affaire du nom de clé (format: "libelle-date-periode")
      const affaireLibelle = key.split('-').slice(0, -2).join('-');
      
      affectationsList.forEach(affectation => {
        const affaireId = affectation.affaire?.id;
        if (!affaireId) return;
        
        if (!transformedData[affaireId]) {
          transformedData[affaireId] = [];
        }
        
        // Ajouter l'affectation transformée
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

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Planning Équipe</h1>
              <p className="text-gray-500 capitalize">{today}</p>
            </div>
            <div className="flex items-center gap-4">
              <BoutonSuppressionAffectations onAffectationsDeleted={chargerDonneesPlanning} />
            </div>
          </div>
        </div>

        {/* Titre Principal */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-700">PLANNING DES AFFAIRES</h2>
        </div>

        {/* Section Gestion Équipe */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-600">Gestion Équipe</h3>
            <div className="flex gap-6 text-sm text-gray-500">
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
                    className={`px-6 py-3 rounded-full font-semibold text-base transition-all duration-200 
                      hover:scale-105 hover:shadow-md cursor-grab active:cursor-grabbing`}
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
                    className={`px-6 py-3 rounded-full font-semibold text-base transition-all duration-200 
                      hover:scale-105 hover:shadow-md cursor-grab active:cursor-grabbing`}
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
                                    className={`block w-full px-4 py-3 rounded-full text-sm font-semibold cursor-grab hover:cursor-grabbing 
                                      hover:scale-105 transition-all duration-200 mb-2 text-center`}
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

export default PlanningEquipe; 