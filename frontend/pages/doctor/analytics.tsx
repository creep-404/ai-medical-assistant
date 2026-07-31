'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, Activity, Heart, Star, Users,
  Download, AlertTriangle, CalendarDays, Stethoscope
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import DoctorSidebar from '@/components/doctor/DoctorSidebar'
import DoctorHeader from '@/components/doctor/DoctorHeader'

const consultationData = [
  { month: 'Jan', consultations: 38, followUps: 20 },
  { month: 'Feb', consultations: 42, followUps: 24 },
  { month: 'Mar', consultations: 40, followUps: 22 },
  { month: 'Apr', consultations: 55, followUps: 30 },
  { month: 'May', consultations: 48, followUps: 28 },
  { month: 'Jun', consultations: 58, followUps: 35 },
  { month: 'Jul', consultations: 62, followUps: 38 },
]

const diseaseData = [
  { name: 'Hypertension', value: 35, color: '#3b82f6' },
  { name: 'Diabetes', value: 25, color: '#22c55e' },
  { name: 'Arrhythmia', value: 18, color: '#f59e0b' },
  { name: 'Heart Disease', value: 12, color: '#ef4444' },
  { name: 'Other', value: 10, color: '#8b5cf6' },
]

const appointmentTrends = [
  { month: 'Jan', total: 45, completed: 40, cancelled: 5 },
  { month: 'Feb', total: 52, completed: 48, cancelled: 4 },
  { month: 'Mar', total: 48, completed: 44, cancelled: 4 },
  { month: 'Apr', total: 61, completed: 56, cancelled: 5 },
  { month: 'May', total: 55, completed: 50, cancelled: 5 },
  { month: 'Jun', total: 68, completed: 62, cancelled: 6 },
  { month: 'Jul', total: 72, completed: 65, cancelled: 7 },
]

const recoveryData = [
  { name: 'Full Recovery', value: 65, color: '#22c55e' },
  { name: 'Improving', value: 22, color: '#3b82f6' },
  { name: 'Stable', value: 10, color: '#f59e0b' },
  { name: 'Critical', value: 3, color: '#ef4444' },
]

const satisfactionData = [
  { month: 'Jan', rating: 4.5 },
  { month: 'Feb', rating: 4.6 },
  { month: 'Mar', rating: 4.4 },
  { month: 'Apr', rating: 4.7 },
  { month: 'May', rating: 4.8 },
  { month: 'Jun', rating: 4.6 },
  { month: 'Jul', rating: 4.9 },
]

const metricsCards = [
  { label: 'Avg Satisfaction', value: '4.8/5', change: '+0.2', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { label: 'Recovery Rate', value: '87%', change: '+3%', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'Total Patients', value: '1,247', change: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'This Month', value: '62', change: '+8', icon: CalendarDays, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
]

export default function DoctorAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DoctorSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <DoctorHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Download className="w-4 h-4" /> Download Report
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          >
            {metricsCards.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${m.bg}`}>
                    <m.icon className={`w-5 h-5 ${m.color}`} />
                  </div>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">{m.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{m.value}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{m.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" /> Consultation Statistics
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={consultationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consultations" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Consultations" />
                  <Bar dataKey="followUps" fill="#22c55e" radius={[4, 4, 0, 0]} name="Follow-ups" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-600" /> Common Diseases
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={diseaseData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {diseaseData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {diseaseData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{d.name}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" /> Monthly Appointment Trends
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={appointmentTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total" dot={{ fill: '#3b82f6' }} />
                  <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} name="Completed" dot={{ fill: '#22c55e' }} />
                  <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} name="Cancelled" dot={{ fill: '#ef4444' }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> Recovery Statistics
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={recoveryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {recoveryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {recoveryData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{d.name}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" /> Patient Satisfaction
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={satisfactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis domain={[3.5, 5]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Line type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={3} name="Rating" dot={{ fill: '#f59e0b', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <footer className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
              <p><strong className="text-gray-700 dark:text-gray-300">Medical Disclaimer:</strong> This application is intended for educational purposes only. It does not replace professional medical advice, diagnosis, or treatment. Always consult a licensed healthcare provider for serious medical conditions.</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
