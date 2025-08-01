import React, { useState, useRef, useEffect } from 'react';
import { getStatusConfig } from '@/utils/affaires';
import { IconChevronDown, IconCheck } from '@tabler/icons-react';
import { toast } from 'sonner';

// Liste des statuts disponibles - simple
const STATUTS_DISPONIBLES = [
  { value: 'PLANIFIEE', label: 'Planifiée' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINEE', label: 'Terminée' }
];

export const StatusDropdown = ({ 
  statutActuel, 
  onStatusChange, 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const statusConfig = getStatusConfig(statutActuel);

  // Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleStatusChange = async (nouveauStatut) => {
    if (nouveauStatut === statutActuel) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      await onStatusChange(nouveauStatut);
      setIsOpen(false);
      toast.success(`Statut changé vers "${getStatusConfig(nouveauStatut).label}"`);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast.error('Erreur lors du changement de statut');
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
    }
  };

  if (!statusConfig) {
    return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Statut inconnu</span>;
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bouton principal - Simple et épuré */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-between rounded-lg font-medium transition-all duration-200
          px-3 py-1.5 text-xs
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
          ${loading ? 'animate-pulse' : ''}
          min-w-[100px] 
          ${statusConfig.color}
          border border-white/20
        `}
      >
        <span>{statusConfig.label}</span>
        {!disabled && (
          <IconChevronDown 
            className={`ml-2 w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        )}
      </button>

      {/* Menu déroulant - Simple comme dans votre exemple */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="py-1">
            {STATUTS_DISPONIBLES.map((statut) => {
              const isActive = statut.value === statutActuel;
              
              return (
                <button
                  key={statut.value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleStatusChange(statut.value);
                  }}
                  disabled={loading}
                  className={`
                    w-full px-3 py-2 text-left text-sm
                    hover:bg-gray-50 
                    transition-colors duration-150 
                    flex items-center justify-between
                    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span className="text-gray-900">{statut.label}</span>
                  {isActive && (
                    <IconCheck className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusDropdown; 