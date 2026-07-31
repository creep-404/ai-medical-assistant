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
import PatientSidebar from '@/components/patient/PatientSidebar';
import PatientHeader from '@/components/patient/PatientHeader';
import { useAuth } from '@/hooks/useAuth';


export default function ProfilePage() {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);
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
    Underweight: 'text-blue-600 bg-blue-50',
    Normal: 'text-green-600 bg-green-50',
    Overweight: 'text-yellow-600 bg-yellow-50',
    Obese: 'text-red-600 bg-red-50',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientSidebar />
      <PatientHeader onToggleDark={() => setIsDark(!isDark)} isDark={isDark} />

      <main className="lg:pl-72">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Profile</h1>
              <p className="text-gray-500 mt-1">Manage your personal and health information</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => (editing ? handleSave() : setEditing(true))}
              disabled={saving}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : editing ? (
                <Save className="w-4 h-4" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
              {editing ? 'Save Changes' : 'Edit Profile'}
            </motion.button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h3>
              </div>
              <div className="p-5">
                {/* Profile Picture */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      {form.fullName?.charAt(0) || 'U'}
                    </div>
                    {editing && (
                      <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                        <input type="file" accept="image/*" className="hidden" />
                      </label>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{form.fullName || 'User'}</p>
                    <p className="text-sm text-gray-500">Patient</p>
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
            </motion.div>

            {/* BMI Calculator Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  BMI Calculator
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    type="number"
                    value={form.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                    disabled={!editing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                    disabled={!editing}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={calculateBMI}
                  disabled={!form.height || !form.weight}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Calculate BMI
                </motion.button>
                {bmi && (
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-3xl font-bold text-gray-900">{bmi.value}</p>
                    <p className={`text-sm font-semibold mt-1 px-3 py-1 rounded-full inline-block ${bmiCategoryColor[bmi.category]}`}>
                      {bmi.category}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Ideal: 18.5 - 24.9
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Health Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-blue-600" />
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
            </motion.div>

            {/* Water Intake Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-600" />
                  Water Intake
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                    disabled={!editing}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={calculateWater}
                  disabled={!form.weight}
                  className="w-full py-2.5 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
                >
                  Calculate
                </motion.button>
                {waterIntake && (
                  <div className="text-center p-4 bg-cyan-50 rounded-xl">
                    <p className="text-sm text-gray-600">Recommended Daily</p>
                    <p className="text-3xl font-bold text-cyan-700">{waterIntake}L</p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <button
                        onClick={() => setWaterLogged(Math.max(0, waterLogged - 0.25))}
                        className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center hover:bg-cyan-200 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium text-gray-700">{waterLogged.toFixed(1)}L logged</span>
                      <button
                        onClick={() => setWaterLogged(waterLogged + 0.25)}
                        className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center hover:bg-cyan-200 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Emergency Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
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
          </motion.div>

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
      <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </label>
      {editing ? (
        type === 'select' ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )
      ) : (
        <p className="text-sm font-medium text-gray-900 py-2">{value || '--'}</p>
      )}
    </div>
  );
}
