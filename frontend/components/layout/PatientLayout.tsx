'use client'

import { AppShell, type NotificationItem } from '@/components/layout/AppShell'
import {
  LayoutDashboard,
  Search,
  MapPin,
  CalendarDays,
  History,
  User,
  Pill,
  Calculator,
  FileText,
  Bell,
  Activity,
  MessageSquare,
  Sparkles,
} from 'lucide-react'

const nav = [
  { label: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
  { label: 'Symptom Checker', href: '/patient/symptom-checker', icon: Search },
  { label: 'Medi AI Assistant', href: '/chat', icon: Sparkles },
  { label: 'Nearby Doctors', href: '/patient/nearby-doctors', icon: MapPin },
  { label: 'My Appointments', href: '/patient/appointments', icon: CalendarDays },
  { label: 'Diagnosis History', href: '/patient/history', icon: History },
  { label: 'Health Profile', href: '/patient/profile', icon: User },
  { label: 'Medicine Reminder', href: '/patient/reminders', icon: Pill },
  { label: 'BMI Calculator', href: '/patient/bmi', icon: Calculator },
  { label: 'Reports', href: '/patient/reports', icon: FileText },
]

const notifications: NotificationItem[] = [
  { id: 1, title: 'Appointment Reminder', message: 'Your checkup with Dr. Sarah is tomorrow at 3:00 PM', time: '2 hours ago', icon: CalendarDays, color: 'text-primary-600 dark:text-primary-300' },
  { id: 2, title: 'New Diagnosis Ready', message: 'Your latest symptom analysis is available', time: '1 day ago', icon: Activity, color: 'text-secondary-600 dark:text-secondary-300' },
]

export function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      role="patient"
      nav={nav}
      brandSubtitle="Patient Portal"
      notifications={notifications}
      showSearch={false}
    >
      {children}
    </AppShell>
  )
}
