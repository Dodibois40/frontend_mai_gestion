import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

const PopoverContext = createContext();

const Popover = ({ open, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;

  const handleOpenChange = (newOpen) => {
    if (open === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <PopoverContext.Provider value={{ isOpen, onOpenChange: handleOpenChange }}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = React.forwardRef(({ className, children, asChild, ...props }, ref) => {
  const context = useContext(PopoverContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
      onClick: () => context?.onOpenChange(!context.isOpen),
    });
  }

  return (
    <button
      ref={ref}
      className={className}
      onClick={() => context?.onOpenChange(!context.isOpen)}
      {...props}
    >
      {children}
    </button>
  );
});

const PopoverContent = React.forwardRef(({ className, align = 'center', sideOffset = 4, children, ...props }, ref) => {
  const context = useContext(PopoverContext);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        context?.onOpenChange(false);
      }
    };

    if (context?.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [context?.isOpen, context?.onOpenChange]);

  if (!context?.isOpen) return null;

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      ref={(node) => {
        contentRef.current = node;
        if (ref) {
          if (typeof ref === 'function') ref(node);
          else ref.current = node;
        }
      }}
      className={clsx(
        'absolute z-50 w-72 rounded-md border bg-white p-4 shadow-md',
        `top-full mt-${sideOffset}`,
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Popover.displayName = "Popover";
PopoverTrigger.displayName = "PopoverTrigger";
PopoverContent.displayName = "PopoverContent";

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
}; 