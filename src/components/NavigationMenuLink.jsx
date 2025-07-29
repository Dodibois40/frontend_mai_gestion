import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const NavigationMenuLink = forwardRef(
  ({ className, children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'slot' : 'a';
    return (
      <Comp
        ref={ref}
        className={cn(
          "block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:bg-accent focus:text-accent-foreground",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

NavigationMenuLink.displayName = "NavigationMenuLink";

export { NavigationMenuLink }; 