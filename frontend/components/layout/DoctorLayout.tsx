'use client'

import { AppShell, type NotificationItem } from '@/components/layout/AppShell'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  History,
  StickyNote,
  BarChart3,
  CalendarClock,
  Stethoscope,
  MessageSquare,
} from 'lucide-react'

const nav = [
  { label: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
  { label: 'Appointments', href: '/doctor/appointments', icon: CalendarDays },
  { label: 'My Patients', href: '/doctor/patients', icon: Users },
  { label: 'Patient History', href: '/doctor/patient-history', icon: History },
  { label: 'Medical Notes', href: '/doctor/medical-notes', icon: StickyNote },
  { label: 'Analytics', href: '/doctor/analytics', icon: BarChart3 },
]

const notifications: NotificationItem[] = [
  { id: 1, title: 'New Appointment', message: 'Sarah Johnson booked a checkup at 3:00 PM', time: '5 min ago', icon: CalendarClock, color: 'text-primary-600 dark:text-primary-300' },
  { id: 2, title: 'Lab Results', message: 'Lab results for Michael Chen are ready', time: '1 hour ago', icon: Stethoscope, color: 'text-secondary-600 dark:text-secondary-300' },
  { id: 3, title: 'Message', message: 'New message from Emily Davis', time: '2 hours ago', icon: MessageSquare, color: 'text-accent-600 dark:text-accent-300' },
]

export function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      role="doctor"
      nav={nav}
      brandSubtitle="Doctor Portal"
      notifications={notifications}
      showSearch
      searchPlaceholder="Search patients..."
    >
      {children}
    </AppShell>
  )
}
