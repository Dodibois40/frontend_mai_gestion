import React from 'react';
import { getStatusConfig } from '@/utils/affaires';
import {
  IconPlus,
  IconCalendarEvent,
  IconClock,
  IconCheck,
  IconAlertTriangle,
  IconX
} from '@tabler/icons-react';

const iconComponents = {
  IconPlus,
  IconCalendarEvent,
  IconClock,
  IconCheck,
  IconAlertTriangle,
  IconX
};

export const StatusBadge = ({ statut, showIcon = true, size = 'sm' }) => {
  const config = getStatusConfig(statut);
  const IconComponent = iconComponents[config.icon];

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
      {showIcon && IconComponent && (
        <IconComponent className={`mr-1 ${iconSizes[size]}`} />
      )}
      {config.label}
    </span>
  );
};

export default StatusBadge; 