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
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Field, Label, Input, Select } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/Feedback';
import { cn } from '@/lib/cn';
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
      setReminders(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
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
    if (h < 12) return <Sunrise className="h-3.5 w-3.5 text-accent-500" />;
    if (h < 17) return <Sun className="h-3.5 w-3.5 text-yellow-500" />;
    return <Moon className="h-3.5 w-3.5 text-indigo-500" />;
  }

  const todayEntries = reminders
    .filter((r) => r.active)
    .flatMap((r) => (Array.isArray(r.times) ? r.times : []).map((t) => ({ time: t, medicine: r.medicineName, dosage: r.dosage })))
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <PatientLayout>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600 dark:text-primary-300">Adherence</p>
          <h1 className="heading-display text-3xl font-semibold text-ink-900 dark:text-cream-100 mt-1">
            Medicine Reminders
          </h1>
          <p className="mt-1.5 text-ink-500 dark:text-cream-300/70">Never miss a dose</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Reminder
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="p-5 border-b border-cream-200 dark:border-ink-800">
              <h3 className="text-lg font-semibold text-ink-900 dark:text-cream-100 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                Today&apos;s Schedule
              </h3>
            </div>
            <div className="p-5">
              {todayEntries.length === 0 ? (
                <EmptyState
                  icon={<Pill className="h-8 w-8" />}
                  title="Nothing scheduled today"
                  description="No medications scheduled today"
                />
              ) : (
                <div className="space-y-4">
                  {todayEntries.map((entry, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        {getTimeIcon(entry.time)}
                        <div className="w-0.5 h-full min-h-[2rem] bg-cream-200 dark:bg-ink-800 mt-1" />
                      </div>
                      <div className="flex-1 bg-cream-100 dark:bg-ink-800 rounded-xl p-3">
                        <p className="font-semibold text-ink-900 dark:text-cream-100 text-sm">{entry.medicine}</p>
                        <p className="text-xs text-ink-500 dark:text-cream-300/70">{entry.dosage} - {entry.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Reminders List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card>
            <div className="p-5 border-b border-cream-200 dark:border-ink-800">
              <h3 className="text-lg font-semibold text-ink-900 dark:text-cream-100 flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                All Reminders
              </h3>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-xl bg-cream-100 dark:bg-ink-800">
                      <div className="w-10 h-10 rounded-xl bg-cream-200 dark:bg-ink-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-cream-200 dark:bg-ink-700 rounded w-1/3" />
                        <div className="h-3 bg-cream-200 dark:bg-ink-700 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reminders.length === 0 ? (
                <EmptyState
                  icon={<Pill className="h-8 w-8" />}
                  title="No reminders yet"
                  description="Add your first medicine reminder to get started."
                />
              ) : (
                <div className="space-y-1">
                  <AnimatePresence>
                    {reminders.map((r) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        layout
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors"
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                          r.active ? 'bg-primary-50 dark:bg-primary-900/30' : 'bg-cream-100 dark:bg-ink-800'
                        )}>
                          <Pill className={cn('h-5 w-5', r.active ? 'text-primary-600 dark:text-primary-300' : 'text-ink-400 dark:text-cream-300/50')} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn('font-semibold', r.active ? 'text-ink-900 dark:text-cream-100' : 'text-ink-400 dark:text-cream-300/60')}>
                              {r.medicineName}
                            </p>
                            <span className="text-xs text-ink-400 dark:text-cream-300/50">({r.dosage})</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {r.times.map((t, i) => (
                              <span
                                key={i}
                                className={cn(
                                  'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
                                  r.active
                                    ? 'bg-cream-100 dark:bg-ink-800 text-ink-600 dark:text-cream-300'
                                    : 'bg-cream-100 dark:bg-ink-800 text-ink-400 dark:text-cream-300/50'
                                )}
                              >
                                {getTimeIcon(t)}
                                {t}
                              </span>
                            ))}
                          </div>
                          {r.duration && (
                            <p className="text-xs text-ink-400 dark:text-cream-300/50 mt-1">Duration: {r.duration}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggle(r.id, r.active)}
                            className="p-2 text-ink-400 dark:text-cream-300/50 hover:text-primary-600 dark:hover:text-primary-300 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                            title={r.active ? 'Deactivate' : 'Activate'}
                          >
                            {r.active ? (
                              <ToggleRight className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                            ) : (
                              <ToggleLeft className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-2 text-ink-400 dark:text-cream-300/50 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Add Reminder Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add Medicine Reminder"
        description="Set up a schedule so you never miss a dose"
      >
        <div className="space-y-4">
          <Field>
            <Label>Medicine Name</Label>
            <Input
              type="text"
              value={form.medicineName}
              onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
              placeholder="e.g. Paracetamol"
            />
          </Field>
          <Field>
            <Label>Dosage</Label>
            <Input
              type="text"
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              placeholder="e.g. 500mg, 1 tablet"
            />
          </Field>
          <Field>
            <Label>Frequency</Label>
            <Select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            >
              <option>Daily</option>
              <option>Twice a day</option>
              <option>Three times a day</option>
              <option>Weekly</option>
              <option>As needed</option>
            </Select>
          </Field>
          <Field>
            <Label>Times</Label>
            <div className="flex gap-2">
              <Input
                type="time"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => addTime(timeInput)} disabled={!timeInput} variant="secondary">
                Add
              </Button>
            </div>
            {form.times.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.times.map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-200 rounded-full text-sm border border-primary-200 dark:border-primary-800"
                  >
                    {t}
                    <button onClick={() => removeTime(t)} className="hover:bg-primary-100 dark:hover:bg-primary-900/60 rounded-full p-0.5 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>
          <Field>
            <Label>Duration (e.g., 7 days)</Label>
            <Input
              type="text"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="e.g. 7 days, 2 weeks"
            />
          </Field>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            loading={submitting}
            disabled={!form.medicineName || !form.dosage || form.times.length === 0}
            onClick={handleAdd}
          >
            Add Reminder
          </Button>
        </div>
      </Modal>

      {/* Disclaimer */}
      <div className="bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-accent-600 dark:text-accent-300 shrink-0 mt-0.5" />
        <p className="text-sm text-accent-800 dark:text-accent-200 leading-relaxed">
          This application is intended for educational purposes only. It does not replace professional medical
          advice, diagnosis, or treatment. Always consult a licensed healthcare provider for serious medical
          conditions.
        </p>
      </div>
    </PatientLayout>
  );
}
