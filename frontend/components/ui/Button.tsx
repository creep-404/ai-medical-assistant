'use client'

import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ink-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white shadow-sm hover:bg-primary-700 hover:shadow-md',
        accent:
          'bg-accent-500 text-white shadow-sm hover:bg-accent-600 hover:shadow-md',
        secondary:
          'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-900/60',
        outline:
          'border border-cream-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-cream-200 hover:bg-cream-100 dark:hover:bg-ink-800',
        ghost:
          'text-ink-600 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-ink-800',
        danger:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md',
        dangerGhost:
          'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
        link: 'text-primary-600 dark:text-primary-300 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3.5 text-xs',
        md: 'h-11 px-5',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10',
        iconSm: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
