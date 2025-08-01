import React, { createContext, useContext, useState } from 'react';
import { clsx } from 'clsx';

const DialogContext = createContext();

const Dialog = ({ open, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;

  const handleOpenChange = (newOpen) => {
    if (open === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <DialogContext.Provider value={{ isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger = React.forwardRef(({ className, children, asChild, ...props }, ref) => {
  const context = useContext(DialogContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
      onClick: () => context?.onOpenChange(true),
    });
  }

  return (
    <button
      ref={ref}
      className={className}
      onClick={() => context?.onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  );
});

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = useContext(DialogContext);

  if (!context?.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={() => context?.onOpenChange(false)}
      />
      
      {/* Content */}
      <div
        ref={ref}
        className={clsx(
          'relative z-50 grid w-full max-w-lg gap-4 border bg-white p-6 shadow-lg rounded-lg',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});

const DialogHeader = ({ className, children, ...props }) => (
  <div className={clsx('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props}>
    {children}
  </div>
);

const DialogTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={clsx('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  >
    {children}
  </h3>
));

const DialogDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx('text-sm text-gray-500', className)}
    {...props}
  >
    {children}
  </p>
));

const DialogFooter = ({ className, children, ...props }) => (
  <div className={clsx('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props}>
    {children}
  </div>
);

Dialog.displayName = "Dialog";
DialogTrigger.displayName = "DialogTrigger";
DialogContent.displayName = "DialogContent";
DialogHeader.displayName = "DialogHeader";
DialogTitle.displayName = "DialogTitle";
DialogDescription.displayName = "DialogDescription";
DialogFooter.displayName = "DialogFooter";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}; 