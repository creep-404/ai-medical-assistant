'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, User, CalendarDays, Stethoscope, Pill, FileText,
  AlertTriangle, Activity, Heart, Clock, ChevronRight, ArrowRight
} from 'lucide-react'
import DoctorSidebar from '@/components/doctor/DoctorSidebar'
import DoctorHeader from '@/components/doctor/DoctorHeader'

interface HistoryEntry {
  id: number
  date: string
  type: 'diagnosis' | 'prescription' | 'appointment'
  title: string
  description: string
  doctor?: string
}

const patients = [
  { id: 1, name: 'Sarah Johnson', avatar: 'SJ', color: 'from-pink-400 to-rose-400' },
  { id: 2, name: 'Michael Chen', avatar: 'MC', color: 'from-blue-400 to-cyan-400' },
  { id: 3, name: 'Emily Davis', avatar: 'ED', color: 'from-emerald-400 to-green-400' },
  { id: 4, name: 'James Wilson', avatar: 'JW', color: 'from-amber-400 to-orange-400' },
  { id: 5, name: 'Lisa Anderson', avatar: 'LA', color: 'from-red-400 to-rose-400' },
]

const historyData: Record<number, HistoryEntry[]> = {
  1: [
    { id: 1, date: '2026-07-28', type: 'appointment', title: 'Regular Checkup', description: 'Annual physical examination. Blood pressure: 130/85. Recommended lifestyle modifications.', doctor: 'Dr. Robert' },
    { id: 2, date: '2026-06-15', type: 'diagnosis', title: 'Mild Hypertension', description: 'Diagnosed with Stage 1 hypertension. Prescribed low-sodium diet and regular exercise regimen.', doctor: 'Dr. Robert' },
    { id: 3, date: '2026-06-15', type: 'prescription', title: 'Lisinopril 10mg', description: 'One tablet daily for blood pressure management. 30-day supply with 2 refills.', doctor: 'Dr. Robert' },
    { id: 4, date: '2026-05-20', type: 'appointment', title: 'Follow-up Visit', description: 'Discussed lab results. Cholesterol levels improving. Continue current treatment plan.', doctor: 'Dr. Robert' },
    { id: 5, date: '2026-04-10', type: 'diagnosis', title: 'Seasonal Allergies', description: 'Allergic rhinitis diagnosed. Prescribed antihistamines and nasal spray.', doctor: 'Dr. Robert' },
    { id: 6, date: '2026-04-10', type: 'prescription', title: 'Cetirizine 10mg', description: 'One tablet daily as needed for allergy symptoms. 30-day supply.', doctor: 'Dr. Robert' },
    { id: 7, date: '2026-03-01', type: 'appointment', title: 'Initial Consultation', description: 'First visit. Patient reported occasional headaches and fatigue. Ordered blood work and ECG.', doctor: 'Dr. Robert' },
  ],
  2: [
    { id: 1, date: '2026-07-25', type: 'appointment', title: 'Arrhythmia Check', description: 'ECG showed occasional PVCs. Holter monitor recommended for 48 hours.', doctor: 'Dr. Robert' },
    { id: 2, date: '2026-06-20', type: 'diagnosis', title: 'Atrial Fibrillation', description: 'Diagnosed with paroxysmal atrial fibrillation. Started on anticoagulation therapy.', doctor: 'Dr. Robert' },
    { id: 3, date: '2026-06-20', type: 'prescription', title: 'Apixaban 5mg', description: 'Twice daily for stroke prevention. 60-day supply.', doctor: 'Dr. Robert' },
  ],
}

const typeIcons: Record<string, any> = {
  diagnosis: Stethoscope,
  prescription: Pill,
  appointment: CalendarDays,
}

const typeColors: Record<string, string> = {
  diagnosis: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  prescription: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
  appointment: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
}

export default function PatientHistoryPage() {
  const [selectedPatientId, setSelectedPatientId] = useState(1)
  const [search, setSearch] = useState('')

  const patient = patients.find((p) => p.id === selectedPatientId)
  const history = historyData[selectedPatientId] || []
  const filtered = history.filter((h) =>
    h.title.toLowerCase().includes(search.toLowerCase()) || h.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DoctorSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <DoctorHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Patient History</h1>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex gap-2 overflow-x-auto flex-1">
                {patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPatientId(p.id); setSearch('') }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedPatientId === p.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-xs font-bold`}>
                      {p.avatar}
                    </div>
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search history..."
                  className="pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-4"
            >
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No history records found</p>
                </div>
              ) : (
                filtered.map((entry, i) => {
                  const Icon = typeIcons[entry.type]
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 lg:p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-lg ${typeColors[entry.type]}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{entry.title}</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {entry.date}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{entry.description}</p>
                          {entry.doctor && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">by {entry.doctor}</p>
                          )}
                          <span className={`inline-block mt-2 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded ${typeColors[entry.type]}`}>
                            {entry.type}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Patient Summary
                </h3>
                {patient && (
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${patient.color} rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3`}>
                      {patient.avatar}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{patient.name}</h4>
                    <div className="mt-4 space-y-2 text-left">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Total Records</span>
                        <span className="font-medium text-gray-900 dark:text-white">{history.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Diagnoses</span>
                        <span className="font-medium text-gray-900 dark:text-white">{history.filter(h => h.type === 'diagnosis').length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Prescriptions</span>
                        <span className="font-medium text-gray-900 dark:text-white">{history.filter(h => h.type === 'prescription').length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Appointments</span>
                        <span className="font-medium text-gray-900 dark:text-white">{history.filter(h => h.type === 'appointment').length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl p-5 text-white">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4" /> Health Timeline
                </h3>
                <p className="text-xs text-blue-100 mb-4">View patient's complete health journey</p>
                <button className="w-full py-2 px-4 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                  Generate Timeline
                </button>
              </div>
            </motion.div>
          </div>

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
