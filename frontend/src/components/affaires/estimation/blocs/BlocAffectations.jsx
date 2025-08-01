import React, { useState } from 'react';
import { 
  IconUsers, 
  IconCalendar, 
  IconClock,
  IconChevronDown,
  IconChevronUp,
  IconInfoCircle,
  IconRefresh
} from '@tabler/icons-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Bloc Affectations - Affichage permanent des affectations détectées
 * Remplace la popup temporaire par un affichage fixe
 */
const BlocAffectations = ({ affectations = [], dateSurvolee, onRefresh, loading = false, disabled = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Système de couleurs par affaire (identique au calendrier)
  const getCouleurAffaire = (affaireNumero) => {
    const couleurs = [
      { bg: '#3b82f6', border: '#2563eb', name: 'Bleu' },
      { bg: '#10b981', border: '#059669', name: 'Vert' },
      { bg: '#8b5cf6', border: '#7c3aed', name: 'Violet' },
      { bg: '#f59e0b', border: '#d97706', name: 'Orange' },
      { bg: '#ef4444', border: '#dc2626', name: 'Rouge' },
      { bg: '#06b6d4', border: '#0891b2', name: 'Cyan' },
      { bg: '#84cc16', border: '#65a30d', name: 'Lime' },
      { bg: '#d946ef', border: '#c026d3', name: 'Magenta' },
    ];
    
    if (!affaireNumero || affaireNumero === 'N/A') {
      return { bg: '#6b7280', border: '#4b5563', name: 'Gris' };
    }
    
    let hash = 0;
    for (let i = 0; i < affaireNumero.toString().length; i++) {
      hash = affaireNumero.toString().charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return couleurs[Math.abs(hash) % couleurs.length];
  };

  // Grouper les affectations par affaire
  const affectationsParAffaire = affectations.reduce((acc, affectation) => {
    const key = affectation.affaireNumero || 'sans-numero';
    if (!acc[key]) {
      acc[key] = {
        affaireNumero: affectation.affaireNumero,
        affaireLibelle: affectation.affaireLibelle,
        affectations: []
      };
    }
    acc[key].affectations.push(affectation);
    return acc;
  }, {});

  // Grouper les affectations par date
  const affectationsParDate = affectations.reduce((acc, affectation) => {
    if (!acc[affectation.date]) {
      acc[affectation.date] = [];
    }
    acc[affectation.date].push(affectation);
    return acc;
  }, {});

  const affairesUniques = Object.values(affectationsParAffaire);
  const datesOccupees = Object.keys(affectationsParDate).sort();

  return (
    <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
              <IconUsers className="w-5 h-5 text-white" />
            </div>
            {dateSurvolee ? (
              <div className="flex flex-col">
                <span>Affectations du jour</span>
                <span className="text-sm font-normal text-indigo-600">
                  {new Date(dateSurvolee).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              </div>
            ) : (
              'Affectations Détectées'
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading || disabled}
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
              >
                <IconRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-indigo-700 hover:bg-indigo-100"
            >
              {isExpanded ? <IconChevronUp className="w-4 h-4" /> : <IconChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Statistiques en en-tête */}
        <div className="flex items-center gap-4 text-base text-indigo-600 mt-2">
          {!disabled && (
            <>
              <Badge variant="outline" className="text-indigo-700 border-indigo-300">
                <IconUsers className="w-3 h-3 mr-1" />
                {affairesUniques.length} affaire{affairesUniques.length > 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline" className="text-indigo-700 border-indigo-300">
                <IconClock className="w-3 h-3 mr-1" />
                {affectations.length} affectation{affectations.length > 1 ? 's' : ''}
              </Badge>
            </>
          )}
          {disabled && (
            <Badge variant="outline" className="text-gray-500 border-gray-300">
              <IconClock className="w-3 h-3 mr-1" />
              En attente du planning
            </Badge>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {disabled ? (
            <div className="text-center py-8">
              <div className="p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-gray-100">
                <IconCalendar className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-500 mb-1">Fonctionnalité verrouillée</h3>
              <p className="text-sm text-gray-400">
                Saisissez d'abord un montant pour accéder aux affectations
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <p className="text-base text-indigo-600">Chargement des affectations...</p>
              </div>
            </div>
          ) : affectations.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-gray-100">
                <IconCalendar className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-base font-medium text-gray-700 mb-1">
                {dateSurvolee ? 'Aucune affectation ce jour' : 'Survolez une date'}
              </h3>
              <p className="text-sm text-gray-500">
                {dateSurvolee ? 'Planning libre pour cette date' : 'Survolez une date du calendrier pour voir les affectations'}
              </p>
            </div>
          ) : (
            <>
              {/* Vue par affaire pour le jour survolé */}
              <div className="space-y-3">
                <h4 className="text-base font-medium text-indigo-800 flex items-center gap-2">
                  <IconUsers className="w-4 h-4" />
                  Affectations de ce jour ({affairesUniques.length} affaire{affairesUniques.length > 1 ? 's' : ''})
                </h4>
                
                <div className="space-y-2">
                  {affairesUniques.map((affaireGroupe, index) => {
                    const couleur = getCouleurAffaire(affaireGroupe.affaireNumero);
                    
                    return (
                      <div 
                        key={affaireGroupe.affaireNumero || index} 
                        className="border-l-4 pl-3 py-2 bg-white rounded-r-lg shadow-sm"
                        style={{ borderLeftColor: couleur.border }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-gray-800 text-base">
                            {affaireGroupe.affaireNumero}
                          </div>
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: couleur.bg }}
                            />
                            <span className="text-xs text-gray-500">
                              {affaireGroupe.affectations.length}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          {affaireGroupe.affaireLibelle}
                        </div>
                        
                        <div className="space-y-1">
                          {affaireGroupe.affectations.map((affectation, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: couleur.bg }}
                              />
                              <span className="text-gray-700 font-medium">{affectation.ouvrier}</span>
                              <span className="text-gray-500">({affectation.periode})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Alerte weekend si détectée */}
              {(() => {
                const affectationsWeekend = affectations.filter(affectation => {
                  const date = new Date(affectation.date + 'T12:00:00');
                  const jour = date.getDay();
                  return jour === 0 || jour === 6;
                });
                
                if (affectationsWeekend.length > 0) {
                  return (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                        <IconInfoCircle className="w-4 h-4" />
                        Affectation weekend détectée
                      </div>
                      <div className="text-sm text-red-600">
                        Cette date est un weekend
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default BlocAffectations; 