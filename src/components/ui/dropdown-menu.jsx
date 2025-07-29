import React, { useState, useRef, useEffect } from 'react';

const DropdownMenu = ({ children }) => {
  return <div className="relative inline-block text-left">{children}</div>;
};

const DropdownMenuTrigger = React.forwardRef(({ className, children, asChild, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
});

const DropdownMenuContent = React.forwardRef(({ className, align = "end", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md ${
        align === "end" ? "right-0" : "left-0"
      } ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
});

const DropdownMenuItem = React.forwardRef(({ className, disabled, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 ${
        disabled ? "pointer-events-none opacity-50" : ""
      } ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
});

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`-mx-1 my-1 h-px bg-gray-200 ${className || ''}`}
    {...props}
  />
));

const DropdownMenuLabel = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`px-2 py-1.5 text-sm font-semibold ${className || ''}`}
    {...props}
  >
    {children}
  </div>
));

DropdownMenu.displayName = "DropdownMenu";
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";
DropdownMenuContent.displayName = "DropdownMenuContent";
DropdownMenuItem.displayName = "DropdownMenuItem";
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
}; 