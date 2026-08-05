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
  Scale,
} from 'lucide-react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/Feedback';
import { cn } from '@/lib/cn';

const bmiRanges = [
  { min: 0, max: 18.5, category: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', tip: 'Focus on nutrient-dense foods and strength training to gain healthy weight.' },
  { min: 18.5, max: 24.9, category: 'Normal', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800', tip: 'Maintain a balanced diet and regular exercise to stay healthy.' },
  { min: 25, max: 29.9, category: 'Overweight', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-800', tip: 'Incorporate more physical activity and monitor portion sizes.' },
  { min: 30, max: 99, category: 'Obese', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800', tip: 'Consult a healthcare provider for a personalized weight management plan.' },
];

export default function BMIPage() {
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

  const gaugeColor =
    currentRange?.category === 'Underweight'
      ? '#2563eb'
      : currentRange?.category === 'Normal'
      ? '#16a34a'
      : currentRange?.category === 'Overweight'
      ? '#ca8a04'
      : '#dc2626';

  return (
    <PatientLayout>
      <div>
        <p className="text-sm font-medium text-primary-600 dark:text-primary-300">Health Metrics</p>
        <h1 className="heading-display text-3xl font-semibold text-ink-900 dark:text-cream-100 mt-1">
          BMI Calculator
        </h1>
        <p className="mt-1.5 text-ink-500 dark:text-cream-300/70">
          Calculate your Body Mass Index and get health insights
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card>
            <div className="p-5 border-b border-cream-200 dark:border-ink-800">
              <h3 className="text-lg font-semibold text-ink-900 dark:text-cream-100 flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                Your Measurements
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <Field>
                <Label>Age</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 dark:text-cream-300/50" />
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="input-base pl-10"
                    placeholder="Enter your age"
                  />
                </div>
              </Field>
              <Field>
                <Label>Gender</Label>
                <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
              <Field>
                <Label>Height (cm)</Label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 dark:text-cream-300/50" />
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="input-base pl-10"
                    placeholder="e.g. 170"
                    step="0.1"
                  />
                </div>
              </Field>
              <Field>
                <Label>Weight (kg)</Label>
                <div className="relative">
                  <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 dark:text-cream-300/50" />
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="input-base pl-10"
                    placeholder="e.g. 70"
                    step="0.1"
                  />
                </div>
              </Field>
              <Button className="w-full" size="lg" onClick={calculateBMI} disabled={!height || !weight}>
                <Scale className="h-5 w-5" />
                Calculate BMI
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Results */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <div className="p-5 border-b border-cream-200 dark:border-ink-800">
              <h3 className="text-lg font-semibold text-ink-900 dark:text-cream-100 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                Your Results
              </h3>
            </div>
            <div className="p-5">
              {bmi === null ? (
                <EmptyState
                  icon={<Activity className="h-8 w-8" />}
                  title="No results yet"
                  description="Enter your measurements and click Calculate"
                />
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
                          stroke={gaugeColor}
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
                    <span
                      className={cn(
                        'inline-block px-4 py-1.5 rounded-full text-sm font-semibold border',
                        currentRange?.bg,
                        currentRange?.color,
                        currentRange?.border
                      )}
                    >
                      {category}
                    </span>
                  </div>

                  {/* Ideal Weight */}
                  <div className="bg-cream-100 dark:bg-ink-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-primary-600 dark:text-primary-300" />
                      <span className="text-sm font-semibold text-ink-700 dark:text-cream-200">Ideal Weight Range</span>
                    </div>
                    <p className="text-lg font-bold text-ink-900 dark:text-cream-100">{idealWeight}</p>
                  </div>

                  {/* Health Tip */}
                  {currentRange && (
                    <div className={cn(currentRange.bg, 'border', currentRange.border, 'rounded-xl p-4')}>
                      <div className="flex items-start gap-2">
                        <Heart className={cn('h-5 w-5 shrink-0 mt-0.5', currentRange.color)} />
                        <p className={cn('text-sm', currentRange.color)}>{currentRange.tip}</p>
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <Button className="w-full" variant="secondary" onClick={handleSaveToProfile} disabled={saving}>
                    {saved ? (
                      <>
                        <Save className="h-4 w-4" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save to Profile
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* BMI Reference Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <div className="p-5 border-b border-cream-200 dark:border-ink-800">
            <h3 className="text-lg font-semibold text-ink-900 dark:text-cream-100">BMI Categories</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {bmiRanges.map((r) => (
                <div key={r.category} className={cn(r.bg, 'border', r.border, 'rounded-xl p-4 text-center')}>
                  <p className={cn('text-lg font-bold', r.color)}>{r.min} - {r.max}</p>
                  <p className={cn('text-sm font-semibold mt-1', r.color)}>{r.category}</p>
                </div>
              ))}
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
