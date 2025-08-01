import React from 'react';
import PlanningContainer from '../components/planning-interactif/PlanningContainer';

const PlanningInteractifFullPage = () => {
  return (
    <div className="h-full">
      <PlanningContainer isFullPage={true} />
    </div>
  );
};

export default PlanningInteractifFullPage; 