'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'
import { authService } from '@/services/auth.service'
import toast from 'react-hot-toast'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Field, Input, Label, FieldError } from '@/components/ui/Form'
import { cn } from '@/lib/cn'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token')
    }
  }, [token])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.password) errs.password = 'New password is required'
    else if (form.password.length < 12) errs.password = 'Password must be at least 12 characters'
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast.error('Reset token is missing')
      return
    }
    if (!validate()) return
    setLoading(true)
    try {
      await authService.resetPassword(token, form.password)
      setSuccess(true)
      toast.success('Password reset successful!')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout
        icon={AlertCircle}
        headline="Something went wrong"
        description="We couldn't verify your reset link. Please request a new one and try again."
        stats={[
          { value: 'Secure', label: 'Encrypted Reset Link' },
          { value: 'Fast', label: 'Arrives in Seconds' },
          { value: '24/7', label: 'Support' },
        ]}
      >
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="heading-display text-2xl font-semibold text-ink-900 dark:text-cream-100 mb-2">
            Invalid reset link
          </h1>
          <p className="text-ink-500 dark:text-cream-400/70 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-primary-700 dark:text-primary-300 hover:underline font-semibold"
          >
            Request new reset link
          </Link>
        </div>
      </AuthLayout>
    )
  }

  const errorClass = (hasError: boolean | string | undefined) =>
    hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''

  return (
    <AuthLayout
      icon={Lock}
      headline="Set a strong new password"
      description="Choose a new password to secure your account. Keep it unique and easy for you to remember."
      stats={[
        { value: '6+', label: 'Min Characters' },
        { value: 'Secure', label: 'Encrypted' },
        { value: '24/7', label: 'Support' },
      ]}
    >
      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-primary-600 dark:text-primary-300" />
          </div>
          <h1 className="heading-display text-2xl font-semibold text-ink-900 dark:text-cream-100 mb-2">
            Password reset successful!
          </h1>
          <p className="text-ink-500 dark:text-cream-400/70 mb-6">
            Your password has been updated successfully.
          </p>
          <Button size="lg" className="w-full" onClick={() => router.push('/login')}>
            Sign In with New Password
          </Button>
        </motion.div>
      ) : (
        <>
          <h1 className="heading-display text-3xl font-semibold text-ink-900 dark:text-cream-100">
            Reset your password
          </h1>
          <p className="text-ink-500 dark:text-cream-400/70 mt-2 mb-8">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field>
              <Label>New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 dark:text-cream-400/50" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value })
                    if (errors.password)
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.password
                        return next
                      })
                  }}
                  className={cn('pl-11 pr-12', errorClass(errors.password))}
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-primary-600 dark:text-cream-400/50 dark:hover:text-primary-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <FieldError>{errors.password}</FieldError>
            </Field>

            <Field>
              <Label>Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 dark:text-cream-400/50" />
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm({ ...form, confirmPassword: e.target.value })
                    if (errors.confirmPassword)
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.confirmPassword
                        return next
                      })
                  }}
                  className={cn('pl-11 pr-12', errorClass(errors.confirmPassword))}
                  placeholder="Repeat new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-primary-600 dark:text-cream-400/50 dark:hover:text-primary-300 transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <FieldError>{errors.confirmPassword}</FieldError>
            </Field>

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {loading ? 'Resetting password...' : 'Reset Password'}
            </Button>
          </form>
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
