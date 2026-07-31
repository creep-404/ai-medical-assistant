'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill,
  Plus,
  X,
  Clock,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Loader2,
  Sun,
  Moon,
  Sunrise,
} from 'lucide-react';
import PatientSidebar from '@/components/patient/PatientSidebar';
import PatientHeader from '@/components/patient/PatientHeader';
import { medicalService } from '@/services/medical.service';

interface Reminder {
  id: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  times: string[];
  duration: string;
  active: boolean;
}

export default function RemindersPage() {
  const [isDark, setIsDark] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'Daily',
    times: [] as string[],
    duration: '',
  });
  const [timeInput, setTimeInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  async function loadReminders() {
    setLoading(true);
    try {
      const res = await medicalService.getReminders();
      setReminders(res.data || []);
    } catch {
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!form.medicineName || !form.dosage || form.times.length === 0) return;
    setSubmitting(true);
    try {
      const res = await medicalService.addReminder(form);
      setReminders((prev) => [...prev, res.data]);
      setForm({ medicineName: '', dosage: '', frequency: 'Daily', times: [], duration: '' });
      setShowForm(false);
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(id: number, active: boolean) {
    try {
      await medicalService.updateReminder(id, { active: !active });
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, active: !active } : r)));
    } catch {
      // handle error
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await medicalService.deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // handle error
    }
  }

  function addTime(t: string) {
    if (t && !form.times.includes(t)) {
      setForm((prev) => ({ ...prev, times: [...prev.times, t].sort() }));
      setTimeInput('');
    }
  }

  function removeTime(t: string) {
    setForm((prev) => ({ ...prev, times: prev.times.filter((x) => x !== t) }));
  }

  function getTimeIcon(time: string) {
    const h = parseInt(time.split(':')[0]);
    if (h < 12) return <Sunrise className="w-3.5 h-3.5 text-amber-500" />;
    if (h < 17) return <Sun className="w-3.5 h-3.5 text-yellow-500" />;
    return <Moon className="w-3.5 h-3.5 text-indigo-500" />;
  }

  const todayEntries = reminders
    .filter((r) => r.active)
    .flatMap((r) => r.times.map((t) => ({ time: t, medicine: r.medicineName, dosage: r.dosage })))
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientSidebar />
      <PatientHeader onToggleDark={() => setIsDark(!isDark)} isDark={isDark} />

      <main className="lg:pl-72">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medicine Reminders</h1>
              <p className="text-gray-500 mt-1">Never miss a dose</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Reminder
            </motion.button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Today&apos;s Schedule
                </h3>
              </div>
              <div className="p-5">
                {todayEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Pill className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No medications scheduled today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayEntries.map((entry, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          {getTimeIcon(entry.time)}
                          <div className="w-0.5 h-full min-h-[2rem] bg-gray-200 mt-1" />
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl p-3">
                          <p className="font-semibold text-gray-900 text-sm">{entry.medicine}</p>
                          <p className="text-xs text-gray-500">{entry.dosage} - {entry.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Reminders List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-600" />
                  All Reminders
                </h3>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                        <div className="w-10 h-10 rounded-xl bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3" />
                          <div className="h-3 bg-gray-200 rounded w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reminders.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Pill className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No reminders yet</h3>
                    <p className="text-sm">Add your first medicine reminder to get started.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {reminders.map((r) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        layout
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          r.active ? 'bg-blue-50' : 'bg-gray-100'
                        }`}>
                          <Pill className={`w-5 h-5 ${r.active ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold ${r.active ? 'text-gray-900' : 'text-gray-400'}`}>
                              {r.medicineName}
                            </p>
                            <span className="text-xs text-gray-400">({r.dosage})</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {r.times.map((t, i) => (
                              <span
                                key={i}
                                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                  r.active ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                                }`}
                              >
                                {getTimeIcon(t)}
                                {t}
                              </span>
                            ))}
                          </div>
                          {r.duration && (
                            <p className="text-xs text-gray-400 mt-1">Duration: {r.duration}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggle(r.id, r.active)}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            title={r.active ? 'Deactivate' : 'Activate'}
                          >
                            {r.active ? <ToggleRight className="w-5 h-5 text-blue-600" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </div>

          {/* Add Reminder Modal */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-900">Add Medicine Reminder</h2>
                    <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                      <input
                        type="text"
                        value={form.medicineName}
                        onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Paracetamol"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={form.dosage}
                        onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 500mg, 1 tablet"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                      <select
                        value={form.frequency}
                        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Daily</option>
                        <option>Twice a day</option>
                        <option>Three times a day</option>
                        <option>Weekly</option>
                        <option>As needed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Times</label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={timeInput}
                          onChange={(e) => setTimeInput(e.target.value)}
                          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => addTime(timeInput)}
                          disabled={!timeInput}
                          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      {form.times.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.times.map((t, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
                            >
                              {t}
                              <button onClick={() => removeTime(t)} className="hover:bg-blue-100 rounded-full p-0.5">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (e.g., 7 days)</label>
                      <input
                        type="text"
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 7 days, 2 weeks"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setShowForm(false)}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAdd}
                        disabled={submitting || !form.medicineName || !form.dosage || form.times.length === 0}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Add Reminder
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              This application is intended for educational purposes only. It does not replace professional medical
              advice, diagnosis, or treatment. Always consult a licensed healthcare provider for serious medical
              conditions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
