import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-none whitespace-nowrap',
  {
    variants: {
      variant: {
        success: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300',
        warning: 'bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-300',
        danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        info: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
        primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
        accent: 'bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-300',
        neutral: 'bg-cream-200 text-ink-600 dark:bg-ink-800 dark:text-cream-300',
        outline: 'border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
