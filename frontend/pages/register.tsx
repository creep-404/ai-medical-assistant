'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertTriangle } from 'lucide-react'
import { authService } from '@/services/auth.service'
import toast from 'react-hot-toast'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Field, Input, Label, FieldError } from '@/components/ui/Form'
import OAuthButtons from '@/components/ui/OAuthButtons'
import { cn } from '@/lib/cn'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.full_name.trim()) errs.full_name = 'Full name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format'
    if (!form.username.trim()) errs.username = 'Username is required'
    else if (form.username.length < 3) errs.username = 'Username must be at least 3 characters'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 12) errs.password = 'Password must be at least 12 characters'
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!form.acceptTerms) errs.acceptTerms = 'You must accept the terms and conditions'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await authService.register({
        full_name: form.full_name,
        email: form.email,
        username: form.username,
        password: form.password,
      })
      toast.success('Registration successful! Please sign in.')
      router.push('/login')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const errorClass = (hasError: boolean | string | undefined) =>
    hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''

  return (
    <AuthLayout
      icon={UserPlus}
      headline="Your health, your journey"
      description="Create your account and start your journey towards better healthcare with AI-powered assistance."
      stats={[
        { value: 'Free', label: 'To Get Started' },
        { value: '24/7', label: 'AI Assistance' },
        { value: '100%', label: 'Private & Secure' },
        { value: 'Expert', label: 'Doctor Network' },
      ]}
    >
      <h1 className="heading-display text-3xl font-semibold text-ink-900 dark:text-cream-100">
        Create your account
      </h1>
      <p className="text-ink-500 dark:text-cream-400/70 mt-2 mb-8">
        Start your MediAssist AI journey in minutes
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field>
          <Label>Full Name</Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 dark:text-cream-400/50" />
            <Input
              type="text"
              value={form.full_name}
              onChange={(e) => updateField('full_name', e.target.value)}
              className={cn('pl-11', errorClass(errors.full_name))}
              placeholder="John Doe"
            />
          </div>
          <FieldError>{errors.full_name}</FieldError>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <Label>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 dark:text-cream-400/50" />
              <Input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={cn('pl-11', errorClass(errors.email))}
                placeholder="john@example.com"
              />
            </div>
            <FieldError>{errors.email}</FieldError>
          </Field>

          <Field>
            <Label>Username</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 dark:text-cream-400/50" />
              <Input
                type="text"
                value={form.username}
                onChange={(e) => updateField('username', e.target.value)}
                className={cn('pl-11', errorClass(errors.username))}
                placeholder="johndoe"
              />
            </div>
            <FieldError>{errors.username}</FieldError>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <Label>Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 dark:text-cream-400/50" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
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
            <Label>Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 dark:text-cream-400/50" />
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                className={cn('pl-11 pr-12', errorClass(errors.confirmPassword))}
                placeholder="Repeat password"
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
        </div>

        <Field>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={(e) => updateField('acceptTerms', e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-cream-300 dark:border-ink-700 text-primary-600 focus:ring-primary-500/40"
            />
            <span className="text-sm text-ink-600 dark:text-cream-300/70">
              I accept the{' '}
              <Link href="/terms" className="text-primary-700 dark:text-primary-300 font-medium hover:underline">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/disclaimer" className="text-primary-700 dark:text-primary-300 font-medium hover:underline">
                Medical Disclaimer
              </Link>
            </span>
          </label>
          <FieldError>{errors.acceptTerms}</FieldError>
        </Field>

        <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-cream-300 dark:border-ink-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-cream-100 dark:bg-ink-950 text-ink-400 dark:text-cream-400/60">
              Or continue with
            </span>
          </div>
        </div>

        <OAuthButtons className="mt-4" />
      </div>

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-cream-400/70">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-700 dark:text-primary-300 font-semibold hover:underline">
          Sign in
        </Link>
      </p>

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
