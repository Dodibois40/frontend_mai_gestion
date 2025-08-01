import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPointages } from '@/services/pointageService';
import { getAffaires } from '@/services/achatService'; // Pour filtrer par affaire
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";
import { useAuth } from '../../contexts/AuthContext';
// Optionnel: pour les vues semaine/jour avec heures
// import timeGridPlugin from '@fullcalendar/timegrid'; 

const PointageCalendarView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pointages, setPointages] = useState([]);
  const [affaires, setAffaires] = useState([]);
  const [selectedAffaire, setSelectedAffaire] = useState('');
  // const [currentDate, setCurrentDate] = useState(new Date()); // Peut être géré par FullCalendar
  const [isLoading, setIsLoading] = useState(false);
  const [viewTitle, setViewTitle] = useState(''); // Pour afficher le titre du calendrier (mois/année)

  // Vérifier si l'utilisateur peut valider les pointages (admin, chef d'atelier, chargé d'affaire)
  const canValidatePointages = user && ['ADMIN_SYS', 'CHEF_ATELIER', 'CHARGE_AFFAIRE'].includes(user.role);

  const fetchPointagesData = useCallback(async (/* calendarApi */) => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedAffaire) params.affaireId = selectedAffaire;
      
      // Optionnel: Récupérer les dates visibles du calendrier pour filtrer les pointages côté backend
      // if (calendarApi) {
      //   const view = calendarApi.view;
      //   params.dateDebut = view.activeStart.toISOString().split('T')[0];
      //   params.dateFin = view.activeEnd.toISOString().split('T')[0];
      // }

      const pointagesData = await getPointages(params);
      setPointages(pointagesData?.pointages || []);

      if (!affaires.length) {
        const affairesData = await getAffaires();
        setAffaires(affairesData || []);
      }

    } catch (error) {
      toast.error("Erreur lors de la récupération des pointages.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedAffaire, affaires.length]);

  useEffect(() => {
    fetchPointagesData();
  }, [fetchPointagesData]);

  const handleDateClick = (arg) => {
    navigate(`/pointages/saisie?date=${arg.dateStr}`);
  };

  const handleEventClick = (clickInfo) => {
    // Naviguer vers la modification du pointage cliqué
    const pointageId = clickInfo.event.extendedProps.id;
    navigate(`/pointages/saisie/${pointageId}`);
  };

  const handleAffaireChange = (affaireId) => {
    if (affaireId === "_TOUTES_AFFAIRES_") {
      setSelectedAffaire(''); 
    } else {
      setSelectedAffaire(affaireId);
    }
  };
  
  const events = pointages.map(p => ({
    id: p.id, // Important pour l'eventClick
    title: `${p.nbHeures}h - ${p.affaire?.numero || 'N/A'} (${p.typeHeure}) - ${p.user?.prenom || ''}`,
    start: p.datePointage, // Doit être au format ISO ou un objet Date
    allDay: true, // Supposer que les pointages sont pour toute la journée pour dayGrid
    extendedProps: p, // Stocker toutes les données du pointage
    // On peut ajouter des couleurs par statut de validation
    backgroundColor: p.valide ? '#34D399' : '#FBBF24',
    borderColor: p.valide ? '#059669' : '#D97706',
  }));

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Calendrier des Pointages {viewTitle && `- ${viewTitle}`}</CardTitle>
              <CardDescription>Cliquez sur une date pour ajouter un pointage ou sur un pointage pour le modifier.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link 
                to="/pointages/saisie"
                className="btn-modern btn-primary inline-flex items-center justify-center px-4 py-2 text-sm font-medium"
              >
                Saisir un pointage
              </Link>
              
              {canValidatePointages && (
                <Link 
                  to="/pointages/validation"
                  className="btn-modern btn-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-medium"
                >
                  Valider les pointages
                </Link>
              )}
              
              <Link 
                to="/pointages/statistiques"
                className="btn-modern btn-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-medium"
              >
                Statistiques
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select onValueChange={handleAffaireChange} value={selectedAffaire}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Filtrer par affaire..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_TOUTES_AFFAIRES_">Toutes les affaires</SelectItem>
                {affaires.map(affaire => (
                  <SelectItem key={affaire.id} value={String(affaire.id)}>
                    {affaire.numero} - {affaire.libelle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#FBBF24' }}></div>
              <span className="text-sm">Non validé</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#34D399' }}></div>
              <span className="text-sm">Validé</span>
            </div>
          </div>

          {isLoading && !events.length ? (
            <p>Chargement du calendrier et des pointages...</p>
          ) : (
            <div className="fc-container"> {/* Conteneur pour potentiels styles customisés */} 
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin /*, timeGridPlugin */ ]}
                initialView="dayGridMonth"
                weekends={true}
                events={events}
                dateClick={handleDateClick}      // Pour cliquer sur une case de date vide
                eventClick={handleEventClick}    // Pour cliquer sur un événement existant
                locale='fr'
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek' // dayGridDay, timeGridWeek, timeGridDay
                }}
                buttonText={{ // Traduire les boutons si nécessaire
                  today:    'Aujourd\'hui',
                  month:    'Mois',
                  week:     'Semaine',
                  day:      'Jour',
                  list:     'Liste'
                }}
                height="auto" // ou une valeur fixe comme 650
                datesSet={(dateInfo) => {
                  setViewTitle(dateInfo.view.title);
                  // Optionnel: relancer fetchPointagesData si on veut filtrer par la vue actuelle
                  // fetchPointagesData(dateInfo.view.calendar);
                }}
                // eventDrop={handleEventDrop} // Pour le drag & drop (nécessite logique de mise à jour)
                // editable={true} // Pour activer le drag & drop
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PointageCalendarView; 