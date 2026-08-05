'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { HeartPulse, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export function AuthLayout({
  icon: Icon,
  headline,
  description,
  stats,
  children,
  backHref = '/',
}: {
  icon?: React.ElementType
  headline: string
  description: string
  stats?: { value: string; label: string }[]
  children: React.ReactNode
  backHref?: string
}) {
  return (
    <div className="min-h-screen bg-cream-100 dark:bg-ink-950 flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-600 to-primary-400 items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            {Icon ? <Icon className="h-10 w-10 text-white" /> : <HeartPulse className="h-10 w-10 text-white" />}
          </div>
          <h2 className="heading-display text-4xl font-semibold text-white mb-4">{headline}</h2>
          <p className="text-primary-100 text-lg max-w-md leading-relaxed">{description}</p>

          {stats && (
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-4 text-center min-w-[110px]"
                >
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-primary-200 text-sm mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link
              href={backHref}
              className="inline-flex items-center text-sm text-ink-500 dark:text-cream-300/70 hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Home
            </Link>
            <Logo size="sm" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
