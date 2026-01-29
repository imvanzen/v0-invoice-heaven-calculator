"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;

// Trigger wrapper - converts asChild to render prop for Base UI compatibility
const TooltipTrigger = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> & {
    asChild?: boolean;
  }
>(({ asChild, children, className, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    // Convert asChild to render prop for Base UI
    // If className is provided, merge it with the child's className
    const childElement = className
      ? React.cloneElement(children as React.ReactElement, {
          className: cn(className, (children as React.ReactElement).props?.className),
        })
      : (children as React.ReactElement);
    
    // Base UI will clone the element and merge props internally
    return (
      <TooltipPrimitive.Trigger
        {...props}
        render={childElement}
      />
    );
  }
  
  // Default behavior - render as button
  return (
    <TooltipPrimitive.Trigger
      ref={ref}
      className={cn(className)}
      {...props}
    >
      {children}
    </TooltipPrimitive.Trigger>
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

// Content wrapper - hides Base UI structure
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Popup>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Popup> & {
    sideOffset?: number;
  }
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Positioner sideOffset={sideOffset}>
      <TooltipPrimitive.Popup
        ref={ref}
        className={cn(
          "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Positioner>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
