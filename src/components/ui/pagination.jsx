import React from 'react';

const Pagination = ({ className, children, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={`mx-auto flex w-full justify-center ${className || ''}`}
    {...props}
  >
    {children}
  </nav>
);

const PaginationContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <ul
    ref={ref}
    className={`flex flex-row items-center gap-1 ${className || ''}`}
    {...props}
  >
    {children}
  </ul>
));

const PaginationItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <li ref={ref} className={`${className || ''}`} {...props}>
    {children}
  </li>
));

const PaginationLink = React.forwardRef(({ 
  className, 
  isActive, 
  size = 'default',
  children, 
  ...props 
}, ref) => (
  <a
    ref={ref}
    aria-current={isActive ? "page" : undefined}
    className={`
      inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium 
      transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 
      disabled:pointer-events-none disabled:opacity-50 
      hover:bg-gray-100 hover:text-gray-900 
      h-9 px-4 py-2 cursor-pointer
      ${isActive ? 'border border-gray-200 bg-white shadow-sm' : 'border-0'}
      ${className || ''}
    `}
    {...props}
  >
    {children}
  </a>
));

const PaginationPrevious = React.forwardRef(({ className, children, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to previous page"
    size="default"
    className={`gap-1 pl-2.5 ${className || ''}`}
    {...props}
  >
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    <span>{children || 'Previous'}</span>
  </PaginationLink>
));

const PaginationNext = React.forwardRef(({ className, children, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to next page"
    size="default"
    className={`gap-1 pr-2.5 ${className || ''}`}
    {...props}
  >
    <span>{children || 'Next'}</span>
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </PaginationLink>
));

const PaginationEllipsis = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden
    className={`flex h-9 w-9 items-center justify-center ${className || ''}`}
    {...props}
  >
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
    <span className="sr-only">More pages</span>
  </span>
));

Pagination.displayName = "Pagination";
PaginationContent.displayName = "PaginationContent";
PaginationItem.displayName = "PaginationItem";
PaginationLink.displayName = "PaginationLink";
PaginationPrevious.displayName = "PaginationPrevious";
PaginationNext.displayName = "PaginationNext";
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
}; 