'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Stethoscope, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardPath } from '@/lib/navigation'
import toast from 'react-hot-toast'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Field, Input, Label, FieldError } from '@/components/ui/Form'
import OAuthButtons from '@/components/ui/OAuthButtons'

export default function LoginPage() {
  const router = useRouter()
  const { login, user, loading: sessionLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [oauthPending, setOauthPending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // After a successful OAuth callback the backend sets the auth cookies and
  // redirects here with ?oauth=success. The provider hydrates the session
  // from the cookies; once done, send the user to their dashboard. Manual
  // email/password login calls handleSubmit -> router.push below.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('oauth') === 'success') {
      setOauthPending(true)
      toast.success('Sign in successful!')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (oauthPending && !sessionLoading && user) {
      router.replace(getDashboardPath(user.role))
    }
  }, [oauthPending, sessionLoading, user, router])

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

        <OAuthButtons className="mt-4" />
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
