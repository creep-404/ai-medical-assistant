'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Droplets,
  Activity,
  AlertTriangle,
  Camera,
  Save,
  Edit3,
  Heart,
  Syringe,
  Weight,
  Ruler,
  Shield,
} from 'lucide-react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    height: '',
    weight: '',
    allergies: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
  });

  const [bmi, setBmi] = useState<{ value: number; category: string } | null>(null);
  const [waterIntake, setWaterIntake] = useState<number | null>(null);
  const [waterLogged, setWaterLogged] = useState(0);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.full_name || '',
        email: user.email || '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        height: '',
        weight: '',
        allergies: '',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelation: '',
      });
    }
  }, [user]);

  function calculateBMI() {
    const h = parseFloat(form.height) / 100;
    const w = parseFloat(form.weight);
    if (!h || !w || h <= 0 || w <= 0) return;
    const bmiValue = w / (h * h);
    let category = 'Normal';
    if (bmiValue < 18.5) category = 'Underweight';
    else if (bmiValue >= 25 && bmiValue < 30) category = 'Overweight';
    else if (bmiValue >= 30) category = 'Obese';
    setBmi({ value: parseFloat(bmiValue.toFixed(1)), category });
  }

  function calculateWater() {
    const w = parseFloat(form.weight);
    if (!w || w <= 0) return;
    const liters = w * 0.033;
    setWaterIntake(parseFloat(liters.toFixed(1)));
  }

  function handleSave() {
    setEditing(false);
  }

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const bmiCategoryColor: Record<string, string> = {
    Underweight: 'text-primary-600 bg-primary-50',
    Normal: 'text-secondary-600 bg-secondary-50',
    Overweight: 'text-accent-600 bg-accent-50',
    Obese: 'text-red-600 bg-red-50',
  };

  return (
    <PatientLayout>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600 dark:text-primary-300">Account</p>
          <h1 className="heading-display text-3xl font-semibold text-ink-900 dark:text-cream-100 mt-1">
            Health Profile
          </h1>
          <p className="mt-1.5 text-ink-500 dark:text-cream-300/70">Manage your personal and health information</p>
        </div>
        <Button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          disabled={saving}
          variant={editing ? 'secondary' : 'primary'}
        >
          {saving ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : editing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Edit3 className="h-4 w-4" />
          )}
          {editing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <Card>
            <div className="p-5 border-b border-cream-200 dark:border-ink-800">
              <h3 className="text-lg font-semibold text-ink-900 dark:text-cream-100 flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                Personal Information
              </h3>
            </div>
            <div className="p-5">
              {/* Profile Picture */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative group">
                  <Avatar name={form.fullName || 'User'} className="h-20 w-20 text-2xl" />
                  {editing && (
                    <label className="absolute inset-0 rounded-full bg-ink-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Camera className="h-6 w-6 text-white" />
                      <input type="file" accept="image/*" className="hidden" />
                    </label>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-ink-900 dark:text-cream-100 text-lg">{form.fullName || 'User'}</p>
                  <p className="text-sm text-ink-500 dark:text-cream-300/70">Patient</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name" icon={User} value={form.fullName} editing={editing} onChange={(v) => handleChange('fullName', v)} />
                <Field label="Email" icon={Mail} value={form.email} editing={editing} onChange={(v) => handleChange('email', v)} />
                <Field label="Phone" icon={Phone} value={form.phone} editing={editing} onChange={(v) => handleChange('phone', v)} />
                <Field label="Date of Birth" icon={Calendar} value={form.dateOfBirth} editing={editing} type="date" onChange={(v) => handleChange('dateOfBirth', v)} />
                <Field label="Gender" icon={User} value={form.gender} editing={editing} type="select" options={['', 'Male', 'Female', 'Other']} onChange={(v) => handleChange('gender', v)} />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* BMI Calculator Widget */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <div className="p-5 border-b border-cream-200 dark:border-ink-800">
              <h3 className="text-lg font-semibold text-ink-900 dark:text-cream-100 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                BMI Calculator
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label-base">Height (cm)</label>
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  className="input-base"
                  disabled={!editing}
                />
              </div>
              <div>
                <label className="label-base">Weight (kg)</label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  className="input-base"
                  disabled={!editing}
                />
              </div>
              <Button
                className="w-full"
                onClick={calculateBMI}
                disabled={!form.height || !form.weight}
              >
                Calculate BMI
              </Button>
              {bmi && (
                <div className="text-center p-4 bg-cream-100 dark:bg-ink-800 rounded-xl">
                  <p className="text-3xl font-bold text-ink-900 dark:text-cream-100">{bmi.value}</p>
                  <p className={`text-sm font-semibold mt-1 px-3 py-1 rounded-full inline-block ${bmiCategoryColor[bmi.category]} dark:text-white`}>
                    {bmi.category}
                  </p>
                  <p className="text-xs text-ink-400 dark:text-cream-300/60 mt-2">Ideal: 18.5 - 24.9</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Information */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2">
          <Card>
            <div className="p-5 border-b border-cream-200 dark:border-ink-800">
              <h3 className="text-lg font-semibold text-ink-900 dark:text-cream-100 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                Health Information
              </h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Blood Group" icon={Droplets} value={form.bloodGroup} editing={editing} type="select" options={['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} onChange={(v) => handleChange('bloodGroup', v)} />
                <Field label="Height (cm)" icon={Ruler} value={form.height} editing={editing} onChange={(v) => handleChange('height', v)} />
                <Field label="Weight (kg)" icon={Weight} value={form.weight} editing={editing} onChange={(v) => handleChange('weight', v)} />
                <Field label="Allergies" icon={Syringe} value={form.allergies} editing={editing} onChange={(v) => handleChange('allergies', v)} />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Water Intake Calculator */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <div className="p-5 border-b border-cream-200 dark:border-ink-800">
              <h3 className="text-lg font-semibold text-ink-900 dark:text-cream-100 flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                Water Intake
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label-base">Weight (kg)</label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  className="input-base"
                  disabled={!editing}
                />
              </div>
              <Button variant="secondary" className="w-full" onClick={calculateWater} disabled={!form.weight}>
                Calculate
              </Button>
              {waterIntake && (
                <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/30 rounded-xl">
                  <p className="text-sm text-ink-500 dark:text-cream-300/70">Recommended Daily</p>
                  <p className="text-3xl font-bold text-cyan-700 dark:text-cyan-300">{waterIntake}L</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => setWaterLogged(Math.max(0, waterLogged - 0.25))}
                      className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 flex items-center justify-center hover:bg-cyan-200 dark:hover:bg-cyan-900 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium text-ink-700 dark:text-cream-200">{waterLogged.toFixed(1)}L logged</span>
                    <button
                      onClick={() => setWaterLogged(waterLogged + 0.25)}
                      className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 flex items-center justify-center hover:bg-cyan-200 dark:hover:bg-cyan-900 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Emergency Contact */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <div className="p-5 border-b border-cream-200 dark:border-ink-800">
            <h3 className="text-lg font-semibold text-ink-900 dark:text-cream-100 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-600 dark:text-primary-300" />
              Emergency Contact
            </h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Contact Name" icon={User} value={form.emergencyName} editing={editing} onChange={(v) => handleChange('emergencyName', v)} />
              <Field label="Phone" icon={Phone} value={form.emergencyPhone} editing={editing} onChange={(v) => handleChange('emergencyPhone', v)} />
              <Field label="Relation" icon={Heart} value={form.emergencyRelation} editing={editing} onChange={(v) => handleChange('emergencyRelation', v)} />
            </div>
          </div>
        </Card>
      </motion.div>

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

function Field({
  label,
  icon: Icon,
  value,
  editing,
  type,
  options,
  onChange,
}: {
  label: string;
  icon: any;
  value: string;
  editing: boolean;
  type?: string;
  options?: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-400 dark:text-cream-300/60 flex items-center gap-1 mb-1">
        <Icon className="h-3 w-3" />
        {label}
      </label>
      {editing ? (
        type === 'select' ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input-base"
          >
            {options?.map((o) => (
              <option key={o} value={o}>{o || `Select ${label}`}</option>
            ))}
          </select>
        ) : (
          <input
            type={type || 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input-base"
          />
        )
      ) : (
        <p className="text-sm font-medium text-ink-900 dark:text-cream-100 py-2">{value || '--'}</p>
      )}
    </div>
  );
}
