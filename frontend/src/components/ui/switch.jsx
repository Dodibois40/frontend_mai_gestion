import React from 'react';
import { clsx } from 'clsx';

const Switch = React.forwardRef(({ 
  className, 
  checked = false, 
  onCheckedChange, 
  disabled = false, 
  size = 'default',
  ...props 
}, ref) => {
  const sizes = {
    small: 'h-4 w-8',
    default: 'h-6 w-11',
    large: 'h-8 w-14'
  };

  const thumbSizes = {
    small: 'h-3 w-3',
    default: 'h-5 w-5', 
    large: 'h-7 w-7'
  };

  const handleChange = (e) => {
    if (onCheckedChange && !disabled) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <label className={clsx(
      'relative inline-flex cursor-pointer items-center',
      disabled && 'cursor-not-allowed opacity-50',
      className
    )}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        ref={ref}
        {...props}
      />
      <div className={clsx(
        'relative rounded-full transition-colors duration-200 ease-in-out',
        sizes[size],
        checked 
          ? 'bg-blue-600' 
          : 'bg-gray-200',
        disabled && 'cursor-not-allowed'
      )}>
        <div className={clsx(
          'absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out',
          thumbSizes[size],
          checked && (
            size === 'small' ? 'translate-x-4' :
            size === 'default' ? 'translate-x-5' :
            'translate-x-6'
          )
        )} />
      </div>
    </label>
  );
});

Switch.displayName = "Switch";

export { Switch }; 