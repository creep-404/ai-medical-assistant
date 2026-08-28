'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

type TooltipContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

export function TooltipProvider({ children }: { children: React.ReactNode; delayDuration?: number }) {
  return <>{children}</>;
}

export function Tooltip({ children, delayDuration, open: controlledOpen, onOpenChange, ...props }: {
  children: React.ReactNode;
  delayDuration?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen! : uncontrolledOpen;
  const setOpen = React.useCallback((v: boolean) => {
    if (!isControlled) setUncontrolledOpen(v);
    onOpenChange?.(v);
  }, [isControlled, onOpenChange]);

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <span className="relative inline-flex" {...props}>
        {children}
      </span>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  children,
  asChild,
  ...props
}: {
  children: React.ReactNode;
  asChild?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error('TooltipTrigger must be used within Tooltip');

  const handleOpen = () => ctx.setOpen(true);
  const handleClose = () => ctx.setOpen(false);

  const triggerProps = {
    onMouseEnter: handleOpen,
    onMouseLeave: handleClose,
    onFocus: handleOpen,
    onBlur: handleClose,
    ...props,
  } as React.HTMLAttributes<HTMLElement> & Record<string, unknown>;

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>;
    const existingOnMouseEnter = child.props.onMouseEnter as ((e: unknown) => void) | undefined;
    const existingOnMouseLeave = child.props.onMouseLeave as ((e: unknown) => void) | undefined;
    const existingOnFocus = child.props.onFocus as ((e: unknown) => void) | undefined;
    const existingOnBlur = child.props.onBlur as ((e: unknown) => void) | undefined;
    return React.cloneElement(child, {
      onMouseEnter: (e: unknown) => { existingOnMouseEnter?.(e); handleOpen(); },
      onMouseLeave: (e: unknown) => { existingOnMouseLeave?.(e); handleClose(); },
      onFocus: (e: unknown) => { existingOnFocus?.(e); handleOpen(); },
      onBlur: (e: unknown) => { existingOnBlur?.(e); handleClose(); },
    } as Record<string, unknown>);
  }

  return (
    <button type="button" {...(triggerProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

export function TooltipContent({
  children,
  className,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}) {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error('TooltipContent must be used within Tooltip');
  if (!ctx.open) return null;

  const sideClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const alignAdjust: Record<string, string> = {
    start: align === 'start' && (side === 'top' || side === 'bottom') ? '!left-0 !translate-x-0' : '',
    end: align === 'end' && (side === 'top' || side === 'bottom') ? '!left-auto !right-0 !translate-x-0' : '',
    center: '',
  };

  const alignClass = align === 'start' ? alignAdjust.start : align === 'end' ? alignAdjust.end : '';

  return (
    <div
      role="tooltip"
      style={{ marginBottom: side === 'top' ? sideOffset : undefined, marginTop: side === 'bottom' ? sideOffset : undefined }}
      className={cn(
        'absolute z-50 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium shadow-md animate-in fade-in-0 zoom-in-95',
        'bg-ink-900 text-white dark:bg-cream-100 dark:text-ink-900',
        'border border-ink-800 dark:border-cream-200',
        sideClasses[side] ?? sideClasses.top,
        alignClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
