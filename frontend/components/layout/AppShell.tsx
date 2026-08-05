'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { useMounted } from '@/hooks/useMounted'

export interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
}

export interface NotificationItem {
  id: number
  title: string
  message: string
  time: string
  icon: React.ElementType
  color: string
}

export function AppShell({
  role,
  nav,
  brandSubtitle,
  notifications = [],
  showSearch = true,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  children,
}: {
  role: 'patient' | 'doctor' | 'admin'
  nav: NavItem[]
  brandSubtitle: string
  notifications?: NotificationItem[]
  showSearch?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const mounted = useMounted()
  const hour = new Date().getHours()
  const greeting = mounted ? (hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening') : 'Good Morning'
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pt-6 pb-5">
        <Logo href={`/${role}/dashboard`} subtitle={brandSubtitle} />
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-ink-400 hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1 mt-2">
        {nav.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              <motion.span
                whileHover={{ x: 3 }}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200 shadow-sm'
                    : 'text-ink-500 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800 hover:text-ink-900 dark:hover:text-cream-100'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive ? 'text-primary-600 dark:text-primary-300' : 'text-ink-400 dark:text-cream-300/50')} />
                <span className="flex-1">{link.label}</span>
                {link.badge && (
                  <span className="rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {link.badge}
                  </span>
                )}
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary-600 dark:bg-primary-300" />}
              </motion.span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-cream-200 dark:border-ink-800">
        <div className="flex items-center gap-3 mb-3 px-1">
          <Avatar name={user?.full_name || 'User'} className="h-10 w-10 text-sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink-900 dark:text-cream-100 truncate">
              {user?.full_name || `${roleLabel} User`}
            </p>
            <p className="text-xs text-ink-400 dark:text-cream-300/60 truncate">{user?.email || roleLabel}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-ink-950">
      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-ink-900 border-r border-cream-200 dark:border-ink-800 shadow-lift"
            >
              {sidebar}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-ink-900 border-r border-cream-200 dark:border-ink-800 shadow-soft">
        {sidebar}
      </aside>

      {/* Main column */}
      <div className="lg:pl-72 flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 bg-cream-100/85 dark:bg-ink-950/85 backdrop-blur-xl border-b border-cream-200 dark:border-ink-800">
          <div className="flex items-center justify-between gap-4 px-4 lg:px-8 h-16">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 -ml-1 rounded-xl text-ink-500 dark:text-cream-300 hover:bg-cream-200 dark:hover:bg-ink-800 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h2 className="text-base lg:text-lg font-semibold text-ink-900 dark:text-cream-100 truncate">
                  {greeting}, <span className="text-primary-600 dark:text-primary-400">{user?.full_name?.split(' ')[0] || 'there'}</span>
                </h2>
                <p className="text-xs text-ink-400 dark:text-cream-300/60">Here&apos;s what&apos;s happening today</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {showSearch && (
                <div className="hidden md:block relative w-56 lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 dark:text-cream-300/50" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-ink-900 border border-cream-200 dark:border-ink-800 rounded-xl text-sm text-ink-900 dark:text-cream-100 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
                  />
                </div>
              )}

              {notifications.length > 0 && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2.5 rounded-xl text-ink-500 dark:text-cream-300 hover:bg-cream-200 dark:hover:bg-ink-800 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-cream-100 dark:ring-ink-950" />
                  </button>
                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-ink-900 rounded-2xl shadow-lift border border-cream-200 dark:border-ink-800 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-cream-200 dark:border-ink-800">
                          <h3 className="text-sm font-semibold text-ink-900 dark:text-cream-100">Notifications</h3>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => setNotifOpen(false)}
                              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors"
                            >
                              <div className={cn('p-2 rounded-lg bg-cream-100 dark:bg-ink-800', n.color)}>
                                <n.icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-ink-900 dark:text-cream-100">{n.title}</p>
                                <p className="text-xs text-ink-500 dark:text-cream-300/70 truncate">{n.message}</p>
                                <p className="text-xs text-ink-400 mt-0.5">{n.time}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <button
                onClick={toggle}
                className="p-2.5 rounded-xl text-ink-500 dark:text-cream-300 hover:bg-cream-200 dark:hover:bg-ink-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-cream-200 dark:hover:bg-ink-800 transition-colors"
                >
                  <Avatar name={user?.full_name || 'User'} className="h-9 w-9 text-sm" />
                  <ChevronDown className="hidden sm:block h-4 w-4 text-ink-400" />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-ink-900 rounded-2xl shadow-lift border border-cream-200 dark:border-ink-800 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-cream-200 dark:border-ink-800">
                        <p className="text-sm font-semibold text-ink-900 dark:text-cream-100 truncate">
                          {user?.full_name || `${roleLabel} User`}
                        </p>
                        <p className="text-xs text-ink-400 truncate">{user?.email || roleLabel}</p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href={`/${role}/profile`}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg text-ink-700 dark:text-cream-200 hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors"
                        >
                          <UserIcon className="h-4 w-4 text-ink-400" />
                          Profile
                        </Link>
                        <button
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg text-ink-700 dark:text-cream-200 hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors"
                        >
                          <Settings className="h-4 w-4 text-ink-400" />
                          Settings
                        </button>
                        <div className="border-t border-cream-200 dark:border-ink-800 mt-1 pt-1">
                          <button
                            onClick={() => logout()}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {showSearch && (
            <div className="md:hidden px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 dark:text-cream-300/50" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-ink-900 border border-cream-200 dark:border-ink-800 rounded-xl text-sm text-ink-900 dark:text-cream-100 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
                />
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8">
          <div className="max-w-[1400px] mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
