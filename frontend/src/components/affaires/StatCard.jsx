import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';

export const StatCard = ({ icon, title, value, change, description }) => {
  const isPositive = change && change.startsWith('+');

  return (
    <Card className="bg-white rounded-2xl shadow-md p-5 transition-all duration-300 hover:shadow-lg hover:scale-105">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-amber-100 rounded-full">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-stone-500">{title}</p>
          <p className="text-2xl font-bold text-stone-800">{value}</p>
        </div>
      </div>
      {(change || description) && (
        <div className="mt-3 text-xs text-stone-500 flex items-center">
          {change && (
            <span className={`flex items-center mr-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <IconTrendingUp className="w-4 h-4" /> : <IconTrendingDown className="w-4 h-4" />}
              <span className="font-semibold ml-1">{change}</span>
            </span>
          )}
          {description && <span>{description}</span>}
        </div>
      )}
    </Card>
  );
}; 