import React from 'react';
import { clsx } from 'clsx';

const Badge = React.forwardRef(({ className, variant = 'default', children, ...props }, ref) => {
  const variants = {
    default: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200',
    destructive: 'bg-red-100 text-red-900 hover:bg-red-200',
    outline: 'border border-gray-300 text-gray-900',
    success: 'bg-green-100 text-green-900 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200',
  };

  return (
    <div
      ref={ref}
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Badge.displayName = "Badge";

export { Badge }; 