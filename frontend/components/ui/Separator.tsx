'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export function Separator({ className, orientation = 'horizontal', decorative = true, ...props }: SeparatorProps) {
  const ariaProps = decorative ? { 'aria-hidden': true } : { role: 'separator' };
  return (
    <div
      {...ariaProps}
      {...props}
      className={cn(
        'shrink-0 bg-cream-200 dark:bg-ink-800',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
    />
  );
}

export default Separator;
