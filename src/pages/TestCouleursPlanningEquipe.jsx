import React from 'react';
import AuthLayout from '../components/AuthLayout';
import TestCouleursPlanningEquipe from '../components/test/TestCouleursPlanningEquipe';

const TestCouleursPlanningEquipePage = () => {
  return (
    <AuthLayout>
      <div className="p-4">
        <TestCouleursPlanningEquipe />
      </div>
    </AuthLayout>
  );
};

export default TestCouleursPlanningEquipePage; 