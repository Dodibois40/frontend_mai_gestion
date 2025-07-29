import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import CoutMainOeuvreSimple from '../planning-equipe/CoutMainOeuvreSimple';
import planningEquipeService from '../../services/planningEquipeService';

const TestCouleursPlanningAffaires = () => {
  const [planningData, setPlanningData] = useState([]);
  const [ouvriers, setOuvriers] = useState({ salaries: [], sousTraitants: [] });
  const [affaires, setAffaires] = useState([]);
  const [loading, setLoading] = useState(true);

  // Générer une semaine de dates (lundi à vendredi)
  const getWeekDates = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const dateDebut = weekDates[0].toISOString().split('T')[0];
      
      const [ouvriersData, affairesData, planningDataResponse] = await Promise.all([
        planningEquipeService.getOuvriersDisponibles(),
        planningEquipeService.getAffairesActives(),
        planningEquipeService.getPlanningHebdomadaire(dateDebut, false)
      ]);
      
      setOuvriers(ouvriersData);
      setAffaires(affairesData);
      setPlanningData(planningDataResponse || []);
      
      console.log('📊 [TEST] Données chargées:', {
        ouvriers: ouvriersData,
        affaires: affairesData,
        planning: planningDataResponse
      });
      
    } catch (error) {
      console.error('❌ [TEST] Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test des Couleurs - Planning Affaires</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Aperçu des Couleurs des Utilisateurs</h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          ) : (
            <div className="space-y-4">
              {/* Salariés */}
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Salariés ({ouvriers.salaries?.length || 0})</h3>
                <div className="flex flex-wrap gap-2">
                  {ouvriers.salaries?.map((salarie) => (
                    <div
                      key={salarie.id}
                      className="px-4 py-2 rounded-full font-semibold text-white text-sm shadow-md"
                      style={{
                        backgroundColor: salarie.couleurPlanning || '#9CA3AF',
                        color: '#ffffff'
                      }}
                    >
                      {salarie.prenom || salarie.nom}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sous-traitants */}
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Sous-traitants ({ouvriers.sousTraitants?.length || 0})</h3>
                <div className="flex flex-wrap gap-2">
                  {ouvriers.sousTraitants?.map((soustraitant) => (
                    <div
                      key={soustraitant.id}
                      className="px-4 py-2 rounded-full font-semibold text-white text-sm shadow-md"
                      style={{
                        backgroundColor: soustraitant.couleurPlanning || '#9CA3AF',
                        color: '#ffffff'
                      }}
                    >
                      {soustraitant.prenom || soustraitant.nom}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Composant de coût main d'œuvre avec couleurs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Coût Main d'Œuvre avec Couleurs</h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          ) : (
            <CoutMainOeuvreSimple
              planningData={planningData}
              ouvriers={ouvriers}
              affaires={affaires}
              weekDays={weekDates}
              loading={loading}
              className="test-couleurs"
            />
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-800 mb-2">📝 Test en cours :</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ Les noms d'utilisateurs dans le coût main d'œuvre ont maintenant les mêmes couleurs que dans le planning</li>
            <li>🎨 Chaque utilisateur conserve sa couleur personnalisée (couleurPlanning)</li>
            <li>👀 Identification visuelle rapide entre planning équipe et détails d'affaire</li>
            <li>🔄 Les couleurs se synchronisent automatiquement</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestCouleursPlanningAffaires; 