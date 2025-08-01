import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { planningEquipeService } from '../../services/planningEquipeService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const TestCalculFraisGeneraux = () => {
  const [loading, setLoading] = useState(false);
  const [resultats, setResultats] = useState(null);
  const [error, setError] = useState(null);
  // Utiliser une date récente (semaine actuelle)
  const [dateDebut, setDateDebut] = useState(() => {
    const aujourdhui = new Date();
    // Aller au début de la semaine actuelle
    const jour = aujourdhui.getDay();
    const diff = jour === 0 ? -6 : 1 - jour; // Lundi = début de semaine
    const debutSemaine = new Date(aujourdhui);
    debutSemaine.setDate(aujourdhui.getDate() + diff);
    return debutSemaine;
  });

  // 🧮 Fonction pour calculer les frais généraux avec mutualisation PAR SEMAINE
  const calculerFraisGenerauxMutualises = (affectations) => {
    const COUT_FRAIS_GENERAUX_PAR_JOUR = 508.58;
    const COUT_FRAIS_GENERAUX_PAR_SEMAINE = COUT_FRAIS_GENERAUX_PAR_JOUR * 5; // 2542,90€
    
    // Grouper toutes les affectations par jour
    const affectationsParJour = {};
    const fraisParAffaire = {};
    const detailsCalcul = {};
    
    affectations.forEach(affectation => {
      const jour = affectation.dateAffectation.split('T')[0]; // Format YYYY-MM-DD
      if (!affectationsParJour[jour]) {
        affectationsParJour[jour] = [];
      }
      affectationsParJour[jour].push(affectation);
    });
    
    // Calculer pour chaque jour
    Object.keys(affectationsParJour).forEach(jour => {
      const affectationsDuJour = affectationsParJour[jour];
      const nbAffectationsTotal = affectationsDuJour.length;
      const coutParAffectation = COUT_FRAIS_GENERAUX_PAR_JOUR / nbAffectationsTotal;
      
      // Enregistrer les détails du calcul
      detailsCalcul[jour] = {
        nbAffectationsTotal,
        coutParAffectation,
        coutTotalJour: COUT_FRAIS_GENERAUX_PAR_JOUR,
        affectations: affectationsDuJour.map(a => ({
          employe: a.user?.nom || 'Inconnu',
          prenom: a.user?.prenom || '',
          affaire: a.affaire?.libelle || `Affaire ${a.affaireId}`,
          periode: a.periode
        }))
      };
      
      // Calculer pour chaque affaire
      affectationsDuJour.forEach(affectation => {
        const affaireId = affectation.affaireId;
        const nomAffaire = affectation.affaire?.libelle || `Affaire ${affaireId}`;
        
        if (!fraisParAffaire[affaireId]) {
          fraisParAffaire[affaireId] = {
            nomAffaire,
            totalFrais: 0,
            details: []
          };
        }
        
        fraisParAffaire[affaireId].totalFrais += coutParAffectation;
        fraisParAffaire[affaireId].details.push({
          date: jour,
          periode: affectation.periode,
          employe: `${affectation.user?.nom || 'Inconnu'} ${affectation.user?.prenom || ''}`,
          nbAffectationsJour: nbAffectationsTotal,
          coutParAffectation: coutParAffectation
        });
      });
    });
    
    return { fraisParAffaire, detailsCalcul };
  };

  // 🔄 Récupérer les données du planning
  const recupererDonnees = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculer le début de la semaine
      const debutSemaine = planningEquipeService.getDebutSemaine(dateDebut);
      console.log('🔄 Récupération planning pour:', debutSemaine);
      console.log('📅 Date formatée:', debutSemaine.toISOString());
      
      // Récupérer le planning hebdomadaire
      const planningData = await planningEquipeService.getPlanningHebdomadaire(debutSemaine, true);
      console.log('📊 Données planning récupérées:', planningData);
      console.log('📊 Affectations:', planningData?.affectations);
      
      if (!planningData) {
        setError('Aucune donnée de planning récupérée');
        return;
      }
      
      if (!planningData.affectations || planningData.affectations.length === 0) {
        setError(`Aucune affectation trouvée pour la semaine du ${debutSemaine.toLocaleDateString('fr-FR')}`);
        setResultats({
          semaine: debutSemaine,
          nbAffectationsTotal: 0,
          fraisGenerauxTotal: 0,
          fraisParAffaire: {},
          detailsCalcul: {},
          affectations: []
        });
        return;
      }
      
      // Calculer les frais généraux par affaire
      const { fraisParAffaire, detailsCalcul } = calculerFraisGenerauxMutualises(planningData.affectations);
      
      // Préparer les résultats
      const resultats = {
        semaine: debutSemaine,
        nbAffectationsTotal: planningData.affectations.length,
        fraisGenerauxTotal: Object.values(fraisParAffaire).reduce((sum, affaire) => sum + affaire.totalFrais, 0),
        fraisParAffaire: fraisParAffaire,
        detailsCalcul: detailsCalcul,
        affectations: planningData.affectations
      };
      
      setResultats(resultats);
      
    } catch (err) {
      console.error('❌ Erreur lors du calcul:', err);
      setError(err.message || 'Erreur lors du calcul');
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Afficher les détails du calcul par jour
  const renderDetailsCalculParJour = () => {
    if (!resultats?.detailsCalcul) return null;
    
    return (
      <Card className="mb-6">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🧮 Détails du Calcul par Jour
          </h3>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Logique de Calcul</h4>
            <p className="text-blue-800 text-sm">
              • Coût fixe par jour : <strong>508,58€</strong><br/>
              • Coût réparti entre <strong>TOUTES</strong> les affectations du jour<br/>
              • Si Dorian est seul un jour → il absorbe les 508,58€ complets<br/>
              • S'il y a 10 personnes → chacune absorbe 508,58€ ÷ 10 = 50,86€
            </p>
          </div>
          
          <div className="space-y-4">
            {Object.entries(resultats.detailsCalcul).map(([jour, details]) => (
              <div key={jour} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-900">
                    📅 {format(new Date(jour), 'EEEE dd MMMM yyyy', { locale: fr })}
                  </h4>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-orange-100">
                      {details.nbAffectationsTotal} affectations
                    </Badge>
                    <Badge variant="outline" className="bg-green-100">
                      {details.coutParAffectation.toFixed(2)}€ / affectation
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded mb-3">
                  <p className="text-sm text-gray-700">
                    <strong>Calcul :</strong> {details.coutTotalJour.toFixed(2)}€ ÷ {details.nbAffectationsTotal} affectations = <strong>{details.coutParAffectation.toFixed(2)}€ par affectation</strong>
                  </p>
                </div>
                
                <div className="space-y-2">
                  {details.affectations.map((affectation, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                      <span className="font-medium">{affectation.employe}</span>
                      <span className="text-gray-600">{affectation.periode}</span>
                      <span className="text-blue-600">{affectation.affaire}</span>
                      <span className="font-semibold text-green-600">
                        {details.coutParAffectation.toFixed(2)}€
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  // 🎯 Afficher les résultats par affaire
  const renderResultatsParAffaire = () => {
    if (!resultats?.fraisParAffaire) return null;
    
    return Object.entries(resultats.fraisParAffaire).map(([affaireId, data]) => (
      <Card key={affaireId} className="mb-4">
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {data.nomAffaire}
            </h3>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Total : {data.totalFrais.toFixed(2)}€
            </Badge>
          </div>
          
          <div className="space-y-2">
            {data.details.map((detail, index) => (
              <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                <span>
                  {format(new Date(detail.date), 'dd/MM/yyyy', { locale: fr })} - {detail.periode}
                </span>
                <span className="text-gray-600">{detail.employe}</span>
                <span className="text-blue-600">
                  {detail.coutParAffectation.toFixed(2)}€ 
                  <span className="text-gray-400 ml-1">
                    (508,58€ ÷ {detail.nbAffectationsJour})
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    ));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="mb-6">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🧮 Test Calcul Frais Généraux - Mutualisation par Jour
          </h1>
          
          <div className="flex gap-4 items-center mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semaine de référence
              </label>
              <input
                type="date"
                value={dateDebut.toISOString().split('T')[0]}
                onChange={(e) => setDateDebut(new Date(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mt-6">
              <Button 
                onClick={recupererDonnees}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Calcul en cours...' : 'Calculer les frais généraux'}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {resultats && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <h3 className="font-semibold">📊 Résultats de la semaine</h3>
              <p>
                <strong>Semaine du {format(resultats.semaine, 'dd/MM/yyyy', { locale: fr })}</strong><br/>
                Total affectations : {resultats.nbAffectationsTotal}<br/>
                Total frais généraux répartis : {resultats.fraisGenerauxTotal.toFixed(2)}€
              </p>
            </div>
          )}
        </div>
      </Card>
      
      {resultats && renderDetailsCalculParJour()}
      
      {resultats && (
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          💰 Frais Généraux par Affaire
        </h2>
      )}
      
      {resultats && renderResultatsParAffaire()}
    </div>
  );
};

export default TestCalculFraisGeneraux; 