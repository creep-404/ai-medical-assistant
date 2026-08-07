'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Stethoscope, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardPath } from '@/lib/navigation'
import toast from 'react-hot-toast'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Field, Input, Label, FieldError } from '@/components/ui/Form'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.username.trim()) errs.username = 'Username or email is required'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await login({ username: form.username, password: form.password })
      toast.success('Login successful!')
      router.push(getDashboardPath(user.role))
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      icon={Stethoscope}
      headline="Care, reimagined around you"
      description="Your intelligent healthcare companion. Predict diseases, get medicine recommendations, and consult trusted doctors — all in one place."
      stats={[
        { value: '10K+', label: 'Active Users' },
        { value: '95%', label: 'Prediction Accuracy' },
        { value: '30+', label: 'Specialist Doctors' },
      ]}
    >
      <h1 className="heading-display text-3xl font-semibold text-ink-900 dark:text-cream-100">
        Welcome back
      </h1>
      <p className="text-ink-500 dark:text-cream-400/70 mt-2 mb-8">
        Sign in to your MediAssist AI account
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field>
          <Label>Username or Email</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 dark:text-cream-400/50" />
            <Input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className={`pl-11 ${errors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
              placeholder="Enter your username or email"
            />
          </div>
          <FieldError>{errors.username}</FieldError>
        </Field>

        <Field>
          <Label>Password</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 dark:text-cream-400/50" />
            <Input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`pl-11 pr-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`}
              placeholder="Enter your password"
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

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-cream-300 dark:border-ink-700 text-primary-600 focus:ring-primary-500/40"
            />
            <span className="text-sm text-ink-600 dark:text-cream-300/70">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary-700 dark:text-primary-300 font-medium hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
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

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-cream-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-cream-200 hover:border-primary-400 hover:shadow-soft transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
          <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-cream-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-cream-200 hover:border-primary-400 hover:shadow-soft transition-all">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-cream-400/70">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary-700 dark:text-primary-300 font-semibold hover:underline">
          Create one here
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
