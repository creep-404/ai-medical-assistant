'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Stethoscope } from 'lucide-react'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { Logo } from '@/components/ui/Logo'

export default function Custom404() {
  return (
    <div className="min-h-screen bg-cream-50 dark:bg-ink-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-200/40 dark:bg-primary-900/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-200/40 dark:bg-accent-900/20 rounded-full blur-3xl" />
      <div className="absolute top-8 left-8">
        <Logo size="sm" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg relative z-10"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40 rounded-full flex items-center justify-center mx-auto mb-8 shadow-soft"
        >
          <Stethoscope className="w-12 h-12 text-primary-600 dark:text-primary-300" />
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <h1 className="heading-display text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500 mb-4">
            404
          </h1>
        </motion.div>

        <h2 className="text-2xl font-semibold text-ink-900 dark:text-cream-100 mb-3">
          Oops! Page Not Found
        </h2>
        <p className="text-ink-600 dark:text-cream-300/70 mb-8 leading-relaxed">
          Looks like you&apos;ve wandered into uncharted territory. The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}>
            <Home className="w-4 h-4" />
            Go Back Home
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
