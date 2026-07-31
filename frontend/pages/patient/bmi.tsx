'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Ruler,
  Weight,
  Heart,
  User,
  AlertTriangle,
  Save,
  Target,
} from 'lucide-react';
import PatientSidebar from '@/components/patient/PatientSidebar';
import PatientHeader from '@/components/patient/PatientHeader';

const bmiRanges = [
  { min: 0, max: 18.5, category: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', tip: 'Focus on nutrient-dense foods and strength training to gain healthy weight.' },
  { min: 18.5, max: 24.9, category: 'Normal', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', tip: 'Maintain a balanced diet and regular exercise to stay healthy.' },
  { min: 25, max: 29.9, category: 'Overweight', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', tip: 'Incorporate more physical activity and monitor portion sizes.' },
  { min: 30, max: 99, category: 'Obese', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', tip: 'Consult a healthcare provider for a personalized weight management plan.' },
];

export default function BMIPage() {
  const [isDark, setIsDark] = useState(false);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [idealWeight, setIdealWeight] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function calculateBMI() {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return;

    const bmiValue = w / (h * h);
    setBmi(parseFloat(bmiValue.toFixed(1)));

    const cat = bmiRanges.find((r) => bmiValue >= r.min && bmiValue < r.max);
    setCategory(cat?.category || 'Unknown');

    const minIdeal = 18.5 * h * h;
    const maxIdeal = 24.9 * h * h;
    setIdealWeight(`${minIdeal.toFixed(1)} kg - ${maxIdeal.toFixed(1)} kg`);
    setSaved(false);
  }

  function handleSaveToProfile() {
    if (bmi === null) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const currentRange = bmiRanges.find((r) => bmi !== null && bmi >= r.min && bmi < r.max);
  const bmiPercent = bmi !== null ? Math.min((bmi / 40) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientSidebar />
      <PatientHeader onToggleDark={() => setIsDark(!isDark)} isDark={isDark} />

      <main className="lg:pl-72">
        <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">BMI Calculator</h1>
            <p className="text-gray-500 mt-1">Calculate your Body Mass Index and get health insights</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-blue-600" />
                  Your Measurements
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your age"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 170"
                      step="0.1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 70"
                      step="0.1"
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={calculateBMI}
                  disabled={!height || !weight}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Activity className="w-5 h-5" />
                  Calculate BMI
                </motion.button>
              </div>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-blue-600" />
                  Your Results
                </h3>
              </div>
              <div className="p-5">
                {bmi === null ? (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                    <p>Enter your measurements and click Calculate</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Gauge */}
                    <div className="text-center">
                      <div className="relative w-40 h-40 mx-auto mb-3">
                        <svg className="w-full h-full" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                          <motion.circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke={currentRange?.color.replace('text-', '') === 'blue-600' ? '#2563eb' : currentRange?.color.replace('text-', '') === 'green-600' ? '#16a34a' : currentRange?.color.replace('text-', '') === 'yellow-600' ? '#ca8a04' : '#dc2626'}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${(bmiPercent / 100) * 339.292} 339.292`}
                            transform="rotate(-90 60 60)"
                            initial={{ strokeDasharray: '0 339.292' }}
                            animate={{ strokeDasharray: `${(bmiPercent / 100) * 339.292} 339.292` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                          <text x="60" y="55" textAnchor="middle" className="text-2xl font-bold" fill="#111827">
                            {bmi}
                          </text>
                          <text x="60" y="72" textAnchor="middle" className="text-xs" fill="#6b7280">
                            BMI
                          </text>
                        </svg>
                      </div>
                      <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold border ${currentRange?.bg} ${currentRange?.color} ${currentRange?.border}`}>
                        {category}
                      </span>
                    </div>

                    {/* Ideal Weight */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">Ideal Weight Range</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{idealWeight}</p>
                    </div>

                    {/* Health Tip */}
                    {currentRange && (
                      <div className={`${currentRange.bg} border ${currentRange.border} rounded-xl p-4`}>
                        <div className="flex items-start gap-2">
                          <Heart className={`w-5 h-5 ${currentRange.color} shrink-0 mt-0.5`} />
                          <p className={`text-sm ${currentRange.color}`}>{currentRange.tip}</p>
                        </div>
                      </div>
                    )}

                    {/* Save Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveToProfile}
                      disabled={saving}
                      className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : saved ? (
                        <>
                          <Save className="w-4 h-4" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save to Profile
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* BMI Reference Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">BMI Categories</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {bmiRanges.map((r) => (
                  <div key={r.category} className={`${r.bg} border ${r.border} rounded-xl p-4 text-center`}>
                    <p className={`text-lg font-bold ${r.color}`}>{r.min} - {r.max}</p>
                    <p className={`text-sm font-semibold mt-1 ${r.color}`}>{r.category}</p>
                  </div>
                ))}
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
