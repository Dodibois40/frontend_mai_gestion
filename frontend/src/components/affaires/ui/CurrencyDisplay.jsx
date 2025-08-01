import React from 'react';
import { formatCurrency } from '@/utils/affaires';

export const CurrencyDisplay = ({ 
  amount, 
  className = '', 
  size = 'base',
  showSign = false,
  fallback = '0,00 €'
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  const formatAmount = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return fallback;
    }
    return formatCurrency(value);
  };

  const displayAmount = formatAmount(amount);
  
  // Déterminer la couleur selon le montant
  const getAmountColor = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'text-gray-500';
    }
    
    if (showSign) {
      if (value > 0) return 'text-green-600';
      if (value < 0) return 'text-red-600';
    }
    
    return '';
  };

  const colorClass = getAmountColor(amount);

  return (
    <span 
      className={`font-medium ${sizeClasses[size]} ${colorClass} ${className}`}
      title={displayAmount}
    >
      {showSign && amount > 0 && '+'}
      {displayAmount}
    </span>
  );
};

export default CurrencyDisplay; 