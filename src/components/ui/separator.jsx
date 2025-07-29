import React from 'react';

export const Separator = ({ 
  orientation = 'horizontal', 
  className = '', 
  ...props 
}) => {
  const baseClasses = orientation === 'horizontal' 
    ? 'h-px w-full bg-gray-200' 
    : 'w-px h-full bg-gray-200';
    
  return (
    <div 
      className={`${baseClasses} ${className}`} 
      {...props} 
    />
  );
};

export default Separator; 