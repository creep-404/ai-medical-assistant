'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react'
import { authService } from '@/services/auth.service'
import toast from 'react-hot-toast'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Field, Input, Label } from '@/components/ui/Form'
import { cn } from '@/lib/cn'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    if (!email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
      toast.success('Password reset link sent to your email!')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      icon={Mail}
      headline="We've got you covered"
      description="No worries — we'll help you get back into your account. Enter your email and we'll send a secure reset link."
      stats={[
        { value: 'Secure', label: 'Encrypted Reset Link' },
        { value: 'Fast', label: 'Arrives in Seconds' },
        { value: '24/7', label: 'Support' },
      ]}
    >
      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-primary-600 dark:text-primary-300" />
          </div>
          <h1 className="heading-display text-2xl font-semibold text-ink-900 dark:text-cream-100 mb-2">
            Check your email
          </h1>
          <p className="text-ink-500 dark:text-cream-400/70 mb-6">
            We&apos;ve sent a password reset link to{' '}
            <strong className="text-ink-900 dark:text-cream-100">{email}</strong>
          </p>
          <div className="flex items-start gap-3 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 p-4 mb-6 text-left">
            <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-300 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-primary-800 dark:text-primary-200">
              Didn&apos;t receive the email? Check your spam folder or make sure you entered the correct email
              address.
            </p>
          </div>
          <button
            onClick={() => setSent(false)}
            className="text-primary-700 dark:text-primary-300 hover:underline text-sm font-semibold"
          >
            Send again
          </button>
          <div className="mt-4 pt-4 border-t border-cream-200 dark:border-ink-800">
            <Link
              href="/login"
              className="text-primary-700 dark:text-primary-300 hover:underline text-sm font-semibold"
            >
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      ) : (
        <>
          <h1 className="heading-display text-3xl font-semibold text-ink-900 dark:text-cream-100">
            Forgot your password?
          </h1>
          <p className="text-ink-500 dark:text-cream-400/70 mt-2 mb-8">
            Enter your email address and we&apos;ll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field>
              <Label>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 dark:text-cream-400/50" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  className={cn(
                    'pl-11',
                    error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''
                  )}
                  placeholder="john@example.com"
                />
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            </Field>

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-primary-700 dark:text-primary-300 hover:underline text-sm font-semibold"
            >
              Back to Sign In
            </Link>
          </div>
        </>
      )}

      <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-cream-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-4 text-xs text-ink-500 dark:text-cream-400/70">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent-500" />
        <p>
          <strong className="text-ink-700 dark:text-cream-200">Medical Disclaimer:</strong> This application is
          intended for educational purposes only. It does not replace professional medical advice, diagnosis, or
          treatment. Always consult a licensed healthcare provider for serious medical conditions.
        </p>
      </div>
    </AuthLayout>
  )
}
