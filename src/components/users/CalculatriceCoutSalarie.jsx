import React, { useState, useEffect } from 'react';
import { Calculator, Info, Euro, Clock } from 'lucide-react';

const CalculatriceCoutSalarie = ({ onTarifCalcule, className = "" }) => {
  const [salaireNet, setSalaireNet] = useState('');
  const [heuresParMois, setHeuresParMois] = useState('151.67'); // 35h/semaine sur 52 semaines / 12 mois
  const [resultats, setResultats] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Configuration des charges BTP (en pourcentages)
  const chargesBTP = {
    // Charges sociales patronales
    securiteSociale: 8.5,
    allocFamiliales: 5.25,
    assuranceChomage: 4.05,
    retraiteComplementaire: 4.72,
    prevoyance: 1.5,
    
    // Charges spécifiques BTP
    congesPayes: 10.0,
    intemperies: 0.5,
    formationProfessionnelle: 0.55,
    medecineTrail: 0.3,
    
    // Autres charges
    taxeApprentissage: 0.68,
    participationFormation: 1.0,
    versementTransport: 2.5, // Variable selon commune, moyenne
    
    // Assurances et divers
    responsabiliteCivile: 0.8,
    accidentsTravail: 3.0, // Variable selon risque, moyenne BTP
  };

  const calculerCout = () => {
    const salaireBrutNet = parseFloat(salaireNet) || 0;
    const heures = parseFloat(heuresParMois) || 151.67;

    if (salaireBrutNet <= 0 || heures <= 0) {
      setResultats(null);
      return;
    }

    // 1. Calcul du salaire brut à partir du net (approximation)
    const tauxChargesSalariales = 22; // ~22% de charges salariales
    const salaireBrut = salaireBrutNet / (1 - tauxChargesSalariales / 100);

    // 2. Calcul de chaque charge patronale
    const detailCharges = {};
    let totalChargesPatronales = 0;

    Object.entries(chargesBTP).forEach(([nom, taux]) => {
      const montant = salaireBrut * (taux / 100);
      detailCharges[nom] = { taux, montant };
      totalChargesPatronales += montant;
    });

    // 3. Coût total employeur
    const coutTotalEmployeur = salaireBrut + totalChargesPatronales;
    
    // 4. Taux horaire coût
    const tauxHoraireCout = coutTotalEmployeur / heures;

    const resultatsCalcul = {
      salaireNet: salaireBrutNet,
      salaireBrut: salaireBrut,
      totalChargesPatronales: totalChargesPatronales,
      coutTotalEmployeur: coutTotalEmployeur,
      tauxHoraireCout: tauxHoraireCout,
      heuresParMois: heures,
      detailCharges: detailCharges,
      tauxChargesTotal: ((totalChargesPatronales / salaireBrut) * 100)
    };

    setResultats(resultatsCalcul);
    
    // Callback pour remplir automatiquement le tarif coût
    if (onTarifCalcule) {
      onTarifCalcule(tauxHoraireCout);
    }
  };

  // Recalculer automatiquement quand les valeurs changent
  useEffect(() => {
    calculerCout();
  }, [salaireNet, heuresParMois]);

  const formatEuro = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(montant || 0);
  };

  const getChargeLabel = (nom) => {
    const labels = {
      securiteSociale: 'Sécurité Sociale',
      allocFamiliales: 'Allocations Familiales',
      assuranceChomage: 'Assurance Chômage',
      retraiteComplementaire: 'Retraite Complémentaire',
      prevoyance: 'Prévoyance',
      congesPayes: 'Congés Payés BTP',
      intemperies: 'Intempéries BTP',
      formationProfessionnelle: 'Formation Professionnelle',
      medecineTrail: 'Médecine du Travail',
      taxeApprentissage: 'Taxe d\'Apprentissage',
      participationFormation: 'Participation Formation',
      versementTransport: 'Versement Transport',
      responsabiliteCivile: 'Responsabilité Civile',
      accidentsTravail: 'Accidents du Travail'
    };
    return labels[nom] || nom;
  };

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-blue-600" />
        <h4 className="font-semibold text-blue-800">Calculatrice Coût Salarié BTP</h4>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      {/* Paramètres de calcul */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            💰 Salaire Net Mensuel (€)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Euro className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={salaireNet}
              onChange={(e) => setSalaireNet(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1800.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ⏰ Heures/Mois
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={heuresParMois}
              onChange={(e) => setHeuresParMois(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="151.67"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            35h/semaine = 151.67h/mois
          </p>
        </div>
      </div>

      {/* Résultats */}
      {resultats && (
        <div className="space-y-4">
          {/* Résumé */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-xs text-gray-600">Salaire Brut</div>
              <div className="font-bold text-blue-600">
                {formatEuro(resultats.salaireBrut)}
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-xs text-gray-600">Charges Patronales</div>
              <div className="font-bold text-red-600">
                {formatEuro(resultats.totalChargesPatronales)}
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-xs text-gray-600">Coût Total</div>
              <div className="font-bold text-green-600">
                {formatEuro(resultats.coutTotalEmployeur)}
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-300">
              <div className="text-xs text-gray-600">💰 Coût Horaire</div>
              <div className="font-bold text-lg text-green-700">
                {formatEuro(resultats.tauxHoraireCout)}
              </div>
            </div>
          </div>

          {/* Information sur le taux de charges */}
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm text-gray-700">
              <strong>Taux de charges patronales BTP :</strong> {resultats.tauxChargesTotal.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Ce taux horaire inclut toutes les charges patronales spécifiques au BTP
            </p>
          </div>

          {/* Détail des charges (collapsible) */}
          {showDetails && (
            <div className="bg-white rounded-lg border">
              <div className="p-3 border-b">
                <h5 className="font-medium text-gray-800">Détail des Charges Patronales</h5>
              </div>
              <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                {Object.entries(resultats.detailCharges).map(([nom, charge]) => (
                  <div key={nom} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{getChargeLabel(nom)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{charge.taux}%</span>
                      <span className="font-medium text-red-600 min-w-[80px] text-right">
                        {formatEuro(charge.montant)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Information légale */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800 text-xs">
          ⚠️ <strong>Calcul indicatif</strong> : Les taux peuvent varier selon la taille de l'entreprise, 
          la convention collective, et la localisation. Consultez votre expert-comptable pour des calculs précis.
        </p>
      </div>
    </div>
  );
};

export default CalculatriceCoutSalarie; 