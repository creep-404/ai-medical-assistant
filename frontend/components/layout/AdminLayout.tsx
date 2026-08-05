'use client'

import { AppShell, type NotificationItem } from '@/components/layout/AppShell'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Activity,
  Pill,
  CalendarDays,
  BarChart3,
  ShieldCheck,
} from 'lucide-react'

const nav = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Manage Users', href: '/admin/users', icon: Users },
  { label: 'Manage Doctors', href: '/admin/doctors', icon: Stethoscope },
  { label: 'Disease Database', href: '/admin/diseases', icon: Activity },
  { label: 'Medicine Database', href: '/admin/medicines', icon: Pill },
  { label: 'Appointments', href: '/admin/appointments', icon: CalendarDays },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
]

const notifications: NotificationItem[] = [
  { id: 1, title: 'New User Registration', message: '5 new patients registered today', time: '10 min ago', icon: Users, color: 'text-primary-600 dark:text-primary-300' },
  { id: 2, title: 'Doctor Verification', message: 'Dr. Sarah Wilson pending verification', time: '1 hour ago', icon: ShieldCheck, color: 'text-secondary-600 dark:text-secondary-300' },
  { id: 3, title: 'System Alert', message: 'Prediction accuracy report ready', time: '3 hours ago', icon: Activity, color: 'text-accent-600 dark:text-accent-300' },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      role="admin"
      nav={nav}
      brandSubtitle="Admin Panel"
      notifications={notifications}
      showSearch
      searchPlaceholder="Search users, doctors..."
    >
      {children}
    </AppShell>
  )
}
