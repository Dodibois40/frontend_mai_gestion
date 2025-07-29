import React from 'react';
import { clsx } from 'clsx';
import Card from './Card';

const ChartCard = ({ 
  title,
  description,
  children,
  actions,
  legend = false,
  height = 'h-64',
  className = '',
  loading = false,
  ...props 
}) => {
  if (loading) {
    return (
      <Card className={clsx('animate-pulse', className)} {...props}>
        <div className="mb-6">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className={clsx('bg-gray-200 rounded-lg', height)}></div>
      </Card>
    );
  }

  return (
    <Card className={className} {...props}>
      <Card.Header>
        <div className="flex items-center justify-between">
          <div>
            <Card.Title>{title}</Card.Title>
            {description && <Card.Description>{description}</Card.Description>}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
        {legend && (
          <div className="mt-4">
            {legend}
          </div>
        )}
      </Card.Header>
      
      <Card.Content>
        <div className={clsx('relative', height)}>
          {children}
        </div>
      </Card.Content>
    </Card>
  );
};

export default ChartCard; 