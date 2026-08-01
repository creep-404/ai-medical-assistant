'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
  CalendarDays,
  History,
  User,
  Pill,
  Calculator,
  FileText,
  Menu,
  X,
  Stethoscope,
  LogOut,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patient/symptom-checker', label: 'Symptom Checker', icon: Search },
  { href: '/patient/nearby-doctors', label: 'Nearby Doctors', icon: MapPin },
  { href: '/patient/appointments', label: 'My Appointments', icon: CalendarDays },
  { href: '/patient/history', label: 'Diagnosis History', icon: History },
  { href: '/patient/profile', label: 'Health Profile', icon: User },
  { href: '/patient/reminders', label: 'Medicine Reminder', icon: Pill },
  { href: '/patient/bmi', label: 'BMI Calculator', icon: Calculator },
  { href: '/patient/reports', label: 'Reports', icon: FileText },
];

export default function PatientSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-gray-200 lg:hidden hover:bg-gray-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-xl lg:hidden flex flex-col"
          >
            <SidebarContent
              pathname={pathname}
              user={user}
              onClose={() => setMobileOpen(false)}
              onLogout={logout}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 shadow-sm">
        <SidebarContent
          pathname={pathname}
          user={user}
          onLogout={logout}
        />
      </aside>
    </>
  );
}

function SidebarContent({
  pathname,
  user,
  onClose,
  onLogout,
}: {
  pathname: string;
  user: any;
  onClose?: () => void;
  onLogout?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <Link href="/patient/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">MediAssist</h1>
            <p className="text-[11px] text-gray-500 leading-tight">Patient Portal</p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} onClick={onClose}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span>{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3.5 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
