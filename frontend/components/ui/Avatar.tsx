import { cn } from '@/lib/cn'

const GRADIENTS = [
  'from-primary-600 to-primary-400',
  'from-accent-500 to-accent-300',
  'from-secondary-600 to-secondary-400',
  'from-purple-600 to-pink-400',
  'from-cyan-600 to-blue-400',
  'from-orange-500 to-rose-400',
]

export function Avatar({
  name = '',
  initials: initialOverride,
  className,
  gradient = 0,
  size = 'md',
}: {
  name?: string
  initials?: string
  className?: string
  gradient?: number
  size?: 'sm' | 'md' | 'lg'
}) {
  const initials =
    initialOverride ??
    name
      .replace(/[^a-zA-Z ]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('')

  const sizeClass =
    size === 'lg' ? 'h-16 w-16 text-xl' : size === 'sm' ? 'h-9 w-9 text-xs' : 'h-10 w-10 text-sm'

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br text-white font-semibold select-none shrink-0',
        GRADIENTS[gradient % GRADIENTS.length],
        sizeClass,
        className
      )}
    >
      {initials || '·'}
    </div>
  )
}
