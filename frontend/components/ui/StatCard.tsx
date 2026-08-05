import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaLabel,
  accent = 'primary',
  index = 0,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  delta?: number
  deltaLabel?: string
  accent?: 'primary' | 'accent' | 'secondary' | 'purple' | 'rose' | 'cyan'
  index?: number
}) {
  const accents: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-300',
    secondary: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-300',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
    cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Card className="p-5 sm:p-6 card-hover">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center',
              accents[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {delta !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                delta >= 0
                  ? 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
              )}
            >
              {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(delta)}%
            </span>
          )}
        </div>
        <p className="mt-4 text-2xl font-bold tracking-tight text-ink-900 dark:text-cream-100">
          {value}
        </p>
        <p className="mt-1 text-sm text-ink-500 dark:text-cream-300/70">
          {label}
          {deltaLabel && <span className="text-ink-400 dark:text-cream-300/50"> · {deltaLabel}</span>}
        </p>
      </Card>
    </motion.div>
  )
}
