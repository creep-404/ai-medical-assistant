import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

export const Table = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto">
      <table ref={ref} className={cn('w-full text-sm', className)} {...props} />
    </div>
  )
)
Table.displayName = 'Table'

export const THead = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        'bg-cream-100 dark:bg-ink-800/60 text-xs uppercase tracking-wider text-ink-500 dark:text-cream-300/70',
        className
      )}
      {...props}
    />
  )
)
THead.displayName = 'THead'

export const TBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('divide-y divide-cream-200 dark:divide-ink-800', className)}
      {...props}
    />
  )
)
TBody.displayName = 'TBody'

export const TR = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'transition-colors hover:bg-cream-100/70 dark:hover:bg-ink-800/50',
        className
      )}
      {...props}
    />
  )
)
TR.displayName = 'TR'

export const TH = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th ref={ref} className={cn('px-4 py-3 text-left font-semibold whitespace-nowrap', className)} {...props} />
  )
)
TH.displayName = 'TH'

export const TD = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn('px-4 py-3.5 align-middle', className)} {...props} />
  )
)
TD.displayName = 'TD'
