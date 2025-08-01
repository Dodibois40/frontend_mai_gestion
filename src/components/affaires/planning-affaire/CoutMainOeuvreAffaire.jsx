import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import planningAffaireService from '../../../services/planningAffaireService';
import { calculerTotauxHistoriquesAffaire, formatEuros } from '../../../utils/affairesHistorique';

/**
 * Composant CoutMainOeuvreAffaire - Design Apple
 * Calcul des coûts main d'œuvre pour une affaire spécifique
 */
const CoutMainOeuvreAffaire = ({ 
  affectations = [],
  affaireId = null,
  showDetails = true,
  showMutualisation = true,
  className = '',
  affaireData = null // Nouvelles données d'affaire pour les calculs historiques
}) => {
  const [couts, setCouts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [historiquesOuvriers, setHistoriquesOuvriers] = useState({});
  const [totauxHistoriques, setTotauxHistoriques] = useState(null);

  /**
   * Calcule les coûts main d'œuvre avec données historiques
   */
  const calculerCouts = async () => {
    if (!affectations || affectations.length === 0) {
      setCouts(null);
      setTotauxHistoriques(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calcul classique des coûts pour la semaine courante
      const response = await planningAffaireService.calculerCouts(affectations, affaireId);
      setCouts(response);

      // Calcul des totaux historiques si les données d'affaire sont disponibles
      if (affaireData) {
        const totauxHist = await calculerTotauxHistoriquesAffaire(
          affaireData, 
          historiquesOuvriers, 
          setHistoriquesOuvriers
        );
        setTotauxHistoriques(totauxHist);
      }
    } catch (err) {
      setError('Erreur lors du calcul des coûts');
      console.error('Erreur calcul coûts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Recalculer lors du changement d'affectations ou d'affaire
  useEffect(() => {
    calculerCouts();
  }, [affectations, affaireId, affaireData]);

  /**
   * Calcule le coût par affectation avec mutualisation
   */
  const calculerMutualisationDynamique = () => {
    if (!affectations || affectations.length === 0) return 0;

    const BASE_FIXE = 2542.90; // Base fixe hebdomadaire
    const nombreAffectations = affectations.length;
    
    return nombreAffectations > 0 ? BASE_FIXE / nombreAffectations : 0;
  };

  /**
   * Formate un montant en euros
   */
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(montant || 0);
  };

  /**
   * Calcule les statistiques détaillées
   */
  const getStatistiquesDetaillees = () => {
    if (!affectations || affectations.length === 0) return null;

    const stats = {
      totalAffectations: affectations.length,
      affectationsMatin: affectations.filter(a => a.creneau === 'matin').length,
      affectationsApresMidi: affectations.filter(a => a.creneau === 'apres-midi').length,
      joursOuvres: new Set(affectations.map(a => a.date)).size,
      ouvriersUniques: new Set(affectations.map(a => a.ouvrierId)).size
    };

    return stats;
  };

  const coutParAffectation = calculerMutualisationDynamique();
  const coutTotal = coutParAffectation * (affectations?.length || 0);
  const stats = getStatistiquesDetaillees();

  // Utiliser les totaux historiques s'ils sont disponibles
  const affichageTotaux = totauxHistoriques && totauxHistoriques.historiquesDisponibles ? totauxHistoriques : {
    totalAffectations: affectations?.length || 0,
    totalCoutTotal: coutTotal,
    totalVenteTotal: coutTotal, // À ajuster selon la logique métier
    historiquesDisponibles: false
  };

  if (loading) {
    return (
      <div className="cout-main-oeuvre-loading">
        <div className="loading-spinner"></div>
        <span>Calcul des coûts...</span>
      </div>
    );
  }

  if (!affectations || affectations.length === 0) {
    return (
      <div className="cout-main-oeuvre-empty">
        <span>Aucune affectation pour calculer les coûts</span>
      </div>
    );
  }

  return (
    <div className={`cout-main-oeuvre-affaire ${className}`}>
      {/* Résumé principal */}
      <div className="cout-resume">
        <div className="cout-item-principal">
          <span className="cout-label">
            Coût Total Main d'Œuvre {affichageTotaux.historiquesDisponibles ? '(Historique complet)' : '(Semaine courante)'}
          </span>
          <span className="cout-value">{formatEuros(affichageTotaux.totalCoutTotal)}</span>
        </div>

        {showMutualisation && (
          <div className="cout-item-secondaire">
            <span className="cout-label">Coût par affectation</span>
            <span className="cout-value">{formatEuros(coutParAffectation)}</span>
          </div>
        )}

        <div className="cout-item-secondaire">
          <span className="cout-label">
            Nombre d'affectations {affichageTotaux.historiquesDisponibles ? '(Total)' : '(Semaine)'}
          </span>
          <span className="cout-value">{affichageTotaux.totalAffectations}</span>
        </div>

        {affichageTotaux.historiquesDisponibles && (
          <div className="cout-item-secondaire">
            <span className="cout-label">Vente Totale Historique</span>
            <span className="cout-value">{formatEuros(affichageTotaux.totalVenteTotal)}</span>
          </div>
        )}

        {showDetails && (
          <button 
            className="cout-toggle-details"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▼' : '▶'} Détails
          </button>
        )}
      </div>

      {/* Détails expandables */}
      {expanded && showDetails && stats && (
        <div className="cout-details">
          <div className="cout-details-grid">
            <div className="cout-detail-item">
              <span className="detail-label">Affectations matin</span>
              <span className="detail-value">{stats.affectationsMatin}</span>
            </div>
            
            <div className="cout-detail-item">
              <span className="detail-label">Affectations après-midi</span>
              <span className="detail-value">{stats.affectationsApresMidi}</span>
            </div>
            
            <div className="cout-detail-item">
              <span className="detail-label">Jours ouvrés</span>
              <span className="detail-value">{stats.joursOuvres}</span>
            </div>
            
            <div className="cout-detail-item">
              <span className="detail-label">Ouvriers uniques</span>
              <span className="detail-value">{stats.ouvriersUniques}</span>
            </div>
          </div>

          {showMutualisation && (
            <div className="cout-mutualisation-details">
              <h4>Mutualisation Dynamique</h4>
              <p>
                Base fixe hebdomadaire : <strong>{formatEuros(2542.90)}</strong>
              </p>
              <p>
                Répartie sur <strong>{affectations.length}</strong> affectations
              </p>
              <p>
                Formule : {formatEuros(2542.90)} ÷ {affectations.length} = {formatEuros(coutParAffectation)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="cout-error">
          <span>⚠️ {error}</span>
          <button onClick={calculerCouts} className="retry-button">
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
};

CoutMainOeuvreAffaire.propTypes = {
  affectations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      ouvrierId: PropTypes.string.isRequired,
      affaireId: PropTypes.string,
      date: PropTypes.string.isRequired,
      creneau: PropTypes.oneOf(['matin', 'apres-midi']).isRequired,
      statut: PropTypes.string
    })
  ),
  affaireId: PropTypes.string,
  showDetails: PropTypes.bool,
  showMutualisation: PropTypes.bool,
  className: PropTypes.string,
  affaireData: PropTypes.object // Données d'affaire pour calculs historiques
};

export default CoutMainOeuvreAffaire; 