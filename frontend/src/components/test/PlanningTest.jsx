import React from 'react';
import { usePlanningAffaireData } from '../../hooks/usePlanningAffaireData';

/**
 * Composant de test pour vérifier le planning
 */
const PlanningTest = () => {
  const {
    planningData,
    loading,
    error,
    currentWeekLabel
  } = usePlanningAffaireData();

  if (loading) {
    return <div>Chargement du planning...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test Planning - {currentWeekLabel}</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Données chargées :</h3>
        <ul>
          <li>Affaires: {planningData.affaires?.length || 0}</li>
          <li>Affectations: {planningData.affectations?.length || 0}</li>
          <li>Ouvriers: {planningData.ouvriers?.length || 0}</li>
          <li>Jours: {planningData.jours?.length || 0}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Affaires actives :</h3>
        {planningData.affaires?.map(affaire => (
          <div key={affaire.id} style={{ margin: '5px 0' }}>
            {affaire.numero} - {affaire.client}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Affectations :</h3>
        {planningData.affectations?.map(affectation => (
          <div key={affectation.id} style={{ margin: '5px 0' }}>
            {affectation.ouvrier?.nom} - {affectation.date} - {affectation.creneau}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Statistiques :</h3>
        <pre>{JSON.stringify(planningData.statistiques, null, 2)}</pre>
      </div>
    </div>
  );
};

export default PlanningTest; 