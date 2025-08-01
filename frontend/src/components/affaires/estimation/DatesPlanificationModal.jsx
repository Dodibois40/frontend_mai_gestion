/**
 * ⚠️ WARNING: CE FICHIER N'EST PAS UTILISÉ
 * 
 * Date: 15/07/2025
 * Statut: CANDIDAT À LA SUPPRESSION
 * Raison: Aucun import de ce composant dans tout le code
 * Action: À supprimer après période de test de 24h
 * 
 * Si vous voyez ce message et que vous utilisez ce fichier,
 * veuillez retirer ce commentaire et mettre à jour NETTOYAGE_MODULE_ESTIMATION.md
 */

import React, { useState, useEffect } from 'react';
import { IconCalendar, IconCheck, IconX } from '@tabler/icons-react';
import CalendrierUnifie from './blocs/CalendrierUnifie';

const DatesPlanificationModal = ({ isOpen, onClose, onValidate, affaireData }) => {
  const [dates, setDates] = useState({
    dateCommencement: '',
    dateReception: ''
  });
  
  // Pré-remplir les dates si elles existent déjà
  useEffect(() => {
    if (isOpen && affaireData) {
      setDates({
        dateCommencement: affaireData.dateCommencement || affaireData.dateDebut || '',
        dateReception: affaireData.dateReception || affaireData.dateFin || ''
      });
    }
  }, [isOpen, affaireData]);

  const handleDateRangeChange = ({ dateDebut, dateFin }) => {
    setDates({
      dateCommencement: dateDebut,
      dateReception: dateFin
    });
  };

  const handleValidate = () => {
    if (dates.dateCommencement && dates.dateReception) {
      onValidate(dates);
      onClose();
    }
  };

  const handleCancel = () => {
    setDates({
      dateCommencement: '',
      dateReception: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  const isValidSelection = dates.dateCommencement && dates.dateReception;
  const dureeJours = isValidSelection 
    ? Math.ceil((new Date(dates.dateReception) - new Date(dates.dateCommencement)) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  return (
    <div 
      className="modal-overlay-stable"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        pointerEvents: 'auto'
      }}
      onClick={handleCancel}
    >
      <div 
        className="modal-content-stable"
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '48rem',
          margin: '0 1rem',
          overflow: 'hidden',
          position: 'relative',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-green-50 p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-green-600 rounded-xl flex items-center justify-center">
                <IconCalendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  📅 Planification de l'Affaire
                </h3>
                <p className="text-sm text-gray-600">
                  Sélectionnez une plage de dates avec détection des conflits
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IconX className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Résumé de l'affaire */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">💼 Montant :</span>
              <span className="font-semibold text-blue-600">
                {affaireData?.montant?.toLocaleString('fr-FR')}€
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">⏱️ Durée :</span>
              <span className="font-semibold text-purple-600">
                {dureeJours > 0 ? `${dureeJours} jour${dureeJours > 1 ? 's' : ''}` : 'À définir'}
              </span>
            </div>
          </div>
        </div>

        {/* Calendrier unifié */}
        <div className="p-6">
          <CalendrierUnifie
            dateDebut={dates.dateCommencement}
            dateFin={dates.dateReception}
            affaireId={affaireData?.id}
            onDateRangeChange={handleDateRangeChange}
            className="modal-calendar"
          />
          </div>

        {/* Résumé de la sélection */}
        {isValidSelection && (
          <div className="px-6 pb-4">
            <div className="bg-gradient-to-r from-green-50 to-amber-50 p-4 rounded-xl border border-green-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">📅 Date de début :</span>
                  <div className="font-semibold text-green-700">
                    {new Date(dates.dateCommencement).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">🏁 Date de fin :</span>
                  <div className="font-semibold text-amber-700">
                    {new Date(dates.dateReception).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="flex items-center justify-between">
                <span className="text-gray-600">📊 Durée totale du projet :</span>
                <span className="font-semibold text-green-700">
                    {dureeJours} jour{dureeJours > 1 ? 's' : ''}
                </span>
                </div>
              </div>
              </div>
            </div>
          )}

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleValidate}
              disabled={!isValidSelection}
              className={`flex-1 px-4 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all ${
                isValidSelection
                  ? 'bg-gradient-to-r from-green-500 to-amber-500 text-white hover:from-green-600 hover:to-amber-600 transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <IconCheck className="w-5 h-5" />
              <span>Valider les dates</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Styles pour éliminer complètement le scintillement */}
      <style>{`
        /* Désactiver toutes les transitions sur TOUTE la page quand le modal est ouvert */
        body {
          transition: none !important;
          animation: none !important;
        }
        
        body *,
        body *:hover,
        body *:focus,
        body *:active {
          transition: none !important;
          animation: none !important;
          transform: none !important;
          will-change: auto !important;
        }
        
        .modal-overlay-stable {
          transition: none !important;
          animation: none !important;
          will-change: auto;
        }
        
        .modal-content-stable {
          transition: none !important;
          animation: none !important;
          will-change: auto;
        }
        
        /* Forcer la stabilité absolue */
        .bloc-montant,
        .bloc-temps,
        .bloc-equipe,
        .bloc-achats,
        .estimation-cartouche,
        .card,
        [class*="Card"] {
          transition: none !important;
          animation: none !important;
          transform: none !important;
        }
        
        .bloc-montant *,
        .bloc-temps *,
        .bloc-equipe *,
        .bloc-achats *,
        .estimation-cartouche *,
        .card *,
        [class*="Card"] * {
          transition: none !important;
          animation: none !important;
          transform: none !important;
        }
        
        /* Spécifique au calendrier dans le modal */
        .modal-calendar {
          transition: none !important;
          animation: none !important;
        }
        
        .modal-calendar * {
          transition: none !important;
          animation: none !important;
        }
      `}</style>
    </div>
  );
};

export default DatesPlanificationModal; 