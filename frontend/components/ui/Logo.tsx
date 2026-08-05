import Link from 'next/link'
import { HeartPulse } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Logo({
  subtitle,
  href = '/',
  className,
  size = 'md',
  variant = 'default',
}: {
  subtitle?: string
  href?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'light'
}) {
  const box = size === 'lg' ? 'h-12 w-12 rounded-2xl' : size === 'sm' ? 'h-8 w-8 rounded-lg' : 'h-10 w-10 rounded-xl'
  const icon = size === 'lg' ? 'h-6 w-6' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const title = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg'

  return (
    <Link href={href} className={cn('flex items-center gap-2.5 group', className)}>
      <div
        className={cn(
          box,
          'flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-soft group-hover:shadow-md transition-shadow'
        )}
      >
        <HeartPulse className={cn(icon)} />
      </div>
      <div className="leading-tight">
        <p
          className={cn(
            'font-display font-semibold',
            variant === 'light' ? 'text-white' : 'text-ink-900 dark:text-cream-100',
            title
          )}
        >
          Medi<span className={variant === 'light' ? 'text-primary-300' : 'text-primary-600 dark:text-primary-400'}>Assist</span>
        </p>
        {subtitle && (
          <p
            className={cn(
              'text-[11px] font-medium',
              variant === 'light' ? 'text-cream-300/70' : 'text-ink-400 dark:text-cream-300/60'
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  )
}
