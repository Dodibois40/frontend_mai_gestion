import React from 'react';
import PropTypes from 'prop-types';
import { usePlanningAffaireData } from '../../../hooks/usePlanningAffaireData';
import CoutMainOeuvreAffaire from './CoutMainOeuvreAffaire';
import AssignmentBadge from '../../ui/AssignmentBadge';
import DroppableZone from '../../ui/DroppableZone';

/**
 * Composant PlanningAffaire - Container principal Design Apple
 * Gère le planning équipe avec filtrage par affaire
 */
const PlanningAffaire = ({ 
  affaireId = null,
  showCosts = true,
  showAffaires = true,
  className = '',
  onAffectationClick = null,
  onAffectationEdit = null,
  onAffectationDelete = null
}) => {
  const {
    planningData,
    loading,
    error,
    currentWeekLabel,
    affecterOuvrier,
    modifierAffectation,
    supprimerAffectation,
    validerAffectation,
    duplicherAffectation,
    getOuvriersDisponibles,
    filtrerParAffaire
  } = usePlanningAffaireData(affaireId);

  /**
   * Gère le drop d'un ouvrier sur une case
   */
  const handleDrop = async (e, draggedData, jour, creneau, affaireTargetId) => {
    try {
      // Récupérer les données de l'ouvrier depuis le drag
      const ouvrierId = draggedData;
      
      // Créer l'affectation
      const affectationData = {
        ouvrierId,
        affaireId: affaireTargetId || affaireId,
        date: jour.date,
        creneau,
        statut: 'planifiee'
      };
      
      await affecterOuvrier(affectationData);
      
    } catch (error) {
      console.error('Erreur lors du drop:', error);
    }
  };

  /**
   * Filtre les affectations par jour et créneau
   */
  const getAffectationsForSlot = (jourDate, creneau) => {
    return planningData.affectations.filter(affectation => 
      affectation.date === jourDate && 
      affectation.creneau === creneau
    );
  };

  /**
   * Génère les jours ouvrables (lundi à vendredi ou toutes les dates selon le mode)
   */
  const getJoursOuvrables = () => {
    if (!planningData.jours || planningData.jours.length === 0) {
      // Si on est dans le mode affaire spécifique, pas de jours par défaut
      if (affaireId) {
        return [];
      }
      
      // Générer des jours par défaut si pas de données pour la vue semaine
      const jours = [];
      const startOfWeek = new Date();
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      for (let i = 0; i < 5; i++) {
        const jour = new Date(startOfWeek);
        jour.setDate(startOfWeek.getDate() + i);
        jours.push({
          date: jour.toISOString().split('T')[0],
          nom: jour.toLocaleDateString('fr-FR', { weekday: 'long' }),
          numero: jour.getDate()
        });
      }
      
      return jours;
    }
    
    return planningData.jours;
  };

  /**
   * Gère l'édition d'une affectation
   */
  const handleEditAffectation = (affectation) => {
    if (onAffectationEdit) {
      onAffectationEdit(affectation);
    }
  };

  /**
   * Gère la suppression d'une affectation
   */
  const handleDeleteAffectation = async (affectation) => {
    if (onAffectationDelete) {
      onAffectationDelete(affectation);
    } else {
      try {
        await supprimerAffectation(affectation.id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  /**
   * Gère le clic sur une affectation
   */
  const handleAffectationClick = (affectation) => {
    if (onAffectationClick) {
      onAffectationClick(affectation);
    }
  };

  const joursOuvrables = getJoursOuvrables();

  if (loading) {
    return (
      <div className="planning-affaire-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du planning...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="planning-affaire-error">
        <p>Erreur : {error}</p>
        <button onClick={() => window.location.reload()}>Recharger</button>
      </div>
    );
  }

  // Si on est dans le mode "affaire spécifique", afficher une vue complète
  if (affaireId && planningData.affectations.length > 0) {
    return (
      <div className={`planning-affaire-complet ${className}`}>
        <div className="planning-header">
          <h3>Planning Complet de l'Affaire</h3>
          <div className="planning-stats">
            <div className="stat-item">
              <span className="stat-label">Total Affectations:</span>
              <span className="stat-value">{planningData.affectations.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Jours Planifiés:</span>
              <span className="stat-value">{joursOuvrables.length}</span>
            </div>
            {planningData.statistiques && (
              <>
                <div className="stat-item">
                  <span className="stat-label">Coût M.O.:</span>
                  <span className="stat-value">{planningData.statistiques.coutMainOeuvre?.toFixed(2) || 0}€</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Vente M.O.:</span>
                  <span className="stat-value">{planningData.statistiques.venteMainOeuvre?.toFixed(2) || 0}€</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Frais Généraux:</span>
                  <span className="stat-value">{planningData.statistiques.fraisGeneraux?.toFixed(2) || 0}€</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="planning-content">
          {/* Affichage par mois */}
          {Object.entries(
            planningData.affectations.reduce((acc, affectation) => {
              const date = new Date(affectation.date);
              const moisAnnee = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              const moisNom = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
              
              if (!acc[moisAnnee]) {
                acc[moisAnnee] = { nom: moisNom, affectations: [] };
              }
              acc[moisAnnee].affectations.push(affectation);
              return acc;
            }, {})
          ).map(([moisAnnee, moisData]) => (
            <div key={moisAnnee} className="month-section">
              <h4 className="month-header">{moisData.nom}</h4>
              <div className="affectations-grid">
                {moisData.affectations.map(affectation => (
                  <div key={affectation.id} className="affectation-card">
                    <div className="affectation-header">
                      <span className="affectation-date">
                        {new Date(affectation.date).toLocaleDateString('fr-FR', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                      <span className="affectation-periode">{affectation.creneau}</span>
                    </div>
                    <div className="affectation-content">
                      <div className="ouvrier-info">
                        <span className="ouvrier-nom">
                          {affectation.ouvrier ? 
                            `${affectation.ouvrier.prenom} ${affectation.ouvrier.nom}` : 
                            'Ouvrier non défini'
                          }
                        </span>
                        {affectation.ouvrier?.couleurPlanning && (
                          <div 
                            className="ouvrier-couleur"
                            style={{ backgroundColor: affectation.ouvrier.couleurPlanning }}
                          />
                        )}
                      </div>
                      <div className="affectation-actions">
                        <button 
                          className="btn-edit"
                          onClick={() => handleEditAffectation(affectation)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteAffectation(affectation)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`planning-affaire ${className}`}>
      {/* Grille planning */}
      <div className="planning-grid">
        {/* Affaires en colonne gauche - Fixe */}
        {showAffaires && (
          <div className="affaires-column">
            <div className="column-header">Affaires</div>
            {planningData.affaires.map(affaire => (
              <div key={affaire.id} className="affaire-item">
                <span className="affaire-number">{affaire.numero}</span>
                <span className="affaire-client">{affaire.client}</span>
                <span className="affaire-date">
                  Début: {new Date(affaire.dateDebut).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Calendrier 5 jours - Scrollable */}
        <div className="calendar-grid">
          <div className="calendar-header">
            {joursOuvrables.map(jour => (
              <div key={jour.date} className="day-header">
                <span className="day-name">{jour.nom}</span>
                <span className="day-date">{jour.numero}</span>
              </div>
            ))}
          </div>
          
          <div className="calendar-body">
            {/* Créneaux horaires */}
            <div className="time-slots">
              <div className="time-slot">MATIN</div>
              <div className="time-slot">APRÈS-MIDI</div>
            </div>
            
            {/* Grille d'affectations */}
            <div className="assignments-grid">
              {joursOuvrables.map(jour => (
                <div key={jour.date} className="day-column">
                  {/* Matin */}
                  <DroppableZone
                    onDrop={(e, draggedData) => handleDrop(e, draggedData, jour, 'matin', affaireId)}
                    className="time-slot-zone"
                    placeholder="Glissez un ouvrier"
                  >
                    {getAffectationsForSlot(jour.date, 'matin').map(affectation => (
                      <AssignmentBadge
                        key={affectation.id}
                        name={affectation.ouvrier?.nom || 'Ouvrier'}
                        color={affectation.ouvrier?.couleur || 'primary'}
                        draggable={true}
                        onClick={() => handleAffectationClick(affectation)}
                        onEdit={() => handleEditAffectation(affectation)}
                        onDelete={() => handleDeleteAffectation(affectation)}
                      />
                    ))}
                  </DroppableZone>
                  
                  {/* Après-midi */}
                  <DroppableZone
                    onDrop={(e, draggedData) => handleDrop(e, draggedData, jour, 'apres-midi', affaireId)}
                    className="time-slot-zone"
                    placeholder="Glissez un ouvrier"
                  >
                    {getAffectationsForSlot(jour.date, 'apres-midi').map(affectation => (
                      <AssignmentBadge
                        key={affectation.id}
                        name={affectation.ouvrier?.nom || 'Ouvrier'}
                        color={affectation.ouvrier?.couleur || 'primary'}
                        draggable={true}
                        onClick={() => handleAffectationClick(affectation)}
                        onEdit={() => handleEditAffectation(affectation)}
                        onDelete={() => handleDeleteAffectation(affectation)}
                      />
                    ))}
                  </DroppableZone>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Coûts main d'œuvre - Sticky bottom */}
      {showCosts && (
        <div className="cost-summary">
          <CoutMainOeuvreAffaire 
            affectations={planningData.affectations}
            affaireId={affaireId}
          />
        </div>
      )}
    </div>
  );
};

PlanningAffaire.propTypes = {
  affaireId: PropTypes.string,
  showCosts: PropTypes.bool,
  showAffaires: PropTypes.bool,
  className: PropTypes.string,
  onAffectationClick: PropTypes.func,
  onAffectationEdit: PropTypes.func,
  onAffectationDelete: PropTypes.func
};

export default PlanningAffaire; 